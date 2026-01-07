'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getConfigurationRelances,
  updateConfigurationRelances
} from '@/lib/firebase/relances'
import type { ConfigurationRelances } from '@/lib/firebase/relances-types'
import { 
  ArrowLeft, 
  Save, 
  Power,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function ConfigurationRelancesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ConfigurationRelances | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadConfiguration()
  }, [])

  async function loadConfiguration() {
    try {
      setLoading(true)
      const data = await getConfigurationRelances()
      setConfig(data)
    } catch (error) {
      console.error('Erreur chargement configuration:', error)
      setMessage({ type: 'error', text: 'Erreur chargement de la configuration' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!config) return

    try {
      setSaving(true)
      await updateConfigurationRelances(config, 'admin') // TODO: userId réel
      setMessage({ type: 'success', text: '✅ Configuration enregistrée avec succès' })
      
      // Recharger pour vérifier
      await loadConfiguration()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  function updateConfig(field: keyof ConfigurationRelances, value: any) {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  function toggleJourEnvoi(jour: number) {
    if (!config) return
    const joursEnvoi = config.joursEnvoi.includes(jour)
      ? config.joursEnvoi.filter(j => j !== jour)
      : [...config.joursEnvoi, jour].sort()
    
    updateConfig('joursEnvoi', joursEnvoi)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur : Configuration non trouvée</p>
        </div>
      </div>
    )
  }

  const joursLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/admin/finances/relances"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration des Relances</h1>
          <p className="text-gray-600 mt-2">
            Paramètres globaux du système de relances automatiques
          </p>
        </div>

        {/* Statut système */}
        <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
          config.systemActif 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <Power className="w-5 h-5" />
          <span className="font-semibold">
            {config.systemActif ? 'Système Actif' : 'Système Inactif'}
          </span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Activation système */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Power className="w-6 h-6 text-indigo-600" />
            Activation du Système
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Activer les relances automatiques</p>
              <p className="text-sm text-gray-600 mt-1">
                Active ou désactive complètement le système de relances
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateConfig('systemActif', !config.systemActif)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.systemActif ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.systemActif ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Délais */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Délais de Relance (jours après échéance)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rappel Amiable (recommandé : 15j)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={config.delaiRappelAmiable}
                onChange={(e) => updateConfig('delaiRappelAmiable', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Premier rappel courtois</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relance Ferme (recommandé : 30j)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={config.delaiRelanceFerme}
                onChange={(e) => updateConfig('delaiRelanceFerme', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Relance avec avertissement</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mise en Demeure (recommandé : 45j)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={config.delaiMiseEnDemeure}
                onChange={(e) => updateConfig('delaiMiseEnDemeure', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Mise en demeure officielle</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contentieux (recommandé : 60j)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={config.delaiContentieux}
                onChange={(e) => updateConfig('delaiContentieux', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Passage recouvrement</p>
            </div>
          </div>
        </div>

        {/* Montants seuils */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            Montants Seuils
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant Minimum Relance (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.montantMinimumRelance}
                onChange={(e) => updateConfig('montantMinimumRelance', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ne pas relancer si montant inférieur
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alerte Critique (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={config.montantAlerteCritique}
                onChange={(e) => updateConfig('montantAlerteCritique', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Alerte admin si impayé supérieur
              </p>
            </div>
          </div>
        </div>

        {/* Envoi automatique */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Envoi Automatique
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Rappels Amiables</p>
                <p className="text-sm text-gray-600">Envoi automatique sans validation</p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('envoyerRappelAmiableAuto', !config.envoyerRappelAmiableAuto)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.envoyerRappelAmiableAuto ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  config.envoyerRappelAmiableAuto ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Relances Fermes</p>
                <p className="text-sm text-gray-600">Envoi automatique sans validation</p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('envoyerRelanceFermeAuto', !config.envoyerRelanceFermeAuto)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.envoyerRelanceFermeAuto ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  config.envoyerRelanceFermeAuto ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="font-medium text-gray-900">Mises en Demeure</p>
                <p className="text-sm text-yellow-700">⚠️ Validation admin recommandée</p>
              </div>
              <button
                type="button"
                onClick={() => updateConfig('envoyerMiseEnDemeureAuto', !config.envoyerMiseEnDemeureAuto)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  config.envoyerMiseEnDemeureAuto ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  config.envoyerMiseEnDemeureAuto ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Jours et heure d'envoi */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Planification des Envois
          </h2>

          <div className="space-y-4">
            {/* Jours de la semaine */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Jours d'envoi
              </label>
              <div className="flex gap-2">
                {joursLabels.map((jour, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleJourEnvoi(index)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      config.joursEnvoi.includes(index)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {jour}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sélectionnez les jours où les relances peuvent être envoyées
              </p>
            </div>

            {/* Heure d'envoi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure d'envoi
              </label>
              <input
                type="time"
                value={config.heureEnvoi}
                onChange={(e) => updateConfig('heureEnvoi', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Heure quotidienne de génération et envoi des relances
              </p>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            Informations de Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Expéditeur
              </label>
              <input
                type="email"
                value={config.emailExpediteur}
                onChange={(e) => updateConfig('emailExpediteur', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="comptabilite@solaire-nettoyage.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email en Copie (optionnel)
              </label>
              <input
                type="email"
                value={config.emailCopie || ''}
                onChange={(e) => updateConfig('emailCopie', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="direction@solaire-nettoyage.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recevra une copie de toutes les relances envoyées
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone de Contact
              </label>
              <input
                type="tel"
                value={config.telephoneContact}
                onChange={(e) => updateConfig('telephoneContact', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Link
            href="/admin/finances/relances"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
