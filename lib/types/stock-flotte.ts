// Types pour le module Stock & Flotte

// ===================================
// ARTICLES STOCK
// ===================================

export interface ArticleStock {
  id: string
  code: string                    // BAC5X5, HIFSO 8055...
  description: string
  fournisseur: string             // LE BON ROULEMENT, RURAL MASTER...
  prixUnitaire: number
  stockParDepot: {
    'Atelier': number
    'Porteur 26 T': number
    'Porteur 32 T': number
    'Semi Remorque': number
  }
  stockTotal: number              // Calculé
  stockMin: number
  equipementsAffectes: string[]   // IDs équipements
  photoUrl?: string
  qrCode?: string
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface ArticleStockInput {
  code: string
  description: string
  fournisseur: string
  prixUnitaire: number
  stockParDepot?: {
    'Atelier'?: number
    'Porteur 26 T'?: number
    'Porteur 32 T'?: number
    'Semi Remorque'?: number
  }
  stockMin?: number
  equipementsAffectes?: string[]
  photoUrl?: string
  actif?: boolean
}

// ===================================
// MOUVEMENTS STOCK
// ===================================

export type TypeMouvement = 'entree' | 'sortie' | 'transfert' | 'ajustement' | 'correction' | 'retour'

export interface MouvementStock {
  id: string
  articleId: string
  articleCode: string
  articleDescription: string
  type: TypeMouvement
  quantite: number
  date: string
  raison: string
  coutUnitaire: number
  coutTotal: number
  depotSource?: string            // Pour sortie/transfert
  depotDestination?: string       // Pour entrée/transfert
  operateur: string
  equipementId?: string           // Si lié à équipement
  interventionId?: string         // Si lié à intervention
  factureId?: string              // Si lié à facture fournisseur
  
  // 🆕 PHASE 3 - Traçabilité complète
  sourceType?: 'facture_fournisseur' | 'intervention' | 'transfert' | 'manuel'
  sourceId?: string               // ID du document source (facture, intervention...)
  ligneFactureId?: string         // ID de la ligne dans la facture fournisseur
  
  notes?: string
  createdAt: string
}

export interface MouvementStockInput {
  articleId: string
  type: TypeMouvement
  quantite: number
  date: string
  raison: string
  coutUnitaire?: number
  depotSource?: string
  depotDestination?: string
  operateur: string
  equipementId?: string
  interventionId?: string
  factureId?: string
  
  // 🆕 PHASE 3 - Traçabilité complète
  sourceType?: 'facture_fournisseur' | 'intervention' | 'transfert' | 'manuel'
  sourceId?: string
  ligneFactureId?: string
  
  notes?: string
}

// ===================================
// ÉQUIPEMENTS (Véhicules + Accessoires)
// ===================================

export type TypeEquipement = 'vehicule' | 'machine' | 'accessoire'
export type TypeFinancement = 'Achat' | 'Location' | 'Leasing'
export type StatutEquipement = 'en_service' | 'en_maintenance' | 'hors_service'

export interface Equipement {
  id: string
  nom: string
  description?: string            // Description alternative
  type: TypeEquipement
  
  // Si véhicule
  typeVehicule?: string           // Type de véhicule (VL, Porteur, etc.)
  numero?: string                 // Numéro d'équipement alternatif
  
  // Si accessoire
  parentId?: string               // ID équipement parent
  parentNom?: string              // Nom équipement parent
  vehiculeParentId?: string       // ID véhicule parent (alias de parentId)
  actifStructurel?: boolean       // false = carrosserie, true = brosse
  typeAccessoire?: string         // Type d'accessoire
  numeroSerie?: string            // Numéro de série
  
  // Infos générales
  immatriculation?: string        // Pour véhicules
  marque: string
  modele: string
  annee: number
  
  // Compteurs
  km?: number
  heures?: number
  kmHeures?: number               // Combinaison km ou heures
  
  // Technique
  carburant?: string
  capaciteReservoir?: number      // Capacité réservoir en litres
  vin?: string
  ptac?: number
  poids?: number
  
  // Propriété
  proprietaire: string
  typeFinancement: TypeFinancement
  
  // Valeurs
  valeurAchat: number
  valeurActuelle: number
  coutMensuel?: number
  dateAchat?: string              // Date d'achat
  prixAchat?: number              // Prix d'achat (alias de valeurAchat)
  
  // Contrats
  dateDebut?: string
  dateFin?: string
  assurance?: number
  assuranceExpiration?: string    // Date expiration assurance
  
  // Contrôles techniques
  dateControleTechnique?: string
  controleTechnique?: string      // Alias pour dateControleTechnique
  controleTechniqueExpiration?: string  // Date expiration CT
  dateProchainCT?: string         // Alias pour controleTechniqueExpiration
  
  // VGP (Vérification Générale Périodique)
  dateVGP?: string
  vgpExpiration?: string          // Date expiration VGP
  dateProchainVGP?: string        // Alias pour vgpExpiration
  
  // Statut
  statut: StatutEquipement
  
  // Divers
  notes?: string
  photoUrl?: string
  documentsUrls?: string[]
  
  createdAt: string
  updatedAt: string
}

export interface EquipementInput {
  nom: string
  description?: string
  type: TypeEquipement
  
  // Si véhicule
  typeVehicule?: string
  numero?: string
  
