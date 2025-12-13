'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllClients,
  getAllSitesComplet,
  getAllInterventionsCalendar,
  type Client,
  type SiteComplet,
  type InterventionCalendar
} from '@/lib/firebase'
import dynamic from 'next/dynamic'

// Importer MapView dynamiquement (côté client uniquement)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="text-blue-600 text-center py-12">
      ⏳ Chargement de la carte...
    </div>
  )
})

export default function ClientDashboard() {
  const router = useRouter()
  const [groupeName, setGroupeName] = useState('')
  const [groupeId, setGroupeId] = useState('')
  
  // Données du groupe
  const [clients, setClients] = useState<Client[]>([])
  const [sites, setSites] = useState<(SiteComplet & { id: string })[]>([])
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clients' | 'sites' | 'interventions' | 'carte'>('clients')
  const [selectedSite, setSelectedSite] = useState<(SiteComplet & { id: string }) | null>(null)

  useEffect(() => {
    // Vérifier si le groupe est connecté
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const name = localStorage.getItem('groupe_name') || ''
    const id = localStorage.getItem('groupe_id') || ''
    
    setGroupeName(name)
    setGroupeId(id)

    // Charger les données du groupe
    loadData(id)
  }, [router])

  const loadData = async (groupeId: string) => {
    try {
      setLoading(true)
      
      // Récupérer TOUS les clients, sites et interventions
      const [allClients, allSites, allInterventions] = await Promise.all([
        getAllClients(),
        getAllSitesComplet(),
        getAllInterventionsCalendar()
      ])

      // Filtrer par groupeId
      const groupeClients = allClients.filter(c => c.groupeId === groupeId)
      const clientIds = groupeClients.map(c => c.id)
      
      const groupeSites = allSites.filter(s => s.clientId && clientIds.includes(s.clientId))
      const groupeInterventions = allInterventions.filter(i => i.clientId && clientIds.includes(i.clientId))

      setClients(groupeClients)
      setSites(groupeSites)
      setInterventions(groupeInterventions)
    } catch (error) {
      console.error('Erreur chargement données groupe:', error)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl font-bold">⏳ Chargement de vos données...</div>
      </div>
    )
  }

  const sitesWithGPS = sites.filter(s => s.lat && s.lng)
  const interventionsFutures = interventions.filter(i => new Date(i.dateDebut) >= new Date())
  const interventionsPassees = interventions.filter(i => new Date(i.dateDebut) < new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Groupe {groupeName}</h1>
                <p className="text-sm text-blue-200">Dataroom centralisée</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/client/interventions"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 font-bold rounded-lg transition-all"
              >
                📅 Toutes les interventions
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

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-200">Clients</span>
              <span className="text-2xl">🏢</span>
            </div>
            <div className="text-3xl font-bold text-white">{clients.length}</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-200">Sites</span>
              <span className="text-2xl">📍</span>
            </div>
            <div className="text-3xl font-bold text-white">{sites.length}</div>
            <div className="text-xs text-blue-200 mt-1">{sitesWithGPS.length} géolocalisés</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-200">Interventions</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white">{interventions.length}</div>
            <div className="text-xs text-blue-200 mt-1">{interventionsFutures.length} à venir</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-200">Surface totale</span>
              <span className="text-2xl">📐</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {sites.reduce((acc, s) => acc + (s.surface || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-blue-200 mt-1">m²</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'clients'
                  ? 'bg-blue-600 text-white border-b-4 border-yellow-500'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              🏢 Clients ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'sites'
                  ? 'bg-blue-600 text-white border-b-4 border-yellow-500'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              📍 Sites ({sites.length})
            </button>
            <button
              onClick={() => setActiveTab('interventions')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'interventions'
                  ? 'bg-blue-600 text-white border-b-4 border-yellow-500'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              📅 Interventions ({interventions.length})
            </button>
            <button
              onClick={() => setActiveTab('carte')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'carte'
                  ? 'bg-blue-600 text-white border-b-4 border-yellow-500'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              🗺️ Carte ({sitesWithGPS.length})
            </button>
          </div>

          {/* Contenu Clients */}
          {activeTab === 'clients' && (
            <div className="p-6">
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun client</h3>
                  <p className="text-gray-700">Les clients de votre groupe apparaîtront ici.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => {
                    const clientSites = sites.filter(s => s.clientId === client.id)
                    const clientInterventions = interventions.filter(i => i.clientId === client.id)
                    
                    return (
                      <div 
                        key={client.id} 
                        className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{client.company}</h3>
                        <div className="space-y-2 text-sm text-gray-700 font-medium">
                          <div>📍 {clientSites.length} sites</div>
                          <div>📅 {clientInterventions.length} interventions</div>
                          <div>📐 {clientSites.reduce((acc, s) => acc + (s.surface || 0), 0).toLocaleString()} m²</div>
                          {client.email && <div className="text-xs">📧 {client.email}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Contenu Sites */}
          {activeTab === 'sites' && (
            <div className="p-6">
              {sites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun site</h3>
                  <p className="text-gray-700">Les sites de votre groupe apparaîtront ici.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sites.map((site) => {
                    const client = clients.find(c => c.id === site.clientId)
                    
                    return (
                      <div 
                        key={site.id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{site.nomSite}</h3>
                              <span className="px-2 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded">
                                {client?.company}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700 font-medium">
                              {site.ville && <div>🏙️ {site.codePostal} {site.ville}</div>}
                              {site.surface > 0 && <div>📐 {site.surface} m²</div>}
                              {site.lat && site.lng ? (
                                <div className="text-xs text-green-600 mt-2">
                                  ✅ GPS: {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                                </div>
                              ) : (
                                <div className="text-xs text-red-600 mt-2">
                                  ❌ Pas de GPS
                                </div>
                              )}
                            </div>
                          </div>
                          {site.lat && site.lng && (
                            <button 
                              onClick={() => setSelectedSite(site)}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold"
                            >
                              🗺️ Carte
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Contenu Interventions */}
          {activeTab === 'interventions' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <a
                  href="/client/interventions"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  📅 Voir toutes les interventions ({interventions.length})
                </a>
              </div>
              
              {interventions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune intervention</h3>
                  <p className="text-gray-700">Les interventions de votre groupe apparaîtront ici.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">📅 À venir</h4>
                    <div className="text-3xl font-bold text-blue-600">{interventionsFutures.length}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">✅ Passées</h4>
                    <div className="text-3xl font-bold text-green-600">{interventionsPassees.length}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contenu Carte */}
          {activeTab === 'carte' && (
            <div className="p-6">
              {sitesWithGPS.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun site géolocalisé</h3>
                  <p className="text-gray-700">Les sites avec GPS apparaîtront sur la carte.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-gray-900 font-bold">
                    📍 {sitesWithGPS.length} sites géolocalisés sur {sites.length}
                  </div>
                  <MapView sites={sitesWithGPS} height="600px" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Site individuel */}
        {selectedSite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 bg-blue-600 border-b border-blue-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{selectedSite.nomSite}</h3>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="text-white hover:text-yellow-300 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Informations</h4>
                    <div className="space-y-2 text-gray-700 font-medium">
                      {selectedSite.adresse1 && <div>📍 {selectedSite.adresse1}</div>}
                      {selectedSite.ville && <div>🏙️ {selectedSite.codePostal} {selectedSite.ville}</div>}
                      {selectedSite.surface > 0 && <div>📐 {selectedSite.surface} m²</div>}
                      {selectedSite.infosCompl && <div>ℹ️ {selectedSite.infosCompl}</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Coordonnées GPS</h4>
                    <div className="text-gray-700 font-mono text-sm font-medium">
                      <div>Latitude: {selectedSite.lat.toFixed(6)}</div>
                      <div>Longitude: {selectedSite.lng.toFixed(6)}</div>
                    </div>
                  </div>
                </div>

                <MapView 
                  sites={[selectedSite]} 
                  center={{ lat: selectedSite.lat, lng: selectedSite.lng }}
                  zoom={15}
                  height="400px"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
