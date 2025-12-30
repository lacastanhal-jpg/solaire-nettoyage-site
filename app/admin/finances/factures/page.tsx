'use client'

import { useState, useEffect } from 'react'
import { getAllFactures, getFacturesImpayees, Facture } from '@/lib/firebase/factures'
import Link from 'next/link'

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState<string>('toutes')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    loadFactures()
  }, [])

  async function loadFactures() {
    setLoading(true)
    try {
      const data = await getAllFactures()
      setFactures(data)
    } catch (error) {
      console.error('Erreur chargement factures:', error)
    } finally {
      setLoading(false)
    }
  }

  const facturesFiltrees = factures.filter(f => {
    if (filtreStatut !== 'toutes' && f.statut !== filtreStatut) return false
    
    if (recherche) {
      const terme = recherche.toLowerCase()
      return (
        f.numero.toLowerCase().includes(terme) ||
        f.clientNom.toLowerCase().includes(terme)
      )
    }
    
    return true
  })

  const stats = {
    total: factures.length,
    montantTotal: factures.reduce((sum, f) => sum + f.totalTTC, 0),
    impayees: factures.filter(f => f.statut === 'en_retard' || f.statut === 'envoyee').length,
    montantImpaye: factures
      .filter(f => f.statut === 'en_retard' || f.statut === 'envoyee')
      .reduce((sum, f) => sum + f.resteAPayer, 0)
  }

  function getStatutBadge(statut: Facture['statut']) {
    const styles = {
      payee: 'bg-green-700 text-white',
      en_retard: 'bg-red-700 text-white',
      partiellement_payee: 'bg-orange-700 text-white',
      envoyee: 'bg-blue-700 text-white',
      brouillon: 'bg-gray-600 text-white',
      annulee: 'bg-gray-500 text-white'
    }
    
    const labels = {
      payee: 'Payée',
      en_retard: 'En retard',
      partiellement_payee: 'Partiellement payée',
      envoyee: 'Envoyée',
      brouillon: 'Brouillon',
      annulee: 'Annulée'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[statut]}`}>
        {labels[statut]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl text-gray-900 font-semibold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures Clients</h1>
          <p className="text-gray-700 mt-1">{factures.length} factures au total</p>
        </div>
        <Link
          href="/admin/finances/factures/nouveau"
          className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-semibold transition"
        >
          ➕ Nouvelle facture
        </Link>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Total facturé</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.montantTotal.toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Factures impayées</div>
          <div className="text-2xl font-bold text-orange-700 mt-2">
            {stats.impayees}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Montant impayé</div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            {stats.montantImpaye.toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Taux de paiement</div>
          <div className="text-2xl font-bold text-green-700 mt-2">
            {stats.total > 0 ? Math.round(((stats.total - stats.impayees) / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* FILTRES */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-300">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher (numéro, client)..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-400 rounded-lg text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-lg text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
          >
            <option value="toutes">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoyee">Envoyée</option>
            <option value="partiellement_payee">Partiellement payée</option>
            <option value="payee">Payée</option>
            <option value="en_retard">En retard</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Numéro
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Montant TTC
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Reste à payer
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {facturesFiltrees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-700">
                  Aucune facture trouvée
                </td>
              </tr>
            ) : (
              facturesFiltrees.map((facture) => (
                <tr key={facture.id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                    {facture.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {new Date(facture.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {facture.clientNom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                    {facture.totalTTC.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-orange-700">
                    {facture.resteAPayer.toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatutBadge(facture.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/admin/finances/factures/${facture.id}`}
                      className="text-blue-700 hover:text-blue-900 font-semibold mr-3"
                    >
                      👁️ Voir
                    </Link>
                    <Link
                      href={`/admin/finances/factures/${facture.id}/modifier`}
                      className="text-gray-700 hover:text-gray-900 font-semibold"
                    >
                      📝 Modifier
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
