'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getEvolutionStockArticle } from '@/lib/firebase/stock-previsions'
import { getArticleStockById } from '@/lib/firebase/stock-articles'

interface GraphiqueEvolutionStockProps {
  articleId: string
  nombreMois?: number
}

export default function GraphiqueEvolutionStock({ 
  articleId,
  nombreMois = 6
}: GraphiqueEvolutionStockProps) {
  const [loading, setLoading] = useState(true)
  const [donnees, setDonnees] = useState<any[]>([])
  const [stockMin, setStockMin] = useState<number>(0)
  const [articleCode, setArticleCode] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [articleId, nombreMois])

  async function loadData() {
    try {
      setLoading(true)
      
      // Récupérer infos article
      const article = await getArticleStockById(articleId)
      if (!article) return
      
      setStockMin(article.stockMin)
      setArticleCode(article.code)
      
      // Récupérer évolution
      const evolution = await getEvolutionStockArticle(articleId, nombreMois)
      
      // Formatter pour le graphique
      const donneesFormatees = evolution.map(d => ({
        mois: formatMois(d.mois),
        stock: d.stock,
        stockMin: article.stockMin
      }))
      
      setDonnees(donneesFormatees)
    } catch (error) {
      console.error('Erreur chargement évolution stock:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatMois(mois: string): string {
    const [annee, moisNum] = mois.split('-')
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    return `${moisNoms[parseInt(moisNum) - 1]} ${annee.substring(2)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (donnees.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        Aucune donnée d'évolution
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Évolution stock : {articleCode}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Stock minimum : {stockMin} unités
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={donnees}>
          <defs>
            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="mois" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ 
              value: 'Stock (unités)', 
              angle: -90, 
              position: 'insideLeft', 
              style: { fontSize: '12px', fill: '#6b7280' } 
            }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => [`${value} unités`, 'Stock']}
          />
          
          {/* Ligne stock minimum */}
          <ReferenceLine 
            y={stockMin} 
            stroke="#ef4444" 
            strokeDasharray="5 5"
            label={{ 
              value: 'Stock min', 
              position: 'right',
              fill: '#ef4444',
              fontSize: 11
            }}
          />
          
          <Area
            type="monotone"
            dataKey="stock"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStock)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Stock actuel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500"></div>
          <span>Stock minimum</span>
        </div>
      </div>
    </div>
  )
}
