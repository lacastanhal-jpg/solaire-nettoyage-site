/**
 * TEMPLATES EMAILS PAR DÉFAUT - RELANCES AUTOMATIQUES
 * Templates professionnels HTML avec ton progressif
 */

import { db } from './config'
import { collection, doc, setDoc, getDocs } from 'firebase/firestore'
import type { TemplateRelance } from './relances-types'

/**
 * Initialiser les templates par défaut
 * À appeler une seule fois au démarrage du système
 */
export async function initialiserTemplatesDefaut(): Promise<void> {
  try {
    // Vérifier si templates déjà initialisés
    const templatesRef = collection(db, 'relances_templates')
    const snapshot = await getDocs(templatesRef)
    
    if (!snapshot.empty) {
      console.log('Templates déjà initialisés')
      return
    }
    
    // Créer les 4 templates
    await Promise.all([
      creerTemplateRappelAmiable(),
      creerTemplateRelanceFerme(),
      creerTemplateMiseEnDemeure(),
      creerTemplateContentieux()
    ])
    
    console.log('✅ Templates initialisés avec succès')
  } catch (error) {
    console.error('Erreur initialisation templates:', error)
    throw error
  }
}

/**
 * Template 1 : Rappel Amiable (J+15)
 * Ton courtois et professionnel
 */
