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
  where,
  orderBy 
} from 'firebase/firestore'
import type { ArticleStock, ArticleStockInput, Depot } from '@/lib/types/stock-flotte'

const COLLECTION = 'articles_stock'

/**
 * Calculer le stock total à partir des stocks par dépôt
 */
function calculerStockTotal(stockParDepot: ArticleStock['stockParDepot']): number {
  return Object.values(stockParDepot).reduce((total, stock) => total + stock, 0)
}

/**
 * Créer un nouvel article stock
 */
export async function createArticleStock(data: ArticleStockInput): Promise<string> {
  try {
    // Générer ID basé sur le code
    const articleId = data.code.toUpperCase().replace(/\s/g, '_')
    
    // Initialiser les stocks par dépôt
    const stockParDepot = {
      'Atelier': data.stockParDepot?.['Atelier'] || 0,
      'Porteur 26 T': data.stockParDepot?.['Porteur 26 T'] || 0,
      'Porteur 32 T': data.stockParDepot?.['Porteur 32 T'] || 0,
      'Semi Remorque': data.stockParDepot?.['Semi Remorque'] || 0
    }
    
    const article: Omit<ArticleStock, 'id'> = {
      code: data.code.toUpperCase(),
      description: data.description,
      fournisseur: data.fournisseur,
      prixUnitaire: data.prixUnitaire,
      stockParDepot,
      stockTotal: calculerStockTotal(stockParDepot),
      stockMin: data.stockMin || 0,
      equipementsAffectes: data.equipementsAffectes || [],
      photoUrl: data.photoUrl || undefined,
      actif: data.actif !== undefined ? data.actif : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await setDoc(doc(db, COLLECTION, articleId), article)
    return articleId
  } catch (error) {
    console.error('Erreur création article stock:', error)
    throw error
  }
}

/**
 * Récupérer tous les articles stock
 */
export async function getAllArticlesStock(): Promise<ArticleStock[]> {
  try {
    const articlesRef = collection(db, COLLECTION)
    const q = query(articlesRef, orderBy('code', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ArticleStock))
  } catch (error) {
    console.error('Erreur récupération articles stock:', error)
    throw error
  }
}

/**
 * Récupérer un article stock par ID
 */
export async function getArticleStockById(id: string): Promise<ArticleStock | null> {
  try {
    const articleRef = doc(db, COLLECTION, id)
    const articleSnap = await getDoc(articleRef)
    
    if (!articleSnap.exists()) {
      return null
    }
    
    return {
      id: articleSnap.id,
      ...articleSnap.data()
    } as ArticleStock
  } catch (error) {
    console.error('Erreur récupération article stock:', error)
    throw error
  }
}

/**
 * Récupérer les articles en alerte (stock < minimum)
 */
export async function getArticlesEnAlerte(): Promise<ArticleStock[]> {
  try {
    const articles = await getAllArticlesStock()
    return articles.filter(article => article.stockTotal < article.stockMin && article.actif)
  } catch (error) {
    console.error('Erreur récupération articles en alerte:', error)
    throw error
  }
}

/**
 * Récupérer les articles par fournisseur
 */
export async function getArticlesParFournisseur(fournisseur: string): Promise<ArticleStock[]> {
  try {
    const articlesRef = collection(db, COLLECTION)
    const q = query(
      articlesRef, 
      where('fournisseur', '==', fournisseur),
      orderBy('code', 'asc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ArticleStock))
  } catch (error) {
    console.error('Erreur récupération articles par fournisseur:', error)
    throw error
  }
}

/**
 * Mettre à jour un article stock
 */
export async function updateArticleStock(
  id: string, 
  data: Partial<ArticleStockInput>
): Promise<void> {
  try {
    const articleRef = doc(db, COLLECTION, id)
    
    const updates: any = {
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    // Normaliser le code si présent
    if (updates.code) {
      updates.code = updates.code.toUpperCase()
    }
    
    // Recalculer stock total si stock par dépôt modifié
    if (updates.stockParDepot) {
      updates.stockTotal = calculerStockTotal(updates.stockParDepot)
    }
    
    await updateDoc(articleRef, updates)
  } catch (error) {
    console.error('Erreur mise à jour article stock:', error)
    throw error
  }
}

/**
 * Mettre à jour le stock d'un dépôt spécifique
 */
export async function updateStockDepot(
  articleId: string,
  depot: Depot,
  nouvelleQuantite: number
): Promise<void> {
  try {
    const article = await getArticleStockById(articleId)
    if (!article) {
      throw new Error('Article non trouvé')
    }
    
    const nouveauStockParDepot = {
      ...article.stockParDepot,
      [depot]: nouvelleQuantite
    }
    
    await updateArticleStock(articleId, {
      stockParDepot: nouveauStockParDepot
    })
  } catch (error) {
    console.error('Erreur mise à jour stock dépôt:', error)
    throw error
  }
}

/**
 * Ajouter/Retirer du stock (utilisé par les mouvements)
 */
export async function ajusterStock(
  articleId: string,
  depot: Depot,
  quantite: number  // Positif = ajout, Négatif = retrait
): Promise<void> {
  try {
    const article = await getArticleStockById(articleId)
    if (!article) {
      throw new Error('Article non trouvé')
    }
    
    const stockActuel = article.stockParDepot[depot]
    const nouveauStock = stockActuel + quantite
    
    if (nouveauStock < 0) {
      throw new Error(`Stock insuffisant dans ${depot}. Stock actuel: ${stockActuel}, demandé: ${Math.abs(quantite)}`)
    }
    
    await updateStockDepot(articleId, depot, nouveauStock)
  } catch (error) {
    console.error('Erreur ajustement stock:', error)
    throw error
  }
}

/**
 * Affecter un article à un équipement
 */
export async function affecterArticleEquipement(
  articleId: string,
  equipementId: string
): Promise<void> {
  try {
    const article = await getArticleStockById(articleId)
    if (!article) {
      throw new Error('Article non trouvé')
    }
    
    if (article.equipementsAffectes.includes(equipementId)) {
      return // Déjà affecté
    }
    
    await updateArticleStock(articleId, {
      equipementsAffectes: [...article.equipementsAffectes, equipementId]
    })
  } catch (error) {
    console.error('Erreur affectation article:', error)
    throw error
  }
}

/**
 * Retirer l'affectation d'un article à un équipement
 */
export async function retirerAffectationArticle(
  articleId: string,
  equipementId: string
): Promise<void> {
  try {
    const article = await getArticleStockById(articleId)
    if (!article) {
      throw new Error('Article non trouvé')
    }
    
    await updateArticleStock(articleId, {
      equipementsAffectes: article.equipementsAffectes.filter(id => id !== equipementId)
    })
  } catch (error) {
    console.error('Erreur retrait affectation article:', error)
    throw error
  }
}

/**
 * Supprimer un article stock
 */
export async function deleteArticleStock(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Erreur suppression article stock:', error)
    throw error
  }
}

/**
 * Désactiver un article (soft delete)
 */
export async function desactiverArticleStock(id: string): Promise<void> {
  try {
    await updateArticleStock(id, { actif: false })
  } catch (error) {
    console.error('Erreur désactivation article stock:', error)
    throw error
  }
}

/**
 * Vérifier si un code article existe déjà
 */
export async function articleStockCodeExists(
  code: string, 
  excludeId?: string
): Promise<boolean> {
  try {
    const articles = await getAllArticlesStock()
    const normalizedCode = code.toUpperCase()
    
    return articles.some(article => 
      article.code === normalizedCode && article.id !== excludeId
    )
  } catch (error) {
    console.error('Erreur vérification code article:', error)
    throw error
  }
}

/**
 * Récupérer les statistiques stock
 */
export async function getStatistiquesStock() {
  try {
    const articles = await getAllArticlesStock()
    
    const valeurParDepot: { [key: string]: number } = {
      'Atelier': 0,
      'Porteur 26 T': 0,
      'Porteur 32 T': 0,
      'Semi Remorque': 0
    }
    
    articles.forEach(article => {
      Object.entries(article.stockParDepot).forEach(([depot, quantite]) => {
        valeurParDepot[depot] += quantite * article.prixUnitaire
      })
    })
    
    const valeurTotaleStock = Object.values(valeurParDepot).reduce((sum, val) => sum + val, 0)
    const alertes = articles.filter(a => a.stockTotal < a.stockMin && a.actif)
    
    return {
      valeurTotaleStock,
      valeurParDepot,
      nombreArticles: articles.filter(a => a.actif).length,
      nombreAlertes: alertes.length
    }
  } catch (error) {
    console.error('Erreur calcul statistiques stock:', error)
    throw error
  }
}
