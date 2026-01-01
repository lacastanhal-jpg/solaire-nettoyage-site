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
  limit,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore'
import type { MouvementStock } from '@/lib/types/stock-flotte'

const COLLECTION = 'mouvements_stock'

// Créer un mouvement de stock (met à jour automatiquement les stocks)
export async function createMouvementStock(data: Omit<MouvementStock, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Construire le document en excluant les champs undefined
    const mouvementData: any = {
      type: data.type,
      articleId: data.articleId,
      quantite: data.quantite,
      operateur: data.operateur,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Ajouter les champs optionnels seulement s'ils existent
    if (data.depotSource) mouvementData.depotSource = data.depotSource
    if (data.depotDestination) mouvementData.depotDestination = data.depotDestination
    if (data.raison) mouvementData.raison = data.raison
    if (data.notes) mouvementData.notes = data.notes
    if (data.equipementId) mouvementData.equipementId = data.equipementId
    if (data.interventionId) mouvementData.interventionId = data.interventionId

    // Créer le mouvement
    const docRef = await addDoc(collection(db, COLLECTION), mouvementData)

    // Mettre à jour les stocks dans articles_stock
    await updateStocksFromMouvement(data)

    return docRef.id
  } catch (error) {
    console.error('Erreur création mouvement:', error)
    throw error
  }
}

// Mettre à jour les stocks selon le type de mouvement
async function updateStocksFromMouvement(mouvement: Omit<MouvementStock, 'id' | 'createdAt' | 'updatedAt'>) {
  const articleRef = doc(db, 'articles_stock', mouvement.articleId)
  
  switch (mouvement.type) {
    case 'entree':
      // Ajouter au dépôt de destination
      if (mouvement.depotDestination) {
        await updateDoc(articleRef, {
          [`stockParDepot.${mouvement.depotDestination}`]: increment(mouvement.quantite),
          stockTotal: increment(mouvement.quantite),
          updatedAt: new Date().toISOString()
        })
      }
      break

    case 'sortie':
      // Retirer du dépôt d'origine
      if (mouvement.depotSource) {
        await updateDoc(articleRef, {
          [`stockParDepot.${mouvement.depotSource}`]: increment(-mouvement.quantite),
          stockTotal: increment(-mouvement.quantite),
          updatedAt: new Date().toISOString()
        })
      }
      break

    case 'transfert':
      // Retirer de l'origine, ajouter à la destination
      if (mouvement.depotSource && mouvement.depotDestination) {
        await updateDoc(articleRef, {
          [`stockParDepot.${mouvement.depotSource}`]: increment(-mouvement.quantite),
          [`stockParDepot.${mouvement.depotDestination}`]: increment(mouvement.quantite),
          updatedAt: new Date().toISOString()
        })
      }
      break

    case 'ajustement':
      // Définir une nouvelle quantité absolue dans le dépôt
      if (mouvement.depotDestination) {
        // Récupérer le stock actuel
        const articleDoc = await getDoc(articleRef)
        if (articleDoc.exists()) {
          const article = articleDoc.data()
          const stockActuel = article.stockParDepot[mouvement.depotDestination] || 0
          const difference = mouvement.quantite - stockActuel

          await updateDoc(articleRef, {
            [`stockParDepot.${mouvement.depotDestination}`]: mouvement.quantite,
            stockTotal: increment(difference),
            updatedAt: new Date().toISOString()
          })
        }
      }
      break
  }
}

// Récupérer tous les mouvements
export async function getAllMouvementsStock(): Promise<MouvementStock[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MouvementStock[]
  } catch (error) {
    console.error('Erreur récupération mouvements:', error)
    return []
  }
}

// Récupérer les mouvements par article
export async function getMouvementsParArticle(articleId: string): Promise<MouvementStock[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('articleId', '==', articleId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MouvementStock[]
  } catch (error) {
    console.error('Erreur récupération mouvements par article:', error)
    return []
  }
}

// Récupérer les mouvements par type
export async function getMouvementsParType(type: 'entree' | 'sortie' | 'transfert' | 'ajustement'): Promise<MouvementStock[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('type', '==', type),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MouvementStock[]
  } catch (error) {
    console.error('Erreur récupération mouvements par type:', error)
    return []
  }
}

// Récupérer les derniers mouvements
export async function getDerniersMouvements(n: number = 10): Promise<MouvementStock[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy('date', 'desc'),
      limit(n)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MouvementStock[]
  } catch (error) {
    console.error('Erreur récupération derniers mouvements:', error)
    return []
  }
}

// Alias pour compatibilité
export const getMouvementsStockRecents = getDerniersMouvements

// Récupérer les mouvements sur une période
export async function getMouvementsPeriode(dateDebut: string, dateFin: string): Promise<MouvementStock[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('date', '>=', dateDebut),
      where('date', '<=', dateFin),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MouvementStock[]
  } catch (error) {
    console.error('Erreur récupération mouvements période:', error)
    return []
  }
}

// Récupérer les mouvements par équipement
export async function getMouvementsParEquipement(equipementId: string): Promise<MouvementStock[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('equipementId', '==', equipementId),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MouvementStock[]
  } catch (error) {
    console.error('Erreur récupération mouvements par équipement:', error)
    return []
  }
}

// Statistiques mouvements du mois
export async function getStatistiquesMouvementsMois(): Promise<{
  entrees: number
  sorties: number
  transferts: number
  ajustements: number
}> {
  try {
    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const mouvements = await getMouvementsPeriode(debutMois, finMois)

    return {
      entrees: mouvements.filter(m => m.type === 'entree').length,
      sorties: mouvements.filter(m => m.type === 'sortie').length,
      transferts: mouvements.filter(m => m.type === 'transfert').length,
      ajustements: mouvements.filter(m => m.type === 'ajustement').length
    }
  } catch (error) {
    console.error('Erreur statistiques mouvements mois:', error)
    return { entrees: 0, sorties: 0, transferts: 0, ajustements: 0 }
  }
}

// Récupérer un mouvement par ID
export async function getMouvementStockById(id: string): Promise<MouvementStock | null> {
  try {
    const mouvementRef = doc(db, COLLECTION, id)
    const mouvementSnap = await getDoc(mouvementRef)
    
    if (!mouvementSnap.exists()) {
      return null
    }
    
    return {
      id: mouvementSnap.id,
      ...mouvementSnap.data()
    } as MouvementStock
  } catch (error) {
    console.error('Erreur récupération mouvement:', error)
    throw error
  }
}

// Annuler un mouvement (ne fait rien pour l'instant, juste pour l'export)
export async function annulerMouvement(mouvementId: string): Promise<void> {
  // TODO: Implémenter l'annulation avec mouvement inverse
  console.warn('Annulation de mouvement non implémentée')
}
