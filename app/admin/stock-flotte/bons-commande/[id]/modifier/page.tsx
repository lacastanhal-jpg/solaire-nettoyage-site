'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getBonCommandeById,
  updateBonCommande,
  calculerQuantiteSuggeree,
  type LigneBonCommande,
  type BonCommandeFournisseur
} from '@/lib/firebase/bons-commande-fournisseurs'
import { getAllFournisseurs, type Fournisseur } from '@/lib/firebase/fournisseurs'
import { getAllArticlesStock, type ArticleStock } from '@/lib/firebase/stock-articles'
import { Plus, Trash2, AlertCircle, Save, Calculator, ArrowLeft } from 'lucide-react'

export default function ModifierBonCommandePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  // Données de référence
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([])
  const [articles, setArticles] = useState<ArticleStock[]>([])
  const [articlesFiltres, setArticlesFiltres] = useState<ArticleStock[]>([])
  const [bonOriginal, setBonOriginal] = useState<BonCommandeFournisseur | null>(null)
  
  // Formulaire
  const [numero, setNumero] = useState('')
  const [fournisseurId, setFournisseurId] = useState('')
  const [date, setDate] = useState('')
  const [statut, setStatut] = useState<'brouillon' | 'envoye' | 'recu' | 'annule'>('brouillon')
  const [notes, setNotes] = useState('')
  const [lignes, setLignes] = useState<LigneBonCommande[]>([])
  
  // UI
  const [searchArticle, setSearchArticle] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [modeCalculAuto, setModeCalculAuto] = useState(false)
  const [modificationsPendantes, setModificationsPendantes] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    // Filtrer articles selon recherche
    if (searchArticle.length >= 2) {
      const filtered = articles.filter(a => 
        a.code.toLowerCase().includes(searchArticle.toLowerCase()) ||
        a.description.toLowerCase().includes(searchArticle.toLowerCase())
      )
      setArticlesFiltres(filtered)
      setShowSuggestions(true)
    } else {
      setArticlesFiltres([])
      setShowSuggestions(false)
    }
  }, [searchArticle, articles])

  useEffect(() => {
    // Détecter modifications
    if (bonOriginal) {
      const aChange = 
        numero !== bonOriginal.numero ||
        date !== bonOriginal.date ||
        statut !== bonOriginal.statut ||
        notes !== bonOriginal.notes ||
        JSON.stringify(lignes) !== JSON.stringify(bonOriginal.lignes)
      
      setModificationsPendantes(aChange)
    }
  }, [numero, date, statut, notes, lignes, bonOriginal])

  async function loadData() {
    try {
      setLoadingData(true)
      
      // Charger le bon de commande
      const bonData = await getBonCommandeById(id)
      if (!bonData) {
        alert('❌ Bon de commande introuvable')
        router.push('/admin/stock-flotte/bons-commande')
        return
      }

      // Vérifier si modifiable
      if (bonData.statut !== 'brouillon') {
        if (!confirm(`⚠️ Ce bon de commande est en statut "${bonData.statut}".\n\nSeuls les brouillons peuvent être modifiés.\n\nVoulez-vous le consulter en lecture seule ?`)) {
          router.push('/admin/stock-flotte/bons-commande')
          return
        }
        router.push(`/admin/stock-flotte/bons-commande/${id}`)
        return
      }

      setBonOriginal(bonData)
      setNumero(bonData.numero)
      setDate(bonData.date)
      setStatut(bonData.statut)
      setNotes(bonData.notes || '')
      setLignes(bonData.lignes)

      // Charger fournisseurs et articles
      const [fournisseursData, articlesData] = await Promise.all([
        getAllFournisseurs(),
        getAllArticlesStock()
      ])
      
      setFournisseurs(fournisseursData.filter(f => f.actif))
      setArticles(articlesData.filter(a => a.actif))

      // Trouver le fournisseur correspondant
      const fournisseur = fournisseursData.find(f => f.nom === bonData.fournisseur)
      if (fournisseur) {
        setFournisseurId(fournisseur.id)
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
      alert('❌ Erreur lors du chargement')
      router.push('/admin/stock-flotte/bons-commande')
    } finally {
      setLoadingData(false)
    }
  }

  function ajouterArticle(article: ArticleStock) {
    // Vérifier si déjà dans la liste
    const existe = lignes.find(l => l.articleId === article.id)
    if (existe) {
      alert('⚠️ Cet article est déjà dans le bon de commande')
      return
    }

    // Calculer quantité suggérée intelligente
    const stockActuel = article.stockTotal
    const stockMin = article.stockMin || 10
    const quantiteManquante = Math.max(0, stockMin - stockActuel)
    
    const quantiteSuggeree = modeCalculAuto && quantiteManquante > 0
      ? calculerQuantiteSuggeree(quantiteManquante, stockActuel)
      : 1

    const nouvelleLigne: LigneBonCommande = {
      articleId: article.id,
      articleCode: article.code,
      articleDescription: article.description,
      quantiteDemandee: quantiteSuggeree,
      quantiteSuggere: quantiteSuggeree,
      prixUnitaireEstime: article.prixUnitaire,
      raisonSuggestion: quantiteManquante > 0
        ? `Stock actuel (${stockActuel}) sous le minimum (${stockMin}). Manque ${quantiteManquante} unités.`
        : `Réapprovisionnement standard`
    }

    setLignes([...lignes, nouvelleLigne])
    setSearchArticle('')
    setShowSuggestions(false)
  }

  function supprimerLigne(index: number) {
    if (!confirm('Supprimer cet article du bon de commande ?')) return
    setLignes(lignes.filter((_, i) => i !== index))
  }

  function modifierQuantite(index: number, quantite: number) {
    if (quantite < 1) return
    const nouvellesLignes = [...lignes]
    nouvellesLignes[index].quantiteDemandee = quantite
    setLignes(nouvellesLignes)
  }

  function modifierPrix(index: number, prix: number) {
    if (prix < 0) return
    const nouvellesLignes = [...lignes]
    nouvellesLignes[index].prixUnitaireEstime = prix
    setLignes(nouvellesLignes)
  }

  function recalculerQuantitesIntelligentes() {
    const nouvellesLignes = lignes.map(ligne => {
      const article = articles.find(a => a.id === ligne.articleId)
      if (!article) return ligne

      const stockActuel = article.stockTotal
      const stockMin = article.stockMin || 10
      const quantiteManquante = Math.max(0, stockMin - stockActuel)
      
      const quantiteSuggeree = quantiteManquante > 0
        ? calculerQuantiteSuggeree(quantiteManquante, stockActuel)
        : ligne.quantiteDemandee

      return {
        ...ligne,
        quantiteSuggere: quantiteSuggeree,
        quantiteDemandee: quantiteSuggeree,
        raisonSuggestion: quantiteManquante > 0
          ? `Stock actuel (${stockActuel}) sous le minimum (${stockMin}). Manque ${quantiteManquante} unités.`
          : `Réapprovisionnement standard`
      }
    })
    
    setLignes(nouvellesLignes)
    alert('✅ Quantités recalculées intelligemment !')
  }

  const totalEstime = lignes.reduce((sum, ligne) => 
    sum + (ligne.quantiteDemandee * ligne.prixUnitaireEstime), 0
  )

  const fournisseurSelectionne = fournisseurs.find(f => f.id === fournisseurId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validation
    if (!fournisseurId) {
      alert('⚠️ Veuillez sélectionner un fournisseur')
      return
    }
    if (lignes.length === 0) {
      alert('⚠️ Veuillez ajouter au moins un article')
      return
    }

    if (!confirm(`Enregistrer les modifications ?\n\nBon de commande: ${numero}\nFournisseur: ${fournisseurSelectionne?.nom}\nMontant: ${totalEstime.toFixed(2)} €`)) {
      return
    }

    try {
      setLoading(true)

      const updateData = {
        numero,
        fournisseur: fournisseurSelectionne!.nom,
        date,
        statut,
        lignes,
        notes,
        totalEstime,
        createdBy: bonOriginal!.createdBy
      }

      await updateBonCommande(id, updateData)
      
      alert('✅ Bon de commande modifié avec succès !')
      router.push(`/admin/stock-flotte/bons-commande/${id}`)
    } catch (error) {
      console.error('Erreur modification bon de commande:', error)
      alert('❌ Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  function handleAnnuler() {
    if (modificationsPendantes) {
      if (!confirm('⚠️ Vous avez des modifications non enregistrées.\n\nVoulez-vous vraiment annuler ?')) {
        return
      }
    }
    router.push(`/admin/stock-flotte/bons-commande/${id}`)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/bons-commande" className="hover:text-gray-900">Bons de Commande</Link>
          <span>→</span>
          <Link href={`/admin/stock-flotte/bons-commande/${id}`} className="hover:text-gray-900">{numero}</Link>
          <span>→</span>
          <span className="text-gray-900">Modifier</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">✏️ Modifier le Bon de Commande</h1>
          {modificationsPendantes && (
            <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Modifications non enregistrées
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📋 Informations Générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Numéro */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro *
              </label>
              <input
                type="text"
                value={numero}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-mono font-bold bg-gray-100"
                disabled
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Statut *
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as 'brouillon' | 'envoye')}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold"
                required
              >
                <option value="brouillon">📝 Brouillon</option>
                <option value="envoye">📧 Envoyé</option>
              </select>
            </div>
          </div>

          {/* Fournisseur */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fournisseur * {fournisseurSelectionne && (
                <span className="ml-2 text-blue-600">
                  📧 {fournisseurSelectionne.email} | 📞 {fournisseurSelectionne.telephone}
                </span>
              )}
            </label>
            <select
              value={fournisseurId}
              onChange={(e) => setFournisseurId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-semibold"
              required
            >
              <option value="">Sélectionner un fournisseur...</option>
              {fournisseurs.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes / Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Informations complémentaires pour le fournisseur..."
            />
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📦 Articles ({lignes.length})
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={recalculerQuantitesIntelligentes}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm flex items-center gap-2"
                disabled={lignes.length === 0}
              >
                <Calculator className="w-4 h-4" />
                Recalculer
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                <input
                  type="checkbox"
                  checked={modeCalculAuto}
                  onChange={(e) => setModeCalculAuto(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-700">Calcul Auto</span>
              </label>
            </div>
          </div>

          {/* Recherche Article */}
          <div className="mb-4 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ajouter un article
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
                placeholder="🔍 Rechercher par code ou description..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg"
              />
              
              {/* Suggestions */}
              {showSuggestions && articlesFiltres.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  {articlesFiltres.map(article => {
                    const stockActuel = article.stockTotal
                    const stockMin = article.stockMin || 10
                    const enRupture = stockActuel < stockMin
                    
                    return (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => ajouterArticle(article)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">{article.code}</div>
                            <div className="text-sm text-gray-600">{article.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {article.fournisseur} • {article.prixUnitaire.toFixed(2)} €/unité
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-sm font-semibold ${enRupture ? 'text-red-600' : 'text-green-600'}`}>
                              Stock: {stockActuel}
                            </div>
                            {enRupture && (
                              <div className="text-xs text-red-600 font-semibold">
                                ⚠️ Sous minimum ({stockMin})
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Liste Articles */}
          {lignes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600">Aucun article</p>
              <p className="text-sm text-gray-500 mt-2">Ajoutez des articles ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lignes.map((ligne, index) => (
                <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-start gap-4">
                    {/* Info Article */}
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg">{ligne.articleCode}</div>
                      <div className="text-gray-600">{ligne.articleDescription}</div>
                      {ligne.raisonSuggestion && (
                        <div className="text-xs text-blue-600 mt-1 italic flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{ligne.raisonSuggestion}</span>
                        </div>
                      )}
                    </div>

                    {/* Quantité */}
                    <div className="w-32">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité</label>
                      <input
                        type="number"
                        value={ligne.quantiteDemandee}
                        onChange={(e) => modifierQuantite(index, parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 text-center font-bold text-lg"
                      />
                    </div>

                    {/* Prix Unitaire */}
                    <div className="w-32">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Prix Unit. (€)</label>
                      <input
                        type="number"
                        value={ligne.prixUnitaireEstime}
                        onChange={(e) => modifierPrix(index, parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 text-center font-bold"
                      />
                    </div>

                    {/* Total Ligne */}
                    <div className="w-32 text-right">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Total (€)</label>
                      <div className="text-xl font-bold text-blue-600">
                        {(ligne.quantiteDemandee * ligne.prixUnitaireEstime).toFixed(2)}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => supprimerLigne(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg border-2 border-blue-300 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">💰 Total Estimé</h3>
              <p className="text-sm text-gray-600">
                {lignes.length} article(s) • {lignes.reduce((sum, l) => sum + l.quantiteDemandee, 0)} unité(s)
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {totalEstime.toFixed(2)} €
              </div>
              <div className="text-sm text-gray-600 mt-1">HT</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || lignes.length === 0 || !modificationsPendantes}
            className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>⏳ Enregistrement en cours...</>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer les Modifications
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleAnnuler}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold text-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