async function creerTemplateRappelAmiable(): Promise<void> {
  const template: Omit<TemplateRelance, 'id' | 'nombreEnvois'> = {
    type: 'rappel_amiable',
    actif: true,
    nom: 'Rappel Amiable Standard',
    description: 'Premier rappel courtois 15 jours après échéance',
    
    objet: 'Rappel aimable - Facture {{factureNumero}} échue',
    
    contenuHTML: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .highlight { background: #fff; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    table td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <!-- En-tête -->
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">SOLAIRE NETTOYAGE</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px;">Leader du nettoyage photovoltaïque</p>
    </div>
    
    <!-- Contenu -->
    <div class="content">
      <p>Madame, Monsieur {{clientNom}},</p>
      
      <p>Nous espérons que nos prestations continuent de vous satisfaire pleinement.</p>
      
      <p>Nous nous permettons de vous rappeler qu'à la date du jour, notre facture ci-dessous reste impayée :</p>
      
      <div class="highlight">
        <table>
          <tr>
            <td>Facture n°</td>
            <td>{{factureNumero}}</td>
          </tr>
          <tr>
            <td>Date d'émission</td>
            <td>{{factureDate}}</td>
          </tr>
          <tr>
            <td>Date d'échéance</td>
            <td>{{factureDateEcheance}}</td>
          </tr>
          <tr>
            <td><strong>Montant TTC</strong></td>
            <td><strong>{{factureResteAPayer}}</strong></td>
          </tr>
          <tr>
            <td>Retard</td>
            <td>{{joursRetard}} jour(s)</td>
          </tr>
        </table>
      </div>
      
      <p>Il s'agit probablement d'un simple oubli de votre part. Nous vous remercions par avance de bien vouloir procéder au règlement dans les <strong>meilleurs délais</strong>.</p>
      
      <p>Si vous avez déjà effectué ce règlement, veuillez ne pas tenir compte de ce message et nous transmettre votre justificatif de paiement.</p>
      
      <p>En cas de difficulté, n'hésitez pas à nous contacter afin que nous puissions trouver ensemble une solution adaptée.</p>
      
      <p>Nous vous remercions de votre compréhension et restons à votre entière disposition.</p>
      
      <p style="margin-top: 30px;">
        Cordialement,<br>
        <strong>Le Service Comptabilité</strong><br>
        {{entrepriseNom}}
      </p>
    </div>
    
    <!-- Pied de page -->
    <div class="footer">
      <p><strong>SOLAIRE NETTOYAGE</strong> | Toulouse, France</p>
      <p>📧 {{entrepriseEmail}} | 📞 {{entrepriseTelephone}}</p>
      <p>Ce message est généré automatiquement par notre système de facturation.</p>
    </div>
  </div>
</body>
</html>`,
    
    contenuTexte: `Madame, Monsieur {{clientNom}},

Nous nous permettons de vous rappeler qu'à la date du jour, notre facture reste impayée :

Facture n° : {{factureNumero}}
Date d'échéance : {{factureDateEcheance}}
Montant TTC : {{factureResteAPayer}}
Retard : {{joursRetard}} jour(s)

Il s'agit probablement d'un simple oubli. Nous vous remercions de bien vouloir procéder au règlement dans les meilleurs délais.

Si vous avez déjà effectué ce règlement, veuillez nous transmettre votre justificatif.

Cordialement,
Le Service Comptabilité
{{entrepriseNom}}
{{entrepriseEmail}} | {{entrepriseTelephone}}`,
    
    inclureFacturePDF: true,
    inclureCopieEmail: true,
    langue: 'fr',
    priorite: 'normale',
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
  
  const docRef = doc(collection(db, 'relances_templates'))
  await setDoc(docRef, { ...template, id: docRef.id })
}

/**
 * Template 2 : Relance Ferme (J+30)
 * Ton plus ferme mais professionnel
 */
async function creerTemplateRelanceFerme(): Promise<void> {
  const template: Omit<TemplateRelance, 'id' | 'nombreEnvois'> = {
    type: 'relance_ferme',
    actif: true,
    nom: 'Relance Ferme Standard',
    description: 'Relance ferme 30 jours après échéance',
    
    objet: 'RELANCE - Facture {{factureNumero}} impayée depuis {{joursRetard}} jours',
    
    contenuHTML: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .warning { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
    .highlight { background: #fff; padding: 15px; border-left: 4px solid #DC2626; margin: 20px 0; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    table td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <!-- En-tête -->
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">⚠️ RELANCE DE PAIEMENT</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px;">SOLAIRE NETTOYAGE</p>
    </div>
    
    <!-- Contenu -->
    <div class="content">
      <p>Madame, Monsieur {{clientNom}},</p>
      
      <div class="warning">
        <strong>⚠️ AVERTISSEMENT</strong><br>
        Malgré notre précédent rappel, nous constatons que le règlement de la facture ci-dessous n'est toujours pas intervenu.
      </div>
      
      <div class="highlight">
        <table>
          <tr>
            <td>Facture n°</td>
            <td>{{factureNumero}}</td>
          </tr>
          <tr>
            <td>Date d'émission</td>
            <td>{{factureDate}}</td>
          </tr>
          <tr>
            <td>Date d'échéance</td>
            <td>{{factureDateEcheance}}</td>
          </tr>
          <tr>
            <td><strong>Montant TTC</strong></td>
            <td><strong style="color: #DC2626;">{{factureResteAPayer}}</strong></td>
          </tr>
          <tr>
            <td><strong>Retard</strong></td>
            <td><strong style="color: #DC2626;">{{joursRetard}} jours</strong></td>
          </tr>
        </table>
      </div>
      
      <p>Nous vous demandons <strong>impérativement</strong> de procéder au règlement de cette facture dans un délai de <strong>8 jours</strong> à compter de la réception de ce courrier.</p>
      
      <p><strong>À défaut de règlement sous ce délai, nous serons contraints de :</strong></p>
      <ul>
        <li>Suspendre toute nouvelle prestation</li>
        <li>Transmettre votre dossier à notre service contentieux</li>
        <li>Engager une procédure de recouvrement judiciaire</li>
      </ul>
      
      <p>Si vous rencontrez des difficultés de paiement, nous vous invitons à nous contacter <strong>sans délai</strong> au {{entrepriseTelephone}} afin d'étudier ensemble une solution amiable.</p>
      
      <p style="margin-top: 30px;">
        Cordialement,<br>
        <strong>Le Service Comptabilité</strong><br>
        {{entrepriseNom}}
      </p>
    </div>
    
    <!-- Pied de page -->
    <div class="footer">
      <p><strong>SOLAIRE NETTOYAGE</strong> | Toulouse, France</p>
      <p>📧 {{entrepriseEmail}} | 📞 {{entrepriseTelephone}}</p>
    </div>
  </div>
</body>
</html>`,
    
    contenuTexte: `Madame, Monsieur {{clientNom}},

⚠️ RELANCE DE PAIEMENT

Malgré notre précédent rappel, nous constatons que le règlement de la facture ci-dessous n'est toujours pas intervenu :

Facture n° : {{factureNumero}}
Date d'échéance : {{factureDateEcheance}}
Montant TTC : {{factureResteAPayer}}
Retard : {{joursRetard}} jours

Nous vous demandons IMPÉRATIVEMENT de procéder au règlement dans un délai de 8 jours.

À défaut, nous serons contraints de suspendre toute nouvelle prestation et d'engager une procédure de recouvrement.

Si vous rencontrez des difficultés, contactez-nous sans délai au {{entrepriseTelephone}}.

Cordialement,
Le Service Comptabilité
{{entrepriseNom}}`,
    
    inclureFacturePDF: true,
    inclureCopieEmail: true,
    langue: 'fr',
    priorite: 'haute',
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
  
  const docRef = doc(collection(db, 'relances_templates'))
  await setDoc(docRef, { ...template, id: docRef.id })
}

/**
 * Template 3 : Mise en Demeure (J+45)
 * Ton formel et juridique
 */
async function creerTemplateMiseEnDemeure(): Promise<void> {
  const template: Omit<TemplateRelance, 'id' | 'nombreEnvois'> = {
    type: 'mise_en_demeure',
    actif: true,
    nom: 'Mise en Demeure Officielle',
    description: 'Mise en demeure formelle 45 jours après échéance',
    
    objet: 'MISE EN DEMEURE - Facture {{factureNumero}} - Dernier avertissement',
    
    contenuHTML: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; line-height: 1.8; color: #000; }
    .container { max-width: 700px; margin: 0 auto; padding: 40px; background: white; }
    .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .content { padding: 20px 0; }
    .highlight { background: #FECACA; padding: 20px; border: 2px solid #DC2626; margin: 30px 0; text-align: center; }
    .signature { margin-top: 60px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table td { padding: 10px; border: 1px solid #000; }
    table td:first-child { font-weight: bold; width: 35%; background: #f3f4f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px; text-transform: uppercase;">Mise en Demeure de Payer</h1>
      <p style="margin: 10px 0 0 0;">Lettre Recommandée avec Accusé de Réception</p>
    </div>
    
    <div class="content">
      <p style="text-align: right;">Toulouse, le {{dateRelance}}</p>
      
      <p style="margin-top: 40px;">
        <strong>SOLAIRE NETTOYAGE</strong><br>
        Toulouse, France<br>
        {{entrepriseEmail}}<br>
        {{entrepriseTelephone}}
      </p>
      
      <p style="margin-top: 30px;">
        <strong>{{clientNom}}</strong>
      </p>
      
      <p style="margin-top: 40px; text-align: center; font-size: 16px;">
        <strong><u>OBJET : MISE EN DEMEURE DE PAYER</u></strong>
      </p>
      
      <p style="margin-top: 30px;">Madame, Monsieur,</p>
      
      <p>Malgré nos précédents courriers de rappel et de relance restés sans réponse de votre part, nous constatons que vous n'avez toujours pas procédé au règlement de la facture suivante :</p>
      
      <table>
        <tr>
          <td>Numéro de facture</td>
          <td>{{factureNumero}}</td>
        </tr>
        <tr>
          <td>Date d'émission</td>
          <td>{{factureDate}}</td>
        </tr>
        <tr>
          <td>Date d'échéance</td>
          <td>{{factureDateEcheance}}</td>
        </tr>
        <tr>
          <td>Montant total TTC</td>
          <td><strong>{{factureResteAPayer}}</strong></td>
        </tr>
        <tr>
          <td>Nombre de jours de retard</td>
          <td><strong style="color: #DC2626;">{{joursRetard}} jours</strong></td>
        </tr>
      </table>
      
      <div class="highlight">
        <p style="margin: 0; font-size: 18px; font-weight: bold;">
          ⚖️ DERNIER AVERTISSEMENT AVANT ACTION EN JUSTICE
        </p>
      </div>
      
      <p><strong>En conséquence, nous vous mettons en demeure de procéder au règlement intégral de cette somme dans un délai IMPÉRATIF de HUIT (8) JOURS à compter de la réception de la présente.</strong></p>
      
      <p>À défaut de paiement dans ce délai, et sans autre avis de notre part, nous nous verrons contraints de :</p>
      
      <ol style="line-height: 2;">
        <li>Transmettre immédiatement votre dossier à notre société de recouvrement</li>
        <li>Engager une procédure judiciaire à votre encontre (injonction de payer)</li>
        <li>Réclamer le paiement des pénalités de retard conformément à nos conditions générales de vente</li>
        <li>Réclamer une indemnité forfaitaire de 40€ pour frais de recouvrement (article L.441-6 du Code de Commerce)</li>
      </ol>
      
      <p>Ces frais supplémentaires viendront s'ajouter au montant de la facture impayée.</p>
      
      <p><strong>Cette mise en demeure vaut dernier avertissement avant engagement de poursuites judiciaires.</strong></p>
      
      <div class="signature">
        <p>Nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.</p>
        
        <p style="margin-top: 40px;">
          <strong>Le Service Comptabilité</strong><br>
          SOLAIRE NETTOYAGE
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
    
    contenuTexte: `MISE EN DEMEURE DE PAYER
Lettre Recommandée avec Accusé de Réception

Toulouse, le {{dateRelance}}

SOLAIRE NETTOYAGE
{{entrepriseEmail}} | {{entrepriseTelephone}}

À l'attention de {{clientNom}}

OBJET : MISE EN DEMEURE DE PAYER

Madame, Monsieur,

Malgré nos précédents courriers restés sans réponse, vous n'avez toujours pas réglé la facture suivante :

Facture n° : {{factureNumero}}
Date d'échéance : {{factureDateEcheance}}
Montant TTC : {{factureResteAPayer}}
Retard : {{joursRetard}} jours

NOUS VOUS METTONS EN DEMEURE de procéder au règlement dans un délai de HUIT (8) JOURS.

À défaut, nous engagerons une procédure judiciaire et réclamerons les pénalités de retard ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.

Cette mise en demeure vaut dernier avertissement avant action en justice.

Cordialement,
Le Service Comptabilité
SOLAIRE NETTOYAGE`,
    
    inclureFacturePDF: true,
    inclureCopieEmail: true,
    langue: 'fr',
    priorite: 'haute',
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
  
  const docRef = doc(collection(db, 'relances_templates'))
  await setDoc(docRef, { ...template, id: docRef.id })
}

/**
 * Template 4 : Passage Contentieux (J+60)
 * Notification passage en recouvrement
 */
async function creerTemplateContentieux(): Promise<void> {
  const template: Omit<TemplateRelance, 'id' | 'nombreEnvois'> = {
    type: 'contentieux',
    actif: true,
    nom: 'Passage Contentieux',
    description: 'Notification passage en recouvrement 60 jours après échéance',
    
    objet: 'CONTENTIEUX - Transmission de votre dossier au service de recouvrement',
    
    contenuHTML: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7C2D12; color: white; padding: 25px; text-align: center; }
    .content { background: white; padding: 30px; border: 2px solid #7C2D12; }
    .alert { background: #FEE2E2; padding: 20px; border: 2px solid #DC2626; margin: 20px 0; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table td { padding: 10px; border-bottom: 1px solid #ccc; }
    table td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">⚖️ CONTENTIEUX</h1>
      <p style="margin: 10px 0 0 0;">SOLAIRE NETTOYAGE</p>
    </div>
    
    <div class="content">
      <p>Madame, Monsieur {{clientNom}},</p>
      
      <div class="alert">
        <h2 style="margin: 0; color: #DC2626;">VOTRE DOSSIER EST TRANSMIS AU CONTENTIEUX</h2>
      </div>
      
      <p>Malgré notre mise en demeure de payer restée sans effet, et en l'absence de tout règlement ou contact de votre part, nous sommes au regret de vous informer que <strong>votre dossier est désormais transmis à notre société de recouvrement</strong>.</p>
      
      <table>
        <tr>
          <td>Facture n°</td>
          <td>{{factureNumero}}</td>
        </tr>
        <tr>
          <td>Montant impayé</td>
          <td><strong style="font-size: 18px; color: #DC2626;">{{factureResteAPayer}}</strong></td>
        </tr>
        <tr>
          <td>Retard</td>
          <td><strong style="color: #DC2626;">{{joursRetard}} jours</strong></td>
        </tr>
      </table>
      
      <p><strong>CONSÉQUENCES :</strong></p>
      <ul>
        <li>Procédure judiciaire en cours d'engagement (injonction de payer)</li>
        <li>Inscription possible au fichier des incidents de paiement</li>
        <li>Frais de recouvrement et pénalités à votre charge</li>
        <li>Suspension définitive de toute relation commerciale</li>
      </ul>
      
      <div class="alert" style="background: #FEF3C7; border-color: #F59E0B;">
        <p style="margin: 0;"><strong>⏰ DERNIÈRE POSSIBILITÉ DE RÉGULARISATION AMIABLE</strong></p>
        <p style="margin: 10px 0 0 0;">Contactez-nous IMMÉDIATEMENT au {{entrepriseTelephone}}</p>
      </div>
      
      <p>Ce courrier constitue notre dernier contact avant transmission complète du dossier.</p>
      
      <p style="margin-top: 40px;">
        Le Service Contentieux<br>
        <strong>SOLAIRE NETTOYAGE</strong>
      </p>
    </div>
  </div>
</body>
</html>`,
    
    contenuTexte: `⚖️ CONTENTIEUX - SOLAIRE NETTOYAGE

Madame, Monsieur {{clientNom}},

VOTRE DOSSIER EST TRANSMIS AU CONTENTIEUX

Malgré notre mise en demeure, votre dossier est désormais transmis à notre société de recouvrement.

Facture n° : {{factureNumero}}
Montant impayé : {{factureResteAPayer}}
Retard : {{joursRetard}} jours

CONSÉQUENCES :
- Procédure judiciaire en cours
- Frais de recouvrement à votre charge
- Suspension définitive de toute relation commerciale

DERNIÈRE POSSIBILITÉ : Contactez-nous IMMÉDIATEMENT au {{entrepriseTelephone}}

Le Service Contentieux
SOLAIRE NETTOYAGE`,
    
    inclureFacturePDF: true,
    inclureCopieEmail: true,
    langue: 'fr',
    priorite: 'haute',
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
  
  const docRef = doc(collection(db, 'relances_templates'))
  await setDoc(docRef, { ...template, id: docRef.id })
}
