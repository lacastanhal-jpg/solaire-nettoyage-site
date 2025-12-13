import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './config'

export interface Groupe {
  id: string
  nom: string
  contactPrincipal: string
  email: string
  password: string  // MOT DE PASSE POUR LOGIN
  telephone: string
  adresse: string
  siret: string
  description: string
  createdAt: string
  active: boolean
}

const GROUPES_COLLECTION = 'groupes'

// Créer un nouveau groupe
export async function createGroupe(groupeData: Omit<Groupe, 'id'>): Promise<string> {
  try {
    const groupeRef = doc(collection(db, GROUPES_COLLECTION))
    await setDoc(groupeRef, groupeData)
    return groupeRef.id
  } catch (error) {
    console.error('Erreur création groupe:', error)
    throw error
  }
}

// Récupérer tous les groupes
export async function getAllGroupes(): Promise<Groupe[]> {
  try {
    const groupesRef = collection(db, GROUPES_COLLECTION)
    const q = query(groupesRef, orderBy('nom', 'asc'))
    const snapshot = await getDocs(q)
    
    const groupes: Groupe[] = []
    snapshot.forEach((doc) => {
      groupes.push({
        id: doc.id,
        ...doc.data()
      } as Groupe)
    })
    
    return groupes
  } catch (error) {
    console.error('Erreur récupération groupes:', error)
    return []
  }
}

// Récupérer un groupe par ID
export async function getGroupeById(groupeId: string): Promise<Groupe | null> {
  try {
    const groupeRef = doc(db, GROUPES_COLLECTION, groupeId)
    const groupeSnap = await getDoc(groupeRef)
    
    if (!groupeSnap.exists()) {
      return null
    }
    
    return {
      id: groupeSnap.id,
      ...groupeSnap.data()
    } as Groupe
  } catch (error) {
    console.error('Erreur récupération groupe:', error)
    return null
  }
}

// Récupérer un groupe par nom
export async function getGroupeByNom(nom: string): Promise<Groupe | null> {
  try {
    const groupesRef = collection(db, GROUPES_COLLECTION)
    const q = query(groupesRef, where('nom', '==', nom))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Groupe
  } catch (error) {
    console.error('Erreur recherche groupe:', error)
    return null
  }
}

// NOUVELLE FONCTION : Vérifier les credentials du groupe pour login
export async function verifyGroupeCredentials(
  email: string, 
  password: string
): Promise<Groupe | null> {
  try {
    const groupesRef = collection(db, GROUPES_COLLECTION)
    const q = query(
      groupesRef,
      where('email', '==', email),
      where('password', '==', password),
      where('active', '==', true)
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Groupe
  } catch (error) {
    console.error('Erreur vérification credentials groupe:', error)
    return null
  }
}

// Mettre à jour un groupe
export async function updateGroupe(
  groupeId: string, 
  updates: Partial<Omit<Groupe, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const groupeRef = doc(db, GROUPES_COLLECTION, groupeId)
    await updateDoc(groupeRef, updates)
  } catch (error) {
    console.error('Erreur mise à jour groupe:', error)
    throw error
  }
}

// Supprimer un groupe
export async function deleteGroupe(groupeId: string): Promise<void> {
  try {
    const groupeRef = doc(db, GROUPES_COLLECTION, groupeId)
    await deleteDoc(groupeRef)
  } catch (error) {
    console.error('Erreur suppression groupe:', error)
    throw error
  }
}

// Compter les groupes actifs
export async function countGroupesActifs(): Promise<number> {
  try {
    const groupesRef = collection(db, GROUPES_COLLECTION)
    const q = query(groupesRef, where('active', '==', true))
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('Erreur comptage groupes:', error)
    return 0
  }
}
