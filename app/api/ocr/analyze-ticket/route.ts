import { NextRequest, NextResponse } from 'next/server'
import { analyserTicketOCR } from '@/lib/ocr/google-vision'

/**
 * API Route POST /api/ocr/analyze-ticket
 * Analyse une image de ticket avec Google Vision OCR
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64 } = body
    
    if (!imageBase64) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Image base64 requise' 
        },
        { status: 400 }
      )
    }
    
    // Nettoyer le base64 (retirer le préfixe data:image/...;base64, si présent)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    // Analyser avec Google Vision
    const result = await analyserTicketOCR(base64Data)
    
    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error('Erreur API OCR:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur serveur lors de l\'analyse OCR',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
