/**
 * SYSTÈME DE RELANCES AUTOMATIQUES - TYPES TYPESCRIPT
 * Version Professionnelle Ultime
 * 
 * ROI : 30 000€/an
 * Gestion intelligente des impayés
 */

// ============================================
// TYPES DE RELANCES
// ============================================

export type TypeRelance = 
  | 'rappel_amiable'      // J+15 : Rappel courtois
  | 'relance_ferme'       // J+30 : Relance ferme
  | 'mise_en_demeure'     // J+45 : Mise en demeure officielle
  | 'contentieux'         // J+60 : Passage contentieux

export type StatutRelance = 
  | 'planifiee'          // Relance programmée
  | 'en_attente'         // En attente validation
  | 'envoyee'            // Envoyée avec succès
  | 'echec'              // Échec envoi
  | 'annulee'            // Annulée manuellement

export type CategorieClient = 
  | 'vip'                // Client VIP (pas de relances auto)
  | 'standard'           // Client standard
  | 'risque'             // Client à risque (relances renforcées)
  | 'bloque'             // Client bloqué (pas de nouvelles factures)

// ============================================
// CONFIGURATION GLOBALE
// ============================================

export interface ConfigurationRelances {
  id: string
  
  // Activation
  systemActif: boolean
  
  // Délais par défaut (en jours après échéance)
  delaiRappelAmiable: number      // 15 jours
  delaiRelanceFerme: number       // 30 jours
  delaiMiseEnDemeure: number      // 45 jours
  delaiContentieux: number        // 60 jours
  
  // Montants seuils
  montantMinimumRelance: number   // Ne pas relancer si < X€
  montantAlerteCritique: number   // Alerte admin si impayé > X€
  
  // Envois automatiques
  envoyerRappelAmiableAuto: boolean
  envoyerRelanceFermeAuto: boolean
  envoyerMiseEnDemeureAuto: boolean  // false par défaut (validation admin requise)
  
  // Jours d'envoi
  joursEnvoi: number[]            // [1,2,3,4,5] = Lun-Ven
  heureEnvoi: string              // "08:00"
  
  // Jours fériés français
  joursFeries: string[]           // ["2026-01-01", "2026-05-01", ...]
  
  // Contacts
  emailExpediteur: string
  emailCopie?: string             // Copie systématique
  telephoneContact: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// ============================================
// TEMPLATES EMAILS
// ============================================

export interface TemplateRelance {
  id: string
  type: TypeRelance
  actif: boolean
  
  // Contenu
  nom: string
  description?: string
  objet: string                   // Avec variables : {{clientNom}}, {{montant}}, etc.
  contenuHTML: string             // HTML riche
  contenuTexte: string            // Version texte
  
  // Pièces jointes
  inclureFacturePDF: boolean
  inclureCopieEmail: boolean
  
  // Options
  langue: 'fr' | 'en'
  priorite: 'normale' | 'haute'
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  
  // Statistiques
  nombreEnvois: number
  tauxOuverture?: number
  tauxReponse?: number
}

// Variables disponibles pour templates
export interface VariablesTemplate {
  clientNom: string
  clientContact: string
  clientEmail: string
  factureNumero: string
  factureDate: string
  factureDateEcheance: string
  factureMontant: string
  factureResteAPayer: string
  joursRetard: number
  entrepriseNom: string
  entrepriseEmail: string
  entrepriseTelephone: string
  entrepriseAdresse: string
  dateRelance: string
  numeroRelance: number
}

// ============================================
// CONFIGURATION PAR CLIENT
// ============================================

export interface ConfigRelanceClient {
  id: string  // = clientId
  clientId: string
  clientNom: string
  
  // Catégorie
  categorie: CategorieClient
  
  // Exclusion
  relancesDesactivees: boolean
  raisonDesactivation?: string
  dateDesactivation?: string
  
  // Délais personnalisés (si différents du global)
  delaisPersonnalises: boolean
  delaiRappelAmiable?: number
  delaiRelanceFerme?: number
  delaiMiseEnDemeure?: number
  delaiContentieux?: number
  
  // Contacts spécifiques
  emailComptable?: string
  emailDirecteur?: string
  telephoneUrgence?: string
  
