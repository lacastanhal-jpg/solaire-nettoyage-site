import { db } from './config'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore'

export interface LigneDevis {
  siteId: string
  siteNom: string
  articleId: string
  articleCode: string
  articleNom: string
  articleDescription?: string
  quantite: number
  prixUnitaire: number
  tva: number
  totalHT: number
  totalTVA: number
  totalTTC: number
}

export interface Devis {
  id: string
  numero: string
  societeId: string  // AJOUT : Société émettrice
  date: string
  dateValidite?: string  // Date limite de validité du devis
  
  // INFORMATIONS CLIENT
  clientId: string
  clientNom: string
  groupeNom?: string
  
  // RÉFÉRENCES COMMANDE CLIENT (pour facturation)
  numeroCommandeClient?: string
  dateCommandeClient?: string
  
  // LIGNES
  lignes: LigneDevis[]
  
  // TOTAUX
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  // STATUT
  statut: 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'validé_commande'
  
  // INTERVENTIONS GÉNÉRÉES
  interventionsGenerees?: boolean
  interventionsNumeros?: string[]
  dateValidationCommande?: string
  
  // CONDITIONS COMMERCIALES (peuvent surcharger celles du client)
  conditionsPaiement?: string
  modalitesReglement?: string
  
  // NOTES
  notes?: string
  
  // METADATA
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface DevisInput {
  societeId: string  // AJOUT : Société émettrice
  clientId: string
  clientNom: string
  groupeNom?: string
  numeroCommandeClient?: string
  dateCommandeClient?: string
  dateValidite?: string
  lignes: LigneDevis[]
  conditionsPaiement?: string
  modalitesReglement?: string
  notes?: string
  statut?: 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'validé_commande'
}

/**
 * Générer le prochain numéro de devis
 */
export async function generateDevisNumero(): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const devisRef = collection(db, 'devis')
    const q = query(
      devisRef,
      where('numero', '>=', `DEV-${year}-`),
      where('numero', '<', `DEV-${year + 1}-`),
      orderBy('numero', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `DEV-${year}-001`
    }
    
    const lastNumero = snapshot.docs[0].data().numero
    const lastNumber = parseInt(lastNumero.split('-')[2])
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
    
    return `DEV-${year}-${nextNumber}`
  } catch (error) {
    console.error('Erreur génération numéro devis:', error)
    // Fallback
    return `DEV-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`
  }
}

/**
 * Calculer les totaux d'un devis
 */
export function calculateDevisTotals(lignes: LigneDevis[]): {
  totalHT: number
  totalTVA: number
  totalTTC: number
} {
  const totalHT = lignes.reduce((sum, ligne) => sum + ligne.totalHT, 0)
  const totalTVA = lignes.reduce((sum, ligne) => sum + ligne.totalTVA, 0)
  const totalTTC = lignes.reduce((sum, ligne) => sum + ligne.totalTTC, 0)
  
  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100
  }
}

/**
 * Calculer une ligne de devis
 */
export function calculateLigneDevis(
  quantite: number,
  prixUnitaire: number,
  tva: number
): { totalHT: number; totalTVA: number; totalTTC: number } {
  const totalHT = quantite * prixUnitaire
  const totalTVA = (totalHT * tva) / 100
  const totalTTC = totalHT + totalTVA
  
  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalTVA: Math.round(totalTVA * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100
  }
}

/**
 * Récupérer tous les devis
 */
export async function getAllDevis(): Promise<Devis[]> {
  try {
    const devisRef = collection(db, 'devis')
    const q = query(devisRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Devis))
  } catch (error) {
    console.error('Erreur récupération devis:', error)
    throw error
  }
}

/**
 * Récupérer un devis par ID
 */
export async function getDevisById(id: string): Promise<Devis | null> {
  try {
    const devisRef = doc(db, 'devis', id)
    const devisSnap = await getDoc(devisRef)
    
    if (!devisSnap.exists()) {
      return null
    }
    
    return {
      id: devisSnap.id,
      ...devisSnap.data()
    } as Devis
  } catch (error) {
    console.error('Erreur récupération devis:', error)
    throw error
  }
}

/**
 * Récupérer les devis d'un client
 */
export async function getDevisByClient(clientId: string): Promise<Devis[]> {
  try {
    const devisRef = collection(db, 'devis')
    const q = query(
      devisRef,
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Devis))
  } catch (error) {
    console.error('Erreur récupération devis client:', error)
    throw error
  }
}

