'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  getAllChargesFixes,
  deleteChargeFixe,
  toggleChargeFixeActif,
  getStatistiquesChargesFixes,
  type ChargeFixe
} from '@/lib/firebase/charges-fixes'
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, TrendingUp, Calendar } from 'lucide-react'

export default function ChargesFixesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [charges, setCharges] = useState<ChargeFixe[]>([])
  const [stats, setStats] = useState<any>(null)
  
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>('all')
  const [statutFilter, setStatutFilter] = useState<'all' | 'actif' | 'inactif'>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [chargesData, statsData] = await Promise.all([
        getAllChargesFixes(),
        getStatistiquesChargesFixes()
      ])
      setCharges(chargesData)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('❌ Erreur chargement des charges fixes')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActif(id: string, actif: boolean) {
    try {
      await toggleChargeFixeActif(id, actif)
      await loadData()
    } catch (error) {
      console.error('Erreur toggle:', error)
      alert('❌ Erreur lors de la modification')
    }
  }

  async function handleSupprimer(charge: ChargeFixe) {
    if (!confirm(`Supprimer la charge "${charge.nom}" ?\n\nCette action est irréversible.`)) {
      return
    }

    try {
      await deleteChargeFixe(charge.id)
      alert('✅ Charge supprimée')
      await loadData()
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur : ' + error.message)
    }
  }

  const chargesFiltrees = charges.filter(charge => {
    if (typeFilter !== 'all' && charge.type !== typeFilter) return false
    if (recurrenceFilter !== 'all' && charge.recurrence !== recurrenceFilter) return false
    if (statutFilter === 'actif' && !charge.actif) return false
    if (statutFilter === 'inactif' && charge.actif) return false
    return true
  })

  function getMontantMensuel(charge: ChargeFixe): number {
    if (charge.recurrence === 'mensuel') return charge.montant
    if (charge.recurrence === 'trimestriel') return charge.montant / 3
    if (charge.recurrence === 'annuel') return charge.montant / 12
    return charge.montant
  }

  const typeLabels: Record<string, string> = {
    salaire: '👥 Salaires',
    loyer: '🏢 Loyer',
    assurance: '🛡️ Assurance',
    abonnement: '📱 Abonnement',
    location_vehicule: '🚗 Location',
    credit: '🏦 Crédit',
    autre: '📋 Autre'
  }

  const recurrenceLabels: Record<string, string> = {
    mensuel: 'Mensuel',
    trimestriel: 'Trimestriel',
    annuel: 'Annuel'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Charges Fixes</h1>
          <p className="text-gray-600 mt-2">
            {charges.length} charge{charges.length > 1 ? 's' : ''} • {stats?.actives} active{stats?.actives > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Retour
          </Link>
          <Link
            href="/admin/finances/charges/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Charge
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Mensuel</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.totalMensuel?.toFixed(0) || '0'} €
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Annuel</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats?.totalAnnuel?.toFixed(0) || '0'} €
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Actives</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.actives || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Inactives</p>
          <p className="text-3xl font-bold text-gray-400">{stats?.inactives || 0}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-sm text-gray-600 mr-2">Type :</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous</option>
              <option value="salaire">Salaires</option>
              <option value="loyer">Loyer</option>
              <option value="assurance">Assurance</option>
              <option value="abonnement">Abonnement</option>
              <option value="location_vehicule">Location véhicule</option>
              <option value="credit">Crédit</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 mr-2">Récurrence :</label>
            <select
              value={recurrenceFilter}
              onChange={(e) => setRecurrenceFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Toutes</option>
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-600 mr-2">Statut :</label>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous</option>
              <option value="actif">Actives</option>
              <option value="inactif">Inactives</option>
            </select>
          </div>

          {(typeFilter !== 'all' || recurrenceFilter !== 'all' || statutFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setRecurrenceFilter('all')
                setStatutFilter('all')
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Réinitialiser filtres
            </button>
          )}
        </div>
      </div>

      {/* Liste des charges */}
      {chargesFiltrees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune charge trouvée</p>
          {(typeFilter !== 'all' || recurrenceFilter !== 'all' || statutFilter !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('all')
                setRecurrenceFilter('all')
                setStatutFilter('all')
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bénéficiaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Récurrence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chargesFiltrees.map((charge) => (
                <tr key={charge.id} className={!charge.actif ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{charge.nom}</div>
                    {charge.notes && (
                      <div className="text-sm text-gray-500">{charge.notes.slice(0, 50)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {typeLabels[charge.type] || charge.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{charge.beneficiaire}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{charge.montant.toFixed(2)} €</div>
                    <div className="text-xs text-gray-500">
                      ≈ {getMontantMensuel(charge).toFixed(0)} €/mois
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      charge.recurrence === 'mensuel'
                        ? 'bg-blue-100 text-blue-700'
                        : charge.recurrence === 'trimestriel'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {recurrenceLabels[charge.recurrence]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      charge.actif
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {charge.actif ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/finances/charges/${charge.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleActif(charge.id, !charge.actif)}
                        className="text-gray-600 hover:text-gray-900"
                        title={charge.actif ? 'Désactiver' : 'Activer'}
                      >
                        {charge.actif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleSupprimer(charge)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
