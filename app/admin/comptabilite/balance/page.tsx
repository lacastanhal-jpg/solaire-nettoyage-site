'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getBalance
} from '@/lib/firebase/ecritures-comptables'
import { 
  Scale, 
  Download, 
  Filter,
  Calendar,
  ChevronLeft,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface CompteBalance {
  compte: string
  intitule: string
  totalDebit: number
  totalCredit: number
  solde: number
}

export default function BalanceGeneralePage() {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<CompteBalance[]>([])
  const [balanceFiltree, setBalanceFiltree] = useState<CompteBalance[]>([])
  
  // Filtres
  const [periode, setPeriode] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [classeFilter, setClasseFilter] = useState<string>('all')
  const [soldeFilter, setSoldeFilter] = useState<string>('all') // all, debiteur, crediteur, nul
  
  // Totaux
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadBalance()
  }, [periode])

  useEffect(() => {
    filtrerBalance()
  }, [balance, classeFilter, soldeFilter])

  async function loadBalance() {
    try {
      setLoading(true)
      
      // Calculer début et fin du mois
      const [year, month] = periode.split('-')
      const dateDebut = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const dateFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      
      const data = await getBalance(dateDebut, dateFin, societeId)
      setBalance(data)
      
      // Calculer totaux généraux
      const totDebit = data.reduce((sum, c) => sum + c.totalDebit, 0)
      const totCredit = data.reduce((sum, c) => sum + c.totalCredit, 0)
      setTotalDebit(totDebit)
      setTotalCredit(totCredit)
      
    } catch (error) {
      console.error('Erreur chargement balance:', error)
    } finally {
      setLoading(false)
    }
  }

  function filtrerBalance() {
    let filtered = [...balance]
    
    // Filtre par classe
    if (classeFilter !== 'all') {
      filtered = filtered.filter(c => c.compte.startsWith(classeFilter))
    }
    
    // Filtre par type de solde
    if (soldeFilter === 'debiteur') {
      filtered = filtered.filter(c => c.solde > 0)
    } else if (soldeFilter === 'crediteur') {
      filtered = filtered.filter(c => c.solde < 0)
    } else if (soldeFilter === 'nul') {
      filtered = filtered.filter(c => c.solde === 0)
    }
    
    setBalanceFiltree(filtered)
  }

  function exporterExcel() {
    const data = balanceFiltree.map(compte => ({
      'N° Compte': compte.compte,
      'Intitulé': compte.intitule,
      'Débit': compte.totalDebit.toFixed(2) + ' €',
      'Crédit': compte.totalCredit.toFixed(2) + ' €',
      'Solde Débiteur': compte.solde > 0 ? compte.solde.toFixed(2) + ' €' : '',
      'Solde Créditeur': compte.solde < 0 ? Math.abs(compte.solde).toFixed(2) + ' €' : ''
    }))
    
    // Ajouter ligne totaux
    data.push({
      'N° Compte': '',
      'Intitulé': 'TOTAUX',
      'Débit': totalDebit.toFixed(2) + ' €',
      'Crédit': totalCredit.toFixed(2) + ' €',
      'Solde Débiteur': '',
      'Solde Créditeur': ''
    })
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Largeurs colonnes
    ws['!cols'] = [
      { wch: 12 }, // N° Compte
      { wch: 50 }, // Intitulé
      { wch: 15 }, // Débit
      { wch: 15 }, // Crédit
      { wch: 15 }, // Solde Débiteur
      { wch: 15 }  // Solde Créditeur
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, 'Balance')
    
    const [year, month] = periode.split('-')
    const fileName = `balance-generale-${year}-${month}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const classesComptables = [
    { value: '1', label: 'Classe 1 - Capitaux' },
    { value: '2', label: 'Classe 2 - Immobilisations' },
    { value: '3', label: 'Classe 3 - Stocks' },
    { value: '4', label: 'Classe 4 - Tiers' },
    { value: '5', label: 'Classe 5 - Financiers' },
    { value: '6', label: 'Classe 6 - Charges' },
    { value: '7', label: 'Classe 7 - Produits' }
  ]

  // Calculer statistiques
  const comptesDebiteurs = balanceFiltree.filter(c => c.solde > 0).length
  const comptesCrediteurs = balanceFiltree.filter(c => c.solde < 0).length
  const comptesEquilibres = balanceFiltree.filter(c => c.solde === 0).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la balance...</p>
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
                <Scale className="w-8 h-8 text-orange-600" />
                Balance Générale
              </h1>
              <p className="text-gray-600 mt-2">
                Synthèse des soldes de tous les comptes
              </p>
            </div>
            
            <button
              onClick={exporterExcel}
              disabled={balanceFiltree.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filtres</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Période
              </label>
              <input
                type="month"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Classe comptable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe Comptable
              </label>
              <select
                value={classeFilter}
                onChange={(e) => setClasseFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les classes</option>
                {classesComptables.map(classe => (
                  <option key={classe.value} value={classe.value}>
                    {classe.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type de solde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Solde
              </label>
              <select
                value={soldeFilter}
                onChange={(e) => setSoldeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="debiteur">Soldes débiteurs uniquement</option>
                <option value="crediteur">Soldes créditeurs uniquement</option>
                <option value="nul">Soldes nuls uniquement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Comptes Total</p>
            <p className="text-2xl font-bold text-gray-900">{balanceFiltree.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">Débiteurs</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{comptesDebiteurs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600">Créditeurs</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{comptesCrediteurs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Équilibrés</p>
            <p className="text-2xl font-bold text-gray-900">{comptesEquilibres}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Différence</p>
            <p className={`text-2xl font-bold ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(totalDebit - totalCredit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>

        {/* Balance */}
        {balanceFiltree.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Scale className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">Aucun compte</p>
            <p className="text-gray-600">
              {balance.length === 0 
                ? "Aucune écriture pour cette période"
                : "Aucun compte ne correspond aux filtres sélectionnés"
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compte
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intitulé
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Débit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Crédit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solde Débiteur
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solde Créditeur
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {balanceFiltree.map((compte) => (
                    <tr key={compte.compte} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/comptabilite/grand-livre?compte=${compte.compte}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {compte.compte}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {compte.intitule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {compte.totalDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {compte.totalCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                        {compte.solde > 0 ? compte.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                        {compte.solde < 0 ? Math.abs(compte.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                      </td>
                    </tr>
                  ))}
                  {/* Ligne totaux */}
                  <tr className="bg-orange-50 font-bold border-t-2 border-orange-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                      TOTAUX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {totalDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {totalCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900" colSpan={2}>
                      {Math.abs(totalDebit - totalCredit) < 0.01 ? (
                        <span className="text-green-600">✓ Équilibrée</span>
                      ) : (
                        <span className="text-red-600">
                          ⚠ Diff: {Math.abs(totalDebit - totalCredit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info conformité */}
        {Math.abs(totalDebit - totalCredit) >= 0.01 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ Attention :</strong> La balance n'est pas équilibrée. 
              Le total des débits doit être égal au total des crédits. 
              Vérifiez les écritures comptables dans le journal.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
