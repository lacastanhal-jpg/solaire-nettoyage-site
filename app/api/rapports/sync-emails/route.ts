import { NextRequest, NextResponse } from 'next/server'
import Imap from 'imap'
import { simpleParser } from 'mailparser'
import { db, storage } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Configuration IMAP IONOS
const IMAP_CONFIG = {
  user: process.env.EMAIL_USER || 'rapports@solairenettoyage.fr',
  password: process.env.EMAIL_PASSWORD || '',
  host: 'imap.ionos.fr',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
}

// Expéditeur Praxedo
const PRAXEDO_SENDER = 'solairenettoyage@3341146.brevosend.com'

/**
 * Normaliser un nom de site pour comparaison
 */
function normalizeSiteName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
}

/**
 * Extraire le nom du site du corps de l'email
 * Format: "Bon d'intervention numéro GX0000003627 du site PUECH Dominique"
 */
function extractSiteNameFromEmail(emailBody: string): string | null {
  const patterns = [
    /du\s+site\s+([^\n]+)/i,
    /site\s*:\s*([^\n]+)/i,
    /centrale\s*:\s*([^\n]+)/i
  ]
  
  for (const pattern of patterns) {
    const match = emailBody.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return null
}

/**
 * Rechercher l'intervention par nom de site et date proche
 */
async function findInterventionBySiteName(nomSite: string, dateIntervention?: string): Promise<any | null> {
  try {
    const interventionsRef = collection(db, 'interventions_calendar')
    
    // Normaliser le nom du site recherché
    const normalizedSearchName = normalizeSiteName(nomSite)
    
    // Récupérer toutes les interventions (on va filtrer manuellement)
    const snapshot = await getDocs(interventionsRef)
    
    // Chercher une correspondance
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data()
      const siteName = data.siteName || ''
      
      // Normaliser le nom du site dans la base
      const normalizedDbName = normalizeSiteName(siteName)
      
      // Vérifier si les noms correspondent (exactement ou partiellement)
      if (
        normalizedDbName === normalizedSearchName ||
        normalizedDbName.includes(normalizedSearchName) ||
        normalizedSearchName.includes(normalizedDbName)
      ) {
        // Si on a une date d'intervention, vérifier qu'elle est proche
        if (dateIntervention && data.dateDebut) {
          const diffDays = Math.abs(
            (new Date(dateIntervention).getTime() - new Date(data.dateDebut).getTime()) / (1000 * 60 * 60 * 24)
          )
          
          // Accepter si différence < 30 jours
          if (diffDays > 30) {
            continue
          }
        }
        
        return {
          id: docSnapshot.id,
          ...data
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Erreur recherche intervention:', error)
    return null
  }
}

/**
 * Traiter un email Praxedo
 */
async function processEmail(mail: any, results: any) {
  try {
    const parsed = await simpleParser(mail.body)
    
    // Vérifier expéditeur
    const from = parsed.from?.value[0]?.address || ''
    if (!from.includes(PRAXEDO_SENDER)) {
      console.log('Email non Praxedo, ignoré:', from)
      return
    }
    
    const subject = parsed.subject || ''
    const emailBody = parsed.text || ''
    
    // Chercher la pièce jointe PDF
    const pdfAttachment = parsed.attachments?.find(
      att => att.contentType === 'application/pdf'
    )
    
    if (!pdfAttachment) {
      console.log('Pas de PDF dans:', subject)
      results.errors.push({
        email: subject,
        reason: 'Pas de PDF en pièce jointe'
      })
      return
    }
    
    // Parser le PDF avec la NOUVELLE API extract-site
    const formData = new FormData()
    const blob = new Blob([new Uint8Array(pdfAttachment.content)], { type: 'application/pdf' })
    const fileName = pdfAttachment.filename || `rapport_${Date.now()}.pdf`
    formData.append('file', blob, fileName)
    
    const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rapports/extract-site`, {
      method: 'POST',
      body: formData,
    })
    
    const parseData = await parseResponse.json()
    
    console.log('\n===== RÉSULTAT EXTRACT-SITE =====')
    console.log('Success:', parseData.success)
    if (parseData.data) {
      console.log('Nom du site:', parseData.data.nomSite || 'NON TROUVÉ')
      console.log('Numéro intervention:', parseData.data.numeroIntervention || 'NON TROUVÉ')
      console.log('Technicien:', parseData.data.technicien || 'NON TROUVÉ')
      if (parseData.data._debug) {
        console.log('\n🔍 DEBUG:')
        console.log('Longueur texte:', parseData.data._debug.textLength)
        console.log('Premiers 500 chars:', parseData.data._debug.first500chars)
      }
    }
    console.log('===== FIN RÉSULTAT =====\n')
    
    if (!parseData.success) {
      console.log('❌ Erreur extract-site:', parseData.error)
      results.errors.push({
        email: subject,
        reason: 'Erreur extraction site du PDF'
      })
      return
    }
    
    // Extraire le nom du site
    let nomSite = parseData.data.nomSite || extractSiteNameFromEmail(emailBody)
    
    if (!nomSite) {
      console.log('❌ Nom de site introuvable dans:', subject)
      results.errors.push({
        email: subject,
        reason: 'Nom de site introuvable dans le PDF ou l\'email'
      })
      return
    }
    
    // Chercher l'intervention correspondante
    const intervention = await findInterventionBySiteName(
      nomSite,
      parseData.data.dateIntervention
    )
    
    if (!intervention) {
      console.log('Intervention non trouvée pour le site:', nomSite)
      results.errors.push({
        email: subject,
        reason: `Aucune intervention trouvée pour le site: ${nomSite}`
      })
      return
    }
    
    // Vérifier si l'intervention a déjà un rapport (éviter les doublons)
    if ((intervention as any).rapport && (intervention as any).rapport.pdfUrl) {
      console.log('⏭️ Intervention déjà traitée, skip:', nomSite)
      results.errors.push({
        email: subject,
        reason: `Intervention déjà traitée (rapport existant)`
      })
      return
    }
    
    // Upload PDF vers Firebase Storage (comme le système manuel)
    const storageRef = ref(storage, `rapports/${intervention.id}/${fileName}`)
    await uploadBytes(storageRef, new Uint8Array(pdfAttachment.content))
    const pdfUrl = await getDownloadURL(storageRef)
    
    // Mettre à jour l'intervention (comme le système manuel)
    await updateDoc(doc(db, 'interventions_calendar', intervention.id), {
      rapport: {
        ...parseData.data,
        pdfUrl,
        uploadedAt: new Date().toISOString(),
        emailReceivedAt: parsed.date?.toISOString() || new Date().toISOString()
      },
      statut: 'Terminée',
      updatedAt: new Date().toISOString()
    })
    
    results.success.push({
      site: nomSite,
      intervention: (intervention as any).siteName || nomSite,
      pdfUrl
    })
    
    console.log('✅ Rapport traité:', nomSite)
    
  } catch (error: any) {
    console.error('Erreur traitement email:', error)
    results.errors.push({
      email: 'Erreur parsing',
      reason: error.message
    })
  }
}

/**
 * API POST - Synchroniser les emails
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🔄 Démarrage synchronisation emails...')
  
  const results = {
    success: [] as any[],
    errors: [] as any[],
    processed: 0
  }
  
  return new Promise<NextResponse>((resolve) => {
    const imap = new Imap(IMAP_CONFIG)
    
    imap.once('ready', () => {
      console.log('✅ Connexion IMAP établie')
      
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('❌ Erreur ouverture INBOX:', err)
          resolve(NextResponse.json({
            success: false,
            error: err.message
          }, { status: 500 }))
          return
        }
        
        // Chercher emails Praxedo des 60 derniers jours (lus ou non lus)
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        
        // Format IMAP: DD-Mon-YYYY (ex: "27-Dec-2024")
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const sinceDate = `${sixtyDaysAgo.getDate()}-${months[sixtyDaysAgo.getMonth()]}-${sixtyDaysAgo.getFullYear()}`
        
        imap.search([['FROM', PRAXEDO_SENDER], ['SINCE', sinceDate]], (err, searchResults) => {
          if (err) {
            console.error('❌ Erreur recherche emails:', err)
            imap.end()
            resolve(NextResponse.json({
              success: false,
              error: err.message
            }, { status: 500 }))
            return
          }
          
          if (!searchResults || searchResults.length === 0) {
            console.log('ℹ️ Aucun email Praxedo trouvé')
            imap.end()
            resolve(NextResponse.json({
              success: true,
              message: 'Aucun email trouvé',
              results
            }))
            return
          }
          
          console.log(`📧 ${searchResults.length} emails Praxedo trouvés (60 derniers jours)`)
          
          const fetch = imap.fetch(searchResults, {
            bodies: '',
            markSeen: false // Ne pas marquer comme lu automatiquement
          })
          
          const emails: any[] = []
          
          fetch.on('message', (msg) => {
            const mail: any = {}
            
            msg.on('body', (stream) => {
              let buffer = ''
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8')
              })
              stream.once('end', () => {
                mail.body = buffer
                emails.push(mail)
              })
            })
          })
          
          fetch.once('error', (err) => {
            console.error('❌ Erreur fetch:', err)
            imap.end()
            resolve(NextResponse.json({
              success: false,
              error: err.message
            }, { status: 500 }))
          })
          
          fetch.once('end', async () => {
            console.log(`✅ ${emails.length} emails récupérés`)
            
            // Traiter chaque email
            for (const mail of emails) {
              await processEmail(mail, results)
              results.processed++
            }
            
            imap.end()
            
            resolve(NextResponse.json({
              success: true,
              message: `${results.success.length} rapports traités`,
              results
            }))
          })
        })
      })
    })
    
    imap.once('error', (err) => {
      console.error('❌ Erreur connexion IMAP:', err)
      resolve(NextResponse.json({
        success: false,
        error: err.message
      }, { status: 500 }))
    })
    
    imap.once('end', () => {
      console.log('🔌 Connexion IMAP fermée')
    })
    
    imap.connect()
  })
}

/**
 * API GET - Statut de synchronisation
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({
    service: 'Synchronisation emails Praxedo',
    status: 'ready',
    config: {
      server: IMAP_CONFIG.host,
      email: IMAP_CONFIG.user,
      sender: PRAXEDO_SENDER
    },
    method: 'Recherche par nom de site'
  })
}
