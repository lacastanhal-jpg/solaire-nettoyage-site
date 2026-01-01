'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createArticleStock, articleStockCodeExists } from '@/lib/firebase'
import { DEPOTS } from '@/lib/types/stock-flotte'

export default function NouvelArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    fournisseur: '',
    prixUnitaire: '',
    stockMin: '0',
    stockAtelier: '0',
    stock26T: '0',
    stock32T: '0',
    stockSemi: '0'
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.code || !formData.description || !formData.fournisseur) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setLoading(true)

      // Vérifier que le code n'existe pas déjà
      const codeExists = await articleStockCodeExists(formData.code)
      if (codeExists) {
        alert(`Le code "${formData.code}" existe déjà`)
        setLoading(false)
        return
      }

      await createArticleStock({
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
        },
        actif: true
      })

      alert('Article créé avec succès !')
      router.push('/admin/stock-flotte/articles')
    } catch (error) {
      console.error('Erreur création article:', error)
      alert('Erreur lors de la création de l\'article')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/articles" className="hover:text-gray-900">Articles</Link>
          <span>→</span>
          <span className="text-gray-900">Nouveau</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nouvel Article Stock</h1>
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
                placeholder="Ex: BAC5X5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Identifiant unique de l'article</p>
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
                placeholder="Ex: LE BON ROULEMENT"
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
              placeholder="Description détaillée de l'article"
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
                placeholder="0.00"
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
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Seuil d'alerte si stock inférieur</p>
            </div>
          </div>
        </div>

        {/* Stock par dépôt */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock initial par dépôt</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Atelier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atelier
              </label>
              <input
                type="number"
                value={formData.stockAtelier}
                onChange={(e) => setFormData({ ...formData, stockAtelier: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Porteur 26T */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porteur 26 T
              </label>
              <input
                type="number"
                value={formData.stock26T}
                onChange={(e) => setFormData({ ...formData, stock26T: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Porteur 32T */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porteur 32 T
              </label>
              <input
                type="number"
                value={formData.stock32T}
                onChange={(e) => setFormData({ ...formData, stock32T: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Semi Remorque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semi Remorque
              </label>
              <input
                type="number"
                value={formData.stockSemi}
                onChange={(e) => setFormData({ ...formData, stockSemi: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Stock total initial : </span>
              <span className="text-lg font-bold text-blue-600">
                {(parseInt(formData.stockAtelier) || 0) + 
                 (parseInt(formData.stock26T) || 0) + 
                 (parseInt(formData.stock32T) || 0) + 
                 (parseInt(formData.stockSemi) || 0)} unités
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/stock-flotte/articles"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Création...' : 'Créer l\'article'}
          </button>
        </div>
      </form>
    </div>
  )
}
