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

export interface Client {
  id: string
  company: string
  email?: string      // OPTIONNEL (login par groupe maintenant)
  password?: string   // OPTIONNEL (login par groupe maintenant)
  contactName: string
  phone: string
  groupeId?: string
  createdAt: string
  active: boolean
}

const CLIENTS_COLLECTION = 'clients'

// Créer un nouveau client
export async function createClient(clientData: Omit<Client, 'id'>): Promise<string> {
  try {
    const clientRef = doc(collection(db, CLIENTS_COLLECTION))
    await setDoc(clientRef, clientData)
    return clientRef.id
  } catch (error) {
    console.error('Erreur création client:', error)
    throw error
  }
}

// Récupérer tous les clients
export async function getAllClients(): Promise<Client[]> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION)
    const q = query(clientsRef, orderBy('company', 'asc'))
    const snapshot = await getDocs(q)
    
    const clients: Client[] = []
    snapshot.forEach((doc) => {
      clients.push({
        id: doc.id,
        ...doc.data()
      } as Client)
    })
    
    return clients
  } catch (error) {
    console.error('Erreur récupération clients:', error)
    return []
  }
}

// Récupérer les clients d'un groupe
export async function getClientsByGroupe(groupeId: string): Promise<Client[]> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION)
    const q = query(clientsRef, where('groupeId', '==', groupeId))
    const snapshot = await getDocs(q)
    
    const clients: Client[] = []
    snapshot.forEach((doc) => {
      clients.push({
        id: doc.id,
        ...doc.data()
      } as Client)
    })
    
    return clients
  } catch (error) {
    console.error('Erreur récupération clients par groupe:', error)
    return []
  }
}

// Récupérer un client par email
export async function getClientByEmail(email: string): Promise<Client | null> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION)
    const q = query(clientsRef, where('email', '==', email))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as Client
  } catch (error) {
    console.error('Erreur recherche client:', error)
    return null
  }
}

// Mettre à jour un client
export async function updateClient(
  clientId: string, 
  updates: Partial<Omit<Client, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId)
    await updateDoc(clientRef, updates)
  } catch (error) {
    console.error('Erreur mise à jour client:', error)
    throw error
  }
}

// Supprimer un client
export async function deleteClient(clientId: string): Promise<void> {
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId)
    await deleteDoc(clientRef)
  } catch (error) {
    console.error('Erreur suppression client:', error)
    throw error
  }
}

// Vérifier les credentials d'un client
export async function verifyClientCredentials(
  email: string, 
  password: string
): Promise<Client | null> {
  try {
    const client = await getClientByEmail(email)
    
    if (!client) {
      return null
    }
    
    if (client.password === password && client.active) {
      return client
    }
    
    return null
  } catch (error) {
    console.error('Erreur vérification credentials:', error)
    return null
  }
}