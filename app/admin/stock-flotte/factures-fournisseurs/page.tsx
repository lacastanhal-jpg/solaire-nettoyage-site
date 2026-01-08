'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getAllFacturesFournisseurs,
  type FactureFournisseur
} from '@/lib/firebase/factures-fournisseurs-unifie'

export default function FacturesFournisseursStockPage() {
  const router = useRouter()
  const [factures, setFactures] = useState<FactureFournisseur[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreFournisseur, setFiltreFournisseur] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'brouillon' | 'validee' | 'payee'>('tous')

  useEffect(() => {
    chargerFactures()
  }, [])

  async function chargerFactures() {
    try {
      setLoading(true)
      const data = await getAllFacturesFournisseurs()
      setFactures(data)
    } catch (error) {
      console.error('Erreur chargement factures:', error)
      alert('Erreur lors du chargement des factures')
    } finally {
      setLoading(false)
    }
  }

  const facturesFiltrees = factures.filter(f => {
    if (filtreFournisseur && !f.fournisseur.toLowerCase().includes(filtreFournisseur.toLowerCase())) {
      return false
    }
    if (filtreStatut !== 'tous' && f.statut !== filtreStatut) {
      return false
    }
    return true
  })

  const fournisseurs = Array.from(new Set(factures.map(f => f.fournisseur))).sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <span className="text-gray-900">Factures Fournisseurs</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📄 Factures Fournisseurs Stock</h1>
            <p className="text-gray-600 mt-1">
              Gestion des factures d'achat d'articles stock
            </p>
          </div>
          <Link
            href="/admin/stock-flotte/factures-fournisseurs/nouvelle"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Nouvelle Facture
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="text-sm text-gray-600">Total Factures</div>
          <div className="text-2xl font-bold text-gray-900">{factures.length}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <div className="text-sm text-gray-600">Brouillon</div>
          <div className="text-2xl font-bold text-gray-600">
            {factures.filter(f => f.statut === 'brouillon').length}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="text-sm text-gray-600">Validées</div>
          <div className="text-2xl font-bold text-blue-600">
            {factures.filter(f => f.statut === 'validee').length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <div className="text-sm text-gray-600">Payées</div>
          <div className="text-2xl font-bold text-green-600">
            {factures.filter(f => f.statut === 'payee').length}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Recherche Fournisseur
            </label>
            <input
              type="text"
              value={filtreFournisseur}
              onChange={(e) => setFiltreFournisseur(e.target.value)}
              placeholder="Rechercher un fournisseur..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Statut
            </label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as any)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tous">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="validee">Validée</option>
              <option value="payee">Payée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      {facturesFiltrees.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-lg border-2 border-dashed border-gray-300 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {factures.length === 0 ? 'Aucune facture' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-600 mb-6">
            {factures.length === 0 
              ? 'Créez votre première facture fournisseur pour commencer'
              : 'Aucune facture ne correspond à vos critères de recherche'
            }
          </p>
          {factures.length === 0 && (
            <Link
              href="/admin/stock-flotte/factures-fournisseurs/nouvelle"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Créer la première facture
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Articles</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facturesFiltrees.map((facture) => (
                <tr key={facture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{facture.numero}</div>
                    <div className="text-xs text-gray-500">
                      Échéance: {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{facture.fournisseur}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {(facture.montantTTC || 0).toFixed(2)} €
                    </div>
                    <div className="text-xs text-gray-500">
                      HT: {(facture.montantHT || 0).toFixed(2)} €
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {facture.lignes.length} article{facture.lignes.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {facture.statut === 'brouillon' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        🟡 Brouillon
                      </span>
                    )}
                    {facture.statut === 'validee' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        ✅ Validée
                      </span>
                    )}
                    {facture.statut === 'payee' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        💚 Payée
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/stock-flotte/factures-fournisseurs/${facture.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Voir →
                    </Link>
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
