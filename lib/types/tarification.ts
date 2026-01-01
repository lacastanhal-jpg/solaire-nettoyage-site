// Types pour le système de tarification professionnel multi-niveaux
// Type Sage Pro - Grilles tarifaires, prestations, majorations, remises

// ===================================
// PRESTATIONS CATALOGUE
// ===================================

export type UnitePrestation = 'm²' | 'forfait' | 'intervention' | 'heure' | 'jour'

export type CategoriePrestation = 
  | 'Nettoyage' 
  | 'Maintenance' 
  | 'Diagnostic' 
  | 'Installation'
  | 'Formation'
  | 'Autre'

export interface PrestationCatalogue {
  id: string
  code: string                        // NETT-STANDARD, NETT-INTENSIF, MAINT-PREV...
  libelle: string                     // Nettoyage photovoltaïque standard
  description: string                 // Description détaillée
  unite: UnitePrestation              // Unité de facturation
  categorie: CategoriePrestation
  
  // Prix de base (référence)
  prixBase: number                    // Prix de référence €/unité
  
  // TVA
  tauxTVA: number                     // 20, 10, 5.5, 0
  
  // Comptabilité
  compteComptable?: string            // 706000, 706100...
  
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface PrestationCatalogueInput {
  code: string
  libelle: string
  description: string
  unite: UnitePrestation
  categorie: CategoriePrestation
  prixBase: number
  tauxTVA: number
  compteComptable?: string
  actif?: boolean
}

// ===================================
// TRANCHES SURFACE
// ===================================

export interface TrancheSurface {
  min: number                         // 0, 1001, 5001...
  max: number | null                  // 1000, 5000, null (infini)
  prix: number                        // Prix €/unité pour cette tranche
}

// ===================================
// MAJORATIONS & REMISES
// ===================================

export type TypeAjustement = 'taux' | 'montant'

export interface Majoration {
  code: string                        // URGENCE, HAUTEUR, WEEKEND...
  libelle: string                     // Intervention urgence
  type: TypeAjustement                // 'taux' ou 'montant'
  valeur: number                      // 25 (pour 25%) ou 150 (pour 150€)
  description?: string
}

export interface Remise {
  code: string                        // VOLUME-ANNUEL, FIDELITE, CONTRAT...
  libelle: string                     // Volume > 100 000m²/an
  type: TypeAjustement                // 'taux' ou 'montant'
  valeur: number                      // 5 (pour 5%) ou 200 (pour 200€)
  description?: string
}

// ===================================
// LIGNES GRILLE TARIFAIRE
// ===================================

export interface LigneGrilleTarifaire {
  prestationCode: string              // Code prestation catalogue
  
  // Tarifs par tranches de surface
  tranchesSurface: TrancheSurface[]
  
  // Ou tarif forfaitaire fixe (ignore tranches)
  tarifForfaitaire?: number           // Si défini, ignore tranchesSurface
  
  // Majorations possibles
  majorations: Majoration[]
  
  // Remises possibles
  remises: Remise[]
  
  // Notes spécifiques à cette ligne
  notes?: string
}

// ===================================
// GRILLES TARIFAIRES
// ===================================

export type TypeGrille = 'general' | 'groupe' | 'client' | 'site'

export interface GrilleTarifaire {
  id: string
  nom: string                         // "EDF - Contrat National", "Grille Générale 2025"
  type: TypeGrille                    // Niveau application
  
  // Entité liée (si spécifique)
  entiteId?: string                   // ID groupe, client ou site
  entiteNom?: string                  // Nom pour affichage
  
  // Période de validité
  dateDebut: string                   // ISO format
  dateFin: string | null              // ISO format ou null (sans fin)
  
  // Lignes tarifaires
  lignes: LigneGrilleTarifaire[]
  
  // Conditions particulières
  conditionsParticulieres?: string    // Texte libre
  
  // Priorité (plus le chiffre est bas, plus prioritaire)
  priorite: number                    // 1, 2, 3... (1 = plus haute priorité)
  
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface GrilleTarifaireInput {
  nom: string
  type: TypeGrille
  entiteId?: string
  entiteNom?: string
  dateDebut: string
  dateFin?: string | null
  lignes: LigneGrilleTarifaire[]
  conditionsParticulieres?: string
  priorite?: number
  actif?: boolean
}

// ===================================
// TARIFS SPÉCIAUX SITES
// ===================================

export interface TarifSpecialSite {
  id: string
  siteId: string
  siteNom: string
  
  // Option 1 : Tarifs fixes par prestation
  tarifsFixes?: {
    prestationCode: string
    prixFixe: number                  // Prix qui override complètement la grille
    motif: string                     // Explication
  }[]
  
  // Option 2 : Forfait mensuel/annuel
  forfait?: {
    type: 'mensuel' | 'trimestriel' | 'annuel'
    montant: number
    surfaceInclude: number            // m² inclus dans le forfait
    prixSupplementaire?: number       // Prix au-delà de la surface incluse
    description: string
  }
  
  // Validité
  dateDebut: string
  dateFin: string | null
  
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface TarifSpecialSiteInput {
  siteId: string
  siteNom: string
  tarifsFixes?: {
    prestationCode: string
    prixFixe: number
    motif: string
  }[]
  forfait?: {
    type: 'mensuel' | 'trimestriel' | 'annuel'
    montant: number
    surfaceInclude: number
    prixSupplementaire?: number
    description: string
  }
  dateDebut: string
  dateFin?: string | null
  actif?: boolean
}

// ===================================
// CALCUL PRIX
// ===================================

export interface ElementCalcul {
  libelle: string
  base?: number                       // Valeur de base (ex: surface, qté)
  prix?: number                       // Prix unitaire
  montant: number                     // Montant calculé
  type: 'base' | 'majoration' | 'remise'
}

export interface DetailCalculPrix {
  // Prestation
  prestationCode: string
  prestationLibelle: string
  
  // Base de calcul
  surface?: number                    // m² si applicable
  quantite?: number                   // Quantité si applicable
  
  // Grille utilisée
  grilleId: string
  grilleNom: string
  grillePriorite: number
  
  // Détail calcul
  elements: ElementCalcul[]
  
  // Totaux
  totalHT: number
  tauxTVA: number
  totalTVA: number
  totalTTC: number
  
  // Métadonnées
  calculeLe: string                   // ISO timestamp
  calculePar: string                  // Nom opérateur
}

export interface ResultatCalculPrix {
  detail: DetailCalculPrix
  prixModifiable: boolean             // true si peut être modifié manuellement
  messageInfo?: string                // Message d'information utilisateur
}

// ===================================
// LIEN INTERVENTION → FACTURE
// ===================================

export interface LienInterventionFacture {
  interventionId: string
  factureId: string
  montantFacture: number
  dateFacturation: string
  detailCalcul?: DetailCalculPrix     // Conservation du détail calcul
}
