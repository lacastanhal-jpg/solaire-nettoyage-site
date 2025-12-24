// Types pour la gestion des projets GELY - VERSION ENRICHIE

export type SocieteType = 'sciGely' | 'lexa' | 'lexa2' | 'solaireNettoyage'
export type StatutProjetType = 'en_cours' | 'developement' | 'termine' | 'suspendu'
export type ResponsableType = 'Jerome GELY' | 'Axel GELY'
export type TypeLigneFinanciereType = 'devis' | 'facture' | 'revenu' | 'autre'
export type StatutLigneType = 'paye' | 'a_payer' | 'en_cours' | 'signe' | 'annule'
export type TypeAutorisationType = 'PC' | 'DP' | 'DCR' | 'autre'

// Flux inter-sociétés
export interface FluxInterSociete {
  id: string
  nom: string
  type: 'loyer' | 'prestation' | 'autre'
  montantAnnuel: number
  societeSource: string
  societeCible: string
  avecInflation: boolean
}

// Charge prévisionnelle
export interface Charge {
  id: string
  nom: string
  type: 'fixe' | 'pourcentage'
  montantAnnuel: number
  valeurPourcentage?: number
  avecInflation: boolean
}

// Paramètres financiers
export interface ParamsFinanciers {
  tauxEmprunt: number
  dureeEmprunt: number
  differePremierAn: boolean
  dureeAmortissement: number
  inflationGenerale: number
  baisseProductionAnnuelle: number
  charges: Charge[]
  lignesFinancieresParams?: Record<string, any>
  utiliserAmortissementGlobal?: boolean
}

// Contrat EDF OA
export interface ContratEDF {
  numero: string
  tarif: number // c€/kWh
  duree: number // années
  dateDebut?: string
  dateFin?: string
}

// Autorisation administrative
export interface Autorisation {
  type: TypeAutorisationType
  numero: string
  dateDepot?: string
  dateObtention?: string
  notes?: string
}

// Partenaire/Fournisseur
export interface Partenaire {
  nom: string
  role: string // Ex: "Développement PV", "Structure métallique"
  contact?: string
  telephone?: string
  email?: string
  notes?: string
}

// Échéance critique
export interface Echeance {
  id: string
  date: string
  description: string
  montant: number
  statut: 'a_venir' | 'payee' | 'retard'
}

export interface LigneFinanciere {
  id: string
  type: TypeLigneFinanciereType
  fournisseur: string
  numero?: string
  description: string
  montantHT: number
  montantTTC: number
  statut: StatutLigneType
  date: string
  echeance?: string
  notes?: string
}

export interface Projet {
  id: string
  nom: string
  societe: SocieteType
  responsable: ResponsableType
  statut: StatutProjetType
  budgetTotal: number // TTC
  budgetTotalHT: number // HT
  description: string
  
  // Données techniques PV (optionnel)
  puissanceKWc?: number
  tarifEDF?: number
  productionAnnuelleKWh?: number
  revenusAnnuels?: number
  
  // Données immobilier (optionnel)
  surfaceM2?: number
  adresse?: string
  
  // Contrats et autorisations
  contratsEDF?: ContratEDF[]
  autorisations?: Autorisation[]
  partenaires?: Partenaire[]
  echeancesCritiques?: Echeance[]
  
  // Paramètres financiers et flux
  paramsFinanciers?: ParamsFinanciers
  fluxInterSocietes?: FluxInterSociete[]
  
  // Calculés automatiquement (TTC)
  totalDevis: number
  totalFactures: number
  totalPaye: number
  totalAPayer: number
  reste: number
  
  // Calculés automatiquement (HT)
  totalDevisHT: number
  totalFacturesHT: number
  totalPayeHT: number
  totalAPayerHT: number
  resteHT: number
  
  // Dates
  dateDebut: string
  dateFin?: string
  createdAt: string
  updatedAt: string
}

export interface CalculsProjet {
  budgetTotal: number
  totalDevis: number
  totalFactures: number
  totalPaye: number
  totalAPayer: number
  totalEnCours: number
  reste: number
  pourcentageRealisation: number
  depassement: number
  revenusAnnuels?: number
  roi?: number // Retour sur investissement en années
}