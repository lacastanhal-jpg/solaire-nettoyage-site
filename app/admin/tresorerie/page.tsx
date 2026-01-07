'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Upload,
  Plus,
  Link as LinkIcon,
  Building2,
  FileText
} from 'lucide-react'
import {
  getAllComptesBancaires,
  type CompteBancaire,
  type LigneBancaire
} from '@/lib/firebase/lignes-bancaires'
import {
  getStatistiquesTresorerie,
  getEvolutionSolde,
  getTransactionsNonRapprochees,
  type StatistiquesTresorerie,
  type EvolutionSolde
} from '@/lib/firebase/tresorerie-stats'

// Import dynamique des graphiques (client-side only)
const GraphiqueEvolutionSolde = dynamic(
  () => import('@/components/tresorerie/GraphiqueEvolutionSolde'),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" /> }
)

const GraphiquePrevisionnel = dynamic(
  () => import('@/components/tresorerie/GraphiquePrevisionnel'),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" /> }
)

export default function TresoreriePage() {
  const [stats, setStats] = useState<StatistiquesTresorerie | null>(null)
  const [comptes, setComptes] = useState<CompteBancaire[]>([])
  const [evolution, setEvolution] = useState<EvolutionSolde[]>([])
  const [transactions, setTransactions] = useState<LigneBancaire[]>([])
  const [loading, setLoading] = useState(true)
  const [ongletActif, setOngletActif] = useState<'dashboard' | 'previsionnel'>('dashboard')

  useEffect(() => {
    chargerDonnees()
    
    // Gérer l'onglet depuis l'URL
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab === 'previsionnel') {
      setOngletActif('previsionnel')
    }
  }, [])

  const changerOnglet = (onglet: 'dashboard' | 'previsionnel') => {
    setOngletActif(onglet)
    // Mettre à jour l'URL sans recharger la page
    const url = new URL(window.location.href)
    if (onglet === 'previsionnel') {
      url.searchParams.set('tab', 'previsionnel')
    } else {
      url.searchParams.delete('tab')
    }
    window.history.pushState({}, '', url.toString())
  }

  const chargerDonnees = async () => {
    try {
      setLoading(true)
      const [statsData, comptesData, evolutionData, transactionsData] = await Promise.all([
        getStatistiquesTresorerie(),
        getAllComptesBancaires(),
        getEvolutionSolde(30),
        getTransactionsNonRapprochees(10)
      ])
      
      setStats(statsData)
      setComptes(comptesData.filter(c => c.actif))
      setEvolution(evolutionData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Erreur chargement données trésorerie:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatterMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    })
  }

  const formatterDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleExportExcel = async () => {
    try {
      // Obtenir le premier et dernier jour du mois en cours
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const dateDebut = firstDay.toISOString().split('T')[0]
      const dateFin = lastDay.toISOString().split('T')[0]
      
      // Télécharger le fichier
      const url = `/api/tresorerie/export-excel?dateDebut=${dateDebut}&dateFin=${dateFin}`
      window.open(url, '_blank')
    } catch (error) {
      console.error('Erreur export Excel:', error)
      alert('Erreur lors de l\'export')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trésorerie</h1>
        
        <div className="flex gap-3">
          <Link
            href="/admin/tresorerie/comptes"
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <Building2 className="w-4 h-4" />
            Comptes
          </Link>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FileText className="w-4 h-4" />
            Export Excel
          </button>
          <Link
            href="/admin/tresorerie/import-csv"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            Importer CSV
          </Link>
          <Link
            href="/admin/tresorerie/rapprochement"
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <LinkIcon className="w-4 h-4" />
            Rapprochement
          </Link>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => changerOnglet('dashboard')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            ongletActif === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => changerOnglet('previsionnel')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            ongletActif === 'previsionnel'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🔮 Prévisionnel 90j
        </button>
      </div>

      {/* Onglet Dashboard */}
      {ongletActif === 'dashboard' && (
        <>
          {/* Alertes */}
          {(stats && (stats.soldeTotal < 0 || stats.aRapprocher > 10)) && (
            <div className="mb-6 space-y-3">
              {/* Alerte solde négatif */}
              {stats.soldeTotal < 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-red-900">
                        🚨 Solde global négatif : {formatterMontant(stats.soldeTotal)}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Attention : votre trésorerie globale est négative. Vérifiez vos comptes bancaires.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerte transactions à rapprocher */}
              {stats.aRapprocher > 10 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        ⚠️ {stats.aRapprocher} transactions à rapprocher
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        De nombreuses transactions bancaires attendent d'être rapprochées.
                        <Link href="/admin/tresorerie/rapprochement" className="underline ml-1 font-medium">
                          Accéder au rapprochement →
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerte solde faible */}
              {stats.soldeTotal >= 0 && stats.soldeTotal < 10000 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-3" />
                    <div>
                      <p className="font-medium text-orange-900">
                        💡 Solde global faible : {formatterMontant(stats.soldeTotal)}
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        Votre trésorerie est en dessous du seuil recommandé de 10 000€.
                        <Link href="/admin/tresorerie?tab=previsionnel" className="underline ml-1 font-medium">
                          Voir le prévisionnel →
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Solde Total */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Solde Total</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className={`text-2xl font-bold ${(stats?.soldeTotal || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatterMontant(stats?.soldeTotal || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tous comptes confondus
              </div>
            </div>

            {/* À Rapprocher */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">À Rapprocher</span>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.aRapprocher || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Transactions en attente
              </div>
            </div>

            {/* Encaissements Mois */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Encaissements</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatterMontant(stats?.encaissementsMois || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ce mois
              </div>
            </div>

            {/* Décaissements Mois */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Décaissements</span>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatterMontant(stats?.decaissementsMois || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ce mois
              </div>
            </div>
          </div>

          {/* Graphique + Comptes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Graphique Évolution */}
            <div className="lg:col-span-2">
              <GraphiqueEvolutionSolde donnees={evolution} />
            </div>

            {/* Comptes Bancaires */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Comptes bancaires</h2>
                <button className="text-blue-600 hover:text-blue-700">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {comptes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun compte configuré</p>
                  <button className="mt-2 text-blue-600 text-sm hover:underline">
                    Ajouter un compte
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {comptes.map((compte) => (
                    <div
                      key={compte.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{compte.nom}</div>
                          <div className="text-xs text-gray-500">{compte.banque}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {compte.numeroCompte}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${compte.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatterMontant(compte.solde)}
                          </div>
                          <div className="text-xs text-gray-400">
                            MAJ {formatterDate(compte.dateMAJ)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transactions à rapprocher */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Transactions à rapprocher</h2>
                <Link
                  href="/admin/tresorerie/rapprochement"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Voir tout →
                </Link>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune transaction à rapprocher</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatterDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-md truncate">{transaction.libelle}</div>
                          {transaction.reference && (
                            <div className="text-xs text-gray-500">Réf: {transaction.reference}</div>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          transaction.montant >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatterMontant(transaction.montant)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.categorieAuto || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Link
                            href={`/admin/tresorerie/rapprochement?ligne=${transaction.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Rapprocher
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Onglet Prévisionnel */}
      {ongletActif === 'previsionnel' && (
        <GraphiquePrevisionnel />
      )}
    </div>
  )
}
