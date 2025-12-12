'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllOperateurs,
  createOperateur,
  updateOperateur,
  deleteOperateur,
  type Operateur
} from '@/lib/firebase'

export default function GestionOperateursPage() {
  const router = useRouter()
  const [operateurs, setOperateurs] = useState<(Operateur & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOperateur, setEditingOperateur] = useState<(Operateur & { id: string }) | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    statut: 'Disponible' as 'Disponible' | 'Congé' | 'Arrêt maladie',
    role: 'Operateur' as 'Admin' | 'Operateur',
    dateDebut: '',
    certificationRef: '',
    notes: ''
  })

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadOperateurs()
  }, [router])

  const loadOperateurs = async () => {
    try {
      setLoading(true)
      const data = await getAllOperateurs()
      setOperateurs(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      statut: 'Disponible',
      role: 'Operateur',
      dateDebut: new Date().toISOString().split('T')[0],
      certificationRef: '',
      notes: ''
    })
    setEditingOperateur(null)
    setShowModal(true)
  }

  const handleEdit = (op: Operateur & { id: string }) => {
    setFormData({
      nom: op.nom,
      prenom: op.prenom,
      email: op.email,
      telephone: op.telephone || '',
      statut: op.statut,
      role: op.role,
      dateDebut: op.dateDebut,
      certificationRef: op.certificationRef || '',
      notes: op.notes || ''
    })
    setEditingOperateur(op)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      alert('⚠️ Nom, prénom et email sont obligatoires')
      return
    }

    try {
      setSaving(true)

      if (editingOperateur) {
        await updateOperateur(editingOperateur.id, formData)
        alert('✅ Opérateur modifié')
      } else {
        await createOperateur(formData)
        alert('✅ Opérateur créé')
      }

      setShowModal(false)
      loadOperateurs()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer ${nom} ?\n\nCela ne supprimera pas ses interventions passées.`)) return

    try {
      await deleteOperateur(id)
      alert('✅ Opérateur supprimé')
      loadOperateurs()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur suppression')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestion Opérateurs</h1>
                <p className="text-sm text-gray-900 font-medium">Gérer l'équipe terrain</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNew}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                ➕ Nouvel Opérateur
              </button>
              <a
                href="/admin/calendrier"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                → Calendrier
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-blue-500 mb-2">{operateurs.length}</div>
            <div className="text-gray-900 font-bold">Total opérateurs</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {operateurs.filter(o => o.statut === 'Disponible').length}
            </div>
            <div className="text-gray-900 font-bold">Disponibles</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {operateurs.filter(o => o.statut === 'Congé').length}
            </div>
            <div className="text-gray-900 font-bold">En congé</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="text-4xl font-bold text-purple-500 mb-2">
              {operateurs.filter(o => o.role === 'Admin').length}
            </div>
            <div className="text-gray-900 font-bold">Admins</div>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 bg-indigo-600 border-b border-indigo-700">
            <h3 className="text-lg font-bold text-white">
              👥 Équipe Terrain ({operateurs.length})
            </h3>
          </div>

          {operateurs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👷</div>
              <div className="text-xl font-bold mb-2 text-gray-900">Aucun opérateur</div>
              <div className="mb-6 text-gray-900 font-medium">Commence par créer tes opérateurs</div>
              <button
                onClick={handleNew}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
              >
                ➕ Nouvel Opérateur
              </button>
            </div>
          ) : (
            <div className="divide-y divide-blue-100">
              {operateurs.map((op) => (
                <div key={op.id} className="p-6 hover:bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          {op.prenom} {op.nom}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          op.statut === 'Disponible' 
                            ? 'bg-green-100 text-green-900' 
                            : op.statut === 'Congé'
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-red-100 text-red-900'
                        }`}>
                          {op.statut}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          op.role === 'Admin'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {op.role}
                        </span>
                      </div>

                      <div className="text-sm text-gray-900 font-medium space-y-1">
                        <div>📧 {op.email}</div>
                        {op.telephone && <div>📱 {op.telephone}</div>}
                        <div>📅 Depuis le {new Date(op.dateDebut).toLocaleDateString('fr-FR')}</div>
                        {op.notes && <div>📝 {op.notes}</div>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`/intranet/certifications?operateur=${op.certificationRef || op.prenom.toLowerCase()}`}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded text-sm font-medium"
                      >
                        📋 Certifications
                      </a>
                      <button
                        onClick={() => handleEdit(op)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-sm font-medium"
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(op.id, `${op.prenom} ${op.nom}`)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded text-sm font-medium"
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

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingOperateur ? '✏️ Modifier Opérateur' : '➕ Nouvel Opérateur'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value as any})}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-bold"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Congé">Congé</option>
                    <option value="Arrêt maladie">Arrêt maladie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-bold"
                  >
                    <option value="Operateur">Operateur</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">Date début</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">
                  Référence Certifications
                </label>
                <input
                  type="text"
                  value={formData.certificationRef}
                  onChange={(e) => setFormData({...formData, certificationRef: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                  placeholder="ex: sebastien"
                />
                <div className="text-sm text-gray-900 font-medium mt-1">
                  ID pour lier avec le système de certifications
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-900 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-medium"
                  placeholder="Notes internes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-blue-200 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? '⏳ Sauvegarde...' : editingOperateur ? '💾 Modifier' : '✅ Créer'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
