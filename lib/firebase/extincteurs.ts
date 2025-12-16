import { db } from './config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore'

// ============================================================================
// TYPES
// ============================================================================

export interface Extincteur {
  id?: string
  numero: string
  type: 'Poudre ABC' | 'Poudre BC' | 'CO2' | 'Eau pulvérisée' | 'Eau + additif' | 'Mousse' | 'Classe D' | 'Classe F'
  capacite: string // "2kg", "6kg", "9L", etc.
  emplacement: string
  batiment?: string
  etage?: string
  dateInstallation: string // ISO format
  dateAchat?: string
  fabricant?: string
  numeroSerie?: string
  prochainControle: string // ISO format
  prochaineMaintenance?: string // ISO format
  statut: 'Conforme' | 'À vérifier' | 'Non conforme' | 'Hors service'
  qrCode?: string
  observations?: string
  createdAt: string
  updatedAt: string
}

export interface VerificationExtincteur {
  id?: string
  extincteurId: string
  extincteurNumero: string
  technicienNom: string
  technicienEntreprise?: string
  dateVerification: string // ISO format
  typeControle: 'Annuel' | 'Semestriel' | 'Trimestriel' | 'Mise en service' | 'Maintenance' | 'Recharge'
  
  // Vérifications détaillées
  manometreOk: boolean
  manometreObservation?: string
  
  plombageOk: boolean
  plombageObservation?: string
  
  signalisationOk: boolean
  signalisationObservation?: string
  
  etatGeneralOk: boolean
  etatGeneralObservation?: string
  
  accessibiliteOk: boolean
  accessibiliteObservation?: string
  
  marquageOk: boolean
  marquageObservation?: string
  
  poidsOk: boolean
  poidsObservation?: string
  
  // Résultat global
  conforme: boolean
  observations?: string
  actionsRecommandees?: string
  
  // Documents
  photos?: string[] // URLs Firebase Storage
  rapportUrl?: string
  signatureUrl?: string // Base64 ou URL
  
  // Prochains contrôles
  prochainControle: string // ISO format
  prochaineMaintenance?: string
  
  createdAt: string
}

export interface TechnicienExtincteur {
  id?: string
  nom: string
  prenom: string
  entreprise: string
  email: string
  telephone?: string
  numeroAgrement?: string
  password: string
  active: boolean
  createdAt: string
}

// ============================================================================
// FONCTIONS EXTINCTEURS
// ============================================================================

/**
 * Créer un extincteur
 */
export async function createExtincteur(extincteur: Omit<Extincteur, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, 'extincteurs'), {
      ...extincteur,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création extincteur:', error)
    throw error
  }
}

/**
 * Récupérer tous les extincteurs
 */
export async function getAllExtincteurs(): Promise<(Extincteur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'extincteurs'), orderBy('numero', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Extincteur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération extincteurs:', error)
    return []
  }
}

/**
 * Récupérer un extincteur par ID
 */
export async function getExtincteurById(id: string): Promise<(Extincteur & { id: string }) | null> {
  try {
    const docSnap = await getDoc(doc(db, 'extincteurs', id))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Extincteur & { id: string }
    }
    return null
  } catch (error) {
    console.error('Erreur récupération extincteur:', error)
    return null
  }
}

/**
 * Récupérer extincteurs par statut
 */
export async function getExtincteursByStatut(statut: string): Promise<(Extincteur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'extincteurs'),
        where('statut', '==', statut),
        orderBy('numero', 'asc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Extincteur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération extincteurs par statut:', error)
    return []
  }
}

/**
 * Mettre à jour un extincteur
 */
export async function updateExtincteur(id: string, updates: Partial<Extincteur>) {
  try {
    await updateDoc(doc(db, 'extincteurs', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour extincteur:', error)
    throw error
  }
}

/**
 * Supprimer un extincteur
 */
export async function deleteExtincteur(id: string) {
  try {
    await deleteDoc(doc(db, 'extincteurs', id))
  } catch (error) {
    console.error('Erreur suppression extincteur:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS VÉRIFICATIONS
// ============================================================================

/**
 * Créer une vérification
 */
export async function createVerification(verification: Omit<VerificationExtincteur, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'verifications_extincteurs'), {
      ...verification,
      createdAt: new Date().toISOString()
    })
    
    // Mettre à jour l'extincteur avec la nouvelle date de prochain contrôle
    await updateExtincteur(verification.extincteurId, {
      prochainControle: verification.prochainControle,
      statut: verification.conforme ? 'Conforme' : 'Non conforme'
    })
    
    return docRef.id
  } catch (error) {
    console.error('Erreur création vérification:', error)
    throw error
  }
}

/**
 * Récupérer toutes les vérifications
 */
export async function getAllVerifications(): Promise<(VerificationExtincteur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'verifications_extincteurs'), orderBy('dateVerification', 'desc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VerificationExtincteur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération vérifications:', error)
    return []
  }
}

