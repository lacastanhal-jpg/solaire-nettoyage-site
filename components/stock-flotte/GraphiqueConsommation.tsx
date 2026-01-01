'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getStatistiquesConsommationParMois } from '@/lib/firebase/stock-previsions'
import type { StatistiquesConsommation } from '@/lib/firebase/stock-previsions'

interface GraphiqueConsommationProps {
  nombreMois?: number
  articleId?: string
}

export default function GraphiqueConsommation({ 
  nombreMois = 6,
  articleId 
}: GraphiqueConsommationProps) {
  const [loading, setLoading] = useState(true)
  const [donnees, setDonnees] = useState<any[]>([])
  const [articlesTop, setArticlesTop] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [nombreMois, articleId])

  async function loadData() {
    try {
      setLoading(true)
      const stats = await getStatistiquesConsommationParMois(nombreMois)
      
      // Si articleId spécifique, filtrer
      const statsFiltered = articleId 
        ? stats.filter(s => s.articleId === articleId)
        : stats
      
      // Identifier les 5 articles les plus consommés
      const consommationParArticle: { [code: string]: number } = {}
      statsFiltered.forEach(stat => {
        if (!consommationParArticle[stat.articleCode]) {
          consommationParArticle[stat.articleCode] = 0
        }
        consommationParArticle[stat.articleCode] += stat.quantiteConsommee
      })
      
      const top5 = Object.entries(consommationParArticle)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code]) => code)
      
      setArticlesTop(top5)
      
      // Grouper par mois
      const donneesParMois: { [mois: string]: any } = {}
      
      statsFiltered.forEach(stat => {
        if (!donneesParMois[stat.mois]) {
          donneesParMois[stat.mois] = { mois: stat.mois }
        }
        
        // Ajouter seulement si dans le top 5 (ou si articleId spécifique)
        if (articleId || top5.includes(stat.articleCode)) {
          donneesParMois[stat.mois][stat.articleCode] = stat.quantiteConsommee
        }
      })
      
      // Convertir en tableau et trier par mois
      const donneesTableau = Object.values(donneesParMois).sort((a, b) => 
        a.mois.localeCompare(b.mois)
      )
      
      // Formatter les mois pour affichage
      const donneesFormatees = donneesTableau.map(d => ({
        ...d,
        moisLabel: formatMois(d.mois)
      }))
      
      setDonnees(donneesFormatees)
    } catch (error) {
      console.error('Erreur chargement données graphique:', error)
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
        Aucune donnée de consommation
      </div>
    )
  }

  const couleurs = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={donnees}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="moisLabel" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Quantité consommée', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          {articlesTop.map((articleCode, index) => (
            <Line
              key={articleCode}
              type="monotone"
              dataKey={articleCode}
              stroke={couleurs[index % couleurs.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={articleCode}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      
      {articlesTop.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Affichage des {articlesTop.length} articles les plus consommés sur les {nombreMois} derniers mois
        </div>
      )}
    </div>
  )
}
