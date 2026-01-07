/**
 * SYSTÈME DE RELANCES - STATISTIQUES & DASHBOARD
 * Analyse et reporting des relances
 */

import { db } from './config'
import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'
import type {
  StatistiquesRelances,
  DashboardRelances,
  HistoriqueRelance
} from './relances-types'

// ============================================
// STATISTIQUES
// ============================================

/**
 * Calculer les statistiques pour une période
 */
export async function getStatistiquesRelances(
  dateDebut: string,
  dateFin: string
): Promise<StatistiquesRelances> {
  try {
    // Récupérer toutes les factures impayées
    const facturesRef = collection(db, 'factures')
    const qFactures = query(
      facturesRef,
      where('statut', 'in', ['envoyee', 'partiellement_payee', 'en_retard']),
      where('resteAPayer', '>', 0)
    )
    const facturesSnapshot = await getDocs(qFactures)
    
    let nombreFacturesImpayees = 0
    let montantTotalImpaye = 0
    
    const impaye0_30j = { nombre: 0, montant: 0 }
    const impaye30_60j = { nombre: 0, montant: 0 }
    const impaye60_90j = { nombre: 0, montant: 0 }
    const impayePlus90j = { nombre: 0, montant: 0 }
    
    const clientsImpayesMap = new Map<string, {
      clientId: string
      clientNom: string
      montantImpaye: number
      nombreFactures: number
      anciennete: number
    }>()
    
    const aujourdhui = new Date()
    let sommeTousDelais = 0
    let nombreFacturesAvecDelai = 0
    
    facturesSnapshot.docs.forEach(doc => {
      const facture = doc.data()
      nombreFacturesImpayees++
      montantTotalImpaye += facture.resteAPayer
      
      // Calculer jours de retard
      const dateEcheance = new Date(facture.dateEcheance)
      const joursRetard = Math.floor((aujourdhui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24))
      
      // Catégoriser par ancienneté
      if (joursRetard < 0) {
        // Pas encore en retard
      } else if (joursRetard <= 30) {
        impaye0_30j.nombre++
        impaye0_30j.montant += facture.resteAPayer
      } else if (joursRetard <= 60) {
        impaye30_60j.nombre++
        impaye30_60j.montant += facture.resteAPayer
      } else if (joursRetard <= 90) {
        impaye60_90j.nombre++
        impaye60_90j.montant += facture.resteAPayer
      } else {
        impayePlus90j.nombre++
        impayePlus90j.montant += facture.resteAPayer
      }
      
      // Statistiques par client
      const clientKey = facture.clientId
      const clientData = clientsImpayesMap.get(clientKey) || {
        clientId: facture.clientId,
        clientNom: facture.clientNom,
        montantImpaye: 0,
        nombreFactures: 0,
        anciennete: 0
      }
      
      clientData.montantImpaye += facture.resteAPayer
      clientData.nombreFactures++
      clientData.anciennete = Math.max(clientData.anciennete, joursRetard)
      
      clientsImpayesMap.set(clientKey, clientData)
      
      // Pour calcul délai moyen
      if (facture.datePaiement) {
        const datePaiement = new Date(facture.datePaiement)
        const delaiPaiement = Math.floor((datePaiement.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24))
        sommeTousDelais += delaiPaiement
        nombreFacturesAvecDelai++
      }
    })
    
    // Récupérer les relances de la période
    const relancesRef = collection(db, 'relances_historique')
    const qRelances = query(
      relancesRef,
      where('dateCreation', '>=', dateDebut),
      where('dateCreation', '<=', dateFin)
    )
    const relancesSnapshot = await getDocs(qRelances)
    
    let nombreRelancesEnvoyees = 0
    let nombreRappelsAmiables = 0
    let nombreRelancesFermes = 0
    let nombreMisesEnDemeure = 0
    let montantRecouvrePeriode = 0
    
    relancesSnapshot.docs.forEach(doc => {
      const relance = doc.data()
      
      if (relance.statut === 'envoyee') {
        nombreRelancesEnvoyees++
        
        if (relance.type === 'rappel_amiable') nombreRappelsAmiables++
        if (relance.type === 'relance_ferme') nombreRelancesFermes++
        if (relance.type === 'mise_en_demeure') nombreMisesEnDemeure++
        
        if (relance.paiementRecu && relance.montantPaye) {
          montantRecouvrePeriode += relance.montantPaye
        }
      }
    })
    
    // Calculer DSO (Days Sales Outstanding)
    const dso = nombreFacturesAvecDelai > 0 ? sommeTousDelais / nombreFacturesAvecDelai : 0
    
    // Taux de recouvrement
    const tauxRecouvrement = nombreRelancesEnvoyees > 0
      ? (relancesSnapshot.docs.filter(d => d.data().paiementRecu).length / nombreRelancesEnvoyees) * 100
      : 0
    
    // Délai moyen de paiement
    const delaiMoyenPaiement = nombreFacturesAvecDelai > 0 ? sommeTousDelais / nombreFacturesAvecDelai : 0
    
    // Top 10 clients impayés
    const topClientsImpayés = Array.from(clientsImpayesMap.values())
      .sort((a, b) => b.montantImpaye - a.montantImpaye)
      .slice(0, 10)
    
    // Calculer évolution DSO (TODO: comparer avec mois précédent)
    const dsoEvolution = 0
    
    return {
      periode: dateDebut.substring(0, 7),
      dateDebut,
      dateFin,
      
      nombreFacturesImpayees,
      montantTotalImpaye,
      
      impaye0_30j,
      impaye30_60j,
      impaye60_90j,
      impayePlus90j,
      
      nombreRelancesEnvoyees,
      nombreRappelsAmiables,
      nombreRelancesFermes,
      nombreMisesEnDemeure,
      
      tauxRecouvrement,
      delaiMoyenPaiement: Math.round(delaiMoyenPaiement),
      montantRecouvrePeriode,
      
      dso: Math.round(dso),
      dsoEvolution,
      
      topClientsImpayés
    }
  } catch (error) {
    console.error('Erreur calcul statistiques relances:', error)
    throw error
  }
}

