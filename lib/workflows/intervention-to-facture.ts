import { 
  getPrestationByCode 
} from '@/lib/firebase/prestations-catalogue'
import { 
  getGrilleApplicable 
} from '@/lib/firebase/grilles-tarifaires'
import { 
  getTarifSpecialParSite 
} from '@/lib/firebase/tarifs-speciaux-sites'
import { 
  getInterventionCalendarById 
} from '@/lib/firebase/interventions-calendar'
import { 
  getSiteById 
} from '@/lib/firebase/sites'
import { 
  getClientById 
} from '@/lib/firebase/clients'
import { 
  generateFactureNumero,
  type Facture,
  type LigneFacture
} from '@/lib/firebase/factures'
import { 
  addDoc,
  collection,
  updateDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type {
  DetailCalculPrix,
  ElementCalcul,
  ResultatCalculPrix,
  TrancheSurface,
  LigneGrilleTarifaire
} from '@/lib/types/tarification'

/**
 * Calculer le prix pour une tranche de surface donnée
 */
function getPrixPourTranche(
  surface: number,
  tranches: TrancheSurface[]
): number {
  // Trier les tranches par min croissant
  const tranchesSorted = [...tranches].sort((a, b) => a.min - b.min)
  
  for (const tranche of tranchesSorted) {
    if (surface >= tranche.min && (tranche.max === null || surface <= tranche.max)) {
      return tranche.prix
    }
  }
  
  // Si aucune tranche trouvée, retourner le prix de la dernière tranche
  return tranchesSorted[tranchesSorted.length - 1]?.prix || 0
}

/**
 * Calculer le prix d'une intervention
 */
export async function calculerPrixIntervention(
  interventionId: string,
  prestationCode: string = 'NETT-STANDARD',
  majorationsCodes: string[] = [],
  remisesCodes: string[] = [],
  operateur: string = 'Système'
): Promise<ResultatCalculPrix> {
  try {
    // 1. Récupérer l'intervention
    const intervention = await getInterventionCalendarById(interventionId)
    if (!intervention) {
      throw new Error('Intervention non trouvée')
    }
    
    // 2. Récupérer le site
    const site = await getSiteById(intervention.siteId)
    if (!site) {
      throw new Error('Site non trouvé')
    }
    
    // 2b. Récupérer le client pour avoir le groupeId
    const client = await getClientById(intervention.clientId)
    if (!client) {
      throw new Error('Client non trouvé')
    }
    
    // 3. Récupérer la prestation
    const prestation = await getPrestationByCode(prestationCode)
    if (!prestation) {
      throw new Error(`Prestation ${prestationCode} non trouvée`)
    }
    
    // 4. Vérifier tarif spécial site (PRIORITÉ 1)
    const tarifSpecial = await getTarifSpecialParSite(
      intervention.siteId,
      intervention.dateDebut
    )
    
    if (tarifSpecial) {
      // Tarif spécial site trouvé
      return calculerAvecTarifSpecial(
        intervention,
        site,
        prestation,
        tarifSpecial,
        operateur
      )
    }
    
    // 5. Chercher grille tarifaire applicable
    const grille = await getGrilleApplicable(
      intervention.siteId,
      intervention.clientId,
      client.groupeId,
      intervention.dateDebut
    )
    
    if (!grille) {
      throw new Error('Aucune grille tarifaire applicable trouvée')
    }
    
    // 6. Trouver la ligne de grille pour cette prestation
    const ligneGrille = grille.lignes.find(
      (ligne: any) => ligne.prestationCode === prestationCode
    )
    
    if (!ligneGrille) {
      throw new Error(`Prestation ${prestationCode} non trouvée dans la grille ${grille.nom}`)
    }
    
    // 7. Calculer le prix
    return calculerAvecGrille(
      intervention,
      site,
      prestation,
      grille,
      ligneGrille,
      majorationsCodes,
      remisesCodes,
      operateur
    )
    
  } catch (error) {
    console.error('Erreur calcul prix intervention:', error)
    throw error
  }
}

/**
 * Calculer avec tarif spécial site
 */
async function calculerAvecTarifSpecial(
  intervention: any,
  site: any,
  prestation: any,
  tarifSpecial: any,
  operateur: string
): Promise<ResultatCalculPrix> {
  const elements: ElementCalcul[] = []
  
  // Forfait mensuel/annuel
  if (tarifSpecial.forfait) {
    const forfait = tarifSpecial.forfait
    let montantBase = forfait.montant
    
    elements.push({
      libelle: `Forfait ${forfait.type} - ${forfait.surfaceInclude} m² inclus`,
      montant: montantBase,
      type: 'base'
    })
    
    // Surface supplémentaire
    if (intervention.surface > forfait.surfaceInclude && forfait.prixSupplementaire) {
      const surfaceSupp = intervention.surface - forfait.surfaceInclude
      const montantSupp = surfaceSupp * forfait.prixSupplementaire
      
      elements.push({
        libelle: `Surface supplémentaire`,
        base: surfaceSupp,
        prix: forfait.prixSupplementaire,
        montant: montantSupp,
        type: 'base'
      })
      
      montantBase += montantSupp
    }
    
    const totalHT = montantBase
    const totalTVA = totalHT * (prestation.tauxTVA / 100)
    const totalTTC = totalHT + totalTVA
    
    const detail: DetailCalculPrix = {
      prestationCode: prestation.code,
      prestationLibelle: prestation.libelle,
      surface: intervention.surface,
      grilleId: `tarif-special-${tarifSpecial.id}`,
      grilleNom: `Tarif spécial site - ${tarifSpecial.siteNom}`,
      grillePriorite: 0,
      elements,
      totalHT,
      tauxTVA: prestation.tauxTVA,
      totalTVA,
      totalTTC,
      calculeLe: new Date().toISOString(),
      calculePar: operateur
    }
    
    return {
      detail,
      prixModifiable: true,
      messageInfo: `Tarif spécial appliqué pour ce site`
    }
  }
  
  // Tarifs fixes par prestation
  if (tarifSpecial.tarifsFixes) {
    const tarifFixe = tarifSpecial.tarifsFixes.find(
      (tf: any) => tf.prestationCode === prestation.code
    )
    
    if (tarifFixe) {
      const montantBase = tarifFixe.prixFixe * intervention.surface
      
      elements.push({
        libelle: `${prestation.libelle} - Tarif spécial`,
        base: intervention.surface,
        prix: tarifFixe.prixFixe,
        montant: montantBase,
        type: 'base'
      })
      
      const totalHT = montantBase
      const totalTVA = totalHT * (prestation.tauxTVA / 100)
      const totalTTC = totalHT + totalTVA
      
      const detail: DetailCalculPrix = {
        prestationCode: prestation.code,
        prestationLibelle: prestation.libelle,
        surface: intervention.surface,
        grilleId: `tarif-special-${tarifSpecial.id}`,
        grilleNom: `Tarif spécial site - ${tarifSpecial.siteNom}`,
        grillePriorite: 0,
        elements,
        totalHT,
        tauxTVA: prestation.tauxTVA,
        totalTVA,
        totalTTC,
        calculeLe: new Date().toISOString(),
        calculePar: operateur
      }
      
      return {
        detail,
        prixModifiable: true,
        messageInfo: `Prix fixe ${tarifFixe.prixFixe}€/m² - ${tarifFixe.motif}`
      }
    }
  }
  
  throw new Error('Tarif spécial invalide')
}

/**
 * Calculer avec grille tarifaire
 */
async function calculerAvecGrille(
  intervention: any,
  site: any,
  prestation: any,
  grille: any,
  ligneGrille: LigneGrilleTarifaire,
  majorationsCodes: string[],
  remisesCodes: string[],
  operateur: string
): Promise<ResultatCalculPrix> {
  const elements: ElementCalcul[] = []
  
  // 1. Prix de base
  let montantBase = 0
  
  if (ligneGrille.tarifForfaitaire !== undefined) {
    // Tarif forfaitaire
    montantBase = ligneGrille.tarifForfaitaire
    
    elements.push({
      libelle: `${prestation.libelle} - Forfait`,
      montant: montantBase,
      type: 'base'
    })
  } else {
    // Tarif par tranche de surface
    const prixUnitaire = getPrixPourTranche(intervention.surface, ligneGrille.tranchesSurface)
    montantBase = prixUnitaire * intervention.surface
    
    elements.push({
      libelle: `${prestation.libelle}`,
      base: intervention.surface,
      prix: prixUnitaire,
      montant: montantBase,
      type: 'base'
    })
  }
  
  let totalHT = montantBase
  
  // 2. Appliquer majorations
  for (const codeM of majorationsCodes) {
    const majoration = ligneGrille.majorations.find((m: any) => m.code === codeM)
    if (majoration) {
      let montantMajoration = 0
      
      if (majoration.type === 'taux') {
        montantMajoration = totalHT * (majoration.valeur / 100)
      } else {
        montantMajoration = majoration.valeur
      }
      
      elements.push({
        libelle: `${majoration.libelle} ${majoration.type === 'taux' ? `+${majoration.valeur}%` : `+${majoration.valeur}€`}`,
        montant: montantMajoration,
        type: 'majoration'
      })
      
      totalHT += montantMajoration
    }
  }
  
  // 3. Appliquer remises
  for (const codeR of remisesCodes) {
    const remise = ligneGrille.remises.find((r: any) => r.code === codeR)
    if (remise) {
      let montantRemise = 0
      
      if (remise.type === 'taux') {
        montantRemise = totalHT * (remise.valeur / 100)
      } else {
        montantRemise = remise.valeur
      }
      
      elements.push({
        libelle: `${remise.libelle} ${remise.type === 'taux' ? `-${remise.valeur}%` : `-${remise.valeur}€`}`,
        montant: -montantRemise,
        type: 'remise'
      })
      
      totalHT -= montantRemise
    }
  }
  
  // 4. Calcul TVA et TTC
  const totalTVA = totalHT * (prestation.tauxTVA / 100)
  const totalTTC = totalHT + totalTVA
  
  const detail: DetailCalculPrix = {
    prestationCode: prestation.code,
    prestationLibelle: prestation.libelle,
    surface: intervention.surface,
    grilleId: grille.id,
    grilleNom: grille.nom,
    grillePriorite: grille.priorite,
    elements,
    totalHT,
    tauxTVA: prestation.tauxTVA,
    totalTVA,
    totalTTC,
    calculeLe: new Date().toISOString(),
    calculePar: operateur
  }
  
  return {
    detail,
    prixModifiable: true,
    messageInfo: `Grille tarifaire "${grille.nom}" appliquée`
  }
}

/**
 * Générer une facture depuis une intervention
 */
export async function genererFactureFromIntervention(
  interventionId: string,
  detailCalcul: DetailCalculPrix,
  prixManuel?: number, // Si prix modifié manuellement
  lignesSupplementaires?: LigneFacture[],
  operateur: string = 'Admin'
): Promise<string> {
  try {
    // 1. Récupérer intervention
    const intervention = await getInterventionCalendarById(interventionId)
    if (!intervention) {
      throw new Error('Intervention non trouvée')
    }
    
    // Vérifier que pas déjà facturée
    if ((intervention as any).factureId) {
      throw new Error('Cette intervention est déjà facturée')
    }
    
    // 2. Récupérer site et client
    const site = await getSiteById(intervention.siteId)
    if (!site) {
      throw new Error('Site non trouvé')
    }
    
    const client = await getClientById(intervention.clientId)
    if (!client) {
      throw new Error('Client non trouvé')
    }
    
    // 3. Créer ligne facture principale
    const totalHT = prixManuel || detailCalcul.totalHT
    const totalTVA = totalHT * (detailCalcul.tauxTVA / 100)
    const totalTTC = totalHT + totalTVA
    
    const lignePrincipale: LigneFacture = {
      siteId: intervention.siteId,
      siteNom: site.nom,
      articleId: 'intervention',
      articleCode: detailCalcul.prestationCode,
      articleNom: detailCalcul.prestationLibelle,
      articleDescription: `${site.nom} - ${intervention.surface} m² - ${new Date(intervention.dateDebut).toLocaleDateString('fr-FR')}`,
      quantite: intervention.surface,
      prixUnitaire: totalHT / intervention.surface,
      tva: detailCalcul.tauxTVA,
      totalHT,
      totalTVA,
      totalTTC
    }
    
    const lignes = [lignePrincipale, ...(lignesSupplementaires || [])]
    
    // 4. Calculer totaux facture
    const factureTotalHT = lignes.reduce((sum, l) => sum + l.totalHT, 0)
    const factureTotalTVA = lignes.reduce((sum, l) => sum + l.totalTVA, 0)
    const factureTotalTTC = lignes.reduce((sum, l) => sum + l.totalTTC, 0)
    
    // 5. Générer numéro facture
    const numeroFacture = await generateFactureNumero(false)
    
    // 6. Créer facture
    const now = new Date()
    const dateEcheance = new Date(now)
    dateEcheance.setDate(dateEcheance.getDate() + 30) // Échéance 30 jours
    
    const facture: Omit<Facture, 'id'> = {
      numero: numeroFacture,
      societeId: 'solaire-nettoyage',
      date: now.toISOString().split('T')[0],
      dateEcheance: dateEcheance.toISOString().split('T')[0],
      clientId: intervention.clientId,
      clientNom: client.company,
      groupeNom: client.groupeId ? client.groupeNom : undefined,
      lignes,
      totalHT: factureTotalHT,
      totalTVA: factureTotalTVA,
      totalTTC: factureTotalTTC,
      resteAPayer: factureTotalTTC,
      paiements: [],
      relances: [],
      statut: 'brouillon',
      estAcompte: false,
      notes: `Facture générée automatiquement depuis intervention ${intervention.id}`,
      createdBy: operateur,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
    
    const factureRef = await addDoc(collection(db, 'factures'), facture)
    
    // 7. Lier intervention → facture
    await updateDoc(doc(db, 'interventions_calendar', interventionId), {
      factureId: factureRef.id,
      factureNumero: numeroFacture,
      factureLe: now.toISOString(),
      facturePar: operateur,
      detailCalculTarif: detailCalcul,
      updatedAt: now.toISOString()
    })
    
    return factureRef.id
    
  } catch (error) {
    console.error('Erreur génération facture:', error)
    throw error
  }
}
