'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllSitesComplet,
  getAllClients,
  updateSiteComplet,
  type SiteComplet,
  type Client
} from '@/lib/firebase'

export default function AffectationMassePage() {
  const router = useRouter()
  const [sites, setSites] = useState<(SiteComplet & { id: string })[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState('')
  const [results, setResults] = useState<{ success: number; errors: number } | null>(null)

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
      const [sitesList, clientsList] = await Promise.all([
        getAllSitesComplet(),
        getAllClients()
      ])
      setSites(sitesList)
      setClients(clientsList)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const sitesSansClient = sites.filter(s => !s.clientId)

  const handleAffectation = async () => {
    if (!selectedClientId) {
      alert('⚠️ Sélectionne un client !')
      return
    }

    const client = clients.find(c => c.id === selectedClientId)
    if (!client || !client.groupeId) {
      alert('❌ Client invalide')
      return
    }

    if (!confirm(`Affecter ${sitesSansClient.length} sites à ${client.company} ?`)) {
      return
    }

    setProcessing(true)
    let success = 0
    let errors = 0

    for (const site of sitesSansClient) {
      try {
        await updateSiteComplet(site.id, {
          clientId: selectedClientId,
          groupeId: client.groupeId
        })
        success++
      } catch (error) {
        console.error(`Erreur site ${site.id}:`, error)
        errors++
      }
    }

    setResults({ success, errors })
    setProcessing(false)
    alert(`✅ Affectation terminée !\n${success} succès, ${errors} erreurs`)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Affectation en Masse</h1>
                <p className="text-sm text-blue-600">Affecter tous les sites sans client</p>
              </div>
            </div>
            <a
              href="/admin/gestion-sites"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              ← Retour Sites
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">{sites.length}</div>
            <div className="text-blue-700 font-medium">Sites totaux</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {sites.filter(s => s.clientId).length}
            </div>
            <div className="text-blue-700 font-medium">Sites affectés</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {sitesSansClient.length}
            </div>
            <div className="text-blue-700 font-medium">Sans client</div>
          </div>
        </div>

        {/* Affectation */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            ⚡ Affectation Rapide
          </h2>

          {sitesSansClient.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-xl font-bold text-green-600 mb-2">
                Tous les sites sont affectés !
              </div>
              <div className="text-blue-600">Aucune action nécessaire</div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-blue-900 mb-3">
                  Affecter les {sitesSansClient.length} sites non affectés au client :
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 text-lg"
                  disabled={processing}
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company} ({sites.filter(s => s.clientId === client.id).length} sites actuels)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAffectation}
                disabled={!selectedClientId || processing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing
                  ? `⏳ Affectation en cours...`
                  : `⚡ Affecter ${sitesSansClient.length} sites`
                }
              </button>

              {results && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-bold text-green-900 mb-2">📊 Résultats :</div>
                  <div className="text-green-800">
                    ✅ {results.success} sites affectés
                  </div>
                  {results.errors > 0 && (
                    <div className="text-red-800">
                      ❌ {results.errors} erreurs
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Liste aperçu */}
        {sitesSansClient.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mt-8">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              📋 Aperçu des sites à affecter (10 premiers)
            </h3>
            <div className="space-y-2">
              {sitesSansClient.slice(0, 10).map((site) => (
                <div
                  key={site.id}
                  className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-blue-900">{site.nomSite}</div>
                    <div className="text-sm text-blue-600">
                      {site.ville} • {site.surface ? `${site.surface}m²` : 'Surface inconnue'}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-900 rounded-full text-xs font-bold">
                    Sans client
                  </span>
                </div>
              ))}
              {sitesSansClient.length > 10 && (
                <div className="text-center text-blue-600 text-sm py-2">
                  ... et {sitesSansClient.length - 10} autres sites
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
