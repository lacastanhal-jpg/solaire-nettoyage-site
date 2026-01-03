'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getAllInterventionsCalendar } from '@/lib/firebase/interventions-calendar'
import { getAllClients } from '@/lib/firebase/clients'
import { getAllGroupes } from '@/lib/firebase/groupes'
import { getAllEquipes } from '@/lib/firebase/equipes'
import { affecterInterventionsEnMasse } from '@/lib/firebase/workflow-devis-intervention'
import { getDevisById } from '@/lib/firebase/devis'
import type { InterventionCalendar } from '@/lib/firebase/interventions-calendar'
import { Search, Calendar, Users, Filter, Download, Plus, Eye, Edit2, Trash2, CheckCircle2 } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Composant avec useSearchParams wrappé dans Suspense
function ListeInterventionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Paramètres URL pour mode affectation
  const devisId = searchParams.get('devisId')
  const modeAffectation = searchParams.get('mode') === 'affectation'
  
  const [interventions, setInterventions] = useState<InterventionCalendar[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [groupes, setGroupes] = useState<any[]>([])
  const [equipes, setEquipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Mode affectation
  const [devisNumero, setDevisNumero] = useState<string>('')
  const [affectations, setAffectations] = useState<{
    [key: string]: {
      equipeId: string
      equipeName: string
      dateDebut: string
      dateFin: string
    }
  }>({})
  const [savingAffectations, setSavingAffectations] = useState(false)
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEquipe, setSelectedEquipe] = useState<string>('all')
  const [selectedStatut, setSelectedStatut] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedGroupe, setSelectedGroupe] = useState<string>('all')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [interventionsData, clientsData, groupesData, equipesData] = await Promise.all([
        getAllInterventionsCalendar(),
        getAllClients(),
        getAllGroupes(),
        getAllEquipes()
      ])
      
      setInterventions(interventionsData)
      setClients(clientsData)
      setGroupes(groupesData)
      setEquipes(equipesData)
      
      // Charger infos devis si mode affectation
      if (devisId) {
        const devis = await getDevisById(devisId)
        if (devis) {
          setDevisNumero(devis.numero)
        }
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // ⭐ HANDLERS MODE AFFECTATION EN MASSE
  function handleEquipeChange(interventionId: string, equipeId: string) {
    const equipe = equipes.find(e => e.id === equipeId)
    const equipeName = equipe ? equipe.nom : `Équipe ${equipeId}`
    
    setAffectations(prev => ({
      ...prev,
      [interventionId]: {
        ...prev[interventionId],
        equipeId,
        equipeName
      }
    }))
  }

  function handleDateDebutChange(interventionId: string, date: string) {
    setAffectations(prev => ({
      ...prev,
      [interventionId]: {
        ...prev[interventionId],
        dateDebut: date,
        dateFin: prev[interventionId]?.dateFin || date  // Même date par défaut
      }
    }))
  }

  function handleDateFinChange(interventionId: string, date: string) {
    setAffectations(prev => ({
      ...prev,
      [interventionId]: {
        ...prev[interventionId],
        dateFin: date
      }
    }))
  }

  function appliquerEquipeATous() {
    const interventionsList = filteredInterventions.filter(i => i.statut === 'Planifiée')
    if (interventionsList.length === 0) return
    
    const premiereIntervention = interventionsList[0]
    if (!premiereIntervention?.id) return
    
    const premiereAffectation = affectations[premiereIntervention.id]
    if (!premiereAffectation?.equipeId) {
      alert('⚠️ Sélectionnez d\'abord une équipe sur la première ligne')
      return
    }
    
    const newAffectations = { ...affectations }
    interventionsList.forEach(int => {
      if (!int.id) return
      newAffectations[int.id] = {
        ...newAffectations[int.id],
        equipeId: premiereAffectation.equipeId,
        equipeName: premiereAffectation.equipeName
      }
    })
    setAffectations(newAffectations)
  }

  function appliquerDatesATous() {
    const interventionsList = filteredInterventions.filter(i => i.statut === 'Planifiée')
    if (interventionsList.length === 0) return
    
    const premiereIntervention = interventionsList[0]
    if (!premiereIntervention?.id) return
    
    const premiereAffectation = affectations[premiereIntervention.id]
    if (!premiereAffectation?.dateDebut) {
      alert('⚠️ Sélectionnez d\'abord une date sur la première ligne')
      return
    }
    
    const newAffectations = { ...affectations }
    interventionsList.forEach(int => {
      if (!int.id) return
      newAffectations[int.id] = {
        ...newAffectations[int.id],
        dateDebut: premiereAffectation.dateDebut,
        dateFin: premiereAffectation.dateFin
      }
    })
    setAffectations(newAffectations)
  }

  async function handleValiderToutesAffectations() {
    const interventionsList = filteredInterventions.filter(i => i.statut === 'Planifiée')
    
    // Vérifier que toutes ont équipe + dates
    const incomplete = interventionsList.some(int => {
      if (!int.id) return true
      const aff = affectations[int.id]
      return !aff?.equipeId || !aff?.dateDebut || !aff?.dateFin
    })
    
    if (incomplete) {
      alert('⚠️ Toutes les interventions doivent avoir une équipe et des dates')
      return
    }
    
    if (!window.confirm(
      `✅ VALIDER ${interventionsList.length} AFFECTATION(S) ?\n\n` +
      `Les interventions passeront en statut "Planifiée"`
    )) {
      return
    }
    
    try {
      setSavingAffectations(true)
      
      const affectationsArray = interventionsList
        .filter(int => int.id) // Filtrer ceux qui ont un id
        .map(int => ({
          interventionId: int.id!,
          dateDebut: affectations[int.id!].dateDebut,
          dateFin: affectations[int.id!].dateFin,
          equipeId: parseInt(affectations[int.id!].equipeId),
          equipeName: affectations[int.id!].equipeName
        }))
      
      const result = await affecterInterventionsEnMasse(affectationsArray)
      
      if (result.success) {
        alert(`✅ ${interventionsList.length} intervention(s) planifiée(s) avec succès !`)
        router.push('/admin/calendrier')
      } else {
        alert(`❌ Erreurs:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'affectation')
    } finally {
      setSavingAffectations(false)
    }
  }

  // Filtrage
  const filteredInterventions = interventions.filter(inter => {
    // Filtre par devisId si présent (mode affectation)
    if (devisId && inter.devisId !== devisId) {
      return false
    }
    // Filtre équipe
    if (selectedEquipe !== 'all' && inter.equipeId !== parseInt(selectedEquipe)) {
      return false
    }
    // Filtre statut
    if (selectedStatut !== 'all' && inter.statut !== selectedStatut) {
      return false
    }
    // Filtre client
    if (selectedClient !== 'all' && inter.clientId !== selectedClient) {
      return false
    }
    // Filtre groupe
    if (selectedGroupe !== 'all' && inter.groupeId !== selectedGroupe) {
      return false
    }
    // Filtre date début
    if (dateDebut && inter.dateDebut < dateDebut) {
      return false
    }
    // Filtre date fin
    if (dateFin && inter.dateDebut > dateFin) {
      return false
    }
    // Recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        inter.siteName?.toLowerCase().includes(search) ||
        inter.clientName?.toLowerCase().includes(search) ||
        inter.notes?.toLowerCase().includes(search) ||
        inter.type?.toLowerCase().includes(search)
      )
    }
    return true
  })

  // Tri par date (plus récent en premier)
  const sortedInterventions = [...filteredInterventions].sort((a, b) => 
    new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
  )

  // Pagination
  const totalPages = Math.ceil(sortedInterventions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInterventions = sortedInterventions.slice(startIndex, endIndex)

  // Stats
  const stats = {
    total: interventions.length,
    planifiees: interventions.filter(i => i.statut === 'Planifiée').length,
    enCours: interventions.filter(i => i.statut === 'En cours').length,
    terminees: interventions.filter(i => i.statut === 'Terminée').length,
    equipe1: interventions.filter(i => i.equipeId === 1).length,
    equipe2: interventions.filter(i => i.equipeId === 2).length,
    equipe3: interventions.filter(i => i.equipeId === 3).length,
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'bg-gray-100 text-gray-800'
      case 'Planifiée': return 'bg-blue-100 text-blue-800'
      case 'En cours': return 'bg-yellow-100 text-yellow-800'
      case 'Terminée': return 'bg-green-100 text-green-800'
      case 'Annulée': return 'bg-gray-100 text-gray-800'
      case 'Demande modification': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEquipeColor = (equipeId: number) => {
    switch (equipeId) {
      case 1: return 'bg-red-100 text-red-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedEquipe('all')
    setSelectedStatut('all')
    setSelectedClient('all')
    setSelectedGroupe('all')
    setDateDebut('')
    setDateFin('')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">⏳ Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Liste des Interventions</h1>
                <p className="text-sm text-gray-600">Gestion administrative complète</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/calendrier"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Vue Planning
              </Link>
              <Link
                href="/admin/nouvelle-intervention"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Intervention
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ⭐ BANDEAU MODE AFFECTATION */}
        {devisId && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    ✅ {filteredInterventions.length} intervention(s) créée(s) depuis devis {devisNumero}
                  </h3>
                  <p className="text-gray-700 mt-1">
                    {modeAffectation 
                      ? '📋 Affectez maintenant les équipes et les dates pour planifier les interventions'
                      : 'Les interventions sont en attente de planification'}
                  </p>
                </div>
              </div>
              {!modeAffectation && (
                <Link
                  href={`/admin/interventions?devisId=${devisId}&mode=affectation`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Mode Affectation
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-500">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600">Planifiées</div>
            <div className="text-2xl font-bold text-blue-900">{stats.planifiees}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600">En cours</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.enCours}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600">Terminées</div>
            <div className="text-2xl font-bold text-green-900">{stats.terminees}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-600">Équipe 1</div>
            <div className="text-2xl font-bold text-red-900">{stats.equipe1}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-700">
            <div className="text-sm text-gray-600">Équipe 2</div>
            <div className="text-2xl font-bold text-blue-900">{stats.equipe2}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-700">
            <div className="text-sm text-gray-600">Équipe 3</div>
            <div className="text-2xl font-bold text-green-900">{stats.equipe3}</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Recherche
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Site, client, notes..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Équipe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Équipe</label>
              <select
                value={selectedEquipe}
                onChange={(e) => setSelectedEquipe(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Toutes les équipes</option>
                <option value="1">Équipe 1</option>
                <option value="2">Équipe 2</option>
                <option value="3">Équipe 3</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tous les statuts</option>
                <option value="Planifiée">Planifiée</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
                <option value="Demande modification">Demande modification</option>
              </select>
            </div>

            {/* Groupe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Groupe</label>
              <select
                value={selectedGroupe}
                onChange={(e) => setSelectedGroupe(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tous les groupes</option>
                {groupes.map(groupe => (
                  <option key={groupe.id} value={groupe.id}>{groupe.nom}</option>
                ))}
              </select>
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">Tous les clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.company}</option>
                ))}
              </select>
            </div>

            {/* Date début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredInterventions.length} intervention(s) trouvée(s)
          </div>
        </div>

        {/* ⭐ MODE AFFECTATION EN MASSE */}
        {modeAffectation && devisId && filteredInterventions.some(i => i.statut === 'Planifiée') && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-300 p-6 mb-6 shadow-lg">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Mode Affectation Rapide</h3>
              <p className="text-gray-700">Affectez les équipes et dates pour toutes les interventions en une seule fois</p>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={appliquerEquipeATous}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Même équipe pour tous
              </button>
              <button
                onClick={appliquerDatesATous}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Mêmes dates pour tous
              </button>
            </div>

            {/* Tableau d'affectation */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Site</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Client</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Montant</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Équipe *</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Date début *</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Date fin *</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInterventions
                    .filter(i => i.statut === 'Planifiée' && i.id) // Filtrer avec statut ET id
                    .map(intervention => (
                    <tr key={intervention.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{intervention.siteName}</div>
                        <div className="text-xs text-gray-600">{intervention.id}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{intervention.clientName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900">
                          {intervention.totalTTC?.toFixed(2) || '0.00'}€
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={affectations[intervention.id!]?.equipeId || ''}
                          onChange={(e) => handleEquipeChange(intervention.id!, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                          <option value="">Choisir équipe...</option>
                          {equipes.map(equipe => (
                            <option key={equipe.id} value={equipe.id}>{equipe.nom}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={affectations[intervention.id!]?.dateDebut || ''}
                          onChange={(e) => handleDateDebutChange(intervention.id!, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={affectations[intervention.id!]?.dateFin || ''}
                          onChange={(e) => handleDateFinChange(intervention.id!, e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bouton validation */}
            <div className="flex justify-end">
              <button
                onClick={handleValiderToutesAffectations}
                disabled={savingAffectations}
                className="px-10 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {savingAffectations ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Validation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    ✅ VALIDER TOUTES LES AFFECTATIONS
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Équipe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentInterventions.map((intervention) => (
                  <tr key={intervention.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(intervention.dateDebut).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {intervention.heureDebut} - {intervention.heureFin}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{intervention.siteName}</div>
                      {intervention.surface && (
                        <div className="text-xs text-gray-600">{intervention.surface} m²</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{intervention.clientName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEquipeColor(intervention.equipeId)}`}>
                        Équipe {intervention.equipeId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{intervention.type || 'Nettoyage'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatutColor(intervention.statut)}`}>
                        {intervention.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/interventions/${intervention.id}`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Voir détail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/interventions/${intervention.id}/modifier`}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message si vide */}
        {currentInterventions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune intervention trouvée</h3>
            <p className="text-gray-600 mb-6">Modifiez vos filtres ou créez une nouvelle intervention</p>
            <Link
              href="/admin/nouvelle-intervention"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Intervention
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

// Page principale avec Suspense Boundary
export default function ListeInterventionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des interventions...</p>
        </div>
      </div>
    }>
      <ListeInterventionsContent />
    </Suspense>
  )
}
