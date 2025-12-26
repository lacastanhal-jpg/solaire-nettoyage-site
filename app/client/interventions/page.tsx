'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllInterventionsCalendar,
  getAllClients,
  type InterventionCalendar,
  type Client
} from '@/lib/firebase'

export default function ClientInterventionsPage() {
  const router = useRouter()
  const [groupeId, setGroupeId] = useState('')
  const [groupeName, setGroupeName] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [interventions, setInterventions] = useState<(InterventionCalendar & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatut, setSelectedStatut] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('client_logged_in')
    if (!isLoggedIn) {
      router.push('/client/login')
      return
    }

    const id = localStorage.getItem('groupe_id') || ''
    const name = localStorage.getItem('groupe_name') || ''
    
    setGroupeId(id)
    setGroupeName(name)
    
    // Lire le paramètre statut depuis l'URL
    const urlParams = new URLSearchParams(window.location.search)
    const statutParam = urlParams.get('statut')
    if (statutParam) {
      setSelectedStatut(statutParam)
    }
    
    loadInterventions(id)
  }, [router])

  const loadInterventions = async (groupeId: string) => {
    try {
      setLoading(true)
      
      const [allClients, allInterventions] = await Promise.all([
        getAllClients(),
        getAllInterventionsCalendar()
      ])

      const groupeClients = allClients.filter(c => c.groupeId === groupeId)
      const clientIds = groupeClients.map(c => c.id)
      
      const groupeInterventions = allInterventions.filter(i => i.clientId && clientIds.includes(i.clientId))
      
      setClients(groupeClients)
      setInterventions(groupeInterventions)
    } catch (error) {
      console.error('Erreur récupération interventions Groupe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_logged_in')
    localStorage.removeItem('groupe_id')
    localStorage.removeItem('groupe_name')
    localStorage.removeItem('groupe_email')
    router.push('/client/login')
  }

  const getStatutCouleur = (statut: InterventionCalendar['statut']) => {
    switch (statut) {
      case 'Planifiée': return 'bg-blue-100 text-blue-900 border-blue-300'
      case 'En cours': return 'bg-yellow-100 text-yellow-900 border-yellow-300'
      case 'Terminée': return 'bg-green-100 text-green-900 border-green-300'
      case 'Annulée': return 'bg-gray-100 text-gray-900 border-gray-300'
      case 'Demande modification': return 'bg-orange-100 text-orange-900 border-orange-300'
    }
  }

  const getEquipeCouleur = (equipeId: number) => {
    switch (equipeId) {
      case 1: return '🔴'
      case 2: return '🔵'
      case 3: return '🟢'
      default: return '⚪'
    }
  }

  // FILTRAGE INTELLIGENT
  let filteredInterventions = interventions

  // Filtre par statut
  if (selectedStatut !== 'all') {
    filteredInterventions = filteredInterventions.filter(i => i.statut === selectedStatut)
  }

  // Filtre par client
  if (selectedClient !== 'all') {
    filteredInterventions = filteredInterventions.filter(i => i.clientId === selectedClient)
  }

  // RECHERCHE INTELLIGENTE
  if (searchTerm) {
    const search = searchTerm.toLowerCase()
    filteredInterventions = filteredInterventions.filter(inter => {
      const client = clients.find(c => c.id === inter.clientId)
      
      return (
        // Nom du site
        inter.siteName?.toLowerCase().includes(search) ||
        // Nom du client
        client?.company?.toLowerCase().includes(search) ||
        // Notes
        inter.notes?.toLowerCase().includes(search) ||
        // Type
        inter.type?.toLowerCase().includes(search) ||
        // Statut
        inter.statut?.toLowerCase().includes(search)
      )
    })
  }

  // Trier par date
  filteredInterventions = filteredInterventions.sort((a, b) => 
    new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
  )

  // STATISTIQUES
  const stats = {
    total: interventions.length,
    planifiees: interventions.filter(i => i.statut === 'Planifiée').length,
    enCours: interventions.filter(i => i.statut === 'En cours').length,
    terminees: interventions.filter(i => i.statut === 'Terminée').length,
    annulees: interventions.filter(i => i.statut === 'Annulée').length,
    demandes: interventions.filter(i => i.statut === 'Demande modification').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl font-bold">⏳ Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Interventions - Groupe {groupeName}</h1>
                <p className="text-sm text-blue-200">{clients.length} clients - {interventions.length} interventions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/client/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ← Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => setSelectedStatut('all')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatut === 'all'
                ? 'bg-white/20 border-white shadow-lg scale-105'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-xs text-blue-200 font-medium">📋 Toutes</div>
          </button>

          <button
            onClick={() => setSelectedStatut('Planifiée')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatut === 'Planifiée'
                ? 'bg-white/20 border-white shadow-lg scale-105'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="text-3xl font-bold text-blue-300 mb-1">{stats.planifiees}</div>
            <div className="text-xs text-blue-200 font-medium">📅 Planifiées</div>
          </button>

          <button
            onClick={() => setSelectedStatut('En cours')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatut === 'En cours'
                ? 'bg-white/20 border-white shadow-lg scale-105'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="text-3xl font-bold text-yellow-300 mb-1">{stats.enCours}</div>
            <div className="text-xs text-blue-200 font-medium">🔄 En cours</div>
          </button>

          <button
            onClick={() => setSelectedStatut('Terminée')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatut === 'Terminée'
                ? 'bg-white/20 border-white shadow-lg scale-105'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="text-3xl font-bold text-green-300 mb-1">{stats.terminees}</div>
            <div className="text-xs text-blue-200 font-medium">✅ Terminées</div>
          </button>

          <button
            onClick={() => setSelectedStatut('Annulée')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatut === 'Annulée'
                ? 'bg-white/20 border-white shadow-lg scale-105'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="text-3xl font-bold text-gray-300 mb-1">{stats.annulees}</div>
            <div className="text-xs text-blue-200 font-medium">❌ Annulées</div>
          </button>

          <button
            onClick={() => setSelectedStatut('Demande modification')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedStatut === 'Demande modification'
                ? 'bg-white/20 border-white shadow-lg scale-105'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            }`}
          >
            <div className="text-3xl font-bold text-orange-300 mb-1">{stats.demandes}</div>
            <div className="text-xs text-blue-200 font-medium">🔔 Demandes</div>
          </button>
        </div>

        {/* Recherche + Filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche intelligente */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">🔍 Recherche intelligente</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Site, client, technicien, notes, n° intervention..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium placeholder:text-gray-400"
              />
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-600 font-medium">
                  🎯 {filteredInterventions.length} résultat(s) trouvé(s)
                </p>
              )}
            </div>

            {/* Filtre client */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-bold"
              >
                <option value="all">Tous les clients ({clients.length})</option>
                {clients.map(client => {
                  const count = interventions.filter(i => i.clientId === client.id).length
                  return (
                    <option key={client.id} value={client.id}>
                      {client.company} ({count})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Bouton réinitialiser filtres */}
          {(searchTerm || selectedClient !== 'all' || selectedStatut !== 'all') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedClient('all')
                  setSelectedStatut('all')
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                🔄 Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Liste interventions */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 border-b border-blue-700">
            <h3 className="text-lg font-bold text-white">
              📋 Interventions ({filteredInterventions.length})
            </h3>
          </div>

          {filteredInterventions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-xl font-bold text-gray-900 mb-2">Aucune intervention trouvée</div>
              <div className="text-gray-600 font-medium">
                {searchTerm ? 'Essayez une autre recherche' : 'Aucune intervention pour ce filtre'}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredInterventions.map((inter) => {
                const client = clients.find(c => c.id === inter.clientId)
                const now = new Date()
                
                return (
                  <div key={inter.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="text-2xl">{getEquipeCouleur(inter.equipeId)}</span>
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-900">
                            {client?.company || 'Client inconnu'}
                          </span>
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-900">
                            {inter.equipeName}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatutCouleur(inter.statut)}`}>
                            {inter.statut}
                          </span>
                          {inter.type === 'Urgence' && (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-900">
                              🚨 Urgence
                            </span>
                          )}
                          {inter.rapport && (
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-900 border-2 border-green-300">
                              📄 Rapport disponible
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {inter.siteName}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 font-medium">
                          <div className="col-span-2">
                            <span className="font-bold">📅 Période :</span>{' '}
                            {inter.dateDebut === inter.dateFin ? (
                              <span>
                                {new Date(inter.dateDebut).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            ) : (
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

                          <div>
                            <span className="font-bold">🕐 Horaires :</span> {inter.heureDebut} - {inter.heureFin}
                          </div>

                          <div>
                            <span className="font-bold">📏 Surface :</span> {inter.surface}m²
                          </div>
                        </div>

                        {inter.notes && (
                          <div className="mt-3 text-sm text-gray-700 font-medium">
                            <span className="font-bold">📝 Notes :</span> {inter.notes}
                          </div>
                        )}

                        {/* Rapport d'intervention */}
                        {inter.rapport && (
                          <div className="mt-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-base font-bold text-green-900">
                                📄 Rapport d'intervention
                              </h5>
                              <a
                                href={inter.rapport.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors inline-flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Télécharger PDF
                              </a>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {/* N° Intervention */}
                              {inter.rapport.numeroIntervention && (
                                <div>
                                  <span className="font-bold text-gray-900">N° Intervention :</span>
                                  <p className="text-gray-700">{inter.rapport.numeroIntervention}</p>
                                </div>
                              )}
                              
                              {/* Date intervention */}
                              {inter.rapport.dateIntervention && (
                                <div>
                                  <span className="font-bold text-gray-900">Date intervention :</span>
                                  <p className="text-gray-700">{inter.rapport.dateIntervention}</p>
                                </div>
                              )}
                              
                              {/* Technicien */}
                              {inter.rapport.technicien && (
                                <div>
                                  <span className="font-bold text-gray-900">Technicien :</span>
                                  <p className="text-gray-700">{inter.rapport.technicien}</p>
                                </div>
                              )}
                              
                              {/* Type intervention */}
                              {inter.rapport.typeIntervention && (
                                <div>
                                  <span className="font-bold text-gray-900">Type :</span>
                                  <p className="text-gray-700">{inter.rapport.typeIntervention}</p>
                                </div>
                              )}
                              
                              {/* Matériel utilisé */}
                              {inter.rapport.materiel && inter.rapport.materiel.length > 0 && !inter.rapport.materiel.includes('Non spécifié') && (
                                <div className="col-span-2">
                                  <span className="font-bold text-gray-900">Matériel utilisé :</span>
                                  <p className="text-gray-700">{inter.rapport.materiel.join(', ')}</p>
                                </div>
                              )}
                              
                              {/* Eau utilisée */}
                              {inter.rapport.eauUtilisee && inter.rapport.eauUtilisee.length > 0 && !inter.rapport.eauUtilisee.includes('Non spécifié') && (
                                <div className="col-span-2">
                                  <span className="font-bold text-gray-900">Eau utilisée :</span>
                                  <p className="text-gray-700">{inter.rapport.eauUtilisee.join(', ')}</p>
                                </div>
                              )}
                              
                              {/* Niveau encrassement */}
                              {inter.rapport.niveauEncrassement && (
                                <div>
                                  <span className="font-bold text-gray-900">Encrassement :</span>
                                  <p className="text-gray-700">{inter.rapport.niveauEncrassement}</p>
                                </div>
                              )}
                              
                              {/* Type encrassement */}
                              {inter.rapport.typeEncrassement && inter.rapport.typeEncrassement.length > 0 && !inter.rapport.typeEncrassement.includes('Non spécifié') && (
                                <div>
                                  <span className="font-bold text-gray-900">Type encrassement :</span>
                                  <p className="text-gray-700">{inter.rapport.typeEncrassement.join(', ')}</p>
                                </div>
                              )}
                              
                              {/* Détails encrassement */}
                              {inter.rapport.detailsEncrassement && (
                                <div className="col-span-2">
                                  <span className="font-bold text-gray-900">Détails :</span>
                                  <p className="text-gray-700">{inter.rapport.detailsEncrassement}</p>
                                </div>
                              )}
                              
                              {/* Date upload */}
                              <div className="col-span-2 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                <span className="font-bold">Rapport uploadé le :</span> {new Date(inter.rapport.uploadedAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {inter.demandeChangement && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="text-sm font-bold text-orange-900 mb-1">
                              🔄 Demande de changement en cours
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                              <span className="font-bold">Période proposée :</span>{' '}
                              Du {new Date(inter.demandeChangement.nouvelleDateDebut).toLocaleDateString('fr-FR')} 
                              {' '}au {new Date(inter.demandeChangement.nouvelleDateFin).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                              <span className="font-bold">Horaires :</span>{' '}
                              {inter.demandeChangement.nouvelleHeureDebut} - {inter.demandeChangement.nouvelleHeureFin}
                            </div>
                            {inter.demandeChangement.indisponibilites && inter.demandeChangement.indisponibilites.length > 0 && (
                              <div className="text-sm text-gray-700 font-medium mt-2">
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
                              <div className="text-sm text-gray-700 font-medium mt-2">
                                <span className="font-bold">Raison :</span> {inter.demandeChangement.raison}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Indisponibilités conservées (après acceptation demande) */}
                        {!inter.demandeChangement && inter.indisponibilites && inter.indisponibilites.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm font-bold text-blue-900 mb-2">
                              ⚠️ Vos indisponibilités prises en compte
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
                                  <span className="text-gray-700 font-medium">
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

                      {/* Bouton demander changement - À DROITE */}
                      {new Date(inter.dateDebut) >= now && 
                       inter.statut === 'Planifiée' && 
                       !inter.demandeChangement && (
                        <a
                          href={`/client/interventions/${inter.id}/modifier`}
                          className="ml-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
                        >
                          🔄 Demander changement
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}