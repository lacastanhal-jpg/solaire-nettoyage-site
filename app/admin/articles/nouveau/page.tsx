'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createArticle } from '@/lib/firebase/articles'
import { searchComptes, type CompteComptable } from '@/lib/firebase/plan-comptable'
import { ArrowLeft, Save, Search } from 'lucide-react'

const UNITES = ['m2', 'm3', 'FT', 'heure', 'jour', 'unité', 'forfait']

export default function NouveauArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingComptes, setLoadingComptes] = useState(true)
  const [comptes, setComptes] = useState<CompteComptable[]>([])
  const [searchCompte, setSearchCompte] = useState('')
  
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    description: '',
    prix: '',
    unite: 'm2',
    tva: '20',
    actif: true,
    compteComptable: '',
    compteIntitule: ''
  })

  const societeId = 'solaire-nettoyage'

  useEffect(() => {
    loadComptesComptables()
  }, [])

  async function loadComptesComptables() {
    try {
      setLoadingComptes(true)
      // Charger seulement les comptes de charges (classe 6)
      const result = await searchComptes(societeId, { 
        classe: '6',
        actifOnly: true 
      })
      setComptes(result)
    } catch (error) {
      console.error('Erreur chargement comptes:', error)
    } finally {
      setLoadingComptes(false)
    }
  }

  function handleCompteSelect(compte: CompteComptable) {
    setFormData({
      ...formData,
      compteComptable: compte.numero,
      compteIntitule: compte.intitule
    })
    setSearchCompte('')
  }

  const comptesFiltered = searchCompte
    ? comptes.filter(c => 
        c.numero.includes(searchCompte) || 
        c.intitule.toLowerCase().includes(searchCompte.toLowerCase())
      )
    : comptes

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!formData.code || !formData.nom || !formData.prix) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires')
      return
    }

    const prix = parseFloat(formData.prix)
    if (isNaN(prix) || prix < 0) {
      alert('⚠️ Le prix doit être un nombre positif')
      return
    }

    const tva = parseFloat(formData.tva)
    if (isNaN(tva) || tva < 0 || tva > 100) {
      alert('⚠️ La TVA doit être entre 0 et 100%')
      return
    }

    try {
      setLoading(true)

      await createArticle({
        code: formData.code,
        nom: formData.nom,
        description: formData.description || undefined,
        prix: prix,
        unite: formData.unite,
        tva: tva,
        actif: formData.actif,
        compteComptable: formData.compteComptable || undefined,
        compteIntitule: formData.compteIntitule || undefined
      })

      alert('✅ Article créé avec succès')
      router.push('/admin/articles')
    } catch (error: any) {
      console.error('Erreur création article:', error)
      alert('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouvel Article</h1>
            <p className="text-gray-600 mt-1">Créer un nouveau produit ou prestation</p>
          </div>
          <button
            onClick={() => router.push('/admin/articles')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Code & Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="Ex: NETT-PV"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Nettoyage panneaux PV"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description détaillée de l'article"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Prix, Unité, TVA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix HT <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({...formData, prix: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="absolute right-3 top-2.5 text-gray-500">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unite}
                onChange={(e) => setFormData({...formData, unite: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {UNITES.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TVA (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tva}
                onChange={(e) => setFormData({...formData, tva: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* 🆕 COMPTE COMPTABLE */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              💰 Comptabilité
            </h3>

            {loadingComptes ? (
              <div className="text-center py-4 text-gray-600">
                Chargement comptes comptables...
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compte comptable (optionnel)
                  </label>
                  
                  {/* Compte sélectionné */}
                  {formData.compteComptable ? (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex-1">
                        <span className="font-mono font-bold text-blue-900">{formData.compteComptable}</span>
                        <span className="text-sm text-blue-700 ml-3">{formData.compteIntitule}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, compteComptable: '', compteIntitule: '' })}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Recherche */}
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchCompte}
                          onChange={(e) => setSearchCompte(e.target.value)}
                          placeholder="Rechercher un compte (ex: 6064, Fournitures...)"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Liste comptes */}
                      {searchCompte && (
                        <div className="border border-gray-200 rounded max-h-48 overflow-y-auto">
                          {comptesFiltered.length === 0 ? (
                            <div className="p-3 text-sm text-gray-600 text-center">
                              Aucun compte trouvé
                            </div>
                          ) : (
                            comptesFiltered.map(compte => (
                              <button
                                key={compte.numero}
                                type="button"
                                onClick={() => handleCompteSelect(compte)}
                                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition"
                              >
                                <span className="font-mono font-bold text-gray-900">{compte.numero}</span>
                                <span className="text-sm text-gray-700 ml-3">{compte.intitule}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Le compte comptable permet d'automatiser l'export comptable
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actif */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={(e) => setFormData({...formData, actif: e.target.checked})}
              className="w-5 h-5 text-blue-600"
            />
            <label htmlFor="actif" className="text-sm font-medium text-gray-700">
              Article actif (visible dans les devis et factures)
            </label>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/articles')}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Création...' : 'Créer l\'article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
