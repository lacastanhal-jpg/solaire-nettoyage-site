'use client'

import { TrendingUp, Euro, Zap, Building2, Calendar, Factory, Wrench } from 'lucide-react'
import KPICard from './KPICard'
import SocieteCard from './SocieteCard'

const SOCIETES_DATA = {
  sciGely: {
    nom: "SCI GELY",
    icon: Building2,
    color: "bg-blue-600",
    capital: "1 000 €",
    investissement: "336 011 €"
  },
  lexa: {
    nom: "LEXA",
    icon: Zap,
    color: "bg-yellow-500",
    capital: "1 000 €",
    puissance: "150 kWc",
    ca: "142 363 €"
  },
  lexa2: {
    nom: "LEXA 2",
    icon: Factory,
    color: "bg-blue-500",
    capital: "1 000 €",
    investissement: "426 347 €"
  },
  solaireNettoyage: {
    nom: "SOLAIRE NETTOYAGE",
    icon: Wrench,
    color: "bg-yellow-600",
    capital: "1 000 €",
    ca: "851 882 €"
  }
}

interface DashboardProps {
  setCurrentPage: (page: string) => void
}

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Indicateurs Groupe</h2>
        <p className="text-gray-600">Vue d'ensemble de la performance consolidée</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard 
          title="CA Consolidé" 
          value="1,08 M€" 
          subtitle="+8,9% vs actuel" 
          icon={TrendingUp} 
          color="bg-gradient-to-br from-blue-500 to-blue-700" 
        />
        <KPICard 
          title="Résultat Net" 
          value="256 K€" 
          subtitle="+33,3%" 
          icon={Euro} 
          color="bg-gradient-to-br from-yellow-500 to-yellow-600" 
        />
        <KPICard 
          title="Puissance Totale" 
          value="750 kWc" 
          subtitle="5 installations" 
          icon={Zap} 
          color="bg-gradient-to-br from-blue-600 to-blue-800" 
        />
        <KPICard 
          title="Sociétés" 
          value="5" 
          subtitle="1 Holding + 4 filiales" 
          icon={Building2} 
          color="bg-gradient-to-br from-yellow-600 to-yellow-700" 
        />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Sociétés du Groupe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SocieteCard societe={SOCIETES_DATA.sciGely} onClick={() => setCurrentPage('sciGely')} />
          <SocieteCard societe={SOCIETES_DATA.lexa} onClick={() => setCurrentPage('lexa')} />
          <SocieteCard societe={SOCIETES_DATA.lexa2} onClick={() => setCurrentPage('lexa2')} />
          <SocieteCard societe={SOCIETES_DATA.solaireNettoyage} onClick={() => setCurrentPage('solaireNettoyage')} />
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-l-4 border-yellow-600 p-6 rounded-xl shadow-lg">
        <div className="flex items-start space-x-4">
          <Calendar className="w-8 h-8 text-yellow-900 mt-1" />
          <div>
            <p className="font-bold text-yellow-900 text-lg">Paiement urgent - Échéance 25/12/2025</p>
            <p className="text-yellow-800 mt-1 font-medium">Acomptes MECOJIT : 51 352 € TTC (42 794 € HT)</p>
            <p className="text-sm text-yellow-700 mt-2">Factures 12343 et 12344 - LEXA 2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
