'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllEquipements, getAllArticlesStock } from '@/lib/firebase'
import { 
  supprimerIntervention, 
  annulerFinalisation,
  compterMouvementsIntervention 
} from '@/lib/firebase/interventions-gestion-stock'
import { finaliserIntervention } from '@/lib/firebase/stock-interventions'
import type { Equipement, ArticleStock } from '@/lib/types/stock-flotte'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

interface InterventionMaintenance {
  id: string
  equipementId: string
  equipementNom?: string
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
    depotPrelevement?: string
  }>
  createdAt: string
  updatedAt: string
}

export default function FicheInterventionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [intervention, setIntervention] = useState<InterventionMaintenance | null>(null)
  const [equipement, setEquipement] = useState<Equipement | null>(null)
  const [articles, setArticles] = useState<Record<string, ArticleStock>>({})
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [nombreMouvements, setNombreMouvements] = useState(0)

  useEffect(() => {
    loadIntervention()
  }, [params.id])

  async function loadIntervention() {
    try {
      const interventionDoc = await getDoc(doc(db, 'interventions_equipement', params.id))
      
      if (!interventionDoc.exists()) {
        alert('Intervention non trouvée')
        router.push('/admin/stock-flotte/interventions')
        return
      }

      const interventionData = { 
        id: interventionDoc.id, 
        ...interventionDoc.data() 
      } as InterventionMaintenance
      
      setIntervention(interventionData)

      // Charger tous les équipements et trouver le bon
      if (interventionData.equipementId) {
        try {
          const equipements = await getAllEquipements()
          const eq = equipements.find(e => e.id === interventionData.equipementId)
          setEquipement(eq || null)
        } catch (error) {
          console.error('Erreur chargement équipement:', error)
        }
      }

      // Charger tous les articles et créer le mapping
      if (interventionData.articlesConsommes) {
        try {
          const allArticles = await getAllArticlesStock()
          const articlesData: Record<string, ArticleStock> = {}
          
          for (const item of interventionData.articlesConsommes) {
            const article = allArticles.find(a => a.id === item.articleId)
            if (article) {
              articlesData[item.articleId] = article
            }
          }
          
          setArticles(articlesData)
        } catch (error) {
          console.error('Erreur chargement articles:', error)
        }
      }

      // Compter les mouvements si terminée
      if (interventionData.statut === 'terminee') {
        const count = await compterMouvementsIntervention(params.id)
        setNombreMouvements(count)
      }

    } catch (error) {
      console.error('Erreur chargement intervention:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleFinaliser() {
    if (!intervention) return

    const confirmation = confirm(
      '⚠️ Finaliser cette intervention va :\n\n' +
      '• Débiter le stock des articles utilisés\n' +
      '• Mettre à jour les km/heures de l\'équipement\n' +
      '• Rendre l\'intervention non modifiable\n\n' +
      'Confirmer ?'
    )

    if (!confirmation) return

    try {
      setFinalizing(true)
      await finaliserIntervention(params.id)
      alert('✅ Intervention finalisée avec succès !')
      await loadIntervention()
    } catch (error: any) {
      console.error('Erreur finalisation:', error)
      alert(`❌ Erreur : ${error.message || 'Erreur inconnue'}`)
    } finally {
      setFinalizing(false)
    }
  }

  async function handleAnnulerFinalisation() {
    if (!intervention) return

    const confirmation = confirm(
      '⚠️ Annuler la finalisation va :\n\n' +
      '• Restaurer le stock des articles\n' +
      '• Repasser l\'intervention en "en_cours"\n' +
      '• Permettre la modification\n\n' +
      'Confirmer ?'
    )

    if (!confirmation) return

    try {
      setCanceling(true)
      await annulerFinalisation(params.id)
      alert('✅ Finalisation annulée avec succès !')
      await loadIntervention()
    } catch (error: any) {
      console.error('Erreur annulation:', error)
      alert(`❌ Erreur : ${error.message || 'Erreur inconnue'}`)
    } finally {
      setCanceling(false)
    }
  }

  async function handleSupprimer() {
    if (!intervention) return

    const message = intervention.statut === 'terminee'
      ? '⚠️ ATTENTION : Cette intervention est finalisée.\n\n' +
        'La supprimer va restaurer le stock automatiquement.\n\n' +
        'Confirmer la suppression ?'
      : 'Confirmer la suppression de cette intervention ?'

    const confirmation = confirm(message)
    if (!confirmation) return

    try {
      setDeleting(true)
      await supprimerIntervention(params.id)
      alert('✅ Intervention supprimée avec succès !')
      router.push('/admin/stock-flotte/interventions')
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      alert(`❌ Erreur : ${error.message || 'Erreur inconnue'}`)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!intervention) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600">Intervention non trouvée</div>
        </div>
      </div>
    )
  }

  const afficherNomEquipement = () => {
    if (!equipement) return 'Équipement non trouvé'
    
    if (equipement.type === 'vehicule') {
      const immat = equipement.immatriculation || equipement.numero || ''
      const marque = equipement.marque || ''
      const modele = equipement.modele || ''
      return `${immat} - ${marque} ${modele}`.trim()
    } else {
      return equipement.nom || equipement.description || 'Équipement sans nom'
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/interventions" className="hover:text-gray-900">Interventions</Link>
          <span>→</span>
          <span className="text-gray-900">Détail</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Fiche Intervention</h1>
          <div className="flex gap-3">
            {intervention.statut === 'terminee' ? (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                ✅ En cours
              </span>
            ) : (
              <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-semibold">
                🔄 En cours
              </span>
            )}
            <span className={`px-4 py-2 rounded-lg font-semibold ${
              intervention.type === 'curatif' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {intervention.type === 'curatif' ? '🔧 Curatif' : '⚙️ Préventif'}
            </span>
          </div>
        </div>
      </div>

      {/* Informations générales */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Informations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Équipement</div>
            <div className="font-semibold text-gray-900">
              {afficherNomEquipement()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Date</div>
            <div className="font-semibold text-gray-900">{new Date(intervention.date).toLocaleDateString('fr-FR')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Opérateur</div>
            <div className="font-semibold text-gray-900">{intervention.operateur}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Créée le</div>
            <div className="font-semibold text-gray-900">{new Date(intervention.createdAt).toLocaleDateString('fr-FR')}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-gray-600 mb-1">Description</div>
            <div className="text-gray-900 bg-gray-50 p-3 rounded">
              {intervention.description}
            </div>
          </div>
        </div>
      </div>

      {/* Articles consommés */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Articles consommés</h3>
        
        {!intervention.articlesConsommes || intervention.articlesConsommes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun article consommé</p>
        ) : (
          <div className="space-y-3">
            {intervention.articlesConsommes.map((item, index) => {
              const article = articles[item.articleId]
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {article ? article.description : item.articleId}
                    </div>
                    {article && (
                      <div className="text-sm text-gray-600">
                        {article.code} • {item.prixUnitaire.toFixed(2)} € / unité
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      Quantité : {item.quantite}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total : {(item.quantite * item.prixUnitaire).toFixed(2)} €
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Coûts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Coûts</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Coût pièces :</span>
            <span className="font-semibold">
              {(intervention.articlesConsommes?.reduce(
                (sum, item) => sum + (item.quantite * item.prixUnitaire), 
                0
              ) || 0).toFixed(2)} €
            </span>
          </div>
          
          <div className="flex justify-between text-gray-700">
            <span>Coût main d'œuvre :</span>
            <span className="font-semibold">{intervention.coutMainOeuvre.toFixed(2)} €</span>
          </div>
          
          <div className="pt-3 border-t border-gray-300 flex justify-between text-lg font-bold">
            <span className="text-gray-900">TOTAL :</span>
            <span className="text-blue-600">{intervention.coutTotal.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Link
          href="/admin/stock-flotte/interventions"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
        >
          Retour
        </Link>

        {intervention.statut === 'en_cours' && (
          <>
            <Link
              href={`/admin/stock-flotte/interventions/${params.id}/modifier`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Modifier
            </Link>
            <button
              onClick={handleFinaliser}
              disabled={finalizing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
            >
              {finalizing ? 'Finalisation...' : 'Finaliser'}
            </button>
          </>
        )}

        {intervention.statut === 'terminee' && (
          <button
            onClick={handleAnnulerFinalisation}
            disabled={canceling}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold disabled:bg-gray-400"
          >
            {canceling ? 'Annulation...' : 'Annuler finalisation'}
          </button>
        )}

        <button
          onClick={handleSupprimer}
          disabled={deleting}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:bg-gray-400"
        >
          {deleting ? 'Suppression...' : 'Supprimer'}
        </button>
      </div>

      {/* Info mouvements */}
      {intervention.statut === 'terminee' && nombreMouvements > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          {nombreMouvements} mouvement(s) stock créé(s)
        </div>
      )}
    </div>
  )
}
