'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  getPlanComptable,
  createPlanComptable,
  searchComptes,
  updateCompte,
  deleteCompte,
  exportPlanComptable,
  type CompteComptable,
  type PlanComptable
} from '@/lib/firebase/plan-comptable'
import { Plus, Download, Upload, Search, Filter, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export default function PlanComptablePage() {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<PlanComptable | null>(null)
  const [comptes, setComptes] = useState<CompteComptable[]>([])
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'charge' | 'produit' | 'bilan'>('all')
  const [classeFilter, setClasseFilter] = useState<string>('all')
  const [actifFilter, setActifFilter] = useState<'all' | 'actif' | 'inactif'>('all')

  const societeId = 'solaire-nettoyage' // TODO: Dynamique selon multi-sociétés

  useEffect(() => {
    loadPlanComptable()
  }, [])

  useEffect(() => {
    if (plan) {
      filterComptes()
    }
  }, [searchQuery, typeFilter, classeFilter, actifFilter, plan])

  async function loadPlanComptable() {
    try {
      setLoading(true)
      let planData = await getPlanComptable(societeId)
      
      // Si pas de plan, créer avec PCG par défaut
      if (!planData) {
        await createPlanComptable(societeId, 'Solaire Nettoyage')
        planData = await getPlanComptable(societeId)
      }
      
      setPlan(planData)
      setComptes(planData?.comptes || [])
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur chargement plan comptable')
    } finally {
      setLoading(false)
    }
  }

  async function filterComptes() {
    if (!plan) return
    
    try {
      const filters: any = {}
      
      if (searchQuery) filters.query = searchQuery
      if (typeFilter !== 'all') filters.type = typeFilter
      if (classeFilter !== 'all') filters.classe = classeFilter
      if (actifFilter === 'actif') filters.actifOnly = true
      
      const result = await searchComptes(societeId, filters)
      
      if (actifFilter === 'inactif') {
        setComptes(result.filter(c => !c.actif))
      } else {
        setComptes(result)
      }
    } catch (error) {
      console.error('Erreur filtrage:', error)
    }
  }

  async function handleToggleActif(compte: CompteComptable) {
    try {
      await updateCompte(societeId, compte.numero, { actif: !compte.actif })
      await loadPlanComptable()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur modification')
    }
  }

  async function handleSupprimer(compte: CompteComptable) {
    if (!confirm(`Supprimer le compte ${compte.numero} - ${compte.intitule} ?\n\nAttention : vérifiez qu'il n'est pas utilisé.`)) {
      return
    }

    try {
      await deleteCompte(societeId, compte.numero)
      alert('✅ Compte supprimé')
      await loadPlanComptable()
    } catch (error: any) {
      console.error('Erreur:', error)
      alert('❌ ' + error.message)
    }
  }

  async function handleExport() {
    try {
      const data = await exportPlanComptable(societeId)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plan-comptable-${societeId}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur export:', error)
      alert('❌ Erreur lors de l\'export')
    }
  }

  // Grouper par classe
  const comptesParClasse = comptes.reduce((acc, compte) => {
    const classe = compte.classe
    if (!acc[classe]) acc[classe] = []
    acc[classe].push(compte)
    return acc
  }, {} as Record<string, CompteComptable[]>)

  const classesOrdonnees = Object.keys(comptesParClasse).sort()

  const classeLabels: Record<string, string> = {
    '4': 'Classe 4 - Comptes de Tiers',
    '5': 'Classe 5 - Comptes Financiers',
    '6': 'Classe 6 - Comptes de Charges',
    '7': 'Classe 7 - Comptes de Produits'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Comptable</h1>
          <p className="text-gray-600 mt-2">
            {comptes.length} compte{comptes.length > 1 ? 's' : ''} • {plan?.societeNom}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Retour
          </Link>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <Link
            href="/admin/comptabilite/plan-comptable/import"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            <Upload className="w-4 h-4" />
            Importer
          </Link>
          <Link
            href="/admin/comptabilite/plan-comptable/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nouveau Compte
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Comptes</p>
          <p className="text-3xl font-bold text-gray-900">{plan?.comptes.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Charges (Classe 6)</p>
          <p className="text-3xl font-bold text-red-600">
            {plan?.comptes.filter(c => c.classe === '6').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Produits (Classe 7)</p>
          <p className="text-3xl font-bold text-green-600">
            {plan?.comptes.filter(c => c.classe === '7').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Actifs</p>
          <p className="text-3xl font-bold text-blue-600">
            {plan?.comptes.filter(c => c.actif).length || 0}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Recherche */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par numéro ou intitulé..."
                className="w-full pl-10 pr-4 py-2 border rounded"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous types</option>
              <option value="charge">Charges</option>
              <option value="produit">Produits</option>
              <option value="bilan">Bilan</option>
            </select>
          </div>

          {/* Classe */}
          <div>
            <select
              value={classeFilter}
              onChange={(e) => setClasseFilter(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Toutes classes</option>
              <option value="4">Classe 4 - Tiers</option>
              <option value="5">Classe 5 - Financier</option>
              <option value="6">Classe 6 - Charges</option>
              <option value="7">Classe 7 - Produits</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <select
              value={actifFilter}
              onChange={(e) => setActifFilter(e.target.value as any)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">Tous statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>

          {/* Reset */}
          {(searchQuery || typeFilter !== 'all' || classeFilter !== 'all' || actifFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setTypeFilter('all')
                setClasseFilter('all')
                setActifFilter('all')
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste des comptes par classe */}
      {comptes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Aucun compte trouvé avec ces filtres</p>
        </div>
      ) : (
        <div className="space-y-6">
          {classesOrdonnees.map(classe => (
            <div key={classe} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <h2 className="text-lg font-bold text-gray-900">
                  {classeLabels[classe] || `Classe ${classe}`}
                  <span className="text-sm font-normal text-gray-600 ml-3">
                    ({comptesParClasse[classe].length} compte{comptesParClasse[classe].length > 1 ? 's' : ''})
                  </span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Intitulé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        TVA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comptesParClasse[classe].map(compte => (
                      <tr 
                        key={compte.numero}
                        className={!compte.actif ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50'}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-gray-900">
                            {compte.numero}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{compte.intitule}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            compte.type === 'charge' 
                              ? 'bg-red-100 text-red-700'
                              : compte.type === 'produit'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {compte.type === 'charge' ? 'Charge' : compte.type === 'produit' ? 'Produit' : 'Bilan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {compte.tvaDeductible && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                              TVA Déd.
                            </span>
                          )}
                          {compte.tvaCollectee && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              TVA Coll.
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            compte.actif
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {compte.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <Link
                              href={`/admin/comptabilite/plan-comptable/${compte.numero}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleToggleActif(compte)}
                              className="text-gray-600 hover:text-gray-900"
                              title={compte.actif ? 'Désactiver' : 'Activer'}
                            >
                              {compte.actif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleSupprimer(compte)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
