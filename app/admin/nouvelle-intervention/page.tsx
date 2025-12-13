'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createInterventionCalendar,
  getAllSitesComplet,
  getAllClients,
  getAllGroupes,
  getAllEquipes,
  type SiteComplet,
  type Client,
  type Groupe,
  type Equipe
} from '@/lib/firebase'

export default function NouvelleInterventionPage() {
  const router = useRouter()
  const [sites, setSites] = useState<(SiteComplet & { id: string })[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [selectedGroupeId, setSelectedGroupeId] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState('')
  const [selectedEquipeId, setSelectedEquipeId] = useState<number>(1)
  
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    heureDebut: '08:00',
    heureFin: '17:00',
    type: 'Standard' as 'Standard' | 'Urgence' | 'Maintenance',
    notes: ''
  })

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
      const [sitesData, clientsData, groupesData, equipesData] = await Promise.all([
        getAllSitesComplet(),
        getAllClients(),
        getAllGroupes(),
        getAllEquipes()
      ])
      setSites(sitesData)
      setClients(clientsData)
      setGroupes(groupesData)
      setEquipes(equipesData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSiteId || !formData.dateDebut || !formData.dateFin) {
      alert('⚠️ Le site, la date de début et la date de fin sont obligatoires')
      return
    }

    // Vérifier que dateFin >= dateDebut
    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      alert('⚠️ La date de fin doit être après ou égale à la date de début')
      return
    }

    // Vérifier que heureFin > heureDebut
    if (formData.heureFin <= formData.heureDebut) {
      alert('⚠️ L\'heure de fin doit être après l\'heure de début')
      return
    }

    const site = sites.find(s => s.id === selectedSiteId)
    const client = clients.find(c => c.id === selectedClientId)
    const equipe = equipes.find(e => e.numero === selectedEquipeId)

    if (!site || !client || !equipe) {
      alert('❌ Données invalides')
      return
    }

    try {
      setSaving(true)

      await createInterventionCalendar({
        siteId: selectedSiteId,
        siteName: site.nomSite,
        clientId: selectedClientId,
        clientName: client.company,
        groupeId: site.groupeId || '',
        equipeId: selectedEquipeId as 1 | 2 | 3,
        equipeName: equipe.nom,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin,
        surface: site.surface || 0,
        type: formData.type,
        statut: 'Planifiée',
        notes: formData.notes,
        recurrence: null,
        demandeChangement: null
      })

      alert('✅ Intervention créée !')
      router.push('/admin/calendrier')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  // Filtrer clients par groupe
  const filteredClients = selectedGroupeId
    ? clients.filter(c => c.groupeId === selectedGroupeId)
    : clients

  // Filtrer sites par client
  const filteredSites = selectedClientId
    ? sites.filter(s => s.clientId === selectedClientId)
    : []

  const selectedSite = sites.find(s => s.id === selectedSiteId)

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Nouvelle Intervention</h1>
                <p className="text-sm text-gray-900 font-medium">Planifier une intervention terrain</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/calendrier"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                ← Retour Calendrier
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          <div className="space-y-6">
            {/* Groupe */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                1. Sélectionner un Groupe
              </label>
              <select
                value={selectedGroupeId}
                onChange={(e) => {
                  setSelectedGroupeId(e.target.value)
                  setSelectedClientId('')
                  setSelectedSiteId('')
                }}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              >
                <option value="">-- Sélectionner un groupe --</option>
                {groupes.map((groupe) => (
                  <option key={groupe.id} value={groupe.id}>
                    {groupe.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Client */}
            {selectedGroupeId && (
              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  2. Sélectionner un Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value)
                    setSelectedSiteId('')
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                >
                  <option value="">-- Sélectionner un client --</option>
                  {filteredClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Site */}
            {selectedClientId && (
              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  3. Sélectionner un Site *
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  required
                >
                  <option value="">-- Sélectionner un site --</option>
                  {filteredSites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.nomSite} - {site.ville} ({site.surface || 0}m²)
                    </option>
                  ))}
                </select>

                {selectedSite && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
                    <div className="font-bold mb-2">📍 Informations du site :</div>
                    <div className="space-y-1">
                      <div>Surface: {selectedSite.surface || 0}m²</div>
                      <div>Ville: {selectedSite.ville}</div>
                      {selectedSite.eau && <div>Eau: {selectedSite.eau}</div>}
                      {selectedSite.accesCamion && <div>Accès camion: {selectedSite.accesCamion}</div>}
                      {selectedSite.contact && <div>Contact: {selectedSite.contact}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Équipe */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                4. Affecter une Équipe *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {equipes.map((equipe) => (
                  <button
                    key={equipe.id}
                    onClick={() => setSelectedEquipeId(equipe.numero)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedEquipeId === equipe.numero
                        ? equipe.numero === 1
                          ? 'border-red-500 bg-red-50'
                          : equipe.numero === 2
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-blue-900 mb-1">{equipe.nom}</div>
                    <div className="text-xs text-gray-900 font-medium">{equipe.type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Plage de dates */}
            <div className="border-2 border-blue-300 rounded-xl p-6 bg-blue-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Plage de dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Date début *
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({...formData, dateFin: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Plage d'horaires */}
            <div className="border-2 border-orange-300 rounded-xl p-6 bg-orange-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🕐 Horaires quotidiens</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Heure début *
                  </label>
                  <input
                    type="time"
                    value={formData.heureDebut}
                    onChange={(e) => setFormData({...formData, heureDebut: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-orange-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    Heure fin *
                  </label>
                  <input
                    type="time"
                    value={formData.heureFin}
                    onChange={(e) => setFormData({...formData, heureFin: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-orange-500 focus:outline-none text-blue-900 font-medium"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-gray-700 font-medium mt-3">
                💡 Ces horaires s'appliquent chaque jour de l'intervention
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Type d'intervention
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              >
                <option value="Standard">Standard</option>
                <option value="Urgence">Urgence</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Notes internes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="Notes pour l'équipe..."
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? '⏳ Création...' : '✅ Créer l\'intervention'}
              </button>
              <a
                href="/admin/calendrier"
                className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Annuler
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
