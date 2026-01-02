/**
 * ROUTE API : ANALYSE TICKET AVEC CLAUDE VISION
 * 
 * POST /api/ocr/analyze-ticket
 * 
 * Body: { imageBase64: string }
 * 
 * Utilise Claude Vision API pour extraction intelligente et complète
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeTicketWithClaude } from '@/lib/ocr/claude-vision'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json(
        { 
          success: false, 
          erreur: 'Image manquante' 
        },
        { status: 400 }
      )
    }

    // Nettoyer base64 (enlever préfixe data:image si présent)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

    console.log('📸 Analyse ticket avec Claude Vision...')
    console.log('   Taille image:', cleanBase64.length, 'caractères')

    // Analyser avec Claude
    const resultat = await analyzeTicketWithClaude(cleanBase64)

    console.log('✅ Analyse terminée')
    console.log('   Type:', resultat.typeTicket)
    console.log('   Confiance:', resultat.confiance + '%')
    console.log('   Montant:', resultat.montantTTC + '€')
    console.log('   Fournisseur:', resultat.fournisseur)

    // Log détails spécifiques
    if (resultat.donneesEssence) {
      console.log('   ⛽ Carburant:', resultat.donneesEssence.typeCarburant)
      console.log('   ⛽ Quantité:', resultat.donneesEssence.quantite, 'L')
      console.log('   ⛽ Prix/L:', resultat.donneesEssence.prixUnitaire, '€')
    }

    // Retourner résultat complet
    return NextResponse.json(resultat)

  } catch (error) {
    console.error('❌ Erreur API analyze-ticket:', error)
    
    return NextResponse.json(
      {
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
        erreur: error instanceof Error ? error.message : 'Erreur analyse ticket'
      },
      { status: 500 }
    )
  }
}
