/**
 * API ROUTE - CRON GÉNÉRATION FACTURES CONTRATS
 * Exécution quotidienne à 8h00 pour générer automatiquement les factures
 * Endpoint: /api/cron/contrats-quotidiens
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  genererFacturesDuJour,
  getContratsAFacturerAujourdhui,
  getAlertesContrats
} from '@/lib/firebase/contrats-recurrents'

// Configuration pour Vercel Cron
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

/**
 * Vérification clé API pour sécuriser le cron
 */
function verifierCleAPI(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cleAPI = process.env.CRON_SECRET_KEY
  
  if (!cleAPI) {
    console.warn('⚠️ CRON_SECRET_KEY non configurée')
    return false
  }
  
  return authHeader === `Bearer ${cleAPI}`
}

/**
 * Envoyer email de rapport quotidien
 */
async function envoyerRapportQuotidien(rapport: any): Promise<void> {
  try {
    // TODO: Implémenter avec Resend
    const emailsDestinataires = process.env.CRON_REPORT_EMAILS?.split(',') || []
    
    if (emailsDestinataires.length === 0) {
      console.log('Aucun destinataire configuré pour les rapports')
      return
    }
    
    console.log(`📧 Rapport quotidien envoyé à ${emailsDestinataires.join(', ')}`)
    
    // const { Resend } = await import('resend')
    // const resend = new Resend(process.env.RESEND_API_KEY)
    
    // await resend.emails.send({
    //   from: 'ERP Solaire <erp@solaire-nettoyage.site>',
    //   to: emailsDestinataires,
    //   subject: `[ERP] Rapport Contrats - ${new Date().toLocaleDateString('fr-FR')}`,
    //   html: genererHTMLRapport(rapport)
    // })
    
  } catch (error) {
    console.error('Erreur envoi rapport:', error)
  }
}

/**
 * POST /api/cron/contrats-quotidiens
 * Génère automatiquement toutes les factures dues aujourd'hui
 */
export async function POST(request: NextRequest) {
  const debut = Date.now()
  
  console.log('🔄 Début exécution cron contrats récurrents')
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`)
  
  try {
    // Vérification sécurité
    if (!verifierCleAPI(request)) {
      console.error('❌ Clé API invalide ou manquante')
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Étape 1: Récupérer les contrats à facturer
    console.log('📊 Récupération contrats à facturer...')
    const contratsAFacturer = await getContratsAFacturerAujourdhui()
    console.log(`✅ ${contratsAFacturer.length} contrat(s) à facturer aujourd'hui`)
    
    if (contratsAFacturer.length === 0) {
      const rapport = {
        date: new Date(),
        nombreContratsTraites: 0,
        nombreFacturesGenerees: 0,
        nombreEchecs: 0,
        montantTotal: 0,
        dureeExecution: Date.now() - debut,
        resultats: [],
        alertes: []
      }
      
      await envoyerRapportQuotidien(rapport)
      
      return NextResponse.json({
        success: true,
        message: 'Aucun contrat à facturer aujourd\'hui',
        rapport
      })
    }
    
    // Étape 2: Générer les factures
    console.log('⚙️ Génération des factures...')
    const resultatsGeneration = await genererFacturesDuJour('CRON_AUTO')
    
    console.log(`✅ ${resultatsGeneration.nombreGenerees} facture(s) générée(s)`)
    if (resultatsGeneration.nombreEchecs > 0) {
      console.warn(`⚠️ ${resultatsGeneration.nombreEchecs} échec(s)`)
    }
    
    // Étape 3: Calculer montant total généré
    const montantTotal = resultatsGeneration.resultats
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.montantGenere || 0), 0)
    
    console.log(`💰 Montant total généré: ${montantTotal.toLocaleString('fr-FR')}€ HT`)
    
    // Étape 4: Récupérer les alertes
    console.log('🔔 Récupération des alertes...')
    const alertes = await getAlertesContrats()
    const alertesImportantes = alertes.filter(a => 
      a.gravite === 'error' || a.gravite === 'critique'
    )
    
    console.log(`⚠️ ${alertesImportantes.length} alerte(s) importante(s)`)
    
    // Étape 5: Construire rapport
    const rapport = {
      date: new Date(),
      nombreContratsTraites: contratsAFacturer.length,
      nombreFacturesGenerees: resultatsGeneration.nombreGenerees,
      nombreEchecs: resultatsGeneration.nombreEchecs,
      montantTotal: Math.round(montantTotal * 100) / 100,
      dureeExecution: Date.now() - debut,
      resultats: resultatsGeneration.resultats.map(r => ({
        success: r.success,
        factureNumero: r.factureNumero,
        montant: r.montantGenere,
        erreur: r.erreur?.message
      })),
      alertes: alertesImportantes.map(a => ({
        type: a.type,
        contrat: a.contratNumero,
        client: a.clientNom,
        message: a.message,
        gravite: a.gravite
      }))
    }
    
    // Étape 6: Envoyer rapport par email
    await envoyerRapportQuotidien(rapport)
    
    // Logs finaux
    console.log(`✅ Exécution terminée en ${rapport.dureeExecution}ms`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return NextResponse.json({
      success: true,
      message: `${resultatsGeneration.nombreGenerees} facture(s) générée(s)`,
      rapport
    })
    
  } catch (error: any) {
    console.error('❌ Erreur cron contrats:', error)
    
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'exécution du cron',
        message: error.message,
        dureeExecution: Date.now() - debut
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/contrats-quotidiens
 * Test manuel du cron (dev uniquement)
 */
export async function GET(request: NextRequest) {
  // En production, rediriger vers POST
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Utilisez POST pour exécuter le cron' },
      { status: 405 }
    )
  }
  
  console.log('🧪 Test manuel du cron (développement)')
  return POST(request)
}

