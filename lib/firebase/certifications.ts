import { db } from './config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore'

// ============================================================================
// TYPES
// ============================================================================

export interface CacesOperateur {
  id?: string
  operateurId: string
  operateurNom: string
  type: 'R482 Cat A' | 'R482 Cat F' | 'R486 PEMP' | 'Habilitation électrique' | 'Port du harnais' | 'Élingage' | 'GIES 1' | 'GIES 2'
  dateObtention: string // ISO format
  dateExpiration: string // ISO format
  organisme: string
  numeroAttestation?: string
  documentUrl?: string
  createdAt: string
  updatedAt: string
}

export interface VisiteMedicale {
  id?: string
  operateurId: string
  operateurNom: string
  dateVisite: string // ISO format
  dateExpiration: string // ISO format (généralement +1 an ou +2 ans)
  type: 'Embauche' | 'Périodique' | 'Reprise' | 'À la demande'
  apte: boolean
  restrictions?: string
  medecinTravail: string
  documentUrl?: string
  createdAt: string
  updatedAt: string
}

export interface VGPMateriel {
  id?: string
  materielId: string
  nomMateriel: string
  type: 'Nacelle' | 'Camion' | 'Robot' | 'Osmoseur' | 'Autre'
  dateVerification: string // ISO format
  dateExpiration: string // ISO format (généralement +6 mois)
  organisme: string
  conforme: boolean
  observations?: string
  numeroRapport?: string
  documentUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Materiel {
  id?: string
  nom: string
  type: 'Nacelle' | 'Camion' | 'Robot' | 'Osmoseur' | 'Autre'
  numeroSerie?: string
  marque?: string
  modele?: string
  anneeAchat?: string
  equipeId?: number // 1, 2 ou 3
  actif: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// FONCTIONS CACES
// ============================================================================

/**
 * Créer un CACES pour un opérateur
 */
export async function createCaces(caces: Omit<CacesOperateur, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'caces'), {
      ...caces,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création CACES:', error)
    throw error
  }
}

/**
 * Récupérer tous les CACES
 */
export async function getAllCaces(): Promise<(CacesOperateur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'caces'), orderBy('dateExpiration', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CacesOperateur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération CACES:', error)
    return []
  }
}

/**
 * Récupérer CACES d'un opérateur
 */
export async function getCacesByOperateur(operateurId: string): Promise<(CacesOperateur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'caces'),
        where('operateurId', '==', operateurId),
        orderBy('dateExpiration', 'asc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CacesOperateur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération CACES opérateur:', error)
    return []
  }
}

/**
 * Mettre à jour un CACES
 */
export async function updateCaces(id: string, updates: Partial<CacesOperateur>) {
  try {
    await updateDoc(doc(db, 'caces', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour CACES:', error)
    throw error
  }
}

/**
 * Supprimer un CACES
 */
export async function deleteCaces(id: string) {
  try {
    await deleteDoc(doc(db, 'caces', id))
  } catch (error) {
    console.error('Erreur suppression CACES:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS VISITES MÉDICALES
// ============================================================================

/**
 * Créer une visite médicale
 */
export async function createVisiteMedicale(visite: Omit<VisiteMedicale, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'visites_medicales'), {
      ...visite,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création visite médicale:', error)
    throw error
  }
}

/**
 * Récupérer toutes les visites médicales
 */
export async function getAllVisitesMedicales(): Promise<(VisiteMedicale & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'visites_medicales'), orderBy('dateExpiration', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VisiteMedicale & { id: string }))
  } catch (error) {
    console.error('Erreur récupération visites médicales:', error)
    return []
  }
}

/**
 * Récupérer visites médicales d'un opérateur
 */
export async function getVisitesMedicalesByOperateur(operateurId: string): Promise<(VisiteMedicale & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'visites_medicales'),
        where('operateurId', '==', operateurId),
        orderBy('dateVisite', 'desc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VisiteMedicale & { id: string }))
  } catch (error) {
    console.error('Erreur récupération visites médicales opérateur:', error)
    return []
  }
}

