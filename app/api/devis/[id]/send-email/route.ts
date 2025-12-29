import { NextRequest, NextResponse } from 'next/server'
import { getDevisById } from '@/lib/firebase/devis'
import { getEntreprise } from '@/lib/firebase/entreprise'
import { enregistrerEnvoiEmail } from '@/lib/firebase/emails'
import nodemailer from 'nodemailer'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const devisId = params.id
    const body = await request.json()
    const { destinataire, message } = body

    if (!destinataire) {
      return NextResponse.json({ error: 'Destinataire requis' }, { status: 400 })
    }

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

    // Générer le PDF (appel à l'API PDF)
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/devis/${devisId}/pdf`)
    if (!pdfResponse.ok) {
      throw new Error('Erreur génération PDF')
    }
    const pdfBuffer = await pdfResponse.arrayBuffer()

    // Configuration du transporteur SMTP IONOS
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      requireTLS: true, // Force TLS pour IONOS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false, // Accepte les certificats IONOS
        minVersion: 'TLSv1.2'
      },
      debug: true, // Active les logs pour debug
      logger: true
    })

    // Préparer l'email
    const objet = `Devis ${devis.numero} - ${entreprise.nomCommercial || entreprise.raisonSociale}`
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${entreprise.nomCommercial || entreprise.raisonSociale}</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #374151;">Bonjour,</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            ${message || `Veuillez trouver ci-joint notre devis ${devis.numero} pour un montant de <strong>${devis.totalTTC.toFixed(2)} € TTC</strong>.`}
          </p>
          
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Récapitulatif du devis</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Numéro de devis :</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${devis.numero}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date :</td>
                <td style="padding: 8px 0; color: #1f2937; text-align: right;">${new Date(devis.date).toLocaleDateString('fr-FR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Client :</td>
                <td style="padding: 8px 0; color: #1f2937; text-align: right;">${devis.clientNom}</td>
              </tr>
              <tr style="border-top: 2px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total TTC :</td>
                <td style="padding: 12px 0; color: #2563eb; font-size: 18px; font-weight: bold; text-align: right;">${devis.totalTTC.toFixed(2)} €</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Pour toute question, n'hésitez pas à nous contacter :
          </p>
          <p style="font-size: 14px; color: #374151;">
            📞 ${entreprise.telephone}<br>
            📧 ${entreprise.email}
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-top: 30px;">
            Cordialement,<br>
            <strong>${entreprise.nomCommercial || entreprise.raisonSociale}</strong>
          </p>
        </div>
        
        <div style="background-color: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">${entreprise.raisonSociale} - ${entreprise.formeJuridique}</p>
          <p style="margin: 5px 0;">SIRET: ${entreprise.siret} - RCS: ${entreprise.rcs}</p>
          <p style="margin: 5px 0;">${entreprise.siegeSocial.rue}, ${entreprise.siegeSocial.codePostal} ${entreprise.siegeSocial.ville}</p>
        </div>
      </div>
    `

    // Envoyer l'email avec Nodemailer
    const emailResult = await transporter.sendMail({
      from: `"${entreprise.nomCommercial || entreprise.raisonSociale}" <${process.env.SMTP_USER}>`,
      to: destinataire,
      subject: objet,
      html: htmlContent,
      attachments: [
        {
          filename: `devis-${devis.numero}.pdf`,
          content: Buffer.from(pdfBuffer)
        }
      ]
    })

    // Enregistrer dans l'historique
    await enregistrerEnvoiEmail({
      devisId,
      date: new Date().toISOString(),
      destinataire,
      objet,
      statut: 'envoyé',
      utilisateur: 'admin' // TODO: Récupérer l'utilisateur connecté
    })

    return NextResponse.json({ 
      success: true, 
      messageId: emailResult.messageId,
      message: 'Email envoyé avec succès'
    })

  } catch (error) {
    console.error('Erreur envoi email:', error)
    
    // Enregistrer l'erreur dans l'historique
    try {
      await enregistrerEnvoiEmail({
        devisId: params.id,
        date: new Date().toISOString(),
        destinataire: '',
        objet: 'Erreur envoi',
        statut: 'erreur',
        erreur: error instanceof Error ? error.message : 'Erreur inconnue',
        utilisateur: 'admin'
      })
    } catch (e) {
      console.error('Erreur enregistrement historique:', e)
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}
