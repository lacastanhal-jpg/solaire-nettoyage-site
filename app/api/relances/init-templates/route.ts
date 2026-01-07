import { NextResponse } from 'next/server'
import { initialiserTemplatesDefaut } from '@/lib/firebase/relances-templates-defaut'

export async function POST() {
  try {
    await initialiserTemplatesDefaut()
    
    return NextResponse.json({
      success: true,
      message: 'Templates initialisés avec succès'
    })
  } catch (error: any) {
    console.error('Erreur initialisation templates:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
