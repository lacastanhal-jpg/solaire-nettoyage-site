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
  Timestamp 
} from 'firebase/firestore'
import { db } from './config'

export interface Client {
  id: string
  company: string
  email: string
  password: string // À hasher en production
  contactName: string
  phone: string
  createdAt: string
  active: boolean
}

const CLIENTS_COLLECTION = 'clients'

// Créer un nouveau client
export async function createClient(clientData: Omit<Client, 'id'>): Promise<string> {
  try {
    const clientId = clientData.email.split('@')[0].toLowerCase()
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId)
    
    await setDoc(clientRef, {
      ...clientData,
      createdAt: new Date().toISOString(),
      active: true
    })
    
    return clientId
  } catch (error) {
    console.error('Erreur création client:', error)
    throw error
  }
}

// Récupérer tous les clients
export async function getAllClients(): Promise<Client[]> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION)
    const snapshot = await getDocs(clientsRef)
    
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
    throw error
  }
}

// Récupérer un client par email
export async function getClientByEmail(email: string): Promise<Client | null> {
  try {
    const clientId = email.split('@')[0].toLowerCase()
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId)
    const clientSnap = await getDoc(clientRef)
    
    if (clientSnap.exists()) {
      return {
        id: clientSnap.id,
        ...clientSnap.data()
      } as Client
    }
    
    return null
  } catch (error) {
    console.error('Erreur récupération client:', error)
    throw error
  }
}

// Mettre à jour un client
export async function updateClient(clientId: string, data: Partial<Client>): Promise<void> {
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId)
    await updateDoc(clientRef, data)
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

// Vérifier les identifiants (login)
export async function verifyClientCredentials(email: string, password: string): Promise<Client | null> {
  try {
    const client = await getClientByEmail(email)
    
    if (client && client.password === password && client.active) {
      return client
    }
    
    return null
  } catch (error) {
    console.error('Erreur vérification identifiants:', error)
    throw error
  }
}
