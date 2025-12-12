'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllSitesComplet,
  getAllClients,
  getAllGroupes,
  updateSiteComplet,
  deleteSiteComplet,
  type SiteComplet,
  type Client,
  type Groupe
} from '@/lib/firebase'

export default function GestionSitesPage() {
  const router = useRouter()
  const [sites, setSites] = useState<(SiteComplet & { id: string })[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroupeId, setSelectedGroupeId] = useState<string>('all')
  const [selectedClientId, setSelectedClientId] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSite, setEditingSite] = useState<(SiteComplet & { id: string }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<SiteComplet>>({
    clientId: '',
    groupeId: '',
    complementNom: '',
    nomSite: '',
    tel: '',
    portable: '',
    codePostal: '',
    ville: '',
    adresse1: '',
    adresse2: '',
    adresse3: '',
    pays: 'France',
    internet: '',
    email: '',
    contact: '',
    surface: 0,
    pente: '',
    eau: '',
    infosCompl: '',
    typeInterv: '',
    accesCamion: '',
    gps: '',
    lat: 0,
    lng: 0
  })

  useEffect(() => {
    // Vérifier admin
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
      const [sitesList, clientsList, groupesList] = await Promise.all([
        getAllSitesComplet(),
        getAllClients(),
        getAllGroupes()
      ])
      setSites(sitesList)
      setClients(clientsList)
      setGroupes(groupesList)
    } catch (error) {
      console.error('Erreur chargement:', error)
      alert('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const openNewSiteModal = () => {
    setEditingSite(null)
    setFormData({
      clientId: '',
      groupeId: '',
      complementNom: '',
      nomSite: '',
      tel: '',
      portable: '',
      codePostal: '',
      ville: '',
      adresse1: '',
      adresse2: '',
      adresse3: '',
      pays: 'France',
      internet: '',
      email: '',
      contact: '',
      surface: 0,
      pente: '',
      eau: '',
      infosCompl: '',
      typeInterv: '',
      accesCamion: '',
      gps: '',
      lat: 0,
      lng: 0
    })
    setShowModal(true)
  }

  const openEditSiteModal = (site: SiteComplet & { id: string }) => {
    setEditingSite(site)
    setFormData({
      clientId: site.clientId || '',
      groupeId: site.groupeId || '',
      complementNom: site.complementNom,
      nomSite: site.nomSite,
      tel: site.tel,
      portable: site.portable,
      codePostal: site.codePostal,
      ville: site.ville,
      adresse1: site.adresse1,
      adresse2: site.adresse2,
      adresse3: site.adresse3,
      pays: site.pays,
      internet: site.internet,
      email: site.email,
      contact: site.contact,
      surface: site.surface,
      pente: site.pente,
      eau: site.eau,
      infosCompl: site.infosCompl,
      typeInterv: site.typeInterv,
      accesCamion: site.accesCamion,
      gps: site.gps,
      lat: site.lat,
      lng: site.lng
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.nomSite || !formData.clientId) {
      alert('⚠️ Le nom du site et le client sont obligatoires')
      return
    }

    const client = clients.find(c => c.id === formData.clientId)
    if (!client || !client.groupeId) {
      alert('❌ Client invalide ou groupe manquant')
      return
    }

    try {
      setSaving(true)
      
      if (editingSite) {
        // Modification
        await updateSiteComplet(editingSite.id, {
          ...formData,
          groupeId: client.groupeId
        })
        alert('✅ Site modifié')
      } else {
        // Création via import (1 site)
        const { importSitesFromExcel } = await import('@/lib/firebase')
        await importSitesFromExcel(
          [formData as Omit<SiteComplet, 'id'>],
          formData.clientId!,
          client.groupeId
        )
        alert('✅ Site créé')
      }
      
      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    setFormData({
      ...formData,
      clientId,
      groupeId: client?.groupeId || ''
    })
  }

  const handleDelete = async (siteId: string, nomSite: string) => {
    if (!confirm(`Supprimer le site "${nomSite}" ?`)) return

    try {
      await deleteSiteComplet(siteId)
      alert('✅ Site supprimé')
      loadData()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const handleUpdateClient = async (siteId: string, newClientId: string) => {
    const client = clients.find(c => c.id === newClientId)
    if (!client || !client.groupeId) {
      alert('❌ Client invalide')
      return
    }

    try {
      await updateSiteComplet(siteId, {
        clientId: newClientId,
        groupeId: client.groupeId
      })
      alert('✅ Site mis à jour')
      loadData()
    } catch (error) {
      console.error('Erreur mise à jour:', error)
      alert('❌ Erreur lors de la mise à jour')
    }
  }

  const getClientNom = (clientId?: string) => {
    if (!clientId) return 'Non affecté'
    const client = clients.find(c => c.id === clientId)
    return client ? client.company : 'Client inconnu'
  }

  const getGroupeNom = (groupeId?: string) => {
    if (!groupeId) return 'Non affecté'
    const groupe = groupes.find(g => g.id === groupeId)
    return groupe ? groupe.nom : 'Groupe inconnu'
  }

  // Filtrer les sites
  const filteredSites = sites.filter(site => {
    // Filtre groupe
    if (selectedGroupeId !== 'all' && site.groupeId !== selectedGroupeId) {
      return false
    }
    // Filtre client
    if (selectedClientId !== 'all' && site.clientId !== selectedClientId) {
      return false
    }
    // Filtre recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        site.nomSite?.toLowerCase().includes(search) ||
        site.complementNom?.toLowerCase().includes(search) ||
        site.ville?.toLowerCase().includes(search) ||
        site.codePostal?.includes(search)
      )
    }
    return true
  })

  // Stats
  const sitesNonAffectes = sites.filter(s => !s.clientId).length
  const sitesParGroupe = (groupeId: string) => 
    sites.filter(s => s.groupeId === groupeId).length

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Gestion des Sites</h1>
                <p className="text-sm text-blue-600">Gérer tous les sites de nettoyage</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/import-sites"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                📊 Import Sites
              </a>
              <a
                href="/admin/gestion-clients"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ← Retour Clients
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">{sites.length}</div>
            <div className="text-blue-700 font-medium">Sites totaux</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">{filteredSites.length}</div>
            <div className="text-blue-700 font-medium">Sites affichés</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-orange-500 mb-2">{sitesNonAffectes}</div>
            <div className="text-blue-700 font-medium">Non affectés</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-purple-500 mb-2">{groupes.length}</div>
            <div className="text-blue-700 font-medium">Groupes</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <button
              onClick={openNewSiteModal}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors"
            >
              ➕ Nouveau Site
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-4">🔍 Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre Groupe */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Groupe</label>
              <select
                value={selectedGroupeId}
                onChange={(e) => {
                  setSelectedGroupeId(e.target.value)
                  setSelectedClientId('all')
                }}
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              >
                <option value="all">Tous les groupes ({sites.length})</option>
                {groupes.map(groupe => (
                  <option key={groupe.id} value={groupe.id}>
                    {groupe.nom} ({sitesParGroupe(groupe.id)})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Client */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              >
                <option value="all">Tous les clients</option>
                {clients
                  .filter(c => selectedGroupeId === 'all' || c.groupeId === selectedGroupeId)
                  .map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company} ({sites.filter(s => s.clientId === client.id).length})
                    </option>
                  ))}
              </select>
            </div>

            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Recherche</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom, ville, code postal..."
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              />
            </div>
          </div>
        </div>

        {/* Tableau Sites */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Nom Site</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Ville</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Groupe</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">Surface</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase">GPS</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-blue-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-blue-600">
                      Aucun site trouvé
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site) => (
                    <tr key={site.id} className="hover:bg-blue-50">
                      <td className="px-4 py-3 whitespace-nowrap text-blue-900 font-mono text-xs">
                        {site.complementNom || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-blue-900">{site.nomSite}</div>
                        <div className="text-xs text-blue-600">{site.contact || '-'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-blue-700">
                        {site.codePostal} {site.ville}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          site.groupeId 
                            ? 'bg-purple-100 text-purple-900' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          🏢 {getGroupeNom(site.groupeId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {site.clientId ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded-full text-xs font-bold">
                            👤 {getClientNom(site.clientId)}
                          </span>
                        ) : (
                          <select
                            onChange={(e) => handleUpdateClient(site.id, e.target.value)}
                            className="px-2 py-1 border border-orange-300 rounded text-xs"
                          >
                            <option value="">Affecter client...</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.company}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-blue-700">
                        {site.surface ? `${site.surface} m²` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-blue-700 font-mono text-xs">
                        {site.gps || (site.lat && site.lng ? `${site.lat},${site.lng}` : '-')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => openEditSiteModal(site)}
                          className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-xs font-medium mr-2"
                        >
                          ✏️ Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(site.id, site.nomSite)}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded text-xs font-medium"
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Créer/Éditer Site */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-green-600 border-b border-green-700">
              <h3 className="text-xl font-bold text-white">
                {editingSite ? 'Modifier le Site' : 'Nouveau Site'}
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client (obligatoire) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Client * <span className="text-red-500">(obligatoire)</span>
                  </label>
                  <select
                    value={formData.clientId || ''}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    required
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company} - 🏢 {getGroupeNom(client.groupeId)}
                      </option>
                    ))}
                  </select>
                  {formData.clientId && formData.groupeId && (
                    <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                      <span className="text-purple-900 font-medium">
                        🏢 Groupe: {getGroupeNom(formData.groupeId)}
                      </span>
                      <span className="text-purple-700 text-xs ml-2">
                        (change automatiquement avec le client)
                      </span>
                    </div>
                  )}
                </div>

                {/* ID / Complément Nom */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">ID / Complément Nom</label>
                  <input
                    type="text"
                    value={formData.complementNom || ''}
                    onChange={(e) => setFormData({...formData, complementNom: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="SITE-001"
                  />
                </div>

                {/* Nom Site (obligatoire) */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Nom du Site * <span className="text-red-500">(obligatoire)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomSite || ''}
                    onChange={(e) => setFormData({...formData, nomSite: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Central Lyon"
                    required
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Contact</label>
                  <input
                    type="text"
                    value={formData.contact || ''}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Jean Dupont"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="contact@site.fr"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.tel || ''}
                    onChange={(e) => setFormData({...formData, tel: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="01 23 45 67 89"
                  />
                </div>

                {/* Portable */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Portable</label>
                  <input
                    type="tel"
                    value={formData.portable || ''}
                    onChange={(e) => setFormData({...formData, portable: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                {/* Adresse 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-900 mb-2">Adresse 1</label>
                  <input
                    type="text"
                    value={formData.adresse1 || ''}
                    onChange={(e) => setFormData({...formData, adresse1: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                {/* Adresse 2 */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Adresse 2</label>
                  <input
                    type="text"
                    value={formData.adresse2 || ''}
                    onChange={(e) => setFormData({...formData, adresse2: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Bâtiment A"
                  />
                </div>

                {/* Adresse 3 */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Adresse 3</label>
                  <input
                    type="text"
                    value={formData.adresse3 || ''}
                    onChange={(e) => setFormData({...formData, adresse3: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Étage 2"
                  />
                </div>

                {/* Code Postal */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Code Postal</label>
                  <input
                    type="text"
                    value={formData.codePostal || ''}
                    onChange={(e) => setFormData({...formData, codePostal: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="69000"
                  />
                </div>

                {/* Ville */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.ville || ''}
                    onChange={(e) => setFormData({...formData, ville: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Lyon"
                  />
                </div>

                {/* Pays */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Pays</label>
                  <input
                    type="text"
                    value={formData.pays || ''}
                    onChange={(e) => setFormData({...formData, pays: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="France"
                  />
                </div>

                {/* Site Web */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Site Web</label>
                  <input
                    type="url"
                    value={formData.internet || ''}
                    onChange={(e) => setFormData({...formData, internet: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="https://www.site.fr"
                  />
                </div>

                {/* Surface */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Surface (m²)</label>
                  <input
                    type="number"
                    value={formData.surface || 0}
                    onChange={(e) => setFormData({...formData, surface: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="5000"
                  />
                </div>

                {/* Pente */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Pente</label>
                  <input
                    type="text"
                    value={formData.pente || ''}
                    onChange={(e) => setFormData({...formData, pente: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Faible, Moyenne, Forte"
                  />
                </div>

                {/* Eau */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Eau</label>
                  <input
                    type="text"
                    value={formData.eau || ''}
                    onChange={(e) => setFormData({...formData, eau: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Disponible, Non disponible"
                  />
                </div>

                {/* Type Intervention */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Type Intervention</label>
                  <input
                    type="text"
                    value={formData.typeInterv || ''}
                    onChange={(e) => setFormData({...formData, typeInterv: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Nettoyage standard"
                  />
                </div>

                {/* Accès Camion */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Accès Camion</label>
                  <input
                    type="text"
                    value={formData.accesCamion || ''}
                    onChange={(e) => setFormData({...formData, accesCamion: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Facile, Difficile"
                  />
                </div>

                {/* GPS */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Coordonnées GPS</label>
                  <input
                    type="text"
                    value={formData.gps || ''}
                    onChange={(e) => setFormData({...formData, gps: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="45.7640,4.8357"
                  />
                </div>

                {/* Latitude */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lat || 0}
                    onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="45.7640"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.lng || 0}
                    onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="4.8357"
                  />
                </div>

                {/* Infos Complémentaires */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-900 mb-2">Infos Complémentaires</label>
                  <textarea
                    value={formData.infosCompl || ''}
                    onChange={(e) => setFormData({...formData, infosCompl: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Informations supplémentaires..."
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '⏳ Enregistrement...' : (editingSite ? '💾 Modifier' : '✅ Créer')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
