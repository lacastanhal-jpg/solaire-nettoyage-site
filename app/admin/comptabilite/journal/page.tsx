'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getEcrituresByPeriode,
  type EcritureComptable 
} from '@/lib/firebase/ecritures-comptables'
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  Search,
  Eye,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'
import * as XLSX from 'xlsx'

export default function JournalComptablePage() {
  const [loading, setLoading] = useState(true)
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([])
  const [ecrituresFiltrees, setEcrituresFiltrees] = useState<EcritureComptable[]>([])
  
  // Filtres
  const [periode, setPeriode] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('all')

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadEcritures()
  }, [periode])

  useEffect(() => {
    filtrerEcritures()
  }, [ecritures, sourceTypeFilter, searchQuery, statutFilter])

  async function loadEcritures() {
    try {
      setLoading(true)
      
      // Calculer début et fin du mois
      const [year, month] = periode.split('-')
      const dateDebut = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const dateFin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      
      const data = await getEcrituresByPeriode(dateDebut, dateFin, societeId)
      setEcritures(data)
      
    } catch (error) {
      console.error('Erreur chargement écritures:', error)
    } finally {
      setLoading(false)
    }
  }

  function filtrerEcritures() {
    let filtered = [...ecritures]
    
    // Filtre par type source
    if (sourceTypeFilter !== 'all') {
      filtered = filtered.filter(e => e.sourceType === sourceTypeFilter)
    }
    
    // Filtre par statut
    if (statutFilter !== 'all') {
      filtered = filtered.filter(e => e.statut === statutFilter)
    }
    
    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(e => 
        e.id.toLowerCase().includes(query) ||
        e.numeroPiece.toLowerCase().includes(query) ||
        e.libelle.toLowerCase().includes(query)
      )
    }
    
    setEcrituresFiltrees(filtered)
  }

  function exporterExcel() {
    // Préparer les données
    const data = ecrituresFiltrees.map(ecriture => ({
      'N° Écriture': ecriture.id,
      'Date': new Date(ecriture.dateEcriture).toLocaleDateString('fr-FR'),
      'N° Pièce': ecriture.numeroPiece,
      'Libellé': ecriture.libelle,
      'Type Source': ecriture.sourceType,
      'Débit': ecriture.totalDebit.toFixed(2) + ' €',
      'Crédit': ecriture.totalCredit.toFixed(2) + ' €',
      'Équilibrée': ecriture.equilibre ? 'Oui' : 'Non',
      'Statut': ecriture.statut
    }))
    
    // Créer le workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Largeurs colonnes
    ws['!cols'] = [
      { wch: 15 }, // N° Écriture
      { wch: 12 }, // Date
      { wch: 15 }, // N° Pièce
      { wch: 40 }, // Libellé
      { wch: 20 }, // Type Source
      { wch: 12 }, // Débit
      { wch: 12 }, // Crédit
      { wch: 10 }, // Équilibrée
      { wch: 10 }  // Statut
    ]
    
    XLSX.utils.book_append_sheet(wb, ws, 'Journal Comptable')
    
    // Télécharger
    const [year, month] = periode.split('-')
    const fileName = `journal-comptable-${year}-${month}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const sourceTypeLabels = {
    'facture_fournisseur': 'Facture Fournisseur',
    'facture_client': 'Facture Client',
    'note_frais': 'Note de Frais',
    'manuel': 'Écriture Manuelle'
  }

  const statutLabels = {
    'validee': 'Validée',
    'lettree': 'Lettrée'
  }

  // Calculer les totaux
  const totalDebit = ecrituresFiltrees.reduce((sum, e) => sum + e.totalDebit, 0)
  const totalCredit = ecrituresFiltrees.reduce((sum, e) => sum + e.totalCredit, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement du journal comptable...</p>
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
                <FileText className="w-8 h-8 text-green-600" />
                Journal Comptable
              </h1>
              <p className="text-gray-600 mt-2">
                Consultation des écritures comptables
              </p>
            </div>
            
            <button
              onClick={exporterExcel}
              disabled={ecrituresFiltrees.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Type source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Source
              </label>
              <select
                value={sourceTypeFilter}
                onChange={(e) => setSourceTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="facture_fournisseur">Factures Fournisseurs</option>
                <option value="facture_client">Factures Clients</option>
                <option value="note_frais">Notes de Frais</option>
                <option value="manuel">Écritures Manuelles</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="validee">Validées</option>
                <option value="lettree">Lettrées</option>
              </select>
            </div>

            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Recherche
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="N° écriture, pièce, libellé..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Totaux */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 mb-1">Écritures</p>
            <p className="text-2xl font-bold text-gray-900">{ecrituresFiltrees.length}</p>
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
        </div>

        {/* Liste écritures */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {ecrituresFiltrees.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Aucune écriture comptable</p>
              <p className="text-sm">
                {ecritures.length === 0 
                  ? "Aucune écriture pour cette période"
                  : "Aucune écriture ne correspond aux filtres sélectionnés"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Écriture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Pièce
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Libellé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Débit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crédit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ecrituresFiltrees.map((ecriture) => (
                    <tr key={ecriture.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(ecriture.dateEcriture).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">
                          {ecriture.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ecriture.numeroPiece}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {ecriture.libelle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sourceTypeLabels[ecriture.sourceType as keyof typeof sourceTypeLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        {ecriture.totalDebit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-purple-600">
                        {ecriture.totalCredit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {!ecriture.equilibre ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3" />
                            Non équilibrée
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ecriture.statut === 'lettree' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {statutLabels[ecriture.statut as keyof typeof statutLabels]}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            // TODO: Ouvrir modal détail écriture
                            alert(`Détail écriture ${ecriture.id} - À implémenter`)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir détail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
