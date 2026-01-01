import { db } from './config'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import type { ArticleStock, MouvementStock } from '@/lib/types/stock-flotte'

/**
 * Interface pour les prévisions de réapprovisionnement
 */
export interface PrevisionReapprovisionnement {
  articleId: string
  articleCode: string
  articleDescription: string
  stockActuel: number
  stockMin: number
  consommationMoyenneMensuelle: number
  consommationMoyenneJournaliere: number
  joursRestantsAvantRupture: number
  dateRuptureEstimee: string
  quantiteSuggereCommande: number
  urgence: 'critique' | 'urgent' | 'normal' | 'ok'
}

/**
 * Interface pour les statistiques de consommation
 */
export interface StatistiquesConsommation {
  articleId: string
  articleCode: string
  mois: string // "2026-01"
  quantiteConsommee: number
  nombreSorties: number
  valeurConsommee: number
}

/**
 * Calculer la consommation moyenne mensuelle d'un article
 */
async function calculerConsommationMoyenne(
  articleId: string, 
  nombreMois: number = 6
): Promise<number> {
  try {
    const mouvementsRef = collection(db, 'mouvements_stock')
    
    // Date de début (6 mois en arrière)
    const dateDebut = new Date()
    dateDebut.setMonth(dateDebut.getMonth() - nombreMois)
    
    const q = query(
      mouvementsRef,
      where('articleId', '==', articleId),
      where('type', '==', 'sortie'),
      where('date', '>=', dateDebut.toISOString().split('T')[0]),
      orderBy('date', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const mouvements = snapshot.docs.map(doc => doc.data() as MouvementStock)
    
    if (mouvements.length === 0) {
      return 0
    }
    
    // Somme des quantités sorties
    const totalConsomme = mouvements.reduce((sum, m) => sum + m.quantite, 0)
    
    // Moyenne mensuelle
    return totalConsomme / nombreMois
  } catch (error) {
    console.error('Erreur calcul consommation moyenne:', error)
    return 0
  }
}

/**
 * Générer les prévisions de réapprovisionnement pour tous les articles
 */
export async function genererPrevisionsReapprovisionnement(): Promise<PrevisionReapprovisionnement[]> {
  try {
    // Récupérer tous les articles actifs
    const articlesRef = collection(db, 'articles_stock')
    const q = query(
      articlesRef,
      where('actif', '==', true),
      orderBy('code', 'asc')
    )
    
    const snapshot = await getDocs(q)
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ArticleStock))
    
    const previsions: PrevisionReapprovisionnement[] = []
    
    for (const article of articles) {
      // Calculer consommation moyenne
      const consommationMoyenneMensuelle = await calculerConsommationMoyenne(article.id, 6)
      const consommationMoyenneJournaliere = consommationMoyenneMensuelle / 30
      
      // Calculer jours restants avant rupture
      let joursRestantsAvantRupture = 0
      if (consommationMoyenneJournaliere > 0) {
        joursRestantsAvantRupture = Math.floor(article.stockTotal / consommationMoyenneJournaliere)
      } else {
        joursRestantsAvantRupture = 999 // Stock stable
      }
      
      // Date rupture estimée
      const dateRupture = new Date()
      dateRupture.setDate(dateRupture.getDate() + joursRestantsAvantRupture)
      
      // Quantité suggérée (3 mois de stock)
      const quantiteSuggereCommande = Math.max(
        article.stockMin - article.stockTotal,
        Math.ceil(consommationMoyenneMensuelle * 3)
      )
      
      // Niveau d'urgence
      let urgence: 'critique' | 'urgent' | 'normal' | 'ok' = 'ok'
      if (article.stockTotal < article.stockMin) {
        urgence = 'critique'
      } else if (joursRestantsAvantRupture <= 15) {
        urgence = 'urgent'
      } else if (joursRestantsAvantRupture <= 30) {
        urgence = 'normal'
      }
      
      // Ajouter prévision seulement si pertinent
      if (urgence !== 'ok' || consommationMoyenneMensuelle > 0) {
        previsions.push({
          articleId: article.id,
          articleCode: article.code,
          articleDescription: article.description,
          stockActuel: article.stockTotal,
          stockMin: article.stockMin,
          consommationMoyenneMensuelle,
          consommationMoyenneJournaliere,
          joursRestantsAvantRupture,
          dateRuptureEstimee: dateRupture.toISOString().split('T')[0],
          quantiteSuggereCommande,
          urgence
        })
      }
    }
    
    // Trier par urgence
    return previsions.sort((a, b) => {
      const ordre = { critique: 0, urgent: 1, normal: 2, ok: 3 }
      return ordre[a.urgence] - ordre[b.urgence]
    })
  } catch (error) {
    console.error('Erreur génération prévisions:', error)
    throw error
  }
}

