'use client'

import { LucideIcon } from 'lucide-react'

interface Societe {
  nom: string
  icon: LucideIcon
  color: string
  capital: string
  ca?: string
  puissance?: string
  investissement?: string
}

interface SocieteCardProps {
  societe: Societe
  onClick: () => void
}

export default function SocieteCard({ societe, onClick }: SocieteCardProps) {
  const Icon = societe.icon
  
  return (
    <div 
      onClick={onClick} 
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer border-t-4 border-blue-600 hover:border-yellow-400"
    >
      <div className={`${societe.color} p-3 rounded-xl inline-block mb-4 shadow-md`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-blue-900 mb-3">{societe.nom}</h3>
      <div className="space-y-2 text-sm text-gray-900">
        <div className="flex justify-between">
          <span>Capital</span>
          <span className="font-semibold text-gray-900">{societe.capital}</span>
        </div>
        {societe.ca && (
          <div className="flex justify-between">
            <span>CA</span>
            <span className="font-semibold text-gray-900">{societe.ca}</span>
          </div>
        )}
        {societe.puissance && (
          <div className="flex justify-between">
            <span>Puissance</span>
            <span className="font-semibold text-yellow-600">{societe.puissance}</span>
          </div>
        )}
        {societe.investissement && (
          <div className="flex justify-between">
            <span>Investissement</span>
            <span className="font-semibold text-gray-900">{societe.investissement}</span>
          </div>
        )}
      </div>
    </div>
  )
}
