'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllInterventionsCalendar,
  getAllEquipes,
  deleteInterventionCalendar,
  type InterventionCalendar,
  type Equipe
} from '@/lib/firebase'

export default function CalendrierPage() {
  const router = useRouter()
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEquipe, setSelectedEquipe] = useState<string>('all')
  const [selectedStatut, setSelectedStatut] = useState<string>('all')

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [interventionsData, equipesData] = await Promise.all([
        getAllInterventionsCalendar(),
        getAllEquipes()
      ])
      setInterventions(interventionsData)
      setEquipes(equipesData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette intervention ?')) return

    try {
      await deleteInterventionCalendar(id)
      alert('✅ Intervention supprimée')
      loadData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur suppression')
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

  const getStatutCouleur = (statut: InterventionCalendar['statut']) => {
    switch (statut) {
      case 'Planifiée': return 'bg-blue-100 text-blue-900'
      case 'En cours': return 'bg-yellow-100 text-yellow-900'
      case 'Terminée': return 'bg-green-100 text-green-900'
      case 'Annulée': return 'bg-gray-100 text-gray-900'
      case 'Demande modification': return 'bg-orange-100 text-orange-900'
    }
  }

  // Filtrer interventions
  const filteredInterventions = interventions.filter(inter => {
    if (selectedEquipe !== 'all' && inter.equipeId !== parseInt(selectedEquipe)) {
      return false
    }
    if (selectedStatut !== 'all' && inter.statut !== selectedStatut) {
      return false
    }
    return true
  })

  // Trier par date
  const sortedInterventions = [...filteredInterventions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Stats
  const stats = {
    total: interventions.length,
    planifiees: interventions.filter(i => i.statut === 'Planifiée').length,
    enCours: interventions.filter(i => i.statut === 'En cours').length,
    terminees: interventions.filter(i => i.statut === 'Terminée').length,
    demandes: interventions.filter(i => i.statut === 'Demande modification').length
  }

  // Vérifier si équipes existent
  if (!loading && equipes.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-12 max-w-2xl text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Équipes non configurées
          </h2>
          <p className="text-gray-900 font-medium mb-8">
            Tu dois d'abord initialiser les 3 équipes avant de créer des interventions
          </p>
          <a
            href="/admin/init-equipes"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg text-lg transition-all"
          >
            → Initialiser les Équipes
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendrier Interventions</h1>
                <p className="text-sm text-gray-900 font-medium">Planning des interventions terrain</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/nouvelle-intervention"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                ➕ Nouvelle Intervention
              </a>
              <a
                href="/admin/gestion-operateurs"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
              >
                👥 Opérateurs
              </a>
              <a
                href="/admin/gestion-equipes"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                👥 Équipes
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-purple-500 mb-2">{stats.total}</div>
            <div className="text-gray-900 font-bold">Total</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">{stats.planifiees}</div>
            <div className="text-gray-900 font-bold">Planifiées</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-yellow-500 mb-2">{stats.enCours}</div>
            <div className="text-gray-900 font-bold">En cours</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">{stats.terminees}</div>
            <div className="text-gray-900 font-bold">Terminées</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-orange-500 mb-2">{stats.demandes}</div>
            <div className="text-gray-900 font-bold text-xs">Demandes changement</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Filtrer par équipe</label>
              <select
                value={selectedEquipe}
                onChange={(e) => setSelectedEquipe(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 font-bold"
              >
                <option value="all">Toutes les équipes ({interventions.length})</option>
                <option value="1">🔴 Équipe 1 ({interventions.filter(i => i.equipeId === 1).length})</option>
                <option value="2">🔵 Équipe 2 ({interventions.filter(i => i.equipeId === 2).length})</option>
                <option value="3">🟢 Équipe 3 ({interventions.filter(i => i.equipeId === 3).length})</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">Filtrer par statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 font-bold"
              >
                <option value="all">Tous les statuts ({interventions.length})</option>
                <option value="Planifiée">Planifiée ({stats.planifiees})</option>
                <option value="En cours">En cours ({stats.enCours})</option>
                <option value="Terminée">Terminée ({stats.terminees})</option>
                <option value="Demande modification">Demande modification ({stats.demandes})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste interventions */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-purple-600 border-b border-purple-700">
            <h3 className="text-lg font-bold text-white">
              📋 Interventions ({sortedInterventions.length})
            </h3>
          </div>

          {sortedInterventions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-xl font-bold mb-2 text-gray-900">Aucune intervention</div>
              <div className="mb-6 text-gray-900 font-medium">
                {selectedEquipe !== 'all' || selectedStatut !== 'all' 
                  ? 'Aucune intervention ne correspond aux filtres'
                  : 'Commence par créer ta première intervention'
                }
              </div>
              {interventions.length === 0 && (
                <a
                  href="/admin/nouvelle-intervention"
                  className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
                >
                  ➕ Nouvelle Intervention
                </a>
              )}
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {sortedInterventions.map((inter) => (
                <div key={inter.id} className="p-6 hover:bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getEquipeCouleur(inter.equipeId)}`}>
                          {inter.equipeId === 1 ? '🔴' : inter.equipeId === 2 ? '🔵' : '🟢'} Équipe {inter.equipeId}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutCouleur(inter.statut)}`}>
                          {inter.statut}
                        </span>
                        {inter.type === 'Urgence' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900">
                            🚨 Urgence
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {inter.clientName} - {inter.siteName}
                      </h4>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-900 font-medium">
                        <div>
                          <span className="font-bold">📅 Date:</span> {new Date(inter.date).toLocaleDateString('fr-FR')} à {new Date(inter.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <span className="font-bold">⏱️ Durée:</span> {inter.duree}h
                        </div>
                        <div>
                          <span className="font-bold">📐 Surface:</span> {inter.surface}m²
                        </div>
                        <div>
                          <span className="font-bold">🏷️ Type:</span> {inter.type}
                        </div>
                      </div>

                      {inter.notes && (
                        <div className="mt-3 text-sm text-gray-900 font-medium">
                          <span className="font-bold">📝 Notes:</span> {inter.notes}
                        </div>
                      )}

                      {inter.demandeChangement && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-sm font-bold text-orange-900 mb-1">
                            🔄 Demande de changement de date
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            <span className="font-bold">Nouvelle date souhaitée:</span> {new Date(inter.demandeChangement.nouvelleDateSouhaitee).toLocaleDateString('fr-FR')}
                          </div>
                          {inter.demandeChangement.raison && (
                            <div className="text-sm text-gray-900 font-medium">
                              <span className="font-bold">Raison:</span> {inter.demandeChangement.raison}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => alert('Édition à venir')}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-sm font-medium"
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(inter.id)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded text-sm font-medium"
                      >
                        🗑️
                      </button>
                    </div>
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
