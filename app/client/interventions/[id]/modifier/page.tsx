'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getInterventionsByClientCalendar, demanderChangementDate, type InterventionCalendar } from '@/lib/firebase'

export default function ModifierInterventionPage() {
  const router = useRouter()
  const params = useParams()
  const interventionId = params.id as string

  const [intervention, setIntervention] = useState<(InterventionCalendar & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nouvelleDateDebut: '',
    nouvelleDateFin: '',
    nouvelleHeureDebut: '08:00',
    nouvelleHeureFin: '17:00',
    raison: ''
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const clientId = localStorage.getItem('client_id') || ''
    loadIntervention(clientId)
  }, [router, interventionId])

  const loadIntervention = async (clientId: string) => {
    try {
      setLoading(true)
      const interventions = await getInterventionsByClientCalendar(clientId)
      const inter = interventions.find(i => i.id === interventionId)

      if (!inter) {
        alert('❌ Intervention introuvable')
        router.push('/client/interventions')
        return
      }

      // Vérifier que l'intervention est future et planifiée
      if (new Date(inter.dateDebut) < new Date()) {
        alert('⚠️ Cette intervention est passée, vous ne pouvez plus la modifier')
        router.push('/client/interventions')
        return
      }

      if (inter.statut !== 'Planifiée') {
        alert('⚠️ Cette intervention ne peut plus être modifiée')
        router.push('/client/interventions')
        return
      }

      if (inter.demandeChangement) {
        alert('⚠️ Une demande de modification est déjà en cours pour cette intervention')
        router.push('/client/interventions')
        return
      }

      setIntervention(inter)

      // Pré-remplir avec les dates actuelles
      setFormData({
        nouvelleDateDebut: inter.dateDebut,
        nouvelleDateFin: inter.dateFin,
        nouvelleHeureDebut: inter.heureDebut,
        nouvelleHeureFin: inter.heureFin,
        raison: ''
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/client/interventions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nouvelleDateDebut || !formData.nouvelleDateFin) {
      alert('⚠️ Les dates de début et de fin sont obligatoires')
      return
    }

    // Vérifier que nouvelle dateFin >= nouvelle dateDebut
    if (new Date(formData.nouvelleDateFin) < new Date(formData.nouvelleDateDebut)) {
      alert('⚠️ La date de fin doit être après ou égale à la date de début')
      return
    }

    // Vérifier que nouvelle date est future
    if (new Date(formData.nouvelleDateDebut) < new Date()) {
      alert('⚠️ La nouvelle date doit être dans le futur')
      return
    }

    // Vérifier que nouvelle heureFin > nouvelle heureDebut
    if (formData.nouvelleHeureFin <= formData.nouvelleHeureDebut) {
      alert('⚠️ L\'heure de fin doit être après l\'heure de début')
      return
    }

    if (!formData.raison.trim()) {
      alert('⚠️ Veuillez indiquer la raison de votre demande')
      return
    }

    try {
      setSubmitting(true)

      await demanderChangementDate(
        interventionId,
        formData.nouvelleDateDebut,
        formData.nouvelleDateFin,
        formData.nouvelleHeureDebut,
        formData.nouvelleHeureFin,
        formData.raison
      )

      alert('✅ Demande de modification envoyée !\n\nNous traiterons votre demande dans les plus brefs délais.')
      router.push('/client/interventions')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'envoi de la demande')
    } finally {
      setSubmitting(false)
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
                <p className="text-sm text-blue-200">{intervention.siteName}</p>
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
        {/* Intervention actuelle */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Intervention actuelle</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-bold text-gray-900 mb-1">Période :</div>
              <div className="text-base text-gray-700">
                {intervention.dateDebut === intervention.dateFin ? (
                  <span>
                    {new Date(intervention.dateDebut).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                ) : (
                  <span>
                    Du {new Date(intervention.dateDebut).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })} au {new Date(intervention.dateFin).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-900 mb-1">Horaires quotidiens :</div>
              <div className="text-base text-gray-700">
                {intervention.heureDebut} - {intervention.heureFin}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire nouvelle période */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">🔄 Nouvelle période souhaitée</h2>

          <div className="space-y-6">
            {/* Nouvelles dates */}
            <div className="border-2 border-blue-300 rounded-xl p-6 bg-blue-50">
              <h3 className="text-base font-bold text-gray-900 mb-4">📅 Nouvelles dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Date début *
                  </label>
                  <input
                    type="date"
                    value={formData.nouvelleDateDebut}
                    onChange={(e) => setFormData({ ...formData, nouvelleDateDebut: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    value={formData.nouvelleDateFin}
                    onChange={(e) => setFormData({ ...formData, nouvelleDateFin: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Nouveaux horaires */}
            <div className="border-2 border-orange-300 rounded-xl p-6 bg-orange-50">
              <h3 className="text-base font-bold text-gray-900 mb-4">🕐 Nouveaux horaires</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Heure début *
                  </label>
                  <input
                    type="time"
                    value={formData.nouvelleHeureDebut}
                    onChange={(e) => setFormData({ ...formData, nouvelleHeureDebut: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-orange-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Heure fin *
                  </label>
                  <input
                    type="time"
                    value={formData.nouvelleHeureFin}
                    onChange={(e) => setFormData({ ...formData, nouvelleHeureFin: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-orange-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium mt-3">
                💡 Ces horaires s'appliqueront chaque jour
              </p>
            </div>

            {/* Raison */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Raison de votre demande *
              </label>
              <textarea
                value={formData.raison}
                onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                placeholder="Expliquez pourquoi vous souhaitez modifier les dates et horaires de cette intervention..."
                required
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-900 font-medium">
                ℹ️ <strong>Information :</strong> Votre demande sera traitée par notre équipe dans les plus brefs délais.
                Vous serez informé de la décision par email.
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {submitting ? '⏳ Envoi...' : '✅ Envoyer la demande'}
              </button>
              <a
                href="/client/interventions"
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Annuler
              </a>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
