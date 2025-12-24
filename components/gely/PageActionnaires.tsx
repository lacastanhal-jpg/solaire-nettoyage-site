'use client'

import { User } from 'lucide-react'

interface Participation {
  holding: {
    pourcentage: string
    actions: string
    valeur: string
  }
  sciGely?: {
    pourcentage: string
    parts: string
  }
  lexa?: {
    pourcentage: string
    direct: boolean
  }
  lexa2?: {
    pourcentage: string
    direct: boolean
    valeur?: string
  }
  solaireNettoyage?: {
    pourcentage: string
    direct: boolean
  }
}

interface Actionnaire {
  nom: string
  role: string
  participation: Participation
  total: string
}

const ACTIONNAIRES: Record<string, Actionnaire> = {
  jerome: {
    nom: "Jérôme GELY",
    role: "Président",
    participation: {
      holding: { pourcentage: "21,9%", actions: "184 355", valeur: "184 355 €" },
      sciGely: { pourcentage: "0,1%", parts: "1" },
      lexa: { pourcentage: "100% (via Holding)", direct: false },
      solaireNettoyage: { pourcentage: "100% (via Holding)", direct: false }
    },
    total: "Patrimoine via Holding : ~184 000 €"
  },
  axel: {
    nom: "Axel GELY",
    role: "Directeur Général",
    participation: {
      holding: { pourcentage: "78,1%", actions: "657 842", valeur: "657 842 €" },
      sciGely: { pourcentage: "0,1%", parts: "1" },
      lexa: { pourcentage: "100% (via Holding)", direct: false },
      lexa2: { pourcentage: "100%", direct: true, valeur: "En cours d'intégration" },
      solaireNettoyage: { pourcentage: "100% (via Holding)", direct: false }
    },
    total: "Patrimoine via Holding : ~658 000 €"
  }
}

interface ActionnaireCardProps {
  actionnaire: Actionnaire
}

function ActionnaireCard({ actionnaire }: ActionnaireCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-400">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-blue-900">{actionnaire.nom}</h3>
          <p className="text-sm text-gray-900 mt-1">{actionnaire.role}</p>
        </div>
        <User className="w-10 h-10 text-blue-600" />
      </div>
      
      <div className="space-y-3">
        <div className="bg-blue-100 rounded-lg p-4">
          <p className="text-xs text-gray-900 mb-1">GELY INVESTISSEMENT HOLDING</p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-900">{actionnaire.participation.holding.pourcentage}</span>
            <span className="text-sm text-gray-900">{actionnaire.participation.holding.actions} actions</span>
          </div>
          <p className="text-xs text-gray-800 mt-1">{actionnaire.participation.holding.valeur}</p>
        </div>

        {actionnaire.participation.lexa2?.direct && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-xs text-gray-900 mb-1">LEXA 2 (détention directe)</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-900">{actionnaire.participation.lexa2.pourcentage}</span>
              <span className="text-xs text-gray-800">{actionnaire.participation.lexa2.valeur}</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-400">
          <p className="text-sm font-semibold text-gray-700">{actionnaire.total}</p>
        </div>
      </div>
    </div>
  )
}

export default function PageActionnaires() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Actionnaires du Groupe</h2>
        <p className="text-gray-900">Répartition des participations et patrimoine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionnaireCard actionnaire={ACTIONNAIRES.jerome} />
        <ActionnaireCard actionnaire={ACTIONNAIRES.axel} />
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Structure de Contrôle</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-800 text-sm mb-1">SCI GELY</p>
            <p className="text-xl font-bold">Holding 99,8%</p>
          </div>
          <div>
            <p className="text-blue-800 text-sm mb-1">LEXA</p>
            <p className="text-xl font-bold">Holding 100%</p>
          </div>
          <div>
            <p className="text-blue-800 text-sm mb-1">LEXA 2</p>
            <p className="text-xl font-bold">Axel 100%</p>
          </div>
          <div>
            <p className="text-blue-800 text-sm mb-1">SOLAIRE NETTOYAGE</p>
            <p className="text-xl font-bold">Holding 100%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
