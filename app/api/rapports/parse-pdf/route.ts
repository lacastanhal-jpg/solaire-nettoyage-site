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

    // Utiliser pdf2json au lieu de pdf-parse
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

    // Extraire les informations avec regex
    const data = {
      numeroIntervention: extractField(text, /Intervention\s+n[°º]\s*(GX\d+)/i),
      dateIntervention: extractField(text, /Intervention\s+du\s*:\s*(\d{2}\/\d{2}\/\d{4})/i),
      nomSite: extractNomSite(text),
      technicien: extractField(text, /Technicien\s+(.*?)(?:\s+Description|\s+Client)/i),
      typeIntervention: extractTypeIntervention(text),
      materiel: extractMateriel(text),
      eauUtilisee: extractEauUtilisee(text),
      niveauEncrassement: extractField(text, /Niveau\s+d'encrassement\s+(Fort|Moyen|Faible)/i),
      typeEncrassement: extractTypeEncrassement(text),
      detailsEncrassement: extractField(text, /Détailler\s*:\s*(.*?)(?:\s+Les\s+pyranomètres|\s+Compteurs)/i),
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Erreur parsing PDF:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du parsing du PDF' },
      { status: 500 }
    )
  }
}

function extractField(text: string, regex: RegExp): string {
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function extractTypeIntervention(text: string): string {
  const types = ['Ombrière', 'Toiture', 'Auvent', 'Brise-soleil', 'Hangar']
  
  for (const type of types) {
    // Chercher le pattern "type" suivi éventuellement de caractères puis "checked" ou symbole
    const patterns = [
      new RegExp(`${type}.*?(?:☑|✓|checked|true)`, 'i'),
      new RegExp(`(?:☑|✓|checked|true).*?${type}`, 'i')
    ]
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return type
      }
    }
  }
  
  return ''
}

function extractMateriel(text: string): string[] {
  const materiel: string[] = []
  
  if (/Robot.*?(?:☑|✓|checked)/i.test(text) || /(?:☑|✓|checked).*?Robot/i.test(text)) {
    const nbRobots = extractField(text, /Nombre\s+de\s+Robots\s+Utilisés\s+(\d+)/i)
    materiel.push(nbRobots ? `Robot (${nbRobots})` : 'Robot')
  }
  
  if (/Brosse\s+rotative.*?(?:☑|✓|checked)/i.test(text)) {
    materiel.push('Brosse rotative')
  }
  
  if (/Eau\s+haute\s+pression.*?(?:☑|✓|checked)/i.test(text)) {
    materiel.push('Eau haute pression')
  }
  
  return materiel.length > 0 ? materiel : ['Non spécifié']
}

function extractEauUtilisee(text: string): string[] {
  const eau: string[] = []
  
  if (/Osmosée.*?(?:☑|✓|checked)/i.test(text) || /(?:☑|✓|checked).*?Osmosée/i.test(text)) {
    eau.push('Osmosée')
  }
  
  if (/Déionisée.*?(?:☑|✓|checked)/i.test(text)) {
    eau.push('Déionisée')
  }
  
  if (/Savonneuse.*?(?:☑|✓|checked)/i.test(text)) {
    eau.push('Savonneuse')
  }
  
  if (/Non\s+filtrée.*?(?:☑|✓|checked)/i.test(text)) {
    eau.push('Non filtrée')
  }
  
  return eau.length > 0 ? eau : ['Non spécifié']
}

function extractTypeEncrassement(text: string): string[] {
  const types: string[] = []
  
  if (/Pollen.*?(?:☑|✓|checked)/i.test(text)) {
    types.push('Pollen')
  }
  
  if (/Sable.*?(?:☑|✓|checked)/i.test(text)) {
    types.push('Sable')
  }
  
  if (/Fientes.*?(?:☑|✓|checked)/i.test(text) || /oiseaux.*?(?:☑|✓|checked)/i.test(text)) {
    types.push('Fientes d\'oiseaux')
  }
  
  if (/Autre.*?(?:☑|✓|checked)/i.test(text) && /Détailler/i.test(text)) {
    types.push('Autre')
  }
  
  return types.length > 0 ? types : ['Non spécifié']
}

function extractNomSite(text: string): string {
  // Essayer différents patterns pour trouver le nom du site
  const patterns = [
    /Site\s*:\s*([^\n]+)/i,
    /Centrale\s*:\s*([^\n]+)/i,
    /Localisation\s*:\s*([^\n]+)/i,
    /Client\s*:\s*([^\n]+?)(?:\s+Site\s*:|$)/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1].trim()) {
      return match[1].trim()
    }
  }
  
  return ''
}
