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
 * Extraire les données du PDF directement (sans appel HTTP)
 */
async function extractDataFromPDF(pdfBuffer: Buffer): Promise<any> {
  try {
    const PDFParser = (await import('pdf2json')).default
    const pdfParser = new PDFParser()

    // Parser le PDF
    const pdfData = await new Promise<any>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (err: any) => reject(err))
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => resolve(pdfData))
      pdfParser.parseBuffer(pdfBuffer)
    })

    // Extraire le texte
    let text = ''
    if (pdfData.Pages) {
      pdfData.Pages.forEach((page: any) => {
        page.Texts.forEach((textItem: any) => {
          textItem.R.forEach((r: any) => {
            text += decodeURIComponent(r.T) + ' '
          })
        })
      })
    }

    // Extraction du nom du site - PATTERN SIMPLE QUI MARCHE
    let nomSite = ''
    
    // Pattern 1: tout entre "Site" et "Equipement"
    let match = text.match(/Site\s+(.*?)\s+Equipement/i)
    if (match && match[1].trim()) {
      nomSite = match[1].trim()
    }
    
    // Pattern 2: si pas trouvé, essayer avec "Description" et "Client"
    if (!nomSite) {
      match = text.match(/Description\s+(.*?)\s+Client/i)
      if (match && match[1].trim()) {
        nomSite = match[1].trim()
      }
    }

    // Extraction des autres infos
    const numeroIntervention = text.match(/Intervention\s+n[°º]\s*(GX\d+)/i)?.[1] || ''
    const dateIntervention = text.match(/Intervention\s+du\s*:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] || ''
    const technicien = text.match(/Technicien\s+(.*?)(?:\s+Description|\s+Client)/i)?.[1]?.trim() || ''

    return {
      success: true,
      data: {
        numeroIntervention,
        dateIntervention,
        nomSite,
        technicien,
        typeIntervention: '',
        materiel: ['Non spécifié'],
        eauUtilisee: ['Non spécifié'],
        niveauEncrassement: '',
        typeEncrassement: ['Non spécifié'],
        detailsEncrassement: ''
      }
    }
  } catch (error: any) {
    console.error('❌ Erreur extraction PDF:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Extraire le nom du site du corps de l'email
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
 * Chercher une intervention dans Firestore par nom de site
 */
async function findInterventionBySiteName(nomSite: string): Promise<any> {
  try {
    const normalizedSearch = normalizeSiteName(nomSite)
    
    const interventionsRef = collection(db, 'interventions_calendar')
    const q = query(
      interventionsRef,
      where('statut', '==', 'Planifiée')
    )
    
    const snapshot = await getDocs(q)
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const siteName = data.siteName || ''
      
      if (normalizeSiteName(siteName) === normalizedSearch) {
        return {
          id: docSnap.id,
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
    
    // EXTRACTION DIRECTE DU PDF (sans appel HTTP)
    const parseData = await extractDataFromPDF(Buffer.from(pdfAttachment.content))
    
    console.log('\n===== RÉSULTAT EXTRACTION PDF =====')
    console.log('Success:', parseData.success)
    if (parseData.data) {
      console.log('Nom du site:', parseData.data.nomSite || 'NON TROUVÉ')
      console.log('Numéro intervention:', parseData.data.numeroIntervention || 'NON TROUVÉ')
      console.log('Technicien:', parseData.data.technicien || 'NON TROUVÉ')
    }
    console.log('===== FIN RÉSULTAT =====\n')
    
    if (!parseData.success) {
      console.log('❌ Erreur extraction:', parseData.error)
      results.errors.push({
        email: subject,
        reason: 'Erreur extraction PDF'
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
    
    console.log('✅ Nom du site trouvé:', nomSite)
    
    // Chercher l'intervention correspondante
    const intervention = await findInterventionBySiteName(nomSite)
    
    if (!intervention) {
      console.log('⚠️ Intervention non trouvée pour:', nomSite)
      results.errors.push({
        email: subject,
        reason: `Aucune intervention trouvée pour le site: ${nomSite}`
      })
      return
    }
    
    // Vérifier si l'intervention a déjà un rapport
    if ((intervention as any).rapport && (intervention as any).rapport.pdfUrl) {
      console.log('⏭️ Intervention déjà traitée, skip:', nomSite)
      results.errors.push({
        email: subject,
        reason: `Intervention déjà traitée (rapport existant)`
      })
      return
    }
    
    // Upload PDF vers Firebase Storage
    const fileName = pdfAttachment.filename || `rapport_${Date.now()}.pdf`
    const storageRef = ref(storage, `rapports/${intervention.id}/${fileName}`)
    await uploadBytes(storageRef, new Uint8Array(pdfAttachment.content))
    const pdfUrl = await getDownloadURL(storageRef)
    
    // Mettre à jour l'intervention
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
      numeroIntervention: parseData.data.numeroIntervention
    })
    
    console.log('✅ Rapport traité:', nomSite)
    
  } catch (error: any) {
    console.error('Erreur traitement email:', error)
    results.errors.push({
      email: 'Erreur',
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
        
        // Chercher emails Praxedo des 60 derniers jours
        const sixtyDaysAgo = new Date()
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
        
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
            console.log('📭 Aucun email Praxedo trouvé')
            imap.end()
            resolve(NextResponse.json({
              success: true,
              results
            }))
            return
          }
          
          console.log(`📧 ${searchResults.length} emails Praxedo trouvés (60 derniers jours)`)
          
          const fetch = imap.fetch(searchResults, { bodies: '', markSeen: false })
          const emails: any[] = []
          
          fetch.on('message', (msg) => {
            let body = ''
            
            msg.on('body', (stream) => {
              stream.on('data', (chunk) => {
                body += chunk.toString('utf8')
              })
            })
            
            msg.once('end', () => {
              emails.push({ body })
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
            
            for (const mail of emails) {
              await processEmail(mail, results)
              results.processed++
            }
            
            imap.end()
            
            resolve(NextResponse.json({
              success: true,
              results
            }))
          })
        })
      })
    })
    
    imap.once('error', (err) => {
      console.error('❌ Erreur IMAP:', err)
      resolve(NextResponse.json({
        success: false,
        error: err.message
      }, { status: 500 }))
    })
    
    imap.connect()
  })
}
