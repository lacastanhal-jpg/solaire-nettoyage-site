'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { genererPrevisionsReapprovisionnement } from '@/lib/firebase/stock-previsions'
import type { PrevisionReapprovisionnement } from '@/lib/firebase/stock-previsions'

export default function PrevisionsReapprovisionnement() {
  const [loading, setLoading] = useState(true)
  const [previsions, setPrevisions] = useState<PrevisionReapprovisionnement[]>([])
  const [filtreUrgence, setFiltreUrgence] = useState<'tous' | 'critique' | 'urgent' | 'normal'>('tous')

  useEffect(() => {
    loadPrevisions()
  }, [])

  async function loadPrevisions() {
    try {
      setLoading(true)
      const data = await genererPrevisionsReapprovisionnement()
      setPrevisions(data)
    } catch (error) {
      console.error('Erreur chargement prévisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const previsionsFiltered = filtreUrgence === 'tous'
    ? previsions
    : previsions.filter(p => p.urgence === filtreUrgence)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header avec filtres */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Prévisions de Réapprovisionnement
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Basées sur la consommation moyenne des 6 derniers mois
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFiltreUrgence('tous')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              filtreUrgence === 'tous'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous ({previsions.length})
          </button>
          <button
            onClick={() => setFiltreUrgence('critique')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              filtreUrgence === 'critique'
                ? 'bg-red-100 text-red-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Critique ({previsions.filter(p => p.urgence === 'critique').length})
          </button>
          <button
            onClick={() => setFiltreUrgence('urgent')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              filtreUrgence === 'urgent'
                ? 'bg-orange-100 text-orange-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Urgent ({previsions.filter(p => p.urgence === 'urgent').length})
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-600 font-medium">Critiques</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {previsions.filter(p => p.urgence === 'critique').length}
          </p>
          <p className="text-xs text-red-600 mt-1">Stock &lt; minimum</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-xs text-orange-600 font-medium">Urgents</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {previsions.filter(p => p.urgence === 'urgent').length}
          </p>
          <p className="text-xs text-orange-600 mt-1">Rupture &lt; 15j</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium">À surveiller</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {previsions.filter(p => p.urgence === 'normal').length}
          </p>
          <p className="text-xs text-yellow-700 mt-1">Rupture &lt; 30j</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">Coût réappro estimé</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {previsions
              .filter(p => p.urgence === 'critique' || p.urgence === 'urgent')
              .reduce((sum, p) => sum + (p.quantiteSuggereCommande * 0), 0) // Multiplier par prix si disponible
              .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Tableau prévisions */}
      {previsionsFiltered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {filtreUrgence === 'tous' 
              ? '✅ Aucune prévision - Stock OK'
              : `Aucun article ${filtreUrgence}`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Urgence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Stock actuel
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Conso. moy/mois
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Jours restants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date rupture estimée
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Qté suggérée
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previsionsFiltered.map((prevision) => {
                  const urgenceConfig = {
                    critique: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critique', icon: '🔴' },
                    urgent: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Urgent', icon: '🟠' },
                    normal: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Normal', icon: '🟡' },
                    ok: { bg: 'bg-green-100', text: 'text-green-800', label: 'OK', icon: '🟢' }
                  }[prevision.urgence]

                  return (
                    <tr key={prevision.articleId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${urgenceConfig.bg} ${urgenceConfig.text}`}>
                          <span>{urgenceConfig.icon}</span>
                          {urgenceConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{prevision.articleCode}</p>
                          <p className="text-xs text-gray-500">{prevision.articleDescription}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${
                          prevision.stockActuel < prevision.stockMin ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {prevision.stockActuel}
                        </span>
                        <span className="text-xs text-gray-500"> / {prevision.stockMin}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {prevision.consommationMoyenneMensuelle.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${
                          prevision.joursRestantsAvantRupture <= 15 ? 'text-red-600' :
                          prevision.joursRestantsAvantRupture <= 30 ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {prevision.joursRestantsAvantRupture > 999 ? '∞' : prevision.joursRestantsAvantRupture}
                        </span>
                        {prevision.joursRestantsAvantRupture <= 999 && (
                          <span className="text-xs text-gray-500"> jours</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {prevision.joursRestantsAvantRupture <= 999 
                          ? new Date(prevision.dateRuptureEstimee).toLocaleDateString('fr-FR')
                          : 'Stock stable'
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-blue-600">
                          {prevision.quantiteSuggereCommande}
                        </span>
                        <span className="text-xs text-gray-500"> unités</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/stock-flotte/articles/${prevision.articleId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
