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

    // FORMAT ATTENDU PAR LE FRONTEND
    return NextResponse.json({
      success: true,
      confidence: resultat.confiance,
      data: {
        date: resultat.date,
        montantTTC: resultat.montantTTC,
        fournisseur: resultat.fournisseur,
        categorie: resultat.categorie
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
