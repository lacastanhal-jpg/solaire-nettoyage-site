// Export Firebase config
export { db, storage, auth } from './config'

// Export Client functions
export {
  createClient,
  getAllClients,
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

// Export Import Sites functions
export {
  importSitesEnMasse,
  verifierDoublons,
  parseGPS
} from './import-sites'
export type { SiteComplet, SiteImport } from './import-sites'
