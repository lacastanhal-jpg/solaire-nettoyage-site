/**
 * BACKEND CONTRATS RÉCURRENTS - VERSION PROFESSIONNELLE ENTERPRISE
 * Gestion complète des contrats de facturation automatique
 * Créé : 6 Janvier 2026
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  runTransaction,
  writeBatch
} from 'firebase/firestore'
import { db } from './config'
import type {
  ContratRecurrent,
  FrequenceContrat,
  StatutContrat,
  LigneContrat,
  HistoriqueFacturation,
  StatistiquesContrats,
  PrevisionFacturation,
  AlerteContrat,
  OptionsGenerationFacture,
  ResultatGenerationFacture,
  ValidationContrat
} from '@/lib/types/contrats-recurrents'
import { createFacture } from './factures'
// NOTE: PDF et Email seront implémentés en Phase 2
// import { genererPDFFacture } from '@/lib/utils/facture-pdf'
// import { envoyerEmailFacture } from '@/lib/utils/facture-emails'

const COLLECTION = 'contrats_recurrents'

// ============================================================================
// FONCTIONS DE GÉNÉRATION NUMÉROS
// ============================================================================

/**
 * Génère un numéro de contrat unique
 * Format: CTR-YYYY-NNNN
 */
export async function genererNumeroContrat(): Promise<string> {
  const annee = new Date().getFullYear()
  const prefixe = `CTR-${annee}-`
  
  const q = query(
    collection(db, COLLECTION),
    where('numero', '>=', prefixe),
    where('numero', '<=', prefixe + '\uf8ff'),
    orderBy('numero', 'desc'),
    limit(1)
  )
  
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return `${prefixe}0001`
  }
  
  const dernierNumero = snapshot.docs[0].data().numero
  const dernierIncrement = parseInt(dernierNumero.split('-')[2])
  const nouveauIncrement = (dernierIncrement + 1).toString().padStart(4, '0')
  
  return `${prefixe}${nouveauIncrement}`
}

// ============================================================================
// CALCUL DATES & RÉCURRENCE
// ============================================================================

/**
 * Calcule la prochaine date de facturation selon la fréquence
 */
export function calculerProchaineDate(
  dateActuelle: Date,
  frequence: FrequenceContrat,
  jourFacturation: number,
  frequencePersonnalisee?: { nombreJours?: number; nombreMois?: number }
): Date {
  let prochaine = new Date(dateActuelle)
  
  switch (frequence) {
    case 'hebdomadaire':
      prochaine.setDate(prochaine.getDate() + 7)
      break
      
    case 'bimensuel':
      prochaine.setDate(prochaine.getDate() + 15)
      break
      
    case 'mensuel':
      prochaine.setMonth(prochaine.getMonth() + 1)
      break
      
    case 'bimestriel':
      prochaine.setMonth(prochaine.getMonth() + 2)
      break
      
    case 'trimestriel':
      prochaine.setMonth(prochaine.getMonth() + 3)
      break
      
    case 'quadrimestriel':
      prochaine.setMonth(prochaine.getMonth() + 4)
      break
      
    case 'semestriel':
      prochaine.setMonth(prochaine.getMonth() + 6)
      break
      
    case 'annuel':
      prochaine.setFullYear(prochaine.getFullYear() + 1)
      break
      
    case 'personnalise':
      if (frequencePersonnalisee?.nombreJours) {
        prochaine.setDate(prochaine.getDate() + frequencePersonnalisee.nombreJours)
      } else if (frequencePersonnalisee?.nombreMois) {
        prochaine.setMonth(prochaine.getMonth() + frequencePersonnalisee.nombreMois)
      }
      break
  }
  
  // Ajuster au jour de facturation souhaité (sauf hebdomadaire)
  if (frequence !== 'hebdomadaire' && frequence !== 'bimensuel') {
    prochaine.setDate(Math.min(jourFacturation, getDaysInMonth(prochaine)))
  }
  
  return prochaine
}

/**
 * Obtient le nombre de jours dans un mois
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Calcule le CA annuel estimé d'un contrat
 */
export function calculerCAEstime(contrat: ContratRecurrent): number {
  const montantParFacturation = contrat.totalHT
  
  let nombreFacturationsAnnuelles = 0
  
  switch (contrat.frequence) {
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
      if (contrat.frequencePersonnalisee?.nombreMois) {
        nombreFacturationsAnnuelles = 12 / contrat.frequencePersonnalisee.nombreMois
      } else if (contrat.frequencePersonnalisee?.nombreJours) {
        nombreFacturationsAnnuelles = 365 / contrat.frequencePersonnalisee.nombreJours
      }
      break
  }
  
  return montantParFacturation * nombreFacturationsAnnuelles
}

