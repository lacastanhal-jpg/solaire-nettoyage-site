'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllInterventionsCalendar,
  getAllClients,
  accepterChangementDate,
  refuserChangementDate,
  type InterventionCalendar,
  type Client
} from '@/lib/firebase'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export default function DemandesModificationsPage() {
  const router = useRouter()
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  const [clients, setClients] = useState<Client[]>([])
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
      const [data, clientsData] = await Promise.all([
        getAllInterventionsCalendar(),
        getAllClients()
      ])
      
      const demandes = data.filter(i => i.statut === 'Demande modification')
      
      // Trier par date d'envoi (plus récentes en premier)
      const demandesSorted = demandes.sort((a, b) => {
        const dateA = a.demandeChangement?.dateEnvoi || 0
        const dateB = b.demandeChangement?.dateEnvoi || 0
        return dateB - dateA
      })
      
      setInterventions(demandesSorted)
      setClients(clientsData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.entreprise || 'Client inconnu'
  }

  const handleAccepter = async (inter: InterventionCalendar & { id: string }) => {
    if (!inter.demandeChangement) return

    const typeDemande = inter.demandeChangement.typeDemande || 'changement'

    if (typeDemande === 'annulation') {
      if (!confirm('Confirmer l\'annulation de cette intervention ?')) return

      try {
        setProcessing(inter.id!)
        const interventionRef = doc(db, 'interventions_calendar', inter.id!)
        await updateDoc(interventionRef, {
          statut: 'Annulée',
          dateAnnulation: new Date().toISOString(),
          demandeChangement: null
        })
        alert('✅ Intervention annulée avec succès')
        loadDemandes()
      } catch (error) {
        console.error('Erreur:', error)
        alert('❌ Erreur lors de l\'annulation')
      } finally {
        setProcessing(null)
      }
    } else {
      // Redirection vers la page de modification
      router.push(`/admin/interventions/${inter.id}/modifier?accepter-demande=true`)
    }
  }

  const handleRefuser = async (interventionId: string) => {
    if (!confirm('Refuser cette demande ?\n\nL\'intervention restera inchangée.')) return

    try {
      setProcessing(interventionId)
      await refuserChangementDate(interventionId)
      alert('❌ Demande refusée')
      loadDemandes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors du refus')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl font-bold">⏳ Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">📋 Demandes de modifications</h1>
            <a
              href="/admin/calendrier"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {interventions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune demande en attente</h2>
            <p className="text-gray-600">Toutes les demandes ont été traitées</p>
          </div>
        ) : (
          <div className="space-y-6">
            {interventions.map((inter) => {
              const demande = inter.demandeChangement
              if (!demande) return null

              const typeDemande = demande.typeDemande || 'changement'
              const isAnnulation = typeDemande === 'annulation'

              return (
                <div
                  key={inter.id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                    isAnnulation ? 'border-2 border-red-300' : ''
                  }`}
                >
                  {isAnnulation && (
                    <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                      <div className="flex items-center gap-2 text-red-900 font-bold">
                        <span className="text-xl">⚠️</span>
                        <span>DEMANDE D'ANNULATION</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{inter.siteName}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isAnnulation
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {isAnnulation ? '❌ Annulation' : '🔄 Changement'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {getClientName(inter.clientId)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {demande.dateEnvoi && 
                          new Date(demande.dateEnvoi).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        }
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-bold text-gray-900 mb-2">💬 Raison :</div>
                      <div className="text-sm text-gray-700">{demande.raison}</div>
                    </div>

                    {!isAnnulation && demande.indisponibilites && demande.indisponibilites.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="text-sm font-bold text-gray-900 mb-2">
                          📅 Indisponibilités du client ({demande.indisponibilites.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {demande.indisponibilites.map((indispo, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium"
                            >
                              {new Date(indispo.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                              {' - '}
                              {indispo.creneau === 'jour-entier' && 'Journée'}
                              {indispo.creneau === 'AM' && 'Matin'}
                              {indispo.creneau === 'PM' && 'AM'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccepter(inter)}
                        disabled={processing === inter.id}
                        className={`flex-1 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 ${
                          isAnnulation
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {processing === inter.id
                          ? '⏳ Traitement...'
                          : isAnnulation
                          ? '✅ Annuler l\'intervention'
                          : '✅ Modifier l\'intervention'}
                      </button>
                      <button
                        onClick={() => handleRefuser(inter.id!)}
                        disabled={processing === inter.id}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}