/**
 * Récupérer le dashboard complet
 */
export async function getDashboardRelances(): Promise<DashboardRelances> {
  try {
    // Statistiques du mois en cours
    const maintenant = new Date()
    const dateDebut = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}-01`
    const dernierJour = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).getDate()
    const dateFin = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}-${String(dernierJour).padStart(2, '0')}`
    
    const statistiques = await getStatistiquesRelances(dateDebut, dateFin)
    
    // Factures critiques (>90j ou montant >10K€)
    const facturesCritiques = await getFacturesCritiques()
    
    // Relances à envoyer aujourd'hui
    const relancesAEnvoyer = await getRelancesAEnvoyer()
    
    // Alertes
    const alertes = await genererAlertes(statistiques, facturesCritiques)
    
    // Prévisions encaissements
    const previsions = await calculerPrevisionsEncaissements()
    
    return {
      statistiques,
      facturesCritiques,
      relancesAEnvoyer,
      alertes,
      previsions
    }
  } catch (error) {
    console.error('Erreur récupération dashboard:', error)
    throw error
  }
}

/**
 * Récupérer les factures critiques
 */
async function getFacturesCritiques(): Promise<any[]> {
  try {
    const facturesRef = collection(db, 'factures')
    const q = query(
      facturesRef,
      where('statut', 'in', ['envoyee', 'partiellement_payee', 'en_retard']),
      where('resteAPayer', '>', 0),
      orderBy('resteAPayer', 'desc'),
      limit(20)
    )
    
    const snapshot = await getDocs(q)
    const aujourdhui = new Date()
    
    return snapshot.docs
      .map(doc => {
        const facture = doc.data()
        const dateEcheance = new Date(facture.dateEcheance)
        const joursRetard = Math.floor((aujourdhui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24))
        
        // Déterminer prochaine relance
        let prochaineRelance: any = 'rappel_amiable'
        let dateProchaineRelance = new Date(dateEcheance)
        
        if (joursRetard >= 60) {
          prochaineRelance = 'contentieux'
          dateProchaineRelance.setDate(dateEcheance.getDate() + 60)
        } else if (joursRetard >= 45) {
          prochaineRelance = 'mise_en_demeure'
          dateProchaineRelance.setDate(dateEcheance.getDate() + 45)
        } else if (joursRetard >= 30) {
          prochaineRelance = 'relance_ferme'
          dateProchaineRelance.setDate(dateEcheance.getDate() + 30)
        } else {
          dateProchaineRelance.setDate(dateEcheance.getDate() + 15)
        }
        
        return {
          factureId: doc.id,
          factureNumero: facture.numero,
          clientNom: facture.clientNom,
          montant: facture.resteAPayer,
          joursRetard: Math.max(0, joursRetard),
          prochaineRelance,
          dateProchaineRelance: dateProchaineRelance.toISOString().split('T')[0]
        }
      })
      .filter(f => f.joursRetard > 0 || f.montant > 10000)
      .sort((a, b) => {
        // Trier par urgence (jours retard puis montant)
        if (a.joursRetard !== b.joursRetard) {
          return b.joursRetard - a.joursRetard
        }
        return b.montant - a.montant
      })
      .slice(0, 10)
  } catch (error) {
    console.error('Erreur récupération factures critiques:', error)
    return []
  }
}

/**
 * Récupérer les relances à envoyer aujourd'hui
 */
async function getRelancesAEnvoyer(): Promise<HistoriqueRelance[]> {
  try {
    const aujourdhui = new Date().toISOString().split('T')[0]
    
    const relancesRef = collection(db, 'relances_historique')
    const q = query(
      relancesRef,
      where('statut', 'in', ['planifiee', 'en_attente']),
      where('datePlanification', '<=', aujourdhui),
      orderBy('datePlanification'),
      limit(50)
    )
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HistoriqueRelance[]
  } catch (error) {
    console.error('Erreur récupération relances à envoyer:', error)
    return []
  }
}

