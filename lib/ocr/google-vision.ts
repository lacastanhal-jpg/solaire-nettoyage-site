/**
 * SERVICE OCR GOOGLE VISION
 * Analyse de tickets/factures avec extraction automatique des données
 */

/**
 * Interface résultat OCR
 */
export interface OCRResult {
  success: boolean
  confidence: number // 0-100
  data: {
    montantTTC?: number
    date?: string // Format ISO YYYY-MM-DD
    fournisseur?: string
    categorie?: 'carburant' | 'peage' | 'repas' | 'hebergement' | 'fournitures' | 'entretien' | 'autre'
  }
  texteComplet: string
  erreur?: string
}

/**
 * Analyser image ticket avec Google Vision API
 */
export async function analyserTicketOCR(
  imageBase64: string
): Promise<OCRResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY
    
    if (!apiKey) {
      return {
        success: false,
        confidence: 0,
        data: {},
        texteComplet: '',
        erreur: 'Clé API Google Vision manquante'
      }
    }
    
    // Appel API Google Vision (REST API simple)
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                }
              ]
            }
          ]
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Erreur API Vision: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Extraire le texte complet
    const texteComplet = result.responses?.[0]?.fullTextAnnotation?.text || ''
    
    if (!texteComplet) {
      return {
        success: false,
        confidence: 0,
        data: {},
        texteComplet: '',
        erreur: 'Aucun texte détecté sur le ticket'
      }
    }
    
    // Parser le texte pour extraire les données
    const donnees = extraireDonneesTicket(texteComplet)
    
    // Calculer confiance globale
    const confidence = calculerConfiance(donnees, texteComplet)
    
    return {
      success: true,
      confidence,
      data: donnees,
      texteComplet
    }
  } catch (error: any) {
    console.error('Erreur OCR:', error)
    return {
      success: false,
      confidence: 0,
      data: {},
      texteComplet: '',
      erreur: error.message || 'Erreur inconnue'
    }
  }
}

/**
 * Extraire données structurées du texte OCR
 */
