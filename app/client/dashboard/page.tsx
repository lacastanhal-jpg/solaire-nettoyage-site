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
  const [showOnlySitesWithInter, setShowOnlySitesWithInter] = useState(false)
  const [showOnlyMapSitesWithInter, setShowOnlyMapSitesWithInter] = useState(false)

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

  // Stats interventions par statut
  const statsInterventions = {
    total: interventions.length,
    planifiees: interventions.filter(i => i.statut === 'Planifiée').length,
    enCours: interventions.filter(i => i.statut === 'En cours').length,
    terminees: interventions.filter(i => i.statut === 'Terminée').length,
    termineesSansRapport: interventions.filter(i => i.statut === 'Terminée' && !i.rapport).length,
    termineesAvecRapport: interventions.filter(i => i.statut === 'Terminée' && i.rapport).length,
    annulees: interventions.filter(i => i.statut === 'Annulée').length,
    demandes: interventions.filter(i => i.statut === 'Demande modification').length
  }

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
        {/* Stats rapides - Informations générales */}
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

        {/* Stats Interventions - CARTES CLIQUABLES PAR STATUT */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📊 Vos interventions par statut</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Toutes */}
            <a
              href="/client/interventions"
              className="block bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20 hover:border-white transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-200 group-hover:text-white">Toutes</span>
                <span className="text-xl">📋</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{statsInterventions.total}</div>
              <div className="text-xs text-blue-300">Voir toutes →</div>
            </a>

            {/* Planifiées */}
            <a
              href="/client/interventions?statut=Planifiée"
              className="block bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-400/50 hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-200 group-hover:text-white">Planifiées</span>
                <span className="text-xl">📅</span>
              </div>
              <div className="text-3xl font-bold text-blue-200 mb-1">{statsInterventions.planifiees}</div>
              <div className="text-xs text-blue-300">Voir détails →</div>
            </a>

            {/* En cours */}
            <a
              href="/client/interventions?statut=En%20cours"
              className="block bg-yellow-500/20 hover:bg-yellow-500/30 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-400/50 hover:border-yellow-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-200 group-hover:text-white">En cours</span>
                <span className="text-xl">🔄</span>
              </div>
              <div className="text-3xl font-bold text-yellow-200 mb-1">{statsInterventions.enCours}</div>
              <div className="text-xs text-yellow-300">Voir détails →</div>
            </a>

            {/* Terminées */}
            <a
              href="/client/interventions?statut=Terminée"
              className="block bg-green-500/20 hover:bg-green-500/30 backdrop-blur-sm rounded-xl p-4 border-2 border-green-400/50 hover:border-green-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-200 group-hover:text-white">Terminées</span>
                <span className="text-xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-green-200 mb-1">{statsInterventions.terminees}</div>
              <div className="text-xs text-green-300">
                {statsInterventions.termineesAvecRapport} avec rapport
              </div>
            </a>

            {/* Annulées */}
            <a
              href="/client/interventions?statut=Annulée"
              className="block bg-gray-500/20 hover:bg-gray-500/30 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-400/50 hover:border-gray-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-200 group-hover:text-white">Annulées</span>
                <span className="text-xl">❌</span>
              </div>
              <div className="text-3xl font-bold text-gray-200 mb-1">{statsInterventions.annulees}</div>
              <div className="text-xs text-gray-300">Voir détails →</div>
            </a>

            {/* Demandes */}
            <a
              href="/client/interventions?statut=Demande%20modification"
              className="block bg-orange-500/20 hover:bg-orange-500/30 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-400/50 hover:border-orange-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-200 group-hover:text-white">Demandes</span>
                <span className="text-xl">🔔</span>
              </div>
              <div className="text-3xl font-bold text-orange-200 mb-1">{statsInterventions.demandes}</div>
              <div className="text-xs text-orange-300">Voir détails →</div>
            </a>
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
              {/* Toggle Tous / Avec interventions */}
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setShowOnlySitesWithInter(false)}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                    !showOnlySitesWithInter
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📋 Tous les sites ({sites.length})
                </button>
                <button
                  onClick={() => setShowOnlySitesWithInter(true)}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                    showOnlySitesWithInter
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Sites avec interventions ({sites.filter(s => interventions.some(i => i.siteId === s.id)).length})
                </button>
              </div>

              {sites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun site</h3>
                  <p className="text-gray-700">Les sites de votre groupe apparaîtront ici.</p>
                </div>
              ) : (
                (() => {
                  const filteredSites = sites.filter(site => {
                    if (!showOnlySitesWithInter) return true
                    return interventions.some(i => i.siteId === site.id)
                  })

                  if (filteredSites.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📍</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun site avec interventions</h3>
                        <p className="text-gray-700">Aucun de vos sites n'a d'interventions planifiées.</p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      {filteredSites.map((site) => {
                        const client = clients.find(c => c.id === site.clientId)
                        const siteInterventions = interventions.filter(i => i.siteId === site.id)
                        
                        return (
                          <div 
                            key={site.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{site.nomSite}</h3>
                                <p className="text-sm text-gray-600 font-medium mb-3">
                                  🏢 {client?.company || 'Client inconnu'}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 font-medium">
                                  <div>📐 Surface : {site.surface?.toLocaleString() || 'N/A'} m²</div>
                                  <div>📅 {siteInterventions.length} interventions</div>
                                  {site.lat && site.lng && (
                                    <div className="col-span-2 text-green-600">
                                      ✓ Géolocalisé ({site.lat.toFixed(4)}, {site.lng.toFixed(4)})
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()
              )}
            </div>
          )}

          {/* Contenu Interventions */}
          {activeTab === 'interventions' && (
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {interventions.length} interventions au total
                </h3>
                <p className="text-gray-700 mb-6">
                  Cliquez sur le bouton ci-dessous pour voir la liste complète avec recherche et filtres
                </p>
                <a
                  href="/client/interventions"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg text-lg transition-all shadow-lg"
                >
                  📋 Voir toutes les interventions
                </a>
              </div>
            </div>
          )}

          {/* Contenu Carte */}
          {activeTab === 'carte' && (
            <div className="p-6">
              {sitesWithGPS.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun site géolocalisé</h3>
                  <p className="text-gray-700">Les sites avec coordonnées GPS apparaîtront sur la carte.</p>
                </div>
              ) : (
                (() => {
                  const filteredMapSites = showOnlyMapSitesWithInter
                    ? sitesWithGPS.filter(s => interventions.some(i => i.siteId === s.id))
                    : sitesWithGPS

                  if (filteredMapSites.length === 0) {
                    return (
                      <div>
                        <div className="mb-4 flex gap-3">
                          <button
                            onClick={() => setShowOnlyMapSitesWithInter(false)}
                            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                              !showOnlyMapSitesWithInter
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            🗺️ Tous les sites ({sitesWithGPS.length})
                          </button>
                          <button
                            onClick={() => setShowOnlyMapSitesWithInter(true)}
                            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                              showOnlyMapSitesWithInter
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            📍 Sites avec interventions (0)
                          </button>
                        </div>
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📍</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun site géolocalisé avec interventions</h3>
                          <p className="text-gray-700">Aucun site avec interventions n'a de coordonnées GPS.</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div>
                      {/* Toggle Tous / Avec interventions */}
                      <div className="mb-4 flex gap-3">
                        <button
                          onClick={() => setShowOnlyMapSitesWithInter(false)}
                          className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                            !showOnlyMapSitesWithInter
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          🗺️ Tous les sites ({sitesWithGPS.length})
                        </button>
                        <button
                          onClick={() => setShowOnlyMapSitesWithInter(true)}
                          className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                            showOnlyMapSitesWithInter
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          📍 Sites avec interventions ({sitesWithGPS.filter(s => interventions.some(i => i.siteId === s.id)).length})
                        </button>
                      </div>

                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-bold text-gray-900">
                          🗺️ {
                            showOnlyMapSitesWithInter
                              ? `${filteredMapSites.length} sites avec interventions`
                              : `${sitesWithGPS.length} sites géolocalisés sur ${sites.length}`
                          }
                        </p>
                      </div>

                      <div className="h-[600px] rounded-lg overflow-hidden border-2 border-gray-200">
                        <MapView 
                          sites={filteredMapSites}
                          onMarkerClick={(site) => setSelectedSite(site)}
                          selectedSite={selectedSite}
                        />
                      </div>
                    </div>
                  )
                })()
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
