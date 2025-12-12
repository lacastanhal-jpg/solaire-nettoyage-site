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

export interface Intervention {
  id: string
  numero: string
  clientId: string
  siteId: string
  siteName: string
  date: string
  technicien: string
  statut: 'En cours' | 'Terminé' | 'Planifié'
  prix: number
  rapportUrl?: string
  photos?: string[]
  notes?: string
  createdAt: string
}

const INTERVENTIONS_COLLECTION = 'interventions'

// Créer une nouvelle intervention
export async function createIntervention(interventionData: Omit<Intervention, 'id' | 'createdAt'>): Promise<string> {
  try {
    // Utiliser le numéro d'intervention comme ID
    const interventionRef = doc(db, INTERVENTIONS_COLLECTION, interventionData.numero)
    
    await setDoc(interventionRef, {
      ...interventionData,
      createdAt: new Date().toISOString()
    })
    
    return interventionData.numero
  } catch (error) {
    console.error('Erreur création intervention:', error)
    throw error
  }
}

// Récupérer toutes les interventions d'un client
export async function getInterventionsByClient(clientId: string): Promise<Intervention[]> {
  try {
    const interventionsRef = collection(db, INTERVENTIONS_COLLECTION)
    const q = query(
      interventionsRef, 
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    const interventions: Intervention[] = []
    snapshot.forEach((doc) => {
      interventions.push({
        id: doc.id,
        ...doc.data()
      } as Intervention)
    })
    
    return interventions
  } catch (error) {
    console.error('Erreur récupération interventions:', error)
    throw error
  }
}

// Récupérer toutes les interventions d'un site
export async function getInterventionsBySite(siteId: string): Promise<Intervention[]> {
  try {
    const interventionsRef = collection(db, INTERVENTIONS_COLLECTION)
    const q = query(
      interventionsRef, 
      where('siteId', '==', siteId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    const interventions: Intervention[] = []
    snapshot.forEach((doc) => {
      interventions.push({
        id: doc.id,
        ...doc.data()
      } as Intervention)
    })
    
    return interventions
  } catch (error) {
    console.error('Erreur récupération interventions par site:', error)
    throw error
  }
}

// Récupérer une intervention par numéro
export async function getInterventionByNumero(numero: string): Promise<Intervention | null> {
  try {
    const interventionRef = doc(db, INTERVENTIONS_COLLECTION, numero)
    const interventionSnap = await getDoc(interventionRef)
    
    if (interventionSnap.exists()) {
      return {
        id: interventionSnap.id,
        ...interventionSnap.data()
      } as Intervention
    }
    
    return null
  } catch (error) {
    console.error('Erreur récupération intervention:', error)
    throw error
  }
}

// Mettre à jour une intervention
export async function updateIntervention(numero: string, data: Partial<Intervention>): Promise<void> {
  try {
    const interventionRef = doc(db, INTERVENTIONS_COLLECTION, numero)
    await updateDoc(interventionRef, data)
  } catch (error) {
    console.error('Erreur mise à jour intervention:', error)
    throw error
  }
}

// Supprimer une intervention
export async function deleteIntervention(numero: string): Promise<void> {
  try {
    const interventionRef = doc(db, INTERVENTIONS_COLLECTION, numero)
    await deleteDoc(interventionRef)
  } catch (error) {
    console.error('Erreur suppression intervention:', error)
    throw error
  }
}

// Récupérer toutes les interventions (admin)
export async function getAllInterventions(): Promise<Intervention[]> {
  try {
    const interventionsRef = collection(db, INTERVENTIONS_COLLECTION)
    const q = query(interventionsRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    const interventions: Intervention[] = []
    snapshot.forEach((doc) => {
      interventions.push({
        id: doc.id,
        ...doc.data()
      } as Intervention)
    })
    
    return interventions
  } catch (error) {
    console.error('Erreur récupération toutes les interventions:', error)
    throw error
  }
}

// Calculer les stats d'un client
export async function getClientStats(clientId: string) {
  try {
    const interventions = await getInterventionsByClient(clientId)
    
    const stats = {
      total: interventions.length,
      terminees: interventions.filter(i => i.statut === 'Terminé').length,
      enCours: interventions.filter(i => i.statut === 'En cours').length,
      planifiees: interventions.filter(i => i.statut === 'Planifié').length,
      montantTotal: interventions.reduce((sum, i) => sum + i.prix, 0)
    }
    
    return stats
  } catch (error) {
    console.error('Erreur calcul stats:', error)
    throw error
  }
}
