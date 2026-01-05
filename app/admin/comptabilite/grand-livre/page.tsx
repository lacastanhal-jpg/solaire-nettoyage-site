'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getEcrituresByCompte,
  getTotalParCompte,
  type EcritureComptable,
  type LigneEcriture
} from '@/lib/firebase/ecritures-comptables'
import {
  getPlanComptable,
  searchComptes,
  type CompteComptable
} from '@/lib/firebase/plan-comptable'
import { 
  BookOpen, 
  Download, 
  Filter,
  Calendar,
  Search,
  ChevronLeft,
  TrendingUp
} from 'lucide-react'
import * as XLSX from 'xlsx'

interface LigneGrandLivre {
  date: string
  numeroPiece: string
  libelle: string
  debit: number
  credit: number
  solde: number
  ecritureId: string
}

export default function GrandLivrePage() {
  const [loading, setLoading] = useState(false)
  const [comptes, setComptes] = useState<CompteComptable[]>([])
  const [compteSelectionne, setCompteSelectionne] = useState<string>('')
  const [compteIntitule, setCompteIntitule] = useState<string>('')
  const [lignes, setLignes] = useState<LigneGrandLivre[]>([])
  
  // Filtres
  const [periode, setPeriode] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [searchCompteQuery, setSearchCompteQuery] = useState('')
  const [comptesFiltre, setComptesFiltre] = useState<CompteComptable[]>([])

  // Totaux
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [solde, setSolde] = useState(0)

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadComptes()
  }, [])

  useEffect(() => {
    if (compteSelectionne) {
      loadGrandLivre()
    }
  }, [compteSelectionne, periode])

  useEffect(() => {
    filtrerComptes()
  }, [comptes, searchCompteQuery])

  async function loadComptes() {
    try {
      const plan = await getPlanComptable(societeId)
      if (plan) {
        const comptesActifs = plan.comptes.filter(c => c.actif)
        setComptes(comptesActifs)
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error)
    }
  }

  function filtrerComptes() {
    if (!searchCompteQuery) {
      setComptesFiltre(comptes.slice(0, 10)) // Limiter à 10 par défaut
      return
    }

    const query = searchCompteQuery.toLowerCase()
    const filtered = comptes.filter(c => 
      c.numero.toLowerCase().includes(query) ||
      c.intitule.toLowerCase().includes(query)
    )
    setComptesFiltre(filtered.slice(0, 20)) // Max 20 résultats
  }

  async function loadGrandLivre() {
    try {
      setLoading(true)
      setLignes([])
      
      // Calculer début et fin du mois
      const [year, month] = periode.split('-')
      const dateDebut = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const dateFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      
      // Récupérer écritures contenant ce compte
      const ecritures = await getEcrituresByCompte(compteSelectionne, societeId)
      
      // Filtrer par période
      const ecrituresPeriode = ecritures.filter(e => 
        e.dateEcriture >= dateDebut && e.dateEcriture <= dateFin
      )
      
      // Construire les lignes du grand livre avec solde progressif
      const lignesGL: LigneGrandLivre[] = []
      let soldeProgressif = 0
      
      // Trier par date
      const ecrituresTries = ecrituresPeriode.sort((a, b) => 
        new Date(a.dateEcriture).getTime() - new Date(b.dateEcriture).getTime()
      )
      
      ecrituresTries.forEach(ecriture => {
        // Trouver les lignes concernant ce compte
        const lignesCompte = ecriture.lignes.filter(l => 
          l.compteComptable === compteSelectionne
        )
        
        lignesCompte.forEach(ligne => {
          const debit = ligne.sens === 'debit' ? ligne.montant : 0
          const credit = ligne.sens === 'credit' ? ligne.montant : 0
          soldeProgressif += (debit - credit)
          
          lignesGL.push({
            date: ecriture.dateEcriture,
            numeroPiece: ecriture.numeroPiece,
            libelle: ligne.libelle || ecriture.libelle,
            debit,
            credit,
            solde: soldeProgressif,
            ecritureId: ecriture.id
          })
        })
      })
      
      setLignes(lignesGL)
      
      // Calculer totaux
      const totDebit = lignesGL.reduce((sum, l) => sum + l.debit, 0)
      const totCredit = lignesGL.reduce((sum, l) => sum + l.credit, 0)
      setTotalDebit(totDebit)
      setTotalCredit(totCredit)
      setSolde(totDebit - totCredit)
      
    } catch (error) {
      console.error('Erreur chargement grand livre:', error)
    } finally {
      setLoading(false)
    }
  }

  function selectionnerCompte(compte: CompteComptable) {
    setCompteSelectionne(compte.numero)
    setCompteIntitule(compte.intitule)
    setSearchCompteQuery('')
  }

  function exporterExcel() {
    const data = lignes.map(ligne => ({
      'Date': new Date(ligne.date).toLocaleDateString('fr-FR'),
      'N° Pièce': ligne.numeroPiece,
      'Libellé': ligne.libelle,
      'Débit': ligne.debit.toFixed(2) + ' €',
      'Crédit': ligne.credit.toFixed(2) + ' €',
      'Solde': ligne.solde.toFixed(2) + ' €'
    }))
    
    // Ajouter ligne totaux
    data.push({
      'Date': '',
      'N° Pièce': '',
      'Libellé': 'TOTAUX',
      'Débit': totalDebit.toFixed(2) + ' €',
      'Crédit': totalCredit.toFixed(2) + ' €',
      'Solde': solde.toFixed(2) + ' €'
    })
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Largeurs colonnes
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 15 }, // N° Pièce
      { wch: 50 }, // Libellé
      { wch: 12 }, // Débit
      { wch: 12 }, // Crédit
      { wch: 12 }  // Solde
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, 'Grand Livre')
    
    const [year, month] = periode.split('-')
    const fileName = `grand-livre-${compteSelectionne}-${year}-${month}.xlsx`
    XLSX.writeFile(wb, fileName)
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
                <BookOpen className="w-8 h-8 text-purple-600" />
                Grand Livre
              </h1>
              <p className="text-gray-600 mt-2">
                Consultation des écritures par compte
              </p>
            </div>
            
            <button
              onClick={exporterExcel}
              disabled={lignes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Sélection compte */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Sélection Compte & Période</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche compte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Compte Comptable
              </label>
              <input
                type="text"
                value={compteSelectionne ? `${compteSelectionne} - ${compteIntitule}` : searchCompteQuery}
                onChange={(e) => {
                  if (compteSelectionne) {
                    setCompteSelectionne('')
                    setCompteIntitule('')
                  }
                  setSearchCompteQuery(e.target.value)
                }}
                placeholder="Rechercher un compte (numéro ou intitulé)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Liste comptes */}
              {!compteSelectionne && searchCompteQuery && (
                <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {comptesFiltre.map(compte => (
                    <button
                      key={compte.numero}
                      onClick={() => selectionnerCompte(compte)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-blue-600">{compte.numero}</span>
                      <span className="text-gray-600 ml-2">- {compte.intitule}</span>
                    </button>
                  ))}
                  {comptesFiltre.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      Aucun compte trouvé
                    </div>
                  )}
                </div>
              )}
            </div>

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
          </div>
        </div>

        {/* Message si pas de compte sélectionné */}
        {!compteSelectionne && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <p className="text-lg font-medium text-blue-900 mb-2">
              Sélectionnez un compte comptable
            </p>
            <p className="text-blue-700">
              Recherchez et sélectionnez un compte pour consulter ses écritures
            </p>
          </div>
        )}

        {/* Affichage grand livre */}
        {compteSelectionne && (
          <>
            {/* En-tête compte */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Compte sélectionné</p>
                  <p className="text-lg font-bold text-purple-900">
                    {compteSelectionne} - {compteIntitule}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Période : {new Date(periode + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCompteSelectionne('')
                    setCompteIntitule('')
                    setLignes([])
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Changer de compte
                </button>
              </div>
            </div>

            {/* Totaux */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 mb-1">Mouvements</p>
                <p className="text-2xl font-bold text-gray-900">{lignes.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 mb-1">Total Débit</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 mb-1">Total Crédit</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600 mb-1">Solde Final</p>
                <p className={`text-2xl font-bold ${solde >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            </div>

            {/* Liste lignes */}
            {loading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des écritures...</p>
              </div>
            ) : lignes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">Aucun mouvement</p>
                <p className="text-gray-600">
                  Aucune écriture pour ce compte sur cette période
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          N° Pièce
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Libellé
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Débit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Crédit
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Solde
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lignes.map((ligne, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(ligne.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {ligne.numeroPiece}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                            {ligne.libelle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                            {ligne.debit > 0 ? ligne.debit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-purple-600">
                            {ligne.credit > 0 ? ligne.credit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                            ligne.solde >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {ligne.solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </td>
                        </tr>
                      ))}
                      {/* Ligne totaux */}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={3}>
                          TOTAUX
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                          {totalDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                          {totalCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                          solde >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {solde.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
