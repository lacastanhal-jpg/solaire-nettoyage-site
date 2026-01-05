'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllMouvementsStock, getAllArticlesStock } from '@/lib/firebase'
import type { ArticleStock } from '@/lib/firebase/stock-articles'
import type { MouvementStock } from '@/lib/types/stock-flotte'

export default function MouvementsStockPage() {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([])
  const [articles, setArticles] = useState<ArticleStock[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterArticle, setFilterArticle] = useState<string>('all')
  const [filterDepot, setFilterDepot] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [mouvementsData, articlesData] = await Promise.all([
        getAllMouvementsStock(),
        getAllArticlesStock()
      ])
      setMouvements(mouvementsData)
      setArticles(articlesData)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const depots = ['Atelier', 'Porteur 26 T', 'Porteur 32 T', 'Semi Remorque']

  const mouvementsFiltres = mouvements.filter(mvt => {
    // Filtre type
    if (filterType !== 'all' && mvt.type !== filterType) return false
    
    // Filtre article
    if (filterArticle !== 'all' && mvt.articleId !== filterArticle) return false
    
    // Filtre dépôt
    if (filterDepot !== 'all') {
      const matchDepot = 
        mvt.depotSource === filterDepot || 
        mvt.depotDestination === filterDepot
      if (!matchDepot) return false
    }
    
    // Filtre recherche
    if (searchTerm) {
      const article = articles.find(a => a.id === mvt.articleId)
      const matchSearch = 
        article?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mvt.operateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mvt.raison?.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchSearch) return false
    }
    
    return true
  })

  // Statistiques
  const stats = {
    total: mouvementsFiltres.length,
    entrees: mouvementsFiltres.filter(m => m.type === 'entree').length,
    sorties: mouvementsFiltres.filter(m => m.type === 'sortie').length,
    transferts: mouvementsFiltres.filter(m => m.type === 'transfert').length,
    ajustements: mouvementsFiltres.filter(m => m.type === 'ajustement').length,
    corrections: mouvementsFiltres.filter(m => m.type === 'correction').length
  }

  function getArticleInfo(articleId: string) {
    return articles.find(a => a.id === articleId)
  }

  function getTypeIcon(type: string) {
    switch(type) {
      case 'entree': return '📥'
      case 'sortie': return '📤'
      case 'transfert': return '🔄'
      case 'ajustement': return '⚙️'
      case 'correction': return '🔧'
      default: return '📦'
    }
  }

  function getTypeLabel(type: string) {
    switch(type) {
      case 'entree': return 'Entrée'
      case 'sortie': return 'Sortie'
      case 'transfert': return 'Transfert'
      case 'ajustement': return 'Ajustement'
      case 'correction': return 'Correction'
      default: return type
    }
  }

  function getTypeColor(type: string) {
    switch(type) {
      case 'entree': return 'bg-green-100 text-green-800'
      case 'sortie': return 'bg-red-100 text-red-800'
      case 'transfert': return 'bg-blue-100 text-blue-800'
      case 'ajustement': return 'bg-orange-100 text-orange-800'
      case 'correction': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des mouvements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mouvements Stock</h1>
          <p className="text-gray-600 mt-1">
            {mouvementsFiltres.length} mouvement{mouvementsFiltres.length > 1 ? 's' : ''} trouvé{mouvementsFiltres.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/stock-flotte/mouvements/nouveau"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Nouveau Mouvement
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Total mouvements</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-700">📥 Entrées</div>
          <div className="text-2xl font-bold text-green-900">{stats.entrees}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <div className="text-sm text-red-700">📤 Sorties</div>
          <div className="text-2xl font-bold text-red-900">{stats.sorties}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-sm text-blue-700">🔄 Transferts</div>
          <div className="text-2xl font-bold text-blue-900">{stats.transferts}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <div className="text-sm text-orange-700">⚙️ Ajustements</div>
          <div className="text-2xl font-bold text-orange-900">{stats.ajustements}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
          <div className="text-sm text-purple-700">🔧 Corrections</div>
          <div className="text-2xl font-bold text-purple-900">{stats.corrections}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Article, opérateur, motif..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de mouvement
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="entree">📥 Entrées</option>
              <option value="sortie">📤 Sorties</option>
              <option value="transfert">🔄 Transferts</option>
              <option value="ajustement">⚙️ Ajustements</option>
              <option value="correction">🔧 Corrections</option>
            </select>
          </div>

          {/* Article */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Article
            </label>
            <select
              value={filterArticle}
              onChange={(e) => setFilterArticle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les articles</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>
                  {article.code} - {article.description}
                </option>
              ))}
            </select>
          </div>

          {/* Dépôt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dépôt
            </label>
            <select
              value={filterDepot}
              onChange={(e) => setFilterDepot(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les dépôts</option>
              {depots.map(depot => (
                <option key={depot} value={depot}>{depot}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {mouvementsFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">Aucun mouvement trouvé</p>
          <Link
            href="/admin/stock-flotte/mouvements/nouveau"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            Créer le premier mouvement →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dépôt(s)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mouvementsFiltres.map((mvt) => {
                  const article = getArticleInfo(mvt.articleId)
                  return (
                    <tr key={mvt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(mvt.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(mvt.type)}`}>
                          {getTypeIcon(mvt.type)} {getTypeLabel(mvt.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/stock-flotte/articles/${mvt.articleId}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {article?.code || 'N/A'}
                        </Link>
                        <div className="text-xs text-gray-500">{article?.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {mvt.depotSource && <div>De: {mvt.depotSource}</div>}
                        {mvt.depotDestination && <div>Vers: {mvt.depotDestination}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-lg font-bold ${
                          mvt.type === 'entree' ? 'text-green-600' : 
                          mvt.type === 'sortie' ? 'text-red-600' : 
                          mvt.type === 'correction' ? 'text-purple-600' :
                          'text-blue-600'
                        }`}>
                          {mvt.type === 'entree' ? '+' : mvt.type === 'sortie' ? '-' : ''}{mvt.quantite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {mvt.operateur}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {mvt.raison || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link
                          href={`/admin/stock-flotte/mouvements/${mvt.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
