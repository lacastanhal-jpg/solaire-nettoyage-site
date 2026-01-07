import { NextRequest, NextResponse } from 'next/server'
import { genererRelancesAutomatiques } from '@/lib/firebase/relances'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import type { ConfigurationRelances, HistoriqueRelance } from '@/lib/firebase/relances-types'

/**
 * GET /api/cron/relances-quotidiennes
 * Cron job exécuté chaque jour à 8h00 (heure de Paris)
 * Vercel Cron : 0 7 * * 1-5 (Lun-Ven, UTC)
 * 
 * Workflow:
 * 1. Vérifier que c'est un jour ouvré (pas week-end, pas férié)
 * 2. Générer toutes les relances nécessaires
 * 3. Envoyer automatiquement les relances configurées pour envoi auto
 * 4. Logger les résultats
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron (Vercel envoie un header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cron Relances] Authentification échouée')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('[Cron Relances] ======================================')
    console.log('[Cron Relances] Démarrage du job quotidien')
    console.log('[Cron Relances] Date:', new Date().toISOString())
    console.log('[Cron Relances] ======================================')
    
    const startTime = Date.now()
    
    // ÉTAPE 1 : Vérifier jour ouvré
    const maintenant = new Date()
    const jourSemaine = maintenant.getDay() // 0=Dimanche, 1=Lundi, ..., 6=Samedi
    const dateStr = maintenant.toISOString().split('T')[0]
    
    // Récupérer config
    const configDoc = await getDoc(doc(db, 'relances_config', 'global'))
    const config = configDoc.data() as ConfigurationRelances
    
    // Vérifier jour férié
    if (config.joursFeries && config.joursFeries.includes(dateStr)) {
      console.log('[Cron Relances] ⚠️ Jour férié détecté, arrêt du job')
      return NextResponse.json({
        success: true,
        message: 'Jour férié - pas d\'envoi',
        skipped: true
      })
    }
    
    // Vérifier jour de la semaine
    const joursOuvres = config.joursEnvoi || [1, 2, 3, 4, 5] // Lun-Ven par défaut
    if (!joursOuvres.includes(jourSemaine)) {
      console.log('[Cron Relances] ⚠️ Jour non ouvré (week-end), arrêt du job')
      return NextResponse.json({
        success: true,
        message: 'Week-end - pas d\'envoi',
        skipped: true
      })
    }
    
    console.log('[Cron Relances] ✓ Jour ouvré OK')
    
    // ÉTAPE 2 : Générer les relances
    console.log('[Cron Relances] ÉTAPE 1 : Génération des relances...')
    const generationResult = await genererRelancesAutomatiques()
    
    if (!generationResult.success) {
      console.error('[Cron Relances] Échec génération:', generationResult.erreurs.join(', '))
      return NextResponse.json({
        success: false,
        error: generationResult.erreurs.join(', '),
        erreurs: generationResult.erreurs
      }, { status: 500 })
    }
    
    console.log(`[Cron Relances] ✓ ${generationResult.relancesGenerees?.length || 0} relance(s) générée(s)`)
    
    // ÉTAPE 3 : Récupérer relances à envoyer automatiquement
    console.log('[Cron Relances] ÉTAPE 2 : Envoi automatique des relances...')
    
    const relancesRef = collection(db, 'relances_historique')
    const qRelances = query(
      relancesRef,
      where('statut', 'in', ['planifiee', 'en_attente'])
    )
    const snapshot = await getDocs(qRelances)
    
    const relancesAEnvoyer: HistoriqueRelance[] = []
    snapshot.forEach(doc => {
      const relance = { id: doc.id, ...doc.data() } as HistoriqueRelance
      
      // Vérifier si envoi auto activé selon le type
      let envoiAuto = false
      if (relance.type === 'rappel_amiable' && config.envoyerRappelAmiableAuto) {
        envoiAuto = true
      } else if (relance.type === 'relance_ferme' && config.envoyerRelanceFermeAuto) {
        envoiAuto = true
      } else if (relance.type === 'mise_en_demeure' && config.envoyerMiseEnDemeureAuto) {
        envoiAuto = true
      }
      // Contentieux toujours manuel
      
      if (envoiAuto) {
        relancesAEnvoyer.push(relance)
      }
    })
    
    console.log(`[Cron Relances] ${relancesAEnvoyer.length} relance(s) à envoyer automatiquement`)
    
    // ÉTAPE 4 : Envoyer les relances via API route
    const envoisReussis: string[] = []
    const envoisEchoues: Array<{ id: string; erreur: string }> = []
    
    // Récupérer l'URL de base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    for (const relance of relancesAEnvoyer) {
      try {
        console.log(`[Cron Relances] Envoi relance ${relance.id} à ${relance.clientEmail}...`)
        
        // Appeler l'API route envoyer
        const response = await fetch(`${baseUrl}/api/relances/envoyer/${relance.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: 'cron-job' })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }
        
        const result = await response.json()
        console.log(`[Cron Relances] ✓ Envoi réussi : ${result.emailId}`)
        envoisReussis.push(relance.id)
        
        // Pause de 500ms entre chaque envoi (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error: any) {
        console.error(`[Cron Relances] ✗ Échec envoi ${relance.id}:`, error.message)
        envoisEchoues.push({
          id: relance.id,
          erreur: error.message
        })
      }
    }
    
    // ÉTAPE 5 : Relances en attente validation manuelle
    const relancesValidationManuelle = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as HistoriqueRelance))
      .filter(r => 
        (r.type === 'mise_en_demeure' && !config.envoyerMiseEnDemeureAuto) ||
        r.type === 'contentieux'
      )
    
    console.log(`[Cron Relances] ${relancesValidationManuelle.length} relance(s) en attente de validation manuelle`)
    
    // RÉSUMÉ
    const duration = Date.now() - startTime
    
    console.log('[Cron Relances] ======================================')
    console.log('[Cron Relances] RÉSUMÉ :')
    console.log(`[Cron Relances] - Générées : ${generationResult.relancesGenerees?.length || 0}`)
    console.log(`[Cron Relances] - Envoyées : ${envoisReussis.length}`)
    console.log(`[Cron Relances] - Échecs : ${envoisEchoues.length}`)
    console.log(`[Cron Relances] - Validation manuelle : ${relancesValidationManuelle.length}`)
    console.log(`[Cron Relances] - Durée : ${Math.round(duration / 1000)}s`)
    console.log('[Cron Relances] ======================================')
    
    return NextResponse.json({
      success: true,
      stats: {
        generees: generationResult.relancesGenerees?.length || 0,
        envoyees: envoisReussis.length,
        echecs: envoisEchoues.length,
        validationManuelle: relancesValidationManuelle.length,
        duree: `${Math.round(duration / 1000)}s`
      },
      details: {
        envoisReussis,
        envoisEchoues,
        relancesValidationManuelle: relancesValidationManuelle.map(r => ({
          id: r.id,
          type: r.type,
          client: r.clientNom,
          facture: r.factureNumero
        }))
      }
    })
    
  } catch (error: any) {
    console.error('[Cron Relances] ✗ Erreur fatale:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// Supporter aussi POST pour tests manuels
export async function POST(request: NextRequest) {
  return GET(request)
}
