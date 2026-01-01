import { NextRequest, NextResponse } from 'next/server'
import { getAvoirById } from '@/lib/firebase/avoirs'
import { getEntrepriseInfo } from '@/lib/firebase/entreprise'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const avoir = await getAvoirById(params.id)
    
    if (!avoir) {
      return NextResponse.json({ error: 'Avoir introuvable' }, { status: 404 })
    }

    const entreprise = await getEntrepriseInfo()
    
    // Créer le PDF
    const doc = new jsPDF()
    
    // HEADER ENTREPRISE
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(entreprise?.raisonSociale || 'SAS Solaire Nettoyage', 20, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (entreprise?.siegeSocial) {
      doc.text(entreprise.siegeSocial.rue || '', 20, 28)
      doc.text(`${entreprise.siegeSocial.codePostal || ''} ${entreprise.siegeSocial.ville || ''}`, 20, 33)
    }
    doc.text(`Siret : ${entreprise?.siret || '820 504 421'}`, 20, 38)
    doc.text(`Email : ${entreprise?.email || 'contact@solairenettoyage.fr'}`, 20, 43)
    doc.text(`Tel : ${entreprise?.telephone || ''}`, 20, 48)
    
    // TITRE AVOIR
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38) // Rouge
    doc.text('AVOIR', 150, 30)
    
    doc.setTextColor(0, 0, 0) // Reset noir
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(avoir.numero, 150, 40)
    doc.text(`Date : ${new Date(avoir.date).toLocaleDateString('fr-FR')}`, 150, 47)
    
    // CLIENT
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Client :', 20, 70)
    
    doc.setFont('helvetica', 'normal')
    doc.text(avoir.clientNom, 20, 77)
    
    // MOTIF
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Motif :', 20, 90)
    doc.setFont('helvetica', 'normal')
    const motifLines = doc.splitTextToSize(avoir.motif, 170)
    doc.text(motifLines, 20, 97)
    
    const startY = 97 + (motifLines.length * 5) + 10
    
    // TABLEAU LIGNES
    const lignesData = avoir.lignes.map(ligne => [
      ligne.description,
      ligne.quantite.toString(),
      `${ligne.prixUnitaire.toFixed(2)} €`,
      `${ligne.tva}%`,
      `${ligne.montantHT.toFixed(2)} €`,
      `${ligne.montantTVA.toFixed(2)} €`,
      `${ligne.montantTTC.toFixed(2)} €`
    ])
    
    autoTable(doc, {
      startY: startY,
      head: [['Description', 'Qté', 'PU HT', 'TVA', 'Total HT', 'Total TVA', 'Total TTC']],
      body: lignesData,
      theme: 'grid',
      headStyles: { 
        fillColor: [220, 38, 38], // Rouge
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
    doc.text(`${avoir.totalHT.toFixed(2)} €`, 180, finalY, { align: 'right' })
    
    doc.text('Total TVA :', 130, finalY + 7)
    doc.text(`${avoir.totalTVA.toFixed(2)} €`, 180, finalY + 7, { align: 'right' })
    
    doc.setFontSize(14)
    doc.setTextColor(220, 38, 38) // Rouge
    doc.text('Total TTC :', 130, finalY + 17)
    doc.text(`-${Math.abs(avoir.totalTTC).toFixed(2)} €`, 180, finalY + 17, { align: 'right' })
    doc.setTextColor(0, 0, 0) // Reset noir
    
    // TYPE UTILISATION
    const utilisationY = finalY + 30
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Type d\'utilisation :', 20, utilisationY)
    
    doc.setFont('helvetica', 'normal')
    const typeText = avoir.utilisationType === 'deduction' 
      ? 'Déduction sur prochaine facture' 
      : 'Remboursement au client'
    doc.text(typeText, 20, utilisationY + 5)
    
    if (avoir.factureNumero) {
      doc.setFont('helvetica', 'bold')
      doc.text('Facture d\'origine :', 20, utilisationY + 15)
      doc.setFont('helvetica', 'normal')
      doc.text(avoir.factureNumero, 20, utilisationY + 20)
    }
    
    // FOOTER
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `${entreprise?.raisonSociale || 'SAS Solaire Nettoyage'} - SIRET ${entreprise?.siret || '820 504 421'} - TVA ${entreprise?.numeroTVA || 'FR82820504421'}`,
      105,
      280,
      { align: 'center' }
    )
    
    // Générer le PDF
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="avoir-${avoir.numero}.pdf"`
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
