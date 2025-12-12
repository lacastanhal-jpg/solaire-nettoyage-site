'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  getInterventionsByClientCalendar,
  demanderChangementDate,
  type InterventionCalendar 
} from '@/lib/firebase'

export default function ModifierInterventionPage() {
  const router = useRouter()
  const params = useParams()
  const interventionId = params.id as string

  const [clientId, setClientId] = useState('')
  const [intervention, setIntervention] = useState<(InterventionCalendar & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const [formData, setFormData] = useState({
    nouvelleDate: '',
    raison: ''
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const id = localStorage.getItem('client_id') || ''
    setClientId(id)
    loadIntervention(id)
  }, [router, interventionId])

  const loadIntervention = async (clientId: string) => {
    try {
      setLoading(true)
      const interventions = await getInterventionsByClientCalendar(clientId)
      const inter = interventions.find(i => i.id === interventionId)
      
      if (!inter) {
        alert('❌ Intervention non trouvée')
        router.push('/client/interventions')
        return
      }

      setIntervention(inter)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur chargement intervention')
      router.push('/client/interventions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nouvelleDate) {
      alert('⚠️ Veuillez sélectionner une nouvelle date')
      return
    }

    if (!formData.raison.trim()) {
      alert('⚠️ Veuillez indiquer la raison du changement')
      return
    }

    if (!confirm('Envoyer la demande de changement de date ?')) {
      return
    }

    try {
      setSending(true)

      await demanderChangementDate(
        interventionId,
        `${formData.nouvelleDate}T09:00:00`,
        formData.raison
      )

      alert('✅ Demande de changement envoyée !\n\nNotre équipe vous répondra dans les plus brefs délais.')
      router.push('/client/interventions')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'envoi de la demande')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl font-bold">⏳ Chargement...</div>
      </div>
    )
  }

  if (!intervention) {
    return null
  }

  // Vérifications
  const now = new Date()
  const dateInter = new Date(intervention.date)
  const isPast = dateInter < now
  const hasDemandeEnCours = !!intervention.demandeChangement
  const isNotPlanifiee = intervention.statut !== 'Planifiée'

  // Bloquer si intervention passée
  if (isPast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Intervention passée
          </h2>
          <p className="text-gray-700 mb-8">
            Cette intervention a déjà eu lieu. Vous ne pouvez plus demander de changement.
          </p>
          <a
            href="/client/interventions"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            ← Retour aux interventions
          </a>
        </div>
      </div>
    )
  }

  // Bloquer si demande déjà en cours
  if (hasDemandeEnCours) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-12 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Demande en cours de traitement
          </h2>
          <p className="text-gray-700 mb-4">
            Vous avez déjà une demande de changement en cours pour cette intervention.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="text-sm font-bold text-orange-900 mb-2">
              Nouvelle date souhaitée:
            </div>
            <div className="text-lg font-bold text-gray-900">
              {new Date(intervention.demandeChangement!.nouvelleDateSouhaitee).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            {intervention.demandeChangement!.raison && (
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-bold">Raison:</span> {intervention.demandeChangement!.raison}
              </div>
            )}
          </div>
          <a
            href="/client/interventions"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            ← Retour aux interventions
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Demander un changement</h1>
                <p className="text-sm text-blue-200">Modification de date d'intervention</p>
              </div>
            </div>
            <a
              href="/client/interventions"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Infos intervention actuelle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Intervention actuelle</h3>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-xl font-bold text-gray-900 mb-3">
              {intervention.siteName}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold text-gray-700">📅 Date prévue:</span>
                <div className="text-lg font-bold text-blue-900">
                  {new Date(intervention.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-700">🕐 Heure:</span>
                <div className="text-lg font-bold text-blue-900">
                  {new Date(intervention.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-700">⏱️ Durée:</span>
                <div className="text-gray-900">{intervention.duree}h</div>
              </div>
              <div>
                <span className="font-bold text-gray-700">📐 Surface:</span>
                <div className="text-gray-900">{intervention.surface}m²</div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire demande changement */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">🔄 Nouvelle date souhaitée</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nouvelle date */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Date souhaitée *
              </label>
              <input
                type="date"
                value={formData.nouvelleDate}
                onChange={(e) => setFormData({...formData, nouvelleDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900 font-medium"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                ℹ️ La nouvelle date doit être dans le futur
              </p>
            </div>

            {/* Raison */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Raison du changement *
              </label>
              <textarea
                value={formData.raison}
                onChange={(e) => setFormData({...formData, raison: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900 font-medium"
                placeholder="Expliquez pourquoi vous souhaitez changer la date..."
                required
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>ℹ️ À savoir :</strong> Votre demande sera étudiée par notre équipe. 
                Nous vous confirmerons la nouvelle date dans les meilleurs délais. 
                En attendant, l'intervention reste planifiée à la date initiale.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {sending ? '⏳ Envoi en cours...' : '✅ Envoyer la demande'}
              </button>
              <a
                href="/client/interventions"
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Annuler
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
