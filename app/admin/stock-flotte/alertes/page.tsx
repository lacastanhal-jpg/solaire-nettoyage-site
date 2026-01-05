'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getArticlesEnAlerte,
  getAllEquipements,
  getAllInterventionsMaintenance
} from '@/lib/firebase'
import type { ArticleStock } from '@/lib/firebase/stock-articles'
import type { Equipement } from '@/lib/types/stock-flotte'

interface AlerteEquipement {
  id: string
  equipementId: string
  equipementImmat: string
  type: 'VGP' | 'CT' | 'Maintenance' | 'Assurance'
  dateEcheance: string
  joursRestants: number
  statut: 'ok' | 'alerte' | 'urgent' | 'expire'
  description: string
}

export default function AlertesPage() {
  const [loading, setLoading] = useState(true)
  const [articlesAlerte, setArticlesAlerte] = useState<ArticleStock[]>([])
  const [alertesEquipements, setAlertesEquipements] = useState<AlerteEquipement[]>([])

  useEffect(() => {
    loadAlertes()
  }, [])

  async function loadAlertes() {
    try {
      setLoading(true)
      
      // 1. Articles stock bas
      const articles = await getArticlesEnAlerte()
      setArticlesAlerte(articles)

      // 2. Alertes équipements (CT, VGP, maintenance)
      const equipements = await getAllEquipements()
      const interventions = await getAllInterventionsMaintenance()
      
      const alertes: AlerteEquipement[] = []
      const aujourdhui = new Date()

      for (const equipement of equipements) {
        // Alerte Contrôle Technique
        if ((equipement as any).dateProchainCT || (equipement as any).dateControleTechnique) {
          const dateCT = new Date((equipement as any).dateProchainCT || (equipement as any).dateControleTechnique!)
          const joursRestants = Math.ceil((dateCT.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24))
          
          let statut: 'ok' | 'alerte' | 'urgent' | 'expire' = 'ok'
          if (joursRestants < 0) statut = 'expire'
          else if (joursRestants <= 15) statut = 'urgent'
          else if (joursRestants <= 30) statut = 'alerte'

          if (statut !== 'ok') {
            alertes.push({
              id: `ct-${equipement.id}`,
              equipementId: equipement.id,
              equipementImmat: (equipement as any).immatriculation || (equipement as any).numero || 'N/A',
              type: 'CT',
              dateEcheance: dateCT.toISOString(),
              joursRestants,
              statut,
              description: `Contrôle technique ${statut === 'expire' ? 'EXPIRÉ' : 'à passer'}`
            })
          }
        }

        // Alerte VGP (si champ existe)
        if ((equipement as any).vgpExpiration) {
          const dateVGP = new Date((equipement as any).vgpExpiration)
          const joursRestants = Math.ceil((dateVGP.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24))
          
          let statut: 'ok' | 'alerte' | 'urgent' | 'expire' = 'ok'
          if (joursRestants < 0) statut = 'expire'
          else if (joursRestants <= 15) statut = 'urgent'
          else if (joursRestants <= 30) statut = 'alerte'

          if (statut !== 'ok') {
            alertes.push({
              id: `vgp-${equipement.id}`,
              equipementId: equipement.id,
              equipementImmat: (equipement as any).immatriculation || (equipement as any).numero || 'N/A',
              type: 'VGP',
              dateEcheance: dateVGP.toISOString(),
              joursRestants,
              statut,
              description: `VGP ${statut === 'expire' ? 'EXPIRÉE' : 'à renouveler'}`
            })
          }
        }

        // Alerte Maintenance (basé sur dernière intervention + 10 000 km ou 6 mois)
        const interventionsEquipement = interventions.filter(i => i.equipementId === equipement.id)
        if (interventionsEquipement.length > 0) {
          // Trier par date décroissante
          interventionsEquipement.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          const derniereIntervention = interventionsEquipement[0]
          
          // Si dernière intervention il y a > 6 mois ou > 10 000 km
          const dateDerniere = new Date(derniereIntervention.date)
          const moisDepuis = (aujourdhui.getTime() - dateDerniere.getTime()) / (1000 * 60 * 60 * 24 * 30)
          const kmDepuis = ((equipement as any).km || 0) - (derniereIntervention.km || 0)

          if (moisDepuis > 6 || kmDepuis > 10000) {
            alertes.push({
              id: `maint-${equipement.id}`,
              equipementId: equipement.id,
              equipementImmat: (equipement as any).immatriculation || (equipement as any).numero || 'N/A',
              type: 'Maintenance',
              dateEcheance: new Date(dateDerniere.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
              joursRestants: Math.ceil(-moisDepuis * 30),
              statut: moisDepuis > 8 || kmDepuis > 12000 ? 'urgent' : 'alerte',
              description: `Maintenance retardée (${Math.round(moisDepuis)} mois / ${kmDepuis} km)`
            })
          }
        } else if ((equipement as any).km && (equipement as any).km > 10000) {
          // Pas d'intervention enregistrée mais KM élevé
          alertes.push({
            id: `maint-${equipement.id}`,
            equipementId: equipement.id,
            equipementImmat: (equipement as any).immatriculation || (equipement as any).numero || 'N/A',
            type: 'Maintenance',
            dateEcheance: aujourdhui.toISOString(),
            joursRestants: 0,
            statut: 'urgent',
            description: `Aucune maintenance enregistrée (${(equipement as any).km} km)`
          })
        }
      }

      // Trier par urgence
      alertes.sort((a, b) => {
        const ordre = { expire: 0, urgent: 1, alerte: 2, ok: 3 }
        return ordre[a.statut] - ordre[b.statut]
      })

      setAlertesEquipements(alertes)
    } catch (error) {
      console.error('Erreur chargement alertes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    )
  }

  const alertesUrgentes = alertesEquipements.filter(a => a.statut === 'expire' || a.statut === 'urgent')
  const alertesAttention = alertesEquipements.filter(a => a.statut === 'alerte')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alertes</h1>
        <p className="text-gray-600 mt-2">Stock, Maintenance, VGP, Contrôle Technique</p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">URGENT</p>
              <p className="text-3xl font-bold text-red-700 mt-1">
                {alertesUrgentes.length + articlesAlerte.filter(a => a.stockTotal === 0).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">ATTENTION</p>
              <p className="text-3xl font-bold text-yellow-700 mt-1">
                {alertesAttention.length + articlesAlerte.filter(a => a.stockTotal > 0).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">TOTAL ALERTES</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {alertesEquipements.length + articlesAlerte.length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes URGENTES */}
      {(alertesUrgentes.length > 0 || articlesAlerte.some(a => a.stockTotal === 0)) && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-red-700">🔴 URGENT - Action Immédiate Requise</h2>
          </div>

          <div className="space-y-3">
            {/* Stock épuisé */}
            {articlesAlerte.filter(a => a.stockTotal === 0).map(article => (
              <div key={article.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded font-medium bg-red-600 text-white">
                      STOCK ÉPUISÉ
                    </span>
                    <p className="font-bold text-gray-900">{article.code}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Stock: 0 / Minimum: {article.stockMin}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link 
                    href={`/admin/stock-flotte/bons-commande?article=${article.id}`}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Créer BC
                  </Link>
                  <Link 
                    href={`/admin/stock-flotte/articles/${article.id}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}

            {/* Équipements urgents */}
            {alertesUrgentes.map(alerte => (
              <div key={alerte.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded font-medium bg-red-600 text-white">
                      {alerte.type}
                    </span>
                    <p className="font-bold text-gray-900">{alerte.equipementImmat}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alerte.description}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {alerte.statut === 'expire' 
                      ? `EXPIRÉ depuis ${Math.abs(alerte.joursRestants)} jours` 
                      : `Expire dans ${alerte.joursRestants} jours`}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {alerte.type === 'Maintenance' && (
                    <Link 
                      href={`/admin/stock-flotte/interventions/nouveau?equipement=${alerte.equipementId}`}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Programmer
                    </Link>
                  )}
                  <Link 
                    href={`/admin/stock-flotte/equipements/${alerte.equipementId}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertes ATTENTION */}
      {(alertesAttention.length > 0 || articlesAlerte.some(a => a.stockTotal > 0)) && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-yellow-700">🟡 ATTENTION - À Surveiller</h2>
          </div>

          <div className="space-y-3">
            {/* Stock bas */}
            {articlesAlerte.filter(a => a.stockTotal > 0).map(article => (
              <div key={article.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded font-medium bg-yellow-600 text-white">
                      STOCK BAS
                    </span>
                    <p className="font-medium text-gray-900">{article.code}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Stock: {article.stockTotal} / Minimum: {article.stockMin}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link 
                    href={`/admin/stock-flotte/bons-commande?article=${article.id}`}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                  >
                    Créer BC
                  </Link>
                  <Link 
                    href={`/admin/stock-flotte/articles/${article.id}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}

            {/* Équipements attention */}
            {alertesAttention.map(alerte => (
              <div key={alerte.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded font-medium bg-yellow-600 text-white">
                      {alerte.type}
                    </span>
                    <p className="font-medium text-gray-900">{alerte.equipementImmat}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alerte.description}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Dans {alerte.joursRestants} jours
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {alerte.type === 'Maintenance' && (
                    <Link 
                      href={`/admin/stock-flotte/interventions/nouveau?equipement=${alerte.equipementId}`}
                      className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Programmer
                    </Link>
                  )}
                  <Link 
                    href={`/admin/stock-flotte/equipements/${alerte.equipementId}`}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aucune alerte */}
      {alertesEquipements.length === 0 && articlesAlerte.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-green-200">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Aucune Alerte</h2>
          <p className="text-gray-600">
            Stock, maintenances, VGP et contrôles techniques sont à jour.
          </p>
        </div>
      )}
    </div>
  )
}
