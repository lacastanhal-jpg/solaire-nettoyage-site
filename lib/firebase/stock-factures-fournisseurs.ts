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
  FactureFournisseur, 
  FactureFournisseurInput,
  LigneFactureFournisseur
} from '@/lib/types/stock-flotte'
import { createMouvementStock } from './stock-mouvements'

const COLLECTION = 'factures_fournisseurs_stock'

/**
 * Créer une nouvelle facture fournisseur
 */
export async function createFactureFournisseur(
  data: FactureFournisseurInput
): Promise<string> {
  try {
    // Calculer les totaux
    let totalHT = 0
    let totalTVA = 0
    let totalTTC = 0
    
    data.lignes.forEach(ligne => {
      totalHT += ligne.totalHT
      totalTVA += ligne.totalTVA
      totalTTC += ligne.totalTTC
    })
    
    const facture: Omit<FactureFournisseur, 'id'> = {
      numero: data.numero,
      fournisseur: data.fournisseur,
      date: data.date,
      dateEcheance: data.dateEcheance,
      lignes: data.lignes,
      totalHT,
      totalTVA,
      totalTTC,
      statut: 'en_attente',
      documentUrl: data.documentUrl,
      mouvementsStockIds: [],
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(collection(db, COLLECTION), facture)
    return docRef.id
  } catch (error) {
    console.error('Erreur création facture fournisseur:', error)
    throw error
  }
}

/**
 * Générer les mouvements de stock depuis une facture
 */
export async function genererMouvementsStockFacture(
  factureId: string,
  operateur: string
): Promise<string[]> {
  try {
    const facture = await getFactureFournisseurById(factureId)
    if (!facture) {
      throw new Error('Facture non trouvée')
    }
    
    if (facture.mouvementsStockIds.length > 0) {
      throw new Error('Les mouvements de stock ont déjà été générés pour cette facture')
    }
    
    const mouvementsIds: string[] = []
    
    // Créer un mouvement d'entrée pour chaque ligne
    for (const ligne of facture.lignes) {
      const mouvementId = await createMouvementStock({
        articleId: ligne.articleId,
        articleCode: ligne.code || 'N/A',
        articleDescription: ligne.description || 'Article',
        type: 'entree',
        quantite: ligne.quantite,
        date: facture.date,
        raison: `Facture ${facture.numero} - ${facture.fournisseur}`,
        coutUnitaire: ligne.prixUnitaire,
        coutTotal: ligne.prixUnitaire * ligne.quantite,
        depotDestination: ligne.depotDestination,
        operateur,
        factureId
      })
      
      mouvementsIds.push(mouvementId)
    }
    
    // Mettre à jour la facture avec les IDs des mouvements
    await updateDoc(doc(db, COLLECTION, factureId), {
      mouvementsStockIds: mouvementsIds,
      updatedAt: new Date().toISOString()
    })
    
    return mouvementsIds
  } catch (error) {
    console.error('Erreur génération mouvements stock:', error)
    throw error
  }
}

/**
 * Récupérer toutes les factures fournisseurs
 */
export async function getAllFacturesFournisseurs(): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(facturesRef, orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures fournisseurs:', error)
    throw error
  }
}

/**
 * Récupérer une facture par ID
 */
export async function getFactureFournisseurById(
  id: string
): Promise<FactureFournisseur | null> {
  try {
    const factureRef = doc(db, COLLECTION, id)
    const factureSnap = await getDoc(factureRef)
    
    if (!factureSnap.exists()) {
      return null
    }
    
    return {
      id: factureSnap.id,
      ...factureSnap.data()
    } as FactureFournisseur
  } catch (error) {
    console.error('Erreur récupération facture fournisseur:', error)
    throw error
  }
}

/**
 * Récupérer les factures par fournisseur
 */
export async function getFacturesParFournisseur(
  fournisseur: string
): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('fournisseur', '==', fournisseur),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures par fournisseur:', error)
    throw error
  }
}

/**
 * Récupérer les factures par statut
 */
export async function getFacturesParStatut(
  statut: 'en_attente' | 'payee'
): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('statut', '==', statut),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures par statut:', error)
    throw error
  }
}

/**
 * Récupérer les factures en attente de paiement
 */
export async function getFacturesEnAttente(): Promise<FactureFournisseur[]> {
  try {
    return await getFacturesParStatut('en_attente')
  } catch (error) {
    console.error('Erreur récupération factures en attente:', error)
    throw error
  }
}

/**
 * Récupérer les factures d'une période
 */
