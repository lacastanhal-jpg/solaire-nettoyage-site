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
  increment,
  runTransaction
} from 'firebase/firestore'
import type { MouvementStock } from '@/lib/types/stock-flotte'

const COLLECTION = 'mouvements_stock'

// Créer un mouvement de stock (met à jour automatiquement les stocks)
// ✅ VERSION CORRIGÉE AVEC TRANSACTION ATOMIQUE
export async function createMouvementStock(data: Omit<MouvementStock, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    // Utiliser une transaction pour garantir l'atomicité
    const mouvementId = await runTransaction(db, async (transaction) => {
      const articleRef = doc(db, 'articles_stock', data.articleId)
      
      // Lire l'article actuel dans la transaction
      const articleDoc = await transaction.get(articleRef)
      
      if (!articleDoc.exists()) {
        throw new Error(`Article ${data.articleId} non trouvé`)
      }
      
      const article = articleDoc.data()
      const stockParDepot = article.stockParDepot || {}
      
      // Construire le document mouvement
      const mouvementData: any = {
        type: data.type,
        articleId: data.articleId,
        quantite: data.quantite,
        operateur: data.operateur,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Ajouter les champs optionnels
      if (data.depotSource) mouvementData.depotSource = data.depotSource
      if (data.depotDestination) mouvementData.depotDestination = data.depotDestination
      if (data.raison) mouvementData.raison = data.raison
      if (data.notes) mouvementData.notes = data.notes
      if (data.equipementId) mouvementData.equipementId = data.equipementId
      if (data.interventionId) mouvementData.interventionId = data.interventionId
      if (data.articleCode) mouvementData.articleCode = data.articleCode
      if (data.articleDescription) mouvementData.articleDescription = data.articleDescription
      if (data.coutUnitaire !== undefined) mouvementData.coutUnitaire = data.coutUnitaire
      if (data.coutTotal !== undefined) mouvementData.coutTotal = data.coutTotal

      // Créer la référence pour le nouveau mouvement
      const mouvementRef = doc(collection(db, COLLECTION))
      
      // Créer le mouvement dans la transaction
      transaction.set(mouvementRef, mouvementData)
      
      // Calculer les nouvelles valeurs de stock selon le type
      const updates: any = {
        updatedAt: new Date().toISOString()
      }
      
      switch (data.type) {
        case 'entree':
          // Ajouter au dépôt de destination
          if (data.depotDestination) {
            const stockActuel = stockParDepot[data.depotDestination] || 0
            updates[`stockParDepot.${data.depotDestination}`] = stockActuel + data.quantite
            updates.stockTotal = increment(data.quantite)
          }
          break

        case 'sortie':
          // Retirer du dépôt d'origine
          if (data.depotSource) {
            const stockActuel = stockParDepot[data.depotSource] || 0
            const nouveauStock = stockActuel - data.quantite
            
            // Vérification : ne pas descendre en dessous de 0 (optionnel, peut être commenté si négatif autorisé)
            if (nouveauStock < 0) {
              console.warn(`⚠️ Stock négatif pour article ${data.articleId} au dépôt ${data.depotSource}: ${nouveauStock}`)
              // On autorise quand même (comme demandé par l'utilisateur pour gérer pièces perdues)
            }
            
            updates[`stockParDepot.${data.depotSource}`] = nouveauStock
            updates.stockTotal = increment(-data.quantite)
          }
          break

        case 'transfert':
          // Retirer de l'origine, ajouter à la destination
          if (data.depotSource && data.depotDestination) {
            const stockSource = stockParDepot[data.depotSource] || 0
            const stockDest = stockParDepot[data.depotDestination] || 0
            
            updates[`stockParDepot.${data.depotSource}`] = stockSource - data.quantite
            updates[`stockParDepot.${data.depotDestination}`] = stockDest + data.quantite
            // Le stock total ne change pas (juste transfert)
          }
          break

        case 'ajustement':
          // Définir une nouvelle quantité absolue dans le dépôt
          if (data.depotDestination) {
            const stockActuel = stockParDepot[data.depotDestination] || 0
            const difference = data.quantite - stockActuel

            updates[`stockParDepot.${data.depotDestination}`] = data.quantite
            updates.stockTotal = increment(difference)
          }
          break
          
        case 'retour':
          // Retour = entrée (remettre en stock)
          if (data.depotDestination) {
            const stockActuel = stockParDepot[data.depotDestination] || 0
            updates[`stockParDepot.${data.depotDestination}`] = stockActuel + data.quantite
            updates.stockTotal = increment(data.quantite)
          }
          break
      }
      
      // Mettre à jour l'article dans la transaction
      transaction.update(articleRef, updates)
      
      return mouvementRef.id
    })
    
    console.log(`✅ Mouvement stock créé avec succès (transaction atomique): ${mouvementId}`)
    return mouvementId
    
  } catch (error) {
    console.error('❌ Erreur création mouvement (transaction échouée):', error)
    throw error
  }
}

// ⚠️ ANCIENNE FONCTION updateStocksFromMouvement - PLUS UTILISÉE
// Conservée pour référence mais remplacée par la transaction atomique ci-dessus
async function updateStocksFromMouvement_OLD(mouvement: Omit<MouvementStock, 'id' | 'createdAt' | 'updatedAt'>) {
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
