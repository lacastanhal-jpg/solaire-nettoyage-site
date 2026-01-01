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
  TarifSpecialSite, 
  TarifSpecialSiteInput 
} from '@/lib/types/tarification'

const COLLECTION = 'tarifs_speciaux_sites'

/**
 * Créer un nouveau tarif spécial site
 */
export async function createTarifSpecialSite(
  data: TarifSpecialSiteInput
): Promise<string> {
  try {
    const tarif: Omit<TarifSpecialSite, 'id'> = {
      siteId: data.siteId,
      siteNom: data.siteNom,
      tarifsFixes: data.tarifsFixes,
      forfait: data.forfait,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin || null,
      actif: data.actif !== undefined ? data.actif : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), tarif)
    return docRef.id
  } catch (error) {
    console.error('Erreur création tarif spécial site:', error)
    throw error
  }
}

/**
 * Récupérer tous les tarifs spéciaux
 */
export async function getAllTarifsSpeciaux(): Promise<TarifSpecialSite[]> {
  try {
    const tarifsRef = collection(db, COLLECTION)
    const q = query(tarifsRef, orderBy('siteNom', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TarifSpecialSite))
  } catch (error) {
    console.error('Erreur récupération tarifs spéciaux:', error)
    throw error
  }
}

/**
 * Récupérer les tarifs actifs
 */
export async function getTarifsSpeciauxActifs(): Promise<TarifSpecialSite[]> {
  try {
    const tarifsRef = collection(db, COLLECTION)
    const q = query(
      tarifsRef,
      where('actif', '==', true),
      orderBy('siteNom', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TarifSpecialSite))
  } catch (error) {
    console.error('Erreur récupération tarifs actifs:', error)
    throw error
  }
}

/**
 * Récupérer un tarif spécial par ID
 */
export async function getTarifSpecialById(
  id: string
): Promise<TarifSpecialSite | null> {
  try {
    const tarifRef = doc(db, COLLECTION, id)
    const tarifSnap = await getDoc(tarifRef)
    
    if (!tarifSnap.exists()) {
      return null
    }
    
    return {
      id: tarifSnap.id,
      ...tarifSnap.data()
    } as TarifSpecialSite
  } catch (error) {
    console.error('Erreur récupération tarif spécial:', error)
    throw error
  }
}

/**
 * Récupérer le tarif spécial pour un site
 */
export async function getTarifSpecialParSite(
  siteId: string,
  dateReference?: string
): Promise<TarifSpecialSite | null> {
  try {
    const tarifsRef = collection(db, COLLECTION)
    const q = query(
      tarifsRef,
      where('siteId', '==', siteId),
      where('actif', '==', true)
    )
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const dateRef = dateReference || new Date().toISOString()
    
    // Trouver le tarif valide à la date de référence
    const tarifsValides = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as TarifSpecialSite))
      .filter(tarif => {
        const dateDebut = new Date(tarif.dateDebut)
        const dateFin = tarif.dateFin ? new Date(tarif.dateFin) : null
        const refDate = new Date(dateRef)
        
        const apresDebut = refDate >= dateDebut
        const avantFin = !dateFin || refDate <= dateFin
        
        return apresDebut && avantFin
      })
    
    // Retourner le plus récent si plusieurs
    if (tarifsValides.length > 0) {
      tarifsValides.sort((a, b) => 
        new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
      )
      return tarifsValides[0]
    }
    
    return null
  } catch (error) {
    console.error('Erreur récupération tarif spécial par site:', error)
    throw error
  }
}

/**
 * Vérifier si un site a un tarif spécial
 */
export async function siteATarifSpecial(
  siteId: string,
  dateReference?: string
): Promise<boolean> {
  try {
    const tarif = await getTarifSpecialParSite(siteId, dateReference)
    return tarif !== null
  } catch (error) {
    console.error('Erreur vérification tarif spécial site:', error)
    throw error
  }
}

/**
 * Mettre à jour un tarif spécial
 */
export async function updateTarifSpecialSite(
  id: string,
  data: Partial<TarifSpecialSiteInput>
): Promise<void> {
  try {
    const updates: any = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    await updateDoc(doc(db, COLLECTION, id), updates)
  } catch (error) {
    console.error('Erreur mise à jour tarif spécial:', error)
    throw error
  }
}

/**
 * Désactiver un tarif spécial (soft delete)
 */
export async function desactiverTarifSpecial(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      actif: false,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur désactivation tarif spécial:', error)
    throw error
  }
}

/**
 * Activer un tarif spécial
 */
export async function activerTarifSpecial(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      actif: true,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur activation tarif spécial:', error)
    throw error
  }
}

/**
 * Supprimer un tarif spécial (hard delete)
 */
export async function deleteTarifSpecial(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression tarif spécial:', error)
    throw error
  }
}

/**
 * Obtenir les statistiques tarifs spéciaux
 */
export async function getStatistiquesTarifsSpeciaux() {
  try {
    const tarifs = await getAllTarifsSpeciaux()
    
    const stats = {
      total: tarifs.length,
      actifs: tarifs.filter(t => t.actif).length,
      inactifs: tarifs.filter(t => !t.actif).length,
      avecTarifsFixes: tarifs.filter(t => t.tarifsFixes && t.tarifsFixes.length > 0).length,
      avecForfait: tarifs.filter(t => t.forfait !== undefined).length,
      expirantProchainement: 0
    }
    
    // Tarifs expirant dans les 30 jours
    const dans30Jours = new Date()
    dans30Jours.setDate(dans30Jours.getDate() + 30)
    
    stats.expirantProchainement = tarifs.filter(t => {
      if (!t.dateFin) return false
      const dateFin = new Date(t.dateFin)
      return dateFin <= dans30Jours && t.actif
    }).length
    
    return stats
  } catch (error) {
    console.error('Erreur statistiques tarifs spéciaux:', error)
    throw error
  }
}
