/**
 * SERVICE CLAUDE VISION
 * Analyse intelligente de tickets avec Claude API
 * 
 * Utilise Claude Sonnet 4 pour extraire toutes les données d'un ticket :
 * - Type automatique (essence, restaurant, péage, etc.)
 * - Extraction détaillée de tous les champs
 * - Validation et cohérence des données
 * - Confiance élevée (95%+)
 */

import Anthropic from '@anthropic-ai/sdk'

// Types de tickets supportés
export type TypeTicket = 'essence' | 'restaurant' | 'peage' | 'hotel' | 'train' | 'avion' | 'parking' | 'autre'

// Données ticket essence
export interface DonneesTicketEssence {
  typeCarburant: 'Gasoil' | 'SP95' | 'SP98' | 'E10' | 'GPL' | 'Autre'
  quantite: number // litres
  prixUnitaire: number // €/L
  numeroPompe?: string
  immatriculation?: string
}

// Données ticket restaurant
export interface DonneesTicketRestaurant {
  nombrePersonnes?: number
  articles?: Array<{
    nom: string
    quantite: number
    prixUnitaire: number
    total: number
  }>
}

// Données ticket péage
export interface DonneesTicketPeage {
  entree?: string
  sortie?: string
  classe?: string
  trajet?: string
  societe?: string // VINCI, SANEF, etc.
}

// Résultat analyse Claude
export interface ResultatAnalyseClaude {
  success: boolean
  confiance: number // 0-100
  typeTicket: TypeTicket
  
  // Données de base (tous tickets)
  date: string
  montantTTC: number
  montantHT?: number
  montantTVA?: number
  fournisseur: string
  categorie: string
  
  // Données spécifiques selon type
  donneesEssence?: DonneesTicketEssence
  donneesRestaurant?: DonneesTicketRestaurant
  donneesPeage?: DonneesTicketPeage
  
  // Métadonnées
  numeroTicket?: string
  dateHeureTicket?: string        // Date + heure sur le ticket (ex: "13/11/2025 10:17:16")
  adresse?: string
  ville?: string
  codePostal?: string
  
  // Validation
  validation: {
    calculCorrect: boolean
    champsManquants: string[]
    avertissements: string[]
  }
  
  // Texte brut extrait
  texteComplet: string
  
  // Erreur éventuelle
  erreur?: string
}

/**
 * Analyser un ticket avec Claude Vision API
 */
