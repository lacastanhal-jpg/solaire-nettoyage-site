import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore'
import { db } from './config'

export interface Site {
  id: string
  clientId: string
  nom: string
  nomSite?: string  // Nom du site (import Excel)
  complementNom?: string  // ID unique site
  
  // Adresse complète (3 lignes possibles)
  adresse: string      // Adresse condensée (pour affichage simple)
  adresse1?: string    // Ligne 1 (numéro, rue)
  adresse2?: string    // Ligne 2 (complément)
  adresse3?: string    // Ligne 3 (bâtiment, etc.)
  
  ville: string
  codePostal: string
  pays?: string
  
  // Coordonnées GPS
  gps?: string         // Format "44.123456 / 2.654321"
  lat?: number
  lng?: number
  
  // Contacts
  tel?: string
  portable?: string
  email?: string
  contact?: string
  internet?: string
  
  // Informations techniques
  puissance?: string
  typeInstallation?: string
  surface?: number
  pente?: string
  eau?: string
  accesCamion?: string
  typeInterv?: string
  infosCompl?: string
  
  createdAt: string
  updatedAt?: string
}

const SITES_COLLECTION = 'sites'

// Créer un nouveau site
export async function createSite(siteData: Omit<Site, 'id' | 'createdAt'>): Promise<string> {
  try {
    const siteRef = doc(collection(db, SITES_COLLECTION))
    const siteId = siteRef.id
    
    await setDoc(siteRef, {
      ...siteData,
      createdAt: new Date().toISOString()
    })
    
    return siteId
  } catch (error) {
    console.error('Erreur création site:', error)
    throw error
  }
}

// Récupérer tous les sites d'un client
export async function getSitesByClient(clientId: string): Promise<Site[]> {
  try {
    const sitesRef = collection(db, SITES_COLLECTION)
    const q = query(sitesRef, where('clientId', '==', clientId))
    const snapshot = await getDocs(q)
    
    const sites: Site[] = []
    snapshot.forEach((doc) => {
      sites.push({
        id: doc.id,
        ...doc.data()
      } as Site)
    })
    
    return sites
  } catch (error) {
    console.error('Erreur récupération sites:', error)
    throw error
  }
}

// Récupérer un site par ID
export async function getSiteById(siteId: string): Promise<Site | null> {
  try {
    const siteRef = doc(db, SITES_COLLECTION, siteId)
    const siteSnap = await getDoc(siteRef)
    
    if (siteSnap.exists()) {
      return {
        id: siteSnap.id,
        ...siteSnap.data()
      } as Site
    }
    
    return null
  } catch (error) {
    console.error('Erreur récupération site:', error)
    throw error
  }
}

// Mettre à jour un site
export async function updateSite(siteId: string, data: Partial<Site>): Promise<void> {
  try {
    const siteRef = doc(db, SITES_COLLECTION, siteId)
    await updateDoc(siteRef, data)
  } catch (error) {
    console.error('Erreur mise à jour site:', error)
    throw error
  }
}

// Supprimer un site
export async function deleteSite(siteId: string): Promise<void> {
  try {
    const siteRef = doc(db, SITES_COLLECTION, siteId)
    await deleteDoc(siteRef)
  } catch (error) {
    console.error('Erreur suppression site:', error)
    throw error
  }
}

// Récupérer tous les sites (admin)
export async function getAllSites(): Promise<Site[]> {
  try {
    const sitesRef = collection(db, SITES_COLLECTION)
    const snapshot = await getDocs(sitesRef)
    
    const sites: Site[] = []
    snapshot.forEach((doc) => {
      sites.push({
        id: doc.id,
        ...doc.data()
      } as Site)
    })
    
    return sites
  } catch (error) {
    console.error('Erreur récupération tous les sites:', error)
    throw error
  }
}