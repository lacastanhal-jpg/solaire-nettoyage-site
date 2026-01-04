'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  getAllCategories,
  deleteCategorie,
  toggleCategorieActif,
  isCategorieUtilisee,
  type CategorieDepense
} from '@/lib/firebase/categories-depenses'
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function CategoriesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CategorieDepense[]>([])
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixe' | 'variable'>('all')
  const [statutFilter, setStatutFilter] = useState<'all' | 'actif' | 'inactif'>('all')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
      alert('❌ Erreur chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActif(id: string, actif: boolean) {
    try {
      await toggleCategorieActif(id, actif)
      await loadCategories()
    } catch (error) {
      console.error('Erreur toggle:', error)
      alert('❌ Erreur lors de la modification')
    }
  }

  async function handleSupprimer(categorie: CategorieDepense) {
    try {
      // Vérifier si utilisée
      const utilisee = await isCategorieUtilisee(categorie.id)
      
      if (utilisee) {
        alert('⚠️ Cette catégorie est utilisée dans des notes de frais, factures ou charges.\n\nVous devez d\'abord supprimer ces éléments ou les réaffecter à une autre catégorie.')
        return
      }

      if (!confirm(`Supprimer la catégorie "${categorie.nom}" ?\n\nCette action est irréversible.`)) {
        return
      }

      await deleteCategorie(categorie.id)
      alert('✅ Catégorie supprimée')
      await loadCategories()
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  const categoriesFiltrees = categories.filter(cat => {
    if (typeFilter !== 'all' && cat.type !== typeFilter) return false
    if (statutFilter === 'actif' && !cat.actif) return false
    if (statutFilter === 'inactif' && cat.actif) return false
    return true
  })

  const statsTotal = categories.length
  const statsFixes = categories.filter(c => c.type === 'fixe').length
  const statsVariables = categories.filter(c => c.type === 'variable').length
  const statsActives = categories.filter(c => c.actif).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories de Dépenses</h1>
          <p className="text-gray-600 mt-2">
            {statsTotal} catégorie{statsTotal > 1 ? 's' : ''} • {statsActives} active{statsActives > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Retour
          </Link>
          <Link
            href="/admin/finances/categories/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Catégorie
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{statsTotal}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Fixes</p>
          <p className="text-3xl font-bold text-blue-600">{statsFixes}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Variables</p>
          <p className="text-3xl font-bold text-orange-600">{statsVariables}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Actives</p>
          <p className="text-3xl font-bold text-green-600">{statsActives}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-sm text-gray-600 mr-2">Type :</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous</option>
              <option value="fixe">Fixes</option>
              <option value="variable">Variables</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 mr-2">Statut :</label>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous</option>
              <option value="actif">Actives</option>
              <option value="inactif">Inactives</option>
            </select>
          </div>

          {(typeFilter !== 'all' || statutFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setStatutFilter('all')
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>
      </div>

      {/* Liste des catégories */}
      {categoriesFiltrees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune catégorie trouvée</p>
          {(typeFilter !== 'all' || statutFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setStatutFilter('all')
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesFiltrees.map((categorie) => (
            <div
              key={categorie.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
                !categorie.actif ? 'opacity-60' : ''
              }`}
            >
              {/* Header catégorie */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: categorie.couleur + '20' }}
                  >
                    {categorie.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{categorie.nom}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        categorie.type === 'fixe'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {categorie.type === 'fixe' ? '📌 Fixe' : '📊 Variable'}
                      </span>
                      {!categorie.actif && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {categorie.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {categorie.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Link
                  href={`/admin/finances/categories/${categorie.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Link>
                
                <button
                  onClick={() => handleToggleActif(categorie.id, !categorie.actif)}
                  className={`px-3 py-2 rounded text-sm ${
                    categorie.actif
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  title={categorie.actif ? 'Désactiver' : 'Activer'}
                >
                  {categorie.actif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => handleSupprimer(categorie)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
