import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

/**
 * GET /api/relances/preview/[id]
 * Prévisualise le contenu HTML d'une relance
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const relanceId = params.id
    
    if (!relanceId) {
      return NextResponse.json(
        { error: 'ID relance manquant' },
        { status: 400 }
      )
    }
    
    // Récupérer la relance
    const relanceDoc = await getDoc(doc(db, 'relances_historique', relanceId))
    
    if (!relanceDoc.exists()) {
      return NextResponse.json(
        { error: 'Relance non trouvée' },
        { status: 404 }
      )
    }
    
    const relance = relanceDoc.data()
    
    // Retourner le contenu HTML directement
    return new NextResponse(relance.contenu, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('[API Preview] Erreur:', error)
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