  // Comportement paiement
  scoreFiabilite: number          // 0-100 (calculé auto)
  delaiPaiementMoyen: number      // En jours
  nombreRetardsPaiement: number
  montantTotalImpaye: number
  
  // Notes
  notes?: string
  alerteSpeciale?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// ============================================
// HISTORIQUE RELANCES
// ============================================

export interface HistoriqueRelance {
  id: string
  
  // Relance
  type: TypeRelance
  statut: StatutRelance
  dateCreation: string
  datePlanification: string
  
  // Facture
  factureId: string
  factureNumero: string
  factureMontant: number
  factureResteAPayer: number
  factureDateEcheance: string
  joursRetard: number
  
  // Client
  clientId: string
  clientNom: string
  clientEmail: string
  
  // Email
  templateUtilise: string
  objet: string
  contenu: string
  destinataires: string[]
  copie?: string[]
  piecesJointes: string[]
  
  // Résultat envoi
  emailEnvoye: boolean
  dateEnvoi?: string
  erreurEnvoi?: string
  tentativesEnvoi: number
  
  // Interactions
  emailOuvert: boolean
  dateOuverture?: string
  lienClique: boolean
  dateClicLien?: string
  
  // Actions suite
  paiementRecu: boolean
  datePaiement?: string
  montantPaye?: number
  
  // Notes
  notes?: string
  validePar?: string
  annulePar?: string
  raisonAnnulation?: string
  
  // Metadata
  createdAt: string
  createdBy: string
}

// ============================================
// STATISTIQUES & ANALYTICS
// ============================================

export interface StatistiquesRelances {
  // Période
  periode: string                 // "2026-01"
  dateDebut: string
  dateFin: string
  
  // Factures
  nombreFacturesImpayees: number
  montantTotalImpaye: number
  
  // Par ancienneté
  impaye0_30j: { nombre: number, montant: number }
  impaye30_60j: { nombre: number, montant: number }
  impaye60_90j: { nombre: number, montant: number }
  impayePlus90j: { nombre: number, montant: number }
  
  // Relances envoyées
  nombreRelancesEnvoyees: number
  nombreRappelsAmiables: number
  nombreRelancesFermes: number
  nombreMisesEnDemeure: number
  
  // Efficacité
  tauxRecouvrement: number        // % factures payées après relance
  delaiMoyenPaiement: number      // Jours
  montantRecouvrePeriode: number
  
  // DSO (Days Sales Outstanding)
  dso: number                     // Délai moyen paiement
  dsoEvolution: number            // +/- vs mois précédent
  
  // Top clients impayés
  topClientsImpayés: Array<{
    clientId: string
    clientNom: string
    montantImpaye: number
    nombreFactures: number
    anciennete: number
  }>
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardRelances {
  // Vue d'ensemble
  statistiques: StatistiquesRelances
  
  // Factures critiques
  facturesCritiques: Array<{
    factureId: string
    factureNumero: string
    clientNom: string
    montant: number
    joursRetard: number
    prochaineRelance: TypeRelance
    dateProchaineRelance: string
  }>
  
  // Relances du jour
  relancesAEnvoyer: HistoriqueRelance[]
  
  // Alertes
  alertes: Array<{
    type: 'critique' | 'avertissement' | 'info'
    message: string
    factureId?: string
    clientId?: string
    dateCreation: string
  }>
  
  // Prévisions
  previsions: {
    encaissementsAttendus7j: number
    encaissementsAttendus15j: number
    encaissementsAttendus30j: number
  }
}

// ============================================
// ACTIONS UTILISATEUR
// ============================================

export interface ActionRelance {
  type: 'envoyer' | 'planifier' | 'annuler' | 'reporter'
  relanceId: string
  userId: string
  date: string
  raison?: string
  nouvelleDate?: string
}

// ============================================
// RÉSULTAT OPÉRATIONS
// ============================================

export interface ResultatEnvoiRelance {
  success: boolean
  relanceId: string
  emailEnvoye: boolean
  erreur?: string
  details?: {
    destinataires: string[]
    dateEnvoi: string
    messageId?: string
  }
}

export interface ResultatGenerationRelances {
  success: boolean
  nombreRelancesGenerees: number
  relancesGenerees: HistoriqueRelance[]
  erreurs: string[]
}
