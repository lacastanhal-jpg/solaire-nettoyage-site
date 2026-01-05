'use client'

import { useState, useEffect } from 'react'
import { 
  getAllFacturesFournisseurs,
  getStatistiquesFacturesFournisseurs,
  getListeFournisseurs,
  deleteFactureFournisseur,
  type FactureFournisseur 
} from '@/lib/firebase/factures-fournisseurs'
import Link from 'next/link'
import { Trash2, Eye, Edit, Plus } from 'lucide-react'

export default function FacturesFournisseursComptaPage() {
  const [factures, setFactures] = useState<FactureFournisseur[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState<string>('tous')
  const [filtreFournisseur, setFiltreFournisseur] = useState<string>('tous')
  const [recherche, setRecherche] = useState('')
  const [fournisseurs, setFournisseurs] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalMois: { count: 0, montant: 0 },
    enAttenteValidation: { count: 0, montant: 0 },
    aPayer: { count: 0, montant: 0 },
    payees: { count: 0, montant: 0 }
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [facturesData, statsData, fournisseursData] = await Promise.all([
        getAllFacturesFournisseurs(),
        getStatistiquesFacturesFournisseurs(),
        getListeFournisseurs()
      ])
      
      setFactures(facturesData)
      setStats(statsData)
      setFournisseurs(fournisseursData)
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const facturesFiltrees = factures.filter(f => {
    if (filtreStatut !== 'tous' && f.statut !== filtreStatut) return false
    if (filtreFournisseur !== 'tous' && f.fournisseur !== filtreFournisseur) return false
    
    if (recherche) {
      const terme = recherche.toLowerCase()
      return (
        f.numero.toLowerCase().includes(terme) ||
        f.numeroFournisseur.toLowerCase().includes(terme) ||
        f.fournisseur.toLowerCase().includes(terme)
      )
    }
    
    return true
  })

  function getStatutBadge(statut: FactureFournisseur['statut']) {
    const styles = {
      brouillon: 'bg-yellow-600 text-white',
      validee: 'bg-blue-600 text-white',
      payee: 'bg-green-700 text-white'
    }
    
    const labels = {
      brouillon: '🟡 Brouillon',
      validee: '✅ Validée',
      payee: '💚 Payée'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[statut]}`}>
        {labels[statut]}
      </span>
    )
  }

  async function handleDelete(id: string, numero: string) {
    if (!confirm(`Supprimer la facture ${numero} ?`)) return
    
    try {
      await deleteFactureFournisseur(id)
      await loadData()
      alert('Facture supprimée')
    } catch (error: any) {
      alert(error.message || 'Erreur suppression')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures Fournisseurs</h1>
          <p className="text-gray-600 mt-1">Module Comptabilité - Phase 3</p>
        </div>
        <Link 
          href="/admin/comptabilite/factures-fournisseurs/nouvelle"
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle facture
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Total mois</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalMois.count} factures</div>
          <div className="text-lg text-blue-600 font-semibold mt-1">
            {stats.totalMois.montant.toLocaleString('fr-FR')} €
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 font-medium mb-1">En attente validation</div>
          <div className="text-2xl font-bold text-gray-900">{stats.enAttenteValidation.count} factures</div>
          <div className="text-lg text-yellow-600 font-semibold mt-1">
            {stats.enAttenteValidation.montant.toLocaleString('fr-FR')} €
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 font-medium mb-1">À payer</div>
          <div className="text-2xl font-bold text-gray-900">{stats.aPayer.count} factures</div>
          <div className="text-lg text-orange-600 font-semibold mt-1">
            {stats.aPayer.montant.toLocaleString('fr-FR')} €
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-sm text-gray-600 font-medium mb-1">Payées</div>
          <div className="text-2xl font-bold text-gray-900">{stats.payees.count} factures</div>
          <div className="text-lg text-green-600 font-semibold mt-1">
            {stats.payees.montant.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="N° facture, fournisseur..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="tous">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="validee">Validée</option>
              <option value="payee">Payée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fournisseur
            </label>
            <select
              value={filtreFournisseur}
              onChange={(e) => setFiltreFournisseur(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="tous">Tous les fournisseurs</option>
              {fournisseurs.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setRecherche('')
                setFiltreStatut('tous')
                setFiltreFournisseur('tous')
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Échéance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facturesFiltrees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {factures.length === 0 
                      ? "Aucune facture fournisseur pour le moment"
                      : "Aucune facture ne correspond aux filtres"}
                  </td>
                </tr>
              ) : (
                facturesFiltrees.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {facture.numero}
                      </div>
                      <div className="text-xs text-gray-500">
                        Ref: {facture.numeroFournisseur}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {facture.fournisseur}
                      </div>
                      {facture.siretFournisseur && (
                        <div className="text-xs text-gray-500">
                          SIRET: {facture.siretFournisseur}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {facture.montantTTC.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })} €
                      </div>
                      <div className="text-xs text-gray-500">
                        HT: {facture.montantHT.toLocaleString('fr-FR', { 
                          minimumFractionDigits: 2 
                        })} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatutBadge(facture.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/comptabilite/factures-fournisseurs/${facture.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {facture.statut === 'brouillon' && (
                          <>
                            <Link
                              href={`/admin/comptabilite/factures-fournisseurs/${facture.id}/modifier`}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => handleDelete(facture.id, facture.numero)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Résumé en bas */}
      <div className="mt-4 text-sm text-gray-600">
        {facturesFiltrees.length} facture{facturesFiltrees.length > 1 ? 's' : ''} affichée{facturesFiltrees.length > 1 ? 's' : ''}
        {facturesFiltrees.length !== factures.length && ` sur ${factures.length} au total`}
      </div>
    </div>
  )
}
