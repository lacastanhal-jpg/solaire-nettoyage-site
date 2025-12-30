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
  where 
} from 'firebase/firestore'
import { LigneFacture, calculateFactureTotals } from './factures'

export interface LigneAvoir {
  description: string
  quantite: number
  prixUnitaire: number
  tva: number
  montantHT: number
  montantTVA: number
  montantTTC: number
}

export interface Avoir {
  id: string
  numero: string
  societeId: string  // AJOUT : Société émettrice
  date: string
  
  // LIEN AVEC FACTURE SOURCE
  factureId?: string
  factureNumero?: string
  
  // CLIENT (copié de la facture)
  clientId: string
  clientNom: string
  groupeNom?: string
  
  // LIGNES (montants négatifs)
  lignes: LigneAvoir[]
  
  // TOTAUX (négatifs)
  totalHT: number
  totalTVA: number
  totalTTC: number
  
  // MOTIF
  motif: string
  notes?: string
  
  // STATUT
  statut: 'brouillon' | 'envoye' | 'applique' | 'rembourse'
  
  // UTILISATION
  utilisationType: 'deduction' | 'remboursement'
  // deduction = déduit prochaine facture
  // remboursement = virement au client
  
  dateApplication?: string // Quand déduit
  factureApplicationId?: string // Facture où déduit
  dateRemboursement?: string // Si remboursé
  modeRemboursement?: 'virement' | 'cheque'
  referenceRemboursement?: string
  
  // METADATA
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface AvoirInput {
  societeId: string  // AJOUT : Société émettrice
  factureId?: string
  factureNumero?: string
  clientId: string
  clientNom: string
  groupeNom?: string
  lignes: LigneAvoir[]
  motif: string
  notes?: string
  utilisationType: 'deduction' | 'remboursement'
  statut?: Avoir['statut']
}

/**
 * Générer le prochain numéro d'avoir
 */
export async function generateAvoirNumero(): Promise<string> {
  try {
    const year = new Date().getFullYear()
    const avoirsRef = collection(db, 'avoirs')
    const q = query(
      avoirsRef,
      where('numero', '>=', `AV-${year}-`),
      where('numero', '<', `AV-${year + 1}-`),
      orderBy('numero', 'desc')
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return `AV-${year}-001`
    }
    
    const lastNumero = snapshot.docs[0].data().numero
    const lastNumber = parseInt(lastNumero.split('-')[2])
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0')
    
    return `AV-${year}-${nextNumber}`
  } catch (error) {
    console.error('Erreur génération numéro avoir:', error)
    return `AV-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`
  }
}

/**
 * Récupérer tous les avoirs
 */
export async function getAllAvoirs(): Promise<Avoir[]> {
  try {
    const avoirsRef = collection(db, 'avoirs')
    const q = query(avoirsRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Avoir))
  } catch (error) {
    console.error('Erreur récupération avoirs:', error)
    throw error
  }
}

/**
 * Récupérer un avoir par ID
 */
export async function getAvoirById(id: string): Promise<Avoir | null> {
  try {
    const avoirRef = doc(db, 'avoirs', id)
    const avoirSnap = await getDoc(avoirRef)
    
    if (!avoirSnap.exists()) {
      return null
    }
    
    return {
      id: avoirSnap.id,
      ...avoirSnap.data()
    } as Avoir
  } catch (error) {
    console.error('Erreur récupération avoir:', error)
    throw error
  }
}

/**
 * Récupérer les avoirs d'une facture
 */
export async function getAvoirsByFacture(factureId: string): Promise<Avoir[]> {
  try {
    const avoirsRef = collection(db, 'avoirs')
    const q = query(
      avoirsRef,
      where('factureId', '==', factureId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Avoir))
  } catch (error) {
    console.error('Erreur récupération avoirs facture:', error)
    throw error
  }
}

/**
 * Récupérer les avoirs d'un client
 */
export async function getAvoirsByClient(clientId: string): Promise<Avoir[]> {
  try {
    const avoirsRef = collection(db, 'avoirs')
    const q = query(
      avoirsRef,
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Avoir))
  } catch (error) {
    console.error('Erreur récupération avoirs client:', error)
    throw error
  }
}

/**
 * Créer un nouvel avoir
 */
