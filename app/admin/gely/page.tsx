'use client'

import { useState } from 'react'
import { Building2, Users, Home, FolderKanban, ArrowLeft, TrendingUp, Calendar, BarChart3, Download } from 'lucide-react'
import Link from 'next/link'

// Import des composants
import Dashboard from '@/components/gely/Dashboard'
import PageActionnaires from '@/components/gely/PageActionnaires'
import PageSciGely from '@/components/gely/PageSciGely'
import PageLexa from '@/components/gely/PageLexa'
import PageLexa2 from '@/components/gely/PageLexa2'
import PageSolaireNettoyage from '@/components/gely/PageSolaireNettoyage'
import PageProjets from '@/components/gely/PageProjets'
import ProjetDetail from '@/components/gely/ProjetDetail'
import SimulateurImpact from '@/components/gely/SimulateurImpact'
import CalendrierFinancier from '@/components/gely/CalendrierFinancier'
import DashboardGroupe from '@/components/gely/DashboardGroupe'
import ExportDonnees from '@/components/gely/ExportDonnees'
import { PROJETS_MOCK, LIGNES_FINANCIERES_MOCK } from '@/lib/gely/mockData'

type PageType = 'dashboard' | 'actionnaires' | 'sciGely' | 'lexa' | 'lexa2' | 'solaireNettoyage' | 'projets' | 'simulateur' | 'calendrier' | 'dashboardGroupe' | 'export'

const NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'projets', label: 'Projets', icon: FolderKanban },
  { id: 'dashboardGroupe', label: 'Vue Groupe', icon: BarChart3 },
  { id: 'calendrier', label: 'Calendrier', icon: Calendar },
  { id: 'simulateur', label: 'Simulateur', icon: TrendingUp },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'actionnaires', label: 'Actionnaires', icon: Users },
  { id: 'sciGely', label: 'SCI GELY', icon: Building2 },
  { id: 'lexa', label: 'LEXA', icon: Building2 },
  { id: 'lexa2', label: 'LEXA 2', icon: Building2 },
  { id: 'solaireNettoyage', label: 'SOLAIRE NETTOYAGE', icon: Building2 },
]

export default function GelyManagementPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [selectedProjet, setSelectedProjet] = useState<string | null>(null)

  const renderPage = () => {
    // Si on a sélectionné un projet, afficher le détail
    if (currentPage === 'projets' && selectedProjet) {
      return <ProjetDetail projetId={selectedProjet} onBack={() => setSelectedProjet(null)} />
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />
      case 'projets':
        return <PageProjets onSelectProjet={setSelectedProjet} />
      case 'dashboardGroupe':
        return <DashboardGroupe projets={PROJETS_MOCK} />
      case 'calendrier':
        return <CalendrierFinancier projets={PROJETS_MOCK} />
      case 'simulateur':
        return <SimulateurImpact projets={PROJETS_MOCK} />
      case 'export':
        return <ExportDonnees projets={PROJETS_MOCK} lignesFinancieres={LIGNES_FINANCIERES_MOCK} />
      case 'actionnaires':
        return <PageActionnaires />
      case 'sciGely':
        return <PageSciGely />
      case 'lexa':
        return <PageLexa />
      case 'lexa2':
        return <PageLexa2 />
      case 'solaireNettoyage':
        return <PageSolaireNettoyage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header avec bouton retour */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">GROUPE GELY</h1>
              <p className="text-blue-100 text-lg">Gestion et Suivi des Participations</p>
            </div>
            <Link
              href="/intranet/dashboard"
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1 overflow-x-auto">
            {NAVIGATION.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as PageType)
                    setSelectedProjet(null) // Reset projet sélectionné quand on change d'onglet
                  }}
                  className={`
                    flex items-center space-x-2 px-6 py-4 border-b-4 transition-all whitespace-nowrap
                    ${isActive 
                      ? 'border-blue-600 text-blue-600 font-semibold bg-blue-50' 
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </div>
    </div>
  )
}
