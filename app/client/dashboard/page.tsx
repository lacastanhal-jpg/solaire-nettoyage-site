'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getInterventionsByClient, getClientStats, type Intervention } from '@/lib/firebase'

export default function ClientDashboard() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientId, setClientId] = useState('')
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [stats, setStats] = useState({
    total: 0,
    terminees: 0,
    montantTotal: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si le client est connecté
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const name = localStorage.getItem('client_name') || ''
    const company = localStorage.getItem('client_company') || ''
    const id = localStorage.getItem('client_id') || ''
    
    setClientName(name)
    setClientCompany(company)
    setClientId(id)

    // Charger les interventions du client
    loadInterventions(id)
  }, [router])

  const loadInterventions = async (clientId: string) => {
    try {
      setLoading(true)
      
      // Récupérer les interventions depuis Firebase
      const data = await getInterventionsByClient(clientId)
      setInterventions(data)

      // Récupérer les stats
      const statsData = await getClientStats(clientId)
      setStats(statsData)
    } catch (error) {
      console.error('Erreur chargement interventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_logged_in')
    localStorage.removeItem('client_name')
    localStorage.removeItem('client_email')
    localStorage.removeItem('client_company')
    localStorage.removeItem('client_id')
    router.push('/client/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement de vos données...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Bienvenue {clientName}</h1>
                <p className="text-sm text-blue-600">{clientCompany}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Total interventions</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Terminées</span>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.terminees}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Montant total</span>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats.montantTotal.toLocaleString()}€</div>
            <div className="text-xs text-blue-600 mt-1">HT</div>
          </div>
        </div>

        {/* Liste des interventions */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200">
          <div className="px-6 py-4 bg-blue-600 border-b border-blue-700">
            <h3 className="text-lg font-bold text-white">Vos Interventions</h3>
          </div>

          {interventions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Aucune intervention pour le moment</h3>
              <p className="text-blue-600">
                Vos rapports d'intervention apparaîtront ici dès qu'ils seront disponibles.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="p-6 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full">
                          {intervention.numero}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          intervention.statut === 'Terminé' 
                            ? 'bg-green-100 text-green-900' 
                            : intervention.statut === 'En cours'
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {intervention.statut}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-blue-900 mb-1">{intervention.siteName}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-blue-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{formatDate(intervention.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>{intervention.technicien}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>💰</span>
                          <span>{intervention.prix.toLocaleString()}€ HT</span>
                        </div>
                      </div>
                    </div>
                    {intervention.rapportUrl && (
                      <a
                        href={intervention.rapportUrl.split('/').map(part => encodeURIComponent(part)).join('/')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors flex items-center gap-2"
                      >
                        📄 Télécharger le rapport
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
