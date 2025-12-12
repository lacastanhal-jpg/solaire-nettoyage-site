'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createClient, 
  getAllClients, 
  updateClient, 
  deleteClient,
  type Client 
} from '@/lib/firebase'

export default function GestionClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  // Formulaire
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    password: '',
    contactName: '',
    phone: ''
  })

  useEffect(() => {
    // Vérifier admin
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadClients()
  }, [router])

  const loadClients = async () => {
    try {
      setLoading(true)
      const clientsList = await getAllClients()
      setClients(clientsList)
    } catch (error) {
      console.error('Erreur chargement clients:', error)
      alert('Erreur lors du chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingClient) {
        // Modifier un client existant
        await updateClient(editingClient.id, {
          company: formData.company,
          email: formData.email,
          password: formData.password,
          contactName: formData.contactName,
          phone: formData.phone
        })
        alert('✅ Client modifié avec succès !')
      } else {
        // Créer un nouveau client
        await createClient({
          company: formData.company,
          email: formData.email,
          password: formData.password,
          contactName: formData.contactName,
          phone: formData.phone,
          createdAt: new Date().toISOString(),
          active: true
        })
        alert('✅ Client créé avec succès !')
      }

      // Recharger la liste
      await loadClients()

      // Reset
      setShowModal(false)
      setEditingClient(null)
      setFormData({
        company: '',
        email: '',
        password: '',
        contactName: '',
        phone: ''
      })
    } catch (error) {
      console.error('Erreur sauvegarde client:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      company: client.company,
      email: client.email,
      password: client.password,
      contactName: client.contactName,
      phone: client.phone
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) {
      return
    }

    try {
      await deleteClient(id)
      alert('✅ Client supprimé')
      await loadClients()
    } catch (error) {
      console.error('Erreur suppression client:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const openNewClientModal = () => {
    setEditingClient(null)
    setFormData({
      company: '',
      email: '',
      password: '',
      contactName: '',
      phone: ''
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-900 text-xl">Chargement des clients...</div>
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
                <p className="text-sm text-blue-600">Espace Client Dataroom</p>
              </div>
            </div>
            <a
              href="/intranet/dashboard"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ← Retour Intranet
            </a>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-900 uppercase">Contact</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">{client.contactName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">{client.createdAt}</td>
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
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Email de connexion *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="client@entreprise.fr"
                  required
                  disabled={!!editingClient}
                />
                {editingClient && (
                  <p className="text-xs text-blue-600 mt-1">L'email ne peut pas être modifié</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="MotDePasse2024!"
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
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '⏳ Enregistrement...' : (editingClient ? 'Modifier' : 'Créer')}
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
