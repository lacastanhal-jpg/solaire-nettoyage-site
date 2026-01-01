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

const COLLECTION = 'affectations_articles_embarques'

export interface AffectationEquipement {
  id: string
  equipementId: string
  equipementImmat: string
  articleId: string
  articleCode: string
  articleDescription: string
  dateAffectation: string
  permanent: boolean // true = affectation permanente, false = temporaire
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AffectationEquipementInput = Omit<AffectationEquipement, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Créer une affectation article → équipement
 * Simple tag pour marquer qu'un article est utilisé sur un équipement
 */
export async function createAffectation(data: AffectationEquipementInput): Promise<string> {
  try {
    const affectation = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), affectation)
    return docRef.id
  } catch (error) {
    console.error('Erreur création affectation:', error)
    throw error
  }
}

/**
 * Récupérer toutes les affectations
 */
export async function getAllAffectations(): Promise<AffectationEquipement[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION))
    
    const affectations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AffectationEquipement[]
    
    // Trier en mémoire
    return affectations.sort((a, b) => 
      new Date(b.dateAffectation).getTime() - new Date(a.dateAffectation).getTime()
    )
  } catch (error) {
    console.error('Erreur récupération affectations:', error)
    return []
  }
}

/**
 * Récupérer les affectations d'un équipement
 */
export async function getAffectationsByEquipement(equipementId: string): Promise<AffectationEquipement[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('equipementId', '==', equipementId)
    )
    const snapshot = await getDocs(q)
    
    const affectations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AffectationEquipement[]
    
    // Trier en mémoire au lieu de dans la requête
    return affectations.sort((a, b) => 
      new Date(b.dateAffectation).getTime() - new Date(a.dateAffectation).getTime()
    )
  } catch (error) {
    console.error('Erreur récupération affectations équipement:', error)
    return []
  }
}

/**
 * Récupérer les affectations d'un article
 */
export async function getAffectationsByArticle(articleId: string): Promise<AffectationEquipement[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('articleId', '==', articleId)
    )
    const snapshot = await getDocs(q)
    
    const affectations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AffectationEquipement[]
    
    // Trier en mémoire
    return affectations.sort((a, b) => 
      new Date(b.dateAffectation).getTime() - new Date(a.dateAffectation).getTime()
    )
  } catch (error) {
    console.error('Erreur récupération affectations article:', error)
    return []
  }
}

/**
 * Récupérer une affectation par ID
 */
export async function getAffectationById(id: string): Promise<AffectationEquipement | null> {
  try {
    const affectationRef = doc(db, COLLECTION, id)
    const affectationSnap = await getDoc(affectationRef)
    
    if (!affectationSnap.exists()) {
      return null
    }
    
    return {
      id: affectationSnap.id,
      ...affectationSnap.data()
    } as AffectationEquipement
  } catch (error) {
    console.error('Erreur récupération affectation:', error)
    throw error
  }
}

/**
 * Mettre à jour une affectation
 */
export async function updateAffectation(
  id: string,
  data: Partial<AffectationEquipementInput>
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
 * Supprimer une affectation
 */
export async function deleteAffectation(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression affectation:', error)
    throw error
  }
}

/**
 * Récupérer le nombre d'équipements sur lesquels l'article est affecté
 */
export async function getNombreAffectationsArticle(articleId: string): Promise<number> {
  try {
    const affectations = await getAffectationsByArticle(articleId)
    return affectations.length
  } catch (error) {
    console.error('Erreur comptage affectations:', error)
    return 0
  }
}

/**
 * @deprecated Use getNombreAffectationsArticle instead
 * Alias pour compatibilité
 */
export const getStockEmbarqueArticle = getNombreAffectationsArticle

/**
 * Vérifier si un article est déjà affecté à un équipement
 */
export async function articleDejaAffecte(
  articleId: string,
  equipementId: string
): Promise<AffectationEquipement | null> {
  try {
    const affectations = await getAffectationsByEquipement(equipementId)
    return affectations.find(aff => aff.articleId === articleId) || null
  } catch (error) {
    console.error('Erreur vérification affectation:', error)
    return null
  }
}
