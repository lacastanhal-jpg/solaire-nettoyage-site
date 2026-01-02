import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'

interface Transaction {
  date: string
  dateValeur: string
  libelle: string
  montant: number
  reference?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    
    // Extraire le texte du PDF avec unpdf
    const result = await extractText(new Uint8Array(bytes))
    
    // unpdf retourne { totalPages, text: string[] }
    let texte = ''
    if (typeof result.text === 'string') {
      texte = result.text
    } else if (Array.isArray(result.text)) {
      // result.text est déjà un tableau de strings (un par page)
      texte = result.text.join('\n')
    } else {
      texte = String(result.text || '')
    }

    // DEBUG: Afficher plus de texte pour analyser le pattern
    console.log('=== TEXTE COMPLET EXTRAIT DU PDF ===')
    console.log(texte.substring(0, 8000))
    console.log('=== FIN EXTRAIT ===')
    console.log(`Longueur totale du texte: ${texte.length} caractères`)
    console.log('\n=== ANALYSE PAR LIGNES (50 premières) ===')
    const lignes = texte.split('\n')
    lignes.slice(0, 80).forEach((ligne, idx) => {
      console.log(`[${idx}] ${ligne}`)
    })
    console.log('=== FIN ANALYSE LIGNES ===\n')

    // Parser les transactions
    const transactions = parserReleveBancaire(texte)
    
    console.log(`Transactions trouvées: ${transactions.length}`)
    if (transactions.length > 0) {
      console.log('Première transaction:', transactions[0])
      console.log('Dernière transaction:', transactions[transactions.length - 1])
    }

    if (transactions.length === 0) {
      return NextResponse.json({ 
        error: 'Aucune transaction trouvée dans le PDF. Vérifiez le format du relevé.' 
      }, { status: 400 })
    }

    return NextResponse.json({ transactions })

  } catch (error) {
    console.error('Erreur parsing PDF:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la lecture du PDF. Format non supporté.' 
    }, { status: 500 })
  }
}

/**
 * Parser un relevé bancaire LCL avec unpdf (structure linéaire)
 */
function parserReleveBancaire(texte: string): Transaction[] {
  const lignes = texte.split('\n')
  const transactions: Transaction[] = []
  
  // Pattern pour détecter un début de transaction
  // CB12, CB28, CB49, VIR, PRLV, etc.
  const regexDebutTransaction = /^(CB\d+|VIR|PRLV|RELEVE)/
  
  let i = 0
  while (i < lignes.length) {
    const ligne = lignes[i].trim()
    
    // Vérifier si c'est un début de transaction
    if (regexDebutTransaction.test(ligne)) {
      let libelle = ligne
      let montant = 0
      let date = ''
      
      // Extraire la date si elle est dans le libellé (format DD/MM/YY)
      const matchDate = ligne.match(/(\d{2})\/(\d{2})\/(\d{2})/)
      if (matchDate) {
        const [_, jour, mois, annee] = matchDate
        const anneeComplete = annee.startsWith('2') ? `20${annee}` : `20${annee}`
        date = `${anneeComplete}-${mois}-${jour}`
      }
      
      // Chercher le montant dans les 3 lignes suivantes
      for (let j = 1; j <= 3 && (i + j) < lignes.length; j++) {
        const ligneSuivante = lignes[i + j].trim()
        
        // Chercher le pattern "EUR MONTANT" ou "MONTANT EUR" ou juste montant avec virgule
        const matchMontantEUR = ligneSuivante.match(/EUR\s+([\d\s,\.]+)/)
        const matchMontantSeul = ligneSuivante.match(/^([\d\s]+,\d{2})$/)
        
        if (matchMontantEUR) {
          const montantStr = matchMontantEUR[1].replace(/\s/g, '').replace(',', '.')
          montant = parseFloat(montantStr)
          
          // Déterminer si c'est un débit ou crédit
          // Par défaut, CB, PRLV = débit, VIR = peut être crédit ou débit
          if (ligne.startsWith('CB') || ligne.startsWith('PRLV')) {
            montant = -Math.abs(montant)
          } else if (ligne.startsWith('VIR SEPA') && !ligne.includes('INST')) {
            // VIR SEPA simple = crédit reçu
            montant = Math.abs(montant)
          } else if (ligne.startsWith('VIR INST')) {
            // VIR INST = crédit reçu
            montant = Math.abs(montant)
          }
          
          break
        } else if (matchMontantSeul) {
          const montantStr = matchMontantSeul[1].replace(/\s/g, '').replace(',', '.')
          montant = parseFloat(montantStr)
          
          if (ligne.startsWith('CB') || ligne.startsWith('PRLV')) {
            montant = -Math.abs(montant)
          }
          
          break
        }
      }
      
      // Si on a trouvé un montant valide
      if (montant !== 0 && !isNaN(montant)) {
        // Si pas de date trouvée, utiliser date par défaut
        if (!date) {
          date = new Date().toISOString().split('T')[0]
        }
        
        // Nettoyer le libellé
        libelle = libelle
          .replace(/\s+EUR\s+[\d\s,\.]+/, '')  // Enlever "EUR montant"
          .replace(/\d{2}\/\d{2}\/\d{2}/, '')  // Enlever date
          .trim()
        
        if (libelle.length > 3) {
          transactions.push({
            date,
            dateValeur: date,
            libelle,
            montant,
            reference: undefined
          })
        }
      }
    }
    
    i++
  }
  
  return transactions
}
