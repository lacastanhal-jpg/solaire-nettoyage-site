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

// Interface adresse complète
export interface Adresse {
  rue: string
  complementAdresse?: string
  codePostal: string
  ville: string
  pays: string
}

// Interface Client complète avec tous les champs obligatoires
export interface Client {
  id: string
  
  // INFORMATIONS DE BASE (existantes)
  company: string
  email?: string
  password?: string
  contactName: string
  phone: string
  groupeId?: string
  createdAt: string
  active: boolean
  
  // INFORMATIONS LÉGALES OBLIGATOIRES
  siret?: string
  numeroTVA?: string
  codeAPE?: string
  formeJuridique?: string  // SA, SARL, SAS, SASU, SCI, EURL, Auto-entrepreneur, etc.
  
  // ADRESSES COMPLÈTES
  adresseFacturation?: Adresse
  adresseLivraison?: Adresse  // Si différente de facturation
  
  // POUR SECTEUR PUBLIC (Chorus Pro)
  typeClient?: 'public' | 'privé'
  codeService?: string          // Code service destinataire (secteur public)
  numeroEngagement?: string     // Numéro d'engagement (secteur public)
  numeroMarche?: string         // Numéro de marché public
  identifiantChorus?: string    // Identifiant Chorus Pro
  
  // CONDITIONS COMMERCIALES
  conditionsPaiement?: string   // Ex: "30 jours fin de mois", "Comptant", "45 jours net"
  modalitesReglement?: string   // Ex: "Virement bancaire", "Chèque", "Prélèvement"
  tauxEscompte?: number         // Taux d'escompte si paiement anticipé (%)
  
  // NOTES
  notes?: string
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

// Récupérer un client par ID
export async function getClientById(clientId: string): Promise<Client | null> {
  try {
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId)
    const clientSnap = await getDoc(clientRef)
    
    if (!clientSnap.exists()) {
      return null
    }
    
    return {
      id: clientSnap.id,
      ...clientSnap.data()
    } as Client
  } catch (error) {
    console.error('Erreur récupération client:', error)
    return null
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

// Récupérer un client par SIRET
export async function getClientBySiret(siret: string): Promise<Client | null> {
  try {
    const clientsRef = collection(db, CLIENTS_COLLECTION)
    const q = query(clientsRef, where('siret', '==', siret))
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
    console.error('Erreur recherche client par SIRET:', error)
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
    await updateDoc(clientRef, updates as any)
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

// Vérifier si un client est du secteur public
export function isClientPublic(client: Client): boolean {
  return client.typeClient === 'public'
}

// Vérifier si un client a toutes les infos obligatoires pour facturation
export function hasCompleteInvoiceInfo(client: Client): boolean {
  return !!(
    client.company &&
    client.siret &&
    client.numeroTVA &&
    client.adresseFacturation &&
    client.adresseFacturation.rue &&
    client.adresseFacturation.codePostal &&
    client.adresseFacturation.ville
  )
}

// Formater le numéro de SIRET (affichage)
export function formatSiret(siret: string): string {
  if (!siret) return ''
  return siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')
}

// Formater le numéro de TVA (affichage)
export function formatNumeroTVA(numeroTVA: string): string {
  if (!numeroTVA) return ''
  // Format FR12345678901
  if (numeroTVA.startsWith('FR')) {
    return numeroTVA.replace(/^(FR)(\d{2})(\d{9})$/, '$1 $2 $3')
  }
  return numeroTVA
}

// Formater une adresse complète
export function formatAdresse(adresse?: Adresse): string {
  if (!adresse) return ''
  
  const parts = [
    adresse.rue,
    adresse.complementAdresse,
    `${adresse.codePostal} ${adresse.ville}`,
    adresse.pays !== 'France' ? adresse.pays : null
  ].filter(Boolean)
  
  return parts.join('\n')
}
