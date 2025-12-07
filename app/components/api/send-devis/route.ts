import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, entreprise, email, telephone, surface, puissance, pente, unitePente, typeInstallation, message } = body

    // Validation des champs requis
    if (!nom || !entreprise || !email || !telephone || !typeInstallation) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation : au moins surface OU puissance
    if (!surface && !puissance) {
      return NextResponse.json(
        { error: 'Veuillez renseigner au moins la surface ou la puissance' },
        { status: 400 }
      )
    }

    // Envoyer l'email
    const data = await resend.emails.send({
      from: 'Solaire Nettoyage <devis@solairenettoyage.fr>',
      to: ['devis@solairenettoyage.fr'],
      replyTo: email,
      subject: `Nouvelle demande de devis - ${entreprise}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #C9A961 0%, #B8984E 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px 20px;
                border-radius: 0 0 10px 10px;
              }
              .field {
                background: white;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 5px;
                border-left: 4px solid #C9A961;
              }
              .label {
                font-weight: bold;
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 5px;
              }
              .value {
                font-size: 16px;
                color: #333;
              }
              .important {
                background: #fff3cd;
                border-left: 4px solid #ff9800;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎯 Nouvelle demande de devis</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Solaire Nettoyage</p>
              </div>
              
              <div class="content">
                <div class="important">
                  <strong>⏰ Répondre sous 24h</strong>
                </div>

                <div class="field">
                  <div class="label">Contact</div>
                  <div class="value">${nom}</div>
                </div>

                <div class="field">
                  <div class="label">Entreprise</div>
                  <div class="value">${entreprise}</div>
                </div>

                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">
                    <a href="mailto:${email}" style="color: #C9A961; text-decoration: none;">
                      ${email}
                    </a>
                  </div>
                </div>

                <div class="field">
                  <div class="label">Téléphone</div>
                  <div class="value">
                    <a href="tel:${telephone}" style="color: #C9A961; text-decoration: none;">
                      ${telephone}
                    </a>
                  </div>
                </div>

                ${surface ? `
                  <div class="field">
                    <div class="label">Surface à nettoyer</div>
                    <div class="value">${surface} m²</div>
                  </div>
                ` : ''}

                ${puissance ? `
                  <div class="field">
                    <div class="label">Puissance installée</div>
                    <div class="value">${puissance} kWc</div>
                  </div>
                ` : ''}

                ${pente ? `
                  <div class="field">
                    <div class="label">Pente de l'installation</div>
                    <div class="value">${pente}${unitePente === 'degres' ? '°' : '%'}</div>
                  </div>
                ` : ''}

                <div class="field">
                  <div class="label">Type d'installation</div>
                  <div class="value">${typeInstallation}</div>
                </div>

                ${message ? `
                  <div class="field">
                    <div class="label">Message / Détails</div>
                    <div class="value" style="white-space: pre-wrap;">${message}</div>
                  </div>
                ` : ''}

                <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 5px; text-align: center;">
                  <p style="margin: 0 0 15px 0; color: #666;">Actions rapides</p>
                  <a href="mailto:${email}" style="display: inline-block; background: #C9A961; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 5px;">
                    📧 Répondre par email
                  </a>
                  <a href="tel:${telephone}" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 5px;">
                    📞 Appeler
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}