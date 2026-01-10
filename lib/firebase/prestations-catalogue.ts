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
import type { 
  PrestationCatalogue, 
  PrestationCatalogueInput 
} from '@/lib/types/tarification'

// Réexporter les types pour les autres modules
export type { PrestationCatalogue, PrestationCatalogueInput }

const COLLECTION = 'prestations_catalogue'

/**
 * Créer une nouvelle prestation
 */
export async function createPrestation(
  data: PrestationCatalogueInput
): Promise<string> {
  try {
    const prestation: Omit<PrestationCatalogue, 'id'> = {
      code: data.code.toUpperCase(),
      libelle: data.libelle,
      description: data.description,
      unite: data.unite,
      categorie: data.categorie,
      prixBase: data.prixBase,
      tauxTVA: data.tauxTVA,
      compteComptable: data.compteComptable,
      actif: data.actif !== undefined ? data.actif : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), prestation)
    return docRef.id
  } catch (error) {
    console.error('Erreur création prestation:', error)
    throw error
  }
}

/**
 * Récupérer toutes les prestations
 */
export async function getAllPrestations(): Promise<PrestationCatalogue[]> {
  try {
    const prestationsRef = collection(db, COLLECTION)
    const q = query(prestationsRef, orderBy('code', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PrestationCatalogue))
  } catch (error) {
    console.error('Erreur récupération prestations:', error)
    throw error
  }
}

/**
 * Récupérer les prestations actives
 */
export async function getPrestationsActives(): Promise<PrestationCatalogue[]> {
  try {
    const prestationsRef = collection(db, COLLECTION)
    const q = query(
      prestationsRef,
      where('actif', '==', true),
      orderBy('code', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PrestationCatalogue))
  } catch (error) {
    console.error('Erreur récupération prestations actives:', error)
    throw error
  }
}

/**
 * Récupérer les prestations par catégorie
 */
export async function getPrestationsParCategorie(
  categorie: string
): Promise<PrestationCatalogue[]> {
  try {
    const prestationsRef = collection(db, COLLECTION)
    const q = query(
      prestationsRef,
      where('categorie', '==', categorie),
      where('actif', '==', true),
      orderBy('code', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PrestationCatalogue))
  } catch (error) {
    console.error('Erreur récupération prestations par catégorie:', error)
    throw error
  }
}

/**
 * Récupérer une prestation par ID
 */
export async function getPrestationById(
  id: string
): Promise<PrestationCatalogue | null> {
  try {
    const prestationRef = doc(db, COLLECTION, id)
    const prestationSnap = await getDoc(prestationRef)
    
    if (!prestationSnap.exists()) {
      return null
    }
    
    return {
      id: prestationSnap.id,
      ...prestationSnap.data()
    } as PrestationCatalogue
  } catch (error) {
    console.error('Erreur récupération prestation:', error)
    throw error
  }
}

/**
 * Récupérer une prestation par code
 */
export async function getPrestationByCode(
  code: string
): Promise<PrestationCatalogue | null> {
  try {
    const prestationsRef = collection(db, COLLECTION)
    const q = query(
      prestationsRef,
      where('code', '==', code.toUpperCase())
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as PrestationCatalogue
  } catch (error) {
    console.error('Erreur récupération prestation par code:', error)
    throw error
  }
}

/**
 * Mettre à jour une prestation
 */
export async function updatePrestation(
  id: string,
  data: Partial<PrestationCatalogueInput>
): Promise<void> {
  try {
    const updates: any = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    // Convertir le code en majuscules si présent
    if (updates.code) {
      updates.code = updates.code.toUpperCase()
    }
    
    await updateDoc(doc(db, COLLECTION, id), updates)
  } catch (error) {
    console.error('Erreur mise à jour prestation:', error)
    throw error
  }
}

/**
 * Désactiver une prestation (soft delete)
 */
export async function desactiverPrestation(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      actif: false,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur désactivation prestation:', error)
    throw error
  }
}

/**
 * Activer une prestation
 */
export async function activerPrestation(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      actif: true,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur activation prestation:', error)
    throw error
  }
}

/**
 * Supprimer une prestation (hard delete)
 */
export async function deletePrestation(id: string): Promise<void> {
  try {
    // Vérifier qu'elle n'est pas utilisée dans des grilles tarifaires
    // TODO: Ajouter cette vérification quand grilles-tarifaires.ts sera créé
    
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression prestation:', error)
    throw error
  }
}

/**
 * Vérifier si un code existe déjà
 */
export async function prestationCodeExists(
  code: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const prestation = await getPrestationByCode(code)
    
    if (!prestation) {
      return false
    }
    
    // Si on exclut un ID (pour update), vérifier que c'est pas le même
    if (excludeId && prestation.id === excludeId) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Erreur vérification code prestation:', error)
    throw error
  }
}

/**
 * Obtenir les statistiques prestations
 */
export async function getStatistiquesPrestations() {
  try {
    const prestations = await getAllPrestations()
    
    const stats = {
      total: prestations.length,
      actives: prestations.filter(p => p.actif).length,
      inactives: prestations.filter(p => !p.actif).length,
      parCategorie: {} as { [key: string]: number },
      prixMoyen: 0
    }
    
    // Statistiques par catégorie
    prestations.forEach(p => {
      if (!stats.parCategorie[p.categorie]) {
        stats.parCategorie[p.categorie] = 0
      }
      stats.parCategorie[p.categorie]++
    })
    
    // Prix moyen
    if (prestations.length > 0) {
      const totalPrix = prestations.reduce((sum, p) => sum + p.prixBase, 0)
      stats.prixMoyen = totalPrix / prestations.length
    }
    
    return stats
  } catch (error) {
    console.error('Erreur statistiques prestations:', error)
    throw error
  }
}
