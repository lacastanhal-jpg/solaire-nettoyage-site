/**
 * TYPES CONTRATS RÉCURRENTS - VERSION PROFESSIONNELLE
 * Module de gestion des contrats de facturation automatique
 * Créé : 6 Janvier 2026
 */

// ============================================================================
// ÉNUMÉRATIONS
// ============================================================================

export type FrequenceContrat = 
  | 'hebdomadaire'
  | 'bimensuel' 
  | 'mensuel'
  | 'bimestriel'
  | 'trimestriel'
  | 'quadrimestriel'
  | 'semestriel'
  | 'annuel'
  | 'personnalise'

export type StatutContrat = 
  | 'brouillon'      // En cours de création
  | 'actif'          // Contrat actif, génération auto
  | 'suspendu'       // Temporairement arrêté
  | 'expire'         // Date de fin atteinte
  | 'resilie'        // Résilié avant terme
  | 'termine'        // Terminé normalement

export type TypeAjustement = 
  | 'aucun'
  | 'pourcentage'    // +5% annuel
  | 'montant_fixe'   // +100€ par an
  | 'indexation'     // Indexation INSEE

export type ModeNotification = 
  | 'aucune'
  | 'email'
  | 'sms'
  | 'email_sms'

export type TypeRenouvellement = 
  | 'tacite'         // Renouvellement automatique
  | 'manuel'         // Nécessite validation
  | 'aucun'          // Fin définitive

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface LigneContrat {
  id: string
  siteId: string
  siteNom?: string // Dénormalisé pour performance
  
  articleId: string
  articleCode?: string // Dénormalisé
  articleNom?: string // Dénormalisé
  
  quantite: number
  unite?: string // m², pièces, heures
  
  prixUnitaireHT: number
  tauxTVA: number
  montantHT: number
  montantTVA: number
  montantTTC: number
  
  // Options avancées
  description?: string
  noteInterne?: string
  
  // Variations saisonnières
  variationSaisonniere?: {
    mois: number[] // [1,2,3] = Jan,Fév,Mars
    coefficient: number // 1.2 = +20%
  }
}

export interface AjustementPrix {
  type: TypeAjustement
  valeur: number // Pourcentage ou montant
  dateApplication: Date
  dateProchainAjustement?: Date
  periodicite?: 'annuel' | 'semestriel' // Pour ajustements récurrents
  
  // Indexation avancée
  indiceReference?: string // "INSEE", "SYNTEC", etc.
  valeurIndiceReference?: number
  
  historique: Array<{
    date: Date
    ancienneValeur: number
    nouvelleValeur: number
    montantAvant: number
    montantApres: number
    appliquePar: string
  }>
}

export interface ConditionsPaiement {
  delaiJours: number // 30, 45, 60
  modePaiement: 'virement' | 'prelevement' | 'cheque' | 'carte' | 'autre'
  
  // Prélèvement automatique
  prelevementAuto?: {
    active: boolean
    iban?: string
    rum?: string // Référence Unique de Mandat
    dateSignature?: Date
  }
  
  // Conditions particulières
  escompte?: {
    pourcentage: number
    siPaiementAvantJours: number
  }
  
  penalitesRetard?: {
    tauxJournalier: number // 0.03 = 3% par jour
    montantMinimum: number
  }
}

export interface RenouvellementContrat {
  type: TypeRenouvellement
  
  // Pour renouvellement tacite
  dureeRenouvellement?: number // En mois
  preavisResiliationJours?: number // 60 jours avant fin
  nombreRenouvellements?: number // null = illimité
  renouvellementsCumules?: number
  
  // Notifications
  notifierAvantFinJours?: number[] // [90, 60, 30, 7]
  notificationEnvoyees?: Array<{
    date: Date
    joursRestants: number
    destinataires: string[]
  }>
}

export interface NotificationsContrat {
  facturationProchaine: {
    active: boolean
    joursAvant: number[]
    destinataires: string[]
    mode: ModeNotification
  }
  
  paiementEnRetard: {
    active: boolean
    joursApres: number[]
    destinataires: string[]
    mode: ModeNotification
  }
  
  finContrat: {
    active: boolean
    joursAvant: number[]
    destinataires: string[]
    mode: ModeNotification
  }
  
  seuilCA: {
    active: boolean
    montantSeuil: number
    destinataires: string[]
  }
}