function extraireDonneesTicket(texte: string) {
  const data: any = {}
  
  // Normaliser le texte (majuscules pour les comparaisons)
  const texteUpper = texte.toUpperCase()
  
  // ========================================
  // EXTRACTION MONTANT TTC
  // ========================================
  const montantPatterns = [
    /TOTAL[\s:]*([0-9]+[,.]?[0-9]{1,2})/i,
    /TTC[\s:]*([0-9]+[,.]?[0-9]{1,2})/i,
    /NET[\s]+A[\s]+PAYER[\s:]*([0-9]+[,.]?[0-9]{1,2})/i,
    /MONTANT[\s:]*([0-9]+[,.]?[0-9]{1,2})/i,
    /TOTAL\s+TTC[\s:]*([0-9]+[,.]?[0-9]{1,2})/i,
    /([0-9]+[,.]?[0-9]{2})[\s]*€/,
  ]
  
  for (const pattern of montantPatterns) {
    const match = texte.match(pattern)
    if (match) {
      const montantStr = match[1].replace(',', '.')
      const montant = parseFloat(montantStr)
      
      // Validation : montant raisonnable
      if (montant > 0 && montant < 10000) {
        data.montantTTC = montant
        break
      }
    }
  }
  
  // ========================================
  // EXTRACTION DATE
  // ========================================
  const datePatterns = [
    // Format DD/MM/YYYY ou DD-MM-YYYY ou DD.MM.YYYY
    /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/,
    // Format DD/MM/YY ou DD-MM-YY
    /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{2})/,
    // Format "2 JANVIER 2026"
    /(\d{1,2})[\s]+(JANVIER|FEVRIER|FÉVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOUT|AOÛT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DECEMBRE|DÉCEMBRE)[\s]+(\d{4})/i,
  ]
  
  for (const pattern of datePatterns) {
    const match = texte.match(pattern)
    if (match) {
      let jour: string
      let mois: string
      let annee: string
      
      if (match[2] && match[2].length === 2) {
        // Format numérique DD/MM/YYYY ou DD/MM/YY
        jour = match[1]
        mois = match[2]
        annee = match[3]
        
        // Si année sur 2 chiffres, ajouter 20XX
        if (annee.length === 2) {
          annee = '20' + annee
        }
      } else {
        // Format texte "2 JANVIER 2026"
        const moisNoms: Record<string, string> = {
          'JANVIER': '01', 'FEVRIER': '02', 'FÉVRIER': '02',
          'MARS': '03', 'AVRIL': '04', 'MAI': '05', 'JUIN': '06',
          'JUILLET': '07', 'AOUT': '08', 'AOÛT': '08',
          'SEPTEMBRE': '09', 'OCTOBRE': '10', 'NOVEMBRE': '11',
          'DECEMBRE': '12', 'DÉCEMBRE': '12'
        }
        jour = match[1].padStart(2, '0')
        mois = moisNoms[match[2].toUpperCase()] || '01'
        annee = match[3]
      }
      
      // Validation basique de la date
      const jourNum = parseInt(jour)
      const moisNum = parseInt(mois)
      
      if (jourNum >= 1 && jourNum <= 31 && moisNum >= 1 && moisNum <= 12) {
        data.date = `${annee}-${mois}-${jour}`
        break
      }
    }
  }
  
  // ========================================
  // EXTRACTION FOURNISSEUR
  // ========================================
  // Chercher dans les 5 premières lignes
  const lignes = texte.split('\n').slice(0, 6)
  
  const fournisseursConnus = [
    // Carburant
    'TOTAL', 'TOTALENERGIES', 'SHELL', 'ESSO', 'BP', 'INTERMARCHÉ', 'LECLERC',
    'CARREFOUR', 'AUCHAN', 'LIDL', 'SYSTÈME U', 'SUPER U', 'HYPER U',
    // Péage
    'VINCI', 'SANEF', 'APRR', 'ASF', 'AREA',
    // Hôtel
    'IBIS', 'CAMPANILE', 'FORMULE 1', 'F1', 'KYRIAD', 'PREMIERE CLASSE',
    'NOVOTEL', 'MERCURE', 'ACCOR',
    // Bricolage
    'LEROY MERLIN', 'CASTORAMA', 'BRICO DÉPÔT', 'BRICO DEPOT', 'BRICORAMA',
    'MR BRICOLAGE', 'WELDOM',
    // Restaurant
    'MCDONALD', "MCDO", 'BURGER KING', 'KFC', 'QUICK', 'SUBWAY',
    'PAUL', 'LA CROISSANTERIE',
  ]
  
  for (const ligne of lignes) {
    const ligneUpper = ligne.toUpperCase()
    for (const fournisseur of fournisseursConnus) {
      if (ligneUpper.includes(fournisseur)) {
        // Nettoyer le nom (prendre juste le nom principal)
        if (fournisseur === 'TOTALENERGIES' || fournisseur === 'TOTAL') {
          data.fournisseur = 'TOTAL'
        } else if (fournisseur === 'BRICO DÉPÔT' || fournisseur === 'BRICO DEPOT') {
          data.fournisseur = 'BRICO DÉPÔT'
        } else if (fournisseur === 'MCDONALD' || fournisseur === 'MCDO') {
          data.fournisseur = 'MCDONALD\'S'
        } else {
          data.fournisseur = fournisseur
        }
        break
      }
    }
    if (data.fournisseur) break
  }
  
  // ========================================
  // SUGGESTION CATÉGORIE
  // ========================================
  if (data.fournisseur) {
    const fournisseur = data.fournisseur.toUpperCase()
    
    // Carburant
    if (['TOTAL', 'SHELL', 'ESSO', 'BP'].includes(fournisseur) || 
        texteUpper.includes('CARBURANT') || 
        texteUpper.includes('ESSENCE') || 
        texteUpper.includes('DIESEL') ||
        texteUpper.includes('GAZOLE')) {
      data.categorie = 'carburant'
    }
    // Péage
    else if (['VINCI', 'SANEF', 'APRR', 'ASF', 'AREA'].includes(fournisseur) || 
             texteUpper.includes('PÉAGE') || 
             texteUpper.includes('PEAGE') ||
             texteUpper.includes('AUTOROUTE')) {
      data.categorie = 'peage'
    }
    // Hébergement
    else if (['IBIS', 'CAMPANILE', 'FORMULE 1', 'F1', 'KYRIAD', 'PREMIERE CLASSE', 
              'NOVOTEL', 'MERCURE', 'ACCOR'].includes(fournisseur) || 
             texteUpper.includes('HÔTEL') || 
             texteUpper.includes('HOTEL') ||
             texteUpper.includes('NUITÉE') ||
             texteUpper.includes('NUITEE')) {
      data.categorie = 'hebergement'
    }
    // Fournitures
    else if (['LEROY MERLIN', 'CASTORAMA', 'BRICO DÉPÔT', 'BRICORAMA', 
              'MR BRICOLAGE', 'WELDOM'].includes(fournisseur)) {
      data.categorie = 'fournitures'
    }
    // Repas
    else if (['MCDONALD\'S', 'BURGER KING', 'KFC', 'QUICK', 'SUBWAY',
              'PAUL', 'LA CROISSANTERIE'].includes(fournisseur) ||
             texteUpper.includes('RESTAURANT') || 
             texteUpper.includes('CAFÉ') ||
             texteUpper.includes('CAFE') ||
             texteUpper.includes('REPAS')) {
      data.categorie = 'repas'
    }
    // Autre par défaut
    else {
      data.categorie = 'autre'
    }
  } else {
    // Si pas de fournisseur, deviner par mots-clés
    if (texteUpper.includes('CARBURANT') || texteUpper.includes('ESSENCE') || texteUpper.includes('DIESEL')) {
      data.categorie = 'carburant'
    } else if (texteUpper.includes('PÉAGE') || texteUpper.includes('PEAGE')) {
      data.categorie = 'peage'
    } else if (texteUpper.includes('RESTAURANT') || texteUpper.includes('REPAS')) {
      data.categorie = 'repas'
    } else if (texteUpper.includes('HÔTEL') || texteUpper.includes('HOTEL')) {
      data.categorie = 'hebergement'
    } else {
      data.categorie = 'autre'
    }
  }
  
  return data
}

