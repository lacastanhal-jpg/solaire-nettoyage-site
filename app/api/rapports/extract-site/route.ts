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

    // EXTRACTION DU NOM DU SITE - VERSION ULTRA-SIMPLE
    let nomSite = ''
    
    // Pattern 1 : tout entre "Site" et "Equipement"
    let match = text.match(/Site\s+(.*?)\s+Equipement/i)
    if (match && match[1].trim()) {
      nomSite = match[1].trim()
    }
    
    // Pattern 2 : si pas trouvé, essayer avec "Description" et "Client"
    if (!nomSite) {
      match = text.match(/Description\s+(.*?)\s+Client/i)
      if (match && match[1].trim()) {
        nomSite = match[1].trim()
      }
    }

    // Extraire les autres infos
    const numeroIntervention = text.match(/Intervention\s+n[°º]\s*(GX\d+)/i)?.[1] || ''
    const technicien = text.match(/Technicien\s+(.*?)(?:\s+Description|\s+Client)/i)?.[1]?.trim() || ''

    return NextResponse.json({ 
      success: true, 
      data: {
        nomSite,
        numeroIntervention,
        technicien,
        _debug: {
          textLength: text.length,
          first500chars: text.substring(0, 500)
        }
      }
    })
  } catch (error: any) {
    console.error('❌ Erreur extraction site:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