/**
 * Mettre à jour une visite médicale
 */
export async function updateVisiteMedicale(id: string, updates: Partial<VisiteMedicale>) {
  try {
    await updateDoc(doc(db, 'visites_medicales', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour visite médicale:', error)
    throw error
  }
}

/**
 * Supprimer une visite médicale
 */
export async function deleteVisiteMedicale(id: string) {
  try {
    await deleteDoc(doc(db, 'visites_medicales', id))
  } catch (error) {
    console.error('Erreur suppression visite médicale:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS VGP MATÉRIEL
// ============================================================================

/**
 * Créer un contrôle VGP
 */
export async function createVGP(vgp: Omit<VGPMateriel, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'vgp'), {
      ...vgp,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création VGP:', error)
    throw error
  }
}

/**
 * Récupérer tous les VGP
 */
export async function getAllVGP(): Promise<(VGPMateriel & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'vgp'), orderBy('dateExpiration', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VGPMateriel & { id: string }))
  } catch (error) {
    console.error('Erreur récupération VGP:', error)
    return []
  }
}

/**
 * Récupérer VGP d'un matériel
 */
export async function getVGPByMateriel(materielId: string): Promise<(VGPMateriel & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'vgp'),
        where('materielId', '==', materielId),
        orderBy('dateVerification', 'desc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VGPMateriel & { id: string }))
  } catch (error) {
    console.error('Erreur récupération VGP matériel:', error)
    return []
  }
}

/**
 * Mettre à jour un VGP
 */
export async function updateVGP(id: string, updates: Partial<VGPMateriel>) {
  try {
    await updateDoc(doc(db, 'vgp', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour VGP:', error)
    throw error
  }
}

/**
 * Supprimer un VGP
 */
export async function deleteVGP(id: string) {
  try {
    await deleteDoc(doc(db, 'vgp', id))
  } catch (error) {
    console.error('Erreur suppression VGP:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS MATÉRIEL
// ============================================================================

/**
 * Créer un matériel
 */
export async function createMateriel(materiel: Omit<Materiel, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'materiels'), {
      ...materiel,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création matériel:', error)
    throw error
  }
}

/**
 * Récupérer tous les matériels
 */
export async function getAllMateriels(): Promise<(Materiel & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'materiels'), orderBy('nom', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Materiel & { id: string }))
  } catch (error) {
    console.error('Erreur récupération matériels:', error)
    return []
  }
}

/**
 * Récupérer matériels d'une équipe
 */
export async function getMaterielsByEquipe(equipeId: number): Promise<(Materiel & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'materiels'),
        where('equipeId', '==', equipeId),
        where('actif', '==', true)
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Materiel & { id: string }))
  } catch (error) {
    console.error('Erreur récupération matériels équipe:', error)
    return []
  }
}

/**
 * Mettre à jour un matériel
 */