// ============================================================================
// CRUD CONTRATS
// ============================================================================

/**
 * Créer un nouveau contrat récurrent
 */
export async function createContratRecurrent(
  data: Omit<ContratRecurrent, 'id' | 'numero' | 'createdAt' | 'updatedAt'>
): Promise<ContratRecurrent> {
  try {
    // Générer numéro unique
    const numero = await genererNumeroContrat()
    
    // Calculer montants totaux
    const { totalHT, totalTVA, totalTTC } = calculerMontantsContrat(data.lignes)
    
    // Calculer CA annuel estimé
    const caAnnuelEstime = calculerCAEstime({
      ...data,
      totalHT,
      frequence: data.frequence
    } as ContratRecurrent)
    
    // Calculer prochaine date si pas fournie
    const prochaineDateFacturation = data.prochaineDateFacturation || calculerProchaineDate(
      data.dateDebut,
      data.frequence,
      data.jourFacturation,
      data.frequencePersonnalisee
    )
    
    const contrat: Omit<ContratRecurrent, 'id'> = {
      ...data,
      numero,
      totalHT,
      totalTVA,
      totalTTC,
      caAnnuelEstime,
      caRealiseCumule: 0,
      nombreFacturesGenerees: 0,
      prochaineDateFacturation,
      facturesGenerees: [],
      historiqueModifications: [{
        date: new Date(),
        utilisateur: data.createdBy,
        action: 'creation',
        details: 'Création du contrat',
        nouvellesValeurs: data
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...contrat,
      dateDebut: Timestamp.fromDate(contrat.dateDebut),
      dateFin: contrat.dateFin ? Timestamp.fromDate(contrat.dateFin) : null,
      prochaineDateFacturation: Timestamp.fromDate(contrat.prochaineDateFacturation),
      createdAt: Timestamp.fromDate(contrat.createdAt),
      updatedAt: Timestamp.fromDate(contrat.updatedAt)
    })
    
    return {
      ...contrat,
      id: docRef.id
    }
  } catch (error) {
    console.error('Erreur création contrat:', error)
    throw error
  }
}

/**
 * Calcule les montants totaux d'un contrat
 */
function calculerMontantsContrat(lignes: LigneContrat[]): {
  totalHT: number
  totalTVA: number
  totalTTC: number
} {
  let totalHT = 0
  let totalTVA = 0
  
  lignes.forEach(ligne => {
    totalHT += ligne.montantHT
    totalTVA += ligne.montantTVA
  })
  
  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round((totalHT + totalTVA) * 100) / 100
  }
}

/**
 * Récupérer un contrat par son ID
 */
export async function getContratById(id: string): Promise<ContratRecurrent | null> {
  try {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    const data = docSnap.data()
    
    return {
      id: docSnap.id,
      ...data,
      dateDebut: data.dateDebut.toDate(),
      dateFin: data.dateFin?.toDate() || null,
      prochaineDateFacturation: data.prochaineDateFacturation.toDate(),
      derniereDateFacturation: data.derniereDateFacturation?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as ContratRecurrent
  } catch (error) {
    console.error('Erreur récupération contrat:', error)
    throw error
  }
}

/**
 * Récupérer tous les contrats
 */
export async function getAllContrats(filtres?: {
  statut?: StatutContrat
  clientId?: string
  societeId?: string
}): Promise<ContratRecurrent[]> {
  try {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    
    if (filtres?.statut) {
      q = query(q, where('statut', '==', filtres.statut))
    }
    if (filtres?.clientId) {
      q = query(q, where('clientId', '==', filtres.clientId))
    }
    if (filtres?.societeId) {
      q = query(q, where('societeId', '==', filtres.societeId))
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        dateDebut: data.dateDebut.toDate(),
        dateFin: data.dateFin?.toDate() || null,
        prochaineDateFacturation: data.prochaineDateFacturation.toDate(),
        derniereDateFacturation: data.derniereDateFacturation?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as ContratRecurrent
    })
  } catch (error) {
    console.error('Erreur récupération contrats:', error)
    throw error
  }
}

/**
 * Récupérer les contrats actifs
 */
export async function getContratsActifs(): Promise<ContratRecurrent[]> {
  return getAllContrats({ statut: 'actif' })
}

