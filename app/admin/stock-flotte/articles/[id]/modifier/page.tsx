'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticleStock, updateArticleStock, articleStockCodeExists } from '@/lib/firebase'
import type { ArticleStock } from '@/lib/types/stock-flotte'

export default function ModifierArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<ArticleStock | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    fournisseur: '',
    prixUnitaire: '',
    stockMin: '',
    stockAtelier: '',
    stock26T: '',
    stock32T: '',
    stockSemi: ''
  })

  useEffect(() => {
    loadArticle()
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
      setFormData({
        code: data.code,
        description: data.description,
        fournisseur: data.fournisseur,
        prixUnitaire: data.prixUnitaire.toString(),
        stockMin: data.stockMin.toString(),
        stockAtelier: data.stockParDepot['Atelier']?.toString() || '0',
        stock26T: data.stockParDepot['Porteur 26 T']?.toString() || '0',
        stock32T: data.stockParDepot['Porteur 32 T']?.toString() || '0',
        stockSemi: data.stockParDepot['Semi Remorque']?.toString() || '0'
      })
    } catch (error) {
      console.error('Erreur chargement article:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.code || !formData.description || !formData.fournisseur) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setSaving(true)

      // Vérifier que le code n'existe pas déjà (si modifié)
      if (formData.code !== article?.code) {
        const codeExists = await articleStockCodeExists(formData.code)
        if (codeExists) {
          alert(`Le code "${formData.code}" existe déjà`)
          setSaving(false)
          return
        }
      }

      await updateArticleStock(params.id, {
        code: formData.code.toUpperCase(),
        description: formData.description,
        fournisseur: formData.fournisseur,
        prixUnitaire: parseFloat(formData.prixUnitaire) || 0,
        stockMin: parseInt(formData.stockMin) || 0,
        stockParDepot: {
          'Atelier': parseInt(formData.stockAtelier) || 0,
          'Porteur 26 T': parseInt(formData.stock26T) || 0,
          'Porteur 32 T': parseInt(formData.stock32T) || 0,
          'Semi Remorque': parseInt(formData.stockSemi) || 0
        }
      })

      alert('Article modifié avec succès !')
      router.push(`/admin/stock-flotte/articles/${params.id}`)
    } catch (error) {
      console.error('Erreur modification article:', error)
      alert('Erreur lors de la modification de l\'article')
      setSaving(false)
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/articles" className="hover:text-gray-900">Articles</Link>
          <span>→</span>
          <Link href={`/admin/stock-flotte/articles/${params.id}`} className="hover:text-gray-900">
            {article.code}
          </Link>
          <span>→</span>
          <span className="text-gray-900">Modifier</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Modifier l'article</h1>
      </div>

      {/* Avertissement */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-900">Attention</p>
            <p className="text-sm text-yellow-700">
              La modification des stocks par dépôt va créer automatiquement des mouvements d'ajustement dans l'historique.
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code article <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Prix unitaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix unitaire (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.prixUnitaire}
                onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock minimum (alerte)
              </label>
              <input
                type="number"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stock par dépôt */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock par dépôt</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Atelier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atelier
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.stockAtelier}
                  onChange={(e) => setFormData({ ...formData, stockAtelier: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  (actuel: {article.stockParDepot['Atelier']})
                </span>
              </div>
            </div>

            {/* Porteur 26T */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porteur 26 T
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.stock26T}
                  onChange={(e) => setFormData({ ...formData, stock26T: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  (actuel: {article.stockParDepot['Porteur 26 T']})
                </span>
              </div>
            </div>

            {/* Porteur 32T */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porteur 32 T
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.stock32T}
                  onChange={(e) => setFormData({ ...formData, stock32T: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  (actuel: {article.stockParDepot['Porteur 32 T']})
                </span>
              </div>
            </div>

            {/* Semi Remorque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semi Remorque
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.stockSemi}
                  onChange={(e) => setFormData({ ...formData, stockSemi: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  (actuel: {article.stockParDepot['Semi Remorque']})
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Nouveau stock total : </span>
              <span className="text-lg font-bold text-blue-600">
                {(parseInt(formData.stockAtelier) || 0) + 
                 (parseInt(formData.stock26T) || 0) + 
                 (parseInt(formData.stock32T) || 0) + 
                 (parseInt(formData.stockSemi) || 0)} unités
              </span>
              <span className="text-gray-600 ml-2">
                (actuel: {article.stockTotal})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/admin/stock-flotte/articles/${params.id}`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
