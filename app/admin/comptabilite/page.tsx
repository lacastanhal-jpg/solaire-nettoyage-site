'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getEcrituresByPeriode, 
  getBalance,
  type EcritureComptable 
} from '@/lib/firebase/ecritures-comptables'
import { 
  BookOpen, 
  FileText, 
  Scale, 
  Download, 
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react'
import GraphiqueComptabilite from '@/components/comptabilite/GraphiqueComptabilite'

export default function ComptabiliteDashboard() {
  const [loading, setLoading] = useState(true)
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([])
  const [periode, setPeriode] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  // KPIs
  const [nombreEcritures, setNombreEcritures] = useState(0)
  const [balanceDebit, setBalanceDebit] = useState(0)
  const [balanceCredit, setBalanceCredit] = useState(0)
  const [ecrituresNonEquilibrees, setEcrituresNonEquilibrees] = useState(0)
  
  // Données graphique
  const [donneesGraphique, setDonneesGraphique] = useState<any[]>([])

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadDonneesComptabilite()
  }, [periode])

  async function loadDonneesComptabilite() {
    try {
      setLoading(true)
      
      // Calculer début et fin du mois
      const [year, month] = periode.split('-')
      const dateDebut = `${year}-${month}-01`
      const dateFin = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
      
      // Charger écritures
      const ecrituresData = await getEcrituresByPeriode(dateDebut, dateFin, societeId)
      setEcritures(ecrituresData)
      setNombreEcritures(ecrituresData.length)
      
      // Calculer balance
      const balance = await getBalance(dateDebut, dateFin, societeId)
      
      let totalDebit = 0
      let totalCredit = 0
      
      balance.forEach(compte => {
        totalDebit += compte.totalDebit
        totalCredit += compte.totalCredit
      })
      
      setBalanceDebit(totalDebit)
      setBalanceCredit(totalCredit)
      
      // Compter écritures non équilibrées
      const nonEquilibrees = ecrituresData.filter(e => !e.equilibre).length
      setEcrituresNonEquilibrees(nonEquilibrees)
      
      // Préparer données graphique CA vs Charges
      await preparerDonneesGraphique(ecrituresData)
      
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  async function preparerDonneesGraphique(ecrituresData: EcritureComptable[]) {
    // Calculer CA (classe 7) et Charges (classe 6) par jour
    const dataMap = new Map<string, { date: string; ca: number; charges: number }>()
    
    ecrituresData.forEach(ecriture => {
      const date = ecriture.dateEcriture
      
      if (!dataMap.has(date)) {
        dataMap.set(date, { date, ca: 0, charges: 0 })
      }
      
      const data = dataMap.get(date)!
      
      ecriture.lignes.forEach(ligne => {
        const classe = ligne.compteComptable.charAt(0)
        
        if (classe === '7') {
          // Produits (CA) = crédit
          if (ligne.sens === 'credit') {
            data.ca += ligne.montant
          }
        } else if (classe === '6') {
          // Charges = débit
          if (ligne.sens === 'debit') {
            data.charges += ligne.montant
          }
        }
      })
    })
    
    // Transformer en tableau et trier par date
    const donnees = Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    setDonneesGraphique(donnees)
  }

  const menuItems = [
    {
      titre: 'Plan Comptable',
      description: 'Gérer les comptes comptables',
      icon: BookOpen,
      href: '/admin/comptabilite/plan-comptable',
      color: 'blue'
    },
    {
      titre: 'Journal Comptable',
      description: 'Consulter le journal des écritures',
      icon: FileText,
      href: '/admin/comptabilite/journal',
      color: 'green'
    },
    {
      titre: 'Grand Livre',
      description: 'Consulter le grand livre',
      icon: BookOpen,
      href: '/admin/comptabilite/grand-livre',
      color: 'purple'
    },
    {
      titre: 'Balance Générale',
      description: 'Consulter la balance',
      icon: Scale,
      href: '/admin/comptabilite/balance',
      color: 'orange'
    },
    {
      titre: 'Factures Fournisseurs',
      description: 'Gérer les factures fournisseurs',
      icon: FileText,
      href: '/admin/comptabilite/factures-fournisseurs',
      color: 'red'
    },
    {
      titre: 'Export FEC',
      description: 'Exporter au format FEC',
      icon: Download,
      href: '/admin/comptabilite/exports/fec',
      color: 'gray'
    },
    {
      titre: 'TVA & CA3',
      description: 'Déclaration de TVA',
      icon: DollarSign,
      href: '/admin/comptabilite/tva',
      color: 'indigo'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des données comptables...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Comptabilité
              </h1>
              <p className="text-gray-600 mt-2">
                Gestion comptable et reporting financier
              </p>
            </div>
            
            {/* Sélecteur période */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Période :</label>
              <input
                type="month"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Nombre écritures */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Écritures</h3>
              </div>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{nombreEcritures}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Balance débit */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-700">Total Débit</h3>
              </div>
              <Scale className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {balanceDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-sm text-gray-500 mt-1">Solde débiteur</p>
          </div>

          {/* Balance crédit */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">Total Crédit</h3>
              </div>
              <Scale className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {balanceCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-sm text-gray-500 mt-1">Solde créditeur</p>
          </div>

          {/* Écritures non équilibrées */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {ecrituresNonEquilibrees > 0 ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                <h3 className="font-semibold text-gray-700">Alertes</h3>
              </div>
              {ecrituresNonEquilibrees > 0 ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <p className={`text-3xl font-bold ${ecrituresNonEquilibrees > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {ecrituresNonEquilibrees}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {ecrituresNonEquilibrees > 0 ? 'Écritures non équilibrées' : 'Toutes les écritures sont équilibrées'}
            </p>
          </div>
        </div>

        {/* Graphique CA vs Charges */}
        {donneesGraphique.length > 0 && (
          <div className="mb-8">
            <GraphiqueComptabilite donnees={donneesGraphique} periode={periode} />
          </div>
        )}

        {/* Menu navigation rapide */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Modules Comptabilité</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                red: 'bg-red-100 text-red-600',
                gray: 'bg-gray-100 text-gray-600',
                indigo: 'bg-indigo-100 text-indigo-600'
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className={`p-3 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.titre}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Alertes comptables */}
        {ecrituresNonEquilibrees > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  ⚠️ Attention : {ecrituresNonEquilibrees} écriture(s) non équilibrée(s)
                </h3>
                <p className="text-red-800 text-sm mb-3">
                  Certaines écritures comptables ont un déséquilibre débit/crédit. 
                  Veuillez les corriger pour garantir la cohérence comptable.
                </p>
                <Link
                  href="/admin/comptabilite/journal"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Voir le journal comptable
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