/**
 * Créer un nouveau devis
 */
export async function createDevis(devisData: DevisInput): Promise<string> {
  try {
    const numero = await generateDevisNumero()
    const totals = calculateDevisTotals(devisData.lignes)
    
    // Créer l'objet devis sans les champs undefined
    const devis: any = {
      numero,
      societeId: devisData.societeId,  // AJOUT : Société émettrice
      date: new Date().toISOString(),
      clientId: devisData.clientId,
      clientNom: devisData.clientNom,
      lignes: devisData.lignes,
      totalHT: totals.totalHT,
      totalTVA: totals.totalTVA,
      totalTTC: totals.totalTTC,
      statut: devisData.statut || 'brouillon',
      notes: devisData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Ajouter les champs optionnels seulement s'ils existent
    if (devisData.dateValidite) devis.dateValidite = devisData.dateValidite
    if (devisData.groupeNom) devis.groupeNom = devisData.groupeNom
    if (devisData.numeroCommandeClient) devis.numeroCommandeClient = devisData.numeroCommandeClient
    if (devisData.dateCommandeClient) devis.dateCommandeClient = devisData.dateCommandeClient
    if (devisData.conditionsPaiement) devis.conditionsPaiement = devisData.conditionsPaiement
    if (devisData.modalitesReglement) devis.modalitesReglement = devisData.modalitesReglement
    
    const devisRef = doc(collection(db, 'devis'))
    await setDoc(devisRef, devis)
    
    return devisRef.id
  } catch (error) {
    console.error('Erreur création devis:', error)
    throw error
  }
}

/**
 * Modifier un devis existant
 */
export async function updateDevis(id: string, devisData: Partial<DevisInput>): Promise<void> {
  try {
    const devisRef = doc(db, 'devis', id)
    
    // Créer l'objet updates en filtrant les undefined
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    // Ajouter seulement les champs définis
    if (devisData.societeId !== undefined) updates.societeId = devisData.societeId
    if (devisData.clientId !== undefined) updates.clientId = devisData.clientId
    if (devisData.clientNom !== undefined) updates.clientNom = devisData.clientNom
    if (devisData.groupeNom !== undefined) updates.groupeNom = devisData.groupeNom
    if (devisData.dateValidite !== undefined) updates.dateValidite = devisData.dateValidite
    if (devisData.numeroCommandeClient !== undefined) updates.numeroCommandeClient = devisData.numeroCommandeClient
    if (devisData.dateCommandeClient !== undefined) updates.dateCommandeClient = devisData.dateCommandeClient
    if (devisData.conditionsPaiement !== undefined) updates.conditionsPaiement = devisData.conditionsPaiement
    if (devisData.modalitesReglement !== undefined) updates.modalitesReglement = devisData.modalitesReglement
    if (devisData.notes !== undefined) updates.notes = devisData.notes
    if (devisData.statut !== undefined) updates.statut = devisData.statut
    
    // Recalculer les totaux si les lignes changent
    if (devisData.lignes) {
      const totals = calculateDevisTotals(devisData.lignes)
      updates.lignes = devisData.lignes
      updates.totalHT = totals.totalHT
      updates.totalTVA = totals.totalTVA
      updates.totalTTC = totals.totalTTC
    }
    
    await updateDoc(devisRef, updates)
  } catch (error) {
    console.error('Erreur modification devis:', error)
    throw error
  }
}

/**
 * Supprimer un devis
 */
export async function deleteDevis(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'devis', id))
  } catch (error) {
    console.error('Erreur suppression devis:', error)
    throw error
  }
}

/**
 * Changer le statut d'un devis
 */
export async function updateDevisStatut(
  id: string, 
  statut: 'brouillon' | 'envoyé' | 'accepté' | 'refusé' | 'validé_commande'
): Promise<void> {
  try {
    await updateDevis(id, { statut })
  } catch (error) {
    console.error('Erreur changement statut:', error)
    throw error
  }
}

/**
 * Mettre à jour le numéro de commande client
 */
export async function updateNumeroCommandeClient(
  id: string,
  numeroCommandeClient: string
): Promise<void> {
  try {
    const devisRef = doc(db, 'devis', id)
    await updateDoc(devisRef, {
      numeroCommandeClient,
      dateCommandeClient: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur mise à jour N° commande client:', error)
    throw error
  }
}

