'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticleStock } from '@/lib/firebase'
import type { MouvementStock, ArticleStock } from '@/lib/types/stock-flotte'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default function FicheMouvementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mouvement, setMouvement] = useState<MouvementStock | null>(null)
  const [article, setArticle] = useState<ArticleStock | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMouvement()
  }, [params.id])

  async function loadMouvement() {
    try {
      // Charger le mouvement
      const mvtDoc = await getDoc(doc(db, 'mouvements_stock', params.id))
      if (!mvtDoc.exists()) {
        alert('Mouvement non trouvé')
        router.push('/admin/stock-flotte/mouvements')
        return
      }

      const mvtData = { id: mvtDoc.id, ...mvtDoc.data() } as MouvementStock
      setMouvement(mvtData)

      // Charger l'article associé
      const articleData = await getArticleStock(mvtData.articleId)
      setArticle(articleData)
    } catch (error) {
      console.error('Erreur chargement mouvement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
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

  if (!mouvement) return null

  function getTypeIcon(type: string) {
    switch(type) {
      case 'entree': return '📥'
      case 'sortie': return '📤'
      case 'transfert': return '🔄'
      case 'ajustement': return '⚙️'
      default: return '📦'
    }
  }

  function getTypeLabel(type: string) {
    switch(type) {
      case 'entree': return 'Entrée stock'
      case 'sortie': return 'Sortie stock'
      case 'transfert': return 'Transfert'
      case 'ajustement': return 'Ajustement'
      default: return type
    }
  }

  function getTypeColor(type: string) {
    switch(type) {
      case 'entree': return 'bg-green-100 text-green-800 border-green-300'
      case 'sortie': return 'bg-red-100 text-red-800 border-red-300'
      case 'transfert': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'ajustement': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/mouvements" className="hover:text-gray-900">Mouvements</Link>
          <span>→</span>
          <span className="text-gray-900">Détail</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {getTypeIcon(mouvement.type)} {getTypeLabel(mouvement.type)}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getTypeColor(mouvement.type)}`}>
                {getTypeLabel(mouvement.type)}
              </span>
            </div>
            <p className="text-gray-600">
              {new Date(mouvement.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Article concerné</h2>
            
            {article ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/admin/stock-flotte/articles/${article.id}`}
                      className="text-xl font-bold text-blue-600 hover:text-blue-800"
                    >
                      {article.code}
                    </Link>
                    <p className="text-gray-700 mt-1">{article.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Prix unitaire</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {article.prixUnitaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Stock actuel par dépôt :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(article.stockParDepot).map(([depot, stock]) => (
                      <div key={depot} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">{depot}</span>
                        <span className="text-sm font-semibold text-gray-900">{stock}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Fournisseur</div>
                  <div className="font-medium text-gray-900">{article.fournisseur}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Article non trouvé</p>
            )}
          </div>

          {/* Détails du mouvement */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du mouvement</h2>
            
            <div className="space-y-4">
              {/* Dépôts */}
              <div className="grid grid-cols-2 gap-4">
                {mouvement.depotSource && (
                  <div>
                    <div className="text-sm text-gray-600">Dépôt d'origine</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {mouvement.depotSource}
                    </div>
                  </div>
                )}
                
                {mouvement.depotDestination && (
                  <div>
                    <div className="text-sm text-gray-600">Dépôt de destination</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {mouvement.depotDestination}
                    </div>
                  </div>
                )}
              </div>

              {/* Opérateur */}
              <div>
                <div className="text-sm text-gray-600">Opérateur</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {mouvement.operateur}
                </div>
              </div>

              {/* Motif */}
              {mouvement.raison && (
                <div>
                  <div className="text-sm text-gray-600">Motif / Commentaire</div>
                  <div className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                    {mouvement.raison}
                  </div>
                </div>
              )}

              {/* Équipement */}
              {mouvement.equipementId && (
                <div>
                  <div className="text-sm text-gray-600">Équipement concerné</div>
                  <Link
                    href={`/admin/stock-flotte/equipements/${mouvement.equipementId}`}
                    className="text-blue-600 hover:text-blue-800 font-medium mt-1 inline-block"
                  >
                    Voir l'équipement →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Valeur */}
          {article && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Valeur du mouvement</h2>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">
                    {mouvement.quantite} unités × {article.prixUnitaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {(mouvement.quantite * article.prixUnitaire).toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite - Informations rapides */}
        <div className="space-y-6">
          {/* Quantité */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Quantité</p>
            <p className={`text-4xl font-bold ${
              mouvement.type === 'entree' ? 'text-green-600' : 
              mouvement.type === 'sortie' ? 'text-red-600' : 
              'text-blue-600'
            }`}>
              {mouvement.type === 'entree' ? '+' : mouvement.type === 'sortie' ? '-' : ''}{mouvement.quantite}
            </p>
          </div>

          {/* Date et heure */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Informations système</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Date du mouvement</p>
                <p className="text-gray-900 font-medium">
                  {new Date(mouvement.date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-gray-500 text-xs">
                  {new Date(mouvement.date).toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Créé le</p>
                <p className="text-gray-900">
                  {new Date(mouvement.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              {article && (
                <Link
                  href={`/admin/stock-flotte/articles/${article.id}`}
                  className="block w-full px-4 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                >
                  Voir l'article
                </Link>
              )}
              <Link
                href="/admin/stock-flotte/mouvements"
                className="block w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
