// Export Firebase config
export { db, storage, auth } from './config'

// Export Client functions
export {
  createClient,
  getAllClients,
  getClientsByGroupe,
  getClientByEmail,
  updateClient,
  deleteClient,
  verifyClientCredentials
} from './clients'
export type { Client } from './clients'

// Export Site functions
export {
  createSite,
  getSitesByClient,
  getSiteById,
  updateSite,
  deleteSite,
  getAllSites
} from './sites'
export type { Site } from './sites'

// Export Site Complet functions (import Excel)
export {
  importSitesFromExcel,
  getAllSitesComplet,
  getSitesCompletByClient,
  getSitesCompletByGroupe,
  countSitesByClient,
  updateSiteComplet,
  deleteSiteComplet
} from './import-sites'
export type { SiteComplet, SiteImport } from './import-sites'

// Export Intervention functions
export {
  createIntervention,
  getInterventionsByClient,
  getInterventionsBySite,
  getInterventionByNumero,
  updateIntervention,
  deleteIntervention,
  getAllInterventions,
  getClientStats
} from './interventions'
export type { Intervention } from './interventions'

// Export Intervention Calendar functions
export {
  createInterventionCalendar,
  getAllInterventionsCalendar,
  getInterventionsByEquipe,
  getInterventionsByClientCalendar,
  getInterventionsBySiteCalendar,
  getInterventionsByPeriode,
  getInterventionCalendarById,
  updateInterventionCalendar,
  deleteInterventionCalendar,
  demanderChangementDate,
  accepterChangementDate,
  refuserChangementDate,
  createEquipe,
  getAllEquipes,
  verifyEquipeCredentials,
  updateEquipeComposition,
  getEquipeById
} from './interventions-calendar'
export type { InterventionCalendar, Equipe, Indisponibilite } from './interventions-calendar'

// Export Operateur functions
export {
  createOperateur,
  getAllOperateurs,
  getOperateursDisponibles,
  getOperateurById,
  updateOperateur,
  deleteOperateur,
  createConge,
  getCongesByOperateur,
  deleteConge,
  isOperateurDisponible
} from './operateurs'
export type { Operateur, CongeOperateur } from './operateurs'

// Export Storage functions
export {
  uploadRapport,
  uploadPhoto,
  deleteRapport,
  deletePhoto,
  uploadMultiplePhotos
} from './storage'

// Export Demande functions
export {
  createDemandeAcces,
  getAllDemandes,
  getDemandesEnAttente,
  approuverDemande,
  refuserDemande,
  deleteDemande
} from './demandes'
export type { DemandeAcces } from './demandes'

// Export Groupe functions
export {
  createGroupe,
  getAllGroupes,
  getGroupeById,
  getGroupeByNom,
  updateGroupe,
  deleteGroupe,
  countGroupesActifs,
  verifyGroupeCredentials
} from './groupes'
export type { Groupe } from './groupes'

// Export Certification functions
export {
  createCaces,
  getAllCaces,
  getCacesByOperateur,
  updateCaces,
  deleteCaces,
  createVisiteMedicale,
  getAllVisitesMedicales,
  getVisitesMedicalesByOperateur,
  updateVisiteMedicale,
  deleteVisiteMedicale,
  createVGP,
  getAllVGP,
  getVGPByMateriel,
  updateVGP,
  deleteVGP,
  createMateriel,
  getAllMateriels,
  getMaterielsByEquipe,
  updateMateriel,
  deleteMateriel,
  getAlertes
} from './certifications'
export type { CacesOperateur, VisiteMedicale, VGPMateriel, Materiel } from './certifications'

// Export Extincteur functions
export {
  createExtincteur,
  getAllExtincteurs,
  getExtincteurById,
  getExtincteursByStatut,
  updateExtincteur,
  deleteExtincteur,
  createVerification,
  getAllVerifications,
  getHistoriqueExtincteur,
  deleteVerification,
  createTechnicien,
  getAllTechniciens,
  verifyTechnicienCredentials,
  updateTechnicien,
  deleteTechnicien,
  getAlertesExtincteurs
} from './extincteurs'
export type { Extincteur, VerificationExtincteur, TechnicienExtincteur } from './extincteurs'

// ===================================
// STOCK & FLOTTE
// ===================================

// Export Articles Stock functions
export {
  createArticleStock,
  getAllArticlesStock,
  getArticleStockById as getArticleStock,
  getArticlesEnAlerte,
  getArticlesAffectesEquipement,
  getArticlesStockByCompteComptable,
  getStatistiquesParCompteComptable,
  migrateArticlesStockComptesComptables,
  updateArticleStock,
  updateStockDepot,
  deleteArticleStock,
  ajusterStock,
  affecterArticleEquipement,
  retirerAffectationArticle,
  desactiverArticleStock,
  articleStockCodeExists,
  getStatistiquesStock,
  getArticlesParFournisseur
} from './stock-articles'

