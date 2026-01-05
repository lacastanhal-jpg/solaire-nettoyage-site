import { db } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore'

const COLLECTION = 'fournisseurs'

export interface Fournisseur {
  id: string
  nom: string
  siret?: string
  adresse?: string
  codePostal?: string
  ville?: string
  email?: string
  telephone?: string
  contactNom?: string
  contactTelephone?: string
  iban?: string
  bic?: string
  delaiPaiement: number          // 30 jours par défaut
  notes?: string
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface FournisseurInput {
  nom: string
  siret?: string
  adresse?: string
  codePostal?: string
  ville?: string
  email?: string
  telephone?: string
  contactNom?: string
  contactTelephone?: string
  iban?: string
  bic?: string
  delaiPaiement?: number
  notes?: string
  actif?: boolean
}

/**
 * Nettoyer les valeurs undefined d'un objet
 */
function cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {}
  
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    
    if (value !== undefined) {
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? cleanUndefined(item) 
            : item
        )
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanUndefined(value)
      } else {
        cleaned[key] = value
      }
    }
  })
  
  return cleaned
}

/**
 * Créer un fournisseur
 */
export async function createFournisseur(data: FournisseurInput): Promise<string> {
  try {
    const docData = cleanUndefined({
      ...data,
      delaiPaiement: data.delaiPaiement ?? 30,
      actif: data.actif ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    const docRef = await addDoc(collection(db, COLLECTION), docData)
    return docRef.id
  } catch (error) {
    console.error('Erreur création fournisseur:', error)
    throw new Error('Impossible de créer le fournisseur')
  }
}

/**
 * Récupérer un fournisseur par ID
 */
export async function getFournisseurById(id: string): Promise<Fournisseur | null> {
  try {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Fournisseur
    }
    return null
  } catch (error) {
    console.error('Erreur récupération fournisseur:', error)
    return null
  }
}

/**
 * Récupérer tous les fournisseurs
 */
export async function getAllFournisseurs(): Promise<Fournisseur[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy('nom', 'asc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Fournisseur[]
  } catch (error) {
    console.error('Erreur récupération fournisseurs:', error)
    return []
  }
}

/**
 * Récupérer les fournisseurs actifs
 */
export async function getFournisseursActifs(): Promise<Fournisseur[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('actif', '==', true),
      orderBy('nom', 'asc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Fournisseur[]
  } catch (error) {
    console.error('Erreur récupération fournisseurs actifs:', error)
    return []
  }
}

/**
 * Mettre à jour un fournisseur
 */
export async function updateFournisseur(
  id: string, 
  data: Partial<FournisseurInput>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id)
    const updateData = cleanUndefined({
      ...data,
      updatedAt: new Date().toISOString()
    })
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Erreur mise à jour fournisseur:', error)
    throw new Error('Impossible de mettre à jour le fournisseur')
  }
}

/**
 * Supprimer un fournisseur (soft delete - désactivation)
 */
export async function deleteFournisseur(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id)
    await updateDoc(docRef, {
      actif: false,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur suppression fournisseur:', error)
    throw new Error('Impossible de supprimer le fournisseur')
  }
}

/**
 * Vérifier si un fournisseur existe par nom
 */
export async function fournisseurExistsByNom(nom: string, excludeId?: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('nom', '==', nom)
    )
    
    const snapshot = await getDocs(q)
    
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId)
    }
    
    return !snapshot.empty
  } catch (error) {
    console.error('Erreur vérification fournisseur:', error)
    return false
  }
}

/**
 * Rechercher des fournisseurs par nom (autocomplete)
 */
export async function searchFournisseursByNom(searchTerm: string): Promise<Fournisseur[]> {
  try {
    const fournisseurs = await getFournisseursActifs()
    const term = searchTerm.toLowerCase()
    
    return fournisseurs.filter(f => 
      f.nom.toLowerCase().includes(term)
    )
  } catch (error) {
    console.error('Erreur recherche fournisseurs:', error)
    return []
  }
}

/**
 * Obtenir la liste des noms de fournisseurs (pour autocomplete simple)
 */
export async function getListeNomsFournisseurs(): Promise<string[]> {
  try {
    const fournisseurs = await getFournisseursActifs()
    return fournisseurs.map(f => f.nom).sort()
  } catch (error) {
    console.error('Erreur liste noms fournisseurs:', error)
    return []
  }
}
