'use client'

import { Building2, TrendingUp, DollarSign, Percent, Users, Zap } from 'lucide-react'
import { Projet } from '@/lib/gely/types'

interface DashboardGroupeProps {
  projets: Projet[]
}

const SOCIETES_LABELS: Record<string, string> = {
  sciGely: 'SCI GELY',
  lexa: 'LEXA',
  lexa2: 'LEXA 2',
  solaireNettoyage: 'SOLAIRE NETTOYAGE'
}

const SOCIETES_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  sciGely: { bg: 'bg-purple-100', border: 'border-purple-600', text: 'text-purple-700' },
  lexa: { bg: 'bg-blue-100', border: 'border-blue-600', text: 'text-blue-700' },
  lexa2: { bg: 'bg-green-100', border: 'border-green-600', text: 'text-green-700' },
  solaireNettoyage: { bg: 'bg-yellow-100', border: 'border-yellow-600', text: 'text-yellow-700' }
}

export default function DashboardGroupe({ projets }: DashboardGroupeProps) {
  const formatNumber = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

  // Calculs globaux
  const totalBudget = projets.reduce((sum, p) => sum + p.budgetTotal, 0)
  const totalPaye = projets.reduce((sum, p) => sum + p.totalPaye, 0)
  const totalAPayer = projets.reduce((sum, p) => sum + p.totalAPayer, 0)
  const totalReste = projets.reduce((sum, p) => sum + p.reste, 0)
  const pourcentageRealisation = totalBudget > 0 ? ((totalPaye / totalBudget) * 100).toFixed(1) : 0

  // Production PV totale
  const totalPuissance = projets.reduce((sum, p) => sum + (p.puissanceKWc || 0), 0)
  const totalRevenus = projets.reduce((sum, p) => sum + (p.revenusAnnuels || 0), 0)

  // Par société
  const parSociete = projets.reduce((acc, p) => {
    if (!acc[p.societe]) {
      acc[p.societe] = {
        nbProjets: 0,
        budget: 0,
        paye: 0,
        aPayer: 0,
        reste: 0,
        puissance: 0,
        revenus: 0
      }
    }
    acc[p.societe].nbProjets++
    acc[p.societe].budget += p.budgetTotal
    acc[p.societe].paye += p.totalPaye
    acc[p.societe].aPayer += p.totalAPayer
    acc[p.societe].reste += p.reste
    acc[p.societe].puissance += p.puissanceKWc || 0
    acc[p.societe].revenus += p.revenusAnnuels || 0
    return acc
  }, {} as Record<string, any>)

  // Répartition actionnaires (holding)
  const axelPart = totalBudget * 0.781
  const jeromePart = totalBudget * 0.219

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-400 p-3 rounded-xl">
              <Building2 className="w-12 h-12 text-blue-900" />
            </div>
            <div>
              <h2 className="text-4xl font-bold">GROUPE GELY</h2>
              <p className="text-blue-100 text-lg">Vue consolidée de tous les projets</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Total projets</p>
            <p className="text-5xl font-bold">{projets.length}</p>
          </div>
        </div>
      </div>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span className="text-xs font-bold text-blue-600">BUDGET</span>
          </div>
          <p className="text-3xl font-bold text-black">{formatNumber(totalBudget)} €</p>
          <p className="text-xs text-black font-semibold mt-1">Budget total engagé</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-xs font-bold text-green-600">PAYÉ</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{formatNumber(totalPaye)} €</p>
          <p className="text-xs text-black font-semibold mt-1">{pourcentageRealisation}% réalisé</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-600">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <span className="text-xs font-bold text-yellow-600">À PAYER</span>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{formatNumber(totalAPayer)} €</p>
          <p className="text-xs text-black font-semibold mt-1">Factures en attente</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-xs font-bold text-purple-600">RESTE</span>
          </div>
          <p className="text-3xl font-bold text-purple-700">{formatNumber(totalReste)} €</p>
          <p className="text-xs text-black font-semibold mt-1">Budget disponible</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 border-t-4 border-yellow-700">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-yellow-900" />
            <span className="text-xs font-bold text-yellow-900">REVENUS PV</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{formatNumber(totalRevenus)} €</p>
          <p className="text-xs text-yellow-900 font-semibold mt-1">{formatNumber(totalPuissance)} kWc installés</p>
        </div>
      </div>

      {/* Répartition actionnaires */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-xl p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          RÉPARTITION GELY INVESTISSEMENT HOLDING
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold">Axel GELY</p>
                <p className="text-xs">657 842 actions</p>
              </div>
              <span className="text-3xl font-bold">78,1%</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-bold">Budget:</span> {formatNumber(axelPart)} €</p>
              <p className="text-sm"><span className="font-bold">Payé:</span> {formatNumber(totalPaye * 0.781)} €</p>
              <p className="text-sm"><span className="font-bold">Reste:</span> {formatNumber(totalReste * 0.781)} €</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold">Jérôme GELY</p>
                <p className="text-xs">184 355 actions</p>
              </div>
              <span className="text-3xl font-bold">21,9%</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm"><span className="font-bold">Budget:</span> {formatNumber(jeromePart)} €</p>
              <p className="text-sm"><span className="font-bold">Payé:</span> {formatNumber(totalPaye * 0.219)} €</p>
              <p className="text-sm"><span className="font-bold">Reste:</span> {formatNumber(totalReste * 0.219)} €</p>
            </div>
          </div>
        </div>
      </div>

      {/* Par société */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-black">DÉTAIL PAR SOCIÉTÉ</h3>
        {Object.entries(parSociete).map(([societe, data]: [string, any]) => {
          const colors = SOCIETES_COLORS[societe]
          const pourcentage = data.budget > 0 ? ((data.paye / data.budget) * 100).toFixed(1) : 0
          
          return (
            <div 
              key={societe} 
              className={`${colors.bg} border-4 ${colors.border} rounded-lg p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className={`w-8 h-8 ${colors.text}`} />
                  <div>
                    <h4 className="text-2xl font-bold text-black">{SOCIETES_LABELS[societe]}</h4>
                    <p className="text-sm font-semibold text-black">{data.nbProjets} projet(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${colors.text}`}>{pourcentage}%</p>
                  <p className="text-xs font-bold text-black">réalisé</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-xs font-bold text-black">Budget</p>
                  <p className="text-xl font-bold text-black">{formatNumber(data.budget)} €</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-xs font-bold text-black">Payé</p>
                  <p className="text-xl font-bold text-green-700">{formatNumber(data.paye)} €</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-xs font-bold text-black">À payer</p>
                  <p className="text-xl font-bold text-yellow-700">{formatNumber(data.aPayer)} €</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-black">
                  <p className="text-xs font-bold text-black">Reste</p>
                  <p className="text-xl font-bold text-blue-700">{formatNumber(data.reste)} €</p>
                </div>
              </div>

              {data.puissance > 0 && (
                <div className="mt-4 bg-yellow-200 p-4 rounded-lg border-2 border-yellow-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-700" />
                      <span className="text-sm font-bold text-black">Production PV</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-700">{formatNumber(data.puissance)} kWc</p>
                      <p className="text-sm font-bold text-black">{formatNumber(data.revenus)} €/an</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Graphique progression */}
      <div className="bg-white border-4 border-black rounded-lg p-6">
        <h3 className="text-2xl font-bold text-black mb-4">PROGRESSION GLOBALE</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-black mb-1">
            <span>Payé</span>
            <span>{pourcentageRealisation}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 border-2 border-black">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${pourcentageRealisation}%` }}
            >
              <span className="text-white font-bold text-sm">{formatNumber(totalPaye)} €</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm font-bold text-black mb-1 mt-4">
            <span>À payer</span>
            <span>{totalBudget > 0 ? ((totalAPayer / totalBudget) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 border-2 border-black">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${totalBudget > 0 ? (totalAPayer / totalBudget) * 100 : 0}%` }}
            >
              <span className="text-white font-bold text-sm">{formatNumber(totalAPayer)} €</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-black mb-1 mt-4">
            <span>Reste budget</span>
            <span>{totalBudget > 0 ? ((totalReste / totalBudget) * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 border-2 border-black">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2"
              style={{ width: `${totalBudget > 0 ? (totalReste / totalBudget) * 100 : 0}%` }}
            >
              <span className="text-white font-bold text-sm">{formatNumber(totalReste)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