// Export Mouvements Stock functions
export {
  createMouvementStock,
  getAllMouvementsStock,
  getMouvementStockById,
  getMouvementsParArticle as getMouvementsStockByArticle,
  getMouvementsParType,
  getDerniersMouvements,
  getMouvementsPeriode,
  getMouvementsParEquipement,
  getStatistiquesMouvementsMois,
  annulerMouvement as annulerMouvementStock
} from './stock-mouvements'

// Export Équipements functions
export {
  createEquipement,
  getAllEquipements,
  getEquipement,
  getEquipementById,
  getVehicules,
  getVehiculesUniquement,
  getAllVehicules,
  getAccessoires,
  getAccessoiresParent,
  getAccessoiresEquipement,
  getEquipementsParStatut,
  getEquipementsEnMaintenance,
  getStatistiquesEquipements,
  getStatistiquesFlotte,
  updateEquipement,
  updateKmHeures
} from './stock-equipements'

// Export Interventions Maintenance functions
export {
  createInterventionMaintenance,
  finaliserIntervention as terminerIntervention,
  getAllInterventionsMaintenance,
  getInterventionMaintenanceById as getInterventionMaintenance,
  getInterventionsParEquipement as getInterventionsMaintenanceByEquipement,
  getInterventionsParType,
  getInterventionsPlanifiees,
  getDernieresInterventions,
  getInterventionsPeriode,
  updateInterventionMaintenance,
  ajouterPhotoIntervention,
  deleteInterventionMaintenance,
  getCoutMaintenanceEquipement,
  getStatistiquesMaintenanceMois
} from './stock-interventions'

// Export Factures Fournisseurs functions
export {
  createFactureFournisseur,
  genererMouvementsStockFacture,
  getAllFacturesFournisseurs,
  getFactureFournisseurById as getFactureFournisseur,
  getFacturesParFournisseur,
  getFacturesParStatut,
  getFacturesEnAttente,
  getFacturesPeriode,
  marquerFacturePayee,
  updateFactureFournisseur,
  deleteFactureFournisseur,
  factureNumeroExists,
  getStatistiquesFacturesFournisseurs,
  getAchatsParFournisseur
} from './stock-factures-fournisseurs'

// Export Gestion Interventions (suppression, annulation)
export { 
  supprimerIntervention,
  annulerFinalisation,
  compterMouvementsIntervention,
  annulerMouvementsIntervention,
  interventionAMouvements
} from './interventions-gestion-stock'

// Export Stock Affectations functions
export {
  createAffectation,
  getAllAffectations,
  getAffectationsByEquipement,
  getAffectationsByArticle,
  getAffectationById,
  updateAffectation,
  deleteAffectation,
  getStockEmbarqueArticle,
  articleDejaAffecte
} from './stock-affectations'
export type { AffectationEquipement, AffectationEquipementInput } from './stock-affectations'

// Export Stock Affectations Accessoires functions
export {
  createAffectationAccessoire,
  getAllAffectationsAccessoires,
  getAffectationsAccessoiresParVehicule,
  getAffectationAccessoire,
  getAffectationAccessoireById,
  updateAffectationAccessoire,
  deleteAffectationAccessoire,
  accessoireDejaAffecte
} from './stock-affectations-accessoires'
export type { AffectationAccessoire, AffectationAccessoireInput } from './stock-affectations-accessoires'

// ===================================
// STOCK PRÉVISIONS (NOUVEAU - Semaine 1)
// ===================================

// Export Stock Prévisions functions
export {
  genererPrevisionsReapprovisionnement,
  getStatistiquesConsommationParMois,
  getEvolutionStockArticle
} from './stock-previsions'
export type { 
  PrevisionReapprovisionnement,
  StatistiquesConsommation
} from './stock-previsions'

// ===================================
// TRÉSORERIE STATS (NOUVEAU - Semaine 2)
// ===================================

export {
  getStatistiquesTresorerie,
  getEvolutionSolde,
  getTransactionsNonRapprochees,
  getVariationSoldeMensuelle
} from './tresorerie-stats'
export type {
  StatistiquesTresorerie,
  EvolutionSolde
} from './tresorerie-stats'

// Export nouvelles fonctions trésorerie
export {
  exportTransactionsCSV,
  findMatchingFacturesClientsAmeliore,
  findMatchingFacturesFournisseursAmeliore,
  autoRapprocherLignes
} from './lignes-bancaires'
