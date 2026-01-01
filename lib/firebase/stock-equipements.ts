import { db } from './config'
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc
} from 'firebase/firestore'
import type { Equipement } from '@/lib/types/stock-flotte'

const COLLECTION = 'equipements'

// Créer un équipement
export async function createEquipement(data: Omit<Equipement, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Construire le document en excluant les champs undefined
    const equipementData: any = {
      type: data.type,
      statut: data.statut,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Champs communs optionnels
    if (data.notes) equipementData.notes = data.notes

    // Champs véhicule
    if (data.type === 'vehicule') {
      equipementData.immatriculation = data.immatriculation
      equipementData.marque = data.marque
      equipementData.modele = data.modele
      equipementData.typeVehicule = data.typeVehicule
      equipementData.kmHeures = data.kmHeures || 0

      if (data.annee) equipementData.annee = data.annee
      if (data.carburant) equipementData.carburant = data.carburant
      if (data.capaciteReservoir) equipementData.capaciteReservoir = data.capaciteReservoir
      if (data.controleTechniqueExpiration) equipementData.controleTechniqueExpiration = data.controleTechniqueExpiration
      if (data.assuranceExpiration) equipementData.assuranceExpiration = data.assuranceExpiration
      if (data.vgpExpiration) equipementData.vgpExpiration = data.vgpExpiration
    }

    // Champs accessoire
    if (data.type === 'accessoire') {
      equipementData.nom = data.nom
      equipementData.typeAccessoire = data.typeAccessoire

      if (data.numeroSerie) equipementData.numeroSerie = data.numeroSerie
      if (data.dateAchat) equipementData.dateAchat = data.dateAchat
      if (data.vehiculeParentId) equipementData.vehiculeParentId = data.vehiculeParentId
    }

    const docRef = await addDoc(collection(db, COLLECTION), equipementData)
    return docRef.id
  } catch (error) {
    console.error('Erreur création équipement:', error)
    throw error
  }
}

// Récupérer tous les équipements
export async function getAllEquipements(): Promise<Equipement[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipement[]
  } catch (error) {
    console.error('Erreur récupération équipements:', error)
    return []
  }
}

// Récupérer un équipement par ID
export async function getEquipement(id: string): Promise<Equipement | null> {
  try {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Equipement
  } catch (error) {
    console.error('Erreur récupération équipement:', error)
    return null
  }
}

// Alias pour compatibilité
export const getEquipementById = getEquipement

// Mettre à jour un équipement
export async function updateEquipement(id: string, data: Partial<Equipement>) {
  try {
    const docRef = doc(db, COLLECTION, id)
    
    // Construire l'objet de mise à jour en excluant les undefined
    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    // Ajouter les champs seulement s'ils sont définis
    if (data.statut !== undefined) updateData.statut = data.statut
    if (data.notes !== undefined) updateData.notes = data.notes || null

    // Champs véhicule
    if (data.immatriculation !== undefined) updateData.immatriculation = data.immatriculation
    if (data.marque !== undefined) updateData.marque = data.marque
    if (data.modele !== undefined) updateData.modele = data.modele
    if (data.typeVehicule !== undefined) updateData.typeVehicule = data.typeVehicule
    if (data.kmHeures !== undefined) updateData.kmHeures = data.kmHeures
    if (data.annee !== undefined) updateData.annee = data.annee
    if (data.carburant !== undefined) updateData.carburant = data.carburant || null
    if (data.capaciteReservoir !== undefined) updateData.capaciteReservoir = data.capaciteReservoir
    if (data.controleTechniqueExpiration !== undefined) updateData.controleTechniqueExpiration = data.controleTechniqueExpiration || null
    if (data.assuranceExpiration !== undefined) updateData.assuranceExpiration = data.assuranceExpiration || null
    if (data.vgpExpiration !== undefined) updateData.vgpExpiration = data.vgpExpiration || null

    // Champs accessoire
    if (data.nom !== undefined) updateData.nom = data.nom
    if (data.typeAccessoire !== undefined) updateData.typeAccessoire = data.typeAccessoire
    if (data.numeroSerie !== undefined) updateData.numeroSerie = data.numeroSerie || null
    if (data.dateAchat !== undefined) updateData.dateAchat = data.dateAchat || null
    if (data.vehiculeParentId !== undefined) updateData.vehiculeParentId = data.vehiculeParentId || null

    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Erreur mise à jour équipement:', error)
    throw error
  }
}

