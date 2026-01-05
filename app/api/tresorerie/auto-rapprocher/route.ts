import { NextResponse } from 'next/server'
import { autoRapprocherLignes } from '@/lib/firebase/lignes-bancaires'

export async function POST() {
  try {
    const result = await autoRapprocherLignes()
    
    return NextResponse.json({
      success: true,
      nombreRapprochees: result.nombreRapprochees,
      details: result.details
    })
  } catch (error) {
    console.error('Erreur auto-rapprochement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'auto-rapprochement' },
      { status: 500 }
    )
  }
}
