'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { type FactureFournisseurInput, type LigneFactureFournisseur, type ArticleStock } from '@/lib/types/stock-flotte'
import { 
  createFactureFournisseur
} from '@/lib/firebase/stock-factures-fournisseurs'
import { getAllArticlesStock } from '@/lib/firebase/stock-articles'

export default function NouvelleFactureFournisseurPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [articles, setArticles] = useState<ArticleStock[]>([])
  
  const [formData, setFormData] = useState({
    numero: '',
    fournisseur: '',
    date: new Date().toISOString().split('T')[0],
    dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  })

  const [lignes, setLignes] = useState<LigneFactureFournisseur[]>([])
  
  const [nouvelleLigne, setNouvelleLigne] = useState({
    articleId: '',
    quantite: 1,
    prixUnitaire: 0,
    tauxTVA: 20,
    depotDestination: 'Atelier' as 'Atelier' | 'Porteur 26 T' | 'Porteur 32 T' | 'Semi Remorque'
  })

  useEffect(() => {
    chargerArticles()
  }, [])

  async function chargerArticles() {
    try {
      const data = await getAllArticlesStock()
      setArticles(data)
    } catch (error) {
      console.error('Erreur chargement articles:', error)
    }
  }

  function ajouterLigne() {
    if (!nouvelleLigne.articleId) {
      alert('⚠️ Veuillez sélectionner un article')
      return
    }

    const article = articles.find(a => a.id === nouvelleLigne.articleId)
    if (!article) return

    const totalHT = nouvelleLigne.quantite * nouvelleLigne.prixUnitaire
    const totalTVA = totalHT * (nouvelleLigne.tauxTVA / 100)
    const totalTTC = totalHT + totalTVA

    const ligne: LigneFactureFournisseur = {
      articleId: article.id,
      code: article.code,
      description: article.description,
      articleCode: article.code,
      articleDescription: article.description,
      quantite: nouvelleLigne.quantite,
      prixUnitaire: nouvelleLigne.prixUnitaire,
      totalHT,
      tauxTVA: nouvelleLigne.tauxTVA,
      totalTVA,
      totalTTC,
      depotDestination: nouvelleLigne.depotDestination
    }

    setLignes([...lignes, ligne])
    
    setNouvelleLigne({
      articleId: '',
      quantite: 1,
      prixUnitaire: 0,
      tauxTVA: 20,
      depotDestination: 'Atelier'
    })
  }

  function supprimerLigne(index: number) {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.numero || !formData.fournisseur) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires')
      return
    }

    if (lignes.length === 0) {
      alert('⚠️ Veuillez ajouter au moins une ligne d\'article')
      return
    }

    if (!confirm('Créer cette facture fournisseur ?')) {
      return
    }

    try {
      setSaving(true)

      const data: FactureFournisseurInput = {
        numero: formData.numero,
        fournisseur: formData.fournisseur,
        date: formData.date,
        dateEcheance: formData.dateEcheance,
        lignes,
        notes: formData.notes,
        documentUrl: ''
      }

      const id = await createFactureFournisseur(data)
      
      alert('✅ Facture créée avec succès !')
      router.push(`/admin/stock-flotte/factures-fournisseurs/${id}`)
    } catch (error) {
      console.error('Erreur création facture:', error)
      alert('❌ Erreur lors de la création de la facture')
    } finally {
      setSaving(false)
    }
  }

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
          <span className="text-gray-900">Nouvelle</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">📄 Nouvelle Facture Fournisseur</h1>
        <p className="text-gray-600 mt-1">
          Créer une facture d'achat d'articles stock
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
                placeholder="F2024-001"
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
                placeholder="Nom du fournisseur"
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
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes ou remarques sur cette facture..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Ajouter une ligne */}
        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">➕ Ajouter un Article</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article
              </label>
              <select
                value={nouvelleLigne.articleId}
                onChange={(e) => {
                  const article = articles.find(a => a.id === e.target.value)
                  setNouvelleLigne({
                    ...nouvelleLigne,
                    articleId: e.target.value,
                    prixUnitaire: article?.prixUnitaire || 0
                  })
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                {articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.code} - {article.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                min="1"
                value={nouvelleLigne.quantite}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, quantite: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prix HT
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={nouvelleLigne.prixUnitaire}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, prixUnitaire: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                TVA (%)
              </label>
              <select
                value={nouvelleLigne.tauxTVA}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, tauxTVA: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="20">20%</option>
                <option value="10">10%</option>
                <option value="5.5">5.5%</option>
                <option value="0">0%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dépôt
              </label>
              <select
                value={nouvelleLigne.depotDestination}
                onChange={(e) => setNouvelleLigne({ ...nouvelleLigne, depotDestination: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Atelier">Atelier</option>
                <option value="Porteur 26 T">Porteur 26 T</option>
                <option value="Porteur 32 T">Porteur 32 T</option>
                <option value="Semi Remorque">Semi Remorque</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={ajouterLigne}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            ➕ Ajouter cette ligne
          </button>
        </div>

        {/* Liste des lignes */}
        {lignes.length > 0 && (
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Articles ({lignes.length})</h2>
            
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
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{ligne.totalTTC.toFixed(2)} €</td>
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
        )}

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/stock-flotte/factures-fournisseurs"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving || lignes.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
          >
            {saving ? 'Création...' : '✓ Créer la Facture'}
          </button>
        </div>
      </form>
    </div>
  )
}