// Types pour la gestion des projets GELY

export type SocieteType = 'sciGely' | 'lexa' | 'lexa2' | 'solaireNettoyage'
export type StatutProjetType = 'en_cours' | 'developement' | 'termine' | 'suspendu'
export type ResponsableType = 'Jerome GELY' | 'Axel GELY'
export type TypeLigneFinanciereType = 'devis' | 'facture' | 'revenu' | 'autre'
export type StatutLigneType = 'paye' | 'a_payer' | 'en_cours' | 'signe' | 'annule'

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
  budgetTotal: number
  description: string
  
  // Données techniques (optionnel selon type projet)
  puissanceKWc?: number
  tarifEDF?: number
  revenusAnnuels?: number
  surfaceM2?: number
  
  // Calculés automatiquement
  totalDevis: number
  totalFactures: number
  totalPaye: number
  totalAPayer: number
  reste: number
  
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
