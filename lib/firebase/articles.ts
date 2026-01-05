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
  orderBy
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
  compteComptable?: string      // 🆕 NOUVEAU - Numéro compte (ex: "6064")
  compteIntitule?: string        // 🆕 NOUVEAU - Intitulé compte (ex: "Fournitures admin")
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
  compteComptable?: string      // 🆕 NOUVEAU
  compteIntitule?: string        // 🆕 NOUVEAU
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
    
    // Nettoyer les undefined (Firebase ne les accepte pas)
    const cleanData = Object.entries({
      code: articleData.code.toUpperCase(),
      nom: articleData.nom,
      description: articleData.description,
      prix: articleData.prix,
      unite: articleData.unite,
      tva: articleData.tva || 20,
      actif: articleData.actif !== undefined ? articleData.actif : true,
      compteComptable: articleData.compteComptable,
      compteIntitule: articleData.compteIntitule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    const articleRef = doc(db, 'articles', articleId)
    await setDoc(articleRef, cleanData)
    
    return articleId
  } catch (error) {
    console.error('Erreur création article:', error)
    throw error
  }
}

/**
 * Mettre à jour un article
 */
export async function updateArticle(
  id: string, 
  articleData: Partial<ArticleInput>
): Promise<void> {
  try {
    // Nettoyer les undefined (Firebase ne les accepte pas)
    const cleanData = Object.entries({
      ...articleData,
      updatedAt: new Date().toISOString()
    }).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    const articleRef = doc(db, 'articles', id)
    await updateDoc(articleRef, cleanData)
  } catch (error) {
    console.error('Erreur mise à jour article:', error)
    throw error
  }
}

/**
 * Supprimer un article
 */
export async function deleteArticle(id: string): Promise<void> {
  try {
    const articleRef = doc(db, 'articles', id)
    await deleteDoc(articleRef)
  } catch (error) {
    console.error('Erreur suppression article:', error)
    throw error
  }
}

/**
 * 🆕 Migrer les articles existants vers un compte comptable par défaut
 */
export async function migrateArticlesComptesComptables(
  compteParDefaut: string = '6064',
  intituleParDefaut: string = 'Fournitures administratives'
): Promise<{ total: number, migres: number }> {
  try {
    const articles = await getAllArticles()
    let migres = 0
    
    for (const article of articles) {
      // Si pas de compte comptable, assigner le compte par défaut
      if (!article.compteComptable) {
        await updateArticle(article.id, {
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
    console.error('Erreur migration articles:', error)
    throw error
  }
}

/**
 * 🆕 Rechercher articles par compte comptable
 */
export async function getArticlesByCompteComptable(compteComptable: string): Promise<Article[]> {
  try {
    const articles = await getAllArticles()
    return articles.filter(a => a.compteComptable === compteComptable)
  } catch (error) {
    console.error('Erreur recherche articles par compte:', error)
    throw error
  }
}

/**
 * Vérifier si un code article existe déjà
 */
export async function articleCodeExists(code: string, excludeId?: string): Promise<boolean> {
  try {
    const articles = await getAllArticles()
    return articles.some(a => a.code === code && a.id !== excludeId)
  } catch (error) {
    console.error('Erreur vérification code article:', error)
    throw error
  }
}
