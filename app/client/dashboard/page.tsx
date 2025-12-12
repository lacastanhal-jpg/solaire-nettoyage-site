'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getInterventionsByClient, 
  getClientStats, 
  getSitesByClient,
  type Intervention 
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

interface Site {
  id: string
  nomSite: string
  lat: number
  lng: number
  adresse1: string
  ville: string
  codePostal: string
  surface: number
  infosCompl: string
}

export default function ClientDashboard() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientId, setClientId] = useState('')
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [stats, setStats] = useState({
    total: 0,
    terminees: 0,
    montantTotal: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'interventions' | 'sites' | 'carte'>('interventions')
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)

  useEffect(() => {
    // Vérifier si le client est connecté
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const name = localStorage.getItem('client_name') || ''
    const company = localStorage.getItem('client_company') || ''
    const id = localStorage.getItem('client_id') || ''
    
    setClientName(name)
    setClientCompany(company)
    setClientId(id)

    // Charger les données
    loadData(id)
  }, [router])

  const loadData = async (clientId: string) => {
    try {
      setLoading(true)
      
      // Récupérer les interventions
      const interventionsData = await getInterventionsByClient(clientId)
      setInterventions(interventionsData)

      // Récupérer les stats
      const statsData = await getClientStats(clientId)
      setStats(statsData)

      // Récupérer les sites
      const sitesData = await getSitesByClient(clientId) as Site[]
      setSites(sitesData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_logged_in')
    localStorage.removeItem('client_name')
    localStorage.removeItem('client_email')
    localStorage.removeItem('client_company')
    localStorage.removeItem('client_id')
    router.push('/client/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement de vos données...</div>
      </div>
    )
  }

  const sitesWithGPS = sites.filter(s => s.lat && s.lng)

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Bienvenue {clientName}</h1>
                <p className="text-sm text-blue-600">{clientCompany}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Interventions</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Terminées</span>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.terminees}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Sites</span>
              <span className="text-2xl">📍</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{sites.length}</div>
            <div className="text-xs text-purple-600 mt-1">{sitesWithGPS.length} géolocalisés</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Montant total</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats.montantTotal.toLocaleString()}€</div>
            <div className="text-xs text-blue-600 mt-1">HT</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 mb-6">
          <div className="flex border-b border-blue-200">
            <button
              onClick={() => setActiveTab('interventions')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'interventions'
                  ? 'bg-blue-600 text-white border-b-4 border-yellow-500'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              📋 Interventions
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`flex-1 px-6 py-4 font-bold transition-colors ${
                activeTab === 'sites'
                  ? 'bg-blue-600 text-white border-b-4 border-yellow-500'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              📍 Mes Sites ({sites.length})
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

          {/* Contenu Interventions */}
          {activeTab === 'interventions' && (
            <div className="p-6">
              {interventions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Aucune intervention</h3>
                  <p className="text-blue-600">Vos rapports apparaîtront ici.</p>
                </div>
              ) : (
                <div className="divide-y divide-blue-100">
                  {interventions.map((intervention) => (
                    <div key={intervention.id} className="py-4 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full">
                              {intervention.numero}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              intervention.statut === 'Terminé' 
                                ? 'bg-green-100 text-green-900' 
                                : 'bg-orange-100 text-orange-900'
                            }`}>
                              {intervention.statut}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-blue-900 mb-1">{intervention.siteName}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-blue-600">
                            <div>📅 {formatDate(intervention.date)}</div>
                            <div>👤 {intervention.technicien}</div>
                            <div>💰 {intervention.prix.toLocaleString()}€ HT</div>
                          </div>
                        </div>
                        {intervention.rapportUrl && (
                          <a
                            href={intervention.rapportUrl.split('/').map(part => encodeURIComponent(part)).join('/')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors"
                          >
                            📄 Rapport
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Aucun site</h3>
                  <p className="text-blue-600">Vos sites apparaîtront ici.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sites.map((site) => (
                    <div 
                      key={site.id} 
                      className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                    >
                      <h3 className="text-lg font-bold text-blue-900 mb-2">{site.nomSite}</h3>
                      <div className="space-y-1 text-sm text-blue-700">
                        {site.adresse1 && <div>📍 {site.adresse1}</div>}
                        {site.ville && <div>🏙️ {site.codePostal} {site.ville}</div>}
                        {site.surface > 0 && <div>📐 {site.surface} m²</div>}
                        {site.lat && site.lng ? (
                          <div className="text-xs text-green-600 mt-2 font-medium">
                            ✅ GPS: {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                          </div>
                        ) : (
                          <div className="text-xs text-red-600 mt-2 font-medium">
                            ❌ Pas de GPS
                          </div>
                        )}
                      </div>
                      {site.lat && site.lng && (
                        <button 
                          onClick={() => setSelectedSite(site)}
                          className="mt-3 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                        >
                          🗺️ Voir sur carte
                        </button>
                      )}
                    </div>
                  ))}
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
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Aucun site géolocalisé</h3>
                  <p className="text-blue-600">Vos sites apparaîtront sur la carte dès qu'ils auront des coordonnées GPS.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 text-blue-700 font-medium">
                    📍 {sitesWithGPS.length} sites géolocalisés
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
                    <h4 className="font-bold text-blue-900 mb-2">Informations</h4>
                    <div className="space-y-2 text-blue-700">
                      {selectedSite.adresse1 && <div>📍 {selectedSite.adresse1}</div>}
                      {selectedSite.ville && <div>🏙️ {selectedSite.codePostal} {selectedSite.ville}</div>}
                      {selectedSite.surface > 0 && <div>📐 {selectedSite.surface} m²</div>}
                      {selectedSite.infosCompl && <div>ℹ️ {selectedSite.infosCompl}</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">Coordonnées GPS</h4>
                    <div className="text-blue-700 font-mono text-sm">
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
