'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllInterventionsCalendar,
  getAllEquipes,
  getAllClients,
  getAllGroupes,
  deleteInterventionCalendar,
  type InterventionCalendar,
  type Equipe,
  type Client,
  type Groupe
} from '@/lib/firebase'
import ImportInterventionsModal from '@/components/ImportInterventionsModal'
import SyncRapportsButton from '@/components/SyncRapportsButton'

export default function CalendrierPage() {
  const router = useRouter()
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEquipe, setSelectedEquipe] = useState<string>('all')
  const [selectedStatut, setSelectedStatut] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedGroupe, setSelectedGroupe] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [interventionsData, equipesData, clientsData, groupesData] = await Promise.all([
        getAllInterventionsCalendar(),
        getAllEquipes(),
        getAllClients(),
        getAllGroupes()
      ])
      setInterventions(interventionsData)
      setEquipes(equipesData)
      setClients(clientsData)
      setGroupes(groupesData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette intervention ?')) return

    try {
      await deleteInterventionCalendar(id)
      alert('✅ Intervention supprimée')
      loadData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur suppression')
    }
  }

  const toggleInterventionSelection = (id: string) => {
    setSelectedInterventions(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedInterventions.length === sortedInterventions.length) {
      setSelectedInterventions([])
    } else {
      setSelectedInterventions(sortedInterventions.map(i => i.id!))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedInterventions.length === 0) {
      alert('⚠️ Aucune intervention sélectionnée')
      return
    }

    if (!confirm(`Supprimer ${selectedInterventions.length} intervention(s) sélectionnée(s) ?`)) return

    try {
      setDeleting(true)
      let success = 0
      let errors = 0

      for (const id of selectedInterventions) {
        try {
          await deleteInterventionCalendar(id)
          success++
        } catch (error) {
          console.error(`Erreur suppression ${id}:`, error)
          errors++
        }
      }

      alert(`✅ ${success} intervention(s) supprimée(s)${errors > 0 ? ` - ${errors} erreur(s)` : ''}`)
      setSelectedInterventions([])
      loadData()
    } catch (error) {
      console.error('Erreur suppression multiple:', error)
      alert('❌ Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const getEquipeCouleur = (equipeId: number) => {
    switch (equipeId) {
      case 1: return 'bg-red-100 text-red-900 border-red-300'
      case 2: return 'bg-blue-100 text-blue-900 border-blue-300'
      case 3: return 'bg-green-100 text-green-900 border-green-300'
      default: return 'bg-gray-100 text-gray-900 border-gray-300'
    }
  }

  const getStatutCouleur = (statut: InterventionCalendar['statut']) => {
    switch (statut) {
      case 'Planifiée': return 'bg-blue-100 text-blue-900'
      case 'En cours': return 'bg-yellow-100 text-yellow-900'
      case 'Terminée': return 'bg-green-100 text-green-900'
      case 'Annulée': return 'bg-gray-100 text-gray-900'
      case 'Demande modification': return 'bg-orange-100 text-orange-900'
    }
  }

  // Filtrer interventions
  const filteredInterventions = interventions.filter(inter => {
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
    // Recherche intelligente
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

  // Trier par date de début
  const sortedInterventions = [...filteredInterventions].sort((a, b) => 
    new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  )

  // Stats
  const stats = {
    total: interventions.length,
    planifiees: interventions.filter(i => i.statut === 'Planifiée').length,
    enCours: interventions.filter(i => i.statut === 'En cours').length,
    terminees: interventions.filter(i => i.statut === 'Terminée').length,
    demandes: interventions.filter(i => i.statut === 'Demande modification').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">⏳ Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendrier Interventions</h1>
                <p className="text-sm text-gray-900 font-medium">Planning global terrain</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/gestion-equipes"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                👥 Équipes
              </a>
              <a
                href="/admin/demandes-modifications"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
              >
                🔄 Demandes
              </a>
              <a
                href="/intranet/dashboard"
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
              >
                ← Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Boutons actions */}
        <div className="mb-8 flex gap-4">
          <a
            href="/admin/nouvelle-intervention"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            <span className="text-xl">➕</span>
            Nouvelle Intervention
          </a>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importer interventions
          </button>
        </div>

        {/* Synchronisation Rapports Praxedo */}
        <div className="mb-8">
          <SyncRapportsButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-purple-500 mb-2">{stats.total}</div>
            <div className="text-gray-900 font-bold">Total</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">{stats.planifiees}</div>
            <div className="text-gray-900 font-bold">Planifiées</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-yellow-500 mb-2">{stats.enCours}</div>
            <div className="text-gray-900 font-bold">En cours</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">{stats.terminees}</div>
            <div className="text-gray-900 font-bold">Terminées</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-orange-500 mb-2">{stats.demandes}</div>
            <div className="text-gray-900 font-bold text-xs">Demandes changement</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🔍 Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche intelligente */}
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-gray-900 mb-2">Recherche</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par site, client, notes, type..."
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
              />
            </div>

            {/* Filtre Groupe */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Groupe</label>
              <select
                value={selectedGroupe}
                onChange={(e) => {
                  setSelectedGroupe(e.target.value)
                  setSelectedClient('all') // Reset client quand on change de groupe
                }}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
              >
                <option value="all">Tous les groupes</option>
                {groupes.map(groupe => (
                  <option key={groupe.id} value={groupe.id}>
                    {groupe.nom} ({interventions.filter(i => i.groupeId === groupe.id).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Client */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
              >
                <option value="all">Tous les clients</option>
                {clients
                  .filter(c => selectedGroupe === 'all' || c.groupeId === selectedGroupe)
                  .map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company} ({interventions.filter(i => i.clientId === client.id).length})
                    </option>
                  ))}
              </select>
            </div>

            {/* Filtre Équipe */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Équipe</label>
              <select
                value={selectedEquipe}
                onChange={(e) => setSelectedEquipe(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
              >
                <option value="all">Toutes les équipes</option>
                <option value="1">🔴 Équipe 1 ({interventions.filter(i => i.equipeId === 1).length})</option>
                <option value="2">🔵 Équipe 2 ({interventions.filter(i => i.equipeId === 2).length})</option>
                <option value="3">🟢 Équipe 3 ({interventions.filter(i => i.equipeId === 3).length})</option>
              </select>
            </div>

            {/* Filtre Statut */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 mb-2">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
              >
                <option value="all">Tous les statuts</option>
                <option value="Planifiée">📅 Planifiée ({stats.planifiees})</option>
                <option value="En cours">🔄 En cours ({stats.enCours})</option>
                <option value="Terminée">✅ Terminée ({stats.terminees})</option>
                <option value="Demande modification">🔔 Demande modification ({stats.demandes})</option>
              </select>
            </div>
          </div>

          {/* Afficher le résultat du filtrage */}
          {(searchTerm || selectedGroupe !== 'all' || selectedClient !== 'all' || selectedEquipe !== 'all' || selectedStatut !== 'all') && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-bold text-purple-900">
                {filteredInterventions.length} intervention(s) trouvée(s) sur {interventions.length} au total
              </p>
            </div>
          )}
        </div>

        {/* Liste interventions */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-purple-600 border-b border-purple-700">
            <h3 className="text-lg font-bold text-white">
              📋 Interventions ({sortedInterventions.length})
            </h3>
          </div>

          {/* Barre d'actions sélection */}
          {sortedInterventions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {selectedInterventions.length === sortedInterventions.length && sortedInterventions.length > 0
                    ? '◻️ Tout désélectionner'
                    : '☑️ Tout sélectionner'}
                </button>
                {selectedInterventions.length > 0 && (
                  <span className="text-sm text-gray-700 font-medium">
                    {selectedInterventions.length} intervention(s) sélectionnée(s)
                  </span>
                )}
              </div>
              {selectedInterventions.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? '⏳ Suppression...' : `🗑️ Supprimer (${selectedInterventions.length})`}
                </button>
              )}
            </div>
          )}

          {sortedInterventions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-xl font-bold mb-2 text-gray-900">Aucune intervention</div>
              <div className="mb-6 text-gray-900 font-medium">
                {selectedEquipe !== 'all' || selectedStatut !== 'all' 
                  ? 'Aucune intervention ne correspond aux filtres'
                  : 'Commence par créer ta première intervention'
                }
              </div>
              {interventions.length === 0 && (
                <div className="flex gap-4 justify-center">
                  <a
                    href="/admin/nouvelle-intervention"
                    className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
                  >
                    ➕ Nouvelle Intervention
                  </a>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Importer interventions
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {sortedInterventions.map((inter) => (
                <div key={inter.id} className="p-6 hover:bg-blue-50">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedInterventions.includes(inter.id!)}
                        onChange={() => toggleInterventionSelection(inter.id!)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </div>

                    {/* Contenu intervention */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getEquipeCouleur(inter.equipeId)}`}>
                          {inter.equipeId === 1 ? '🔴' : inter.equipeId === 2 ? '🔵' : '🟢'} Équipe {inter.equipeId}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatutCouleur(inter.statut)}`}>
                          {inter.statut}
                        </span>
                        {inter.type === 'Urgence' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900">
                            🚨 Urgence
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {inter.clientName} - {inter.siteName}
                      </h4>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-900 font-medium">
                        {/* Période */}
                        <div className="col-span-2">
                          <span className="font-bold">📅 Période :</span>{' '}
                          {inter.dateDebut === inter.dateFin ? (
                            // Une seule journée
                            <span>
                              {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          ) : (
                            // Plusieurs jours
                            <span>
                              Du {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} au {new Date(inter.dateFin).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        
                        {/* Horaires */}
                        <div>
                          <span className="font-bold">🕐 Horaires :</span> {inter.heureDebut} - {inter.heureFin}
                        </div>
                        
                        <div>
                          <span className="font-bold">📐 Surface :</span> {inter.surface}m²
                        </div>
                        
                        <div>
                          <span className="font-bold">🏷️ Type :</span> {inter.type}
                        </div>
                      </div>

                      {inter.notes && (
                        <div className="mt-3 text-sm text-gray-900 font-medium">
                          <span className="font-bold">📝 Notes :</span> {inter.notes}
                        </div>
                      )}

                      {inter.demandeChangement && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-sm font-bold text-orange-900 mb-1">
                            🔄 Demande de changement
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            <span className="font-bold">Période proposée :</span>{' '}
                            Du {new Date(inter.demandeChangement.nouvelleDateDebut).toLocaleDateString('fr-FR')} 
                            {' '}au {new Date(inter.demandeChangement.nouvelleDateFin).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-900 font-medium">
                            <span className="font-bold">Horaires :</span>{' '}
                            {inter.demandeChangement.nouvelleHeureDebut} - {inter.demandeChangement.nouvelleHeureFin}
                          </div>
                          {inter.demandeChangement.indisponibilites && inter.demandeChangement.indisponibilites.length > 0 && (
                            <div className="text-sm text-gray-900 font-medium mt-2">
                              <span className="font-bold">❌ Indisponibilités :</span>
                              <div className="mt-1 space-y-1">
                                {inter.demandeChangement.indisponibilites.map((indispo, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded font-bold ${
                                      indispo.creneau === 'jour-entier' 
                                        ? 'bg-red-600 text-white' 
                                        : indispo.creneau === 'AM' 
                                        ? 'bg-orange-600 text-white' 
                                        : 'bg-purple-600 text-white'
                                    }`}>
                                      {indispo.creneau === 'jour-entier' && 'Jour'}
                                      {indispo.creneau === 'AM' && 'AM'}
                                      {indispo.creneau === 'PM' && 'PM'}
                                    </span>
                                    <span>
                                      {new Date(indispo.date).toLocaleDateString('fr-FR', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short'
                                      })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {inter.demandeChangement.raison && (
                            <div className="text-sm text-gray-900 font-medium mt-2">
                              <span className="font-bold">Raison :</span> {inter.demandeChangement.raison}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Indisponibilités conservées (après acceptation demande) */}
                      {!inter.demandeChangement && inter.indisponibilites && inter.indisponibilites.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-bold text-blue-900 mb-2">
                            ⚠️ Indisponibilités client à respecter
                          </div>
                          <div className="space-y-1">
                            {inter.indisponibilites.map((indispo, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                  indispo.creneau === 'jour-entier' 
                                    ? 'bg-red-600 text-white' 
                                    : indispo.creneau === 'AM' 
                                    ? 'bg-orange-600 text-white' 
                                    : 'bg-purple-600 text-white'
                                }`}>
                                  {indispo.creneau === 'jour-entier' && 'Jour'}
                                  {indispo.creneau === 'AM' && 'AM'}
                                  {indispo.creneau === 'PM' && 'PM'}
                                </span>
                                <span className="text-gray-900 font-bold">
                                  {new Date(indispo.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Boutons actions */}
                    <div className="flex gap-2">
                      <a
                        href={`/admin/interventions/${inter.id}`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        👁️ Détail
                      </a>
                      <a
                        href={`/admin/interventions/${inter.id}/modifier`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        ✏️ Modifier
                      </a>
                      <button
                        onClick={() => handleDelete(inter.id!)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Import */}
      <ImportInterventionsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          setShowImportModal(false)
          loadData()
        }}
      />
    </div>
  )
}