/**
 * Récupérer les contrats à facturer aujourdhui
 */
export async function getContratsAFacturerAujourdhui(): Promise<ContratRecurrent[]> {
  try {
    const aujourdhui = new Date()
    aujourdhui.setHours(0, 0, 0, 0)
    
    const demain = new Date(aujourdhui)
    demain.setDate(demain.getDate() + 1)
    
    const q = query(
      collection(db, COLLECTION),
      where('statut', '==', 'actif'),
      where('prochaineDateFacturation', '>=', Timestamp.fromDate(aujourdhui)),
      where('prochaineDateFacturation', '<', Timestamp.fromDate(demain))
    )
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        dateDebut: data.dateDebut.toDate(),
        dateFin: data.dateFin?.toDate() || null,
        prochaineDateFacturation: data.prochaineDateFacturation.toDate(),
        derniereDateFacturation: data.derniereDateFacturation?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as ContratRecurrent
    })
  } catch (error) {
    console.error('Erreur récupération contrats à facturer:', error)
    throw error
  }
}

/**
 * Mettre à jour un contrat
 */
export async function updateContrat(
  id: string,
  updates: Partial<ContratRecurrent>,
  utilisateur: string
): Promise<void> {
  try {
    const contratActuel = await getContratById(id)
    if (!contratActuel) {
      throw new Error('Contrat non trouvé')
    }
    
    // Historique modification
    const nouvelleModification = {
      date: new Date(),
      utilisateur,
      action: 'modification',
      details: 'Modification du contrat',
      anciennesValeurs: contratActuel,
      nouvellesValeurs: updates
    }
    
    const historiqueModifications = [
      ...(contratActuel.historiqueModifications || []),
      nouvelleModification
    ]
    
    const docRef = doc(db, COLLECTION, id)
    await updateDoc(docRef, {
      ...updates,
      historiqueModifications,
      updatedAt: Timestamp.fromDate(new Date()),
      updatedBy: utilisateur
    })
  } catch (error) {
    console.error('Erreur mise à jour contrat:', error)
    throw error
  }
}

/**
 * Suspendre un contrat
 */
export async function suspendreContrat(
  id: string,
  raison: string,
  utilisateur: string
): Promise<void> {
  await updateContrat(id, {
    statut: 'suspendu',
    raisonSuspension: raison,
    dateSuspension: new Date()
  }, utilisateur)
}

/**
 * Réactiver un contrat suspendu
 */
export async function reactiverContrat(
  id: string,
  utilisateur: string
): Promise<void> {
  await updateContrat(id, {
    statut: 'actif',
    raisonSuspension: undefined,
    dateSuspension: undefined
  }, utilisateur)
}

/**
 * Résilier un contrat
 */
export async function resilierContrat(
  id: string,
  raison: string,
  utilisateur: string
): Promise<void> {
  await updateContrat(id, {
    statut: 'resilie',
    raisonResiliation: raison,
    dateResiliation: new Date()
  }, utilisateur)
}

/**
 * Supprimer un contrat (soft delete - passe en statut terminé)
 */
export async function deleteContrat(id: string, utilisateur: string): Promise<void> {
  await updateContrat(id, {
    statut: 'termine'
  }, utilisateur)
}

// ============================================================================
// GÉNÉRATION FACTURES
// ============================================================================

/**
 * Générer une facture à partir d'un contrat
 */
