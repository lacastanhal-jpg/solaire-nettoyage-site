'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAllClients, type Client } from '@/lib/firebase'
import { importSitesEnMasse, verifierDoublons, parseGPS, type SiteImport } from '@/lib/firebase/import-sites'
import * as XLSX from 'xlsx'

interface SitePreview extends SiteImport {
  isDoublon?: boolean
  selected?: boolean
}

export default function ImportSitesPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sites, setSites] = useState<SitePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [filterGPS, setFilterGPS] = useState<'all' | 'with' | 'without'>('all')

  // Charger les clients au démarrage
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsList = await getAllClients()
        setClients(clientsList)
      } catch (error) {
        console.error('Erreur chargement clients:', error)
      }
    }
    loadClients()
  }, [])

  // Parser le fichier Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile || !selectedClientId) {
      alert('Sélectionnez d\'abord un client !')
      return
    }

    setFile(uploadedFile)
    setLoading(true)
    setImportResults(null)

    try {
      const data = await uploadedFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const parsedSites: SitePreview[] = []

      for (const row of jsonData as any[]) {
        const gpsCoords = parseGPS(row['GPS'] || '')
        
        // Parser surface correctement
        let surface = 0
        const surfaceStr = String(row['m2'] || '').trim()
        if (surfaceStr && surfaceStr !== '') {
          const parsed = parseFloat(surfaceStr)
          if (!isNaN(parsed)) {
            surface = parsed
          }
        }

        parsedSites.push({
          clientId: selectedClientId,
          complementNom: row['Complément nom'] || '',
          nomSite: row['Nom du Site'] || '',
          tel: row['Tél'] || '',
          portable: row['Portable'] || '',
          codePostal: row['CP'] || '',
          ville: row['Ville'] || '',
          adresse1: row['Adresse1'] || '',
          adresse2: row['Adresse2'] || '',
          adresse3: row['Adresse3'] || '',
          pays: row['Pays'] || '',
          internet: row['Internet'] || '',
          email: row['Email'] || '',
          contact: row['Contact'] || '',
          surface: surface,
          pente: row['Pente'] || '',
          eau: row['Eau'] || '',
          infosCompl: row['Infos compl.'] || '',
          typeInterv: row['Type interv.'] || '',
          accesCamion: row['accès camion'] || '',
          gps: row['GPS'] || '',
          lat: gpsCoords?.lat || 0,
          lng: gpsCoords?.lng || 0,
          createdAt: new Date().toISOString(),
          selected: !!gpsCoords  // Sélectionner automatiquement si GPS valide
        })
      }

      // Vérifier les doublons
      const complementNoms = parsedSites.map(s => s.complementNom)
      const doublons = await verifierDoublons(complementNoms)

      // Marquer les doublons
      parsedSites.forEach(site => {
        site.isDoublon = doublons.includes(site.complementNom)
      })

      setSites(parsedSites)
    } catch (error) {
      console.error('Erreur parsing Excel:', error)
      alert('Erreur lors de la lecture du fichier Excel')
    } finally {
      setLoading(false)
    }
  }

  // Importer les sites sélectionnés
  const handleImport = async () => {
    const selectedSites = sites.filter(s => s.selected)
    
    if (selectedSites.length === 0) {
      alert('Sélectionnez au moins un site !')
      return
    }

    const sitesWithoutGPS = selectedSites.filter(s => !s.lat || !s.lng)
    
    if (sitesWithoutGPS.length > 0) {
      if (!confirm(`⚠️ ${sitesWithoutGPS.length} sites n'ont pas de GPS.\n\nVoulez-vous les importer quand même ?\n(Ils ne seront pas affichés sur la carte)`)) {
        return
      }
    }

    if (!confirm(`Importer ${selectedSites.length} sites ?\n${selectedSites.filter(s => s.isDoublon).length} seront mis à jour.`)) {
      return
    }

    setImporting(true)

    try {
      const results = await importSitesEnMasse(selectedSites)
      setImportResults(results)
      alert(`✅ Import terminé !\n${results.created} créés\n${results.updated} mis à jour`)
      
      // Réinitialiser
      setSites([])
      setFile(null)
    } catch (error) {
      console.error('Erreur import:', error)
      alert('❌ Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  // Tout sélectionner/désélectionner
  const toggleAll = (selected: boolean) => {
    setSites(sites.map(s => ({ ...s, selected })))
  }

  // Sélectionner uniquement sites avec GPS
  const selectOnlyWithGPS = () => {
    setSites(sites.map(s => ({ ...s, selected: !!(s.lat && s.lng) })))
  }

  // Toggle un site
  const toggleSite = (index: number) => {
    const newSites = [...sites]
    newSites[index].selected = !newSites[index].selected
    setSites(newSites)
  }

  // Filtrer les sites
  const filteredSites = sites.filter(site => {
    if (filterGPS === 'with') return site.lat && site.lng
    if (filterGPS === 'without') return !site.lat || !site.lng
    return true
  })

  const selectedCount = sites.filter(s => s.selected).length

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Import Sites Excel</h1>
                <p className="text-sm text-blue-600">Importer les sites depuis un fichier Excel</p>
              </div>
            </div>
            <a
              href="/admin/gestion-clients"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour
            </a>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Étape 1 : Sélectionner client */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">1️⃣ Sélectionner le client</h3>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
          >
            <option value="">-- Choisir un client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company}
              </option>
            ))}
          </select>
        </div>

        {/* Étape 2 : Upload fichier */}
        {selectedClientId && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">2️⃣ Uploader le fichier Excel</h3>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
            />
            {loading && (
              <div className="mt-4 text-blue-600">⏳ Lecture du fichier en cours...</div>
            )}
          </div>
        )}

        {/* Étape 3 : Prévisualisation */}
        {sites.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-blue-900">
                  3️⃣ Sélectionner les sites à importer ({selectedCount}/{sites.length})
                </h3>
                <button
                  onClick={handleImport}
                  disabled={importing || selectedCount === 0}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {importing ? '⏳ Import en cours...' : `🚀 Importer ${selectedCount} sites`}
                </button>
              </div>

              {/* Stats détaillées */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{sites.length}</div>
                  <div className="text-sm text-blue-700">Total sites</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {sites.filter(s => s.lat && s.lng).length}
                  </div>
                  <div className="text-sm text-green-700">Avec GPS</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {sites.filter(s => !s.lat || !s.lng).length}
                  </div>
                  <div className="text-sm text-red-700">Sans GPS</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {sites.filter(s => s.surface > 0).length}
                  </div>
                  <div className="text-sm text-purple-700">Avec surface</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {sites.filter(s => s.isDoublon).length}
                  </div>
                  <div className="text-sm text-orange-700">Doublons</div>
                </div>
              </div>

              {/* Actions de sélection */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => toggleAll(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  ✅ Tout sélectionner
                </button>
                <button
                  onClick={() => toggleAll(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
                >
                  ❌ Tout désélectionner
                </button>
                <button
                  onClick={selectOnlyWithGPS}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  📍 Seulement avec GPS
                </button>
                <select
                  value={filterGPS}
                  onChange={(e) => setFilterGPS(e.target.value as any)}
                  className="px-4 py-2 border-2 border-blue-200 rounded-lg text-blue-900 text-sm"
                >
                  <option value="all">Tous ({sites.length})</option>
                  <option value="with">Avec GPS ({sites.filter(s => s.lat && s.lng).length})</option>
                  <option value="without">Sans GPS ({sites.filter(s => !s.lat || !s.lng).length})</option>
                </select>
              </div>

              {/* Liste sites */}
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-blue-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 border-b border-blue-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">
                        <input 
                          type="checkbox" 
                          checked={selectedCount === sites.length}
                          onChange={(e) => toggleAll(e.target.checked)}
                          className="w-4 h-4"
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-blue-900 font-bold">ID</th>
                      <th className="px-4 py-2 text-left text-blue-900 font-bold">Nom</th>
                      <th className="px-4 py-2 text-left text-blue-900 font-bold">Ville</th>
                      <th className="px-4 py-2 text-left text-blue-900 font-bold">GPS</th>
                      <th className="px-4 py-2 text-left text-blue-900 font-bold">Surface</th>
                      <th className="px-4 py-2 text-left text-blue-900 font-bold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {filteredSites.map((site, index) => {
                      const originalIndex = sites.indexOf(site)
                      return (
                        <tr 
                          key={index} 
                          className={`hover:bg-blue-50 ${site.selected ? 'bg-green-50' : ''}`}
                        >
                          <td className="px-4 py-2">
                            <input 
                              type="checkbox" 
                              checked={site.selected || false}
                              onChange={() => toggleSite(originalIndex)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-4 py-2 text-blue-900 font-mono text-xs">{site.complementNom}</td>
                          <td className="px-4 py-2 text-blue-900">{site.nomSite}</td>
                          <td className="px-4 py-2 text-blue-700">{site.ville || '-'}</td>
                          <td className="px-4 py-2">
                            {site.lat && site.lng ? (
                              <span className="text-green-700 font-mono text-xs">
                                {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
                              </span>
                            ) : (
                              <span className="text-red-700 font-bold">❌ Manquant</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-blue-700">
                            {site.surface > 0 ? `${site.surface} m²` : '-'}
                          </td>
                          <td className="px-4 py-2">
                            {site.isDoublon ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-900 text-xs rounded-full">
                                🔄 Mise à jour
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-900 text-xs rounded-full">
                                ✨ Nouveau
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Résultats import */}
        {importResults && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">✅ Import terminé !</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold text-green-600">{importResults.created}</div>
                <div className="text-sm text-green-700">Sites créés</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{importResults.updated}</div>
                <div className="text-sm text-orange-700">Sites mis à jour</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{importResults.errors.length}</div>
                <div className="text-sm text-red-700">Erreurs</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}