export async function analyzeTicketWithClaude(
  imageBase64: string
): Promise<ResultatAnalyseClaude> {
  try {
    // Vérifier clé API
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY manquante dans variables environnement')
    }

    // Initialiser client Anthropic
    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    // Prompt système pour Claude
    const systemPrompt = `Tu es un expert en OCR et analyse de tickets de caisse.

Ton rôle est d'extraire TOUTES les informations d'un ticket de manière structurée et précise.

TYPES DE TICKETS À DÉTECTER :
- essence : Station-service (TOTAL, SHELL, INTERMARCHÉ, etc.)
- restaurant : Restaurant, café, fast-food
- peage : Autoroute (VINCI, SANEF, ASF, etc.)
- hotel : Hôtel, hébergement
- train : SNCF, train
- avion : Billet d'avion
- parking : Parking, stationnement
- autre : Autres types

RÈGLES D'EXTRACTION :
1. Extraire TOUS les champs disponibles
2. Pour ESSENCE : quantité litres, type carburant, prix/L, pompe
3. Pour RESTAURANT : articles détaillés si possible
4. Pour PÉAGE : entrée, sortie, trajet, classe
5. Valider que les calculs sont cohérents
6. Indiquer confiance (0-100) selon clarté du ticket

VALIDATION CALCULS :
- Pour essence : quantite × prixUnitaire ≈ montantTTC (±0.10€)
- Pour tous : montantHT + montantTVA ≈ montantTTC (±0.10€)

RÉPONSE FORMAT JSON STRICT :
{
  "typeTicket": "essence|restaurant|peage|hotel|train|avion|parking|autre",
  "confiance": 95,
  "date": "2025-11-13",
  "montantTTC": 142.33,
  "montantHT": 118.61,
  "montantTVA": 23.72,
  "fournisseur": "INTERMARCHE",
  "categorie": "carburant",
  
  // Si essence :
  "donneesEssence": {
    "typeCarburant": "Gasoil",
    "quantite": 86.84,
    "prixUnitaire": 1.639,
    "numeroPompe": "1"
  },
  
  // Si restaurant :
  "donneesRestaurant": {
    "nombrePersonnes": 2,
    "articles": [
      {"nom": "CAFE", "quantite": 2, "prixUnitaire": 1.40, "total": 2.80}
    ]
  },
  
  // Si péage :
  "donneesPeage": {
    "entree": "Paris",
    "sortie": "Lyon",
    "classe": "1",
    "trajet": "A6",
    "societe": "VINCI"
  },
  
  "numeroTicket": "0741400286843",
  "dateHeureTicket": "13/11/2025 10:17:16",
  "adresse": "9 AV MARIE CURIE",
  "ville": "SEVERAC LE CHATEAU",
  "codePostal": "12150",
  
  "validation": {
    "calculCorrect": true,
    "champsManquants": [],
    "avertissements": []
  },
  
  "texteComplet": "Texte brut extrait..."
}

IMPORTANT :
- Réponds UNIQUEMENT avec du JSON valide
- Pas de texte avant ou après le JSON
- Pas de markdown, pas de \`\`\`json
- Si un champ n'existe pas, ne l'inclus pas (sauf validation)
- Confiance >90 si tout est clair
- Confiance 70-90 si quelques incertitudes
- Confiance <70 si ticket peu lisible`

    // Message utilisateur avec image
    const userMessage = {
      role: 'user' as const,
      content: [
        {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: imageBase64,
          },
        },
        {
          type: 'text' as const,
          text: 'Analyse ce ticket et extrait toutes les informations en JSON.',
        },
      ],
    }

    // Appel Claude API
    console.log('🤖 Appel Claude Vision API...')
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [userMessage],
    })

    // Extraire réponse
    const response = message.content[0]
    if (response.type !== 'text') {
      throw new Error('Réponse Claude invalide')
    }

    let jsonText = response.text.trim()
    
    // Nettoyer markdown si présent
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    console.log('📄 Réponse Claude:', jsonText.substring(0, 500))

    // Parser JSON
    const data = JSON.parse(jsonText)

    // Valider structure
    if (!data.typeTicket || !data.montantTTC || !data.fournisseur) {
      throw new Error('Réponse Claude incomplète')
    }

    // Retourner résultat structuré
    return {
      success: true,
      confiance: data.confiance || 0,
      typeTicket: data.typeTicket,
      date: data.date || new Date().toISOString().split('T')[0],
      montantTTC: data.montantTTC,
      montantHT: data.montantHT,
      montantTVA: data.montantTVA,
      fournisseur: data.fournisseur,
      categorie: data.categorie || determinerCategorie(data.typeTicket),
      donneesEssence: data.donneesEssence,
      donneesRestaurant: data.donneesRestaurant,
      donneesPeage: data.donneesPeage,
      numeroTicket: data.numeroTicket,
      dateHeureTicket: data.dateHeureTicket,
      adresse: data.adresse,
      ville: data.ville,
      codePostal: data.codePostal,
      validation: data.validation || {
        calculCorrect: true,
        champsManquants: [],
        avertissements: [],
      },
      texteComplet: data.texteComplet || '',
    }

  } catch (error) {
    console.error('❌ Erreur analyse Claude:', error)
    
    return {
      success: false,
      confiance: 0,
      typeTicket: 'autre',
      date: new Date().toISOString().split('T')[0],
      montantTTC: 0,
      fournisseur: '',
      categorie: 'autre',
      validation: {
        calculCorrect: false,
        champsManquants: [],
        avertissements: [],
      },
      texteComplet: '',
      erreur: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Déterminer catégorie depuis type ticket
 */
function determinerCategorie(typeTicket: TypeTicket): string {
  const mapping: Record<TypeTicket, string> = {
    essence: 'carburant',
    restaurant: 'repas',
    peage: 'peage',
    hotel: 'hebergement',
    train: 'transport',
    avion: 'transport',
    parking: 'parking',
    autre: 'autre',
  }
  return mapping[typeTicket] || 'autre'
}
