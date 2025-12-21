'use client'

import { useState } from 'react'
import { Calendar, AlertCircle, Check, Clock, TrendingDown } from 'lucide-react'
import { Projet } from '@/lib/gely/types'

interface CalendrierFinancierProps {
  projets: Projet[]
}

interface EcheanceComplete {
  id: string
  projetId: string
  projetNom: string
  date: string
  description: string
  montant: number
  statut: 'a_venir' | 'payee' | 'retard'
  joursRestants: number
}

export default function CalendrierFinancier({ projets }: CalendrierFinancierProps) {
  const [filtre, setFiltre] = useState<'all' | 'a_venir' | 'payee' | 'retard'>('all')

  const formatNumber = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')

  // Collecter toutes les échéances de tous les projets
  const toutesEcheances: EcheanceComplete[] = []
  projets.forEach(projet => {
    if (projet.echeancesCritiques) {
      projet.echeancesCritiques.forEach(ech => {
        const dateEch = new Date(ech.date)
        const aujourdhui = new Date()
        const joursRestants = Math.ceil((dateEch.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24))
        
        toutesEcheances.push({
          id: ech.id,
          projetId: projet.id,
          projetNom: projet.nom,
          date: ech.date,
          description: ech.description,
          montant: ech.montant,
          statut: ech.statut,
          joursRestants
        })
      })
    }
  })

  // Trier par date
  toutesEcheances.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Filtrer
  const echeancesFiltrees = filtre === 'all' 
    ? toutesEcheances 
    : toutesEcheances.filter(e => e.statut === filtre)

  // Calculer totaux
  const totalAVenir = toutesEcheances
    .filter(e => e.statut === 'a_venir')
    .reduce((sum, e) => sum + e.montant, 0)
  
  const totalPayes = toutesEcheances
    .filter(e => e.statut === 'payee')
    .reduce((sum, e) => sum + e.montant, 0)

  const totalRetard = toutesEcheances
    .filter(e => e.statut === 'retard')
    .reduce((sum, e) => sum + e.montant, 0)

  // Échéances urgentes (< 7 jours)
  const echeancesUrgentes = toutesEcheances.filter(e => 
    e.statut === 'a_venir' && e.joursRestants <= 7 && e.joursRestants >= 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl shadow-xl p-8">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-400 p-3 rounded-xl">
            <Calendar className="w-12 h-12 text-purple-900" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">Calendrier Financier</h2>
            <p className="text-purple-100 text-lg">Toutes vos échéances en un coup d'œil</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
          <p className="text-sm text-black font-bold mb-1">À venir</p>
          <p className="text-3xl font-bold text-yellow-700">{formatNumber(totalAVenir)} €</p>
          <p className="text-xs text-black font-semibold mt-1">
            {toutesEcheances.filter(e => e.statut === 'a_venir').length} échéance(s)
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <p className="text-sm text-black font-bold mb-1">Payé</p>
          <p className="text-3xl font-bold text-green-700">{formatNumber(totalPayes)} €</p>
          <p className="text-xs text-black font-semibold mt-1">
            {toutesEcheances.filter(e => e.statut === 'payee').length} échéance(s)
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
          <p className="text-sm text-black font-bold mb-1">En retard</p>
          <p className="text-3xl font-bold text-red-700">{formatNumber(totalRetard)} €</p>
          <p className="text-xs text-black font-semibold mt-1">
            {toutesEcheances.filter(e => e.statut === 'retard').length} échéance(s)
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <p className="text-sm text-black font-bold mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-700">
            {formatNumber(totalAVenir + totalPayes + totalRetard)} €
          </p>
          <p className="text-xs text-black font-semibold mt-1">{toutesEcheances.length} échéance(s)</p>
        </div>
      </div>

      {/* Alertes urgentes */}
      {echeancesUrgentes.length > 0 && (
        <div className="bg-red-100 border-4 border-red-600 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-red-700 mb-4 flex items-center animate-pulse">
            <AlertCircle className="w-6 h-6 mr-2" />
            🚨 ÉCHÉANCES URGENTES (≤ 7 jours)
          </h3>
          <div className="space-y-3">
            {echeancesUrgentes.map(ech => (
              <div key={ech.id} className="bg-red-200 p-4 rounded-lg border-2 border-red-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-red-900 mb-1">{ech.projetNom}</p>
                    <p className="text-lg font-bold text-black">{ech.description}</p>
                    <p className="text-sm font-bold text-red-800 mt-1">
                      ⏰ {ech.joursRestants === 0 ? "AUJOURD'HUI" : 
                         ech.joursRestants === 1 ? "DEMAIN" : 
                         `Dans ${ech.joursRestants} jours`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black">{formatDate(ech.date)}</p>
                    <p className="text-2xl font-bold text-red-700">{formatNumber(ech.montant)} €</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border-4 border-black rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltre('all')}
            className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
              filtre === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-black'
            }`}
          >
            📋 Toutes ({toutesEcheances.length})
          </button>
          <button
            onClick={() => setFiltre('a_venir')}
            className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
              filtre === 'a_venir' ? 'bg-yellow-500 text-black' : 'bg-white text-black'
            }`}
          >
            ⏳ À venir ({toutesEcheances.filter(e => e.statut === 'a_venir').length})
          </button>
          <button
            onClick={() => setFiltre('payee')}
            className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
              filtre === 'payee' ? 'bg-green-600 text-white' : 'bg-white text-black'
            }`}
          >
            ✅ Payées ({toutesEcheances.filter(e => e.statut === 'payee').length})
          </button>
          <button
            onClick={() => setFiltre('retard')}
            className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
              filtre === 'retard' ? 'bg-red-600 text-white' : 'bg-white text-black'
            }`}
          >
            ⚠️ En retard ({toutesEcheances.filter(e => e.statut === 'retard').length})
          </button>
        </div>
      </div>

      {/* Liste échéances */}
      <div className="space-y-3">
        {echeancesFiltrees.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-400">Aucune échéance dans ce filtre</p>
          </div>
        ) : (
          echeancesFiltrees.map(ech => {
            const isUrgent = ech.statut === 'a_venir' && ech.joursRestants <= 7 && ech.joursRestants >= 0
            const isPasse = ech.joursRestants < 0 && ech.statut === 'a_venir'
            
            let bgColor = 'bg-white'
            let borderColor = 'border-gray-300'
            
            if (ech.statut === 'payee') {
              bgColor = 'bg-green-50'
              borderColor = 'border-green-500'
            } else if (ech.statut === 'retard' || isPasse) {
              bgColor = 'bg-red-50'
              borderColor = 'border-red-600'
            } else if (isUrgent) {
              bgColor = 'bg-yellow-50'
              borderColor = 'border-yellow-500'
            }

            return (
              <div key={ech.id} className={`${bgColor} border-4 ${borderColor} rounded-lg p-4`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {ech.statut === 'payee' && <Check className="w-5 h-5 text-green-700" />}
                      {ech.statut === 'a_venir' && <Clock className="w-5 h-5 text-yellow-700" />}
                      {ech.statut === 'retard' && <AlertCircle className="w-5 h-5 text-red-700" />}
                      <span className="text-xs font-bold text-black bg-gray-200 px-2 py-1 rounded">
                        {ech.projetNom}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-black">{ech.description}</p>
                    {ech.statut === 'a_venir' && (
                      <p className="text-sm font-bold text-black mt-1">
                        {isUrgent && '🚨 '}
                        {ech.joursRestants === 0 ? "⏰ AUJOURD'HUI" : 
                         ech.joursRestants === 1 ? "⏰ DEMAIN" :
                         ech.joursRestants < 0 ? `⚠️ Retard de ${Math.abs(ech.joursRestants)} jour(s)` :
                         `⏳ Dans ${ech.joursRestants} jour(s)`}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-black">{formatDate(ech.date)}</p>
                    <p className="text-2xl font-bold text-black">{formatNumber(ech.montant)} €</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      ech.statut === 'payee' ? 'bg-green-200 text-green-800' :
                      ech.statut === 'retard' ? 'bg-red-700 text-white' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {ech.statut === 'payee' ? '✅ Payée' : 
                       ech.statut === 'retard' ? '⚠️ Retard' : 
                       '⏳ À venir'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
