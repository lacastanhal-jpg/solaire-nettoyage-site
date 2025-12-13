'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createClient, 
  getAllClients, 
  updateClient, 
  deleteClient,
  getAllGroupes,
  getAllSitesComplet,
  type Client,
  type Groupe,
  type SiteComplet
} from '@/lib/firebase'

export default function GestionClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [sites, setSites] = useState<(SiteComplet & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  // Formulaire SANS email/password
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    phone: '',
    groupeId: ''
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
      const [clientsList, groupesList, sitesList] = await Promise.all([
        getAllClients(),
        getAllGroupes(),
        getAllSitesComplet()
      ])
      setClients(clientsList)
      setGroupes(groupesList)
      setSites(sitesList)
    } catch (error) {
      console.error('Erreur chargement données:', error)
      alert('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const getSitesCount = (clientId: string) => {
    return sites.filter(s => s.clientId === clientId).length
  }

  const getGroupeNom = (groupeId?: string) => {
    if (!groupeId) return 'Aucun'
    const groupe = groupes.find(g => g.id === groupeId)
    return groupe ? groupe.nom : 'Inconnu'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingClient) {
        // Modifier un client existant (SANS email/password)
        await updateClient(editingClient.id, {
          company: formData.company,
          contactName: formData.contactName,
          phone: formData.phone,
          groupeId: formData.groupeId || undefined
        })
        alert('✅ Client modifié avec succès !')
      } else {
        // Créer un nouveau client (SANS email/password)
        await createClient({
          company: formData.company,
          contactName: formData.contactName,
          phone: formData.phone,
          groupeId: formData.groupeId || undefined,
          createdAt: new Date().toISOString(),
          active: true
        })
        alert('✅ Client créé avec succès !')
      }

      // Recharger et fermer
      await loadData()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      company: client.company,
      contactName: client.contactName || '',
      phone: client.phone || '',
      groupeId: client.groupeId || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('⚠️ Supprimer ce client ? Cette action est irréversible.')) {
      return
    }

    try {
      await deleteClient(clientId)
      alert('✅ Client supprimé')
      await loadData()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const openNewClientModal = () => {
    setEditingClient(null)
    resetForm()
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      company: '',
      contactName: '',
      phone: '',
      groupeId: ''
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl font-bold">⏳ Chargement...</div>
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
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Gestion des Clients</h1>
                <p className="text-sm text-blue-600 font-bold">{clients.length} clients</p>
              </div>
            </div>
            <div className="flex gap-2">
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

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info importante */}
        <div className="mb-6 bg-blue-100 border-2 border-blue-400 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Login par GROUPE</h3>
              <p className="text-sm text-blue-800 font-medium">
                Les clients n'ont plus d'email/password individuels. Le login se fait via les identifiants du GROUPE. 
                Chaque groupe peut voir TOUS ses clients et sites depuis un seul compte.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">{clients.length}</div>
            <div className="text-blue-700 font-medium">Clients actifs</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-yellow-500 mb-2">
              {clients.filter(c => c.active).length}
            </div>
            <div className="text-blue-700 font-medium">Comptes activés</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <button
              onClick={openNewClientModal}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors"
            >
              ➕ Nouveau Client
            </button>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <a
              href="/admin/gestion-sites"
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
            >
              📍 Voir Sites
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <a
              href="/admin/import-sites"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors"
            >
              📊 Import Sites
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <a
              href="/admin/gestion-groupes"
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
            >
              🏢 Gestion Groupes
            </a>
          </div>
        </div>

        {/* Liste clients */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 border-b border-blue-700">
            <h3 className="text-lg font-bold text-white">Liste des Clients</h3>
          </div>

          {clients.length === 0 ? (
            <div className="p-12 text-center text-blue-600">
              Aucun client pour le moment. Cliquez sur "Nouveau Client" pour en créer un.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Entreprise</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Groupe</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-blue-900 uppercase">Sites</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Créé le</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-blue-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-blue-900">{client.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-bold">
                          🏢 {getGroupeNom(client.groupeId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-bold">
                          📍 {getSitesCount(client.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">{client.contactName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">{client.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">
                        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(client)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded mr-2 text-sm font-medium"
                        >
                          ✏️ Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded text-sm font-medium"
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Créer/Éditer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-blue-600 border-b border-blue-700">
              <h3 className="text-xl font-bold text-white">
                {editingClient ? 'Modifier le Client' : 'Nouveau Client'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Info login par groupe */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔐</span>
                  <div className="text-sm text-yellow-900 font-medium">
                    <strong>Login par GROUPE :</strong> Le client utilisera les identifiants du groupe pour se connecter. 
                    Pas besoin de créer un email/password pour chaque client.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Groupe *
                </label>
                <select
                  value={formData.groupeId}
                  onChange={(e) => setFormData({ ...formData, groupeId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  required
                >
                  <option value="">-- Sélectionner un groupe --</option>
                  {groupes.map((groupe) => (
                    <option key={groupe.id} value={groupe.id}>
                      {groupe.nom}
                    </option>
                  ))}
                </select>
                {groupes.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Aucun groupe disponible. Créez d'abord un groupe !
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="Ex: ENGIE Green France"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '⏳ Enregistrement...' : (editingClient ? '✅ Modifier' : '✅ Créer')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
