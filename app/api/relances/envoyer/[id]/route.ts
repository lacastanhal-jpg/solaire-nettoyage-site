import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { HistoriqueRelance, TemplateRelance } from '@/lib/firebase/relances-types'
import { getFactureById } from '@/lib/firebase/factures'
import { getEntrepriseInfo } from '@/lib/firebase/entreprise'
import nodemailer from 'nodemailer'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * POST /api/relances/envoyer/[id]
 * Envoie une relance par email avec PDF facture
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 })
    }
    
    // Récupérer la relance
    const docRef = doc(db, 'relances_historique', params.id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Relance non trouvée' }, { status: 404 })
    }
    
    const relance = docSnap.data() as HistoriqueRelance
    
    // Vérifier statut
    if (relance.statut === 'envoyee') {
      return NextResponse.json({ error: 'Relance déjà envoyée' }, { status: 400 })
    }
    
    if (relance.statut === 'annulee') {
      return NextResponse.json({ error: 'Relance annulée' }, { status: 400 })
    }
    
    // Configuration SMTP (IONOS)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.fr',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
      }
    })
    
    // Préparer les options email
    const mailOptions: any = {
      from: `"Solaire Nettoyage - Relance" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: relance.destinataires.join(','),
      subject: relance.objet,
      html: relance.contenu,
      attachments: []
    }
    
    // Ajouter copie si demandée
    if (relance.copie && relance.copie.length > 0) {
      mailOptions.cc = relance.copie.join(',')
    }
    
    // Générer et attacher PDF facture si demandé
    if (relance.factureId) {
      try {
        const facture = await getFactureById(relance.factureId)
        const entreprise = await getEntrepriseInfo()
        
        if (facture) {
          // Générer PDF facture
          const doc = new jsPDF()
          
          // En-tête entreprise
          doc.setFontSize(20)
          doc.setFont('helvetica', 'bold')
          doc.text(entreprise?.nomCommercial || entreprise?.raisonSociale || 'SAS Solaire Nettoyage', 20, 20)
          
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(entreprise?.siegeSocial?.rue || '', 20, 28)
          doc.text(`${entreprise?.siegeSocial?.codePostal || ''} ${entreprise?.siegeSocial?.ville || ''}`, 20, 33)
          doc.text(`SIRET : ${entreprise?.siret || '820 504 421'}`, 20, 38)
          
          // Titre FACTURE
          doc.setFontSize(24)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(220, 38, 38) // Rouge pour relance
          doc.text('FACTURE', 150, 30)
          
          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
          doc.text(facture.numero, 150, 40)
          doc.text(`Date : ${new Date(facture.date).toLocaleDateString('fr-FR')}`, 150, 47)
          doc.text(`Échéance : ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 150, 54)
          
          // Avertissement retard en rouge
          doc.setFontSize(10)
          doc.setTextColor(220, 38, 38)
          doc.text(`⚠️ RETARD DE PAIEMENT : ${relance.joursRetard} jours`, 150, 61)
          doc.setTextColor(0, 0, 0)
          
          // Client
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Client :', 20, 70)
          doc.setFont('helvetica', 'normal')
          doc.text(facture.clientNom, 20, 77)
          
          // Tableau lignes facture
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
            }
          })
          
          const finalY = (doc as any).lastAutoTable.finalY + 10
          
          // Totaux
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.text('Total HT :', 130, finalY)
          doc.text(`${facture.totalHT.toFixed(2)} €`, 180, finalY, { align: 'right' })
          
          doc.text('Total TVA :', 130, finalY + 7)
          doc.text(`${facture.totalTVA.toFixed(2)} €`, 180, finalY + 7, { align: 'right' })
          
          doc.setFontSize(14)
          doc.text('Total TTC :', 130, finalY + 14)
          doc.text(`${facture.totalTTC.toFixed(2)} €`, 180, finalY + 14, { align: 'right' })
          
          // Générer buffer PDF
          const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
          
          // Attacher le PDF
          mailOptions.attachments.push({
            filename: `facture-${facture.numero}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          })
        }
      } catch (pdfError) {
        console.error('[Relances] Erreur génération PDF:', pdfError)
        // Continuer sans PDF plutôt que de faire échouer l'envoi
      }
    }
    
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions)
    console.log(`[Relances] Email envoyé avec succès: ${info.messageId}`)
    
    const maintenant = new Date().toISOString()
    
    // Mettre à jour la relance
    await updateDoc(docRef, {
      statut: 'envoyee',
      emailEnvoye: true,
      dateEnvoi: maintenant,
      tentativesEnvoi: relance.tentativesEnvoi + 1,
      validePar: userId
    })
    
    // Mettre à jour les stats du template
    const templateRef = doc(db, 'relances_templates', relance.templateUtilise)
    const templateSnap = await getDoc(templateRef)
    
    if (templateSnap.exists()) {
      const template = templateSnap.data() as TemplateRelance
      await updateDoc(templateRef, {
        nombreEnvois: (template.nombreEnvois || 0) + 1
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      emailId: info.messageId,
      message: 'Relance envoyée avec succès' 
    })
    
  } catch (error: any) {
    console.error('[Relances] Erreur envoi relance:', error)
    
    // Logger l'échec
    try {
      const docRef = doc(db, 'relances_historique', params.id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          statut: 'echec',
          erreurEnvoi: error.message,
          tentativesEnvoi: (docSnap.data()?.tentativesEnvoi || 0) + 1
        })
      }
    } catch (updateError) {
      console.error('[Relances] Erreur mise à jour statut échec:', updateError)
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi de la relance' },
      { status: 500 }
    )
  }
}
