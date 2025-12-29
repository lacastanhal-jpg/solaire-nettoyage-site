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
  Timestamp 
} from 'firebase/firestore'

export interface Article {
  id: string
  code: string
  nom: string
  description?: string
  prix: number
  unite: string
  tva: number
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface ArticleInput {
  code: string
  nom: string
  description?: string
  prix: number
  unite: string
  tva?: number
  actif?: boolean
}

/**
 * Récupérer tous les articles
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const articlesRef = collection(db, 'articles')
    const q = query(articlesRef, orderBy('code', 'asc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Article))
  } catch (error) {
    console.error('Erreur récupération articles:', error)
    throw error
  }
}

/**
 * Récupérer un article par ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const articleRef = doc(db, 'articles', id)
    const articleSnap = await getDoc(articleRef)
    
    if (!articleSnap.exists()) {
      return null
    }
    
    return {
      id: articleSnap.id,
      ...articleSnap.data()
    } as Article
  } catch (error) {
    console.error('Erreur récupération article:', error)
    throw error
  }
}

/**
 * Créer un nouvel article
 */
export async function createArticle(articleData: ArticleInput): Promise<string> {
  try {
    // Générer un ID unique basé sur le code
    const articleId = articleData.code.toUpperCase().replace(/\s/g, '_')
    
    const article: Omit<Article, 'id'> = {
      code: articleData.code.toUpperCase(),
      nom: articleData.nom,
      description: articleData.description || '',
      prix: articleData.prix,
      unite: articleData.unite,
      tva: articleData.tva || 20,
      actif: articleData.actif !== undefined ? articleData.actif : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await setDoc(doc(db, 'articles', articleId), article)
    return articleId
  } catch (error) {
    console.error('Erreur création article:', error)
    throw error
  }
}

/**
 * Modifier un article existant
 */
export async function updateArticle(id: string, articleData: Partial<ArticleInput>): Promise<void> {
  try {
    const articleRef = doc(db, 'articles', id)
    
    const updates: any = {
      ...articleData,
      updatedAt: new Date().toISOString()
    }
    
    // Normaliser le code si présent
    if (updates.code) {
      updates.code = updates.code.toUpperCase()
    }
    
    await updateDoc(articleRef, updates)
  } catch (error) {
    console.error('Erreur modification article:', error)
    throw error
  }
}

/**
 * Supprimer un article
 */
export async function deleteArticle(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'articles', id))
  } catch (error) {
    console.error('Erreur suppression article:', error)
    throw error
  }
}

/**
 * Désactiver un article (soft delete)
 */
export async function deactivateArticle(id: string): Promise<void> {
  try {
    await updateArticle(id, { actif: false })
  } catch (error) {
    console.error('Erreur désactivation article:', error)
    throw error
  }
}

/**
 * Activer un article
 */
export async function activateArticle(id: string): Promise<void> {
  try {
    await updateArticle(id, { actif: true })
  } catch (error) {
    console.error('Erreur activation article:', error)
    throw error
  }
}

/**
 * Vérifier si un code article existe déjà
 */
export async function articleCodeExists(code: string, excludeId?: string): Promise<boolean> {
  try {
    const articles = await getAllArticles()
    const normalizedCode = code.toUpperCase()
    
    return articles.some(article => 
      article.code === normalizedCode && article.id !== excludeId
    )
  } catch (error) {
    console.error('Erreur vérification code article:', error)
    throw error
  }
}