export interface HistoriqueFacturation {
  factureId: string
  numero: string
  date: Date
  dateEcheance: Date
  montantHT: number
  montantTTC: number
  statut: 'brouillon' | 'envoyee' | 'partiellement_payee' | 'payee' | 'en_retard' | 'annulee'
  datePaiement?: Date
  methodeGeneration: 'automatique' | 'manuelle'
  genereePar?: string
  noteFacturation?: string
}

export interface ContratRecurrent {
  id: string
  numero: string // "CTR-2026-0001"
  
  // ========================================================================
  // INFORMATIONS GÉNÉRALES
  // ========================================================================
  
  nom: string
  description?: string
  reference?: string // Référence client/externe
  
  // Client
  clientId: string
  clientNom?: string // Dénormalisé
  groupeId?: string
  groupeNom?: string // Dénormalisé
  
  // Entité juridique
  societeId: string
  societeNom?: string // Dénormalisé
  
  // ========================================================================
  // DURÉE & DATES
  // ========================================================================
  
  dateDebut: Date
  dateFin?: Date // null = contrat sans fin
  dureeInitialeMois?: number
  
  // Renouvellement
  renouvellement: RenouvellementContrat
  
  // ========================================================================
  // RÉCURRENCE & FACTURATION
  // ========================================================================
  
  frequence: FrequenceContrat
  
  // Pour fréquence personnalisée
  frequencePersonnalisee?: {
    nombreJours?: number
    nombreMois?: number
  }
  
  // Configuration facturation
  jourFacturation: number // 1-31
  heureGeneration?: number // 8 = 8h00 (pour cron)
  
  prochaineDateFacturation: Date
  derniereDateFacturation?: Date
  
  // Décalages exceptionnels
  decalagesExceptionnels?: Array<{
    dateOriginale: Date
    dateDecalee: Date
    raison: string
  }>
  
  // ========================================================================
  // LIGNES & MONTANTS
  // ========================================================================
  
  lignes: LigneContrat[]
  
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  // Montants prévisionnels
  caAnnuelEstime: number
  caRealiseCumule: number
  nombreFacturesGenerees: number
  
  // ========================================================================
  // AJUSTEMENTS & CONDITIONS
  // ========================================================================
  
  ajustementPrix?: AjustementPrix
  conditionsPaiement: ConditionsPaiement
  
  // ========================================================================
  // CONTACTS & NOTIFICATIONS
  // ========================================================================
  
  contactsPrincipaux: Array<{
    nom: string
    email: string
    telephone?: string
    role: 'facturation' | 'technique' | 'direction'
  }>
  
  notifications: NotificationsContrat
  
  // ========================================================================
  // HISTORIQUE & SUIVI
  // ========================================================================
  
  facturesGenerees: HistoriqueFacturation[]
  
  historiqueModifications: Array<{
    date: Date
    utilisateur: string
    action: string
    details: string
    anciennesValeurs?: any
    nouvellesValeurs?: any
  }>
  
  // ========================================================================
  // ANALYSE & PERFORMANCE
  // ========================================================================
  
  statistiques?: {
    tauxPaiementTemps: number // %
    delaiMoyenPaiement: number // jours
    montantMoyenFacture: number
    nombreFacturesEnRetard: number
    totalImpaye: number
  }
  
  // ========================================================================
  // DOCUMENTS & PIÈCES JOINTES
  // ========================================================================
  
  documents: Array<{
    id: string
    nom: string
    type: 'contrat_signe' | 'avenant' | 'cgv' | 'mandat_prelevement' | 'autre'
    url: string
    dateUpload: Date
    uploadePar: string
  }>
  
  // ========================================================================
  // OPTIONS AVANCÉES
  // ========================================================================
  
  options: {
    // Validation manuelle avant envoi
    validationManuelle: boolean
    
    // Générer intervention automatiquement
    genererIntervention: boolean
    equipeParDefaut?: string
    
    // Envoi automatique facture
    envoyerEmailAuto: boolean
    emailsDestinataires?: string[]
    
    // Regroupement factures
    regrouperAvecAutresFactures: boolean
    
    // Gestion multi-devises (future)
    devise?: string
    tauxChange?: number
  }
  
  // ========================================================================
  // STATUT & MÉTADONNÉES
  // ========================================================================
  
  statut: StatutContrat
  
  // Raisons suspension/résiliation
  raisonSuspension?: string
  dateSuspension?: Date
  raisonResiliation?: string
  dateResiliation?: Date
  
  // Notes internes
  noteInterne?: string
  
  // Métadonnées système
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
  
