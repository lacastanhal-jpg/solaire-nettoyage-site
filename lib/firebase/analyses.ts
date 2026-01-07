import { db } from './config'
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'

/**
 * BACKEND ANALYSES & REPORTING ULTRA-PROFESSIONNEL
 * Agrégation de toutes les données métier pour BI
 */

// ===================================
// TYPES
// ===================================

export interface KPIGlobal {
  ca: number
  caObjectif: number
  tauxRealisation: number
  nbInterventions: number
  nbClients: number
  nbSites: number
  margeEstimee: number
  tauxMarge: number
}

export interface EvolutionMensuelle {
  mois: string
  ca: number
  interventions: number
  nbClients: number
  margeEstimee: number
}

export interface PerformanceClient {
  clientId: string
  clientNom: string
  ca: number
  nbInterventions: number
  nbSites: number
  ticketMoyen: number
  dernierIntervention: string
  margeEstimee: number
}

export interface PerformanceOperateur {
  operateurId: string
  operateurNom: string
  nbInterventions: number
  caGenere: number
  tauxOccupation: number
  dureeeMoyenne: number
}

export interface StatistiquesSite {
  siteId: string
  siteNom: string
  clientNom: string
  nbInterventions: number
  caTotal: number
  dernierIntervention: string
  frequence: string
}

export interface DonneesAnalyses {
  kpis: KPIGlobal
  evolutionMensuelle: EvolutionMensuelle[]
  top10Clients: PerformanceClient[]
  performanceOperateurs: PerformanceOperateur[]
  topSites: StatistiquesSite[]
  repartitionCA: {
    label: string
    value: number
    pourcentage: number
  }[]
}

// ===================================
// FONCTIONS PRINCIPALES
// ===================================

/**
 * Récupérer toutes les données d'analyses
 */
export async function getDonneesAnalyses(
  dateDebut?: Date,
  dateFin?: Date
): Promise<DonneesAnalyses> {
  try {
    const debut = dateDebut || new Date(new Date().getFullYear(), 0, 1) // 1er janvier année en cours
    const fin = dateFin || new Date()

    // Récupérer toutes les données en parallèle
    const [factures, interventions, clients, sites] = await Promise.all([
      getFactures(debut, fin),
      getInterventions(debut, fin),
      getClients(),
      getSites()
    ])

    // Calculer KPIs globaux
    const kpis = calculerKPIs(factures, interventions, clients, sites)

    // Calculer évolution mensuelle
    const evolutionMensuelle = calculerEvolutionMensuelle(factures, interventions)

    // Top 10 clients
    const top10Clients = calculerTop10Clients(factures, interventions, clients)

    // Performance opérateurs
    const performanceOperateurs = calculerPerformanceOperateurs(interventions)

    // Top sites
    const topSites = calculerTopSites(factures, interventions, sites)

    // Répartition CA
    const repartitionCA = calculerRepartitionCA(factures)

    return {
      kpis,
      evolutionMensuelle,
      top10Clients,
      performanceOperateurs,
      topSites,
      repartitionCA
    }
  } catch (error) {
    console.error('Erreur getDonneesAnalyses:', error)
    throw error
  }
}

// ===================================
// FONCTIONS PRIVÉES
// ===================================

async function getFactures(debut: Date, fin: Date) {
  const facturesRef = collection(db, 'factures')
  const q = query(
    facturesRef,
    where('statut', '!=', 'annulee'),
    orderBy('statut'),
    orderBy('dateFacture')
  )
  const snapshot = await getDocs(q)
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter((f: any) => {
      const dateFacture = new Date(f.dateFacture)
      return dateFacture >= debut && dateFacture <= fin
    })
}

async function getInterventions(debut: Date, fin: Date) {
  const interventionsRef = collection(db, 'interventions')
  const snapshot = await getDocs(interventionsRef)
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as any))
    .filter((i: any) => {
      const dateIntervention = new Date(i.date)
      return dateIntervention >= debut && dateIntervention <= fin
    })
}