export async function updateMateriel(id: string, updates: Partial<Materiel>) {
  try {
    await updateDoc(doc(db, 'materiels', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour matériel:', error)
    throw error
  }
}

/**
 * Supprimer un matériel
 */
export async function deleteMateriel(id: string) {
  try {
    await deleteDoc(doc(db, 'materiels', id))
  } catch (error) {
    console.error('Erreur suppression matériel:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS CALCUL ALERTES
// ============================================================================

/**
 * Calculer le nombre de jours avant expiration
 */
function joursAvantExpiration(dateExpiration: string): number {
  const today = new Date()
  const expiration = new Date(dateExpiration)
  const diff = expiration.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Obtenir toutes les alertes du système
 */
export async function getAlertes() {
  try {
    const [caces, visites, vgps, interventions] = await Promise.all([
      getAllCaces(),
      getAllVisitesMedicales(),
      getAllVGP(),
      // Import dynamique pour éviter dépendance circulaire
      (async () => {
        const { getAllInterventionsCalendar } = await import('./interventions-calendar')
        return getAllInterventionsCalendar()
      })()
    ])

    const alertes = {
      critiques: [] as { type: string; message: string; jours: number }[],
      importantes: [] as { type: string; message: string; jours: number }[],
      info: [] as { type: string; message: string }[]
    }

    const aujourdhui = new Date()
    const demain = new Date(aujourdhui)
    demain.setDate(demain.getDate() + 1)

    // CACES
    caces.forEach(c => {
      const jours = joursAvantExpiration(c.dateExpiration)
      if (jours < 0) {
        alertes.critiques.push({
          type: 'CACES expiré',
          message: `${c.operateurNom} - ${c.type} expiré depuis ${Math.abs(jours)} jours`,
          jours
        })
      } else if (jours <= 15) {
        alertes.critiques.push({
          type: 'CACES < 15j',
          message: `${c.operateurNom} - ${c.type} expire dans ${jours}j`,
          jours
        })
      } else if (jours <= 30) {
        alertes.importantes.push({
          type: 'CACES < 30j',
          message: `${c.operateurNom} - ${c.type} expire dans ${jours}j`,
          jours
        })
      }
    })

    // Visites médicales
    visites.forEach(v => {
      const jours = joursAvantExpiration(v.dateExpiration)
      if (jours < 0) {
        alertes.critiques.push({
          type: 'Visite médicale expirée',
          message: `${v.operateurNom} - Visite expirée depuis ${Math.abs(jours)} jours`,
          jours
        })
      } else if (jours <= 15) {
        alertes.critiques.push({
          type: 'Visite médicale < 15j',
          message: `${v.operateurNom} - Visite expire dans ${jours}j`,
          jours
        })
      } else if (jours <= 30) {
        alertes.importantes.push({
          type: 'Visite médicale < 30j',
          message: `${v.operateurNom} - Visite expire dans ${jours}j`,
          jours
        })
      }
    })

    // VGP
    vgps.forEach(vgp => {
      const jours = joursAvantExpiration(vgp.dateExpiration)
      if (jours < 0) {
        alertes.critiques.push({
          type: 'VGP expiré',
          message: `${vgp.nomMateriel} - VGP expiré depuis ${Math.abs(jours)} jours`,
          jours
        })
      } else if (jours <= 7) {
        alertes.critiques.push({
          type: 'VGP < 7j',
          message: `${vgp.nomMateriel} - VGP expire dans ${jours}j`,
          jours
        })
      } else if (jours <= 30) {
        alertes.importantes.push({
          type: 'VGP < 30j',
          message: `${vgp.nomMateriel} - VGP expire dans ${jours}j`,
          jours
        })
      }
    })

    // Demandes de modification > 48h
    const demandes = interventions.filter(i => i.statut === 'Demande modification')
    demandes.forEach(d => {
      if (d.demandeChangement) {
        const demandeLe = new Date(d.demandeChangement.demandeLe)
        const heures = (aujourdhui.getTime() - demandeLe.getTime()) / (1000 * 60 * 60)
        if (heures > 48) {
          alertes.importantes.push({
            type: 'Demande > 48h',
            message: `${d.clientName} - ${d.siteName} en attente depuis ${Math.floor(heures)}h`,
            jours: Math.floor(heures / 24)
          })
        }
      }
    })

    // Interventions demain
    const interventionsDemain = interventions.filter(i => {
      const dateDebut = new Date(i.dateDebut)
      return dateDebut.toDateString() === demain.toDateString() && i.statut === 'Planifiée'
    })
    if (interventionsDemain.length > 0) {
      alertes.info.push({
        type: 'Interventions demain',
        message: `${interventionsDemain.length} intervention(s) prévue(s) demain`
      })
    }

    // Demandes en cours
    if (demandes.length > 0) {
      alertes.info.push({
        type: 'Demandes en cours',
        message: `${demandes.length} demande(s) de modification en attente`
      })
    }

    return alertes
  } catch (error) {
    console.error('Erreur calcul alertes:', error)
    return {
      critiques: [],
      importantes: [],
      info: []
    }
  }
}