/**
 * Calculer confiance globale (0-100)
 */
function calculerConfiance(data: any, texteComplet: string): number {
  let score = 0
  let total = 0
  
  // ========================================
  // MONTANT (40 points)
  // ========================================
  total += 40
  if (data.montantTTC) {
    if (data.montantTTC > 0 && data.montantTTC < 10000) {
      score += 40 // Montant valide
    } else {
      score += 15 // Montant détecté mais suspect
    }
  }
  
  // ========================================
  // DATE (30 points)
  // ========================================
  total += 30
  if (data.date) {
    try {
      const date = new Date(data.date)
      const now = new Date()
      const diffJours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      
      if (diffJours < 365) { // Date < 1 an
        score += 30
      } else if (diffJours < 730) { // Date < 2 ans
        score += 15
      } else {
        score += 5
      }
    } catch (error) {
      score += 5 // Date détectée mais format invalide
    }
  }
  
  // ========================================
  // FOURNISSEUR (20 points)
  // ========================================
  total += 20
  if (data.fournisseur) {
    score += 20
  }
  
  // ========================================
  // CATÉGORIE (10 points)
  // ========================================
  total += 10
  if (data.categorie && data.categorie !== 'autre') {
    score += 10
  } else if (data.categorie === 'autre') {
    score += 5
  }
  
  // Calculer pourcentage
  const confidence = Math.round((score / total) * 100)
  
  return confidence
}
