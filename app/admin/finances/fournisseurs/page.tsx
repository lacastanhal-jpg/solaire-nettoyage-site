'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllFournisseurs, deleteFournisseur, type Fournisseur } from '@/lib/firebase/fournisseurs'

export default function FournisseursPage() {
  const [loading, setLoading] = useState(true)
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActif, setFilterActif] = useState<'tous' | 'actifs' | 'inactifs'>('actifs')

  useEffect(() => {
    loadFournisseurs()
  }, [])

  async function loadFournisseurs() {
    try {
      setLoading(true)
      const data = await getAllFournisseurs()
      setFournisseurs(data)
    } catch (error) {
      console.error('Erreur chargement fournisseurs:', error)
      alert('Erreur lors du chargement des fournisseurs')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Voulez-vous vraiment désactiver le fournisseur "${nom}" ?`)) {
      return
    }

    try {
      await deleteFournisseur(id)
      alert('Fournisseur désactivé avec succès')
      loadFournisseurs()
    } catch (error) {
      console.error('Erreur suppression fournisseur:', error)
      alert('Erreur lors de la désactivation du fournisseur')
    }
  }

  // Filtrage
  const fournisseursFiltres = fournisseurs.filter(f => {
    // Filtre actif/inactif
    if (filterActif === 'actifs' && !f.actif) return false
    if (filterActif === 'inactifs' && f.actif) return false

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        f.nom.toLowerCase().includes(term) ||
        f.siret?.toLowerCase().includes(term) ||
        f.email?.toLowerCase().includes(term) ||
        f.ville?.toLowerCase().includes(term)
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des fournisseurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-gray-600 mt-1">
            {fournisseursFiltres.length} fournisseur{fournisseursFiltres.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/finances/fournisseurs/nouveau"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nouveau Fournisseur
        </Link>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
              placeholder="Nom, SIRET, email, ville..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filterActif}
              onChange={(e) => setFilterActif(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tous">Tous</option>
              <option value="actifs">Actifs</option>
              <option value="inactifs">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste */}
      {fournisseursFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Aucun fournisseur trouvé</p>
          <Link
            href="/admin/finances/fournisseurs/nouveau"
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Créer votre premier fournisseur
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fournisseursFiltres.map((fournisseur) => (
                <tr key={fournisseur.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {fournisseur.nom}
                      </div>
                      {fournisseur.siret && (
                        <div className="text-sm text-gray-500">
                          SIRET: {fournisseur.siret}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {fournisseur.email && (
                        <div className="text-gray-900">{fournisseur.email}</div>
                      )}
                      {fournisseur.telephone && (
                        <div className="text-gray-500">{fournisseur.telephone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {fournisseur.ville && (
                        <div className="text-gray-900">{fournisseur.ville}</div>
                      )}
                      {fournisseur.codePostal && (
                        <div className="text-gray-500">{fournisseur.codePostal}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {fournisseur.delaiPaiement} jours
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        fournisseur.actif
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {fournisseur.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/finances/fournisseurs/${fournisseur.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/admin/finances/fournisseurs/${fournisseur.id}/modifier`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Modifier
                    </Link>
                    {fournisseur.actif && (
                      <button
                        onClick={() => handleDelete(fournisseur.id, fournisseur.nom)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Désactiver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Retour */}
      <div className="mt-6">
        <Link
          href="/admin/finances"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Retour aux Finances
        </Link>
      </div>
    </div>
  )
}
