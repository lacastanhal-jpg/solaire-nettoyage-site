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
  orderBy,
  Timestamp
} from 'firebase/firestore'

// ============================================================================
// TYPES
// ============================================================================

export interface InterventionCalendar {
  id?: string
  siteId: string
  siteName: string
  clientId: string
  clientName: string
  groupeId: string
  equipeId: 1 | 2 | 3
  equipeName: string
  date: string // ISO format "2025-01-15T09:00:00"
  duree: number // heures
  surface: number // m²
  type: 'Standard' | 'Urgence' | 'Maintenance'
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée' | 'Demande modification'
  rapportUrl?: string
  notes?: string
  recurrence?: {
    frequence: '1mois' | '3mois' | '6mois' | '1an'
    prochaine: string // ISO date
  } | null
  demandeChangement?: {
    nouvelleDateSouhaitee: string
    raison: string
    demandeLe: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface Equipe {
  id: string
  numero: 1 | 2 | 3
  nom: string
  type: string // "Semi-remorque 44t", "Porteur 26t"
  materiel: string
  email: string
  password: string
  membres: string[] // Legacy
  membresIds?: string[] // IDs opérateurs Firebase
  membresNoms?: string[] // Noms complets opérateurs
  active: boolean
}

// ============================================================================
// FONCTIONS INTERVENTIONS CALENDAR
// ============================================================================

/**
 * Créer une nouvelle intervention
 */
export async function createInterventionCalendar(intervention: Omit<InterventionCalendar, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'interventions_calendar'), {
      ...intervention,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création intervention:', error)
    throw error
  }
}

/**
 * Récupérer toutes les interventions
 */
export async function getAllInterventionsCalendar(): Promise<(InterventionCalendar & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'interventions_calendar'), orderBy('date', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionCalendar & { id: string }))
  } catch (error) {
    console.error('Erreur récupération interventions:', error)
    return []
  }
}

/**
 * Récupérer interventions par équipe
 */
export async function getInterventionsByEquipe(equipeId: number): Promise<(InterventionCalendar & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'interventions_calendar'),
        where('equipeId', '==', equipeId),
        orderBy('date', 'asc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionCalendar & { id: string }))
  } catch (error) {
    console.error('Erreur récupération interventions équipe:', error)
    return []
  }
}

/**
 * Récupérer interventions par client
 */
export async function getInterventionsByClientCalendar(clientId: string): Promise<(InterventionCalendar & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'interventions_calendar'),
        where('clientId', '==', clientId),
        orderBy('date', 'desc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionCalendar & { id: string }))
  } catch (error) {
    console.error('Erreur récupération interventions client:', error)
    return []
  }
}

/**
 * Récupérer interventions par site
 */
export async function getInterventionsBySiteCalendar(siteId: string): Promise<(InterventionCalendar & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'interventions_calendar'),
        where('siteId', '==', siteId),
        orderBy('date', 'desc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionCalendar & { id: string }))
  } catch (error) {
    console.error('Erreur récupération interventions site:', error)
    return []
  }
}

/**
 * Récupérer interventions par période
 */
export async function getInterventionsByPeriode(debut: string, fin: string): Promise<(InterventionCalendar & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'interventions_calendar'),
        where('date', '>=', debut),
        where('date', '<=', fin),
        orderBy('date', 'asc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InterventionCalendar & { id: string }))
  } catch (error) {
    console.error('Erreur récupération interventions période:', error)
    return []
  }
}

/**
 * Mettre à jour une intervention
 */
export async function updateInterventionCalendar(id: string, updates: Partial<InterventionCalendar>) {
  try {
    await updateDoc(doc(db, 'interventions_calendar', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour intervention:', error)
    throw error
  }
}

/**
 * Supprimer une intervention
 */
export async function deleteInterventionCalendar(id: string) {
  try {
    await deleteDoc(doc(db, 'interventions_calendar', id))
  } catch (error) {
    console.error('Erreur suppression intervention:', error)
    throw error
  }
}

/**
 * Demander changement de date (client)
 */
export async function demanderChangementDate(
  interventionId: string,
  nouvelleDateSouhaitee: string,
  raison: string
) {
  try {
    await updateDoc(doc(db, 'interventions_calendar', interventionId), {
      statut: 'Demande modification',
      demandeChangement: {
        nouvelleDateSouhaitee,
        raison,
        demandeLe: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur demande changement:', error)
    throw error
  }
}

/**
 * Accepter demande changement (admin)
 */
export async function accepterChangementDate(interventionId: string, nouvelleDate: string) {
  try {
    await updateDoc(doc(db, 'interventions_calendar', interventionId), {
      date: nouvelleDate,
      statut: 'Planifiée',
      demandeChangement: null,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur acceptation changement:', error)
    throw error
  }
}

/**
 * Refuser demande changement (admin)
 */
export async function refuserChangementDate(interventionId: string) {
  try {
    await updateDoc(doc(db, 'interventions_calendar', interventionId), {
      statut: 'Planifiée',
      demandeChangement: null,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur refus changement:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS ÉQUIPES
// ============================================================================

/**
 * Créer une équipe
 */
export async function createEquipe(equipe: Omit<Equipe, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'equipes'), equipe)
    return docRef.id
  } catch (error) {
    console.error('Erreur création équipe:', error)
    throw error
  }
}

/**
 * Récupérer toutes les équipes
 */
export async function getAllEquipes(): Promise<Equipe[]> {
  try {
    const snapshot = await getDocs(collection(db, 'equipes'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Equipe))
  } catch (error) {
    console.error('Erreur récupération équipes:', error)
    return []
  }
}

/**
 * Vérifier credentials équipe
 */
export async function verifyEquipeCredentials(email: string, password: string): Promise<Equipe | null> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'equipes'),
        where('email', '==', email),
        where('password', '==', password),
        where('active', '==', true)
      )
    )
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Equipe
  } catch (error) {
    console.error('Erreur vérification équipe:', error)
    return null
  }
}

/**
 * Mettre à jour la composition d'une équipe
 */
export async function updateEquipeComposition(
  equipeId: string, 
  membresIds: string[], 
  membresNoms: string[]
) {
  try {
    await updateDoc(doc(db, 'equipes', equipeId), {
      membresIds,
      membresNoms,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour composition équipe:', error)
    throw error
  }
}

/**
 * Récupérer une équipe par ID
 */
export async function getEquipeById(equipeId: string): Promise<(Equipe & { id: string }) | null> {
  try {
    const docSnap = await getDoc(doc(db, 'equipes', equipeId))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Equipe & { id: string }
    }
    return null
  } catch (error) {
    console.error('Erreur récupération équipe:', error)
    return null
  }
}
