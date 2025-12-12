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

// Interface complète d'un site (23 champs + liens)
export interface SiteComplet {
  id?: string
  clientId?: string      // ← AJOUTÉ : Lien vers le client (société)
  groupeId?: string      // ← AJOUTÉ : Lien vers le groupe
  complementNom: string  // ID unique
  nomSite: string
  tel: string
  portable: string
  codePostal: string
  ville: string
  adresse1: string
  adresse2: string
  adresse3: string
  pays: string
  internet: string
  email: string
  contact: string
  surface: number
  pente: string
  eau: string
  infosCompl: string
  typeInterv: string
  accesCamion: string
  gps: string
  lat: number
  lng: number
}

export interface SiteImport extends SiteComplet {
  clientId: string
  groupeId: string
  createdAt: string
}

const SITES_COLLECTION = 'sites'

// Importer plusieurs sites depuis Excel
export async function importSitesFromExcel(
  sites: Omit<SiteComplet, 'id'>[],
  clientId: string,
  groupeId: string
): Promise<{ success: number; errors: string[] }> {
  let success = 0
  const errors: string[] = []

  for (const site of sites) {
    try {
      const siteRef = doc(collection(db, SITES_COLLECTION))
      await setDoc(siteRef, {
        ...site,
        clientId,
        groupeId,
        createdAt: new Date().toISOString()
      })
      success++
    } catch (error) {
      console.error('Erreur import site:', error)
      errors.push(`${site.nomSite}: ${error}`)
    }
  }

  return { success, errors }
}

// Récupérer tous les sites
export async function getAllSitesComplet(): Promise<(SiteComplet & { id: string })[]> {
  try {
    const sitesRef = collection(db, SITES_COLLECTION)
    const q = query(sitesRef, orderBy('nomSite', 'asc'))
    const snapshot = await getDocs(q)
    
    const sites: (SiteComplet & { id: string })[] = []
    snapshot.forEach((doc) => {
      sites.push({
        id: doc.id,
        ...doc.data()
      } as SiteComplet & { id: string })
    })
    
    return sites
  } catch (error) {
    console.error('Erreur récupération sites:', error)
    return []
  }
}

// Récupérer les sites d'un client
export async function getSitesCompletByClient(clientId: string): Promise<(SiteComplet & { id: string })[]> {
  try {
    const sitesRef = collection(db, SITES_COLLECTION)
    const q = query(sitesRef, where('clientId', '==', clientId), orderBy('nomSite', 'asc'))
    const snapshot = await getDocs(q)
    
    const sites: (SiteComplet & { id: string })[] = []
    snapshot.forEach((doc) => {
      sites.push({
        id: doc.id,
        ...doc.data()
      } as SiteComplet & { id: string })
    })
    
    return sites
  } catch (error) {
    console.error('Erreur récupération sites par client:', error)
    return []
  }
}

// Récupérer les sites d'un groupe
export async function getSitesCompletByGroupe(groupeId: string): Promise<(SiteComplet & { id: string })[]> {
  try {
    const sitesRef = collection(db, SITES_COLLECTION)
    const q = query(sitesRef, where('groupeId', '==', groupeId), orderBy('nomSite', 'asc'))
    const snapshot = await getDocs(q)
    
    const sites: (SiteComplet & { id: string })[] = []
    snapshot.forEach((doc) => {
      sites.push({
        id: doc.id,
        ...doc.data()
      } as SiteComplet & { id: string })
    })
    
    return sites
  } catch (error) {
    console.error('Erreur récupération sites par groupe:', error)
    return []
  }
}

// Compter les sites d'un client
export async function countSitesByClient(clientId: string): Promise<number> {
  try {
    const sites = await getSitesCompletByClient(clientId)
    return sites.length
  } catch (error) {
    console.error('Erreur comptage sites:', error)
    return 0
  }
}

// Mettre à jour un site
export async function updateSiteComplet(
  siteId: string, 
  updates: Partial<Omit<SiteComplet, 'id'>>
): Promise<void> {
  try {
    const siteRef = doc(db, SITES_COLLECTION, siteId)
    await updateDoc(siteRef, updates)
  } catch (error) {
    console.error('Erreur mise à jour site:', error)
    throw error
  }
}

// Supprimer un site
export async function deleteSiteComplet(siteId: string): Promise<void> {
  try {
    const siteRef = doc(db, SITES_COLLECTION, siteId)
    await deleteDoc(siteRef)
  } catch (error) {
    console.error('Erreur suppression site:', error)
    throw error
  }
}
