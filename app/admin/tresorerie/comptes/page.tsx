'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getAllComptesBancaires,
  createCompteBancaire,
  updateCompteBancaire,
  type CompteBancaire
} from '@/lib/firebase/lignes-bancaires'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function ComptesPage() {
  const [loading, setLoading] = useState(true)
  const [comptes, setComptes] = useState<CompteBancaire[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCompte, setEditingCompte] = useState<CompteBancaire | null>(null)
  
  // Form
  const [formData, setFormData] = useState({
    nom: '',
    banque: '',
    numeroCompte: '',
    iban: '',
    bic: '',
    solde: 0,
    devise: 'EUR',
    actif: true
  })

  useEffect(() => {
    loadComptes()
  }, [])

  async function loadComptes() {
    try {
      setLoading(true)
      const data = await getAllComptesBancaires()
      setComptes(data)
    } catch (error) {
      console.error('Erreur chargement comptes:', error)
    } finally {
      setLoading(false)
    }
  }

  function openModal(compte?: CompteBancaire) {
    if (compte) {
      setEditingCompte(compte)
      setFormData({
        nom: compte.nom,
        banque: compte.banque,
        numeroCompte: compte.numeroCompte,
        iban: compte.iban || '',
        bic: compte.bic || '',
        solde: compte.solde,
        devise: compte.devise,
        actif: compte.actif
      })
    } else {
      setEditingCompte(null)
      setFormData({
        nom: '',
        banque: '',
        numeroCompte: '',
        iban: '',
        bic: '',
        solde: 0,
        devise: 'EUR',
        actif: true
      })
    }
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      if (editingCompte) {
        await updateCompteBancaire(editingCompte.id, {
          ...formData,
          dateMAJ: new Date().toISOString()
        })
        alert('✅ Compte modifié')
      } else {
        await createCompteBancaire({
          ...formData,
          dateMAJ: new Date().toISOString()
        })
        alert('✅ Compte créé')
      }
      
      setShowModal(false)
      await loadComptes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur')
    }
  }

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comptes Bancaires</h1>
          <p className="text-gray-600 mt-2">{comptes.length} compte{comptes.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/tresorerie"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Retour
          </Link>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouveau Compte
          </button>
        </div>
      </div>

      {/* Liste des comptes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IBAN</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comptes.map(compte => (
              <tr key={compte.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{compte.nom}</div>
                  <div className="text-sm text-gray-500">{compte.numeroCompte}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {compte.banque}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{compte.iban || '-'}</div>
                  {compte.bic && <div className="text-xs text-gray-500">{compte.bic}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`text-sm font-bold ${
                    compte.solde >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {compte.solde.toFixed(2)} {compte.devise}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    compte.actif 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {compte.actif ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => openModal(compte)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingCompte ? 'Modifier le compte' : 'Nouveau compte'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du compte *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Compte Courant Pro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banque *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.banque}
                    onChange={(e) => setFormData({...formData, banque: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Crédit Agricole"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de compte *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroCompte}
                    onChange={(e) => setFormData({...formData, numeroCompte: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: 12345678901"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="FR76..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BIC
                  </label>
                  <input
                    type="text"
                    value={formData.bic}
                    onChange={(e) => setFormData({...formData, bic: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="AGRIFRPP..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solde actuel *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.solde}
                    onChange={(e) => setFormData({...formData, solde: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise *
                  </label>
                  <select
                    value={formData.devise}
                    onChange={(e) => setFormData({...formData, devise: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      checked={formData.actif}
                      onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Compte actif
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCompte ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
