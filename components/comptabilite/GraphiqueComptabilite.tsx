'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts'

interface Props {
  donnees: Array<{
    date: string
    ca: number
    charges: number
  }>
  periode: string
}

export default function GraphiqueComptabilite({ donnees, periode }: Props) {
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
        <h2 className="text-lg font-semibold mb-4">CA vs Charges - {new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Aucune donnée comptable disponible pour cette période
        </div>
      </div>
    )
  }

  // Calculer les totaux
  const totalCA = donnees.reduce((sum, d) => sum + d.ca, 0)
  const totalCharges = donnees.reduce((sum, d) => sum + d.charges, 0)
  const resultat = totalCA - totalCharges
  const margePercentage = totalCA > 0 ? ((resultat / totalCA) * 100) : 0

  // Ajouter une ligne pour la marge
  const donneesAvecMarge = donnees.map(d => ({
    ...d,
    marge: d.ca - d.charges
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">
            CA vs Charges - {new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Évolution quotidienne du chiffre d'affaires et des charges
          </p>
        </div>
        
        {/* Résumé période */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-right">
            <p className="text-sm text-gray-600">CA Total</p>
            <p className="text-lg font-bold text-green-600">
              {totalCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Charges Totales</p>
            <p className="text-lg font-bold text-red-600">
              {totalCharges.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Résultat</p>
            <p className={`text-lg font-bold ${resultat >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {resultat.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className={`text-xs ${resultat >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {resultat >= 0 ? '▲' : '▼'} {Math.abs(margePercentage).toFixed(1)}% marge
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={donneesAvecMarge}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatterDate}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
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
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="circle"
            />
            
            {/* Barres CA et Charges */}
            <Bar 
              dataKey="ca" 
              fill="#10b981" 
              name="Chiffre d'Affaires"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="charges" 
              fill="#ef4444" 
              name="Charges"
              radius={[4, 4, 0, 0]}
            />
            
            {/* Ligne Marge */}
            <Line 
              type="monotone" 
              dataKey="marge" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              name="Marge (CA - Charges)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Indicateurs supplémentaires */}
      <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">CA Moyen / Jour</p>
          <p className="text-lg font-semibold text-gray-900">
            {(totalCA / donnees.length).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Charges Moyennes / Jour</p>
          <p className="text-lg font-semibold text-gray-900">
            {(totalCharges / donnees.length).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Marge Moyenne / Jour</p>
          <p className={`text-lg font-semibold ${resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(resultat / donnees.length).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Ratio Charges/CA</p>
          <p className="text-lg font-semibold text-gray-900">
            {totalCA > 0 ? ((totalCharges / totalCA) * 100).toFixed(1) : '0'}%
          </p>
        </div>
      </div>
    </div>
  )
}