export async function getFacturesPeriode(
  dateDebut: string,
  dateFin: string
): Promise<FactureFournisseur[]> {
  try {
    const facturesRef = collection(db, COLLECTION)
    const q = query(
      facturesRef,
      where('date', '>=', dateDebut),
      where('date', '<=', dateFin),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FactureFournisseur))
  } catch (error) {
    console.error('Erreur récupération factures période:', error)
    throw error
  }
}

/**
 * Marquer une facture comme payée
 */
export async function marquerFacturePayee(
  id: string,
  datePaiement: string,
  moyenPaiement: string,
  referencePaiement?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      statut: 'payee',
      datePaiement,
      moyenPaiement,
      referencePaiement,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur marquage facture payée:', error)
    throw error
  }
}

/**
 * Mettre à jour une facture
 */
export async function updateFactureFournisseur(
  id: string,
  data: Partial<FactureFournisseurInput>
): Promise<void> {
  try {
    const updates: any = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    // Recalculer les totaux si les lignes sont modifiées
    if (updates.lignes) {
      let totalHT = 0
      let totalTVA = 0
      let totalTTC = 0
      
      updates.lignes.forEach((ligne: LigneFactureFournisseur) => {
        totalHT += ligne.totalHT
        totalTVA += ligne.totalTVA
        totalTTC += ligne.totalTTC
      })
      
      updates.totalHT = totalHT
      updates.totalTVA = totalTVA
      updates.totalTTC = totalTTC
    }
    
    await updateDoc(doc(db, COLLECTION, id), updates)
  } catch (error) {
    console.error('Erreur mise à jour facture:', error)
    throw error
  }
}

/**
 * Supprimer une facture
 */
export async function deleteFactureFournisseur(id: string): Promise<void> {
  try {
    const facture = await getFactureFournisseurById(id)
    if (!facture) {
      throw new Error('Facture non trouvée')
    }
    
    // Empêcher la suppression si mouvements de stock générés
    if (facture.mouvementsStockIds.length > 0) {
      throw new Error(
        'Impossible de supprimer une facture avec des mouvements de stock générés. ' +
        'Supprimez d\'abord les mouvements associés.'
      )
    }
    
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression facture:', error)
    throw error
  }
}

/**
 * Vérifier si un numéro de facture existe déjà
 */
export async function factureNumeroExists(
  numero: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const factures = await getAllFacturesFournisseurs()
    return factures.some(f => f.numero === numero && f.id !== excludeId)
  } catch (error) {
    console.error('Erreur vérification numéro facture:', error)
    throw error
  }
}

/**
 * Calculer les statistiques factures fournisseurs
 */
export async function getStatistiquesFacturesFournisseurs() {
  try {
    const factures = await getAllFacturesFournisseurs()
    
    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
    
    const facturesMois = factures.filter(f => f.date >= debutMois && f.date <= finMois)
    
    return {
      nombreFactures: factures.length,
      nombreEnAttente: factures.filter(f => f.statut === 'en_attente').length,
      montantEnAttente: factures
        .filter(f => f.statut === 'en_attente')
        .reduce((sum, f) => sum + f.totalTTC, 0),
      montantMois: facturesMois.reduce((sum, f) => sum + f.totalTTC, 0),
      nombreFacturesMois: facturesMois.length
    }
  } catch (error) {
    console.error('Erreur statistiques factures:', error)
    throw error
  }
}

/**
 * Récupérer les achats par fournisseur (pour analyse)
 */
export async function getAchatsParFournisseur() {
  try {
    const factures = await getAllFacturesFournisseurs()
    
    const achatsParFournisseur: { [fournisseur: string]: {
      nombreFactures: number
      montantTotal: number
      montantMoyen: number
    }} = {}
    
    factures.forEach(facture => {
      if (!achatsParFournisseur[facture.fournisseur]) {
        achatsParFournisseur[facture.fournisseur] = {
          nombreFactures: 0,
          montantTotal: 0,
          montantMoyen: 0
        }
      }
      
      achatsParFournisseur[facture.fournisseur].nombreFactures++
      achatsParFournisseur[facture.fournisseur].montantTotal += facture.totalTTC
    })
    
    // Calculer les moyennes
    Object.keys(achatsParFournisseur).forEach(fournisseur => {
      const data = achatsParFournisseur[fournisseur]
      data.montantMoyen = data.montantTotal / data.nombreFactures
    })
    
    return achatsParFournisseur
  } catch (error) {
    console.error('Erreur analyse achats par fournisseur:', error)
    throw error
  }
}
