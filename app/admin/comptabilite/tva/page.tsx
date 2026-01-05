'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  calculerTVAPeriode,
  calculerTVA12Mois,
  type CalculTVA
} from '@/lib/firebase/tva-calculs'
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  FileText,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TVADashboardPage() {
  const [loading, setLoading] = useState(true)
  const [calculTVA, setCalculTVA] = useState<CalculTVA | null>(null)
  const [historique, setHistorique] = useState<any[]>([])
  
  // Période sélectionnée
  const [periode, setPeriode] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadDonneesTVA()
  }, [periode])

  async function loadDonneesTVA() {
    try {
      setLoading(true)
      
      // Calculer début et fin du mois
      const [year, month] = periode.split('-')
      const dateDebut = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const dateFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      
      // Charger calcul TVA période
      const calculData = await calculerTVAPeriode(dateDebut, dateFin, societeId)
      setCalculTVA(calculData)
      
      // Charger historique 12 mois
      const historiqueData = await calculerTVA12Mois(societeId)
      setHistorique(historiqueData)
      
    } catch (error) {
      console.error('Erreur chargement données TVA:', error)
    } finally {
      setLoading(false)
    }
  }

  // Formateurs
  const formatterMontant = (value: number) => {
    return `${value.toLocaleString('fr-FR')} €`
  }

  const formatterMois = (mois: string) => {
    const date = new Date(mois + '-01')
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données TVA...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/comptabilite"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour Comptabilité
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-indigo-600" />
                TVA & Déclarations
              </h1>
              <p className="text-gray-600 mt-2">
                Suivi de la TVA collectée et déductible
              </p>
            </div>
            
            <Link
              href="/admin/comptabilite/tva/ca3"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Déclaration CA3
            </Link>
          </div>
        </div>

        {/* Sélecteur période */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Période :
            </label>
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">
              {new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {calculTVA && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* TVA Collectée */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-700">TVA Collectée</h3>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {calculTVA.totalTVACollectee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Sur CA HT : {calculTVA.caHT.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>

              {/* TVA Déductible */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-gray-700">TVA Déductible</h3>
                  </div>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  {calculTVA.totalTVADeductible.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Sur achats HT : {calculTVA.achatsHT.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>

              {/* Solde TVA */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-700">Solde TVA</h3>
                  </div>
                </div>
                <p className={`text-3xl font-bold ${calculTVA.soldeTVA >= 0 ? 'text-indigo-600' : 'text-green-600'}`}>
                  {Math.abs(calculTVA.soldeTVA).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {calculTVA.soldeTVA >= 0 ? 'À payer' : 'Crédit de TVA'}
                </p>
              </div>

              {/* Nombre factures */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-700">Factures</h3>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ventes :</span>
                    <span className="font-medium text-gray-900">{calculTVA.nombreFacturesVentes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Achats :</span>
                    <span className="font-medium text-gray-900">{calculTVA.nombreFacturesAchats}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails TVA par taux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* TVA Collectée par taux */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  TVA Collectée par Taux
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Taux 20%</span>
                    <span className="text-lg font-bold text-green-600">
                      {calculTVA.tvaCollectee20.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Taux 10%</span>
                    <span className="text-lg font-bold text-green-600">
                      {calculTVA.tvaCollectee10.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Taux 5,5%</span>
                    <span className="text-lg font-bold text-green-600">
                      {calculTVA.tvaCollectee55.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded border-t-2 border-green-600">
                    <span className="text-sm font-bold text-gray-900">TOTAL</span>
                    <span className="text-xl font-bold text-green-600">
                      {calculTVA.totalTVACollectee.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* TVA Déductible par taux */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  TVA Déductible par Taux
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Taux 20%</span>
                    <span className="text-lg font-bold text-red-600">
                      {calculTVA.tvaDeductible20.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Taux 10%</span>
                    <span className="text-lg font-bold text-red-600">
                      {calculTVA.tvaDeductible10.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="text-sm font-medium text-gray-700">Taux 5,5%</span>
                    <span className="text-lg font-bold text-red-600">
                      {calculTVA.tvaDeductible55.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-100 rounded border-t-2 border-red-600">
                    <span className="text-sm font-bold text-gray-900">TOTAL</span>
                    <span className="text-xl font-bold text-red-600">
                      {calculTVA.totalTVADeductible.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique historique */}
            {historique.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-6">Évolution TVA (12 derniers mois)</h2>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historique}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="mois" 
                        tickFormatter={formatterMois}
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        formatter={(value: any) => formatterMontant(value)}
                        labelFormatter={(label) => `Mois: ${formatterMois(label)}`}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="line"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tvaCollectee" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#10b981' }}
                        name="TVA Collectée"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tvaDeductible" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#ef4444' }}
                        name="TVA Déductible"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="soldeTVA" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#6366f1' }}
                        name="Solde TVA"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Info déclaration */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-2">
                    Déclaration de TVA
                  </h3>
                  <p className="text-sm text-indigo-800 mb-3">
                    Régime normal : Déclaration mensuelle CA3 à déposer avant le 24 du mois suivant.
                    Le solde de TVA doit être payé dans les mêmes délais.
                  </p>
                  <Link
                    href="/admin/comptabilite/tva/ca3"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Préparer la déclaration CA3
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
