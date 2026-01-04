'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getCategorieById,
  updateCategorie,
  type CategorieDepense
} from '@/lib/firebase/categories-depenses'
import { ArrowLeft, Save } from 'lucide-react'

const COULEURS = [
  { nom: 'Bleu', valeur: '#3B82F6', icon: '🔵' },
  { nom: 'Rouge', valeur: '#EF4444', icon: '🔴' },
  { nom: 'Orange', valeur: '#F97316', icon: '🟠' },
  { nom: 'Vert', valeur: '#10B981', icon: '🟢' },
  { nom: 'Violet', valeur: '#8B5CF6', icon: '🟣' },
  { nom: 'Cyan', valeur: '#06B6D4', icon: '🔵' },
  { nom: 'Rose', valeur: '#EC4899', icon: '🌸' },
  { nom: 'Jaune', valeur: '#F59E0B', icon: '🟡' },
  { nom: 'Vert lime', valeur: '#84CC16', icon: '🟢' },
  { nom: 'Indigo', valeur: '#6366F1', icon: '🔵' }
]

const ICONS = [
  '💰', '💵', '💳', '🏦', '📊', '📈', '📉', '💹',
  '⚡', '🔧', '🛠️', '⚙️', '🔩', '🏢', '🏭', '🏗️',
  '🚗', '🚙', '🚛', '🚚', '⛽', '🛣️', '🚦',
  '🍽️', '🍔', '☕', '🥗', '🏨', '✈️', '🎫',
  '📱', '💻', '🖥️', '⌨️', '🖱️', '📞', '📠',
  '👥', '👤', '👔', '🎓', '📚', '✏️', '📋',
  '🛡️', '🔒', '🔐', '📦', '📮', '📪', '📬',
  '📊', '📈', '📉', '💹', '🎯', '⭐', '✅'
]

export default function ModifierCategoriePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorie, setCategorie] = useState<CategorieDepense | null>(null)
  
  const [formData, setFormData] = useState({
    nom: '',
    couleur: '#3B82F6',
    icon: '💰',
    type: 'variable' as 'fixe' | 'variable',
    ordre: 999,
    description: '',
    actif: true
  })

  useEffect(() => {
    if (params.id) {
      loadCategorie()
    }
  }, [params.id])

  async function loadCategorie() {
    try {
      setLoading(true)
      const data = await getCategorieById(params.id as string)
      
      if (!data) {
        alert('❌ Catégorie introuvable')
        router.push('/admin/finances/categories')
        return
      }
      
      setCategorie(data)
      setFormData({
        nom: data.nom,
        couleur: data.couleur,
        icon: data.icon,
        type: data.type,
        ordre: data.ordre,
        description: data.description || '',
        actif: data.actif
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/admin/finances/categories')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.nom.trim()) {
      alert('⚠️ Le nom est obligatoire')
      return
    }

    if (!categorie) return

    try {
      setSaving(true)
      await updateCategorie(categorie.id, formData)
      alert('✅ Catégorie modifiée avec succès')
      router.push('/admin/finances/categories')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!categorie) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Catégorie introuvable</p>
          <Link href="/admin/finances/categories" className="text-blue-600 mt-4 inline-block">
            ← Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier la Catégorie</h1>
          <p className="text-gray-600 mt-2">{categorie.nom}</p>
        </div>
        <Link
          href="/admin/finances/categories"
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la catégorie *
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Carburant, Repas, Assurances..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de dépense *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'variable' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'variable'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Variable</div>
              <div className="text-xs text-gray-600 mt-1">
                Montant varie chaque mois
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'fixe' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'fixe'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📌</div>
              <div className="font-medium">Fixe</div>
              <div className="text-xs text-gray-600 mt-1">
                Montant stable chaque mois
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icône
          </label>
          <div className="grid grid-cols-12 gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData({ ...formData, icon })}
                className={`p-2 text-2xl rounded hover:bg-gray-100 transition-colors ${
                  formData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Icône sélectionnée : <span className="text-2xl">{formData.icon}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Couleur
          </label>
          <div className="grid grid-cols-5 gap-3">
            {COULEURS.map((couleur) => (
              <button
                key={couleur.valeur}
                type="button"
                onClick={() => setFormData({ ...formData, couleur: couleur.valeur })}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  formData.couleur === couleur.valeur
                    ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: couleur.valeur + '30' }}
              >
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: couleur.valeur }}
                />
                <div className="text-xs text-center mt-2 font-medium">
                  {couleur.nom}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Description de la catégorie (optionnelle)"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="actif"
            checked={formData.actif}
            onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="actif" className="text-sm font-medium text-gray-700">
            Catégorie active (visible dans les formulaires)
          </label>
        </div>

        <div className="border-t pt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Prévisualisation</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: formData.couleur + '20' }}
              >
                {formData.icon}
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {formData.nom || 'Nom de la catégorie'}
                </div>
                <span className={`text-xs px-2 py-1 rounded inline-block mt-1 ${
                  formData.type === 'fixe'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {formData.type === 'fixe' ? '📌 Fixe' : '📊 Variable'}
                </span>
              </div>
            </div>
            {formData.description && (
              <p className="text-sm text-gray-600 mt-3">{formData.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Link
            href="/admin/finances/categories"
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
