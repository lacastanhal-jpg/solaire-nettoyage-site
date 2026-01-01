'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllEquipements } from '@/lib/firebase'
import type { Equipement } from '@/lib/types/stock-flotte'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

interface InterventionMaintenance {
  id: string
  equipementId: string
  type: 'curatif' | 'preventif'
  statut: 'en_cours' | 'terminee'
  description: string
  date: string
  operateur: string
  coutMainOeuvre: number
  coutTotal: number
  articlesConsommes?: Array<{
    articleId: string
    quantite: number
    prixUnitaire: number
  }>
  createdAt: string
  updatedAt: string
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<InterventionMaintenance[]>([])
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatut, setFilterStatut] = useState<string>('all')
  const [filterEquipement, setFilterEquipement] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [interventionsData, equipementsData] = await Promise.all([
        loadInterventions(),
        getAllEquipements()
      ])
      setInterventions(interventionsData)
      setEquipements(equipementsData)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function loadInterventions(): Promise<InterventionMaintenance[]> {
    try {
      const q = query(collection(db, 'interventions_equipement'), orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InterventionMaintenance[]
    } catch (error) {
      console.error('Erreur chargement interventions:', error)
      return []
    }
  }

  const interventionsFiltrees = interventions.filter(intervention => {
    // Filtre type
    if (filterType !== 'all' && intervention.type !== filterType) return false
    
    // Filtre statut
    if (filterStatut !== 'all' && intervention.statut !== filterStatut) return false
    
    // Filtre équipement
    if (filterEquipement !== 'all' && intervention.equipementId !== filterEquipement) return false
    
    // Filtre recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const equipement = equipements.find(e => e.id === intervention.equipementId)
      const matchSearch = 
        intervention.description.toLowerCase().includes(searchLower) ||
        intervention.operateur.toLowerCase().includes(searchLower) ||
        equipement?.immatriculation?.toLowerCase().includes(searchLower) ||
        equipement?.nom?.toLowerCase().includes(searchLower)
      if (!matchSearch) return false
    }
    
    return true
  })

  // Statistiques
  const stats = {
    total: interventionsFiltrees.length,
    enCours: interventionsFiltrees.filter(i => i.statut === 'en_cours').length,
    terminees: interventionsFiltrees.filter(i => i.statut === 'terminee').length,
    coutTotal: interventionsFiltrees.reduce((sum, i) => sum + (i.coutTotal || 0), 0)
  }

  function getEquipementInfo(equipementId: string) {
    return equipements.find(e => e.id === equipementId)
  }

  function getTypeBadge(type: string) {
    return type === 'curatif' 
      ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">🔧 Curatif</span>
      : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">⚙️ Préventif</span>
  }

  function getStatutBadge(statut: string) {
    return statut === 'en_cours'
      ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">En cours</span>
      : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Terminée</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des interventions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interventions Maintenance</h1>
          <p className="text-gray-600 mt-1">
            {interventionsFiltrees.length} intervention{interventionsFiltrees.length > 1 ? 's' : ''} trouvée{interventionsFiltrees.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/stock-flotte/interventions/nouveau"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Nouvelle Intervention
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-sm text-gray-600">Total interventions</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
          <div className="text-sm text-orange-700">⏳ En cours</div>
          <div className="text-2xl font-bold text-orange-900">{stats.enCours}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="text-sm text-green-700">✅ Terminées</div>
          <div className="text-2xl font-bold text-green-900">{stats.terminees}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="text-sm text-blue-700">💰 Coût total</div>
          <div className="text-2xl font-bold text-blue-900">
            {stats.coutTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Description, opérateur..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="curatif">🔧 Curatif</option>
              <option value="preventif">⚙️ Préventif</option>
            </select>
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
              <option value="en_cours">⏳ En cours</option>
              <option value="terminee">✅ Terminée</option>
            </select>
          </div>

          {/* Équipement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipement
            </label>
            <select
              value={filterEquipement}
              onChange={(e) => setFilterEquipement(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les équipements</option>
              {equipements.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.type === 'vehicule' ? eq.immatriculation : eq.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {interventionsFiltrees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">Aucune intervention trouvée</p>
          <Link
            href="/admin/stock-flotte/interventions/nouveau"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            Créer la première intervention →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Équipement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opérateur</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Coût</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interventionsFiltrees.map((intervention) => {
                  const equipement = getEquipementInfo(intervention.equipementId)
                  return (
                    <tr key={intervention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(intervention.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        {equipement ? (
                          <Link
                            href={`/admin/stock-flotte/equipements/${equipement.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {equipement.type === 'vehicule' ? equipement.immatriculation : equipement.nom}
                          </Link>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(intervention.type)}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{intervention.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {intervention.operateur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {intervention.coutTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatutBadge(intervention.statut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link
                          href={`/admin/stock-flotte/interventions/${intervention.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/admin/stock-flotte/interventions/${intervention.id}/modifier`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Modifier
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
