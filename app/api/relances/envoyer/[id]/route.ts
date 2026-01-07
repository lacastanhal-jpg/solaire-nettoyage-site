/**
 * API ROUTE : Envoyer une relance par email
 * Utilise IONOS SMTP directement (nodemailer OK ici car côté serveur)
 */

import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { HistoriqueRelance, TemplateRelance } from '@/lib/firebase/relances-types'
import nodemailer from 'nodemailer'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId = 'system' } = await request.json().catch(() => ({}))
    const relanceId = params.id
    
    console.log(`[API Relance] Envoi relance ${relanceId}...`)
    
    // Récupérer la relance
    const docRef = doc(db, 'relances_historique', relanceId)
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
    
    // Vérifier config SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ 
        error: 'Configuration SMTP manquante' 
      }, { status: 500 })
    }
    
    // Créer transporteur SMTP IONOS
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ionos.fr',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // SSL pour port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
    
    // Préparer l'email
    const mailOptions = {
      from: `"Solaire Nettoyage" <${process.env.SMTP_USER}>`,
      to: relance.clientEmail,
      cc: process.env.EMAIL_COPY, // Copie optionnelle
      subject: relance.objet,
      html: relance.contenu,
      text: relance.contenu.replace(/<[^>]*>/g, '') // Conversion HTML vers texte
    }
    
    // TODO: Ajouter PDF facture en pièce jointe
    // if (relance.piecesJointes && relance.piecesJointes.includes('facture')) {
    //   mailOptions.attachments = [{
    //     filename: `facture-${relance.factureNumero}.pdf`,
    //     content: pdfBuffer,
    //     contentType: 'application/pdf'
    //   }]
    // }
    
    console.log(`[API Relance] Envoi email à ${relance.clientEmail}...`)
    
    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions)
    
    console.log(`[API Relance] ✓ Email envoyé : ${info.messageId}`)
    
    const maintenant = new Date().toISOString()
    
    // Mettre à jour la relance dans Firebase
    await updateDoc(docRef, {
      statut: 'envoyee',
      emailEnvoye: true,
      dateEnvoi: maintenant,
      tentativesEnvoi: (relance.tentativesEnvoi || 0) + 1,
      validePar: userId,
      emailId: info.messageId
    })
    
    // Mettre à jour stats template
    if (relance.templateUtilise) {
      const templateRef = doc(db, 'relances_templates', relance.templateUtilise)
      const templateSnap = await getDoc(templateRef)
      
      if (templateSnap.exists()) {
        const template = templateSnap.data() as TemplateRelance
        await updateDoc(templateRef, {
          nombreEnvois: (template.nombreEnvois || 0) + 1
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      relanceId,
      emailId: info.messageId,
      dateEnvoi: maintenant
    })
    
  } catch (error: any) {
    console.error('[API Relance] ✗ Erreur:', error)
    
    // Logger l'échec dans Firebase
    try {
      const docRef = doc(db, 'relances_historique', params.id)
      const currentDoc = await getDoc(docRef)
      const currentData = currentDoc.data()
      
      await updateDoc(docRef, {
        statut: 'echec',
        erreurEnvoi: error.message,
        tentativesEnvoi: (currentData?.tentativesEnvoi || 0) + 1
      })
    } catch (updateError) {
      console.error('[API Relance] Erreur MAJ statut:', updateError)
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur envoi email' },
      { status: 500 }
    )
  }
}
