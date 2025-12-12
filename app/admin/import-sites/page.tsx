'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllClients,
  getAllGroupes,
  importSitesFromExcel,
  type Client,
  type Groupe,
  type SiteComplet
} from '@/lib/firebase'
import * as XLSX from 'xlsx'

export default function ImportSitesPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [sites, setSites] = useState<Omit<SiteComplet, 'id'>[]>([])
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null)

  useEffect(() => {
    // Vérifier admin
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
      const [clientsList, groupesList] = await Promise.all([
        getAllClients(),
        getAllGroupes()
      ])
      setClients(clientsList)
      setGroupes(groupesList)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Parser les données
      const parsedSites: Omit<SiteComplet, 'id'>[] = jsonData.map((row: any) => ({
        complementNom: row['Complément Nom'] || row['ID'] || '',
        nomSite: row['Nom Site'] || row['Nom'] || '',
        tel: row['Téléphone'] || row['Tel'] || '',
        portable: row['Portable'] || row['Mobile'] || '',
        codePostal: row['Code Postal'] || row['CP'] || '',
        ville: row['Ville'] || '',
        adresse1: row['Adresse 1'] || row['Adresse'] || '',
        adresse2: row['Adresse 2'] || '',
        adresse3: row['Adresse 3'] || '',
        pays: row['Pays'] || 'France',
        internet: row['Internet'] || row['Site Web'] || '',
        email: row['Email'] || '',
        contact: row['Contact'] || '',
        surface: parseFloat(row['Surface'] || row['Surface (m²)'] || '0'),
        pente: row['Pente'] || '',
        eau: row['Eau'] || '',
        infosCompl: row['Infos Complémentaires'] || row['Infos'] || '',
        typeInterv: row['Type Intervention'] || row['Type'] || '',
        accesCamion: row['Accès Camion'] || '',
        gps: row['GPS'] || row['Coordonnées GPS'] || '',
        lat: parseFloat(row['Latitude'] || row['Lat'] || '0'),
        lng: parseFloat(row['Longitude'] || row['Lng'] || row['Lon'] || '0')
      }))

      setSites(parsedSites)
      alert(`✅ ${parsedSites.length} sites chargés depuis Excel`)
    } catch (error) {
      console.error('Erreur lecture fichier:', error)
      alert('❌ Erreur lors de la lecture du fichier Excel')
    }
  }

  const handleImport = async () => {
    if (!selectedClientId) {
      alert('⚠️ Veuillez sélectionner un client')
      return
    }

    if (sites.length === 0) {
      alert('⚠️ Veuillez d\'abord charger un fichier Excel')
      return
    }

    const client = clients.find(c => c.id === selectedClientId)
    if (!client || !client.groupeId) {
      alert('❌ Client invalide ou groupe manquant')
      return
    }

    if (!confirm(`Importer ${sites.length} sites pour le client "${client.company}" ?`)) {
      return
    }

    try {
      setImporting(true)
      const result = await importSitesFromExcel(sites, selectedClientId, client.groupeId)
      setImportResult(result)
      
      if (result.errors.length === 0) {
        alert(`✅ ${result.success} sites importés avec succès !`)
        setSites([])
        setSelectedClientId('')
      } else {
        alert(`⚠️ ${result.success} sites importés, ${result.errors.length} erreurs`)
      }
    } catch (error) {
      console.error('Erreur import:', error)
      alert('❌ Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  const getGroupeNom = (groupeId?: string) => {
    if (!groupeId) return '-'
    const groupe = groupes.find(g => g.id === groupeId)
    return groupe ? groupe.nom : 'Groupe inconnu'
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
                <p className="text-sm text-blue-600">Importer des sites depuis Excel</p>
              </div>
            </div>
            <a
              href="/admin/gestion-clients"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour Clients
            </a>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Étape 1: Sélection client */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">1️⃣ Sélectionner le Client</h2>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
          >
            <option value="">-- Sélectionner un client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company} - 🏢 {getGroupeNom(client.groupeId)}
              </option>
            ))}
          </select>
          {selectedClientId && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                ✅ Client sélectionné: <strong>{clients.find(c => c.id === selectedClientId)?.company}</strong>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Les sites seront automatiquement liés à ce client et son groupe
              </p>
            </div>
          )}
        </div>

        {/* Étape 2: Upload fichier */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">2️⃣ Charger le Fichier Excel</h2>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
          />
          {sites.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900">
                ✅ <strong>{sites.length} sites</strong> chargés depuis Excel
              </p>
            </div>
          )}
        </div>

        {/* Étape 3: Aperçu sites */}
        {sites.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">3️⃣ Aperçu Sites ({sites.length})</h2>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-900">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-900">Nom Site</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-900">Ville</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-900">Surface (m²)</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-900">GPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {sites.slice(0, 10).map((site, idx) => (
                    <tr key={idx} className="hover:bg-blue-50">
                      <td className="px-4 py-2 text-blue-900 font-mono text-xs">{site.complementNom}</td>
                      <td className="px-4 py-2 text-blue-900">{site.nomSite}</td>
                      <td className="px-4 py-2 text-blue-700">{site.codePostal} {site.ville}</td>
                      <td className="px-4 py-2 text-blue-700">{site.surface}</td>
                      <td className="px-4 py-2 text-blue-700 font-mono text-xs">{site.gps || `${site.lat},${site.lng}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sites.length > 10 && (
                <p className="text-xs text-blue-600 mt-2 text-center">
                  ... et {sites.length - 10} autres sites
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bouton Import */}
        {sites.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
            <button
              onClick={handleImport}
              disabled={importing || !selectedClientId}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? '⏳ Import en cours...' : `✅ Importer ${sites.length} sites`}
            </button>
          </div>
        )}

        {/* Résultats import */}
        {importResult && (
          <div className={`mt-6 rounded-xl shadow-lg border p-6 ${
            importResult.errors.length === 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <h2 className="text-lg font-bold mb-4">
              {importResult.errors.length === 0 ? '✅ Import Réussi' : '⚠️ Import Terminé avec Erreurs'}
            </h2>
            <p className="text-sm mb-2">
              <strong>{importResult.success}</strong> sites importés avec succès
            </p>
            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-orange-900 mb-2">
                  Erreurs ({importResult.errors.length}):
                </p>
                <div className="max-h-64 overflow-y-auto bg-white rounded p-3">
                  {importResult.errors.map((error, idx) => (
                    <p key={idx} className="text-xs text-red-700 mb-1">{error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
