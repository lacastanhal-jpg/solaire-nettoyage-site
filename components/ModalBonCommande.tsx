'use client'

import { useState, useEffect } from 'react'
import { 
  createBonCommandeFournisseur,
  genererNumeroBonCommande,
  calculerQuantiteSuggeree,
  type LigneBonCommande
} from '@/lib/firebase/bons-commande-fournisseurs'
import type { ArticleStock } from '@/lib/firebase/stock-articles'

type ArticleManquant = {
  article: ArticleStock
  quantiteManquante: number
}

type ModalBonCommandeProps = {
  articlesManquants: ArticleManquant[]
  onClose: () => void
  onSuccess: () => void
  operateur: string
}

export default function ModalBonCommande({
  articlesManquants,
  onClose,
  onSuccess,
  operateur
}: ModalBonCommandeProps) {
  const [saving, setSaving] = useState(false)
  const [fournisseur, setFournisseur] = useState('')
  const [notes, setNotes] = useState('')
  const [lignes, setLignes] = useState<Array<{
    articleId: string
    articleCode: string
    articleDescription: string
    quantiteManquante: number
    quantiteSuggeree: number
    quantiteCommande: number
    prixUnitaire: number
    stockActuel: number
  }>>([])

  useEffect(() => {
    // Initialiser les lignes avec quantités suggérées
    const lignesInitiales = articlesManquants.map(item => ({
      articleId: item.article.id,
      articleCode: item.article.code,
      articleDescription: item.article.description,
      quantiteManquante: item.quantiteManquante,
      quantiteSuggeree: calculerQuantiteSuggeree(
        item.quantiteManquante,
        item.article.stockTotal || 0
      ),
      quantiteCommande: calculerQuantiteSuggeree(
        item.quantiteManquante,
        item.article.stockTotal || 0
      ),
      prixUnitaire: item.article.prixUnitaire || 0,
      stockActuel: item.article.stockTotal || 0
    }))
    
    setLignes(lignesInitiales)
  }, [articlesManquants])

  function updateQuantite(index: number, quantite: number) {
    const nouvelles = [...lignes]
    nouvelles[index].quantiteCommande = quantite
    setLignes(nouvelles)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fournisseur) {
      alert('⚠️ Veuillez saisir le nom du fournisseur')
      return
    }

    if (!confirm('Créer ce bon de commande ?')) {
      return
    }

    try {
      setSaving(true)

      // Générer le numéro automatiquement
      const numero = await genererNumeroBonCommande()

      // Préparer les lignes
      const lignesBonCommande: LigneBonCommande[] = lignes.map(ligne => ({
        articleId: ligne.articleId,
        articleCode: ligne.articleCode,
        articleDescription: ligne.articleDescription,
        quantiteDemandee: ligne.quantiteManquante,
        quantiteSuggere: ligne.quantiteSuggeree,
        prixUnitaireEstime: ligne.prixUnitaire,
        raisonSuggestion: `Stock insuffisant (${ligne.stockActuel} en stock, besoin de ${ligne.quantiteManquante})`
      }))

      // Calculer le total estimé
      const totalEstime = lignes.reduce(
        (sum, ligne) => sum + (ligne.quantiteCommande * ligne.prixUnitaire),
        0
      )

      // Créer le bon de commande
      await createBonCommandeFournisseur({
        numero,
        fournisseur,
        date: new Date().toISOString().split('T')[0],
        statut: 'brouillon',
        lignes: lignesBonCommande,
        notes,
        totalEstime,
        createdBy: operateur
      })

      alert(`✅ Bon de commande ${numero} créé avec succès !`)
      onSuccess()
    } catch (error) {
      console.error('Erreur création bon de commande:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const totalEstime = lignes.reduce(
    (sum, ligne) => sum + (ligne.quantiteCommande * ligne.prixUnitaire),
    0
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">📝 Bon de Commande Fournisseur</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Informations générales */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Informations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fournisseur *
                </label>
                <input
                  type="text"
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                  placeholder="Nom du fournisseur"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString('fr-FR')}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes ou instructions pour le fournisseur..."
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Articles à commander */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📦 Articles à Commander ({lignes.length})
            </h3>

            <div className="space-y-4">
              {lignes.map((ligne, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Article info */}
                    <div className="md:col-span-2">
                      <div className="font-semibold text-gray-900">{ligne.articleCode}</div>
                      <div className="text-sm text-gray-600">{ligne.articleDescription}</div>
                      <div className="text-xs text-red-600 mt-1">
                        ⚠️ Stock actuel : {ligne.stockActuel} • Manque : {ligne.quantiteManquante}
                      </div>
                    </div>

                    {/* Quantité suggérée */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Suggéré
                      </label>
                      <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-center">
                        {ligne.quantiteSuggeree}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Stock sécurité)
                      </div>
                    </div>

                    {/* Quantité à commander */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        À commander *
                      </label>
                      <input
                        type="number"
                        min={ligne.quantiteManquante}
                        value={ligne.quantiteCommande}
                        onChange={(e) => updateQuantite(index, parseInt(e.target.value) || ligne.quantiteSuggeree)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-center"
                      />
                    </div>

                    {/* Total */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Total estimé
                      </label>
                      <div className="font-bold text-gray-900 text-right">
                        {(ligne.quantiteCommande * ligne.prixUnitaire).toFixed(2)} €
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {ligne.prixUnitaire.toFixed(2)} € / u
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6 border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Estimé :</span>
              <span className="text-2xl font-black text-blue-600">{totalEstime.toFixed(2)} €</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Prix unitaires basés sur les derniers achats
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="text-sm text-yellow-800">
                <strong>Note :</strong> Ce bon de commande sera créé en statut "brouillon". 
                Vous pourrez le modifier, l'envoyer au fournisseur ou le supprimer depuis la liste des bons de commande.
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
            >
              {saving ? 'Création...' : '💾 Créer le Bon de Commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
