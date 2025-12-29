import { NextRequest, NextResponse } from 'next/server'
import { getDevisById } from '@/lib/firebase/devis'
import { getEntreprise } from '@/lib/firebase/entreprise'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const devisId = params.id

    // Récupérer le devis
    const devis = await getDevisById(devisId)
    if (!devis) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    // Récupérer les paramètres entreprise
    const entreprise = await getEntreprise()
    if (!entreprise) {
      return NextResponse.json({ error: 'Paramètres entreprise non configurés' }, { status: 400 })
    }

    // Créer le PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // ============================================
    // EN-TÊTE ENTREPRISE
    // ============================================
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(entreprise.nomCommercial || entreprise.raisonSociale, pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const infoEntreprise = [
      entreprise.siegeSocial?.rue,
      `${entreprise.siegeSocial?.codePostal || ''} ${entreprise.siegeSocial?.ville || ''}`.trim(),
      `SIRET: ${entreprise.siret || ''} - ${entreprise.formeJuridique || ''}`,
      `TVA: ${entreprise.numeroTVA || ''} - RCS: ${entreprise.rcs || ''}`,
      `Tél: ${entreprise.telephone || ''} - Email: ${entreprise.email || ''}`
    ].filter(line => line && line.length > 5) // Filtre les lignes vides ou trop courtes
    
    infoEntreprise.forEach(line => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' })
      yPos += 4
    })

    yPos += 5
    doc.setLineWidth(0.5)
    doc.line(15, yPos, pageWidth - 15, yPos)
    yPos += 10

    // ============================================
    // TITRE DEVIS
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`DEVIS N° ${devis.numero}`, 15, yPos)
    yPos += 10

    // Date et informations
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const dateDevis = new Date(devis.date).toLocaleDateString('fr-FR')
    doc.text(`Date: ${dateDevis}`, 15, yPos)
    yPos += 5
    doc.text(`Statut: ${devis.statut.toUpperCase()}`, 15, yPos)
    yPos += 10

    // ============================================
    // INFORMATIONS CLIENT
    // ============================================
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENT', 15, yPos)
    yPos += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(devis.clientNom, 15, yPos)
    yPos += 5
    if (devis.groupeNom) {
      doc.text(`Groupe: ${devis.groupeNom}`, 15, yPos)
      yPos += 5
    }
    yPos += 5

    // ============================================
    // TABLEAU DES LIGNES
    // ============================================
    const tableData = devis.lignes.map(ligne => [
      ligne.siteNom || '-',
      `${ligne.articleCode}\n${ligne.articleNom}`,
      ligne.quantite.toFixed(2),
      `${ligne.prixUnitaire.toFixed(2)} €`,
      `${ligne.totalHT.toFixed(2)} €`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Site', 'Article', 'Quantité', 'Prix Unit. HT', 'Total HT']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 70 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    })

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 10

    // ============================================
    // TOTAUX
    // ============================================
    const totauxX = pageWidth - 70
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    doc.text('Total HT:', totauxX, yPos)
    doc.text(`${devis.totalHT.toFixed(2)} €`, totauxX + 40, yPos, { align: 'right' })
    yPos += 6

    doc.text(`TVA (20%):`, totauxX, yPos)
    doc.text(`${devis.totalTVA.toFixed(2)} €`, totauxX + 40, yPos, { align: 'right' })
    yPos += 6

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Total TTC:', totauxX, yPos)
    doc.text(`${devis.totalTTC.toFixed(2)} €`, totauxX + 40, yPos, { align: 'right' })
    yPos += 10

    // ============================================
    // CONDITIONS DE PAIEMENT
    // ============================================
    if (entreprise.conditionsPaiementDefaut || entreprise.modalitesReglementDefaut) {
      yPos += 5
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Conditions de règlement:', 15, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      if (entreprise.conditionsPaiementDefaut) {
        doc.text(`Paiement: ${entreprise.conditionsPaiementDefaut}`, 15, yPos)
        yPos += 4
      }
      if (entreprise.modalitesReglementDefaut) {
        doc.text(`Modalités: ${entreprise.modalitesReglementDefaut}`, 15, yPos)
        yPos += 4
      }
    }

    // ============================================
    // NOTES
    // ============================================
    if (devis.notes) {
      yPos += 5
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Notes:', 15, yPos)
      yPos += 5

      doc.setFont('helvetica', 'normal')
      const notesLines = doc.splitTextToSize(devis.notes, pageWidth - 30)
      doc.text(notesLines, 15, yPos)
      yPos += notesLines.length * 4
    }

    // ============================================
    // FOOTER - MENTIONS LÉGALES
    // ============================================
    const footerY = pageHeight - 30
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)

    const mentions = [
      `En cas de retard de paiement, indemnité forfaitaire de ${entreprise.indemniteForfaitaire}€ + pénalités de ${entreprise.tauxPenalitesRetard}%`,
      `Assurance RC: ${entreprise.assuranceRC.compagnie} - Police ${entreprise.assuranceRC.numeroPolice}`,
      `${entreprise.raisonSociale} - ${entreprise.formeJuridique} au capital de ${entreprise.capitalSocial}€`
    ]

    mentions.forEach((mention, index) => {
      doc.text(mention, pageWidth / 2, footerY + (index * 3), { align: 'center' })
    })

    // ============================================
    // GÉNÉRATION DU PDF
    // ============================================
    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${devis.numero}.pdf"`
      }
    })

  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
