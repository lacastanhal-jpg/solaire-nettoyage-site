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

const COLLECTION = 'articles_stock'

/**
 * Interface Article Stock avec comptes comptables
 */
export interface ArticleStock {
  id: string
  code: string
  description: string
  fournisseur: string
  prixUnitaire: number
  stockParDepot: { [depot: string]: number }
  stockTotal: number
  stockMin: number
  equipementsAffectes: string[]
  photoUrl?: string
  actif: boolean
  compteComptable?: string      // 🆕 NOUVEAU - Numéro compte (ex: "6063")
  compteIntitule?: string        // 🆕 NOUVEAU - Intitulé compte (ex: "Fournitures d'entretien")
  createdAt: string
  updatedAt: string
}

export interface ArticleStockInput {
  code: string
  description: string
  fournisseur: string
  prixUnitaire: number
  stockParDepot?: { [depot: string]: number }
  stockMin?: number
  equipementsAffectes?: string[]
  photoUrl?: string
  actif?: boolean
  compteComptable?: string      // 🆕 NOUVEAU
  compteIntitule?: string        // 🆕 NOUVEAU
}

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
    
    // Nettoyer les undefined (Firebase ne les accepte pas)
    const cleanData = Object.entries({
      code: data.code.toUpperCase(),
      description: data.description,
      fournisseur: data.fournisseur,
      prixUnitaire: data.prixUnitaire,
      stockParDepot,
      stockTotal: calculerStockTotal(stockParDepot),
      stockMin: data.stockMin || 0,
      equipementsAffectes: data.equipementsAffectes || [],
      photoUrl: data.photoUrl,
      actif: data.actif !== undefined ? data.actif : true,
      compteComptable: data.compteComptable,
      compteIntitule: data.compteIntitule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    await setDoc(doc(db, COLLECTION, articleId), cleanData)
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
 * Mettre à jour un article stock
 */
export async function updateArticleStock(
  id: string,
  updates: Partial<ArticleStockInput>
): Promise<void> {
  try {
    // Nettoyer les undefined
    const cleanUpdates = Object.entries({
      ...updates,
      updatedAt: new Date().toISOString()
    }).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    // Recalculer stock total si stockParDepot modifié
    if (updates.stockParDepot) {
      cleanUpdates.stockTotal = calculerStockTotal(updates.stockParDepot)
    }
    
    const articleRef = doc(db, COLLECTION, id)
    await updateDoc(articleRef, cleanUpdates)
  } catch (error) {
    console.error('Erreur mise à jour article stock:', error)
    throw error
  }
}

/**
 * Mettre à jour le stock d'un dépôt
 */
export async function updateStockDepot(
  articleId: string,
  depot: string,
  nouvelleQuantite: number
): Promise<void> {
  try {
    const article = await getArticleStockById(articleId)
    if (!article) {
      throw new Error('Article introuvable')
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
 * Supprimer un article stock
 */
export async function deleteArticleStock(id: string): Promise<void> {
  try {
    const articleRef = doc(db, COLLECTION, id)
    await deleteDoc(articleRef)
  } catch (error) {
    console.error('Erreur suppression article stock:', error)
    throw error
  }
}

/**
 * Récupérer les articles en alerte (stock < minimum)
 */
export async function getArticlesEnAlerte(): Promise<ArticleStock[]> {
  try {
    const articles = await getAllArticlesStock()
    return articles.filter(a => a.actif && a.stockTotal < a.stockMin)
  } catch (error) {
    console.error('Erreur récupération articles en alerte:', error)
    throw error
  }
}

/**
 * Récupérer les articles affectés à un équipement
 */
export async function getArticlesAffectesEquipement(equipementId: string): Promise<ArticleStock[]> {
  try {
    const articles = await getAllArticlesStock()
    return articles.filter(a => a.equipementsAffectes.includes(equipementId))
  } catch (error) {
    console.error('Erreur récupération articles équipement:', error)
    throw error
  }
}

/**
 * 🆕 Migrer les articles stock existants vers un compte comptable par défaut
 */
export async function migrateArticlesStockComptesComptables(
  compteParDefaut: string = '6063',
  intituleParDefaut: string = 'Fournitures d\'entretien et de petit équipement'
): Promise<{ total: number, migres: number }> {
  try {
    const articles = await getAllArticlesStock()
    let migres = 0
    
    for (const article of articles) {
      // Si pas de compte comptable, assigner le compte par défaut
      if (!article.compteComptable) {
        await updateArticleStock(article.id, {
          compteComptable: compteParDefaut,
          compteIntitule: intituleParDefaut
        })
        migres++
      }
    }
    
    return {
      total: articles.length,
      migres
    }
  } catch (error) {
    console.error('Erreur migration articles stock:', error)
    throw error
  }
}

/**
 * 🆕 Rechercher articles stock par compte comptable
 */
export async function getArticlesStockByCompteComptable(compteComptable: string): Promise<ArticleStock[]> {
  try {
    const articles = await getAllArticlesStock()
    return articles.filter(a => a.compteComptable === compteComptable)
  } catch (error) {
    console.error('Erreur recherche articles stock par compte:', error)
    throw error
  }
}

/**
 * 🆕 Statistiques par compte comptable
 */
export async function getStatistiquesParCompteComptable(): Promise<{
  compte: string
  intitule: string
  nombreArticles: number
  valeurStockTotale: number
}[]> {
  try {
    const articles = await getAllArticlesStock()
    
    // Grouper par compte comptable
    const parCompte = articles.reduce((acc, article) => {
      const compte = article.compteComptable || 'NON_DEFINI'
      const intitule = article.compteIntitule || 'Non défini'
      
      if (!acc[compte]) {
        acc[compte] = {
          compte,
          intitule,
          nombreArticles: 0,
          valeurStockTotale: 0
        }
      }
      
      acc[compte].nombreArticles++
      acc[compte].valeurStockTotale += article.stockTotal * article.prixUnitaire
      
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(parCompte)
  } catch (error) {
    console.error('Erreur statistiques par compte:', error)
    throw error
  }
}

/**
 * Ajuster stock (wrapper pour updateStockDepot)
 */
export async function ajusterStock(
  articleId: string,
  depot: string,
  quantite: number,
  motif?: string
): Promise<void> {
  return updateStockDepot(articleId, depot, quantite)
}

/**
 * Affecter article à équipement
 */
export async function affecterArticleEquipement(
  articleId: string,
  equipementId: string
): Promise<void> {
  try {
    const articleRef = doc(db, 'articles_stock', articleId)
    const articleDoc = await getDoc(articleRef)
    
    if (!articleDoc.exists()) {
      throw new Error('Article introuvable')
    }
    
    const article = articleDoc.data() as ArticleStock
    const equipementsAffectes = article.equipementsAffectes || []
    
    if (!equipementsAffectes.includes(equipementId)) {
      equipementsAffectes.push(equipementId)
      await updateDoc(articleRef, {
        equipementsAffectes,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Erreur affectation article équipement:', error)
    throw error
  }
}

/**
 * Retirer affectation article équipement
 */
export async function retirerAffectationArticle(
  articleId: string,
  equipementId: string
): Promise<void> {
  try {
    const articleRef = doc(db, 'articles_stock', articleId)
    const articleDoc = await getDoc(articleRef)
    
    if (!articleDoc.exists()) {
      throw new Error('Article introuvable')
    }
    
    const article = articleDoc.data() as ArticleStock
    const equipementsAffectes = (article.equipementsAffectes || []).filter(
      id => id !== equipementId
    )
    
    await updateDoc(articleRef, {
      equipementsAffectes,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur retrait affectation:', error)
    throw error
  }
}

/**
 * Désactiver article stock
 */
export async function desactiverArticleStock(id: string): Promise<void> {
  try {
    const articleRef = doc(db, 'articles_stock', id)
    await updateDoc(articleRef, {
      actif: false,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur désactivation article:', error)
    throw error
  }
}

/**
 * Vérifier si code article existe
 */
export async function articleStockCodeExists(code: string, excludeId?: string): Promise<boolean> {
  try {
    const articles = await getAllArticlesStock()
    return articles.some(a => a.code === code && a.id !== excludeId)
  } catch (error) {
    console.error('Erreur vérification code:', error)
    throw error
  }
}

/**
 * Statistiques stock globales
 */
export async function getStatistiquesStock(): Promise<{
  totalArticles: number
  totalValeur: number
  articlesEnAlerte: number
  articlesActifs: number
}> {
  try {
    const articles = await getAllArticlesStock()
    const alertes = await getArticlesEnAlerte()
    
    return {
      totalArticles: articles.length,
      totalValeur: articles.reduce((sum, a) => sum + (a.stockTotal * a.prixUnitaire), 0),
      articlesEnAlerte: alertes.length,
      articlesActifs: articles.filter(a => a.actif).length
    }
  } catch (error) {
    console.error('Erreur statistiques stock:', error)
    throw error
  }
}

/**
 * Articles par fournisseur
 */
export async function getArticlesParFournisseur(fournisseur: string): Promise<ArticleStock[]> {
  try {
    const articles = await getAllArticlesStock()
    return articles.filter(a => a.fournisseur === fournisseur)
  } catch (error) {
    console.error('Erreur articles par fournisseur:', error)
    throw error
  }
}