async function getClients() {
  const clientsRef = collection(db, 'clients')
  const snapshot = await getDocs(clientsRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
}

async function getSites() {
  const sitesRef = collection(db, 'sites')
  const snapshot = await getDocs(sitesRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
}

function calculerKPIs(factures: any[], interventions: any[], clients: any[], sites: any[]): KPIGlobal {
  const ca = factures.reduce((sum, f) => sum + (f.montantTotal || 0), 0)
  const caObjectif = 5000000 // 5M€ objectif annuel Solaire Nettoyage
  const tauxRealisation = (ca / caObjectif) * 100

  // Marge estimée (30% moyenne métier nettoyage photovoltaïque)
  const margeEstimee = ca * 0.30
  const tauxMarge = 30

  return {
    ca,
    caObjectif,
    tauxRealisation,
    nbInterventions: interventions.length,
    nbClients: clients.filter(c => c.actif !== false).length,
    nbSites: sites.filter(s => s.actif !== false).length,
    margeEstimee,
    tauxMarge
  }
}

function calculerEvolutionMensuelle(factures: any[], interventions: any[]): EvolutionMensuelle[] {
  const moisData: { [key: string]: EvolutionMensuelle } = {}
  
  // Initialiser 12 derniers mois
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().substring(0, 7) // YYYY-MM
    moisData[key] = {
      mois: d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      ca: 0,
      interventions: 0,
      nbClients: 0,
      margeEstimee: 0
    }
  }

  // Agréger factures
  factures.forEach(f => {
    const key = f.dateFacture.substring(0, 7)
    if (moisData[key]) {
      moisData[key].ca += f.montantTotal || 0
      moisData[key].margeEstimee += (f.montantTotal || 0) * 0.30
    }
  })

  // Agréger interventions
  interventions.forEach(i => {
    const key = i.date.substring(0, 7)
    if (moisData[key]) {
      moisData[key].interventions += 1
    }
  })

  // Clients uniques par mois
  const clientsParMois: { [key: string]: Set<string> } = {}
  factures.forEach(f => {
    const key = f.dateFacture.substring(0, 7)
    if (!clientsParMois[key]) clientsParMois[key] = new Set()
    clientsParMois[key].add(f.clientId)
  })
  
  Object.keys(clientsParMois).forEach(key => {
    if (moisData[key]) {
      moisData[key].nbClients = clientsParMois[key].size
    }
  })

  return Object.values(moisData)
}

function calculerTop10Clients(factures: any[], interventions: any[], clients: any[]): PerformanceClient[] {
  const clientData: { [key: string]: any } = {}

  // Agréger factures par client
  factures.forEach(f => {
    if (!clientData[f.clientId]) {
      const client = clients.find(c => c.id === f.clientId)
      clientData[f.clientId] = {
        clientId: f.clientId,
        clientNom: client?.nom || 'Inconnu',
        ca: 0,
        nbInterventions: 0,
        nbSites: 0,
        dernierIntervention: '',
        margeEstimee: 0
      }
    }
    clientData[f.clientId].ca += f.montantTotal || 0
    clientData[f.clientId].margeEstimee += (f.montantTotal || 0) * 0.30
  })

  // Agréger interventions par client
  interventions.forEach(i => {
    if (clientData[i.clientId]) {
      clientData[i.clientId].nbInterventions += 1
      if (!clientData[i.clientId].dernierIntervention || i.date > clientData[i.clientId].dernierIntervention) {
        clientData[i.clientId].dernierIntervention = i.date
      }
    }
  })

  // Sites uniques par client
  const sitesParClient: { [key: string]: Set<string> } = {}
  interventions.forEach(i => {
    if (!sitesParClient[i.clientId]) sitesParClient[i.clientId] = new Set()
    sitesParClient[i.clientId].add(i.siteId)
  })
  Object.keys(sitesParClient).forEach(clientId => {
    if (clientData[clientId]) {
      clientData[clientId].nbSites = sitesParClient[clientId].size
    }
  })

  // Calculer ticket moyen
  Object.values(clientData).forEach((c: any) => {
    c.ticketMoyen = c.nbInterventions > 0 ? c.ca / c.nbInterventions : 0
  })

  // Trier et top 10
  return Object.values(clientData)
    .sort((a: any, b: any) => b.ca - a.ca)
    .slice(0, 10)
}

function calculerPerformanceOperateurs(interventions: any[]): PerformanceOperateur[] {
  const operateurData: { [key: string]: any } = {}

  interventions.forEach(i => {
    const operateur = i.operateur || 'Non assigné'
    if (!operateurData[operateur]) {
      operateurData[operateur] = {
        operateurId: operateur,
        operateurNom: operateur,
        nbInterventions: 0,
        caGenere: 0,
        dureeeTotale: 0,
        tauxOccupation: 0
      }
    }
    operateurData[operateur].nbInterventions += 1
    operateurData[operateur].caGenere += i.montantFacture || 0
    operateurData[operateur].dureeeTotale += i.duree || 0
  })

  // Calculer moyennes
  Object.values(operateurData).forEach((o: any) => {
    o.dureeeMoyenne = o.nbInterventions > 0 ? o.dureeeTotale / o.nbInterventions : 0
    o.tauxOccupation = Math.min((o.nbInterventions / 250) * 100, 100) // Max 250 interventions/an
  })

  return Object.values(operateurData)
    .sort((a: any, b: any) => b.caGenere - a.caGenere)
}

function calculerTopSites(factures: any[], interventions: any[], sites: any[]): StatistiquesSite[] {
  const siteData: { [key: string]: any } = {}

  // Agréger interventions par site
  interventions.forEach(i => {
    if (!siteData[i.siteId]) {
      const site = sites.find(s => s.id === i.siteId)
      siteData[i.siteId] = {
        siteId: i.siteId,
        siteNom: site?.nom || 'Inconnu',
        clientNom: site?.clientNom || 'Inconnu',
        nbInterventions: 0,
        caTotal: 0,
        dernierIntervention: '',
        frequence: ''
      }
    }
    siteData[i.siteId].nbInterventions += 1
    siteData[i.siteId].caTotal += i.montantFacture || 0
    if (!siteData[i.siteId].dernierIntervention || i.date > siteData[i.siteId].dernierIntervention) {
      siteData[i.siteId].dernierIntervention = i.date
    }
  })

  // Calculer fréquence
  Object.values(siteData).forEach((s: any) => {
    if (s.nbInterventions >= 12) s.frequence = 'Mensuelle'
    else if (s.nbInterventions >= 4) s.frequence = 'Trimestrielle'
    else if (s.nbInterventions >= 2) s.frequence = 'Semestrielle'
    else s.frequence = 'Ponctuelle'
  })

  return Object.values(siteData)
    .sort((a: any, b: any) => b.caTotal - a.caTotal)
    .slice(0, 20)
}

function calculerRepartitionCA(factures: any[]) {
  const repartition: { [key: string]: number } = {
    'EDF': 0,
    'ENGIE': 0,
    'TotalEnergies': 0,
    'ArcelorMittal': 0,
    'Autres': 0
  }

  const caTotal = factures.reduce((sum, f) => sum + (f.montantTotal || 0), 0)

  factures.forEach(f => {
    const client = f.clientNom || ''
    if (client.includes('EDF')) repartition['EDF'] += f.montantTotal || 0
    else if (client.includes('ENGIE')) repartition['ENGIE'] += f.montantTotal || 0
    else if (client.includes('Total')) repartition['TotalEnergies'] += f.montantTotal || 0
    else if (client.includes('Arcelor')) repartition['ArcelorMittal'] += f.montantTotal || 0
    else repartition['Autres'] += f.montantTotal || 0
  })

  return Object.entries(repartition).map(([label, value]) => ({
    label,
    value,
    pourcentage: caTotal > 0 ? (value / caTotal) * 100 : 0
  }))
}

/**
 * Exporter les données en format Excel-compatible
 */
export function exporterDonneesExcel(donnees: DonneesAnalyses) {
  // Format CSV pour import Excel
  const csvEvolution = [
    ['Mois', 'CA (€)', 'Interventions', 'Clients', 'Marge (€)'],
    ...donnees.evolutionMensuelle.map(m => [
      m.mois,
      m.ca.toFixed(2),
      m.interventions,
      m.nbClients,
      m.margeEstimee.toFixed(2)
    ])
  ]

  const csvClients = [
    ['Client', 'CA (€)', 'Interventions', 'Sites', 'Ticket Moyen (€)', 'Marge (€)'],
    ...donnees.top10Clients.map(c => [
      c.clientNom,
      c.ca.toFixed(2),
      c.nbInterventions,
      c.nbSites,
      c.ticketMoyen.toFixed(2),
      c.margeEstimee.toFixed(2)
    ])
  ]

  return {
    evolution: csvEvolution.map(row => row.join(';')).join('\n'),
    clients: csvClients.map(row => row.join(';')).join('\n')
  }
}
