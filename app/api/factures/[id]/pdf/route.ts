import { NextRequest, NextResponse } from 'next/server'
import { getFactureById } from '@/lib/firebase/factures'
import { getClientById } from '@/lib/firebase/clients'
import { getEntrepriseInfo } from '@/lib/firebase/entreprise'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const facture = await getFactureById(params.id)
    
    if (!facture) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    const entreprise = await getEntrepriseInfo()
    const client = facture.clientId ? await getClientById(facture.clientId) : null
    
    // Créer le PDF
    const doc = new jsPDF()
    
    // HEADER ENTREPRISE
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(entreprise?.nomCommercial || entreprise?.raisonSociale || 'SAS Solaire Nettoyage', 20, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(entreprise?.siegeSocial?.rue || '', 20, 28)
    doc.text(`${entreprise?.siegeSocial?.codePostal || ''} ${entreprise?.siegeSocial?.ville || ''}`, 20, 33)
    doc.text(`Siret : ${entreprise?.siret || '820 504 421'}`, 20, 38)
    doc.text(`Email : ${entreprise?.email || 'contact@solairenettoyage.fr'}`, 20, 43)
    doc.text(`Tel : ${entreprise?.telephone || ''}`, 20, 48)
    
    // TITRE FACTURE
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE', 150, 30)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(facture.numero, 150, 40)
    doc.text(`Date : ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 150, 47)
    doc.text(`Échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 150, 54)
    
    // CLIENT
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Client :', 20, 70)
    
    doc.setFont('helvetica', 'normal')
    doc.text(facture.clientNom, 20, 77)
    
    if (client?.adresseFacturation) {
      doc.text(client.adresseFacturation.rue || '', 20, 84)
      doc.text(
        `${client.adresseFacturation.codePostal || ''} ${client.adresseFacturation.ville || ''}`,
        20,
        91
      )
    }
    
    // TABLEAU LIGNES
    const lignesData = facture.lignes.map(ligne => [
      `${ligne.articleCode}\n${ligne.articleNom}`,
      ligne.quantite.toString(),
      `${ligne.prixUnitaire.toFixed(2)} €`,
      `${ligne.tva}%`,
      `${ligne.totalHT.toFixed(2)} €`,
      `${ligne.totalTVA.toFixed(2)} €`,
      `${ligne.totalTTC.toFixed(2)} €`
    ])
    
    autoTable(doc, {
      startY: 100,
      head: [['Article', 'Qté', 'PU HT', 'TVA', 'Total HT', 'Total TVA', 'Total TTC']],
      body: lignesData,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 13, halign: 'center' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 13, halign: 'center' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 22, halign: 'right' }
      }
    })
    
    // TOTAUX
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    
    doc.text('Total HT :', 130, finalY)
    doc.text(`${facture.totalHT.toFixed(2)} €`, 180, finalY, { align: 'right' })
    
    doc.text('Total TVA :', 130, finalY + 7)
    doc.text(`${facture.totalTVA.toFixed(2)} €`, 180, finalY + 7, { align: 'right' })
    
    doc.setFontSize(14)
    doc.text('Total TTC :', 130, finalY + 17)
    doc.text(`${facture.totalTTC.toFixed(2)} €`, 180, finalY + 17, { align: 'right' })
    
    // RESTE À PAYER
    if (facture.resteAPayer > 0) {
      doc.setTextColor(220, 38, 38)
      doc.text('Reste à payer :', 130, finalY + 27)
      doc.text(`${facture.resteAPayer.toFixed(2)} €`, 180, finalY + 27, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }
    
    // CONDITIONS
    const conditionsY = finalY + 40
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Conditions de paiement :', 20, conditionsY)
    
    doc.setFont('helvetica', 'normal')
    doc.text(facture.conditionsPaiement || 'Paiement à 30 jours', 20, conditionsY + 5)
    
    if (facture.modalitesReglement) {
      doc.text(`Modalités : ${facture.modalitesReglement}`, 20, conditionsY + 10)
    }
    
    // FOOTER
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `${entreprise?.nomCommercial || entreprise?.raisonSociale || 'SAS Solaire Nettoyage'} - SIRET ${entreprise?.siret || '820 504 421'} - TVA ${entreprise?.numeroTVA || 'FR82820504421'}`,
      105,
      280,
      { align: 'center' }
    )
    
    // Générer le PDF
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`
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
