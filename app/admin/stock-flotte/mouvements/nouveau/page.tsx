'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createMouvementStock, getAllArticlesStock, getAllEquipements } from '@/lib/firebase'
import type { ArticleStock, Equipement } from '@/lib/types/stock-flotte'
import { DEPOTS, OPERATEURS } from '@/lib/types/stock-flotte'

function NouveauMouvementForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [articles, setArticles] = useState<ArticleStock[]>([])
  const [equipements, setEquipements] = useState<Equipement[]>([])
  
  const [formData, setFormData] = useState({
    type: (searchParams.get('type') || 'entree') as 'entree' | 'sortie' | 'transfert' | 'ajustement',
    articleId: searchParams.get('articleId') || '',
    quantite: '',
    depotSource: '',
    depotDestination: '',
    operateur: '',
    raison: '',
    equipementId: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [articlesData, equipementsData] = await Promise.all([
        getAllArticlesStock(),
        getAllEquipements()
      ])
      setArticles(articlesData.filter(a => a.actif))
      setEquipements(equipementsData)
    } catch (error) {
      console.error('Erreur chargement:', error)
    }
  }

  function getArticleStock(articleId: string, depot: string): number {
    const article = articles.find(a => a.id === articleId)
    if (!article) return 0
    return article.stockParDepot[depot] || 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validations selon le type
    if (!formData.articleId || !formData.quantite || !formData.operateur) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const quantite = parseInt(formData.quantite)
    if (quantite <= 0) {
      alert('La quantité doit être supérieure à 0')
      return
    }

    // Validations spécifiques par type
    if (formData.type === 'entree' && !formData.depotDestination) {
      alert('Veuillez sélectionner un dépôt de destination')
      return
    }

    if (formData.type === 'sortie') {
      if (!formData.depotSource) {
        alert('Veuillez sélectionner un dépôt d\'origine')
        return
      }
      // Vérifier stock suffisant
      const stockDispo = getArticleStock(formData.articleId, formData.depotSource)
      if (quantite > stockDispo) {
        alert(`Stock insuffisant ! Disponible: ${stockDispo}`)
        return
      }
    }

    if (formData.type === 'transfert') {
      if (!formData.depotSource || !formData.depotDestination) {
        alert('Veuillez sélectionner les dépôts d\'origine et de destination')
        return
      }
      if (formData.depotSource === formData.depotDestination) {
        alert('Les dépôts d\'origine et de destination doivent être différents')
        return
      }
      // Vérifier stock suffisant
      const stockDispo = getArticleStock(formData.articleId, formData.depotSource)
      if (quantite > stockDispo) {
        alert(`Stock insuffisant ! Disponible: ${stockDispo}`)
        return
      }
    }

    try {
      setLoading(true)

      await createMouvementStock({
        type: formData.type,
        articleId: formData.articleId,
        quantite,
        date: new Date().toISOString(),
        raison: formData.raison || 'Mouvement manuel',
        depotSource: formData.depotSource || undefined,
        depotDestination: formData.depotDestination || undefined,
        operateur: formData.operateur,
        equipementId: formData.equipementId || undefined,
        notes: formData.notes || undefined
      })

      alert('Mouvement enregistré avec succès !')
      router.push('/admin/stock-flotte/mouvements')
    } catch (error) {
      console.error('Erreur création mouvement:', error)
      alert('Erreur lors de l\'enregistrement du mouvement')
      setLoading(false)
    }
  }

  const selectedArticle = articles.find(a => a.id === formData.articleId)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/mouvements" className="hover:text-gray-900">Mouvements</Link>
          <span>→</span>
          <span className="text-gray-900">Nouveau</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau Mouvement Stock</h1>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de mouvement */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de mouvement</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'entree', depotSource: '', depotDestination: '' })}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formData.type === 'entree'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              <div className="text-3xl mb-2">📥</div>
              <div className="font-semibold">Entrée</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'sortie', depotSource: '', depotDestination: '' })}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formData.type === 'sortie'
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-300 hover:border-red-400'
              }`}
            >
              <div className="text-3xl mb-2">📤</div>
              <div className="font-semibold">Sortie</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'transfert', depotSource: '', depotDestination: '' })}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formData.type === 'transfert'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-semibold">Transfert</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'ajustement', depotSource: '', depotDestination: '' })}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formData.type === 'ajustement'
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400'
              }`}
            >
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-semibold">Ajustement</div>
            </button>
          </div>
        </div>

        {/* Informations article */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Article concerné</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Article */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.articleId}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un article</option>
                {articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.code} - {article.description} (Stock total: {article.stockTotal})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Opérateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opérateur <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.operateur}
                onChange={(e) => setFormData({ ...formData, operateur: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un opérateur</option>
                {OPERATEURS.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock actuel par dépôt */}
          {selectedArticle && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Stock actuel par dépôt :</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(selectedArticle.stockParDepot).map(([depot, stock]) => (
                  <div key={depot} className="text-sm">
                    <span className="text-gray-600">{depot}:</span>{' '}
                    <span className="font-semibold text-gray-900">{stock}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dépôts (selon le type) */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dépôt(s)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entrée : Destination uniquement */}
            {formData.type === 'entree' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dépôt de destination <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.depotDestination}
                  onChange={(e) => setFormData({ ...formData, depotDestination: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un dépôt</option>
                  {DEPOTS.map(depot => (
                    <option key={depot} value={depot}>{depot}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sortie : Origine uniquement */}
            {formData.type === 'sortie' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dépôt d'origine <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.depotSource}
                  onChange={(e) => setFormData({ ...formData, depotSource: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un dépôt</option>
                  {DEPOTS.map(depot => (
                    <option key={depot} value={depot}>
                      {depot}
                      {selectedArticle && ` (Stock: ${getArticleStock(formData.articleId, depot)})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Transfert : Origine ET Destination */}
            {formData.type === 'transfert' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dépôt d'origine <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.depotSource}
                    onChange={(e) => setFormData({ ...formData, depotSource: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {DEPOTS.map(depot => (
                      <option key={depot} value={depot} disabled={depot === formData.depotDestination}>
                        {depot}
                        {selectedArticle && ` (Stock: ${getArticleStock(formData.articleId, depot)})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dépôt de destination <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.depotDestination}
                    onChange={(e) => setFormData({ ...formData, depotDestination: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {DEPOTS.map(depot => (
                      <option key={depot} value={depot} disabled={depot === formData.depotSource}>
                        {depot}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Ajustement : Destination uniquement */}
            {formData.type === 'ajustement' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dépôt à ajuster <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.depotDestination}
                  onChange={(e) => setFormData({ ...formData, depotDestination: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un dépôt</option>
                  {DEPOTS.map(depot => (
                    <option key={depot} value={depot}>
                      {depot}
                      {selectedArticle && ` (Stock actuel: ${getArticleStock(formData.articleId, depot)})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  La quantité saisie deviendra le nouveau stock dans ce dépôt
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Détails complémentaires */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails complémentaires</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Motif */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif / Commentaire
              </label>
              <textarea
                value={formData.raison}
                onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
                rows={3}
                placeholder="Raison du mouvement, détails..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Équipement (pour sorties) */}
            {formData.type === 'sortie' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Équipement concerné (optionnel)
                </label>
                <select
                  value={formData.equipementId}
                  onChange={(e) => setFormData({ ...formData, equipementId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun</option>
                  {equipements.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.immatriculation || eq.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes supplémentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/stock-flotte/mouvements"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer le mouvement'}
          </button>
        </div>
      </form>
    </div>
}

export default function NouveauMouvementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    }>
      <NouveauMouvementForm />
    </Suspense>
  )
}
