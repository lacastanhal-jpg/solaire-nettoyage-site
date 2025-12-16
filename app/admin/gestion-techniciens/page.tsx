'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IntranetHeader from '../../intranet/components/IntranetHeader'
import { createTechnicien, getAllTechniciens, updateTechnicien, deleteTechnicien, type TechnicienExtincteur } from '@/lib/firebase/extincteurs'

export default function GestionTechniciensPage() {
  const router = useRouter()
  const [techniciens, setTechniciens] = useState<(TechnicienExtincteur & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    entreprise: '',
    email: '',
    telephone: '',
    numeroAgrement: '',
    password: '',
    active: true
  })

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('intranet_logged_in')
    const userRole = localStorage.getItem('user_role')
    
    if (!isLoggedIn || userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    
    loadTechniciens()
  }, [router])

  const loadTechniciens = async () => {
    try {
      setLoading(true)
      const data = await getAllTechniciens()
      setTechniciens(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.password && !editingId) {
      alert('Le mot de passe est obligatoire pour créer un compte')
      return
    }

    try {
      if (editingId) {
        const updates: any = { ...formData }
        if (!updates.password) delete updates.password // Ne pas mettre à jour le mot de passe s'il est vide
        await updateTechnicien(editingId, updates)
      } else {
        await createTechnicien(formData)
      }
      
      setShowForm(false)
      resetForm()
      loadTechniciens()
      alert(editingId ? '✅ Technicien modifié' : '✅ Technicien créé')
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (tech: TechnicienExtincteur & { id: string }) => {
    setEditingId(tech.id)
    setShowPassword(false)
    setFormData({
      nom: tech.nom,
      prenom: tech.prenom,
      entreprise: tech.entreprise,
      email: tech.email,
      telephone: tech.telephone || '',
      numeroAgrement: tech.numeroAgrement || '',
      password: '', // Ne pas afficher le mot de passe
      active: tech.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, nom: string) => {
    if (confirm(`Supprimer le technicien ${nom} ?`)) {
      try {
        await deleteTechnicien(id)
        loadTechniciens()
        alert('✅ Technicien supprimé')
      } catch (error) {
        console.error('Erreur:', error)
        alert('❌ Erreur lors de la suppression')
      }
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowPassword(false)
    setFormData({
      nom: '',
      prenom: '',
      entreprise: '',
      email: '',
      telephone: '',
      numeroAgrement: '',
      password: '',
      active: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <IntranetHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IntranetHeader />

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/intranet/extincteurs')}
              className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            >
              ← Retour aux extincteurs
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Gestion Techniciens</h1>
            <p className="text-gray-600">Créer et gérer les comptes techniciens extincteurs</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            ➕ Créer un compte technicien
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="font-medium text-blue-900 mb-2">ℹ️ Information</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Les techniciens peuvent se connecter sur <strong>/technicien/login</strong></li>
            <li>• Ils ont accès uniquement à la vérification des extincteurs</li>
            <li>• L'email et le mot de passe sont nécessaires pour la connexion</li>
          </ul>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingId ? '✏️ Modifier' : '➕ Créer'} un technicien
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                      <input
                        type="text"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
                    <input
                      type="text"
                      value={formData.entreprise}
                      onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                      placeholder="Sécurité Incendie Pro"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="technicien@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        placeholder="06 12 34 56 78"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro agrément</label>
                      <input
                        type="text"
                        value={formData.numeroAgrement}
                        onChange={(e) => setFormData({ ...formData, numeroAgrement: e.target.value })}
                        placeholder="AGR-2024-001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe {editingId ? '(laisser vide pour ne pas changer)' : '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                          required={!editingId}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Compte actif</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium"
                    >
                      {editingId ? '💾 Enregistrer' : '➕ Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        resetForm()
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Liste techniciens */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Techniciens enregistrés ({techniciens.length})
            </h2>
          </div>

          {techniciens.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Aucun technicien enregistré. Créez le premier compte !
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {techniciens.map((tech) => (
                <div key={tech.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {tech.prenom} {tech.nom}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tech.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tech.active ? '✅ Actif' : '❌ Inactif'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>🏢 {tech.entreprise}</div>
                        <div>📧 {tech.email}</div>
                        {tech.telephone && <div>📱 {tech.telephone}</div>}
                        {tech.numeroAgrement && <div>🔖 Agrément: {tech.numeroAgrement}</div>}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Créé le {new Date(tech.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tech)}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(tech.id!, `${tech.prenom} ${tech.nom}`)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lien vers interface technicien */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="font-medium text-orange-900 mb-2">🔗 Accès technicien</h2>
          <p className="text-sm text-orange-800 mb-3">
            Les techniciens doivent se connecter sur cette URL :
          </p>
          <div className="bg-white border border-orange-300 rounded-lg p-3 font-mono text-sm">
            <a 
              href="/technicien/login" 
              target="_blank"
              className="text-orange-600 hover:text-orange-800"
            >
              {typeof window !== 'undefined' && window.location.origin}/technicien/login
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
