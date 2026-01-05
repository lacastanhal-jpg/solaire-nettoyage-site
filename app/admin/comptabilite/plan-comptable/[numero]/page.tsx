'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  addCompte,
  updateCompte,
  getCompteByNumero,
  type CompteComptable
} from '@/lib/firebase/plan-comptable'
import { ArrowLeft, Save } from 'lucide-react'

export default function CompteFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEdit = !!params?.numero
  
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [compte, setCompte] = useState<CompteComptable | null>(null)
  
  const [formData, setFormData] = useState({
    numero: '',
    intitule: '',
    type: 'charge' as 'charge' | 'produit' | 'bilan',
    classe: '6',
    sousClasse: '',
    actif: true,
    tvaDeductible: false,
    tvaCollectee: false,
    description: ''
  })

  const societeId = 'solaire-nettoyage'

  useEffect(() => {
    if (isEdit) {
      loadCompte()
    }
  }, [isEdit])

  async function loadCompte() {
    try {
      setLoading(true)
      const data = await getCompteByNumero(societeId, params.numero as string)
      
      if (!data) {
        alert('❌ Compte introuvable')
        router.push('/admin/comptabilite/plan-comptable')
        return
      }
      
      setCompte(data)
      setFormData({
        numero: data.numero,
        intitule: data.intitule,
        type: data.type,
        classe: data.classe,
        sousClasse: data.sousClasse || '',
        actif: data.actif,
        tvaDeductible: data.tvaDeductible || false,
        tvaCollectee: data.tvaCollectee || false,
        description: data.description || ''
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur chargement compte')
      router.push('/admin/comptabilite/plan-comptable')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.numero.trim()) {
      alert('⚠️ Le numéro de compte est obligatoire')
      return
    }

    if (!formData.intitule.trim()) {
      alert('⚠️ L\'intitulé est obligatoire')
      return
    }

    try {
      setSaving(true)
      
      if (isEdit) {
        await updateCompte(societeId, params.numero as string, {
          intitule: formData.intitule,
          type: formData.type,
          classe: formData.classe,
          sousClasse: formData.sousClasse || undefined,
          actif: formData.actif,
          tvaDeductible: formData.tvaDeductible,
          tvaCollectee: formData.tvaCollectee,
          description: formData.description || undefined
        })
        alert('✅ Compte modifié avec succès')
      } else {
        // Nettoyer les champs vides
        const compteData: any = {
          numero: formData.numero,
          intitule: formData.intitule,
          type: formData.type,
          classe: formData.classe,
          actif: formData.actif,
          tvaDeductible: formData.tvaDeductible,
          tvaCollectee: formData.tvaCollectee
        }
        
        if (formData.sousClasse) compteData.sousClasse = formData.sousClasse
        if (formData.description) compteData.description = formData.description
        
        await addCompte(societeId, compteData)
        alert('✅ Compte créé avec succès')
      }
      
      router.push('/admin/comptabilite/plan-comptable')
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ ' + error.message)
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Modifier le Compte' : 'Nouveau Compte'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEdit ? `Compte ${compte?.numero}` : 'Ajouter un compte au plan comptable'}
          </p>
        </div>
        <Link
          href="/admin/comptabilite/plan-comptable"
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Numéro de compte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de compte *
          </label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            placeholder="Ex: 6061, 706000, 411..."
            required
            disabled={isEdit}
          />
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">
              Le numéro ne peut pas être modifié
            </p>
          )}
        </div>

        {/* Intitulé */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intitulé *
          </label>
          <input
            type="text"
            value={formData.intitule}
            onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Fournitures non stockables (eau, énergie)"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de compte *
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'charge', tvaDeductible: true, tvaCollectee: false })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'charge'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📉</div>
              <div className="font-medium">Charge</div>
              <div className="text-xs text-gray-600 mt-1">
                Classe 6
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'produit', tvaDeductible: false, tvaCollectee: true })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'produit'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">Produit</div>
              <div className="text-xs text-gray-600 mt-1">
                Classe 7
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'bilan', tvaDeductible: false, tvaCollectee: false })}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === 'bilan'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Bilan</div>
              <div className="text-xs text-gray-600 mt-1">
                Classes 1-5
              </div>
            </button>
          </div>
        </div>

        {/* Classe et sous-classe */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe *
            </label>
            <select
              value={formData.classe}
              onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="1">Classe 1 - Capitaux</option>
              <option value="2">Classe 2 - Immobilisations</option>
              <option value="3">Classe 3 - Stocks</option>
              <option value="4">Classe 4 - Tiers</option>
              <option value="5">Classe 5 - Financier</option>
              <option value="6">Classe 6 - Charges</option>
              <option value="7">Classe 7 - Produits</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous-classe (optionnel)
            </label>
            <input
              type="text"
              value={formData.sousClasse}
              onChange={(e) => setFormData({ ...formData, sousClasse: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="Ex: 60, 61, 70..."
            />
          </div>
        </div>

        {/* TVA */}
        <div className="border-t pt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Options TVA</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tvaDeductible"
                checked={formData.tvaDeductible}
                onChange={(e) => setFormData({ ...formData, tvaDeductible: e.target.checked })}
                className="w-5 h-5 text-blue-600"
                disabled={formData.type === 'produit'}
              />
              <label htmlFor="tvaDeductible" className="text-sm text-gray-700">
                TVA déductible (pour les charges)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="tvaCollectee"
                checked={formData.tvaCollectee}
                onChange={(e) => setFormData({ ...formData, tvaCollectee: e.target.checked })}
                className="w-5 h-5 text-blue-600"
                disabled={formData.type === 'charge'}
              />
              <label htmlFor="tvaCollectee" className="text-sm text-gray-700">
                TVA collectée (pour les produits)
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnelle)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Description ou remarques..."
          />
        </div>

        {/* Actif */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="actif"
            checked={formData.actif}
            onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
            className="w-5 h-5 text-blue-600"
          />
          <label htmlFor="actif" className="text-sm font-medium text-gray-700">
            Compte actif (visible dans les sélecteurs)
          </label>
        </div>

        {/* Prévisualisation */}
        <div className="border-t pt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Prévisualisation</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className={`px-3 py-1 rounded text-sm font-mono font-bold ${
                formData.type === 'charge' 
                  ? 'bg-red-100 text-red-700'
                  : formData.type === 'produit'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {formData.numero || 'XXXX'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {formData.intitule || 'Intitulé du compte'}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    formData.type === 'charge' 
                      ? 'bg-red-100 text-red-700'
                      : formData.type === 'produit'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {formData.type === 'charge' ? 'Charge' : formData.type === 'produit' ? 'Produit' : 'Bilan'}
                  </span>
                  {formData.tvaDeductible && (
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                      TVA Déductible
                    </span>
                  )}
                  {formData.tvaCollectee && (
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                      TVA Collectée
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    formData.actif
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {formData.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {formData.description && (
                  <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/admin/comptabilite/plan-comptable"
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
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer le compte'}
          </button>
        </div>
      </form>
    </div>
  )
}