/**
 * Générer les alertes
 */
async function genererAlertes(
  stats: StatistiquesRelances,
  facturesCritiques: any[]
): Promise<any[]> {
  const alertes: any[] = []
  
  // Alerte si beaucoup d'impayés +90j
  if (stats.impayePlus90j.montant > 50000) {
    alertes.push({
      type: 'critique',
      message: `⚠️ ${stats.impayePlus90j.montant.toFixed(0)}€ d'impayés de plus de 90 jours`,
      dateCreation: new Date().toISOString()
    })
  }
  
  // Alerte DSO élevé
  if (stats.dso > 60) {
    alertes.push({
      type: 'avertissement',
      message: `📊 DSO élevé: ${stats.dso} jours (objectif <45j)`,
      dateCreation: new Date().toISOString()
    })
  }
  
  // Alerte factures critiques
  if (facturesCritiques.length > 5) {
    alertes.push({
      type: 'avertissement',
      message: `🚨 ${facturesCritiques.length} factures critiques nécessitent une action`,
      dateCreation: new Date().toISOString()
    })
  }
  
  // Alerte taux recouvrement faible
  if (stats.tauxRecouvrement < 50 && stats.nombreRelancesEnvoyees > 10) {
    alertes.push({
      type: 'avertissement',
      message: `📉 Taux de recouvrement faible: ${stats.tauxRecouvrement.toFixed(1)}%`,
      dateCreation: new Date().toISOString()
    })
  }
  
  return alertes
}

/**
 * Calculer les prévisions d'encaissements
 */
async function calculerPrevisionsEncaissements(): Promise<{
  encaissementsAttendus7j: number
  encaissementsAttendus15j: number
  encaissementsAttendus30j: number
}> {
  try {
    const facturesRef = collection(db, 'factures')
    const q = query(
      facturesRef,
      where('statut', 'in', ['envoyee', 'partiellement_payee']),
      where('resteAPayer', '>', 0)
    )
    
    const snapshot = await getDocs(q)
    const aujourdhui = new Date()
    
    let encaissementsAttendus7j = 0
    let encaissementsAttendus15j = 0
    let encaissementsAttendus30j = 0
    
    snapshot.docs.forEach(doc => {
      const facture = doc.data()
      const dateEcheance = new Date(facture.dateEcheance)
      const joursAvantEcheance = Math.floor((dateEcheance.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24))
      
      if (joursAvantEcheance <= 7 && joursAvantEcheance >= 0) {
        encaissementsAttendus7j += facture.resteAPayer
      }
      
      if (joursAvantEcheance <= 15 && joursAvantEcheance >= 0) {
        encaissementsAttendus15j += facture.resteAPayer
      }
      
      if (joursAvantEcheance <= 30 && joursAvantEcheance >= 0) {
        encaissementsAttendus30j += facture.resteAPayer
      }
    })
    
    return {
      encaissementsAttendus7j,
      encaissementsAttendus15j,
      encaissementsAttendus30j
    }
  } catch (error) {
    console.error('Erreur calcul prévisions:', error)
    return {
      encaissementsAttendus7j: 0,
      encaissementsAttendus15j: 0,
      encaissementsAttendus30j: 0
    }
  }
}

/**
 * Exporter les statistiques en format Excel (données seulement)
 */
export async function exporterStatistiquesExcel(
  dateDebut: string,
  dateFin: string
): Promise<any> {
  try {
    const stats = await getStatistiquesRelances(dateDebut, dateFin)
    
    // Retourner les données brutes pour génération Excel côté client
    return {
      resume: {
        'Période': stats.periode,
        'Nombre factures impayées': stats.nombreFacturesImpayees,
        'Montant total impayé': stats.montantTotalImpaye,
        'DSO (jours)': stats.dso,
        'Taux recouvrement': `${stats.tauxRecouvrement.toFixed(1)}%`,
        'Montant recouvré': stats.montantRecouvrePeriode
      },
      parAnciennete: [
        { Catégorie: '0-30 jours', Nombre: stats.impaye0_30j.nombre, Montant: stats.impaye0_30j.montant },
        { Catégorie: '30-60 jours', Nombre: stats.impaye30_60j.nombre, Montant: stats.impaye30_60j.montant },
        { Catégorie: '60-90 jours', Nombre: stats.impaye60_90j.nombre, Montant: stats.impaye60_90j.montant },
        { Catégorie: '+90 jours', Nombre: stats.impayePlus90j.nombre, Montant: stats.impayePlus90j.montant }
      ],
      relances: [
        { Type: 'Rappels amiables', Nombre: stats.nombreRappelsAmiables },
        { Type: 'Relances fermes', Nombre: stats.nombreRelancesFermes },
        { Type: 'Mises en demeure', Nombre: stats.nombreMisesEnDemeure }
      ],
      topClients: stats.topClientsImpayés
    }
  } catch (error) {
    console.error('Erreur export statistiques:', error)
    throw error
  }
}
