'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createArticleStock } from '@/lib/firebase/stock-articles'
import { searchComptes, type CompteComptable } from '@/lib/firebase/plan-comptable'
import { ArrowLeft, Save, Search, Package } from 'lucide-react'

const DEPOTS = ['Atelier', 'Porteur 26 T', 'Porteur 32 T', 'Semi Remorque']

export default function NouveauArticleStockPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingComptes, setLoadingComptes] = useState(true)
  const [comptes, setComptes] = useState<CompteComptable[]>([])
  const [searchCompte, setSearchCompte] = useState('')
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    fournisseur: '',
    prixUnitaire: '',
    stockMin: '',
    actif: true,
    compteComptable: '',
    compteIntitule: '',
    stockParDepot: {
      'Atelier': 0,
      'Porteur 26 T': 0,
      'Porteur 32 T': 0,
      'Semi Remorque': 0
    }
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

  function handleStockDepotChange(depot: string, value: string) {
    const quantity = parseInt(value) || 0
    setFormData({
      ...formData,
      stockParDepot: {
        ...formData.stockParDepot,
        [depot]: quantity
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.code || !formData.description || !formData.fournisseur || !formData.prixUnitaire) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires')
      return
    }

    const prix = parseFloat(formData.prixUnitaire)
    if (isNaN(prix) || prix < 0) {
      alert('⚠️ Le prix doit être un nombre positif')
      return
    }

    try {
      setLoading(true)

      await createArticleStock({
        code: formData.code,
        description: formData.description,
        fournisseur: formData.fournisseur,
        prixUnitaire: prix,
        stockParDepot: formData.stockParDepot,
        stockMin: parseInt(formData.stockMin) || 0,
        actif: formData.actif,
        compteComptable: formData.compteComptable || undefined,
        compteIntitule: formData.compteIntitule || undefined
      })

      alert('✅ Article stock créé avec succès')
      router.push('/admin/stock-flotte/articles')
    } catch (error: any) {
      console.error('Erreur création article stock:', error)
      alert('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const stockTotal = Object.values(formData.stockParDepot).reduce((sum, qty) => sum + qty, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/articles" className="hover:text-gray-900">Articles</Link>
          <span>→</span>
          <span className="text-gray-900">Nouveau</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouvel Article Stock</h1>
            <p className="text-gray-600 mt-1">Créer un article de stock avec gestion par dépôt</p>
          </div>
          <Link
            href="/admin/stock-flotte/articles"
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code article <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: HUILE-5W30"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Identifiant unique de l'article</p>
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                placeholder="Ex: TotalEnergies"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de l'article"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Prix et Stock Min */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix unitaire HT <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prixUnitaire}
                  onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <span className="absolute right-3 top-2.5 text-gray-500">€</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock minimum
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Alerte si stock descend sous ce seuil</p>
            </div>
          </div>
        </div>

        {/* 🆕 COMPTE COMPTABLE */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
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
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex-1">
                      <span className="font-mono font-bold text-orange-900">{formData.compteComptable}</span>
                      <span className="text-sm text-orange-700 ml-3">{formData.compteIntitule}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, compteComptable: '', compteIntitule: '' })}
                      className="text-sm text-orange-600 hover:underline"
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
                        placeholder="Rechercher un compte (ex: 6063, Fournitures...)"
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
                          comptesFiltered.slice(0, 10).map(compte => (
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
                <p className="text-xs text-blue-600 mt-1">
                  💡 Recommandations : 6061 (Eau, énergie), 6063 (Fournitures entretien), 6064 (Fournitures admin)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Stock par dépôt */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock par dépôt</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEPOTS.map(depot => (
              <div key={depot}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {depot}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockParDepot[depot as keyof typeof formData.stockParDepot]}
                  onChange={(e) => handleStockDepotChange(depot, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          {/* Stock total */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Stock total initial :</span>{' '}
              <span className="text-xl font-bold">{stockTotal}</span> unité{stockTotal > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Actif */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="actif"
              checked={formData.actif}
              onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
              className="w-5 h-5 text-blue-600"
            />
            <label htmlFor="actif" className="text-sm font-medium text-gray-700">
              Article actif (visible dans les mouvements de stock)
            </label>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Link
            href="/admin/stock-flotte/articles"
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Création...' : 'Créer l\'article stock'}
          </button>
        </div>
      </form>
    </div>
  )
}
