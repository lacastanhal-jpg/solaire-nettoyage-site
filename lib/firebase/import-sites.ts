import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from './config'

export interface SiteComplet {
  id?: string
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
  createdAt: string
}

const SITES_COLLECTION = 'sites'

// Importer plusieurs sites en masse (batch)
export async function importSitesEnMasse(
  sites: SiteImport[]
): Promise<{
  created: number
  updated: number
  errors: string[]
}> {
  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[]
  }

  try {
    // Firestore batch limit = 500 operations
    const batchSize = 500
    
    for (let i = 0; i < sites.length; i += batchSize) {
      const batch = writeBatch(db)
      const chunk = sites.slice(i, i + batchSize)
      
      for (const site of chunk) {
        try {
          // Utiliser complementNom comme ID unique
          const siteId = site.complementNom
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
          
          const siteRef = doc(db, SITES_COLLECTION, siteId)
          
          // Vérifier si le site existe déjà
          const existingDoc = await getDoc(siteRef)
          
          if (existingDoc.exists()) {
            // Mise à jour
            batch.update(siteRef, { ...site })
            results.updated++
          } else {
            // Création
            batch.set(siteRef, { ...site })
            results.created++
          }
        } catch (error) {
          results.errors.push(`Erreur site ${site.complementNom}: ${error}`)
        }
      }
      
      // Commit le batch
      await batch.commit()
    }
    
    return results
  } catch (error) {
    console.error('Erreur import masse:', error)
    throw error
  }
}

// Vérifier les doublons avant import
export async function verifierDoublons(
  complementNoms: string[]
): Promise<string[]> {
  const doublons: string[] = []
  
  for (const complementNom of complementNoms) {
    const siteId = complementNom
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
    
    const siteRef = doc(db, SITES_COLLECTION, siteId)
    const siteSnap = await getDoc(siteRef)
    
    if (siteSnap.exists()) {
      doublons.push(complementNom)
    }
  }
  
  return doublons
}

// Parser les coordonnées GPS
export function parseGPS(gpsString: string): { lat: number; lng: number } | null {
  try {
    if (!gpsString) return null
    
    // Format: "45.939046 / 3.468672"
    const parts = gpsString.split('/')
    if (parts.length !== 2) return null
    
    const lat = parseFloat(parts[0].trim())
    const lng = parseFloat(parts[1].trim())
    
    if (isNaN(lat) || isNaN(lng)) return null
    
    return { lat, lng }
  } catch (error) {
    return null
  }
}

// Récupérer les sites complets d'un client
export async function getSitesCompletByClient(clientId: string): Promise<(SiteComplet & { id: string })[]> {
  try {
    const sitesRef = collection(db, SITES_COLLECTION)
    const q = query(sitesRef, where('clientId', '==', clientId))
    const snapshot = await getDocs(q)
    
    const sites: (SiteComplet & { id: string })[] = []
    snapshot.forEach((docSnap) => {
      sites.push({
        id: docSnap.id,
        ...docSnap.data()
      } as SiteComplet & { id: string })
    })
    
    return sites
  } catch (error) {
    console.error('Erreur récupération sites complets:', error)
    return []
  }
}