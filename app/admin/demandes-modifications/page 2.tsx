'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllInterventionsCalendar,
  accepterChangementDate,
  refuserChangementDate,
  type InterventionCalendar 
} from '@/lib/firebase'

export default function DemandesModificationsPage() {
  const router = useRouter()
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadDemandes()
  }, [router])

  const loadDemandes = async () => {
    try {
      setLoading(true)
      const data = await getAllInterventionsCalendar()
      // Filtrer uniquement les interventions avec demande de modification
      const demandes = data.filter(i => i.statut === 'Demande modification')
      setInterventions(demandes)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccepter = async (inter: InterventionCalendar & { id: string }) => {
    if (!confirm('Accepter cette demande de changement ?')) return

    if (!inter.demandeChangement) return

    try {
      setProcessing(inter.id!)
      await accepterChangementDate(
        inter.id!,
        inter.demandeChangement.nouvelleDateDebut,
        inter.demandeChangement.nouvelleDateFin,
        inter.demandeChangement.nouvelleHeureDebut,
        inter.demandeChangement.nouvelleHeureFin,
        inter.demandeChangement.indisponibilites // Passer les indisponibilités
      )
      alert('✅ Demande acceptée ! Les nouvelles dates et horaires ont été enregistrés.')
      loadDemandes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'acceptation')
    } finally {
      setProcessing(null)
    }
  }

  const handleRefuser = async (interventionId: string) => {
    if (!confirm('Refuser cette demande de changement ?\n\nL\'intervention restera aux dates et horaires initiaux.')) return

    try {
      setProcessing(interventionId)
      await refuserChangementDate(interventionId)
      alert('❌ Demande refusée. L\'intervention garde ses dates et horaires initiaux.')
      loadDemandes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du refus')
    } finally {
      setProcessing(null)
    }
  }

  const getEquipeCouleur = (equipeId: number) => {
    switch (equipeId) {
      case 1: return 'bg-red-100 text-red-900 border-red-300'
      case 2: return 'bg-blue-100 text-blue-900 border-blue-300'
      case 3: return 'bg-green-100 text-green-900 border-green-300'
      default: return 'bg-gray-100 text-gray-900 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">⏳ Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Demandes de Modification</h1>
                <p className="text-sm text-gray-900 font-medium">Traiter les demandes clients</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/calendrier"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                📅 Calendrier
              </a>
              <a
                href="/intranet/dashboard"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
              >
                ← Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-orange-500">{interventions.length}</div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                Demande{interventions.length > 1 ? 's' : ''} en attente
              </div>
              <div className="text-sm text-gray-700 font-medium">
                À traiter dès que possible
              </div>
            </div>
          </div>
        </div>

        {/* Liste demandes */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-orange-600 border-b border-orange-700">
            <h3 className="text-lg font-bold text-white">
              📢 Demandes ({interventions.length})
            </h3>
          </div>

          {interventions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-xl font-bold text-gray-900 mb-2">
                Aucune demande en attente
              </div>
              <div className="text-gray-700 font-medium mb-6">
                Toutes les demandes ont été traitées !
              </div>
              <a
                href="/admin/calendrier"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
              >
                📅 Voir le calendrier
              </a>
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {interventions.map((inter) => (
                <div key={inter.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Client + Site */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getEquipeCouleur(inter.equipeId)}`}>
                          {inter.equipeId === 1 ? '🔴' : inter.equipeId === 2 ? '🔵' : '🟢'} {inter.equipeName}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900">
                          🔄 Demande modification
                        </span>
                      </div>

                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {inter.clientName}
                      </h4>
                      <div className="text-lg text-gray-700 font-medium mb-4">
                        📍 {inter.siteName}
                      </div>

                      {/* Comparaison dates */}
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        {/* Dates/Horaires actuels */}
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                          <div className="text-xs font-bold text-blue-900 mb-2">📅 PÉRIODE ACTUELLE</div>
                          <div className="text-base font-bold text-gray-900 mb-1">
                            {inter.dateDebut === inter.dateFin ? (
                              // Une seule journée
                              <span>
                                {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            ) : (
                              // Plusieurs jours
                              <span>
                                Du {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short'
                                })} au {new Date(inter.dateFin).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-700">
                            🕐 {inter.heureDebut} - {inter.heureFin}
                          </div>
                        </div>

                        {/* Nouvelles dates/horaires demandées */}
                        {inter.demandeChangement && (
                          <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                            <div className="text-xs font-bold text-orange-900 mb-2">🔄 NOUVELLE PÉRIODE DEMANDÉE</div>
                            <div className="text-base font-bold text-gray-900 mb-1">
                              {inter.demandeChangement.nouvelleDateDebut === inter.demandeChangement.nouvelleDateFin ? (
                                // Une seule journée
                                <span>
                                  {new Date(inter.demandeChangement.nouvelleDateDebut).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              ) : (
                                // Plusieurs jours
                                <span>
                                  Du {new Date(inter.demandeChangement.nouvelleDateDebut).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                  })} au {new Date(inter.demandeChangement.nouvelleDateFin).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              🕐 {inter.demandeChangement.nouvelleHeureDebut} - {inter.demandeChangement.nouvelleHeureFin}
                            </div>
                            {inter.demandeChangement.indisponibilites && inter.demandeChangement.indisponibilites.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-orange-300">
                                <div className="text-xs font-bold text-orange-900 mb-2">❌ INDISPONIBILITÉS CLIENT :</div>
                                <div className="space-y-1">
                                  {inter.demandeChangement.indisponibilites.map((indispo, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                      <span className={`px-2 py-0.5 rounded font-bold ${
                                        indispo.creneau === 'jour-entier' 
                                          ? 'bg-red-600 text-white' 
                                          : indispo.creneau === 'AM' 
                                          ? 'bg-orange-600 text-white' 
                                          : 'bg-purple-600 text-white'
                                      }`}>
                                        {indispo.creneau === 'jour-entier' && 'Jour'}
                                        {indispo.creneau === 'AM' && 'AM'}
                                        {indispo.creneau === 'PM' && 'PM'}
                                      </span>
                                      <span className="text-gray-900 font-bold">
                                        {new Date(indispo.date).toLocaleDateString('fr-FR', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long'
                                        })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Raison */}
                      {inter.demandeChangement?.raison && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="text-sm font-bold text-gray-900 mb-2">
                            💬 Raison du client :
                          </div>
                          <div className="text-sm text-gray-700 font-medium">
                            {inter.demandeChangement.raison}
                          </div>
                        </div>
                      )}

                      {/* Infos complémentaires */}
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-700 font-medium">
                        <div>
                          <span className="font-bold">📏 Surface :</span> {inter.surface}m²
                        </div>
                        <div>
                          <span className="font-bold">🏷️ Type :</span> {inter.type}
                        </div>
                        <div>
                          <span className="font-bold">📅 Demandé le :</span>{' '}
                          {inter.demandeChangement && new Date(inter.demandeChangement.demandeLe).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boutons actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccepter(inter)}
                      disabled={processing === inter.id}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                    >
                      {processing === inter.id ? '⏳ Traitement...' : '✅ Accepter la nouvelle période'}
                    </button>
                    <button
                      onClick={() => handleRefuser(inter.id!)}
                      disabled={processing === inter.id}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                    >
                      {processing === inter.id ? '⏳ Traitement...' : '❌ Refuser (garder période actuelle)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}