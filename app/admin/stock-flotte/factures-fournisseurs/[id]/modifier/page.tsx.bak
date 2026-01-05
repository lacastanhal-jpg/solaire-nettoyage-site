'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { type FactureFournisseur, type LigneFactureFournisseur, type ArticleStock } from '@/lib/types/stock-flotte'
import { 
  getFactureFournisseurById,
  updateFactureFournisseur
} from '@/lib/firebase/stock-factures-fournisseurs'
import { getAllArticlesStock } from '@/lib/firebase/stock-articles'

export default function ModifierFactureFournisseurPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [facture, setFacture] = useState<FactureFournisseur | null>(null)
  const [articles, setArticles] = useState<ArticleStock[]>([])
  
  const [formData, setFormData] = useState({
    numero: '',
    fournisseur: '',
    date: '',
    dateEcheance: '',
    notes: ''
  })

  const [lignes, setLignes] = useState<LigneFactureFournisseur[]>([])

  useEffect(() => {
    chargerDonnees()
  }, [params.id])

  async function chargerDonnees() {
    try {
      setLoading(true)
      
      const factureData = await getFactureFournisseurById(params.id)
      if (!factureData) {
        alert('Facture non trouvée')
        router.push('/admin/stock-flotte/factures-fournisseurs')
        return
      }

      if (factureData.mouvementsStockIds.length > 0) {
        alert('⚠️ Cette facture a déjà généré des entrées stock. Modification impossible.')
        router.push(`/admin/stock-flotte/factures-fournisseurs/${params.id}`)
        return
      }

      setFacture(factureData)
      setFormData({
        numero: factureData.numero,
        fournisseur: factureData.fournisseur,
        date: factureData.date,
        dateEcheance: factureData.dateEcheance,
        notes: factureData.notes || ''
      })
      setLignes(factureData.lignes)

      const articlesData = await getAllArticlesStock()
      setArticles(articlesData)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  function supprimerLigne(index: number) {
    if (!confirm('Supprimer cette ligne ?')) return
    setLignes(lignes.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.numero || !formData.fournisseur) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires')
      return
    }

    if (lignes.length === 0) {
      alert('⚠️ Veuillez garder au moins une ligne d\'article')
      return
    }

    if (!confirm('Enregistrer les modifications ?')) {
      return
    }

    try {
      setSaving(true)

      await updateFactureFournisseur(params.id, {
        numero: formData.numero,
        fournisseur: formData.fournisseur,
        date: formData.date,
        dateEcheance: formData.dateEcheance,
        lignes,
        notes: formData.notes
      })
      
      alert('✅ Facture modifiée avec succès !')
      router.push(`/admin/stock-flotte/factures-fournisseurs/${params.id}`)
    } catch (error) {
      console.error('Erreur modification facture:', error)
      alert('❌ Erreur lors de la modification')
    } finally {
      setSaving(false)
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

  if (!facture) return null

  const totalHT = lignes.reduce((sum, l) => sum + l.totalHT, 0)
  const totalTVA = lignes.reduce((sum, l) => sum + l.totalTVA, 0)
  const totalTTC = lignes.reduce((sum, l) => sum + l.totalTTC, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/factures-fournisseurs" className="hover:text-gray-900">
            Factures Fournisseurs
          </Link>
          <span>→</span>
          <Link href={`/admin/stock-flotte/factures-fournisseurs/${params.id}`} className="hover:text-gray-900">
            {facture.numero}
          </Link>
          <span>→</span>
          <span className="text-gray-900">Modifier</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">✏️ Modifier Facture</h1>
        <p className="text-gray-600 mt-1">
          Modification de {facture.numero}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations facture */}
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informations Facture</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro Facture *
              </label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fournisseur *
              </label>
              <input
                type="text"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date Facture *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date Échéance *
              </label>
              <input
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Liste des lignes */}
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Articles ({lignes.length})</h2>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Note:</strong> Une fois le stock généré, les lignes ne pourront plus être modifiées.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Article</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Qté</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">PU HT</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">TVA</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">Total HT</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">Total TTC</th>
                  <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Dépôt</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lignes.map((ligne, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ligne.articleCode}</div>
                      <div className="text-xs text-gray-500">{ligne.articleDescription}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{ligne.quantite}</td>
                    <td className="px-4 py-3 text-right">{ligne.prixUnitaire.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-center">{ligne.tauxTVA}%</td>
                    <td className="px-4 py-3 text-right font-semibold">{ligne.totalHT.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right font-bold">{ligne.totalTTC.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-center text-sm">{ligne.depotDestination}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => supprimerLigne(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right">TOTAL HT:</td>
                  <td className="px-4 py-3 text-right text-lg">{totalHT.toFixed(2)} €</td>
                  <td colSpan={3}></td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right">TVA:</td>
                  <td className="px-4 py-3 text-right text-lg">{totalTVA.toFixed(2)} €</td>
                  <td colSpan={3}></td>
                </tr>
                <tr className="text-blue-600">
                  <td colSpan={4} className="px-4 py-3 text-right">TOTAL TTC:</td>
                  <td className="px-4 py-3 text-right text-2xl">{totalTTC.toFixed(2)} €</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/admin/stock-flotte/factures-fournisseurs/${params.id}`}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {saving ? 'Enregistrement...' : '✓ Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}