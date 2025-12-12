import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore'
import { db } from './config'

export interface DemandeAcces {
  id: string
  company: string
  contactName: string
  email: string
  phone: string
  sites: string
  message: string
  statut: 'En attente' | 'Approuvé' | 'Refusé'
  createdAt: string
  processedAt?: string
  processedBy?: string
}

const DEMANDES_COLLECTION = 'demandes_acces'

// Créer une nouvelle demande
export async function createDemandeAcces(demandeData: Omit<DemandeAcces, 'id' | 'statut' | 'createdAt'>): Promise<string> {
  try {
    const demandeRef = doc(collection(db, DEMANDES_COLLECTION))
    const demandeId = demandeRef.id
    
    await setDoc(demandeRef, {
      ...demandeData,
      statut: 'En attente',
      createdAt: new Date().toISOString()
    })
    
    return demandeId
  } catch (error) {
    console.error('Erreur création demande:', error)
    throw error
  }
}

// Récupérer toutes les demandes
export async function getAllDemandes(): Promise<DemandeAcces[]> {
  try {
    const demandesRef = collection(db, DEMANDES_COLLECTION)
    const q = query(demandesRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const demandes: DemandeAcces[] = []
    snapshot.forEach((doc) => {
      demandes.push({
        id: doc.id,
        ...doc.data()
      } as DemandeAcces)
    })
    
    return demandes
  } catch (error) {
    console.error('Erreur récupération demandes:', error)
    throw error
  }
}

// Récupérer les demandes en attente
export async function getDemandesEnAttente(): Promise<DemandeAcces[]> {
  try {
    const demandesRef = collection(db, DEMANDES_COLLECTION)
    const q = query(
      demandesRef, 
      where('statut', '==', 'En attente'),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    
    const demandes: DemandeAcces[] = []
    snapshot.forEach((doc) => {
      demandes.push({
        id: doc.id,
        ...doc.data()
      } as DemandeAcces)
    })
    
    return demandes
  } catch (error) {
    console.error('Erreur récupération demandes en attente:', error)
    throw error
  }
}

// Approuver une demande
export async function approuverDemande(demandeId: string, processedBy: string): Promise<void> {
  try {
    const demandeRef = doc(db, DEMANDES_COLLECTION, demandeId)
    await updateDoc(demandeRef, {
      statut: 'Approuvé',
      processedAt: new Date().toISOString(),
      processedBy
    })
  } catch (error) {
    console.error('Erreur approbation demande:', error)
    throw error
  }
}

// Refuser une demande
export async function refuserDemande(demandeId: string, processedBy: string): Promise<void> {
  try {
    const demandeRef = doc(db, DEMANDES_COLLECTION, demandeId)
    await updateDoc(demandeRef, {
      statut: 'Refusé',
      processedAt: new Date().toISOString(),
      processedBy
    })
  } catch (error) {
    console.error('Erreur refus demande:', error)
    throw error
  }
}

// Supprimer une demande
export async function deleteDemande(demandeId: string): Promise<void> {
  try {
    const demandeRef = doc(db, DEMANDES_COLLECTION, demandeId)
    await deleteDoc(demandeRef)
  } catch (error) {
    console.error('Erreur suppression demande:', error)
    throw error
  }
}
