import { NextRequest, NextResponse } from 'next/server'
import { analyzeTicketWithClaude } from '@/lib/ocr/claude-vision'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, erreur: 'Image manquante' },
        { status: 400 }
      )
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    console.log('📸 Analyse ticket avec Claude Vision...')
    
    const resultat = await analyzeTicketWithClaude(cleanBase64)
    
    console.log('✅ Analyse terminée')

    // Générer description automatique selon type
    let description = ''
    if (resultat.donneesEssence) {
      description = `${resultat.donneesEssence.quantite}L ${resultat.donneesEssence.typeCarburant} à ${resultat.donneesEssence.prixUnitaire}€/L`
    } else if (resultat.donneesRestaurant?.nombrePersonnes) {
      description = `Repas ${resultat.donneesRestaurant.nombrePersonnes} personne(s)`
    } else if (resultat.donneesPeage?.trajet) {
      description = `Péage ${resultat.donneesPeage.trajet}${resultat.donneesPeage.entree && resultat.donneesPeage.sortie ? ` (${resultat.donneesPeage.entree} → ${resultat.donneesPeage.sortie})` : ''}`
    } else {
      description = resultat.fournisseur
    }

    // FORMAT COMPLET POUR LE FRONTEND
    return NextResponse.json({
      success: true,
      confidence: resultat.confiance,
      data: {
        date: resultat.date,
        montantTTC: resultat.montantTTC,
        montantHT: resultat.montantHT,
        montantTVA: resultat.montantTVA,
        fournisseur: resultat.fournisseur,
        categorie: resultat.categorie,
        description: description,
        
        // Données spécifiques (noms cohérents avec interface NoteDeFrais)
        donneesCarburant: resultat.donneesEssence,  // Renommé pour cohérence
        donneesRestaurant: resultat.donneesRestaurant,
        donneesPeage: resultat.donneesPeage,
        
        // Métadonnées
        numeroTicket: resultat.numeroTicket,
        dateHeureTicket: resultat.dateHeureTicket,
        adresse: resultat.adresse,
        ville: resultat.ville,
        codePostal: resultat.codePostal,
        
        // Texte brut
        texteComplet: resultat.texteComplet
      }
    })

  } catch (error) {
    console.error('❌ Erreur API analyze-ticket:', error)
    return NextResponse.json(
      { success: false, erreur: error instanceof Error ? error.message : 'Erreur analyse ticket' },
      { status: 500 }
    )
  }
}
