'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Intervention {
  id: string
  numero: string
  client: string
  site: string
  date: string
  technicien: string
  statut: string
  rapport: string
  prix: number
}

export default function ClientDashboard() {
  const router = useRouter()
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [interventions, setInterventions] = useState<Intervention[]>([])
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
    setClientName(name)
    setClientCompany(company)

    // Charger les interventions du client
    loadInterventions(company)
  }, [router])

  const loadInterventions = async (company: string) => {
    try {
      // TODO: Remplacer par appel API ou Firebase
      // Pour l'instant, données d'exemple
      const mockData: Intervention[] = [
        {
          id: '1',
          numero: 'GX0000002830',
          client: 'MECOJIT',
          site: '19-0226 CANTALOUBE 2',
          date: '2024-10-22',
          technicien: 'Gely Axel',
          statut: 'Terminé',
          rapport: '/rapports/clients/mecojit/CR intervention site 19-0226 CANTALOUBE 2.pdf',
          prix: 350
        }
      ]

      // Filtrer par company
      const clientInterventions = mockData.filter(i => i.client === company)
      setInterventions(clientInterventions)
      setLoading(false)
    } catch (error) {
      console.error('Erreur chargement interventions:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_logged_in')
    localStorage.removeItem('client_name')
    localStorage.removeItem('client_email')
    localStorage.removeItem('client_company')
    router.push('/client/login')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement...</div>
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
                <h1 className="text-xl font-bold text-blue-900">Solaire Nettoyage</h1>
                <p className="text-sm text-blue-600">Espace Client</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-900">{clientName}</p>
                <p className="text-xs text-blue-600">{clientCompany}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg text-sm font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Vos Interventions</h2>
          <p className="text-blue-700">Retrouvez l'historique de toutes vos interventions et rapports</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-yellow-500 mb-2">{interventions.length}</div>
            <div className="text-blue-700 font-medium">Interventions totales</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {interventions.filter(i => i.statut === 'Terminé').length}
            </div>
            <div className="text-blue-700 font-medium">Interventions terminées</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {interventions.reduce((sum, i) => sum + i.prix, 0).toLocaleString()}€
            </div>
            <div className="text-blue-700 font-medium">Montant total HT</div>
          </div>
        </div>

        {/* Liste des interventions */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 border-b border-blue-700">
            <h3 className="text-lg font-bold text-white">Rapports d'intervention</h3>
          </div>

          {interventions.length === 0 ? (
            <div className="p-12 text-center text-blue-600">
              Aucune intervention pour le moment
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="p-6 hover:bg-blue-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {intervention.numero}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          intervention.statut === 'Terminé' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {intervention.statut}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-blue-900 mb-1">{intervention.site}</h4>
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
                    <a
                      href={intervention.rapport.split('/').map(part => encodeURIComponent(part)).join('/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      📄 Télécharger le rapport
                    </a>
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