/**
 * Génère le HTML du rapport quotidien
 */
function genererHTMLRapport(rapport: any): string {
  const { nombreFacturesGenerees, nombreEchecs, montantTotal, alertes, resultats } = rapport
  
  const statutEmoji = nombreEchecs === 0 ? '✅' : '⚠️'
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin: 0;
    }
    .stat-label {
      color: #666;
      font-size: 14px;
      margin: 5px 0 0 0;
    }
    .section {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #333;
    }
    .success {
      color: #10b981;
    }
    .error {
      color: #ef4444;
    }
    .warning {
      color: #f59e0b;
    }
    .facture-item {
      padding: 10px;
      border-left: 3px solid #10b981;
      background: #f0fdf4;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .alerte-item {
      padding: 10px;
      border-left: 3px solid #ef4444;
      background: #fef2f2;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${statutEmoji} Rapport Contrats Récurrents</h1>
    <p>${dateStr}</p>
  </div>
  
  <div class="stats">
    <div class="stat-card">
      <p class="stat-value">${nombreFacturesGenerees}</p>
      <p class="stat-label">Factures générées</p>
    </div>
    <div class="stat-card">
      <p class="stat-value">${montantTotal.toLocaleString('fr-FR')}€</p>
      <p class="stat-label">Montant total HT</p>
    </div>
    <div class="stat-card">
      <p class="stat-value ${nombreEchecs > 0 ? 'error' : 'success'}">${nombreEchecs}</p>
      <p class="stat-label">Échecs</p>
    </div>
    <div class="stat-card">
      <p class="stat-value ${alertes.length > 0 ? 'warning' : 'success'}">${alertes.length}</p>
      <p class="stat-label">Alertes</p>
    </div>
  </div>
  
  ${nombreFacturesGenerees > 0 ? `
  <div class="section">
    <h2>✅ Factures générées</h2>
    ${resultats
      .filter((r: any) => r.success)
      .map((r: any) => `
        <div class="facture-item">
          <strong>${r.factureNumero}</strong> - ${r.montant?.toLocaleString('fr-FR')}€ HT
        </div>
      `).join('')}
  </div>
  ` : ''}
  
  ${nombreEchecs > 0 ? `
  <div class="section">
    <h2>❌ Échecs</h2>
    ${resultats
      .filter((r: any) => !r.success)
      .map((r: any) => `
        <div class="alerte-item">
          <strong>Erreur:</strong> ${r.erreur}
        </div>
      `).join('')}
  </div>
  ` : ''}
  
  ${alertes.length > 0 ? `
  <div class="section">
    <h2>⚠️ Alertes importantes</h2>
    ${alertes.map((a: any) => `
      <div class="alerte-item">
        <strong>${a.contrat}</strong> - ${a.client}<br>
        <small>${a.message}</small>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>ERP Solaire Nettoyage - Génération automatique</p>
    <p>Durée d'exécution: ${rapport.dureeExecution}ms</p>
  </div>
</body>
</html>
  `.trim()
}