export async function genererFactureDepuisContrat(
  options: OptionsGenerationFacture
): Promise<ResultatGenerationFacture> {
  const actions: Array<{ type: string; description: string; timestamp: Date }> = []
  
  try {
    actions.push({
      type: 'debut',
      description: 'Début génération facture',
      timestamp: new Date()
    })
    
    // Récupérer le contrat
    const contrat = await getContratById(options.contratId)
    if (!contrat) {
      throw new Error('Contrat non trouvé')
    }
    
    actions.push({
      type: 'contrat_charge',
      description: `Contrat ${contrat.numero} chargé`,
      timestamp: new Date()
    })
    
    // Vérifier que le contrat est actif
    if (contrat.statut !== 'actif' && !options.forcer) {
      throw new Error(`Contrat non actif (statut: ${contrat.statut})`)
    }
    
    // Vérifier la date si pas forcé
    const aujourdhui = new Date()
    aujourdhui.setHours(0, 0, 0, 0)
    const dateFacturation = options.dateFacturation || aujourdhui
    
    if (!options.forcer && dateFacturation > contrat.prochaineDateFacturation) {
      throw new Error('Date de facturation non atteinte')
    }
    
    // Créer les lignes de facture avec tous les champs requis
    let lignesFacture: any[] = contrat.lignes.map(ligne => {
      const montantHT = ligne.prixUnitaireHT * ligne.quantite
      const montantTVA = montantHT * (ligne.tauxTVA / 100)
      const montantTTC = montantHT + montantTVA
      
      return {
        siteId: ligne.siteId,
        siteNom: ligne.siteNom || '',
        articleId: ligne.articleId,
        articleCode: ligne.articleCode || '',
        articleNom: ligne.articleNom || '',
        articleDescription: ligne.description,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaireHT,
        tva: ligne.tauxTVA,
        totalHT: montantHT,
        totalTVA: montantTVA,
        totalTTC: montantTTC
      }
    })
    
    // Appliquer ajustement ponctuel si nécessaire
    if (options.ajustementPonctuel) {
      lignesFacture = lignesFacture.map(ligne => {
        let nouveauPrix = ligne.prixUnitaire
        
        if (options.ajustementPonctuel!.type === 'pourcentage') {
          nouveauPrix *= (1 + options.ajustementPonctuel!.valeur / 100)
        } else {
          nouveauPrix += options.ajustementPonctuel!.valeur
        }
        
        nouveauPrix = Math.round(nouveauPrix * 100) / 100
        const montantHT = nouveauPrix * ligne.quantite
        const montantTVA = montantHT * (ligne.tva / 100)
        const montantTTC = montantHT + montantTVA
        
        return {
          ...ligne,
          prixUnitaire: nouveauPrix,
          totalHT: montantHT,
          totalTVA: montantTVA,
          totalTTC: montantTTC
        }
      })
      
      actions.push({
        type: 'ajustement_applique',
        description: `Ajustement ponctuel appliqué: ${options.ajustementPonctuel.raison}`,
        timestamp: new Date()
      })
    }
    
    // Créer la facture avec les champs corrects
    const facture = await createFacture({
      societeId: contrat.societeId,
      clientId: contrat.clientId,
      clientNom: contrat.clientNom || '',
      groupeNom: contrat.groupeNom,
      
      date: dateFacturation.toISOString().split('T')[0],  // Date de facturation du contrat
      dateEcheance: new Date(dateFacturation.getTime() + contrat.conditionsPaiement.delaiJours * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      lignes: lignesFacture,
      
      conditionsPaiement: `${contrat.conditionsPaiement.delaiJours} jours`,
      modalitesReglement: contrat.conditionsPaiement.modePaiement,
      
      statut: options.validerAutomatiquement ? 'envoyee' : 'brouillon',
      
      notes: `Facture générée automatiquement depuis le contrat récurrent ${contrat.numero}${options.noteFacturation ? '\n\n' + options.noteFacturation : ''}`
    })
    
    actions.push({
      type: 'facture_creee',
      description: `Facture ${facture.numero} créée`,
      timestamp: new Date()
    })
    
    // TODO Phase 2: Générer PDF automatiquement
    // await genererPDFFacture(facture.id)
    
    actions.push({
      type: 'pdf_a_generer',
      description: 'PDF à générer manuellement (Phase 2)',
      timestamp: new Date()
    })
    
    // Envoyer email si demandé
    if (options.envoyerEmail) {
      // TODO Phase 2: Envoi email automatique
      // await envoyerEmailFacture(facture.id)
      
      actions.push({
        type: 'email_a_envoyer',
        description: 'Email à envoyer manuellement (Phase 2)',
        timestamp: new Date()
      })
    }
    
    // Calculer prochaine date de facturation
    const prochaineDateFacturation = calculerProchaineDate(
      dateFacturation,
      contrat.frequence,
      contrat.jourFacturation,
      contrat.frequencePersonnalisee
    )
    
    // Mettre à jour le contrat
    const historiqueFacturation: HistoriqueFacturation = {
      factureId: facture.id,
      numero: facture.numero,
      date: dateFacturation,
      dateEcheance: new Date(facture.dateEcheance),
      montantHT: facture.totalHT,
      montantTTC: facture.totalTTC,
      statut: facture.statut,
      methodeGeneration: options.forcer ? 'manuelle' : 'automatique',
      genereePar: options.genereePar,
      noteFacturation: options.noteFacturation
    }
    
    await runTransaction(db, async (transaction) => {
      const contratRef = doc(db, COLLECTION, contrat.id)
      
      transaction.update(contratRef, {
        prochaineDateFacturation: Timestamp.fromDate(prochaineDateFacturation),
        derniereDateFacturation: Timestamp.fromDate(dateFacturation),
        nombreFacturesGenerees: (contrat.nombreFacturesGenerees || 0) + 1,
        caRealiseCumule: (contrat.caRealiseCumule || 0) + facture.totalHT,
        facturesGenerees: [...contrat.facturesGenerees, historiqueFacturation],
        updatedAt: Timestamp.fromDate(new Date())
      })
    })
    
    actions.push({
      type: 'contrat_mis_a_jour',
      description: `Prochaine facturation: ${prochaineDateFacturation.toLocaleDateString('fr-FR')}`,
      timestamp: new Date()
    })
    
    return {
      success: true,
      factureId: facture.id,
      factureNumero: facture.numero,
      montantGenere: facture.totalHT,
      prochaineDateFacturation,
      actions
    }
    
  } catch (error: any) {
    actions.push({
      type: 'erreur',
      description: error.message,
      timestamp: new Date()
    })
    
    return {
      success: false,
      erreur: {
        code: 'GENERATION_FAILED',
        message: error.message,
        details: error
      },
      actions
    }
  }
}

/**
 * Générer toutes les factures dues aujourdhui
 */
export async function genererFacturesDuJour(genereePar: string): Promise<{
  nombreGenerees: number
  nombreEchecs: number
  resultats: ResultatGenerationFacture[]
}> {
  try {
    const contratsAFacturer = await getContratsAFacturerAujourdhui()
    
    const resultats: ResultatGenerationFacture[] = []
    let nombreGenerees = 0
    let nombreEchecs = 0
    
    for (const contrat of contratsAFacturer) {
      const resultat = await genererFactureDepuisContrat({
        contratId: contrat.id,
        genereePar,
        envoyerEmail: contrat.options?.envoyerEmailAuto || false,
        validerAutomatiquement: !contrat.options?.validationManuelle
      })
      
      resultats.push(resultat)
      
      if (resultat.success) {
        nombreGenerees++
      } else {
        nombreEchecs++
      }
    }
    
    return {
      nombreGenerees,
      nombreEchecs,
      resultats
    }
  } catch (error) {
    console.error('Erreur génération factures du jour:', error)
    throw error
  }
}

// ============================================================================
// STATISTIQUES & ANALYTICS
// ============================================================================

/**
 * Obtenir les statistiques globales des contrats
 */
export async function getStatistiquesContrats(): Promise<StatistiquesContrats> {
  try {
    const contrats = await getAllContrats()
    
    // Compteurs par statut
    const nombreTotal = contrats.length
    const nombreActifs = contrats.filter(c => c.statut === 'actif').length
    const nombreSuspendus = contrats.filter(c => c.statut === 'suspendu').length
    const nombreExpires = contrats.filter(c => c.statut === 'expire').length
    const nombreResilies = contrats.filter(c => c.statut === 'resilie').length
    
    // Répartition par fréquence
    const repartitionFrequence: Record<FrequenceContrat, number> = {
      hebdomadaire: 0,
      bimensuel: 0,
      mensuel: 0,
      bimestriel: 0,
      trimestriel: 0,
      quadrimestriel: 0,
      semestriel: 0,
      annuel: 0,
      personnalise: 0
    }
    
    contrats.forEach(c => {
      repartitionFrequence[c.frequence]++
    })
    
    // Calculs financiers
    const contratsActifs = contrats.filter(c => c.statut === 'actif')
    
    const caRecurrentAnnuel = contratsActifs.reduce((sum, c) => sum + c.caAnnuelEstime, 0)
    const caRecurrentMensuel = caRecurrentAnnuel / 12
    
    const moyenneMontantContrat = contratsActifs.length > 0
      ? caRecurrentAnnuel / contratsActifs.length
      : 0
    
    const montantTotalContrats = contratsActifs.reduce((sum, c) => sum + c.totalHT, 0)
    
    // CA réalisé
    const maintenant = new Date()
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
    const debutAnnee = new Date(maintenant.getFullYear(), 0, 1)
    
    let caRealiseMoisActuel = 0
    let caRealiseAnneeActuelle = 0
    let nombreFacturesGenereesMois = 0
    
    contrats.forEach(c => {
      c.facturesGenerees?.forEach(f => {
        if (f.date >= debutMois) {
          caRealiseMoisActuel += f.montantHT
          nombreFacturesGenereesMois++
        }
        if (f.date >= debutAnnee) {
          caRealiseAnneeActuelle += f.montantHT
        }
      })
    })
    
    // Mois précédent pour évolution
    const debutMoisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1)
    const finMoisPrecedent = new Date(maintenant.getFullYear(), maintenant.getMonth(), 0)
    
    let nombreFacturesGenereesMoisPrecedent = 0
    contrats.forEach(c => {
      c.facturesGenerees?.forEach(f => {
        if (f.date >= debutMoisPrecedent && f.date <= finMoisPrecedent) {
          nombreFacturesGenereesMoisPrecedent++
        }
      })
    })
    
    const evolutionFactures = nombreFacturesGenereesMoisPrecedent > 0
      ? ((nombreFacturesGenereesMois - nombreFacturesGenereesMoisPrecedent) / nombreFacturesGenereesMoisPrecedent) * 100
      : 0
    
    // Prochaines générations
    const dans7Jours = new Date()
    dans7Jours.setDate(dans7Jours.getDate() + 7)
    
    const dans30Jours = new Date()
    dans30Jours.setDate(dans30Jours.getDate() + 30)
    
    const nombreGenerationsProchains7Jours = contratsActifs.filter(
      c => c.prochaineDateFacturation <= dans7Jours
    ).length
    
    const nombreGenerationsProchains30Jours = contratsActifs.filter(
      c => c.prochaineDateFacturation <= dans30Jours
    ).length
    
    // Performance paiement
    let totalPaiements = 0
    let totalDelaiPaiement = 0
    let nombrePaiements = 0
    let nombreEnRetard = 0
    let montantImpayeTotal = 0
    
    contrats.forEach(c => {
      c.facturesGenerees?.forEach(f => {
        if (f.statut === 'payee' && f.datePaiement) {
          nombrePaiements++
          const delai = Math.floor((f.datePaiement.getTime() - f.date.getTime()) / (1000 * 60 * 60 * 24))
          totalDelaiPaiement += delai
          totalPaiements += f.montantHT
        } else if (f.statut === 'en_retard') {
          nombreEnRetard++
          montantImpayeTotal += f.montantHT
        }
      })
    })
    
    const tauxPaiementMoyen = totalPaiements > 0
      ? (totalPaiements / (totalPaiements + montantImpayeTotal)) * 100
      : 100
    
    const delaiMoyenPaiement = nombrePaiements > 0
      ? Math.round(totalDelaiPaiement / nombrePaiements)
      : 0
    
    // Contrats proche de la fin
    const dans90Jours = new Date()
    dans90Jours.setDate(dans90Jours.getDate() + 90)
    
    const nombreContratsFinProche = contratsActifs.filter(
      c => c.dateFin && c.dateFin <= dans90Jours
    ).length
    
    // Top clients
    const clientsCA: Record<string, { nom: string; nombre: number; ca: number }> = {}
    
    contratsActifs.forEach(c => {
      if (!clientsCA[c.clientId]) {
        clientsCA[c.clientId] = {
          nom: c.clientNom || 'Client inconnu',
          nombre: 0,
          ca: 0
        }
      }
      clientsCA[c.clientId].nombre++
      clientsCA[c.clientId].ca += c.caAnnuelEstime
    })
    
    const topClients = Object.entries(clientsCA)
      .map(([id, data]) => ({
        clientId: id,
        clientNom: data.nom,
        nombreContrats: data.nombre,
        caRecurrentAnnuel: data.ca
      }))
      .sort((a, b) => b.caRecurrentAnnuel - a.caRecurrentAnnuel)
      .slice(0, 10)
    
    // Répartition par société
    const repartitionParSociete: Record<string, { nombre: number; caAnnuel: number }> = {}
    
    contratsActifs.forEach(c => {
      if (!repartitionParSociete[c.societeId]) {
        repartitionParSociete[c.societeId] = { nombre: 0, caAnnuel: 0 }
      }
      repartitionParSociete[c.societeId].nombre++
      repartitionParSociete[c.societeId].caAnnuel += c.caAnnuelEstime
    })
    
    return {
      nombreTotal,
      nombreActifs,
      nombreSuspendus,
      nombreExpires,
      nombreResilies,
      repartitionFrequence,
      caRecurrentMensuel: Math.round(caRecurrentMensuel),
      caRecurrentAnnuel: Math.round(caRecurrentAnnuel),
      caRealiseMoisActuel: Math.round(caRealiseMoisActuel),
      caRealiseAnneeActuelle: Math.round(caRealiseAnneeActuelle),
      moyenneMontantContrat: Math.round(moyenneMontantContrat),
      montantTotalContrats: Math.round(montantTotalContrats),
      nombreFacturesGenereesMois,
      nombreFacturesGenereesMoisPrecedent,
      evolutionFactures: Math.round(evolutionFactures * 10) / 10,
      prochaineDateGeneration: contratsActifs.length > 0
        ? contratsActifs.sort((a, b) => 
            a.prochaineDateFacturation.getTime() - b.prochaineDateFacturation.getTime()
          )[0].prochaineDateFacturation
        : undefined,
      nombreGenerationsProchains7Jours,
      nombreGenerationsProchains30Jours,
      tauxPaiementMoyen: Math.round(tauxPaiementMoyen * 10) / 10,
      delaiMoyenPaiement,
      nombreContratsEnRetard: nombreEnRetard,
      montantImpayeTotal: Math.round(montantImpayeTotal),
      nombreContratsFinProche,
      nombreRenouvellementsCeMois: 0, // TODO: implémenter
      tauxRenouvellement: 0, // TODO: implémenter
      topClients,
      repartitionParSociete
    }
  } catch (error) {
    console.error('Erreur calcul statistiques:', error)
    throw error
  }
}

