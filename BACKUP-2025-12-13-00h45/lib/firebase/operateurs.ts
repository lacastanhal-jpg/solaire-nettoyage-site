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

export interface Operateur {
  id?: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  statut: 'Disponible' | 'Congé' | 'Arrêt maladie'
  role: 'Admin' | 'Operateur'
  dateDebut: string // Date d'embauche ISO format
  certificationRef?: string // Référence vers système certifications
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CongeOperateur {
  id?: string
  operateurId: string
  operateurNom: string
  dateDebut: string // ISO format
  dateFin: string // ISO format
  type: 'Congé payé' | 'RTT' | 'Maladie' | 'Formation' | 'Autre'
  motif?: string
  createdAt: string
}

// ============================================================================
// FONCTIONS OPÉRATEURS
// ============================================================================

/**
 * Créer un nouvel opérateur
 */
export async function createOperateur(operateur: Omit<Operateur, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'operateurs'), {
      ...operateur,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création opérateur:', error)
    throw error
  }
}

/**
 * Récupérer tous les opérateurs
 */
export async function getAllOperateurs(): Promise<(Operateur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'operateurs'), orderBy('nom', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Operateur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération opérateurs:', error)
    return []
  }
}

/**
 * Récupérer opérateurs disponibles
 */
export async function getOperateursDisponibles(): Promise<(Operateur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'operateurs'),
        where('statut', '==', 'Disponible'),
        orderBy('nom', 'asc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Operateur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération opérateurs disponibles:', error)
    return []
  }
}

/**
 * Récupérer un opérateur par ID
 */
export async function getOperateurById(id: string): Promise<(Operateur & { id: string }) | null> {
  try {
    const docSnap = await getDoc(doc(db, 'operateurs', id))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Operateur & { id: string }
    }
    return null
  } catch (error) {
    console.error('Erreur récupération opérateur:', error)
    return null
  }
}

/**
 * Mettre à jour un opérateur
 */
export async function updateOperateur(id: string, updates: Partial<Operateur>) {
  try {
    await updateDoc(doc(db, 'operateurs', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour opérateur:', error)
    throw error
  }
}

/**
 * Supprimer un opérateur
 */
export async function deleteOperateur(id: string) {
  try {
    await deleteDoc(doc(db, 'operateurs', id))
  } catch (error) {
    console.error('Erreur suppression opérateur:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS CONGÉS
// ============================================================================

/**
 * Créer un congé
 */
export async function createConge(conge: Omit<CongeOperateur, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'conges'), {
      ...conge,
      createdAt: new Date().toISOString()
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création congé:', error)
    throw error
  }
}

/**
 * Récupérer congés d'un opérateur
 */
export async function getCongesByOperateur(operateurId: string): Promise<(CongeOperateur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'conges'),
        where('operateurId', '==', operateurId),
        orderBy('dateDebut', 'desc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CongeOperateur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération congés:', error)
    return []
  }
}

/**
 * Supprimer un congé
 */
export async function deleteConge(id: string) {
  try {
    await deleteDoc(doc(db, 'conges', id))
  } catch (error) {
    console.error('Erreur suppression congé:', error)
    throw error
  }
}

/**
 * Vérifier si un opérateur est disponible à une date
 */
export async function isOperateurDisponible(operateurId: string, date: string): Promise<boolean> {
  try {
    // Vérifier statut opérateur
    const operateur = await getOperateurById(operateurId)
    if (!operateur || operateur.statut !== 'Disponible') {
      return false
    }

    // Vérifier congés
    const conges = await getCongesByOperateur(operateurId)
    const dateCheck = new Date(date)
    
    for (const conge of conges) {
      const debut = new Date(conge.dateDebut)
      const fin = new Date(conge.dateFin)
      if (dateCheck >= debut && dateCheck <= fin) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Erreur vérification disponibilité:', error)
    return false
  }
}
