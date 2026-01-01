import { db } from './config'
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore'

const COLLECTION = 'bons_commande_fournisseurs'

export type LigneBonCommande = {
  articleId: string
  articleCode: string
  articleDescription: string
  quantiteDemandee: number
  quantiteSuggere: number
  prixUnitaireEstime: number
  raisonSuggestion: string
}

export type BonCommandeFournisseur = {
  id: string
  numero: string
  fournisseur: string
  date: string
  statut: 'brouillon' | 'envoye' | 'recu' | 'annule'
  lignes: LigneBonCommande[]
  notes: string
  totalEstime: number
  interventionId?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type BonCommandeFournisseurInput = Omit<BonCommandeFournisseur, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Créer un bon de commande fournisseur
 */
export async function createBonCommandeFournisseur(
  data: BonCommandeFournisseurInput
): Promise<string> {
  try {
    const docData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, COLLECTION), docData)
    return docRef.id
  } catch (error) {
    console.error('Erreur création bon de commande:', error)
    throw error
  }
}

/**
 * Récupérer un bon de commande par ID
 */
export async function getBonCommandeById(id: string): Promise<BonCommandeFournisseur | null> {
  try {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as BonCommandeFournisseur
  } catch (error) {
    console.error('Erreur récupération bon de commande:', error)
    throw error
  }
}

/**
 * Récupérer tous les bons de commande
 */
export async function getAllBonsCommande(): Promise<BonCommandeFournisseur[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BonCommandeFournisseur[]
  } catch (error) {
    console.error('Erreur récupération bons de commande:', error)
    return []
  }
}

/**
 * Récupérer les bons de commande par statut
 */
export async function getBonsCommandeParStatut(
  statut: 'brouillon' | 'envoye' | 'recu' | 'annule'
): Promise<BonCommandeFournisseur[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('statut', '==', statut),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BonCommandeFournisseur[]
  } catch (error) {
    console.error('Erreur récupération bons de commande par statut:', error)
    return []
  }
}

/**
 * Mettre à jour un bon de commande
 */
export async function updateBonCommande(
  id: string,
  data: Partial<BonCommandeFournisseurInput>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour bon de commande:', error)
    throw error
  }
}

/**
 * Changer le statut d'un bon de commande
 */
export async function changerStatutBonCommande(
  id: string,
  statut: 'brouillon' | 'envoye' | 'recu' | 'annule'
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id)
    await updateDoc(docRef, {
      statut,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur changement statut:', error)
    throw error
  }
}

/**
 * Supprimer un bon de commande
 */
export async function deleteBonCommande(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Erreur suppression bon de commande:', error)
    throw error
  }
}

/**
 * Générer un numéro de bon de commande automatique
 */
export async function genererNumeroBonCommande(): Promise<string> {
  const annee = new Date().getFullYear()
  const mois = (new Date().getMonth() + 1).toString().padStart(2, '0')
  
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    // Trouver le dernier numéro
    const dernierNumero = snapshot.docs
      .map(doc => doc.data().numero as string)
      .find(num => num.startsWith(`BC${annee}${mois}`))
    
    if (dernierNumero) {
      const dernierIndex = parseInt(dernierNumero.slice(-3))
      const nouveauIndex = (dernierIndex + 1).toString().padStart(3, '0')
      return `BC${annee}${mois}-${nouveauIndex}`
    }
    
    return `BC${annee}${mois}-001`
  } catch (error) {
    console.error('Erreur génération numéro:', error)
    return `BC${annee}${mois}-001`
  }
}

/**
 * Calculer les quantités suggérées avec stock de sécurité
 */
export function calculerQuantiteSuggeree(
  quantiteManquante: number,
  stockActuel: number
): number {
  // Stock de sécurité : au moins 10 unités
  const stockSecurite = 10
  
  // Si on manque X, on suggère X + stock sécurité - stock actuel
  const quantiteTotale = quantiteManquante + stockSecurite - stockActuel
  
  // Arrondir au multiple de 5 supérieur
  return Math.ceil(quantiteTotale / 5) * 5
}