/**
 * Obtenir les prévisions de facturation
 */
export async function getPrevisionFacturation(nombreMois: number = 3): Promise<PrevisionFacturation[]> {
  try {
    const contratsActifs = await getContratsActifs()
    
    const previsions: Record<string, PrevisionFacturation> = {}
    
    contratsActifs.forEach(contrat => {
      let dateFacturation = new Date(contrat.prochaineDateFacturation)
      const dateLimite = new Date()
      dateLimite.setMonth(dateLimite.getMonth() + nombreMois)
      
      while (dateFacturation <= dateLimite) {
        const cle = dateFacturation.toISOString().split('T')[0]
        
        if (!previsions[cle]) {
          previsions[cle] = {
            date: new Date(dateFacturation),
            contrats: [],
            montantTotalHT: 0,
            montantTotalTTC: 0,
            nombreFactures: 0
          }
        }
        
        previsions[cle].contrats.push({
          contratId: contrat.id,
          numero: contrat.numero,
          clientNom: contrat.clientNom || 'Client inconnu',
          montantHT: contrat.totalHT,
          montantTTC: contrat.totalTTC
        })
        
        previsions[cle].montantTotalHT += contrat.totalHT
        previsions[cle].montantTotalTTC += contrat.totalTTC
        previsions[cle].nombreFactures++
        
        // Calculer prochaine occurrence
        dateFacturation = calculerProchaineDate(
          dateFacturation,
          contrat.frequence,
          contrat.jourFacturation,
          contrat.frequencePersonnalisee
        )
      }
    })
    
    return Object.values(previsions).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    )
  } catch (error) {
    console.error('Erreur calcul prévisions:', error)
    throw error
  }
}