/**
 * Obtenir les statistiques de consommation par mois
 */
export async function getStatistiquesConsommationParMois(
  nombreMois: number = 6
): Promise<StatistiquesConsommation[]> {
  try {
    // Date de début
    const dateDebut = new Date()
    dateDebut.setMonth(dateDebut.getMonth() - nombreMois)
    
    const mouvementsRef = collection(db, 'mouvements_stock')
    const q = query(
      mouvementsRef,
      where('type', '==', 'sortie'),
      where('date', '>=', dateDebut.toISOString().split('T')[0]),
      orderBy('date', 'asc')
    )
    
    const snapshot = await getDocs(q)
    const mouvements = snapshot.docs.map(doc => doc.data() as MouvementStock)
    
    // Grouper par article et mois
    const statsParArticleMois: { [key: string]: StatistiquesConsommation } = {}
    
    mouvements.forEach(mouvement => {
      const mois = mouvement.date.substring(0, 7) // "2026-01"
      const key = `${mouvement.articleId}_${mois}`
      
      if (!statsParArticleMois[key]) {
        statsParArticleMois[key] = {
          articleId: mouvement.articleId,
          articleCode: mouvement.articleCode,
          mois,
          quantiteConsommee: 0,
          nombreSorties: 0,
          valeurConsommee: 0
        }
      }
      
      statsParArticleMois[key].quantiteConsommee += mouvement.quantite
      statsParArticleMois[key].nombreSorties += 1
      statsParArticleMois[key].valeurConsommee += (mouvement.coutUnitaire || 0) * mouvement.quantite
    })
    
    return Object.values(statsParArticleMois).sort((a, b) => 
      b.mois.localeCompare(a.mois) || a.articleCode.localeCompare(b.articleCode)
    )
  } catch (error) {
    console.error('Erreur statistiques consommation:', error)
    throw error
  }
}

/**
 * Obtenir l'évolution du stock d'un article sur les 6 derniers mois
 */
export async function getEvolutionStockArticle(
  articleId: string,
  nombreMois: number = 6
): Promise<{ mois: string; stock: number }[]> {
  try {
    const dateDebut = new Date()
    dateDebut.setMonth(dateDebut.getMonth() - nombreMois)
    
    const mouvementsRef = collection(db, 'mouvements_stock')
    const q = query(
      mouvementsRef,
      where('articleId', '==', articleId),
      where('date', '>=', dateDebut.toISOString().split('T')[0]),
      orderBy('date', 'asc')
    )
    
    const snapshot = await getDocs(q)
    const mouvements = snapshot.docs.map(doc => doc.data() as MouvementStock)
    
    // Récupérer stock actuel
    const articleRef = collection(db, 'articles_stock')
    const articleSnap = await getDocs(query(articleRef, where('__name__', '==', articleId)))
    
    if (articleSnap.empty) {
      return []
    }
    
    const articleData = articleSnap.docs[0].data() as ArticleStock
    let stockCourant = articleData.stockTotal
    
    // Reconstituer l'historique en partant de maintenant et en remontant
    const evolution: { [mois: string]: number } = {}
    
    // Partir du mois actuel
    const moisActuel = new Date().toISOString().substring(0, 7)
    evolution[moisActuel] = stockCourant
    
    // Remonter dans le temps en inversant les mouvements
    mouvements.reverse().forEach(mouvement => {
      const mois = mouvement.date.substring(0, 7)
      
      // Inverser le mouvement pour remonter dans le temps
      if (mouvement.type === 'entree') {
        stockCourant -= mouvement.quantite
      } else if (mouvement.type === 'sortie') {
        stockCourant += mouvement.quantite
      }
      
      // Prendre le stock du début du mois
      if (!evolution[mois]) {
        evolution[mois] = stockCourant
      }
    })
    
    // Générer tableau des 6 derniers mois
    const resultat: { mois: string; stock: number }[] = []
    const maintenant = new Date()
    
    for (let i = nombreMois - 1; i >= 0; i--) {
      const date = new Date(maintenant)
      date.setMonth(date.getMonth() - i)
      const mois = date.toISOString().substring(0, 7)
      
      resultat.push({
        mois,
        stock: evolution[mois] || stockCourant
      })
    }
    
    return resultat
  } catch (error) {
    console.error('Erreur évolution stock:', error)
    return []
  }
}
