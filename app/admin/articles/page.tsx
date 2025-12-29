'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllArticles, deleteArticle, type Article } from '@/lib/firebase/articles'

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      setLoading(true)
      const data = await getAllArticles()
      setArticles(data)
    } catch (error) {
      console.error('Erreur chargement articles:', error)
      alert('Erreur lors du chargement des articles')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteArticle(id)
      await loadArticles()
      setDeleteConfirm(null)
      alert('Article supprimé avec succès')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredArticles = articles.filter(article =>
    article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/intranet/dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Retour au Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Articles & Prestations</h1>
              <p className="text-gray-800 mt-1">Gestion du catalogue des articles</p>
            </div>
            <button
              onClick={() => router.push('/admin/articles/nouveau')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ➕ Nouvel Article
            </button>
          </div>

          {/* Recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par code ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Total Articles</div>
            <div className="text-3xl font-bold text-gray-900">{articles.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Articles Actifs</div>
            <div className="text-3xl font-bold text-green-600">
              {articles.filter(a => a.actif).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Articles Inactifs</div>
            <div className="text-3xl font-bold text-orange-600">
              {articles.filter(a => !a.actif).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Résultats</div>
            <div className="text-3xl font-bold text-blue-600">{filteredArticles.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-800">
              Chargement des articles...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="p-12 text-center text-gray-800">
              {searchTerm ? 'Aucun article trouvé' : 'Aucun article créé'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Désignation
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Prix HT
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Unité
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      TVA
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-gray-900">{article.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{article.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-semibold text-gray-900">
                          {article.prix.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.unite}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                        {article.tva}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          article.actif 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/articles/${article.id}/modifier`)}
                            className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          {deleteConfirm === article.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50"
                              >
                                ✓ Confirmer
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded hover:bg-gray-100"
                              >
                                ✗ Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(article.id)}
                              className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}