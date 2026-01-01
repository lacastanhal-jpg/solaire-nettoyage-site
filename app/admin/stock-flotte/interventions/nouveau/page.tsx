'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAllEquipements, getAllArticlesStock } from '@/lib/firebase'
import { getAffectationsByEquipement } from '@/lib/firebase/stock-affectations'
import type { Equipement, ArticleStock } from '@/lib/types/stock-flotte'
import { db } from '@/lib/firebase/config'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { OPERATEURS } from '@/lib/types/stock-flotte'
import ModalBonCommande from '@/components/ModalBonCommande'

// Types pour la vérification stock
type StatutStock = {
  disponible: boolean
  alerte: boolean
  manquant: number
  stockTotal: number
  message: string
  couleur: 'green' | 'orange' | 'red'
}

export default function NouvelleInterventionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [articles, setArticles] = useState<ArticleStock[]>([])
  const [interventionsEnCours, setInterventionsEnCours] = useState<any[]>([])
  const [showModalBonCommande, setShowModalBonCommande] = useState(false)
  
  const [formData, setFormData] = useState({
    equipementId: searchParams.get('equipementId') || '',
    type: 'curatif' as 'curatif' | 'preventif',
    description: '',
    date: new Date().toISOString().split('T')[0],
    operateur: '',
    coutMainOeuvre: ''
  })

  const [articlesSelectionnes, setArticlesSelectionnes] = useState<Array<{
    articleId: string
    quantite: number
  }>>([])

  const [affectesUniquement, setAffectesUniquement] = useState(false)
  const [articlesAffectesIds, setArticlesAffectesIds] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (formData.equipementId) {
      chargerAffectationsEquipement()
    } else {
      setArticlesAffectesIds([])
    }
  }, [formData.equipementId])

  async function chargerAffectationsEquipement() {
    try {
      const affectations = await getAffectationsByEquipement(formData.equipementId)
      const articleIds = affectations.map(aff => aff.articleId)
      setArticlesAffectesIds(articleIds)
    } catch (error) {
      console.error('Erreur chargement affectations:', error)
      setArticlesAffectesIds([])
    }
  }

  async function loadData() {
    try {
      const [equipementsData, articlesData] = await Promise.all([
        getAllEquipements(),
        getAllArticlesStock()
      ])
      setEquipements(equipementsData)
      setArticles(articlesData.filter(a => a.actif))
      
      // Charger les interventions non terminées pour calculer le stock en cours
      const interventionsQuery = query(
        collection(db, 'interventions_equipement'),
        where('statut', '!=', 'terminee')
      )
      const interventionsSnapshot = await getDocs(interventionsQuery)
      const interventionsData = interventionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setInterventionsEnCours(interventionsData)
    } catch (error) {
      console.error('Erreur chargement:', error)
    }
  }

  // Calculer le stock en cours (réservé dans interventions non finalisées)
  function calculerStockEnCours(articleId: string): { quantite: number; nbInterventions: number } {
    let quantiteTotale = 0
    let nbInterventions = 0
    
    interventionsEnCours.forEach(intervention => {
      if (intervention.articlesConsommes) {
        intervention.articlesConsommes.forEach((art: any) => {
          if (art.articleId === articleId) {
            quantiteTotale += art.quantite || 0
            nbInterventions++
          }
        })
      }
    })
    
    return { quantite: quantiteTotale, nbInterventions }
  }

  // Fonction de vérification du stock disponible
  function verifierStockDisponible(articleId: string, quantiteNecessaire: number): StatutStock {
    const article = articles.find(a => a.id === articleId)
    
    // Gérer quantité invalide
    if (!quantiteNecessaire || quantiteNecessaire < 0 || isNaN(quantiteNecessaire)) {
      quantiteNecessaire = 0
    }
    
    if (!article) {
      return {
        disponible: false,
        alerte: false,
        manquant: quantiteNecessaire,
        stockTotal: 0,
        message: 'Article non trouvé',
        couleur: 'red'
      }
    }

    // Stock réel dans Firebase
    const stockReel = article.stockTotal || 0
    
    // Stock en cours (réservé dans interventions non finalisées)
    const stockEnCours = calculerStockEnCours(articleId)
    
    // Stock disponible = Stock réel - Stock en cours
    const stockDisponible = stockReel - stockEnCours.quantite
    
    // Stock insuffisant
    if (stockDisponible < quantiteNecessaire) {
      return {
        disponible: false,
        alerte: false,
        manquant: quantiteNecessaire - stockDisponible,
        stockTotal: stockReel,
        message: `⚠️ Stock insuffisant ! Manque ${quantiteNecessaire - stockDisponible} unité(s)`,
        couleur: 'red'
      }
    }
    
    // Stock faible
    const stockRestant = stockDisponible - quantiteNecessaire
    if (stockRestant < 5) {
      return {
        disponible: true,
        alerte: true,
        manquant: 0,
        stockTotal: stockReel,
        message: `⚠️ Stock faible : ${stockRestant} unité(s) restantes après prélèvement`,
        couleur: 'orange'
      }
    }
    
    // Stock OK
    return {
      disponible: true,
      alerte: false,
      manquant: 0,
      stockTotal: stockReel,
      message: `✅ Stock disponible : ${stockRestant} unité(s) restantes`,
      couleur: 'green'
    }
  }

  // Filtrer les articles selon le checkbox
  const articlesAffiches = useMemo(() => {
    if (!affectesUniquement || !formData.equipementId) {
      return articles
    }
    return articles.filter(art => articlesAffectesIds.includes(art.id || ''))
  }, [articles, affectesUniquement, articlesAffectesIds, formData.equipementId])

  // Calculer les articles avec problèmes de stock
  const articlesAvecProblemes = useMemo(() => {
    return articlesSelectionnes
      .filter(item => item.articleId && item.quantite > 0)
      .map(item => {
        const article = articles.find(a => a.id === item.articleId)
        const statut = verifierStockDisponible(item.articleId, item.quantite)
        return {
          ...item,
          article,
          statut
        }
      })
      .filter(item => !item.statut.disponible || item.statut.alerte)
  }, [articlesSelectionnes, articles])

  const articlesManquants = articlesAvecProblemes.filter(item => !item.statut.disponible)

  function ajouterArticle() {
    setArticlesSelectionnes([...articlesSelectionnes, { articleId: '', quantite: 1 }])
  }

  function retirerArticle(index: number) {
    setArticlesSelectionnes(articlesSelectionnes.filter((_, i) => i !== index))
  }

  function updateArticle(index: number, field: 'articleId' | 'quantite', value: string | number) {
    const nouveaux = [...articlesSelectionnes]
    
    // Si c'est la quantité, gérer les cas limites
    if (field === 'quantite') {
      const qty = typeof value === 'string' ? parseInt(value) : value
      // Si NaN ou vide, mettre 1 par défaut
      nouveaux[index] = { ...nouveaux[index], quantite: isNaN(qty) ? 1 : Math.max(1, qty) }
    } else {
      // field est 'articleId', donc value est forcément un string
      nouveaux[index] = { ...nouveaux[index], [field]: value as string }
    }
    
    setArticlesSelectionnes(nouveaux)
  }

  function calculerCoutPieces(): number {
    return articlesSelectionnes.reduce((total, item) => {
      const article = articles.find(a => a.id === item.articleId)
      if (!article) return total
      return total + (article.prixUnitaire * item.quantite)
    }, 0)
  }

  function calculerCoutTotal(): number {
    const coutPieces = calculerCoutPieces()
    const coutMO = parseFloat(formData.coutMainOeuvre) || 0
    return coutPieces + coutMO
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.equipementId || !formData.description || !formData.operateur) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires')
      return
    }

    // Vérifier stock avant de créer l'intervention
    if (articlesManquants.length > 0) {
      const confirmation = confirm(
        `⚠️ ATTENTION : ${articlesManquants.length} article(s) en stock insuffisant.\n\n` +
        articlesManquants.map(item => 
          `• ${item.article?.description} : Manque ${item.statut.manquant} unité(s)`
        ).join('\n') +
        '\n\nVoulez-vous quand même créer cette intervention ?\n' +
        '(Les mouvements stock ne seront créés qu\'à la finalisation)'
      )
      
      if (!confirmation) return
    }

    try {
      setLoading(true)

      // Préparer les articles consommés avec prix unitaire
      const articlesAvecPrix = articlesSelectionnes
        .filter(item => item.articleId && item.quantite > 0)
        .map(item => {
          const article = articles.find(a => a.id === item.articleId)
          return {
            articleId: item.articleId,
            quantite: item.quantite,
            prixUnitaire: article?.prixUnitaire || 0
          }
        })

      const interventionData = {
        equipementId: formData.equipementId,
        type: formData.type,
        statut: 'en_cours',
        description: formData.description,
        date: formData.date,
        operateur: formData.operateur,
        coutMainOeuvre: parseFloat(formData.coutMainOeuvre) || 0,
        coutTotal: calculerCoutTotal(),
        articlesConsommes: articlesAvecPrix.length > 0 ? articlesAvecPrix : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Créer l'intervention
      const docRef = await addDoc(collection(db, 'interventions_equipement'), interventionData)

      alert('✅ Intervention créée avec succès !')
      router.push(`/admin/stock-flotte/interventions/${docRef.id}`)
    } catch (error) {
      console.error('Erreur création intervention:', error)
      alert('❌ Erreur lors de la création')
      setLoading(false)
    }
  }

  const coutPieces = calculerCoutPieces()
  const coutTotal = calculerCoutTotal()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/interventions" className="hover:text-gray-900">Interventions</Link>
          <span>→</span>
          <span className="text-gray-900">Nouvelle</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">🔧 Nouvelle Intervention Maintenance</h1>
      </div>

      {/* ALERTE ARTICLES MANQUANTS */}
      {articlesManquants.length > 0 && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">
                ATTENTION - Stock Insuffisant
              </h3>
              <p className="text-red-800 mb-3">
                Les articles suivants n'ont pas assez de stock disponible :
              </p>
              <ul className="space-y-2 mb-4">
                {articlesManquants.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-red-900 font-medium">
                    <span className="text-red-600">•</span>
                    <span>{item.article?.code} - {item.article?.description}</span>
                    <span className="px-2 py-1 bg-red-100 rounded text-sm">
                      Manque {item.statut.manquant} unité(s)
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-red-700 mb-4">
                ⚠️ Stock actuel insuffisant. L'intervention peut être créée mais ne pourra être finalisée qu'après réapprovisionnement.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  onClick={() => setShowModalBonCommande(true)}
                >
                  📝 Créer bon de commande
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-100 font-semibold"
                  onClick={() => {
                    articlesManquants.forEach(item => {
                      const index = articlesSelectionnes.findIndex(a => a.articleId === item.articleId)
                      if (index !== -1) retirerArticle(index)
                    })
                  }}
                >
                  ❌ Retirer articles manquants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTE STOCK FAIBLE */}
      {articlesAvecProblemes.filter(item => item.statut.alerte && item.statut.disponible).length > 0 && (
        <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-1">Stock Faible</h3>
              <p className="text-sm text-orange-800">
                Les articles suivants ont un stock faible après cette intervention :
              </p>
              <ul className="mt-2 space-y-1">
                {articlesAvecProblemes
                  .filter(item => item.statut.alerte && item.statut.disponible)
                  .map((item, idx) => (
                    <li key={idx} className="text-sm text-orange-900">
                      • {item.article?.code} : {item.statut.stockTotal} unité(s) disponible(s)
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type d'intervention */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Type d'intervention</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'curatif' })}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formData.type === 'curatif'
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-300 hover:border-red-400'
              }`}
            >
              <div className="text-3xl mb-2">🔧</div>
              <div className="font-semibold">Curatif</div>
              <div className="text-sm text-gray-600">Panne, réparation</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'preventif' })}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formData.type === 'preventif'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-semibold">Préventif</div>
              <div className="text-sm text-gray-600">Maintenance programmée</div>
            </button>
          </div>
        </div>

        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipement concerné <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.equipementId}
                onChange={(e) => setFormData({ ...formData, equipementId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un équipement</option>
                {equipements.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.type === 'vehicule' 
                      ? `🚛 ${eq.immatriculation} - ${eq.marque} ${eq.modele}`
                      : `🔧 ${eq.nom}`
                    }
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description des travaux <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Décrivez le problème ou les travaux effectués..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Articles consommés */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Articles consommés</h2>
            <button
              type="button"
              onClick={ajouterArticle}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
            >
              + Ajouter un article
            </button>
          </div>

          {formData.equipementId && articlesAffectesIds.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={affectesUniquement}
                  onChange={(e) => setAffectesUniquement(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Afficher uniquement les articles affectés à cet équipement ({articlesAffectesIds.length} article{articlesAffectesIds.length > 1 ? 's' : ''})
                </span>
              </label>
            </div>
          )}

          {articlesSelectionnes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun article consommé</p>
          ) : (
            <div className="space-y-3">
              {articlesSelectionnes.map((item, index) => {
                const article = articles.find(a => a.id === item.articleId)
                const statut = item.articleId ? verifierStockDisponible(item.articleId, item.quantite) : null
                
                return (
                  <div 
                    key={`${item.articleId || 'new'}-${index}-${item.quantite}`}
                    className="p-3 bg-gray-50 rounded-lg border-2" 
                    style={{
                      borderColor: statut?.couleur === 'red' ? '#fca5a5' : 
                                  statut?.couleur === 'orange' ? '#fdba74' :
                                  statut?.couleur === 'green' ? '#86efac' : '#e5e7eb'
                    }}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <select
                          value={item.articleId}
                          onChange={(e) => updateArticle(index, 'articleId', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner un article</option>
                          {articlesAffiches.map(art => (
                            <option key={art.id} value={art.id}>
                              {art.code} - {art.description} (Stock: {art.stockTotal})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="1"
                          value={item.quantite || 1}
                          onChange={(e) => {
                            const val = e.target.value
                            // Permettre le champ vide temporairement
                            if (val === '') {
                              updateArticle(index, 'quantite', 1)
                            } else {
                              updateArticle(index, 'quantite', parseInt(val) || 1)
                            }
                          }}
                          onBlur={(e) => {
                            // Au blur, s'assurer qu'il y a au moins 1
                            if (!e.target.value || parseInt(e.target.value) < 1) {
                              updateArticle(index, 'quantite', 1)
                            }
                          }}
                          placeholder="Qté"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {article && (
                        <div className="w-32 py-2 px-4 bg-white rounded-lg border border-gray-300 text-right">
                          {(article.prixUnitaire * item.quantite).toLocaleString('fr-FR', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          })}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => retirerArticle(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Affichage détaillé du stock */}
                    {item.articleId && article && (
                      <div className="mt-3 space-y-1.5 text-sm bg-white rounded-lg p-3 border border-gray-200">
                        {(() => {
                          const stockReel = article.stockTotal || 0
                          const stockEnCours = calculerStockEnCours(item.articleId)
                          const stockDisponible = stockReel - stockEnCours.quantite
                          const stockRestant = stockDisponible - item.quantite
                          
                          return (
                            <>
                              {/* Stock réel */}
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-medium">📦 Stock réel :</span>
                                <span className="font-semibold">{stockReel} unités</span>
                              </div>
                              
                              {/* Stock en cours */}
                              {stockEnCours.quantite > 0 && (
                                <div className="flex items-center gap-2 text-orange-600">
                                  <span className="font-medium">🔄 En cours :</span>
                                  <span className="font-semibold">
                                    {stockEnCours.quantite} unités
                                    {stockEnCours.nbInterventions > 0 && (
                                      <span className="text-xs ml-1">
                                        ({stockEnCours.nbInterventions} intervention{stockEnCours.nbInterventions > 1 ? 's' : ''})
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              
                              {/* Stock disponible */}
                              <div className={`flex items-center gap-2 font-semibold ${
                                stockDisponible < item.quantite ? 'text-red-700' :
                                stockRestant < 5 ? 'text-orange-700' :
                                'text-green-700'
                              }`}>
                                <span className="font-medium">
                                  {stockDisponible < item.quantite ? '⚠️' : 
                                   stockRestant < 5 ? '⚠️' : '✅'} Disponible :
                                </span>
                                <span>{stockDisponible} unités</span>
                              </div>
                              
                              {/* Message après prélèvement */}
                              {statut && (
                                <div className={`pt-2 border-t border-gray-200 ${
                                  statut.couleur === 'red' ? 'text-red-700' :
                                  statut.couleur === 'orange' ? 'text-orange-700' :
                                  'text-green-700'
                                }`}>
                                  {statut.message}
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {articlesSelectionnes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Coût pièces :</span>
                <span className="font-semibold text-gray-900">
                  {coutPieces.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Coûts */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coûts</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût main d'œuvre (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.coutMainOeuvre}
                onChange={(e) => setFormData({ ...formData, coutMainOeuvre: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coût pièces :</span>
                  <span className="font-medium text-gray-900">
                    {coutPieces.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coût main d'œuvre :</span>
                  <span className="font-medium text-gray-900">
                    {(parseFloat(formData.coutMainOeuvre) || 0).toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span className="text-gray-900">Coût total :</span>
                  <span className="text-blue-600">
                    {coutTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/stock-flotte/interventions"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Création...' : 'Créer l\'intervention'}
          </button>
        </div>
      </form>

      {/* Modal Bon de Commande */}
      {showModalBonCommande && (
        <ModalBonCommande
          articlesManquants={articlesManquants.map(item => ({
            article: item.article!,
            quantiteManquante: item.statut.manquant
          }))}
          onClose={() => setShowModalBonCommande(false)}
          onSuccess={() => {
            setShowModalBonCommande(false)
            alert('✅ Bon de commande créé ! Il est disponible en statut "brouillon".')
          }}
          operateur={formData.operateur || 'Admin'}
        />
      )}
    </div>
  )
}
