'use client'

import { useState, useEffect } from 'react'
import { getAllAvoirs, Avoir } from '@/lib/firebase/avoirs'
import Link from 'next/link'

export default function AvoirsPage() {
  const [avoirs, setAvoirs] = useState<Avoir[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState<string>('tous')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    loadAvoirs()
  }, [])

  async function loadAvoirs() {
    setLoading(true)
    try {
      const data = await getAllAvoirs()
      setAvoirs(data)
    } catch (error) {
      console.error('Erreur chargement avoirs:', error)
    } finally {
      setLoading(false)
    }
  }

  const avoirsFiltres = avoirs.filter(a => {
    if (filtreStatut !== 'tous' && a.statut !== filtreStatut) return false
    
    if (recherche) {
      const terme = recherche.toLowerCase()
      return (
        a.numero.toLowerCase().includes(terme) ||
        a.clientNom.toLowerCase().includes(terme)
      )
    }
    
    return true
  })

  const stats = {
    total: avoirs.length,
    montantTotal: Math.abs(avoirs.reduce((sum, a) => sum + a.montant, 0)),
    enAttente: avoirs.filter(a => a.statut === 'envoye').length,
    montantEnAttente: Math.abs(avoirs.filter(a => a.statut === 'envoye').reduce((sum, a) => sum + a.montant, 0))
  }

  function getStatutBadge(statut: Avoir['statut']) {
    const styles = {
      brouillon: 'bg-gray-600 text-white',
      envoye: 'bg-blue-700 text-white',
      applique: 'bg-green-700 text-white',
      rembourse: 'bg-purple-700 text-white'
    }
    
    const labels = {
      brouillon: 'Brouillon',
      envoye: 'Envoyé',
      applique: 'Appliqué',
      rembourse: 'Remboursé'
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
          <h1 className="text-3xl font-bold text-gray-900">Avoirs Clients</h1>
          <p className="text-gray-700 mt-1">{avoirs.length} avoirs au total</p>
        </div>
        <Link
          href="/admin/finances/avoirs/nouveau"
          className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-semibold transition"
        >
          ➕ Nouvel avoir
        </Link>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Total avoirs</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.total}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Montant total</div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            -{stats.montantTotal.toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Avoirs en attente</div>
          <div className="text-2xl font-bold text-blue-700 mt-2">
            {stats.enAttente}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Montant en attente</div>
          <div className="text-2xl font-bold text-orange-700 mt-2">
            -{stats.montantEnAttente.toLocaleString('fr-FR')} €
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
            <option value="tous">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoye">Envoyé</option>
            <option value="applique">Appliqué</option>
            <option value="rembourse">Remboursé</option>
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
                Facture d'origine
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Utilisation
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
            {avoirsFiltres.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-700">
                  Aucun avoir trouvé
                </td>
              </tr>
            ) : (
              avoirsFiltres.map((avoir) => (
                <tr key={avoir.id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                    {avoir.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {new Date(avoir.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {avoir.clientNom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {avoir.factureOrigineNumero || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-red-700">
                    {Math.abs(avoir.totalTTC).toLocaleString('fr-FR')} €
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {avoir.typeUtilisation === 'deduction' ? 'Déduction' : 'Remboursement'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatutBadge(avoir.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                    <Link
                      href={`/admin/finances/avoirs/${avoir.id}`}
                      className="text-blue-700 hover:text-blue-900 font-semibold"
                    >
                      👁️ Voir
                    </Link>
                    <Link
                      href={`/admin/finances/avoirs/${avoir.id}/modifier`}
                      className="text-orange-700 hover:text-orange-900 font-semibold"
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
