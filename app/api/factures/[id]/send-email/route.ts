import { NextRequest, NextResponse } from 'next/server'
import { getFactureById, updateFacture } from '@/lib/firebase/factures'
import { getEntrepriseInfo } from '@/lib/firebase/entreprise'
import { logEmail } from '@/lib/firebase/emails'
import nodemailer from 'nodemailer'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { emailDestinataire, message } = body
    
    if (!emailDestinataire) {
      return NextResponse.json({ error: 'Email destinataire requis' }, { status: 400 })
    }
    
    const facture = await getFactureById(params.id)
    
    if (!facture) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    const entreprise = await getEntrepriseInfo()
    
    // Générer le PDF (même code que route PDF)
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(entreprise?.nom || 'SAS Solaire Nettoyage', 20, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(entreprise?.adresse || '', 20, 28)
    doc.text(`${entreprise?.codePostal || ''} ${entreprise?.ville || ''}`, 20, 33)
    doc.text(`Siret : ${entreprise?.siret || '820 504 421'}`, 20, 38)
    doc.text(`Email : ${entreprise?.email || 'contact@solairenettoyage.fr'}`, 20, 43)
    
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURE', 150, 30)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(facture.numero, 150, 40)
    doc.text(`Date : ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 150, 47)
    doc.text(`Échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 150, 54)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Client :', 20, 70)
    doc.setFont('helvetica', 'normal')
    doc.text(facture.clientNom, 20, 77)
    
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
        0: { cellWidth: 60 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' }
      }
    })
    
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
    
    if (facture.resteAPayer > 0) {
      doc.setTextColor(220, 38, 38)
      doc.text('Reste à payer :', 130, finalY + 27)
      doc.text(`${facture.resteAPayer.toFixed(2)} €`, 180, finalY + 27, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }
    
    const conditionsY = finalY + 40
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Conditions de paiement :', 20, conditionsY)
    doc.setFont('helvetica', 'normal')
    doc.text(facture.conditionsPaiement || 'Paiement à 30 jours', 20, conditionsY + 5)
    
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `${entreprise?.nom || 'SAS Solaire Nettoyage'} - SIRET ${entreprise?.siret || '820 504 421'}`,
      105,
      280,
      { align: 'center' }
    )
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    
    // Configuration SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.fr',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'contact@solairenettoyage.fr',
        pass: process.env.SMTP_PASSWORD
      }
    })
    
    // Envoi email
    await transporter.sendMail({
      from: `"${entreprise?.nom || 'Solaire Nettoyage'}" <${process.env.SMTP_USER || 'contact@solairenettoyage.fr'}>`,
      to: emailDestinataire,
      subject: `Facture ${facture.numero} - ${entreprise?.nom || 'Solaire Nettoyage'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Facture ${facture.numero}</h2>
          
          <p>Bonjour,</p>
          
          ${message ? `<p>${message.replace(/\n/g, '<br>')}</p>` : ''}
          
          <p>Veuillez trouver ci-joint la facture <strong>${facture.numero}</strong> d'un montant de <strong>${facture.totalTTC.toFixed(2)} €</strong>.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Numéro</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${facture.numero}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(facture.date).toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Échéance</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Montant TTC</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #2563EB;">${facture.totalTTC.toFixed(2)} €</td>
            </tr>
          </table>
          
          <p style="color: #6b7280; font-size: 14px;">Pour toute question, n'hésitez pas à nous contacter.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            ${entreprise?.nom || 'SAS Solaire Nettoyage'}<br>
            ${entreprise?.adresse || ''}<br>
            ${entreprise?.codePostal || ''} ${entreprise?.ville || ''}<br>
            SIRET : ${entreprise?.siret || '820 504 421'}<br>
            Email : ${entreprise?.email || 'contact@solairenettoyage.fr'}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `facture-${facture.numero}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    })
    
    // Logger l'envoi
    await logEmail({
      destinataire: emailDestinataire,
      sujet: `Facture ${facture.numero}`,
      type: 'facture',
      referenceId: facture.id
    })
    
    // Mettre à jour le statut si c'était un brouillon
    if (facture.statut === 'brouillon') {
      await updateFacture(facture.id, { statut: 'envoyee' })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Facture envoyée avec succès' 
    })
    
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
