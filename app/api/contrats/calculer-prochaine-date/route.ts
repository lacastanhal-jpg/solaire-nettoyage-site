/**
 * API ROUTE - CALCULER PROCHAINE DATE FACTURATION
 * Calcule la prochaine date de facturation pour un contrat
 * Endpoint: POST /api/contrats/calculer-prochaine-date
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculerProchaineDate, calculerCAEstime } from '@/lib/firebase/contrats-recurrents'
import type { FrequenceContrat } from '@/lib/types/contrats-recurrents'

export const runtime = 'nodejs'

/**
 * POST /api/contrats/calculer-prochaine-date
 * Calcule la prochaine date et le CA estimé
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dateActuelle,
      frequence,
      jourFacturation = 1,
      frequencePersonnalisee,
      montantFacturation = 0
    } = body
    
    // Validation
    if (!dateActuelle || !frequence) {
      return NextResponse.json(
        { error: 'Les champs dateActuelle et frequence sont requis' },
        { status: 400 }
      )
    }
    
    // Calculer prochaine date
    const prochaineDateFacturation = calculerProchaineDate(
      new Date(dateActuelle),
      frequence as FrequenceContrat,
      jourFacturation,
      frequencePersonnalisee
    )
    
    // Calculer CA annuel estimé
    let caAnnuelEstime = 0
    if (montantFacturation > 0) {
      let nombreFacturationsAnnuelles = 0
      
      switch (frequence) {
        case 'hebdomadaire':
          nombreFacturationsAnnuelles = 52
          break
        case 'bimensuel':
          nombreFacturationsAnnuelles = 24
          break
        case 'mensuel':
          nombreFacturationsAnnuelles = 12
          break
        case 'bimestriel':
          nombreFacturationsAnnuelles = 6
          break
        case 'trimestriel':
          nombreFacturationsAnnuelles = 4
          break
        case 'quadrimestriel':
          nombreFacturationsAnnuelles = 3
          break
        case 'semestriel':
          nombreFacturationsAnnuelles = 2
          break
        case 'annuel':
          nombreFacturationsAnnuelles = 1
          break
        case 'personnalise':
          if (frequencePersonnalisee?.nombreMois) {
            nombreFacturationsAnnuelles = 12 / frequencePersonnalisee.nombreMois
          } else if (frequencePersonnalisee?.nombreJours) {
            nombreFacturationsAnnuelles = 365 / frequencePersonnalisee.nombreJours
          }
          break
      }
      
      caAnnuelEstime = montantFacturation * nombreFacturationsAnnuelles
    }
    
    // Calculer les 12 prochaines dates
    const prochainsDates: Date[] = []
    let dateCourante = new Date(dateActuelle)
    
    for (let i = 0; i < 12; i++) {
      dateCourante = calculerProchaineDate(
        dateCourante,
        frequence as FrequenceContrat,
        jourFacturation,
        frequencePersonnalisee
      )
      prochainsDates.push(new Date(dateCourante))
    }
    
    return NextResponse.json({
      success: true,
      data: {
        prochaineDateFacturation,
        prochainsDates,
        caAnnuelEstime: Math.round(caAnnuelEstime * 100) / 100,
        nombreFacturationsAnnuelles: Math.round((caAnnuelEstime / (montantFacturation || 1)) * 10) / 10
      }
    })
    
  } catch (error: any) {
    console.error('Erreur calcul date:', error)
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: error.message
      },
      { status: 500 }
    )
  }
}
