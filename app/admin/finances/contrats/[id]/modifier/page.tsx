'use client'

/**
 * PAGE MODIFICATION CONTRAT RÉCURRENT - VERSION PROFESSIONNELLE
 * Formulaire de modification avec données pré-remplies
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getContratById,
  updateContrat
} from '@/lib/firebase/contrats-recurrents'
import type { ContratRecurrent } from '@/lib/types/contrats-recurrents'
import {
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default function ModifierContratPage({ params }: PageProps) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contrat, setContrat] = useState<ContratRecurrent | null>(null)
  
  // Données formulaire
  const [formData, setFormData] = useState<Partial<ContratRecurrent>>({})

  useEffect(() => {
    chargerContrat()
  }, [params.id])

  async function chargerContrat() {
    try {
      setLoading(true)
      const data = await getContratById(params.id)
      
      if (data) {
        setContrat(data)
        setFormData({
          nom: data.nom,
          description: data.description,
          reference: data.reference,
          dateFin: data.dateFin,
          noteInterne: data.noteInterne,
          conditionsPaiement: data.conditionsPaiement,
          renouvellement: data.renouvellement,
          options: data.options
        })
      }
    } catch (error) {
      console.error('Erreur chargement contrat:', error)
    } finally {
      setLoading(false)
    }
  }

  async function sauvegarder() {
    if (!contrat) return
    
    try {
      setSaving(true)
      
      await updateContrat(
        params.id,
        formData,
        'Jerome' // TODO: Auth user
      )
      
      alert('Contrat modifié avec succès !')
      router.push(`/admin/finances/contrats/${params.id}`)
      
    } catch (error) {
      console.error('Erreur modification contrat:', error)
      alert('Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!contrat) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Contrat non trouvé</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/finances/contrats/${params.id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au contrat
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Modifier le contrat
          </h1>
          <p className="text-gray-600 mt-2">
            {contrat.numero} - {contrat.nom}
          </p>
        </div>

        {/* Avertissement */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                Attention
              </h3>
              <p className="text-sm text-yellow-700">
                La modification de certains paramètres (fréquence, montants) peut impacter les factures futures.
                Les factures déjà générées ne seront pas modifiées.
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du contrat
            </label>
            <input
              type="text"
              value={formData.nom || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence externe
            </label>
            <input
              type="text"
              value={formData.reference || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={formData.dateFin?.toISOString().split('T')[0] || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                dateFin: e.target.value ? new Date(e.target.value) : undefined 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              Laissez vide pour un contrat sans date de fin
            </p>
          </div>

          {/* Conditions paiement */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Conditions de paiement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai de paiement (jours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.conditionsPaiement?.delaiJours || 30}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionsPaiement: {
                      ...prev.conditionsPaiement!,
                      delaiJours: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <select
                  value={formData.conditionsPaiement?.modePaiement || 'virement'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionsPaiement: {
                      ...prev.conditionsPaiement!,
                      modePaiement: e.target.value as any
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="virement">Virement</option>
                  <option value="prelevement">Prélèvement</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                </select>
              </div>
            </div>
          </div>

          {/* Renouvellement */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Renouvellement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de renouvellement
                </label>
                <select
                  value={formData.renouvellement?.type || 'manuel'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    renouvellement: {
                      ...prev.renouvellement!,
                      type: e.target.value as any
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="manuel">Manuel (nécessite validation)</option>
                  <option value="tacite">Tacite (renouvellement automatique)</option>
                  <option value="aucun">Aucun (fin définitive)</option>
                </select>
              </div>

              {formData.renouvellement?.type === 'tacite' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée du renouvellement (mois)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.renouvellement.dureeRenouvellement || 12}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        renouvellement: {
                          ...prev.renouvellement!,
                          dureeRenouvellement: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Préavis de résiliation (jours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.renouvellement.preavisResiliationJours || 60}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        renouvellement: {
                          ...prev.renouvellement!,
                          preavisResiliationJours: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Options de génération</h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.options?.validationManuelle || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    options: {
                      ...prev.options!,
                      validationManuelle: e.target.checked
                    }
                  }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Validation manuelle</div>
                  <div className="text-sm text-gray-600">
                    Les factures seront générées en brouillon
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.options?.envoyerEmailAuto || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    options: {
                      ...prev.options!,
                      envoyerEmailAuto: e.target.checked
                    }
                  }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Envoi email automatique</div>
                  <div className="text-sm text-gray-600">
                    Les factures seront envoyées automatiquement
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.options?.genererIntervention || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    options: {
                      ...prev.options!,
                      genererIntervention: e.target.checked
                    }
                  }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Générer intervention automatiquement</div>
                  <div className="text-sm text-gray-600">
                    Une intervention sera créée lors de chaque facturation
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Note interne */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note interne
            </label>
            <textarea
              value={formData.noteInterne || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, noteInterne: e.target.value }))}
              rows={3}
              placeholder="Notes visibles uniquement en interne..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Boutons action */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href={`/admin/finances/contrats/${params.id}`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>

          <button
            onClick={sauvegarder}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
