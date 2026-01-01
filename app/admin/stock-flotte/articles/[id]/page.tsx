'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticleStock, desactiverArticleStock, getMouvementsStockByArticle } from '@/lib/firebase'
import type { ArticleStock, MouvementStock } from '@/lib/types/stock-flotte'

export default function FicheArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [article, setArticle] = useState<ArticleStock | null>(null)
  const [mouvements, setMouvements] = useState<MouvementStock[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMouvements, setLoadingMouvements] = useState(true)

  useEffect(() => {
    loadArticle()
    loadMouvements()
  }, [params.id])

  async function loadArticle() {
    try {
      const data = await getArticleStock(params.id)
      if (!data) {
        alert('Article non trouvé')
        router.push('/admin/stock-flotte/articles')
        return
      }
      setArticle(data)
    } catch (error) {
      console.error('Erreur chargement article:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function loadMouvements() {
    try {
      const data = await getMouvementsStockByArticle(params.id)
      setMouvements(data)
    } catch (error) {
      console.error('Erreur chargement mouvements:', error)
    } finally {
      setLoadingMouvements(false)
    }
  }

  async function handleDesactiver() {
    if (!article) return
    if (!confirm(`Désactiver l'article ${article.code} ?`)) return

    try {
      await desactiverArticleStock(params.id)
      alert('Article désactivé avec succès')
      loadArticle()
    } catch (error) {
      console.error('Erreur désactivation:', error)
      alert('Erreur lors de la désactivation')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!article) return null

  const stockEnAlerte = article.stockTotal < article.stockMin

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/articles" className="hover:text-gray-900">Articles</Link>
          <span>→</span>
          <span className="text-gray-900">{article.code}</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{article.code}</h1>
            <p className="text-gray-600 mt-1">{article.description}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/stock-flotte/articles/${params.id}/modifier`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Modifier
            </Link>
            {article.actif && (
              <button
                onClick={handleDesactiver}
                className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-semibold"
              >
                Désactiver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alertes */}
      {stockEnAlerte && article.actif && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">Stock en dessous du minimum</p>
              <p className="text-sm text-red-700">
                Stock actuel : {article.stockTotal} | Stock minimum : {article.stockMin}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Code article</p>
                <p className="font-semibold text-gray-900">{article.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fournisseur</p>
                <p className="font-semibold text-gray-900">{article.fournisseur}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prix unitaire</p>
                <p className="font-semibold text-gray-900">
                  {article.prixUnitaire.toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p>
                  {article.actif ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Inactif
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-900 mt-1">{article.description}</p>
            </div>
          </div>

          {/* Stock par dépôt */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock par dépôt</h2>
            
            <div className="space-y-3">
              {Object.entries(article.stockParDepot).map(([depot, quantite]) => (
                <div key={depot} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{depot}</span>
                  <span className="text-lg font-bold text-gray-900">{quantite}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historique mouvements */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Historique des mouvements ({mouvements.length})
            </h2>
            
            {loadingMouvements ? (
              <p className="text-gray-500 text-center py-8">Chargement...</p>
            ) : mouvements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun mouvement enregistré</p>
            ) : (
              <div className="space-y-3">
                {mouvements.slice(0, 10).map((mvt) => (
                  <div key={mvt.id} className="flex justify-between items-center p-3 border-l-4 bg-gray-50 rounded-lg"
                    style={{ 
                      borderLeftColor: 
                        mvt.type === 'entree' ? '#10b981' : 
                        mvt.type === 'sortie' ? '#ef4444' : 
                        mvt.type === 'transfert' ? '#3b82f6' : '#f59e0b' 
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {mvt.type === 'entree' ? '📥 Entrée' : 
                         mvt.type === 'sortie' ? '📤 Sortie' : 
                         mvt.type === 'transfert' ? '🔄 Transfert' : '⚙️ Ajustement'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(mvt.date).toLocaleDateString('fr-FR')} - {mvt.operateur}
                      </p>
                      {mvt.raison && (
                        <p className="text-xs text-gray-500 mt-1">{mvt.raison}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        mvt.type === 'entree' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {mvt.type === 'entree' ? '+' : '-'}{mvt.quantite}
                      </p>
                      {mvt.depotSource && (
                        <p className="text-xs text-gray-500">{mvt.depotSource}</p>
                      )}
                      {mvt.depotDestination && (
                        <p className="text-xs text-gray-500">→ {mvt.depotDestination}</p>
                      )}
                    </div>
                  </div>
                ))}
                {mouvements.length > 10 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    + {mouvements.length - 10} mouvements plus anciens
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Statistiques */}
        <div className="space-y-6">
          {/* Stock total */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Stock total</p>
            <p className={`text-4xl font-bold ${stockEnAlerte ? 'text-red-600' : 'text-green-600'}`}>
              {article.stockTotal}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Min: {article.stockMin}
            </p>
          </div>

          {/* Valeur stock */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Valeur du stock</p>
            <p className="text-2xl font-bold text-gray-900">
              {(article.stockTotal * article.prixUnitaire).toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {article.stockTotal} × {article.prixUnitaire.toLocaleString('fr-FR', { 
                style: 'currency', 
                currency: 'EUR' 
              })}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/stock-flotte/mouvements/nouveau?articleId=${params.id}&type=entree`}
                className="block w-full px-4 py-2 text-center bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium"
              >
                📥 Entrée stock
              </Link>
              <Link
                href={`/admin/stock-flotte/mouvements/nouveau?articleId=${params.id}&type=sortie`}
                className="block w-full px-4 py-2 text-center bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
              >
                📤 Sortie stock
              </Link>
              <Link
                href={`/admin/stock-flotte/mouvements/nouveau?articleId=${params.id}&type=transfert`}
                className="block w-full px-4 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
              >
                🔄 Transfert
              </Link>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Informations système</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Créé le</p>
                <p className="text-gray-900">
                  {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Modifié le</p>
                <p className="text-gray-900">
                  {new Date(article.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
