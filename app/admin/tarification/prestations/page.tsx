'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAllPrestations,
  createPrestation,
  updatePrestation,
  activerPrestation,
  desactiverPrestation,
  prestationCodeExists
} from '@/lib/firebase/prestations-catalogue'
import type { PrestationCatalogue, PrestationCatalogueInput, UnitePrestation, CategoriePrestation } from '@/lib/types/tarification'

const UNITES: UnitePrestation[] = ['m²', 'forfait', 'intervention', 'heure', 'jour']
const CATEGORIES: CategoriePrestation[] = ['Nettoyage', 'Maintenance', 'Diagnostic', 'Installation', 'Formation', 'Autre']

export default function PrestationsPage() {
  const router = useRouter()
  const [prestations, setPrestations] = useState<PrestationCatalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState<PrestationCatalogueInput>({
    code: '',
    libelle: '',
    description: '',
    unite: 'm²',
    categorie: 'Nettoyage',
    prixBase: 0,
    tauxTVA: 20,
    actif: true
  })

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    chargerPrestations()
  }, [router])

  async function chargerPrestations() {
    try {
      setLoading(true)
      const data = await getAllPrestations()
      setPrestations(data)
    } catch (error) {
      console.error('Erreur chargement prestations:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  function ouvrirModal(prestation?: PrestationCatalogue) {
    if (prestation) {
      setEditingId(prestation.id)
      setFormData({
        code: prestation.code,
        libelle: prestation.libelle,
        description: prestation.description,
        unite: prestation.unite,
        categorie: prestation.categorie,
        prixBase: prestation.prixBase,
        tauxTVA: prestation.tauxTVA,
        compteComptable: prestation.compteComptable,
        actif: prestation.actif
      })
    } else {
      setEditingId(null)
      setFormData({
        code: '',
        libelle: '',
        description: '',
        unite: 'm²',
        categorie: 'Nettoyage',
        prixBase: 0,
        tauxTVA: 20,
        actif: true
      })
    }
    setShowModal(true)
  }

  async function handleSave() {
    if (!formData.code || !formData.libelle) {
      alert('Code et libellé obligatoires')
      return
    }

    try {
      setSaving(true)

      // Vérifier code unique
      if (!editingId) {
        const codeExiste = await prestationCodeExists(formData.code)
        if (codeExiste) {
          alert(`Le code ${formData.code} existe déjà`)
          return
        }
      }

      if (editingId) {
        await updatePrestation(editingId, formData)
        alert('✅ Prestation modifiée')
      } else {
        await createPrestation(formData)
        alert('✅ Prestation créée')
      }

      setShowModal(false)
      await chargerPrestations()
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      alert(`❌ ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActif(id: string, actif: boolean) {
    try {
      if (actif) {
        await desactiverPrestation(id)
      } else {
        await activerPrestation(id)
      }
      await chargerPrestations()
    } catch (error) {
      console.error('Erreur toggle:', error)
      alert('Erreur lors de la modification')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/intranet/dashboard" className="hover:text-gray-900">Accueil</Link>
            <span>→</span>
            <Link href="/admin/tarification" className="hover:text-gray-900">Tarification</Link>
            <span>→</span>
            <span className="text-gray-900">Prestations</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Prestations</h1>
              <p className="text-gray-600">
                Catalogue des services facturables ({prestations.length} prestations)
              </p>
            </div>
            <button
              onClick={() => ouvrirModal()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              ➕ Nouvelle prestation
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Libellé</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Catégorie</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Unité</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Prix Base</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">TVA</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prestations.map(prestation => (
                  <tr key={prestation.id} className={!prestation.actif ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600">{prestation.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{prestation.libelle}</div>
                      <div className="text-xs text-gray-500">{prestation.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {prestation.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">
                      {prestation.unite}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {prestation.prixBase.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900">
                      {prestation.tauxTVA}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActif(prestation.id, prestation.actif)}
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          prestation.actif
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {prestation.actif ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => ouvrirModal(prestation)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-bold"
                      >
                        ✏️ Modifier
                      </button>
                    </td>
                  </tr>
                ))}
                {prestations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Aucune prestation. Cliquez sur "Nouvelle prestation" pour commencer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Modifier la prestation' : 'Nouvelle prestation'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Code * <span className="text-xs text-gray-500">(ex: NETT-STANDARD)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="NETT-STANDARD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value as CategoriePrestation })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Libellé *
                </label>
                <input
                  type="text"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Nettoyage photovoltaïque standard"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Description détaillée de la prestation..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Unité *
                  </label>
                  <select
                    value={formData.unite}
                    onChange={(e) => setFormData({ ...formData, unite: e.target.value as UnitePrestation })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    {UNITES.map(unite => (
                      <option key={unite} value={unite}>{unite}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Prix base (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prixBase}
                    onChange={(e) => setFormData({ ...formData, prixBase: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    TVA (%) *
                  </label>
                  <select
                    value={formData.tauxTVA}
                    onChange={(e) => setFormData({ ...formData, tauxTVA: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="20">20%</option>
                    <option value="10">10%</option>
                    <option value="5.5">5.5%</option>
                    <option value="0">0%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Compte comptable (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.compteComptable || ''}
                  onChange={(e) => setFormData({ ...formData, compteComptable: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="706000"
                />
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-bold text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:bg-gray-400"
              >
                {saving ? '⏳ Enregistrement...' : (editingId ? '✓ Modifier' : '✓ Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
