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

export interface CategorieDepense {
  id: string
  nom: string
  couleur: string
  icon: string
  type: 'fixe' | 'variable'
  ordre: number
  description?: string
  actif: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Catégories par défaut
 */
export const CATEGORIES_PAR_DEFAUT: Omit<CategorieDepense, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // VARIABLES
  {
    nom: 'Salaires',
    couleur: '#3B82F6',
    icon: '👥',
    type: 'fixe',
    ordre: 1,
    description: 'Salaires et charges sociales',
    actif: true
  },
  {
    nom: 'Carburant',
    couleur: '#EF4444',
    icon: '⛽',
    type: 'variable',
    ordre: 2,
    description: 'Essence, diesel, AdBlue',
    actif: true
  },
  {
    nom: 'Péages',
    couleur: '#F59E0B',
    icon: '🛣️',
    type: 'variable',
    ordre: 3,
    description: 'Péages autoroutiers',
    actif: true
  },
  {
    nom: 'Entretien véhicules',
    couleur: '#8B5CF6',
    icon: '🔧',
    type: 'variable',
    ordre: 4,
    description: 'Réparations, vidanges, pièces',
    actif: true
  },
  {
    nom: 'Fournitures',
    couleur: '#10B981',
    icon: '📦',
    type: 'variable',
    ordre: 5,
    description: 'Matériel, consommables',
    actif: true
  },
  {
    nom: 'Repas',
    couleur: '#F97316',
    icon: '🍽️',
    type: 'variable',
    ordre: 6,
    description: 'Restaurants, tickets restaurant',
    actif: true
  },
  // FIXES
  {
    nom: 'Assurances',
    couleur: '#06B6D4',
    icon: '🛡️',
    type: 'fixe',
    ordre: 7,
    description: 'Assurances véhicules, RC pro',
    actif: true
  },
  {
    nom: 'Loyers',
    couleur: '#84CC16',
    icon: '🏢',
    type: 'fixe',
    ordre: 8,
    description: 'Loyers locaux, entrepôts',
    actif: true
  },
  {
    nom: 'Abonnements',
    couleur: '#A855F7',
    icon: '📱',
    type: 'fixe',
    ordre: 9,
    description: 'Téléphonie, internet, logiciels',
    actif: true
  },
  {
    nom: 'Location véhicules',
    couleur: '#EC4899',
    icon: '🚛',
    type: 'fixe',
    ordre: 10,
    description: 'Leasing, LOA',
    actif: true
  },
  {
    nom: 'Crédits',
    couleur: '#6366F1',
    icon: '🏦',
    type: 'fixe',
    ordre: 11,
    description: 'Remboursements emprunts',
    actif: true
  },
  {
    nom: 'Autres',
    couleur: '#64748B',
    icon: '📝',
    type: 'variable',
    ordre: 99,
    description: 'Dépenses diverses',
    actif: true
  }
]

/**
 * Initialiser les catégories par défaut
 */
export async function initCategoriesParDefaut(): Promise<void> {
  try {
    const categoriesExistantes = await getAllCategories()
    
    if (categoriesExistantes.length === 0) {
      for (const cat of CATEGORIES_PAR_DEFAUT) {
        await createCategorie(cat)
      }
      console.log('✅ Catégories par défaut initialisées')
    }
  } catch (error) {
    console.error('Erreur initialisation catégories:', error)
    throw error
  }
}

/**
 * Récupérer toutes les catégories
 */
export async function getAllCategories(): Promise<CategorieDepense[]> {
  try {
    const categoriesRef = collection(db, 'categories_depenses')
    const q = query(categoriesRef, orderBy('ordre', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CategorieDepense))
  } catch (error) {
    console.error('Erreur récupération catégories:', error)
    throw error
  }
}

/**
 * Récupérer une catégorie par ID
 */
export async function getCategorieById(id: string): Promise<CategorieDepense | null> {
  try {
    const categorieRef = doc(db, 'categories_depenses', id)
    const categorieSnap = await getDoc(categorieRef)
    
    if (!categorieSnap.exists()) {
      return null
    }
    
    return {
      id: categorieSnap.id,
      ...categorieSnap.data()
    } as CategorieDepense
  } catch (error) {
    console.error('Erreur récupération catégorie:', error)
    throw error
  }
}

