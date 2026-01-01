'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllEquipements } from '@/lib/firebase'
import type { Equipement } from '@/lib/types/stock-flotte'

export default function EquipementsPage() {
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'vehicules' | 'accessoires'>('vehicules')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('all')

  useEffect(() => {
    loadEquipements()
  }, [])

  async function loadEquipements() {
    try {
      setLoading(true)
      const data = await getAllEquipements()
      setEquipements(data)
    } catch (error) {
      console.error('Erreur chargement équipements:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const vehicules = equipements.filter(e => e.type === 'vehicule')
  const accessoires = equipements.filter(e => e.type === 'accessoire')

  const equipementsFiltres = (activeTab === 'vehicules' ? vehicules : accessoires).filter(eq => {
    // Filtre statut
    if (filterStatut !== 'all' && eq.statut !== filterStatut) return false
    
    // Filtre recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchSearch = 
        eq.immatriculation?.toLowerCase().includes(searchLower) ||
        eq.nom?.toLowerCase().includes(searchLower) ||
        eq.marque?.toLowerCase().includes(searchLower) ||
        eq.modele?.toLowerCase().includes(searchLower) ||
        eq.numeroSerie?.toLowerCase().includes(searchLower)
      if (!matchSearch) return false
    }
    
    return true
  })

  // Statistiques
  const stats = {
    totalVehicules: vehicules.length,
    totalAccessoires: accessoires.length,
    enService: equipements.filter(e => e.statut === 'en_service').length,
    enMaintenance: equipements.filter(e => e.statut === 'en_maintenance').length,
    horsService: equipements.filter(e => e.statut === 'hors_service').length
  }

  function getStatutBadge(statut: string) {
    switch(statut) {
      case 'en_service':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">En service</span>
      case 'en_maintenance':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">En maintenance</span>
      case 'hors_service':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Hors service</span>
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{statut}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des équipements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Équipements & Flotte</h1>
          <p className="text-gray-600 mt-1">
            {equipementsFiltres.length} équipement{equipementsFiltres.length > 1 ? 's' : ''} trouvé{equipementsFiltres.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/stock-flotte/equipements/nouveau"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Nouvel Équipement
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-sm text-blue-700">🚛 Véhicules</div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalVehicules}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
          <div className="text-sm text-purple-700">🔧 Accessoires</div>
          <div className="text-2xl font-bold text-purple-900">{stats.totalAccessoires}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-700">✅ En service</div>
          <div className="text-2xl font-bold text-green-900">{stats.enService}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <div className="text-sm text-orange-700">⚙️ En maintenance</div>
          <div className="text-2xl font-bold text-orange-900">{stats.enMaintenance}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <div className="text-sm text-red-700">❌ Hors service</div>
          <div className="text-2xl font-bold text-red-900">{stats.horsService}</div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow mb-6 border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('vehicules')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'vehicules'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚛 Véhicules ({vehicules.length})
            </button>
            <button
              onClick={() => setActiveTab('accessoires')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'accessoires'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔧 Accessoires ({accessoires.length})
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'vehicules' ? 'Immatriculation, marque, modèle...' : 'Nom, type, N° série...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_service">✅ En service</option>
                <option value="en_maintenance">⚙️ En maintenance</option>
                <option value="hors_service">❌ Hors service</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {equipementsFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">Aucun équipement trouvé</p>
          <Link
            href="/admin/stock-flotte/equipements/nouveau"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            Créer le premier équipement →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'vehicules' ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Immatriculation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque / Modèle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Km / Heures</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CT / Assurance</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Série</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affecté à</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipementsFiltres.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    {activeTab === 'vehicules' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/admin/stock-flotte/equipements/${eq.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {eq.immatriculation}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{eq.marque}</div>
                          <div className="text-xs text-gray-500">{eq.modele}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {eq.typeVehicule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {eq.kmHeures?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {eq.controleTechniqueExpiration && (
                            <div className="text-gray-700">CT: {new Date(eq.controleTechniqueExpiration).toLocaleDateString('fr-FR')}</div>
                          )}
                          {eq.assuranceExpiration && (
                            <div className="text-gray-500 text-xs">Ass: {new Date(eq.assuranceExpiration).toLocaleDateString('fr-FR')}</div>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/stock-flotte/equipements/${eq.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {eq.nom}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {eq.typeAccessoire}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {eq.numeroSerie || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {eq.vehiculeParentId ? (
                            <Link href={`/admin/stock-flotte/equipements/${eq.vehiculeParentId}`} className="text-blue-600 hover:text-blue-800">
                              Voir véhicule
                            </Link>
                          ) : (
                            <span className="text-gray-400">Non affecté</span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatutBadge(eq.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/admin/stock-flotte/equipements/${eq.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/admin/stock-flotte/equipements/${eq.id}/modifier`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
