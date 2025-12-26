'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  getAllInterventionsCalendar, 
  getAllClients,
  demanderChangementDate, 
  type InterventionCalendar,
  type Client,
  type Indisponibilite
} from '@/lib/firebase'

type TypeDemande = 'changement' | 'annulation'

export default function ModifierInterventionPage() {
  const router = useRouter()
  const params = useParams()
  const interventionId = params.id as string

  const [intervention, setIntervention] = useState<(InterventionCalendar & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [typeDemande, setTypeDemande] = useState<TypeDemande>('changement')
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([])
  const [showCreneauModal, setShowCreneauModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    raison: ''
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const groupeId = localStorage.getItem('groupe_id') || ''
    loadIntervention(groupeId)
  }, [router, interventionId])

  const loadIntervention = async (groupeId: string) => {
    try {
      setLoading(true)
      
      const [allInterventions, allClients] = await Promise.all([
        getAllInterventionsCalendar(),
        getAllClients()
      ])

      const groupeClients = allClients.filter(c => c.groupeId === groupeId)
      const clientIds = groupeClients.map(c => c.id)
      const groupeInterventions = allInterventions.filter(i => clientIds.includes(i.clientId))
      const inter = groupeInterventions.find(i => i.id === interventionId)

      if (!inter) {
        alert('❌ Intervention introuvable')
        router.push('/client/interventions')
        return
      }

      if (new Date(inter.dateDebut) < new Date()) {
        alert('⚠️ Cette intervention est passée')
        router.push('/client/interventions')
        return
      }

      if (inter.statut !== 'Planifiée') {
        alert('⚠️ Cette intervention ne peut plus être modifiée')
        router.push('/client/interventions')
        return
      }

      if (inter.demandeChangement) {
        alert('⚠️ Une demande est déjà en cours')
        router.push('/client/interventions')
        return
      }

      setIntervention(inter)
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/client/interventions')
    } finally {
      setLoading(false)
    }
  }

  const getAllDays = (): string[] => {
    if (!intervention) return []
    
    const days: string[] = []
    const start = new Date(intervention.dateDebut)
    const end = new Date(intervention.dateFin)
    
    const current = new Date(start)
    while (current <= end) {
      days.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getIndisponibilite = (date: string): Indisponibilite | undefined => {
    return indisponibilites.find(i => i.date === date)
  }

  const handleDayClick = (date: string) => {
    setSelectedDate(date)
    setShowCreneauModal(true)
  }

  const addIndisponibilite = (creneau: 'AM' | 'PM' | 'jour-entier') => {
    if (!selectedDate) return
    
    const filtered = indisponibilites.filter(i => i.date !== selectedDate)
    setIndisponibilites([...filtered, { date: selectedDate, creneau }])
    setShowCreneauModal(false)
    setSelectedDate(null)
  }

  const removeIndisponibilite = (date: string) => {
    setIndisponibilites(indisponibilites.filter(i => i.date !== date))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.raison.trim()) {
      alert('⚠️ Veuillez indiquer la raison de votre demande')
      return
    }

    if (typeDemande === 'changement' && indisponibilites.length === 0) {
      const confirmer = confirm('⚠️ Vous n\'avez indiqué aucune indisponibilité.\n\nContinuer quand même ?')
      if (!confirmer) return
    }

    try {
      setSubmitting(true)

      await demanderChangementDate(
        interventionId,
        intervention!.dateDebut,
        intervention!.dateFin,
        intervention!.heureDebut,
        intervention!.heureFin,
        formData.raison,
        indisponibilites,
        typeDemande
      )

      if (typeDemande === 'annulation') {
        alert('✅ Demande d\'annulation envoyée !\n\nNous traiterons votre demande dans les plus brefs délais.')
      } else {
        alert('✅ Demande de modification envoyée !\n\nNous traiterons votre demande dans les plus brefs délais.')
      }
      
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

  const allDays = getAllDays()
  const totalJours = allDays.length
  
  let colonnes = 7
  if (totalJours > 31) {
    colonnes = 10
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">
                  {typeDemande === 'annulation' ? '❌' : '🔄'}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {typeDemande === 'annulation' ? 'Demander l\'annulation' : 'Indiquer vos indisponibilités'}
                </h1>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📅 Plage d'intervention proposée</h2>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-bold text-gray-900 mb-1">Période :</div>
              <div className="text-base text-blue-900 font-bold">
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
                      month: 'long'
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
              <div className="text-sm font-bold text-gray-900 mb-1">Durée :</div>
              <div className="text-base text-blue-900 font-bold">
                {totalJours} jour{totalJours > 1 ? 's' : ''}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-gray-900 mb-1">Horaires quotidiens :</div>
              <div className="text-base text-blue-900 font-bold">
                {intervention.heureDebut} - {intervention.heureFin}
              </div>
            </div>
          </div>
        </div>

        {/* Choix type de demande */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🎯 Type de demande</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setTypeDemande('changement')
                setIndisponibilites([])
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                typeDemande === 'changement'
                  ? 'bg-blue-50 border-blue-500 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-4xl mb-3">🔄</div>
              <div className="text-lg font-bold text-gray-900 mb-2">Reporter l'intervention</div>
              <div className="text-sm text-gray-600">
                Indiquez vos indisponibilités pour qu'on trouve de nouvelles dates
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setTypeDemande('annulation')
                setIndisponibilites([])
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                typeDemande === 'annulation'
                  ? 'bg-red-50 border-red-500 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="text-4xl mb-3">❌</div>
              <div className="text-lg font-bold text-gray-900 mb-2">Annuler l'intervention</div>
              <div className="text-sm text-gray-600">
                Demander l'annulation complète de cette intervention
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
        {typeDemande === 'changement' && (
          <>
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Comment ça marche ?</h3>
              <ol className="text-sm text-yellow-900 font-medium space-y-1 list-decimal list-inside">
                <li>Cliquez sur les jours où vous N'ÊTES PAS disponible</li>
                <li>Choisissez si c'est le matin, l'après-midi ou toute la journée</li>
                <li>Nous planifierons l'intervention dans les créneaux disponibles</li>
              </ol>
            </div>
          </div>
        </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                📅 Marquez vos indisponibilités ({indisponibilites.length} jour{indisponibilites.length > 1 ? 's' : ''})
              </h2>
              {indisponibilites.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIndisponibilites([])}
                  className="text-sm text-red-600 hover:text-red-700 font-bold"
                >
                  ❌ Tout effacer
                </button>
              )}
            </div>

            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))` }}>
              {allDays.map((day) => {
                const date = new Date(day)
                const indispo = getIndisponibilite(day)
                const isToday = day === new Date().toISOString().split('T')[0]
                
                return (
                  <div key={day} className="relative flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`
                        h-14 w-14 rounded-lg border-2 flex flex-col items-center justify-center
                        transition-all font-bold
                        ${indispo 
                          ? 'bg-red-100 border-red-400 hover:bg-red-200' 
                          : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                        }
                        ${isToday ? 'ring-2 ring-blue-500' : ''}
                      `}
                    >
                      <div className="text-[9px] text-gray-600 font-medium">
                        {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {date.getDate()}
                      </div>
                      {date.getDate() === 1 && (
                        <div className="text-[9px] text-gray-600 font-medium">
                          {date.toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      )}
                    </button>
                    
                    {indispo && (
                      <div className="absolute -top-1 -right-1 flex gap-1">
                        {indispo.creneau === 'jour-entier' && (
                          <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                            Jour
                          </span>
                        )}
                        {indispo.creneau === 'AM' && (
                          <span className="bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                            AM
                          </span>
                        )}
                        {indispo.creneau === 'PM' && (
                          <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                            PM
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                <span className="text-gray-700 font-medium">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-400 rounded"></div>
                <span className="text-gray-700 font-medium">Non disponible</span>
              </div>
            </div>
          </div>

          {indisponibilites.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                📋 Récapitulatif de vos indisponibilités
              </h3>
              <div className="space-y-2">
                {indisponibilites
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((indispo) => (
                    <div
                      key={indispo.date}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">❌</span>
                        <div>
                          <div className="font-bold text-gray-900">
                            {new Date(indispo.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {indispo.creneau === 'jour-entier' && 'Toute la journée'}
                            {indispo.creneau === 'AM' && 'Matin uniquement'}
                            {indispo.creneau === 'PM' && 'Après-midi uniquement'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIndisponibilite(indispo.date)}
                        className="text-red-600 hover:text-red-700 font-bold text-sm"
                      >
                        🗑️ Retirer
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          </>
        )}

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <label className="block text-base font-bold text-gray-900 mb-3">
              💬 Raison de votre demande *
            </label>
            <textarea
              value={formData.raison}
              onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
              placeholder={
                typeDemande === 'annulation'
                  ? "Expliquez la raison de votre demande d'annulation..."
                  : "Expliquez pourquoi vous avez ces indisponibilités..."
              }
              required
            />
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="text-sm text-blue-900 font-medium">
              ℹ️ <strong>Information :</strong> Votre demande sera traitée par notre équipe dans les plus brefs délais.
              Nous planifierons l'intervention en tenant compte de vos disponibilités.
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 text-lg ${
                typeDemande === 'annulation'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
              }`}
            >
              {submitting 
                ? '⏳ Envoi...' 
                : typeDemande === 'annulation' 
                  ? '❌ Demander annulation' 
                  : '✅ Envoyer la demande'
              }
            </button>
            <a
              href="/client/interventions"
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
            >
              Annuler
            </a>
          </div>
        </form>
      </main>

      {showCreneauModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {new Date(selectedDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            <p className="text-sm text-gray-600 font-medium mb-6">
              Quand n'êtes-vous PAS disponible ?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => addIndisponibilite('AM')}
                className="w-full px-6 py-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-900 font-bold rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">☀️</span>
                  <div>
                    <div className="font-bold">Matin seulement</div>
                    <div className="text-sm font-medium">
                      {intervention.heureDebut} - 12:00
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => addIndisponibilite('PM')}
                className="w-full px-6 py-4 bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 text-purple-900 font-bold rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌅</span>
                  <div>
                    <div className="font-bold">Après-midi seulement</div>
                    <div className="text-sm font-medium">
                      13:00 - {intervention.heureFin}
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => addIndisponibilite('jour-entier')}
                className="w-full px-6 py-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 text-red-900 font-bold rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <div className="font-bold">Toute la journée</div>
                    <div className="text-sm font-medium">
                      {intervention.heureDebut} - {intervention.heureFin}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowCreneauModal(false)
                setSelectedDate(null)
              }}
              className="w-full mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}