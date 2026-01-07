'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import type { HistoriqueRelance } from '@/lib/firebase/relances-types'
import { 
  ArrowLeft,
  Filter,
  Download,
  Eye,
  RefreshCw,
  XCircle,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Calendar
} from 'lucide-react'

export default function HistoriqueRelancesPage() {
  const [loading, setLoading] = useState(true)
  const [relances, setRelances] = useState<HistoriqueRelance[]>([])
  const [filteredRelances, setFilteredRelances] = useState<HistoriqueRelance[]>([])
  
  // Filtres
  const [statutFilter, setStatutFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  
  // Modal détail
  const [selectedRelance, setSelectedRelance] = useState<HistoriqueRelance | null>(null)

  useEffect(() => {
    loadHistorique()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [relances, statutFilter, typeFilter, searchTerm, dateDebut, dateFin])

  async function loadHistorique() {
    try {
      setLoading(true)
      const relancesRef = collection(db, 'relances_historique')
      const q = query(relancesRef, orderBy('dateCreation', 'desc'), limit(100))
      
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoriqueRelance[]
      
      setRelances(data)
    } catch (error) {
      console.error('Erreur chargement historique:', error)
      alert('❌ Erreur chargement de l\'historique')
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...relances]

    // Filtre statut
    if (statutFilter !== 'all') {
      filtered = filtered.filter(r => r.statut === statutFilter)
    }

    // Filtre type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter)
    }

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.clientNom.toLowerCase().includes(term) ||
        r.factureNumero.toLowerCase().includes(term)
      )
    }

    // Filtre dates
    if (dateDebut) {
      filtered = filtered.filter(r => r.dateCreation >= dateDebut)
    }
    if (dateFin) {
      filtered = filtered.filter(r => r.dateCreation <= dateFin)
    }

    setFilteredRelances(filtered)
  }

  function exportExcel() {
    // TODO: Implémenter export Excel
    alert('Export Excel à implémenter')
  }

  const typeLabels: Record<string, { label: string, color: string }> = {
    rappel_amiable: { label: 'Rappel Amiable', color: 'blue' },
    relance_ferme: { label: 'Relance Ferme', color: 'orange' },
    mise_en_demeure: { label: 'Mise en Demeure', color: 'red' },
    contentieux: { label: 'Contentieux', color: 'purple' }
  }

  const statutLabels: Record<string, { label: string, color: string, icon: any }> = {
    planifiee: { label: 'Planifiée', color: 'blue', icon: Clock },
    en_attente: { label: 'En attente', color: 'yellow', icon: AlertCircle },
    envoyee: { label: 'Envoyée', color: 'green', icon: CheckCircle },
    echec: { label: 'Échec', color: 'red', icon: XCircle },
    annulee: { label: 'Annulée', color: 'gray', icon: XCircle }
  }

  const stats = {
    total: relances.length,
    envoyees: relances.filter(r => r.statut === 'envoyee').length,
    enAttente: relances.filter(r => r.statut === 'en_attente').length,
    echecs: relances.filter(r => r.statut === 'echec').length
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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href="/admin/finances/relances"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historique des Relances</h1>
            <p className="text-gray-600 mt-2">
              {filteredRelances.length} relance{filteredRelances.length > 1 ? 's' : ''} • Dernières 100 entrées
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadHistorique}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total relances</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <p className="text-sm text-green-700 mb-1">Envoyées</p>
          <p className="text-3xl font-bold text-green-700">{stats.envoyees}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <p className="text-sm text-yellow-700 mb-1">En attente</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.enAttente}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6">
          <p className="text-sm text-red-700 mb-1">Échecs</p>
          <p className="text-3xl font-bold text-red-700">{stats.echecs}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Client ou n° facture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="en_attente">En attente</option>
              <option value="envoyee">Envoyée</option>
              <option value="echec">Échec</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tous les types</option>
              <option value="rappel_amiable">Rappel Amiable</option>
              <option value="relance_ferme">Relance Ferme</option>
              <option value="mise_en_demeure">Mise en Demeure</option>
              <option value="contentieux">Contentieux</option>
            </select>
          </div>

          {/* Reset */}
          <div>
            <button
              onClick={() => {
                setStatutFilter('all')
                setTypeFilter('all')
                setSearchTerm('')
                setDateDebut('')
                setDateFin('')
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Filtres dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date début</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date fin</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des relances */}
      {filteredRelances.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {relances.length === 0 
              ? 'Aucune relance dans l\'historique'
              : 'Aucune relance ne correspond aux filtres'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRelances.map((relance) => {
                  const typeInfo = typeLabels[relance.type]
                  const statutInfo = statutLabels[relance.statut]
                  const StatutIcon = statutInfo.icon

                  return (
                    <tr key={relance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(relance.dateCreation).toLocaleDateString('fr-FR')}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(relance.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{relance.clientNom}</div>
                        {relance.joursRetard > 0 && (
                          <div className="text-xs text-red-600">{relance.joursRetard}j retard</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {relance.factureNumero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-${statutInfo.color}-100 text-${statutInfo.color}-700`}>
                          <StatutIcon className="w-3 h-3" />
                          {statutInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {relance.factureResteAPayer.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedRelance(relance)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Détail Relance */}
      {selectedRelance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Détail Relance</h2>
                <button
                  onClick={() => setSelectedRelance(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900">{typeLabels[selectedRelance.type].label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <p className="font-semibold text-gray-900">{statutLabels[selectedRelance.statut].label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date création</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedRelance.dateCreation).toLocaleString('fr-FR')}
                  </p>
                </div>
                {selectedRelance.dateEnvoi && (
                  <div>
                    <p className="text-sm text-gray-600">Date envoi</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRelance.dateEnvoi).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Client & Facture */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Client & Facture</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium text-gray-900">{selectedRelance.clientNom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedRelance.clientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Facture</p>
                    <p className="font-medium text-gray-900">{selectedRelance.factureNumero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant</p>
                    <p className="font-medium text-gray-900">
                      {selectedRelance.factureResteAPayer.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date échéance</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRelance.factureDateEcheance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Retard</p>
                    <p className="font-medium text-red-600">{selectedRelance.joursRetard} jours</p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Email</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Objet</p>
                    <p className="font-medium text-gray-900">{selectedRelance.objet}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Contenu</p>
                    <div 
                      className="p-4 bg-gray-50 rounded border text-sm max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: selectedRelance.contenu }}
                    />
                  </div>
                  {selectedRelance.piecesJointes.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Pièces jointes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRelance.piecesJointes.map((pj, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            📎 {pj}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              {selectedRelance.emailEnvoye && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email ouvert</p>
                      <p className={`font-medium ${selectedRelance.emailOuvert ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedRelance.emailOuvert ? '✓ Oui' : '✗ Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Paiement reçu</p>
                      <p className={`font-medium ${selectedRelance.paiementRecu ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedRelance.paiementRecu ? '✓ Oui' : '✗ Non'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Erreur si échec */}
              {selectedRelance.statut === 'echec' && selectedRelance.erreurEnvoi && (
                <div className="border-t pt-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800 mb-1">Erreur d'envoi</p>
                    <p className="text-sm text-red-700">{selectedRelance.erreurEnvoi}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedRelance(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
