import { NextRequest, NextResponse } from 'next/server'
import { genererRelancesAutomatiques } from '@/lib/firebase/relances'

/**
 * POST /api/relances/generer
 * Génère les relances pour toutes les factures impayées
 * Peut être appelé manuellement ou par le cron
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API Relances] Démarrage génération relances...')
    
    // Générer toutes les relances
    const resultat = await genererRelancesAutomatiques()
    
    console.log('[API Relances] Génération terminée:', {
      success: resultat.success,
      nombreRelances: resultat.nombreRelancesGenerees,
      erreurs: resultat.erreurs.length
    })
    
    return NextResponse.json({
      success: resultat.success,
      message: `${resultat.nombreRelancesGenerees} relance(s) générée(s)`,
      data: {
        nombreRelances: resultat.nombreRelancesGenerees,
        relances: resultat.relancesGenerees.map(r => ({
          id: r.id,
          type: r.type,
          clientNom: r.clientNom,
          factureNumero: r.factureNumero,
          montant: r.factureResteAPayer
        })),
        erreurs: resultat.erreurs
      }
    })
  } catch (error: any) {
    console.error('[API Relances] Erreur génération:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
