import { db } from './config'
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

const COLLECTION = 'affectations_accessoires'

export interface AffectationAccessoire {
  id: string
  accessoireId: string // ID équipement accessoire (nacelle, échafaudage)
  accessoireImmat: string
  accessoireType: string
  vehiculeId: string // ID équipement véhicule parent (porteur, semi)
  vehiculeImmat: string
  dateAffectation: string
  permanent: boolean // true = affectation permanente, false = temporaire
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AffectationAccessoireInput = Omit<AffectationAccessoire, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Créer une affectation accessoire → véhicule
 */
export async function createAffectationAccessoire(data: AffectationAccessoireInput): Promise<string> {
  try {
    const affectation = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), affectation)
    return docRef.id
  } catch (error) {
    console.error('Erreur création affectation accessoire:', error)
    throw error
  }
}

/**
 * Récupérer toutes les affectations accessoires
 */
export async function getAllAffectationsAccessoires(): Promise<AffectationAccessoire[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('dateAffectation', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AffectationAccessoire[]
  } catch (error) {
    console.error('Erreur récupération affectations accessoires:', error)
    return []
  }
}

/**
 * Récupérer les affectations par véhicule (accessoires sur ce véhicule)
 */
export async function getAffectationsAccessoiresParVehicule(vehiculeId: string): Promise<AffectationAccessoire[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('vehiculeId', '==', vehiculeId),
      orderBy('dateAffectation', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AffectationAccessoire[]
  } catch (error) {
    console.error('Erreur récupération affectations véhicule:', error)
    return []
  }
}

/**
 * Récupérer l'affectation d'un accessoire (sur quel véhicule il est)
 */
export async function getAffectationAccessoire(accessoireId: string): Promise<AffectationAccessoire | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('accessoireId', '==', accessoireId)
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) return null
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as AffectationAccessoire
  } catch (error) {
    console.error('Erreur récupération affectation accessoire:', error)
    return null
  }
}

/**
 * Récupérer une affectation par ID
 */
export async function getAffectationAccessoireById(id: string): Promise<AffectationAccessoire | null> {
  try {
    const affectationRef = doc(db, COLLECTION, id)
    const affectationSnap = await getDoc(affectationRef)
    
    if (!affectationSnap.exists()) {
      return null
    }
    
    return {
      id: affectationSnap.id,
      ...affectationSnap.data()
    } as AffectationAccessoire
  } catch (error) {
    console.error('Erreur récupération affectation:', error)
    throw error
  }
}

/**
 * Mettre à jour une affectation accessoire
 */
export async function updateAffectationAccessoire(
  id: string,
  data: Partial<AffectationAccessoireInput>
): Promise<void> {
  try {
    const affectationRef = doc(db, COLLECTION, id)
    await updateDoc(affectationRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour affectation:', error)
    throw error
  }
}

/**
 * Supprimer une affectation accessoire
 */
export async function deleteAffectationAccessoire(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression affectation:', error)
    throw error
  }
}

/**
 * Vérifier si un accessoire est déjà affecté
 */
export async function accessoireDejaAffecte(accessoireId: string): Promise<AffectationAccessoire | null> {
  try {
    return await getAffectationAccessoire(accessoireId)
  } catch (error) {
    console.error('Erreur vérification affectation:', error)
    return null
  }
}
