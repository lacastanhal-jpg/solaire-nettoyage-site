import { db } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore'

export interface Equipe {
  id: string
  nom: string
  type: 'interne' | 'sous-traitant'
  responsable?: string
  operateurs?: string[] // IDs des opérateurs
  actif: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Récupérer toutes les équipes
 */
export async function getAllEquipes(): Promise<Equipe[]> {
  try {
    const equipesRef = collection(db, 'equipes')
    const q = query(equipesRef, orderBy('nom', 'asc'))
    const snapshot = await getDocs(q)
    
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
 * Récupérer une équipe par ID
 */
export async function getEquipeById(id: string): Promise<Equipe | null> {
  try {
    const equipeRef = doc(db, 'equipes', id)
    const equipeSnap = await getDoc(equipeRef)
    
    if (!equipeSnap.exists()) {
      return null
    }
    
    return {
      id: equipeSnap.id,
      ...equipeSnap.data()
    } as Equipe
  } catch (error) {
    console.error('Erreur récupération équipe:', error)
    return null
  }
}

/**
 * Créer une équipe
 */
export async function createEquipe(equipe: Omit<Equipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const equipeRef = doc(collection(db, 'equipes'))
    
    await setDoc(equipeRef, {
      ...equipe,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return equipeRef.id
  } catch (error) {
    console.error('Erreur création équipe:', error)
    throw error
  }
}

/**
 * Modifier une équipe
 */
export async function updateEquipe(id: string, equipe: Partial<Equipe>): Promise<void> {
  try {
    const equipeRef = doc(db, 'equipes', id)
    
    await updateDoc(equipeRef, {
      ...equipe,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur modification équipe:', error)
    throw error
  }
}

/**
 * Supprimer une équipe
 */
export async function deleteEquipe(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'equipes', id))
  } catch (error) {
    console.error('Erreur suppression équipe:', error)
    throw error
  }
}
