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
  countGroupesActifs
} from './groupes'
export type { Groupe } from './groupes'
