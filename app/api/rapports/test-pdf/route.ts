import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Utiliser pdf2json
    const PDFParser = (await import('pdf2json')).default
    const pdfParser = new PDFParser()

    // Parser le PDF
    const pdfData = await new Promise<any>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (err: any) => reject(err))
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => resolve(pdfData))
      pdfParser.parseBuffer(buffer)
    })

    // Extraire le texte
    let text = ''
    if (pdfData.Pages) {
      pdfData.Pages.forEach((page: any) => {
        page.Texts.forEach((textItem: any) => {
          textItem.R.forEach((r: any) => {
            text += decodeURIComponent(r.T) + ' '
          })
        })
      })
    }

    // RETOURNER LE TEXTE BRUT
    return NextResponse.json({ 
      success: true, 
      rawText: text,
      textLength: text.length,
      first2000chars: text.substring(0, 2000)
    })
  } catch (error: any) {
    console.error('Erreur parsing PDF:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du parsing du PDF' },
      { status: 500 }
    )
  }
}