export async function createAvoir(avoirData: AvoirInput): Promise<string> {
  try {
    const numero = await generateAvoirNumero()
    
    // Transformer les montants en négatifs et supporter les deux formats de noms
    const lignesNegatives = avoirData.lignes.map(ligne => ({
      ...ligne,
      montantHT: -Math.abs((ligne as any).montantHT || (ligne as any).totalHT || 0),
      montantTVA: -Math.abs((ligne as any).montantTVA || (ligne as any).totalTVA || 0),
      montantTTC: -Math.abs((ligne as any).montantTTC || (ligne as any).totalTTC || 0),
      totalHT: -Math.abs((ligne as any).montantHT || (ligne as any).totalHT || 0),
      totalTVA: -Math.abs((ligne as any).montantTVA || (ligne as any).totalTVA || 0),
      totalTTC: -Math.abs((ligne as any).montantTTC || (ligne as any).totalTTC || 0)
    }))
    
    // Calculer les totaux manuellement
    const totalHT = lignesNegatives.reduce((sum, l) => sum + ((l as any).montantHT || (l as any).totalHT || 0), 0)
    const totalTVA = lignesNegatives.reduce((sum, l) => sum + ((l as any).montantTVA || (l as any).totalTVA || 0), 0)
    const totalTTC = lignesNegatives.reduce((sum, l) => sum + ((l as any).montantTTC || (l as any).totalTTC || 0), 0)
    
    const avoir: any = {
      numero,
      societeId: avoirData.societeId,  // AJOUT : Société émettrice
      date: new Date().toISOString().split('T')[0],
      clientId: avoirData.clientId,
      clientNom: avoirData.clientNom,
      lignes: lignesNegatives,
      totalHT,
      totalTVA,
      totalTTC,
      motif: avoirData.motif,
      utilisationType: avoirData.utilisationType,
      statut: avoirData.statut || 'brouillon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Ajouter champs optionnels seulement s'ils existent
    if (avoirData.factureId) avoir.factureId = avoirData.factureId
    if (avoirData.factureNumero) avoir.factureNumero = avoirData.factureNumero
    if (avoirData.groupeNom) avoir.groupeNom = avoirData.groupeNom
    if (avoirData.notes) avoir.notes = avoirData.notes
    
    const avoirRef = doc(collection(db, 'avoirs'))
    await setDoc(avoirRef, avoir)
    
    return avoirRef.id
  } catch (error) {
    console.error('Erreur création avoir:', error)
    throw error
  }
}

/**
 * Modifier un avoir
 */
export async function updateAvoir(id: string, avoirData: Partial<AvoirInput>): Promise<void> {
  try {
    const avoirRef = doc(db, 'avoirs', id)
    const updates: any = {
      updatedAt: new Date().toISOString()
    }
    
    if (avoirData.societeId !== undefined) updates.societeId = avoirData.societeId
    if (avoirData.motif !== undefined) updates.motif = avoirData.motif
    if (avoirData.notes !== undefined) updates.notes = avoirData.notes
    if (avoirData.utilisationType !== undefined) updates.utilisationType = avoirData.utilisationType
    if (avoirData.statut !== undefined) updates.statut = avoirData.statut
    
    // Recalculer totaux si lignes changent
    if (avoirData.lignes) {
      const lignesNegatives = avoirData.lignes.map(ligne => ({
        ...ligne,
        montantHT: -Math.abs((ligne as any).montantHT || (ligne as any).totalHT || 0),
        montantTVA: -Math.abs((ligne as any).montantTVA || (ligne as any).totalTVA || 0),
        montantTTC: -Math.abs((ligne as any).montantTTC || (ligne as any).totalTTC || 0),
        totalHT: -Math.abs((ligne as any).montantHT || (ligne as any).totalHT || 0),
        totalTVA: -Math.abs((ligne as any).montantTVA || (ligne as any).totalTVA || 0),
        totalTTC: -Math.abs((ligne as any).montantTTC || (ligne as any).totalTTC || 0)
      }))
      
      const totalHT = lignesNegatives.reduce((sum, l) => sum + ((l as any).montantHT || (l as any).totalHT || 0), 0)
      const totalTVA = lignesNegatives.reduce((sum, l) => sum + ((l as any).montantTVA || (l as any).totalTVA || 0), 0)
      const totalTTC = lignesNegatives.reduce((sum, l) => sum + ((l as any).montantTTC || (l as any).totalTTC || 0), 0)
      
      updates.lignes = lignesNegatives
      updates.totalHT = totalHT
      updates.totalTVA = totalTVA
      updates.totalTTC = totalTTC
    }
    
    await updateDoc(avoirRef, updates)
  } catch (error) {
    console.error('Erreur modification avoir:', error)
    throw error
  }
}

/**
 * Supprimer un avoir
 */
export async function deleteAvoir(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'avoirs', id))
  } catch (error) {
    console.error('Erreur suppression avoir:', error)
    throw error
  }
}

/**
 * Appliquer un avoir sur une facture
 */
export async function appliquerAvoir(
  avoirId: string,
  factureApplicationId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'avoirs', avoirId), {
      statut: 'applique',
      dateApplication: new Date().toISOString().split('T')[0],
      factureApplicationId,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur application avoir:', error)
    throw error
  }
}

/**
 * Marquer un avoir comme remboursé
 */
export async function marquerAvoirRembourse(
  avoirId: string,
  modeRemboursement: 'virement' | 'cheque',
  referenceRemboursement?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'avoirs', avoirId), {
      statut: 'rembourse',
      dateRemboursement: new Date().toISOString().split('T')[0],
      modeRemboursement,
      referenceRemboursement: referenceRemboursement || '',
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur marquage avoir remboursé:', error)
    throw error
  }
}

/**
 * Récupérer les avoirs en attente d'application
 */
export async function getAvoirsEnAttente(clientId?: string): Promise<Avoir[]> {
  try {
    const avoirsRef = collection(db, 'avoirs')
    let q
    
    if (clientId) {
      q = query(
        avoirsRef,
        where('clientId', '==', clientId),
        where('statut', '==', 'envoye'),
        where('utilisationType', '==', 'deduction'),
        orderBy('date', 'asc')
      )
    } else {
      q = query(
        avoirsRef,
        where('statut', '==', 'envoye'),
        where('utilisationType', '==', 'deduction'),
        orderBy('date', 'asc')
      )
    }
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Avoir))
  } catch (error) {
    console.error('Erreur récupération avoirs en attente:', error)
    throw error
  }
}

/**
 * Changer le statut d'un avoir
 */
export async function updateAvoirStatut(
  id: string,
  statut: Avoir['statut']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'avoirs', id), {
      statut,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur changement statut avoir:', error)
    throw error
  }
}
