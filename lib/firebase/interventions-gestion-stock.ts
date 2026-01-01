import { db } from './config'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore'

/**
 * Annuler tous les mouvements de stock d'une intervention
 * et restaurer le stock
 */
export async function annulerMouvementsIntervention(interventionId: string): Promise<void> {
  try {
    // 1. Récupérer tous les mouvements de cette intervention
    const mouvementsQuery = query(
      collection(db, 'mouvements_stock'),
      where('interventionId', '==', interventionId)
    )
    
    const mouvementsSnapshot = await getDocs(mouvementsQuery)
    
    console.log(`Annulation de ${mouvementsSnapshot.size} mouvement(s)...`)
    
    // 2. Pour chaque mouvement, restaurer le stock
    for (const mouvementDoc of mouvementsSnapshot.docs) {
      const mouvement = mouvementDoc.data()
      
      // Récupérer l'article
      const articleRef = doc(db, 'articles_stock', mouvement.articleId)
      const articleSnap = await getDoc(articleRef)
      
      if (!articleSnap.exists()) {
        console.warn(`Article ${mouvement.articleId} non trouvé`)
        continue
      }
      
      const article = articleSnap.data()
      const depotSource = mouvement.depotSource || 'Atelier'
      const depotDestination = mouvement.depotDestination
      
      // Calculer le nouveau stock selon le type de mouvement
      let nouveauStockParDepot = { ...article.stockParDepot }
      
      if (mouvement.type === 'sortie') {
        // Annuler sortie = remettre les quantités
        nouveauStockParDepot[depotSource] = (nouveauStockParDepot[depotSource] || 0) + mouvement.quantite
        
      } else if (mouvement.type === 'entree') {
        // Annuler entrée = retirer les quantités
        const depot = depotDestination || 'Atelier'
        nouveauStockParDepot[depot] = Math.max(0, (nouveauStockParDepot[depot] || 0) - mouvement.quantite)
        
      } else if (mouvement.type === 'transfert' && depotDestination) {
        // Annuler transfert = remettre au dépôt source, retirer du dépôt destination
        nouveauStockParDepot[depotSource] = (nouveauStockParDepot[depotSource] || 0) + mouvement.quantite
        nouveauStockParDepot[depotDestination] = Math.max(0, (nouveauStockParDepot[depotDestination] || 0) - mouvement.quantite)
      }
      
      // Recalculer le stock total
      const stockTotal = Object.values(nouveauStockParDepot).reduce((sum: number, qty) => sum + (qty as number), 0)
      
      // Mettre à jour l'article
      await updateDoc(articleRef, {
        stockParDepot: nouveauStockParDepot,
        stockTotal,
        updatedAt: new Date().toISOString()
      })
      
      console.log(`Stock restauré pour article ${mouvement.articleId}`)
      
      // 3. Supprimer le mouvement
      await deleteDoc(doc(db, 'mouvements_stock', mouvementDoc.id))
      console.log(`Mouvement ${mouvementDoc.id} supprimé`)
    }
    
    console.log('✅ Tous les mouvements annulés et stock restauré')
    
  } catch (error) {
    console.error('Erreur annulation mouvements:', error)
    throw error
  }
}

/**
 * Supprimer une intervention
 * Si finalisée, annule d'abord les mouvements stock
 */
export async function supprimerIntervention(interventionId: string): Promise<void> {
  try {
    // 1. Récupérer l'intervention
    const interventionRef = doc(db, 'interventions_equipement', interventionId)
    const interventionSnap = await getDoc(interventionRef)
    
    if (!interventionSnap.exists()) {
      throw new Error('Intervention non trouvée')
    }
    
    const intervention = interventionSnap.data()
    
    // 2. Si finalisée, annuler les mouvements stock
    if (intervention.statut === 'terminee') {
      console.log('Intervention finalisée, annulation des mouvements...')
      await annulerMouvementsIntervention(interventionId)
    }
    
    // 3. Supprimer l'intervention
    await deleteDoc(interventionRef)
    console.log('✅ Intervention supprimée')
    
  } catch (error) {
    console.error('Erreur suppression intervention:', error)
    throw error
  }
}

/**
 * Annuler la finalisation d'une intervention
 * Restaure le stock et repasse en statut "en_cours"
 */
export async function annulerFinalisation(interventionId: string): Promise<void> {
  try {
    // 1. Annuler les mouvements
    await annulerMouvementsIntervention(interventionId)
    
    // 2. Repasser l'intervention en statut "en_cours"
    const interventionRef = doc(db, 'interventions_equipement', interventionId)
    await updateDoc(interventionRef, {
      statut: 'en_cours',
      updatedAt: new Date().toISOString()
    })
    
    console.log('✅ Finalisation annulée, intervention remise en cours')
    
  } catch (error) {
    console.error('Erreur annulation finalisation:', error)
    throw error
  }
}

/**
 * Vérifier si une intervention a des mouvements stock
 */
export async function interventionAMouvements(interventionId: string): Promise<boolean> {
  try {
    const mouvementsQuery = query(
      collection(db, 'mouvements_stock'),
      where('interventionId', '==', interventionId)
    )
    
    const mouvementsSnapshot = await getDocs(mouvementsQuery)
    return mouvementsSnapshot.size > 0
    
  } catch (error) {
    console.error('Erreur vérification mouvements:', error)
    return false
  }
}

/**
 * Compter le nombre de mouvements d'une intervention
 */
export async function compterMouvementsIntervention(interventionId: string): Promise<number> {
  try {
    const mouvementsQuery = query(
      collection(db, 'mouvements_stock'),
      where('interventionId', '==', interventionId)
    )
    
    const mouvementsSnapshot = await getDocs(mouvementsQuery)
    return mouvementsSnapshot.size
    
  } catch (error) {
    console.error('Erreur comptage mouvements:', error)
    return 0
  }
}