  // Si accessoire
  parentId?: string
  vehiculeParentId?: string
  actifStructurel?: boolean
  typeAccessoire?: string
  numeroSerie?: string
  
  // Infos générales
  immatriculation?: string
  marque: string
  modele: string
  annee: number
  
  // Compteurs
  km?: number
  heures?: number
  kmHeures?: number
  
  // Technique
  carburant?: string
  capaciteReservoir?: number
  vin?: string
  ptac?: number
  poids?: number
  
  // Propriété
  proprietaire: string
  typeFinancement: TypeFinancement
  
  // Valeurs
  valeurAchat: number
  valeurActuelle: number
  coutMensuel?: number
  dateAchat?: string
  prixAchat?: number
  
  // Contrats
  dateDebut?: string
  dateFin?: string
  assurance?: number
  assuranceExpiration?: string
  
  // Contrôles techniques
  dateControleTechnique?: string
  controleTechnique?: string
  controleTechniqueExpiration?: string
  dateProchainCT?: string
  
  // VGP
  dateVGP?: string
  vgpExpiration?: string
  dateProchainVGP?: string
  
  // Statut
  statut?: StatutEquipement
  
  // Divers
  notes?: string
  photoUrl?: string
}

// ===================================
// INTERVENTIONS MAINTENANCE
// ===================================

export type TypeIntervention = 'entretien' | 'reparation' | 'diagnostic' | 'autre'
export type StatutIntervention = 'planifiee' | 'en_cours' | 'terminee' | 'annulee'

export interface ArticleUtilise {
  articleId: string
  code: string
  description: string
  quantite: number
  prixUnitaire: number
  coutTotal: number
  depotPrelevement: string
}

export interface InterventionMaintenance {
  id: string
  equipementId: string
  equipementNom: string
  type: TypeIntervention
  date: string
  km?: number
  heures?: number
  description: string
  travauxEffectues?: string
  articlesUtilises: ArticleUtilise[]
  coutPieces: number              // Calculé
  coutMainOeuvre: number
  coutTotal: number               // Calculé
  operateur: string
  statut: StatutIntervention
  notes?: string
  photosUrls?: string[]
  createdAt: string
  updatedAt: string
}

export interface InterventionMaintenanceInput {
  equipementId: string
  type: TypeIntervention
  date: string
  km?: number
  heures?: number
  description: string
  travauxEffectues?: string
  articlesUtilises?: ArticleUtilise[]
  coutMainOeuvre?: number
  operateur: string
  statut?: StatutIntervention
  notes?: string
}

// ===================================
// FACTURES FOURNISSEURS
// ===================================

export type StatutFactureFournisseur = 'en_attente' | 'stock_genere' | 'payee'

export interface LigneFactureFournisseur {
  articleId: string
  code: string
  description: string
  articleCode?: string            // Alias de code
  articleDescription?: string     // Alias de description
  quantite: number
  prixUnitaire: number
  tauxTVA: number
  totalHT: number
  totalTVA: number
  totalTTC: number
  depotDestination: string
}

export interface FactureFournisseur {
  id: string
  numero: string
  fournisseur: string
  date: string
  dateEcheance: string
  lignes: LigneFactureFournisseur[]
  totalHT: number
  totalTVA: number
  totalTTC: number
  statut: StatutFactureFournisseur
  datePaiement?: string
  moyenPaiement?: string
  referencePaiement?: string
  documentUrl?: string            // PDF facture
  mouvementsStockIds: string[]    // IDs mouvements créés
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FactureFournisseurInput {
  numero: string
  fournisseur: string
  date: string
  dateEcheance: string
  lignes: LigneFactureFournisseur[]
  documentUrl?: string
  notes?: string
}

// ===================================
// ALERTES
// ===================================

export type TypeAlerte = 'stock_bas' | 'stock_rupture' | 'vgp_expire' | 'ct_expire'
export type GraviteAlerte = 'info' | 'warning' | 'critical'

export interface Alerte {
  id: string
  type: TypeAlerte
  gravite: GraviteAlerte
  titre: string
  message: string
  articleId?: string
  equipementId?: string
  dateCreation: string
  dateResolution?: string
  resolue: boolean
  actionsPrises?: string
}

// ===================================
// STATISTIQUES
// ===================================

export interface StatistiquesStock {
  valeurTotaleStock: number
  valeurParDepot: {
    [depot: string]: number
  }
  nombreArticles: number
  nombreAlertes: number
  mouvementsMois: {
    entrees: number
    sorties: number
    transferts: number
  }
}

export interface StatistiquesFlotte {
  nombreEquipements: number
  nombreVehicules: number
  nombreAccessoires: number
  valeurTotale: number
  coutMaintenanceMois: number
  nombreInterventionsMois: number
}

// ===================================
// DÉPÔTS (constantes)
// ===================================

export const DEPOTS = [
  'Atelier',
  'Porteur 26 T',
  'Porteur 32 T',
  'Semi Remorque'
] as const

export type Depot = typeof DEPOTS[number]

// ===================================
// OPÉRATEURS (constantes)
// ===================================

export const OPERATEURS = [
  'Axel',
  'Jérôme',
  'Sébastien',
  'Joffrey',
  'Fabien',
  'Angelo'
] as const

export type Operateur = typeof OPERATEURS[number]
