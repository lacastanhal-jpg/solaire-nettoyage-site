import { NextRequest, NextResponse } from 'next/server'
import { annulerRelance } from '@/lib/firebase/relances'

/**
 * POST /api/relances/annuler/[id]
 * Annule une relance planifiée
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relanceId = params.id
    
    if (!relanceId) {
      return NextResponse.json(
        { success: false, error: 'ID relance manquant' },
        { status: 400 }
      )
    }
    
    // Récupérer la raison depuis le body
    const body = await request.json().catch(() => ({}))
    const raison = body.raison || 'Annulation manuelle'
    const userId = body.userId || 'admin'
    
    console.log(`[API Relances] Annulation relance ${relanceId}...`)
    
    // Annuler la relance (note: ordre des params = relanceId, userId, raison)
    await annulerRelance(relanceId, userId, raison)
    
    console.log(`[API Relances] Relance ${relanceId} annulée`)
    
    return NextResponse.json({
      success: true,
      message: 'Relance annulée avec succès',
      data: {
        relanceId,
        raison,
        dateAnnulation: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[API Relances] Erreur annulation:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
