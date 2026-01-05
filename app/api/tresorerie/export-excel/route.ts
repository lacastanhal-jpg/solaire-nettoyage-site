import { NextRequest, NextResponse } from 'next/server'
import { exportTransactionsCSV } from '@/lib/firebase/lignes-bancaires'

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const dateDebut = searchParams.get('dateDebut') || undefined
    const dateFin = searchParams.get('dateFin') || undefined
    const compteBancaireId = searchParams.get('compteBancaireId') || undefined
    
    // Générer le CSV
    const csvContent = await exportTransactionsCSV(dateDebut, dateFin, compteBancaireId)
    
    // Préparer le nom du fichier
    const now = new Date()
    const filename = `tresorerie_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`
    
    // Retourner le CSV avec les bons headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erreur export Excel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
}
