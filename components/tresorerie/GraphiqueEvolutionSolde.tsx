'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { EvolutionSolde } from '@/lib/firebase/tresorerie-stats'

interface Props {
  donnees: EvolutionSolde[]
}

export default function GraphiqueEvolutionSolde({ donnees }: Props) {
  // Formatter la date pour l'affichage
  const formatterDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  // Formatter le montant en euros
  const formatterMontant = (value: number) => {
    return `${value.toLocaleString('fr-FR')} €`
  }

  if (!donnees || donnees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Évolution du solde (30 jours)</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    )
  }

  // Déterminer la couleur de la ligne selon si le solde est positif ou négatif
  const dernierSolde = donnees[donnees.length - 1]?.solde || 0
  const couleurLigne = dernierSolde >= 0 ? '#10b981' : '#ef4444'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Évolution du solde (30 jours)</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatterDate}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value: any) => formatterMontant(value)}
              labelFormatter={(label) => formatterDate(label)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="solde" 
              stroke={couleurLigne}
              strokeWidth={2}
              dot={false}
              name="Solde"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Indicateur tendance */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Solde actuel : <span className={`font-semibold ${dernierSolde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatterMontant(dernierSolde)}
          </span>
        </div>
        
        {donnees.length > 1 && (
          <div className="text-gray-600">
            {(() => {
              const premierSolde = donnees[0]?.solde || 0
              const variation = dernierSolde - premierSolde
              const variationPourcent = premierSolde !== 0 
                ? ((variation / Math.abs(premierSolde)) * 100) 
                : 0
              
              return (
                <span className={variation >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {variation >= 0 ? '▲' : '▼'} {Math.abs(variationPourcent).toFixed(1)}% sur 30 jours
                </span>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