/**
 * Créer une nouvelle catégorie
 */
export async function createCategorie(
  categorie: Omit<CategorieDepense, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const categorieData = {
      ...categorie,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const categorieRef = doc(collection(db, 'categories_depenses'))
    await setDoc(categorieRef, categorieData)
    
    return categorieRef.id
  } catch (error) {
    console.error('Erreur création catégorie:', error)
    throw error
  }
}

/**
 * Modifier une catégorie
 */
export async function updateCategorie(
  id: string,
  categorie: Partial<Omit<CategorieDepense, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const updates: any = {
      ...categorie,
      updatedAt: new Date().toISOString()
    }
    
    await updateDoc(doc(db, 'categories_depenses', id), updates)
  } catch (error) {
    console.error('Erreur modification catégorie:', error)
    throw error
  }
}

/**
 * Supprimer une catégorie
 */
export async function deleteCategorie(id: string): Promise<void> {
  try {
    // Vérifier si la catégorie est utilisée
    const estUtilisee = await isCategorieUtilisee(id)
    
    if (estUtilisee) {
      throw new Error('Cette catégorie est utilisée et ne peut pas être supprimée')
    }
    
    await deleteDoc(doc(db, 'categories_depenses', id))
  } catch (error) {
    console.error('Erreur suppression catégorie:', error)
    throw error
  }
}

/**
 * Vérifier si une catégorie est utilisée
 */
export async function isCategorieUtilisee(categorieId: string): Promise<boolean> {
  try {
    // Vérifier dans factures fournisseurs
    const facturesRef = collection(db, 'factures_fournisseurs')
    const facturesSnap = await getDocs(facturesRef)
    const utiliseeFactures = facturesSnap.docs.some(doc => 
      doc.data().categorie === categorieId
    )
    
    if (utiliseeFactures) return true
    
    // Vérifier dans notes de frais
    const notesRef = collection(db, 'notes_de_frais')
    const notesSnap = await getDocs(notesRef)
    const utiliseeNotes = notesSnap.docs.some(doc => 
      doc.data().categorie === categorieId
    )
    
    if (utiliseeNotes) return true
    
    // Vérifier dans charges fixes
    const chargesRef = collection(db, 'charges_fixes')
    const chargesSnap = await getDocs(chargesRef)
    const utiliseeCharges = chargesSnap.docs.some(doc => 
      doc.data().categorie === categorieId
    )
    
    return utiliseeCharges
  } catch (error) {
    console.error('Erreur vérification utilisation catégorie:', error)
    return true // Par sécurité, considérer comme utilisée en cas d'erreur
  }
}

/**
 * Réorganiser les catégories
 */
export async function reorderCategories(categoriesOrdered: string[]): Promise<void> {
  try {
    for (let i = 0; i < categoriesOrdered.length; i++) {
      await updateDoc(doc(db, 'categories_depenses', categoriesOrdered[i]), {
        ordre: i + 1,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Erreur réorganisation catégories:', error)
    throw error
  }
}

/**
 * Activer/Désactiver une catégorie
 */
export async function toggleCategorieActif(id: string, actif: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'categories_depenses', id), {
      actif,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur toggle catégorie:', error)
    throw error
  }
}

/**
 * Récupérer les catégories actives
 */
export async function getCategoriesActives(): Promise<CategorieDepense[]> {
  try {
    const categories = await getAllCategories()
    return categories.filter(c => c.actif)
  } catch (error) {
    console.error('Erreur récupération catégories actives:', error)
    throw error
  }
}

/**
 * Récupérer les catégories par type
 */
export async function getCategoriesByType(type: 'fixe' | 'variable'): Promise<CategorieDepense[]> {
  try {
    const categories = await getAllCategories()
    return categories.filter(c => c.type === type)
  } catch (error) {
    console.error('Erreur récupération catégories par type:', error)
    throw error
  }
}
