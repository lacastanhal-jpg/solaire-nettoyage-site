import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calculerTVAPeriode } from '@/lib/firebase/tva-calculs'

/**
 * API Route pour générer le PDF CA3
 * Format officiel DGFiP - Cerfa 3310-CA3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { periode, societeId } = body

    if (!periode) {
      return NextResponse.json(
        { error: 'Période manquante' },
        { status: 400 }
      )
    }

    // Calculer début et fin du mois
    const [year, month] = periode.split('-')
    const dateDebut = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const dateFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

    // Charger les données TVA
    const calculTVA = await calculerTVAPeriode(dateDebut, dateFin, societeId)

    // Générer le PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let currentY = 20

    // ============================================
    // EN-TÊTE OFFICIEL
    // ============================================
    
    // Logo et titre
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(31, 41, 55) // gray-800
    pdf.text('DÉCLARATION CA3', pageWidth / 2, currentY, { align: 'center' })
    
    currentY += 8
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(75, 85, 99) // gray-600
    pdf.text('Régime Réel Normal - Déclaration Mensuelle de TVA', pageWidth / 2, currentY, { align: 'center' })
    
    currentY += 4
    pdf.setFontSize(9)
    pdf.text('Cerfa n° 3310-CA3-SD', pageWidth / 2, currentY, { align: 'center' })

    currentY += 10

    // Ligne séparatrice
    pdf.setDrawColor(209, 213, 219) // gray-300
    pdf.setLineWidth(0.5)
    pdf.line(20, currentY, pageWidth - 20, currentY)

    currentY += 8

    // ============================================
    // INFORMATIONS ENTREPRISE
    // ============================================
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(31, 41, 55)
    pdf.text('IDENTIFICATION DE L\'ENTREPRISE', 20, currentY)

    currentY += 7

    const entrepriseData = [
      ['Raison sociale', 'SOLAIRE NETTOYAGE'],
      ['SIREN', '123 456 789'],
      ['Adresse', 'Toulouse, France'],
      ['Régime TVA', 'Réel Normal - Déclaration Mensuelle'],
      ['Période', new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })],
      ['Date de déclaration', new Date().toLocaleDateString('fr-FR')]
    ]

    autoTable(pdf, {
      startY: currentY,
      head: [],
      body: entrepriseData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        textColor: [31, 41, 55]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [75, 85, 99] },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 20, right: 20 }
    })

    currentY = (pdf as any).lastAutoTable.finalY + 10

    // ============================================
    // SECTION A : OPÉRATIONS IMPOSABLES
    // ============================================

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(79, 70, 229) // indigo-600
    pdf.text('A - OPÉRATIONS IMPOSABLES', 20, currentY)

    currentY += 7

    const operationsData = [
      ['01', 'Ventes, prestations de services (base 20%)', 
       calculTVA.caHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €', ''],
      ['02', 'TVA brute collectée au taux normal (20%)', 
       '', calculTVA.tvaCollectee20.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['03', 'TVA brute collectée au taux réduit (10%)', 
       '', calculTVA.tvaCollectee10.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['04', 'TVA brute collectée au taux super-réduit (5,5%)', 
       '', calculTVA.tvaCollectee55.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['08', 'TOTAL TVA BRUTE (lignes 02+03+04)', 
       '', calculTVA.totalTVACollectee.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €']
    ]

    autoTable(pdf, {
      startY: currentY,
      head: [['Ligne', 'Désignation', 'Base HT', 'Montant TVA']],
      body: operationsData,
      theme: 'striped',
      headStyles: {
        fillColor: [238, 242, 255], // indigo-50
        textColor: [79, 70, 229], // indigo-600
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [31, 41, 55]
      },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      didParseCell: function(data) {
        // Ligne 08 en gras et fond coloré
        if (data.row.index === 4) {
          data.cell.styles.fillColor = [220, 252, 231] // green-100
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [22, 101, 52] // green-800
        }
      }
    })

    currentY = (pdf as any).lastAutoTable.finalY + 10

    // ============================================
    // SECTION B : TVA DÉDUCTIBLE
    // ============================================

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(220, 38, 38) // red-600
    pdf.text('B - TVA DÉDUCTIBLE', 20, currentY)

    currentY += 7

    const deductibleData = [
      ['19', 'TVA déductible sur biens et services (20%)', 
       calculTVA.achatsHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €',
       calculTVA.tvaDeductible20.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['20', 'TVA déductible sur immobilisations (10%)', 
       '', calculTVA.tvaDeductible10.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['21', 'Autres biens et services (5,5%)', 
       '', calculTVA.tvaDeductible55.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['23', 'TOTAL TVA DÉDUCTIBLE (lignes 19+20+21)', 
       '', calculTVA.totalTVADeductible.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €']
    ]

    autoTable(pdf, {
      startY: currentY,
      head: [['Ligne', 'Désignation', 'Base HT', 'Montant TVA']],
      body: deductibleData,
      theme: 'striped',
      headStyles: {
        fillColor: [254, 242, 242], // red-50
        textColor: [220, 38, 38], // red-600
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [31, 41, 55]
      },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      didParseCell: function(data) {
        // Ligne 23 en gras et fond coloré
        if (data.row.index === 3) {
          data.cell.styles.fillColor = [254, 226, 226] // red-100
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [153, 27, 27] // red-800
        }
      }
    })

    currentY = (pdf as any).lastAutoTable.finalY + 10

    // ============================================
    // SECTION C : TVA NETTE DUE OU CRÉDIT
    // ============================================

    const aPayer = calculTVA.soldeTVA >= 0

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(79, 70, 229) // indigo-600
    pdf.text('C - TVA NETTE DUE', 20, currentY)

    currentY += 7

    const soldeData = [
      ['24', 'TVA brute (ligne 08)', 
       calculTVA.totalTVACollectee.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      ['25', 'TVA déductible (ligne 23)', 
       calculTVA.totalTVADeductible.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'],
      [aPayer ? '28' : '29', 
       aPayer ? 'TVA NETTE À PAYER' : 'CRÉDIT DE TVA', 
       Math.abs(calculTVA.soldeTVA).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €']
    ]

    autoTable(pdf, {
      startY: currentY,
      head: [['Ligne', 'Désignation', 'Montant']],
      body: soldeData,
      theme: 'striped',
      headStyles: {
        fillColor: [238, 242, 255], // indigo-50
        textColor: [79, 70, 229], // indigo-600
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [31, 41, 55]
      },
      columnStyles: {
        0: { cellWidth: 15, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 20, right: 20 },
      didParseCell: function(data) {
        // Ligne finale en gras et fond coloré
        if (data.row.index === 2) {
          data.cell.styles.fillColor = aPayer ? [224, 231, 255] : [220, 252, 231] // indigo-100 ou green-100
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fontSize = 10
          data.cell.styles.textColor = aPayer ? [67, 56, 202] : [22, 101, 52] // indigo-700 ou green-800
        }
      }
    })

    currentY = (pdf as any).lastAutoTable.finalY + 12

    // ============================================
    // ENCADRÉ RÉSUMÉ
    // ============================================

    const boxHeight = 35
    const boxY = currentY

    // Fond coloré
    const fillColor = aPayer ? [224, 231, 255] : [220, 252, 231] // indigo-100 ou green-100
    pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2])
    pdf.rect(20, boxY, pageWidth - 40, boxHeight, 'F')

    // Bordure
    const borderColor = aPayer ? [165, 180, 252] : [134, 239, 172] // indigo-300 ou green-300
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    pdf.setLineWidth(1)
    pdf.rect(20, boxY, pageWidth - 40, boxHeight)

    // Texte résumé
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    const textColor = aPayer ? [67, 56, 202] : [22, 101, 52] // indigo-700 ou green-800
    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    pdf.text(
      aPayer ? 'MONTANT À PAYER' : 'CRÉDIT DE TVA',
      pageWidth / 2,
      boxY + 12,
      { align: 'center' }
    )

    pdf.setFontSize(22)
    pdf.text(
      Math.abs(calculTVA.soldeTVA).toLocaleString('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      }),
      pageWidth / 2,
      boxY + 24,
      { align: 'center' }
    )

    currentY += boxHeight + 12

    // ============================================
    // INFORMATIONS LÉGALES
    // ============================================

    if (currentY > pageHeight - 60) {
      pdf.addPage()
      currentY = 20
    }

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(75, 85, 99) // gray-600
    pdf.text('INFORMATIONS IMPORTANTES', 20, currentY)

    currentY += 6

    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(107, 114, 128) // gray-500

    const infosLegales = [
      '• Date limite de déclaration : 24 du mois suivant la période concernée',
      '• Date limite de paiement : 24 du mois suivant (prélèvement ou virement)',
      '• Télédéclaration obligatoire sur www.impots.gouv.fr',
      '• Pénalités en cas de retard : 10% du montant de la TVA due',
      '• Intérêts de retard : 0,20% par mois de retard'
    ]

    infosLegales.forEach((info, index) => {
      pdf.text(info, 20, currentY + (index * 5))
    })

    currentY += infosLegales.length * 5 + 8

    // ============================================
    // PIED DE PAGE
    // ============================================

    pdf.setDrawColor(209, 213, 219)
    pdf.setLineWidth(0.5)
    pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25)

    pdf.setFontSize(7)
    pdf.setTextColor(156, 163, 175) // gray-400
    pdf.text(
      `Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      pageWidth / 2,
      pageHeight - 18,
      { align: 'center' }
    )

    pdf.text(
      'SOLAIRE NETTOYAGE - ERP Interne - Ce document n\'a pas de valeur fiscale officielle',
      pageWidth / 2,
      pageHeight - 13,
      { align: 'center' }
    )

    pdf.text(
      'Pour la déclaration officielle, utilisez le service de télédéclaration sur impots.gouv.fr',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    )

    // Générer le PDF en buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CA3-${periode}.pdf"`
      }
    })

  } catch (error) {
    console.error('Erreur génération PDF CA3:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