  // Tags & catégorisation
  tags?: string[]
  categorie?: string
}

// ============================================================================
// INTERFACES POUR STATISTIQUES & DASHBOARDS
// ============================================================================

export interface StatistiquesContrats {
  // Vue globale
  nombreTotal: number
  nombreActifs: number
  nombreSuspendus: number
  nombreExpires: number
  nombreResilies: number
  
  // Par fréquence
  repartitionFrequence: Record<FrequenceContrat, number>
  
  // Financier
  caRecurrentMensuel: number
  caRecurrentAnnuel: number
  caRealiseMoisActuel: number
  caRealiseAnneeActuelle: number
  
  moyenneMontantContrat: number
  montantTotalContrats: number
  
  // Opérationnel
  nombreFacturesGenereesMois: number
  nombreFacturesGenereesMoisPrecedent: number
  evolutionFactures: number // %
  
  prochaineDateGeneration?: Date
  nombreGenerationsProchains7Jours: number
  nombreGenerationsProchains30Jours: number
  
  // Performance
  tauxPaiementMoyen: number // %
  delaiMoyenPaiement: number // jours
  nombreContratsEnRetard: number
  montantImpayeTotal: number
  
  // Renouvellements
  nombreContratsFinProche: number // < 90 jours
  nombreRenouvellementsCeMois: number
  tauxRenouvellement: number // %
  
  // Top clients
  topClients: Array<{
    clientId: string
    clientNom: string
    nombreContrats: number
    caRecurrentAnnuel: number
  }>
  
  // Top sociétés
  repartitionParSociete: Record<string, {
    nombre: number
    caAnnuel: number
  }>
}

export interface PrevisionFacturation {
  date: Date
  contrats: Array<{
    contratId: string
    numero: string
    clientNom: string
    montantHT: number
    montantTTC: number
  }>
  montantTotalHT: number
  montantTotalTTC: number
  nombreFactures: number
}

export interface AlerteContrat {
  id: string
  type: 
    | 'facturation_prochaine'
    | 'paiement_retard'
    | 'fin_contrat_proche'
    | 'renouvellement_necessaire'
    | 'seuil_ca_atteint'
    | 'ajustement_prix_a_faire'
  
  contratId: string
  contratNumero: string
  clientNom: string
  
  gravite: 'info' | 'warning' | 'error' | 'critique'
  
  message: string
  details?: string
  
  actionRequise: boolean
  actionUrl?: string
  
  dateCreation: Date
  dateTraitement?: Date
  traitePar?: string
  
  statut: 'nouveau' | 'en_cours' | 'traite' | 'ignore'
}

// ============================================================================
// INTERFACES POUR GÉNÉRATION FACTURES
// ============================================================================

export interface OptionsGenerationFacture {
  contratId: string
  dateFacturation?: Date // Par défaut: aujourd'hui
  genereePar: string
  
  // Options avancées
  forcer?: boolean // Générer même si date non atteinte
  envoyerEmail?: boolean
  validerAutomatiquement?: boolean
  
  // Ajustements ponctuels
  ajustementPonctuel?: {
    type: 'pourcentage' | 'montant_fixe'
    valeur: number
    raison: string
  }
  
  noteFacturation?: string
}

export interface ResultatGenerationFacture {
  success: boolean
  factureId?: string
  factureNumero?: string
  
  erreur?: {
    code: string
    message: string
    details?: any
  }
  
  montantGenere?: number
  prochaineDateFacturation?: Date
  
  actions: Array<{
    type: string
    description: string
    timestamp: Date
  }>
}

// ============================================================================
// INTERFACES POUR WORKFLOWS
// ============================================================================

export interface WorkflowContrat {
  etapes: Array<{
    nom: string
    description: string
    ordre: number
    statut: 'en_attente' | 'en_cours' | 'termine' | 'erreur'
    dateDebut?: Date
    dateFin?: Date
    erreur?: string
  }>
  
  statut: 'non_demarre' | 'en_cours' | 'termine' | 'erreur'
  progression: number // 0-100
}

export interface ValidationContrat {
  contratId: string
  
  erreurs: Array<{
    champ: string
    message: string
    type: 'erreur' | 'avertissement'
  }>
  
  avertissements: Array<{
    message: string
    impact: string
  }>
  
  valide: boolean
  message?: string
}

// ============================================================================
// EXPORT DEFAULT TYPE
// ============================================================================

export type {
  ContratRecurrent as default
}
