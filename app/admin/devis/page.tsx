'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllDevis, deleteDevis, type Devis } from '@/lib/firebase/devis'

const STATUT_LABELS = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  envoyé: { label: 'Envoyé', color: 'bg-blue-100 text-blue-800' },
  accepté: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
  refusé: { label: 'Refusé', color: 'bg-red-100 text-red-800' }
}

export default function DevisPage() {
  const router = useRouter()
  const [devis, setDevis] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadDevis()
  }, [])

  async function loadDevis() {
    try {
      setLoading(true)
      const data = await getAllDevis()
      setDevis(data)
    } catch (error) {
      console.error('Erreur chargement devis:', error)
      alert('Erreur lors du chargement des devis')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDevis(id)
      await loadDevis()
      setDeleteConfirm(null)
      alert('Devis supprimé avec succès')
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredDevis = devis.filter(d => {
    const matchSearch = 
      d.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.groupeNom && d.groupeNom.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchStatut = filterStatut === 'tous' || d.statut === filterStatut
    
    return matchSearch && matchStatut
  })

  const stats = {
    total: devis.length,
    brouillon: devis.filter(d => d.statut === 'brouillon').length,
    envoyé: devis.filter(d => d.statut === 'envoyé').length,
    accepté: devis.filter(d => d.statut === 'accepté').length,
    refusé: devis.filter(d => d.statut === 'refusé').length,
    montantTotal: devis.filter(d => d.statut === 'accepté').reduce((sum, d) => sum + d.totalTTC, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/intranet/dashboard')}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Retour au Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Devis</h1>
              <p className="text-gray-800 mt-1">Gestion des devis clients</p>
            </div>
            <button
              onClick={() => router.push('/admin/devis/nouveau')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ➕ Nouveau Devis
            </button>
          </div>

          {/* Recherche et filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par numéro, client ou groupe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <span className="absolute left-4 top-3.5 text-gray-700">🔍</span>
            </div>

            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="tous">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="envoyé">Envoyé</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Brouillon</div>
            <div className="text-3xl font-bold text-gray-600">{stats.brouillon}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Envoyé</div>
            <div className="text-3xl font-bold text-blue-600">{stats.envoyé}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Accepté</div>
            <div className="text-3xl font-bold text-green-600">{stats.accepté}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">Refusé</div>
            <div className="text-3xl font-bold text-red-600">{stats.refusé}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-gray-800 text-sm mb-1">CA Accepté</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.montantTotal.toLocaleString('fr-FR')} €
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-800">
              Chargement des devis...
            </div>
          ) : filteredDevis.length === 0 ? (
            <div className="p-12 text-center text-gray-800">
              {searchTerm || filterStatut !== 'tous' ? 'Aucun devis trouvé' : 'Aucun devis créé'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Montant TTC
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDevis.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-gray-900">{d.numero}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {new Date(d.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{d.clientNom}</div>
                        {d.groupeNom && (
                          <div className="text-sm text-gray-700">{d.groupeNom}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-semibold text-gray-900">
                          {d.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUT_LABELS[d.statut].color}`}>
                          {STATUT_LABELS[d.statut].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/devis/${d.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            👁️ Voir
                          </button>
                          <button
                            onClick={() => router.push(`/admin/devis/${d.id}/modifier`)}
                            className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          {deleteConfirm === d.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(d.id)}
                                className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50"
                              >
                                ✓ Confirmer
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-700 hover:text-gray-900 font-medium px-3 py-1 rounded hover:bg-gray-100"
                              >
                                ✗ Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(d.id)}
                              className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}