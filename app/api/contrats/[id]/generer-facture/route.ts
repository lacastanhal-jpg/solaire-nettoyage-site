/**
 * API ROUTE - GÉNÉRATION MANUELLE FACTURE
 * Permet de générer une facture manuellement pour un contrat
 * Endpoint: POST /api/contrats/[id]/generer-facture
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  genererFactureDepuisContrat,
  getContratById
} from '@/lib/firebase/contrats-recurrents'

export const runtime = 'nodejs'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/contrats/[id]/generer-facture
 * Génère une facture manuellement pour un contrat
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    
    // Vérifier que le contrat existe
    const contrat = await getContratById(id)
    if (!contrat) {
      return NextResponse.json(
        { error: 'Contrat non trouvé' },
        { status: 404 }
      )
    }
    
    // Récupérer les options depuis le body
    const body = await request.json()
    const {
      dateFacturation,
      genereePar = 'Manuel',
      forcer = false,
      envoyerEmail = false,
      validerAutomatiquement = true,
      ajustementPonctuel,
      noteFacturation
    } = body
    
    // Validation
    if (!genereePar) {
      return NextResponse.json(
        { error: 'Le champ genereePar est requis' },
        { status: 400 }
      )
    }
    
    // Générer la facture
    const resultat = await genererFactureDepuisContrat({
      contratId: id,
      dateFacturation: dateFacturation ? new Date(dateFacturation) : undefined,
      genereePar,
      forcer,
      envoyerEmail,
      validerAutomatiquement,
      ajustementPonctuel,
      noteFacturation
    })
    
    if (!resultat.success) {
      return NextResponse.json(
        {
          error: 'Échec de la génération',
          details: resultat.erreur
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Facture générée avec succès',
      data: {
        factureId: resultat.factureId,
        factureNumero: resultat.factureNumero,
        montant: resultat.montantGenere,
        prochaineDateFacturation: resultat.prochaineDateFacturation
      },
      actions: resultat.actions
    })
    
  } catch (error: any) {
    console.error('Erreur génération facture:', error)
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error.message
      },
      { status: 500 }
    )
  }
}
