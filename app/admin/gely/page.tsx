'use client'

import { useState } from 'react'
import { Building2, Users, Home } from 'lucide-react'

// Import des composants
import Dashboard from '@/components/gely/Dashboard'
import PageActionnaires from '@/components/gely/PageActionnaires'
import PageSciGely from '@/components/gely/PageSciGely'
import PageLexa from '@/components/gely/PageLexa'
import PageLexa2 from '@/components/gely/PageLexa2'
import PageSolaireNettoyage from '@/components/gely/PageSolaireNettoyage'

type PageType = 'dashboard' | 'actionnaires' | 'sciGely' | 'lexa' | 'lexa2' | 'solaireNettoyage'

const NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'actionnaires', label: 'Actionnaires', icon: Users },
  { id: 'sciGely', label: 'SCI GELY', icon: Building2 },
  { id: 'lexa', label: 'LEXA', icon: Building2 },
  { id: 'lexa2', label: 'LEXA 2', icon: Building2 },
  { id: 'solaireNettoyage', label: 'SOLAIRE NETTOYAGE', icon: Building2 },
]

export default function GelyManagementPage() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />
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
        return <Dashboard setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">GROUPE GELY</h1>
          <p className="text-blue-100 text-lg">Gestion et Suivi des Participations</p>
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
                  onClick={() => setCurrentPage(item.id as PageType)}
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
