'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createGroupe, 
  getAllGroupes, 
  updateGroupe, 
  deleteGroupe,
  getAllClients,
  type Groupe,
  type Client
} from '@/lib/firebase'

export default function GestionGroupesPage() {
  const router = useRouter()
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGroupe, setEditingGroupe] = useState<Groupe | null>(null)
  const [saving, setSaving] = useState(false)

  // Formulaire AVEC password
  const [formData, setFormData] = useState({
    nom: '',
    contactPrincipal: '',
    email: '',
    password: '',  // AJOUTÉ
    telephone: '',
    adresse: '',
    siret: '',
    description: '',
    active: true
  })

  useEffect(() => {
    // Vérifier admin
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadGroupes()
  }, [router])

  const loadGroupes = async () => {
    try {
      setLoading(true)
      const [groupesList, clientsList] = await Promise.all([
        getAllGroupes(),
        getAllClients()
      ])
      setGroupes(groupesList)
      setClients(clientsList)
    } catch (error) {
      console.error('Erreur chargement groupes:', error)
      alert('Erreur lors du chargement des groupes')
    } finally {
      setLoading(false)
    }
  }

  const getClientsCount = (groupeId: string) => {
    return clients.filter(c => c.groupeId === groupeId).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      if (editingGroupe) {
        // Modifier un groupe existant
        await updateGroupe(editingGroupe.id, {
          nom: formData.nom,
          contactPrincipal: formData.contactPrincipal,
          email: formData.email,
          password: formData.password,  // AJOUTÉ
          telephone: formData.telephone,
          adresse: formData.adresse,
          siret: formData.siret,
          description: formData.description,
          active: formData.active
        })
        alert('✅ Groupe modifié avec succès !')
      } else {
        // Créer un nouveau groupe
        await createGroupe({
          nom: formData.nom,
          contactPrincipal: formData.contactPrincipal,
          email: formData.email,
          password: formData.password,  // AJOUTÉ
          telephone: formData.telephone,
          adresse: formData.adresse,
          siret: formData.siret,
          description: formData.description,
          createdAt: new Date().toISOString(),
          active: formData.active
        })
        alert('✅ Groupe créé avec succès !')
      }

      // Recharger la liste
      await loadGroupes()

      // Reset
      setShowModal(false)
      setEditingGroupe(null)
      setFormData({
        nom: '',
        contactPrincipal: '',
        email: '',
        password: '',  // AJOUTÉ
        telephone: '',
        adresse: '',
        siret: '',
        description: '',
        active: true
      })
    } catch (error) {
      console.error('Erreur sauvegarde groupe:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (groupe: Groupe) => {
    setEditingGroupe(groupe)
    setFormData({
      nom: groupe.nom,
      contactPrincipal: groupe.contactPrincipal,
      email: groupe.email,
      password: groupe.password || '',  // AJOUTÉ
      telephone: groupe.telephone,
      adresse: groupe.adresse,
      siret: groupe.siret,
      description: groupe.description,
      active: groupe.active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce groupe ? Cette action est irréversible.')) {
      return
    }

    try {
      await deleteGroupe(id)
      alert('✅ Groupe supprimé')
      await loadGroupes()
    } catch (error) {
      console.error('Erreur suppression groupe:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  const openNewGroupeModal = () => {
    setEditingGroupe(null)
    setFormData({
      nom: '',
      contactPrincipal: '',
      email: '',
      password: '',  // AJOUTÉ
      telephone: '',
      adresse: '',
      siret: '',
      description: '',
      active: true
    })
    setShowModal(true)
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Gestion des Groupes</h1>
                <p className="text-sm text-blue-600 font-bold">{groupes.length} groupes</p>
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
        <div className="mb-6 bg-purple-100 border-2 border-purple-400 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-bold text-purple-900 mb-1">Identifiants de connexion</h3>
              <p className="text-sm text-purple-800 font-medium">
                Chaque groupe a un email et mot de passe pour se connecter à l'espace client. 
                Tous les clients du groupe partagent ces mêmes identifiants.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-purple-500 mb-2">{groupes.length}</div>
            <div className="text-blue-700 font-medium">Groupes</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {groupes.filter(g => g.active).length}
            </div>
            <div className="text-blue-700 font-medium">Actifs</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <button
              onClick={openNewGroupeModal}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
            >
              ➕ Nouveau Groupe
            </button>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 flex items-center justify-center">
            <a
              href="/admin/gestion-clients"
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold rounded-lg transition-colors"
            >
              👥 Voir Clients
            </a>
          </div>
        </div>

        {/* Liste groupes */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-purple-600 border-b border-purple-700">
            <h3 className="text-lg font-bold text-white">Liste des Groupes</h3>
          </div>

          {groupes.length === 0 ? (
            <div className="p-12 text-center text-blue-600">
              Aucun groupe pour le moment. Cliquez sur "Nouveau Groupe" pour en créer un.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50 border-b border-purple-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-900 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-900 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-900 uppercase">Login</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-900 uppercase">SIRET</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-purple-900 uppercase">Clients</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-900 uppercase">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-purple-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {groupes.map((groupe) => (
                    <tr key={groupe.id} className="hover:bg-purple-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-blue-900">{groupe.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700">
                        <div>{groupe.contactPrincipal || '-'}</div>
                        <div className="text-xs">{groupe.telephone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-700">{groupe.email}</div>
                        <div className="text-xs text-gray-500">🔐 {groupe.password ? '••••••••' : 'Pas de mot de passe'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-700 font-mono text-sm">
                        {groupe.siret || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-900 rounded-full text-sm font-bold">
                          👥 {getClientsCount(groupe.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          groupe.active 
                            ? 'bg-green-100 text-green-900' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {groupe.active ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleEdit(groupe)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded mr-2 text-sm font-medium"
                        >
                          ✏️ Éditer
                        </button>
                        <button
                          onClick={() => handleDelete(groupe.id)}
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
            <div className="px-6 py-4 bg-purple-600 border-b border-purple-700">
              <h3 className="text-xl font-bold text-white">
                {editingGroupe ? 'Modifier le Groupe' : 'Nouveau Groupe'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Info login */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔐</span>
                  <div className="text-sm text-purple-900 font-medium">
                    <strong>Identifiants de connexion :</strong> L'email et le mot de passe permettent au groupe 
                    de se connecter à l'espace client et de voir tous leurs clients et sites.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-purple-500 focus:outline-none text-blue-900"
                  placeholder="Ex: ENGIE"
                  required
                />
              </div>

              {/* EMAIL + PASSWORD (côte à côte) */}
              <div className="grid md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <div>
                  <label className="block text-sm font-semibold text-purple-900 mb-2">
                    Email de connexion *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-blue-900"
                    placeholder="groupe@solairenettoyage.fr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-900 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-blue-900"
                    placeholder="MotDePasseGroupe123"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Contact principal
                  </label>
                  <input
                    type="text"
                    value={formData.contactPrincipal}
                    onChange={(e) => setFormData({ ...formData, contactPrincipal: e.target.value })}
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
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="01 23 45 67 89"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.siret}
                    onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="820 504 421 00000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                    placeholder="123 rue de la Paix, 75000 Paris"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="Description du groupe..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label className="text-sm font-semibold text-blue-900">
                  Groupe actif (peut se connecter)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? '⏳ Enregistrement...' : (editingGroupe ? '✅ Modifier' : '✅ Créer')}
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
