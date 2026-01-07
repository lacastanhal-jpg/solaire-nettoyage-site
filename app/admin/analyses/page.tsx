'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getDonneesAnalyses,
  exporterDonneesExcel,
  type DonneesAnalyses
} from '@/lib/firebase/analyses'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Award
} from 'lucide-react'

export default function AnalysesPage() {
  const [loading, setLoading] = useState(true)
  const [donnees, setDonnees] = useState<DonneesAnalyses | null>(null)
  const [periodeSelectionnee, setPeriodeSelectionnee] = useState<'1mois' | '3mois' | '6mois' | '1an' | 'annee'>('annee')

  useEffect(() => {
    loadDonnees()
  }, [periodeSelectionnee])

  async function loadDonnees() {
    try {
      setLoading(true)
      
      const now = new Date()
      let dateDebut: Date

      switch (periodeSelectionnee) {
        case '1mois':
          dateDebut = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          break
        case '3mois':
          dateDebut = new Date(now.getFullYear(), now.getMonth() - 3, 1)
          break
        case '6mois':
          dateDebut = new Date(now.getFullYear(), now.getMonth() - 6, 1)
          break
        case '1an':
          dateDebut = new Date(now.getFullYear() - 1, now.getMonth(), 1)
          break
        case 'annee':
        default:
          dateDebut = new Date(now.getFullYear(), 0, 1) // 1er janvier année en cours
          break
      }

      const data = await getDonneesAnalyses(dateDebut, now)
      setDonnees(data)
    } catch (error) {
      console.error('Erreur chargement analyses:', error)
      alert('❌ Erreur lors du chargement des analyses')
    } finally {
      setLoading(false)
    }
  }

  function handleExportExcel() {
    if (!donnees) return

    const exports = exporterDonneesExcel(donnees)
    
    // Export évolution
    const blobEvolution = new Blob([exports.evolution], { type: 'text/csv;charset=utf-8;' })
    const linkEvolution = document.createElement('a')
    linkEvolution.href = URL.createObjectURL(blobEvolution)
    linkEvolution.download = `evolution-${new Date().toISOString().split('T')[0]}.csv`
    linkEvolution.click()

    // Export clients
    setTimeout(() => {
      const blobClients = new Blob([exports.clients], { type: 'text/csv;charset=utf-8;' })
      const linkClients = document.createElement('a')
      linkClients.href = URL.createObjectURL(blobClients)
      linkClients.download = `top-clients-${new Date().toISOString().split('T')[0]}.csv`
      linkClients.click()
    }, 500)

    alert('✅ Exports Excel générés !')
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  if (loading || !donnees) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Chargement des analyses...</p>
        </div>
      </div>
    )
  }

  const { kpis, evolutionMensuelle, top10Clients, performanceOperateurs, topSites, repartitionCA } = donnees

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin" className="hover:text-gray-900">Admin</Link>
          <span>→</span>
          <span className="text-gray-900">Analyses & Reporting</span>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📊 Analyses & Reporting</h1>
          <div className="flex gap-3">
            <select
              value={periodeSelectionnee}
              onChange={(e) => setPeriodeSelectionnee(e.target.value as any)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold focus:border-blue-500"
            >
              <option value="1mois">Dernier mois</option>
              <option value="3mois">3 derniers mois</option>
              <option value="6mois">6 derniers mois</option>
              <option value="1an">12 derniers mois</option>
              <option value="annee">Année en cours</option>
            </select>
            <button
              onClick={loadDonnees}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* CA */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <div className="text-sm opacity-90">Chiffre d'Affaires</div>
              <div className="text-3xl font-bold">{(kpis.ca / 1000).toFixed(0)}K€</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" />
            <span>Objectif : {(kpis.caObjectif / 1000000).toFixed(1)}M€</span>
            <span className="ml-auto font-bold">{kpis.tauxRealisation.toFixed(1)}%</span>
          </div>
          <div className="mt-2 w-full bg-blue-700 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${Math.min(kpis.tauxRealisation, 100)}%` }}
            />
          </div>
        </div>

        {/* Marge */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <div className="text-sm opacity-90">Marge Estimée</div>
              <div className="text-3xl font-bold">{(kpis.margeEstimee / 1000).toFixed(0)}K€</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4" />
            <span>Taux de marge : {kpis.tauxMarge}%</span>
          </div>
        </div>

        {/* Interventions */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Briefcase className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <div className="text-sm opacity-90">Interventions</div>
              <div className="text-3xl font-bold">{kpis.nbInterventions}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Sur la période</span>
          </div>
        </div>

        {/* Clients & Sites */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 opacity-80" />
            <div className="text-right">
              <div className="text-sm opacity-90">Clients Actifs</div>
              <div className="text-3xl font-bold">{kpis.nbClients}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{kpis.nbSites} sites gérés</span>
          </div>
        </div>
      </div>

      {/* Graphiques Principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Évolution CA & Interventions */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Évolution CA & Interventions (12 mois)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionMensuelle}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ca" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="CA (€)"
                dot={{ fill: '#3B82F6', r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="interventions" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Interventions"
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition CA par Client */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Répartition CA par Client
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repartitionCA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.label} (${entry.pourcentage.toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {repartitionCA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value.toLocaleString('fr-FR')} €`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Évolution Marge */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Évolution Marge (12 mois)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={evolutionMensuelle}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mois" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value: any) => `${value.toLocaleString('fr-FR')} €`}
            />
            <Legend />
            <Bar dataKey="margeEstimee" fill="#10B981" name="Marge Estimée (€)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Clients */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          Top 10 Clients
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b-2 border-blue-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Rang</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Client</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">CA (€)</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Interventions</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">Sites</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Ticket Moyen (€)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Marge (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {top10Clients.map((client, index) => (
                <tr key={client.clientId} className="hover:bg-blue-50">
                  <td className="px-4 py-4 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mx-auto ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">{client.clientNom}</td>
                  <td className="px-4 py-4 text-right font-bold text-blue-600 text-lg">
                    {client.ca.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold">{client.nbInterventions}</td>
                  <td className="px-4 py-4 text-center text-gray-600">{client.nbSites}</td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-900">
                    {client.ticketMoyen.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-green-600">
                    {client.margeEstimee.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Opérateurs & Top Sites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Opérateurs */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Performance Opérateurs
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {performanceOperateurs.slice(0, 10).map((op) => (
              <div key={op.operateurId} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-gray-900">{op.operateurNom}</div>
                  <div className="text-sm font-semibold text-purple-600">
                    {op.caGenere.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📊 {op.nbInterventions} interventions</span>
                  <span>⏱️ {op.dureeeMoyenne.toFixed(1)}h moy</span>
                  <span className="ml-auto">🎯 {op.tauxOccupation.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sites */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-600" />
            Top 20 Sites
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {topSites.map((site, index) => (
              <div key={site.siteId} className="bg-orange-50 rounded-lg p-3 border border-orange-200 hover:border-orange-400 transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{site.siteNom}</div>
                    <div className="text-xs text-gray-600">{site.clientNom}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600">{site.caTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
                    <div className="text-xs text-gray-600">{site.nbInterventions} int.</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Données actualisées le {new Date().toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>
    </div>
  )
}
