'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllEquipements, getAllArticlesStock } from '@/lib/firebase'
import { getAffectationsByEquipement } from '@/lib/firebase/stock-affectations'
import type { Equipement, ArticleStock } from '@/lib/types/stock-flotte'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore'
import { OPERATEURS } from '@/lib/types/stock-flotte'
import ModalBonCommande from '@/components/ModalBonCommande'
import { annulerMouvementsIntervention } from '@/lib/firebase/interventions-gestion-stock'
import { finaliserIntervention } from '@/lib/firebase/stock-interventions'

// Types pour la vérification stock
type StatutStock = {
  disponible: boolean
  alerte: boolean
  manquant: number
  stockTotal: number
  message: string
  couleur: 'green' | 'orange' | 'red'
}

interface InterventionMaintenance {
  id: string
  equipementId: string
  type: 'curatif' | 'preventif'
  statut: 'en_cours' | 'terminee'
  description: string
  date: string
  operateur: string
  coutMainOeuvre: number
  coutTotal: number
  articlesConsommes?: Array<{
    articleId: string
    quantite: number
    prixUnitaire: number
  }>
  createdAt: string
  updatedAt: string
}

export default function ModifierInterventionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [intervention, setIntervention] = useState<InterventionMaintenance | null>(null)
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [articles, setArticles] = useState<ArticleStock[]>([])
  const [interventionsEnCours, setInterventionsEnCours] = useState<any[]>([])
  const [showModalBonCommande, setShowModalBonCommande] = useState(false)
  
  const [formData, setFormData] = useState({
    equipementId: '',
    type: 'curatif' as 'curatif' | 'preventif',
    description: '',
    date: '',
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
  }, [params.id])

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
      const [interventionDoc, equipementsData, articlesData] = await Promise.all([
        getDoc(doc(db, 'interventions_equipement', params.id)),
        getAllEquipements(),
        getAllArticlesStock()
      ])

      if (!interventionDoc.exists()) {
        alert('Intervention non trouvée')
        router.push('/admin/stock-flotte/interventions')
        return
      }

      const interventionData = { id: interventionDoc.id, ...interventionDoc.data() } as InterventionMaintenance
      
      setIntervention(interventionData)
      setEquipements(equipementsData)
      setArticles(articlesData.filter(a => a.actif))

      // Pré-remplir le formulaire
      setFormData({
        equipementId: interventionData.equipementId,
        type: interventionData.type,
        description: interventionData.description,
        date: interventionData.date,
        operateur: interventionData.operateur,
        coutMainOeuvre: interventionData.coutMainOeuvre.toString()
      })

      // Pré-remplir les articles
      if (interventionData.articlesConsommes) {
        setArticlesSelectionnes(interventionData.articlesConsommes.map(item => ({
          articleId: item.articleId,
          quantite: item.quantite
        })))
      }
      
      // Charger les interventions non terminées pour calculer le stock en cours
      const interventionsQuery = query(
        collection(db, 'interventions_equipement'),
        where('statut', '!=', 'terminee')
      )
      const interventionsSnapshot = await getDocs(interventionsQuery)
      const interventionsData = interventionsSnapshot.docs
        .filter(d => d.id !== params.id) // Exclure l'intervention actuelle
        .map(d => ({
          id: d.id,
          ...d.data()
        }))
      setInterventionsEnCours(interventionsData)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
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
    
    // Stock en cours (réservé dans interventions non finalisées, hors celle-ci)
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

  // Calculer les articles avec problèmes
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
    const nouveaux = articlesSelectionnes.filter((_, i) => i !== index)
    setArticlesSelectionnes(nouveaux)
  }

  function updateArticle(index: number, field: 'articleId' | 'quantite', value: string | number) {
    const nouveaux = [...articlesSelectionnes]
    if (field === 'articleId') {
      nouveaux[index].articleId = value as string
    } else {
      // Gérer les cas limites pour la quantité
      const qty = typeof value === 'string' ? parseInt(value) : value
      nouveaux[index].quantite = isNaN(qty) ? 1 : Math.max(1, qty)
    }
    setArticlesSelectionnes(nouveaux)
  }

  function calculerCoutPieces(): number {
    return articlesSelectionnes.reduce((sum, item) => {
      const article = articles.find(a => a.id === item.articleId)
      return sum + (article?.prixUnitaire || 0) * item.quantite
    }, 0)
  }

  function calculerCoutTotal(): number {
    const coutPieces = calculerCoutPieces()
    const coutMainOeuvre = parseFloat(formData.coutMainOeuvre) || 0
    return coutPieces + coutMainOeuvre
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.equipementId || !formData.operateur) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires')
      return
    }

    // Vérification articles manquants
    if (articlesManquants.length > 0) {
      const confirmer = confirm(
        `⚠️ ATTENTION: ${articlesManquants.length} article(s) en stock insuffisant.\n\n` +
        articlesManquants.map(item => 
          `• ${item.article?.code}: Manque ${item.statut.manquant} unité(s)`
        ).join('\n') +
        '\n\nVoulez-vous quand même sauvegarder cette modification?'
      )
      
      if (!confirmer) return
    }

    try {
      setSaving(true)
      
      // ÉTAPE 1 : Si intervention finalisée, annuler les mouvements stock AVANT modification
      const etaitFinalisee = intervention?.statut === 'terminee'
      
      if (etaitFinalisee) {
        console.log('🔄 Intervention finalisée détectée - Annulation des mouvements stock...')
        await annulerMouvementsIntervention(params.id)
        console.log('✅ Mouvements annulés, stock restauré')
      }

      // ÉTAPE 2 : Préparer les nouvelles données
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
        description: formData.description,
        date: formData.date,
        operateur: formData.operateur,
        coutMainOeuvre: parseFloat(formData.coutMainOeuvre) || 0,
        coutTotal: calculerCoutTotal(),
        articlesConsommes: articlesAvecPrix.length > 0 ? articlesAvecPrix : undefined,
        // IMPORTANT: Repasser en "en_cours" pour permettre la re-finalisation
        statut: 'en_cours',
        updatedAt: new Date().toISOString()
      }

      // ÉTAPE 3 : Sauvegarder les modifications
      await updateDoc(doc(db, 'interventions_equipement', params.id), interventionData)
      console.log('✅ Intervention mise à jour')

      // ÉTAPE 4 : Si c'était finalisée, re-finaliser avec les nouveaux articles
      if (etaitFinalisee) {
        console.log('🔄 Re-finalisation avec les nouveaux articles...')
        await finaliserIntervention(params.id)
        console.log('✅ Re-finalisée - Stock débité correctement')
      }

      alert('✅ Intervention modifiée avec succès !')
      router.push(`/admin/stock-flotte/interventions/${params.id}`)
    } catch (error) {
      console.error('Erreur modification:', error)
      alert(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  const equipementSelectionne = equipements.find(e => e.id === formData.equipementId)
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
          <Link href={`/admin/stock-flotte/interventions/${params.id}`} className="hover:text-gray-900">Détail</Link>
          <span>→</span>
          <span className="text-gray-900">Modifier</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">🔧 Modifier Intervention</h1>
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
                ⚠️ Stock actuel insuffisant. La modification peut être sauvegardée mais l'intervention ne pourra être finalisée qu'après réapprovisionnement.
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
                Les articles suivants ont un stock faible après cette modification :
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

      <form onSubmit={handleSubmit}>
        {/* Type d'intervention */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Type d'intervention *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'curatif' })}
              className={`p-4 rounded-lg border-2 transition ${
                formData.type === 'curatif'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🔧</div>
              <div className="font-semibold text-gray-900">Curatif</div>
              <div className="text-xs text-gray-600">Panne, réparation</div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'preventif' })}
              className={`p-4 rounded-lg border-2 transition ${
                formData.type === 'preventif'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-semibold text-gray-900">Préventif</div>
              <div className="text-xs text-gray-600">Maintenance programmée</div>
            </button>
          </div>
        </div>

        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Équipement concerné *
              </label>
              <select
                value={formData.equipementId}
                onChange={(e) => setFormData({ ...formData, equipementId: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un équipement</option>
                {equipements.map(equipement => (
                  <option key={equipement.id} value={equipement.id}>
                    {equipement.numero} - {equipement.marque} {equipement.modele}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opérateur *
              </label>
              <select
                value={formData.operateur}
                onChange={(e) => setFormData({ ...formData, operateur: e.target.value })}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un opérateur</option>
                {OPERATEURS.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coût main d'œuvre (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.coutMainOeuvre}
                onChange={(e) => setFormData({ ...formData, coutMainOeuvre: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description des travaux *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                placeholder="Décrivez l'intervention..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Articles consommés */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📦 Articles consommés</h3>
            <button
              type="button"
              onClick={ajouterArticle}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              ➕ Ajouter un article
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
            <p className="text-gray-500 text-center py-4">Aucun article ajouté</p>
          ) : (
            <div className="space-y-3">
              {articlesSelectionnes.map((item, index) => {
                const statut = item.articleId ? verifierStockDisponible(item.articleId, item.quantite) : null
                const article = articles.find(a => a.id === item.articleId)
                
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
                      <select
                        value={item.articleId}
                        onChange={(e) => updateArticle(index, 'articleId', e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un article</option>
                        {articlesAffiches.map(article => (
                          <option key={article.id} value={article.id}>
                            {article.code} - {article.description} (Stock: {article.stockTotal})
                          </option>
                        ))}
                      </select>
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
                        className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {article && (
                        <div className="font-semibold text-gray-900 py-2">
                          {(article.prixUnitaire * item.quantite).toFixed(2)} €
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

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Coût pièces :</span>
              <span className="font-semibold">{coutPieces.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Coûts */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow p-6 mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Coûts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Coût main d'œuvre (€)</span>
              <input
                type="number"
                step="0.01"
                value={formData.coutMainOeuvre}
                onChange={(e) => setFormData({ ...formData, coutMainOeuvre: e.target.value })}
                placeholder="0.00"
                className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg text-right"
              />
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Coût pièces :</span>
              <span className="font-semibold">{coutPieces.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Coût main d'œuvre :</span>
              <span className="font-semibold">{parseFloat(formData.coutMainOeuvre || '0').toFixed(2)} €</span>
            </div>
            <div className="pt-2 border-t-2 border-blue-300 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">TOTAL :</span>
              <span className="text-2xl font-black text-blue-600">{coutTotal.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Link
            href={`/admin/stock-flotte/interventions/${params.id}`}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {saving ? 'Sauvegarde...' : '💾 Enregistrer les modifications'}
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