/**
 * Récupérer l'historique d'un extincteur
 */
export async function getHistoriqueExtincteur(extincteurId: string): Promise<(VerificationExtincteur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'verifications_extincteurs'),
        where('extincteurId', '==', extincteurId),
        orderBy('dateVerification', 'desc')
      )
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as VerificationExtincteur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération historique:', error)
    return []
  }
}

/**
 * Supprimer une vérification
 */
export async function deleteVerification(id: string) {
  try {
    await deleteDoc(doc(db, 'verifications_extincteurs', id))
  } catch (error) {
    console.error('Erreur suppression vérification:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS TECHNICIENS
// ============================================================================

/**
 * Créer un technicien
 */
export async function createTechnicien(technicien: Omit<TechnicienExtincteur, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'techniciens_extincteurs'), {
      ...technicien,
      createdAt: new Date().toISOString()
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création technicien:', error)
    throw error
  }
}

/**
 * Récupérer tous les techniciens
 */
export async function getAllTechniciens(): Promise<(TechnicienExtincteur & { id: string })[]> {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'techniciens_extincteurs'), orderBy('nom', 'asc'))
    )
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TechnicienExtincteur & { id: string }))
  } catch (error) {
    console.error('Erreur récupération techniciens:', error)
    return []
  }
}

/**
 * Vérifier les credentials d'un technicien
 */
export async function verifyTechnicienCredentials(email: string, password: string): Promise<TechnicienExtincteur | null> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'techniciens_extincteurs'),
        where('email', '==', email),
        where('password', '==', password),
        where('active', '==', true)
      )
    )
    
    if (snapshot.empty) return null
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data()
    } as TechnicienExtincteur & { id: string }
  } catch (error) {
    console.error('Erreur vérification technicien:', error)
    return null
  }
}

/**
 * Mettre à jour un technicien
 */
export async function updateTechnicien(id: string, updates: Partial<TechnicienExtincteur>) {
  try {
    await updateDoc(doc(db, 'techniciens_extincteurs', id), updates)
  } catch (error) {
    console.error('Erreur mise à jour technicien:', error)
    throw error
  }
}

/**
 * Supprimer un technicien
 */
export async function deleteTechnicien(id: string) {
  try {
    await deleteDoc(doc(db, 'techniciens_extincteurs', id))
  } catch (error) {
    console.error('Erreur suppression technicien:', error)
    throw error
  }
}

// ============================================================================
// FONCTIONS ALERTES
// ============================================================================

/**
 * Calculer les alertes extincteurs
 */
export function getAlertesExtincteurs(extincteurs: Extincteur[]) {
  const alertes = {
    critiques: [] as { extincteur: string; message: string; jours: number }[],
    importantes: [] as { extincteur: string; message: string; jours: number }[]
  }

  const aujourdhui = new Date()

  extincteurs.forEach(ext => {
    const prochainControle = new Date(ext.prochainControle)
    const diff = prochainControle.getTime() - aujourdhui.getTime()
    const jours = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (jours < 0) {
      alertes.critiques.push({
        extincteur: `EXT-${ext.numero} - ${ext.emplacement}`,
        message: `Contrôle expiré depuis ${Math.abs(jours)} jours`,
        jours
      })
    } else if (jours <= 7) {
      alertes.critiques.push({
        extincteur: `EXT-${ext.numero} - ${ext.emplacement}`,
        message: `Contrôle dans ${jours} jour${jours > 1 ? 's' : ''}`,
        jours
      })
    } else if (jours <= 30) {
      alertes.importantes.push({
        extincteur: `EXT-${ext.numero} - ${ext.emplacement}`,
        message: `Contrôle dans ${jours} jours`,
        jours
      })
    }
  })

  return alertes
}
