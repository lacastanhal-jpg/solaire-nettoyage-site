import { NextRequest, NextResponse } from 'next/server'
import { getAvoirById, updateAvoir } from '@/lib/firebase/avoirs'
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
    
    const avoir = await getAvoirById(params.id)
    
    if (!avoir) {
      return NextResponse.json({ error: 'Avoir introuvable' }, { status: 404 })
    }

    const entreprise = await getEntrepriseInfo()
    
    // Générer le PDF (même code que route PDF)
    const doc = new jsPDF()
    
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
    
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text('AVOIR', 150, 30)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(avoir.numero, 150, 40)
    doc.text(`Date : ${new Date(avoir.date).toLocaleDateString('fr-FR')}`, 150, 47)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Client :', 20, 70)
    doc.setFont('helvetica', 'normal')
    doc.text(avoir.clientNom, 20, 77)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Motif :', 20, 90)
    doc.setFont('helvetica', 'normal')
    const motifLines = doc.splitTextToSize(avoir.motif, 170)
    doc.text(motifLines, 20, 97)
    
    const startY = 97 + (motifLines.length * 5) + 10
    
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
        fillColor: [220, 38, 38],
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
    
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Total HT :', 130, finalY)
    doc.text(`${avoir.totalHT.toFixed(2)} €`, 180, finalY, { align: 'right' })
    doc.text('Total TVA :', 130, finalY + 7)
    doc.text(`${avoir.totalTVA.toFixed(2)} €`, 180, finalY + 7, { align: 'right' })
    doc.setFontSize(14)
    doc.setTextColor(220, 38, 38)
    doc.text('Total TTC :', 130, finalY + 17)
    doc.text(`-${Math.abs(avoir.totalTTC).toFixed(2)} €`, 180, finalY + 17, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    
    const utilisationY = finalY + 30
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Type d\'utilisation :', 20, utilisationY)
    doc.setFont('helvetica', 'normal')
    const typeText = avoir.utilisationType === 'deduction' 
      ? 'Déduction sur prochaine facture' 
      : 'Remboursement au client'
    doc.text(typeText, 20, utilisationY + 5)
    
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `${entreprise?.raisonSociale || 'SAS Solaire Nettoyage'} - SIRET ${entreprise?.siret || '820 504 421'}`,
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
      from: `"${entreprise?.raisonSociale || 'Solaire Nettoyage'}" <${process.env.SMTP_USER || 'contact@solairenettoyage.fr'}>`,
      to: emailDestinataire,
      subject: `Avoir ${avoir.numero} - ${entreprise?.raisonSociale || 'Solaire Nettoyage'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">Avoir ${avoir.numero}</h2>
          
          <p>Bonjour,</p>
          
          ${message ? `<p>${message.replace(/\n/g, '<br>')}</p>` : ''}
          
          <p>Veuillez trouver ci-joint l'avoir <strong>${avoir.numero}</strong> d'un montant de <strong style="color: #DC2626;">-${Math.abs(avoir.totalTTC).toFixed(2)} €</strong>.</p>
          
          <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>Motif :</strong><br>
            ${avoir.motif}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Numéro</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${avoir.numero}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(avoir.date).toLocaleDateString('fr-FR')}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Montant</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #DC2626;">-${Math.abs(avoir.totalTTC).toFixed(2)} €</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Utilisation</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${typeText}</td>
            </tr>
          </table>
          
          <p style="color: #6b7280; font-size: 14px;">Pour toute question, n'hésitez pas à nous contacter.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            ${entreprise?.raisonSociale || 'SAS Solaire Nettoyage'}<br>
            ${entreprise?.siegeSocial?.rue || ''}<br>
            ${entreprise?.siegeSocial?.codePostal || ''} ${entreprise?.siegeSocial?.ville || ''}<br>
            SIRET : ${entreprise?.siret || '820 504 421'}<br>
            Email : ${entreprise?.email || 'contact@solairenettoyage.fr'}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `avoir-${avoir.numero}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    })
    
    // Logger l'envoi
    await logEmail({
      destinataire: emailDestinataire,
      sujet: `Avoir ${avoir.numero}`,
      type: 'avoir',
      referenceId: avoir.id
    })
    
    // Mettre à jour le statut si c'était un brouillon
    if (avoir.statut === 'brouillon') {
      await updateAvoir(avoir.id, { statut: 'envoye' })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Avoir envoyé avec succès' 
    })
    
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