/**
 * Obtenir les alertes contrats
 */
export async function getAlertesContrats(): Promise<AlerteContrat[]> {
  try {
    const contrats = await getAllContrats()
    const alertes: AlerteContrat[] = []
    let idAlerte = 1
    
    const maintenant = new Date()
    const dans7Jours = new Date()
    dans7Jours.setDate(dans7Jours.getDate() + 7)
    const dans30Jours = new Date()
    dans30Jours.setDate(dans30Jours.getDate() + 30)
    const dans90Jours = new Date()
    dans90Jours.setDate(dans90Jours.getDate() + 90)
    
    contrats.forEach(contrat => {
      // Alertes facturation prochaine
      if (contrat.statut === 'actif' && contrat.prochaineDateFacturation <= dans7Jours) {
        alertes.push({
          id: `alerte-${idAlerte++}`,
          type: 'facturation_prochaine',
          contratId: contrat.id,
          contratNumero: contrat.numero,
          clientNom: contrat.clientNom || 'Client inconnu',
          gravite: 'info',
          message: `Facturation prévue le ${contrat.prochaineDateFacturation.toLocaleDateString('fr-FR')}`,
          details: `Montant: ${contrat.totalHT}€ HT`,
          actionRequise: false,
          dateCreation: new Date(),
          statut: 'nouveau'
        })
      }
      
      // Alertes fin de contrat
      if (contrat.statut === 'actif' && contrat.dateFin) {
        if (contrat.dateFin <= dans30Jours) {
          alertes.push({
            id: `alerte-${idAlerte++}`,
            type: 'fin_contrat_proche',
            contratId: contrat.id,
            contratNumero: contrat.numero,
            clientNom: contrat.clientNom || 'Client inconnu',
            gravite: 'warning',
            message: `Fin de contrat le ${contrat.dateFin.toLocaleDateString('fr-FR')}`,
            details: contrat.renouvellement.type === 'tacite' 
              ? 'Renouvellement tacite activé'
              : 'Nécessite validation pour renouvellement',
            actionRequise: contrat.renouvellement.type !== 'tacite',
            actionUrl: `/admin/finances/contrats/${contrat.id}`,
            dateCreation: new Date(),
            statut: 'nouveau'
          })
        }
      }
      
      // Alertes paiements en retard
      const facturesEnRetard = contrat.facturesGenerees?.filter(f => f.statut === 'en_retard') || []
      if (facturesEnRetard.length > 0) {
        const montantTotal = facturesEnRetard.reduce((sum, f) => sum + f.montantHT, 0)
        
        alertes.push({
          id: `alerte-${idAlerte++}`,
          type: 'paiement_retard',
          contratId: contrat.id,
          contratNumero: contrat.numero,
          clientNom: contrat.clientNom || 'Client inconnu',
          gravite: 'error',
          message: `${facturesEnRetard.length} facture(s) en retard`,
          details: `Montant total: ${montantTotal}€ HT`,
          actionRequise: true,
          actionUrl: `/admin/finances/factures?contratId=${contrat.id}&statut=en_retard`,
          dateCreation: new Date(),
          statut: 'nouveau'
        })
      }
    })
    
    return alertes.sort((a, b) => {
      const graviteOrdre = { critique: 0, error: 1, warning: 2, info: 3 }
      return graviteOrdre[a.gravite] - graviteOrdre[b.gravite]
    })
  } catch (error) {
    console.error('Erreur récupération alertes:', error)
    throw error
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Valider un contrat avant création/modification
 */
export function validerContrat(contrat: Partial<ContratRecurrent>): ValidationContrat {
  const erreurs: ValidationContrat['erreurs'] = []
  const avertissements: ValidationContrat['avertissements'] = []
  
  // Validations obligatoires
  if (!contrat.nom) {
    erreurs.push({
      champ: 'nom',
      message: 'Le nom du contrat est obligatoire',
      type: 'erreur'
    })
  }
  
  if (!contrat.clientId) {
    erreurs.push({
      champ: 'clientId',
      message: 'Le client est obligatoire',
      type: 'erreur'
    })
  }
  
  if (!contrat.societeId) {
    erreurs.push({
      champ: 'societeId',
      message: 'La société est obligatoire',
      type: 'erreur'
    })
  }
  
  if (!contrat.dateDebut) {
    erreurs.push({
      champ: 'dateDebut',
      message: 'La date de début est obligatoire',
      type: 'erreur'
    })
  }
  
  if (!contrat.lignes || contrat.lignes.length === 0) {
    erreurs.push({
      champ: 'lignes',
      message: 'Au moins une ligne est requise',
      type: 'erreur'
    })
  }
  
  // Validations dates
  if (contrat.dateDebut && contrat.dateFin && contrat.dateFin <= contrat.dateDebut) {
    erreurs.push({
      champ: 'dateFin',
      message: 'La date de fin doit être après la date de début',
      type: 'erreur'
    })
  }
  
  // Avertissements
  if (contrat.jourFacturation && (contrat.jourFacturation < 1 || contrat.jourFacturation > 31)) {
    avertissements.push({
      message: 'Jour de facturation invalide (doit être entre 1 et 31)',
      impact: 'Le jour sera ajusté au dernier jour du mois si nécessaire'
    })
  }
  
  if (contrat.lignes) {
    const montantTotal = contrat.lignes.reduce((sum, l) => sum + l.montantHT, 0)
    if (montantTotal === 0) {
      avertissements.push({
        message: 'Le montant total du contrat est nul',
        impact: 'Les factures générées seront à 0€'
      })
    }
    
    if (montantTotal > 100000) {
      avertissements.push({
        message: 'Montant élevé détecté (> 100 000€)',
        impact: 'Vérifiez que les montants sont corrects'
      })
    }
  }
  
  return {
    contratId: contrat.id || '',
    erreurs,
    avertissements,
    valide: erreurs.length === 0,
    message: erreurs.length === 0 
      ? 'Contrat valide'
      : `${erreurs.length} erreur(s) détectée(s)`
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from '@/lib/types/contrats-recurrents'
