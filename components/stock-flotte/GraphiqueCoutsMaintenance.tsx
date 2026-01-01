'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getAllInterventionsMaintenance, getAllEquipements } from '@/lib/firebase'

interface CoutMaintenanceParEquipement {
  equipementId: string
  equipementNom: string
  coutTotal: number
  nombreInterventions: number
  derniereMaintenance: string
}

interface GraphiqueCoutsMaintenanceProps {
  nombreMois?: number
}

export default function GraphiqueCoutsMaintenance({ 
  nombreMois = 6
}: GraphiqueCoutsMaintenanceProps) {
  const [loading, setLoading] = useState(true)
  const [donnees, setDonnees] = useState<CoutMaintenanceParEquipement[]>([])

  useEffect(() => {
    loadData()
  }, [nombreMois])

  async function loadData() {
    try {
      setLoading(true)
      
      // Date de début
      const dateDebut = new Date()
      dateDebut.setMonth(dateDebut.getMonth() - nombreMois)
      const dateDebutStr = dateDebut.toISOString().split('T')[0]
      
      const [interventions, equipements] = await Promise.all([
        getAllInterventionsMaintenance(),
        getAllEquipements()
      ])
      
      // Filtrer interventions des X derniers mois
      const interventionsRecentes = interventions.filter(i => 
        i.date >= dateDebutStr
      )
      
      // Grouper par équipement
      const coutsParEquipement: { [equipementId: string]: CoutMaintenanceParEquipement } = {}
      
      interventionsRecentes.forEach(intervention => {
        const equipement = equipements.find(e => e.id === intervention.equipementId)
        if (!equipement) return
        
        const equipementNom = (equipement as any).immatriculation || 
                             (equipement as any).numero || 
                             (equipement as any).nom || 
                             `Équipement ${equipement.id}`
        
        if (!coutsParEquipement[intervention.equipementId]) {
          coutsParEquipement[intervention.equipementId] = {
            equipementId: intervention.equipementId,
            equipementNom,
            coutTotal: 0,
            nombreInterventions: 0,
            derniereMaintenance: intervention.date
          }
        }
        
        coutsParEquipement[intervention.equipementId].coutTotal += intervention.coutTotal || 0
        coutsParEquipement[intervention.equipementId].nombreInterventions += 1
        
        // Mettre à jour dernière maintenance si plus récente
        if (intervention.date > coutsParEquipement[intervention.equipementId].derniereMaintenance) {
          coutsParEquipement[intervention.equipementId].derniereMaintenance = intervention.date
        }
      })
      
      // Convertir en tableau et trier par coût décroissant
      const donneesTableau = Object.values(coutsParEquipement)
        .sort((a, b) => b.coutTotal - a.coutTotal)
        .slice(0, 10) // Top 10
      
      setDonnees(donneesTableau)
    } catch (error) {
      console.error('Erreur chargement coûts maintenance:', error)
    } finally {
      setLoading(false)
    }
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
        Aucune donnée de maintenance
      </div>
    )
  }

  // Formater données pour le graphique
  const donneesGraphique = donnees.map(d => ({
    nom: d.equipementNom.length > 15 
      ? d.equipementNom.substring(0, 15) + '...'
      : d.equipementNom,
    nomComplet: d.equipementNom,
    cout: Math.round(d.coutTotal),
    interventions: d.nombreInterventions
  }))

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Top 10 équipements par coût de maintenance
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Sur les {nombreMois} derniers mois
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={donneesGraphique} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value} €`}
          />
          
          <YAxis 
            type="category"
            dataKey="nom"
            width={120}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any, name?: string, props?: any) => {
              if (name === 'Coût total') {
                return [`${value.toLocaleString('fr-FR')} €`, 'Coût total']
              }
              return [value, name || '']
            }}
            labelFormatter={(label?: any, payload?: any) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.nomComplet
              }
              return label || ''
            }}
          />
          
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
          />
          
          <Bar 
            dataKey="cout" 
            fill="#8b5cf6"
            name="Coût total"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Tableau détails */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Équipement</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Interventions</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Coût total</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Coût moyen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donnees.map((d, index) => (
              <tr key={d.equipementId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-gray-900">{d.equipementNom}</td>
                <td className="px-3 py-2 text-right text-gray-600">{d.nombreInterventions}</td>
                <td className="px-3 py-2 text-right font-medium text-gray-900">
                  {d.coutTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  {(d.coutTotal / d.nombreInterventions).toLocaleString('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
