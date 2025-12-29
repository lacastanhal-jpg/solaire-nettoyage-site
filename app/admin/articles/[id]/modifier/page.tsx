'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getArticleById, updateArticle, articleCodeExists, type Article } from '@/lib/firebase/articles'

const UNITES = ['m2', 'm3', 'FT', 'heure', 'jour', 'unité', 'forfait']

export default function ModifierArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    prix: '',
    unite: 'm2',
    tva: '20',
    actif: true
  })

  useEffect(() => {
    loadArticle()
  }, [articleId])

  async function loadArticle() {
    try {
      setLoading(true)
      const data = await getArticleById(articleId)
      
      if (!data) {
        alert('Article introuvable')
        router.push('/admin/articles')
        return
      }

      setArticle(data)
      setFormData({
        code: data.code,
        nom: data.nom,
        description: data.description || '',
        prix: data.prix.toString(),
        unite: data.unite,
        tva: data.tva.toString(),
        actif: data.actif
      })
    } catch (error) {
      console.error('Erreur chargement article:', error)
      alert('Erreur lors du chargement de l\'article')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!formData.code || !formData.nom || !formData.prix) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const prix = parseFloat(formData.prix)
    if (isNaN(prix) || prix < 0) {
      alert('Le prix doit être un nombre positif')
      return
    }

    const tva = parseFloat(formData.tva)
    if (isNaN(tva) || tva < 0 || tva > 100) {
      alert('La TVA doit être entre 0 et 100%')
      return
    }

    try {
      setSaving(true)
      
      // Vérifier si le code existe déjà (sauf pour cet article)
      if (formData.code !== article?.code) {
        const codeExists = await articleCodeExists(formData.code, articleId)
        if (codeExists) {
          alert('Un article avec ce code existe déjà')
          return
        }
      }

      await updateArticle(articleId, {
        code: formData.code,
        nom: formData.nom,
        description: formData.description,
        prix: prix,
        unite: formData.unite,
        tva: tva,
        actif: formData.actif
      })

      alert('Article modifié avec succès')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Erreur modification article:', error)
      alert('Erreur lors de la modification de l\'article')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800">Chargement de l'article...</div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/articles')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Retour aux articles
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Modifier Article</h1>
          <p className="text-gray-800 mt-1">Code: {article.code}</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="Ex: NM04"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-gray-900 placeholder-gray-600"
                required
              />
              <p className="text-sm text-gray-700 mt-1">Code unique pour identifier l'article</p>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Nettoyage Modules"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nettoyage de votre centrale photovoltaïque.
Nous utilisons de l'eau pure produite par osmose inversé.
L'utilisation de plusieurs robots radio commandés et d'un micro tracteur permettent de ne pas abîmer le sol et de travailler en sécurité."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 resize-none"
              />
              <p className="text-sm text-gray-700 mt-1">Description détaillée de la prestation (optionnelle)</p>
            </div>

            {/* Prix et Unité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Unitaire HT (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({...formData, prix: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unite}
                  onChange={(e) => setFormData({...formData, unite: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {UNITES.map(unite => (
                    <option key={unite} value={unite}>{unite}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TVA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TVA (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.tva}
                onChange={(e) => setFormData({...formData, tva: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Statut */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Article actif (visible dans les devis)
                </span>
              </label>
            </div>

            {/* Aperçu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900 mb-2">Aperçu</div>
              <div className="space-y-1 text-sm text-blue-800">
                <div><strong>Code:</strong> {formData.code || '-'}</div>
                <div><strong>Désignation:</strong> {formData.nom || '-'}</div>
                <div><strong>Prix:</strong> {formData.prix ? `${parseFloat(formData.prix).toFixed(2)} €` : '-'} / {formData.unite}</div>
                <div><strong>TVA:</strong> {formData.tva}%</div>
                <div><strong>Prix TTC:</strong> {formData.prix ? `${(parseFloat(formData.prix) * (1 + parseFloat(formData.tva) / 100)).toFixed(2)} €` : '-'}</div>
              </div>
            </div>

            {/* Infos création */}
            <div className="text-sm text-gray-700 space-y-1 pt-4 border-t">
              <div>Créé le : {new Date(article.createdAt).toLocaleDateString('fr-FR')}</div>
              <div>Dernière modification : {new Date(article.updatedAt).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Enregistrement...' : '✓ Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/articles')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
