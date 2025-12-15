'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllInterventionsCalendar,
  getAllClients,
  type InterventionCalendar,
  type Client
} from '@/lib/firebase'

export default function ClientInterventionsPage() {
  const router = useRouter()
  const [groupeId, setGroupeId] = useState('')
  const [groupeName, setGroupeName] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'futures' | 'passees'>('futures')
  const [selectedClient, setSelectedClient] = useState<string>('all')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const id = localStorage.getItem('groupe_id') || ''
    const name = localStorage.getItem('groupe_name') || ''
    
    console.log('Groupe ID:', id)
    console.log('Groupe Name:', name)
    
    setGroupeId(id)
    setGroupeName(name)
    
    loadInterventions(id)
  }, [router])

  const loadInterventions = async (groupeId: string) => {
    try {
      setLoading(true)
      
      // Récupérer TOUS les clients et interventions
      const [allClients, allInterventions] = await Promise.all([
        getAllClients(),
        getAllInterventionsCalendar()
      ])

      // Filtrer par groupeId
      const groupeClients = allClients.filter(c => c.groupeId === groupeId)
      const clientIds = groupeClients.map(c => c.id)
      
      const groupeInterventions = allInterventions.filter(i => i.clientId && clientIds.includes(i.clientId))

      console.log('Clients du groupe:', groupeClients.length)
      console.log('Interventions chargées:', groupeInterventions.length)
      
      setClients(groupeClients)
      setInterventions(groupeInterventions)
    } catch (error) {
      console.error('Erreur récupération interventions Groupe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_logged_in')
    localStorage.removeItem('groupe_id')
    localStorage.removeItem('groupe_name')
    localStorage.removeItem('groupe_email')
    router.push('/client/login')
  }

  const getStatutCouleur = (statut: InterventionCalendar['statut']) => {
    switch (statut) {
      case 'Planifiée': return 'bg-blue-100 text-blue-900 border-blue-300'
      case 'En cours': return 'bg-yellow-100 text-yellow-900 border-yellow-300'
      case 'Terminée': return 'bg-green-100 text-green-900 border-green-300'
      case 'Annulée': return 'bg-gray-100 text-gray-900 border-gray-300'
      case 'Demande modification': return 'bg-orange-100 text-orange-900 border-orange-300'
    }
  }

  const getEquipeCouleur = (equipeId: number) => {
    switch (equipeId) {
      case 1: return '🔴'
      case 2: return '🔵'
      case 3: return '🟢'
      default: return '⚪'
    }
  }

  // Filtrer interventions
  const now = new Date()
  let filteredInterventions = interventions.filter(inter => {
    const dateDebut = new Date(inter.dateDebut)
    if (filter === 'futures') return dateDebut >= now
    if (filter === 'passees') return dateDebut < now
    return true
  })

  // Filtrer par client
  if (selectedClient !== 'all') {
    filteredInterventions = filteredInterventions.filter(i => i.clientId === selectedClient)
  }

  // Trier par date
  filteredInterventions = filteredInterventions.sort((a, b) => 
    new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  )

  const stats = {
    total: interventions.length,
    futures: interventions.filter(i => new Date(i.dateDebut) >= now).length,
    passees: interventions.filter(i => new Date(i.dateDebut) < now).length,
    demandes: interventions.filter(i => i.statut === 'Demande modification').length
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
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Interventions - Groupe {groupeName}</h1>
                <p className="text-sm text-blue-200">{clients.length} clients - {interventions.length} interventions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/client/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ← Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-blue-200 font-medium">Total</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{stats.futures}</div>
            <div className="text-blue-200 font-medium">À venir</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-green-400 mb-2">{stats.passees}</div>
            <div className="text-blue-200 font-medium">Passées</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-orange-400 mb-2">{stats.demandes}</div>
            <div className="text-blue-200 font-medium">Demandes</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre période */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Période</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFilter('futures')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                    filter === 'futures'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 À venir ({stats.futures})
                </button>
                <button
                  onClick={() => setFilter('passees')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                    filter === 'passees'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✅ Passées ({stats.passees})
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📋 Toutes ({stats.total})
                </button>
              </div>
            </div>

            {/* Filtre client */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-bold"
              >
                <option value="all">Tous les clients ({clients.length})</option>
                {clients.map(client => {
                  const count = interventions.filter(i => i.clientId === client.id).length
                  return (
                    <option key={client.id} value={client.id}>
                      {client.company} ({count})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Liste interventions */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 border-b border-blue-700">
            <h3 className="text-lg font-bold text-white">
              Interventions ({filteredInterventions.length})
            </h3>
          </div>

          {filteredInterventions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-xl font-bold text-gray-900 mb-2">Aucune intervention</div>
              <div className="text-gray-600 font-medium">
                {filter === 'futures' ? 'Aucune intervention à venir' : 
                 filter === 'passees' ? 'Aucune intervention passée' : 
                 'Aucune intervention'}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredInterventions.map((inter) => {
                const client = clients.find(c => c.id === inter.clientId)
                
                return (
                  <div key={inter.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{getEquipeCouleur(inter.equipeId)}</span>
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-900">
                            {client?.company || 'Client inconnu'}
                          </span>
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-900">
                            {inter.equipeName}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatutCouleur(inter.statut)}`}>
                            {inter.statut}
                          </span>
                          {inter.type === 'Urgence' && (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-900">
                              🚨 Urgence
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {inter.siteName}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 font-medium">
                          {/* Plage de dates */}
                          <div className="col-span-2">
                            <span className="font-bold">📅 Période :</span>{' '}
                            {inter.dateDebut === inter.dateFin ? (
                              <span>
                                {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            ) : (
                              <span>
                                Du {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })} au {new Date(inter.dateFin).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>

                          {/* Horaires */}
                          <div>
                            <span className="font-bold">🕐 Horaires :</span> {inter.heureDebut} - {inter.heureFin}
                          </div>

                          <div>
                            <span className="font-bold">📏 Surface :</span> {inter.surface}m²
                          </div>
                        </div>

                        {inter.notes && (
                          <div className="mt-3 text-sm text-gray-700 font-medium">
                            <span className="font-bold">📝 Notes :</span> {inter.notes}
                          </div>
                        )}

                        {inter.demandeChangement && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-sm font-bold text-orange-900 mb-1">
                              🔄 Demande de changement en cours
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                              <span className="font-bold">Nouvelle période :</span>{' '}
                              Du {new Date(inter.demandeChangement.nouvelleDateDebut).toLocaleDateString('fr-FR')} 
                              {' '}au {new Date(inter.demandeChangement.nouvelleDateFin).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                              <span className="font-bold">Horaires :</span>{' '}
                              {inter.demandeChangement.nouvelleHeureDebut} - {inter.demandeChangement.nouvelleHeureFin}
                            </div>
                            {inter.demandeChangement.raison && (
                              <div className="text-sm text-gray-700 font-medium">
                                <span className="font-bold">Raison :</span> {inter.demandeChangement.raison}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bouton demander changement (uniquement futures + planifiées) */}
                      {new Date(inter.dateDebut) >= now && 
                       inter.statut === 'Planifiée' && 
                       !inter.demandeChangement && (
                        <a
                          href={`/client/interventions/${inter.id}/modifier`}
                          className="ml-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
                        >
                          🔄 Demander changement
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