// Récupérer les véhicules uniquement
export async function getVehicules(): Promise<Equipement[]> {
  try {
    const q = query(collection(db, COLLECTION), where('type', '==', 'vehicule'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipement[]
  } catch (error) {
    console.error('Erreur récupération véhicules:', error)
    return []
  }
}

// Alias pour compatibilité
export const getVehiculesUniquement = getVehicules
export const getAllVehicules = getVehicules

// Récupérer les accessoires uniquement
export async function getAccessoires(): Promise<Equipement[]> {
  try {
    const q = query(collection(db, COLLECTION), where('type', '==', 'accessoire'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipement[]
  } catch (error) {
    console.error('Erreur récupération accessoires:', error)
    return []
  }
}

// Récupérer les accessoires d'un véhicule
export async function getAccessoiresParent(vehiculeId: string): Promise<Equipement[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('type', '==', 'accessoire'),
      where('vehiculeParentId', '==', vehiculeId)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipement[]
  } catch (error) {
    console.error('Erreur récupération accessoires véhicule:', error)
    return []
  }
}

// Alias pour compatibilité
export const getAccessoiresEquipement = getAccessoiresParent

// Récupérer équipements par statut
export async function getEquipementsParStatut(statut: 'en_service' | 'en_maintenance' | 'hors_service'): Promise<Equipement[]> {
  try {
    const q = query(collection(db, COLLECTION), where('statut', '==', statut))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipement[]
  } catch (error) {
    console.error('Erreur récupération équipements par statut:', error)
    return []
  }
}

// Récupérer équipements en maintenance
export async function getEquipementsEnMaintenance(): Promise<Equipement[]> {
  return getEquipementsParStatut('en_maintenance')
}

// Statistiques équipements
export async function getStatistiquesEquipements(): Promise<{
  totalVehicules: number
  totalAccessoires: number
  enService: number
  enMaintenance: number
  horsService: number
}> {
  try {
    const equipements = await getAllEquipements()

    return {
      totalVehicules: equipements.filter(e => e.type === 'vehicule').length,
      totalAccessoires: equipements.filter(e => e.type === 'accessoire').length,
      enService: equipements.filter(e => e.statut === 'en_service').length,
      enMaintenance: equipements.filter(e => e.statut === 'en_maintenance').length,
      horsService: equipements.filter(e => e.statut === 'hors_service').length
    }
  } catch (error) {
    console.error('Erreur statistiques équipements:', error)
    return {
      totalVehicules: 0,
      totalAccessoires: 0,
      enService: 0,
      enMaintenance: 0,
      horsService: 0
    }
  }
}

/**
 * Mettre à jour les km/heures d'un équipement
 */
export async function updateKmHeures(
  equipementId: string,
  km?: number,
  heures?: number
): Promise<void> {
  try {
    const equipementRef = doc(db, COLLECTION, equipementId)
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (km !== undefined) updates.km = km
    if (heures !== undefined) updates.heures = heures
    
    await updateDoc(equipementRef, updates)
  } catch (error) {
    console.error('Erreur mise à jour km/heures:', error)
    throw error
  }
}

/**
 * Récupérer les statistiques de la flotte
 */
export async function getStatistiquesFlotte() {
  try {
    const equipements = await getAllEquipements()
    
    const vehicules = equipements.filter(e => e.type === 'vehicule')
    const accessoires = equipements.filter(e => e.type === 'accessoire')
    
    return {
      nombreEquipements: equipements.length,
      nombreVehicules: vehicules.length,
      nombreAccessoires: accessoires.length,
      enService: equipements.filter(e => e.statut === 'en_service').length,
      enMaintenance: equipements.filter(e => e.statut === 'en_maintenance').length,
      horsService: equipements.filter(e => e.statut === 'hors_service').length
    }
  } catch (error) {
    console.error('Erreur statistiques flotte:', error)
    return {
      nombreEquipements: 0,
      nombreVehicules: 0,
      nombreAccessoires: 0,
      enService: 0,
      enMaintenance: 0,
      horsService: 0
    }
  }
}

