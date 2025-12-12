'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllEquipes,
  getAllOperateurs,
  updateEquipeComposition,
  type Equipe,
  type Operateur
} from '@/lib/firebase'

export default function GestionEquipesPage() {
  const router = useRouter()
  const [equipes, setEquipes] = useState<(Equipe & { id: string })[]>([])
  const [operateurs, setOperateurs] = useState<(Operateur & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEquipe, setEditingEquipe] = useState<(Equipe & { id: string }) | null>(null)
  const [selectedOperateurs, setSelectedOperateurs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

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
      const [equipesData, operateursData] = await Promise.all([
        getAllEquipes(),
        getAllOperateurs()
      ])
      setEquipes(equipesData)
      setOperateurs(operateursData)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComposer = (equipe: Equipe & { id: string }) => {
    setEditingEquipe(equipe)
    setSelectedOperateurs(equipe.membresIds || [])
    setShowModal(true)
  }

  const toggleOperateur = (operateurId: string) => {
    if (selectedOperateurs.includes(operateurId)) {
      setSelectedOperateurs(selectedOperateurs.filter(id => id !== operateurId))
    } else {
      setSelectedOperateurs([...selectedOperateurs, operateurId])
    }
  }

  const handleSave = async () => {
    if (!editingEquipe) return
    
    if (selectedOperateurs.length === 0) {
      alert('⚠️ Sélectionne au moins 1 opérateur')
      return
    }

    try {
      setSaving(true)

      // Récupérer les noms des opérateurs sélectionnés
      const membresNoms = operateurs
        .filter(op => selectedOperateurs.includes(op.id))
        .map(op => `${op.prenom} ${op.nom}`)

      await updateEquipeComposition(editingEquipe.id, selectedOperateurs, membresNoms)
      
      alert(`✅ Composition Équipe ${editingEquipe.numero} mise à jour !`)
      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const getEquipeCouleur = (numero: number) => {
    switch (numero) {
      case 1: return 'from-red-500 to-red-600'
      case 2: return 'from-blue-500 to-blue-600'
      case 3: return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getEquipeIcon = (numero: number) => {
    switch (numero) {
      case 1: return '🔴'
      case 2: return '🔵'
      case 3: return '🟢'
      default: return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl font-bold">Chargement...</div>
      </div>
    )
  }

  if (equipes.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-12 max-w-2xl text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Équipes non configurées
          </h2>
          <p className="text-gray-900 font-medium mb-8">
            Tu dois d'abord initialiser les 3 équipes
          </p>
          <a
            href="/admin/init-equipes"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg text-lg transition-all"
          >
            → Initialiser les Équipes
          </a>
        </div>
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
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestion Équipes</h1>
                <p className="text-sm text-gray-900 font-medium">Composer les équipes terrain</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/calendrier"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {equipes.map((equipe) => (
            <div
              key={equipe.id}
              className="bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden"
            >
              {/* Header Équipe */}
              <div className={`bg-gradient-to-r ${getEquipeCouleur(equipe.numero)} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{getEquipeIcon(equipe.numero)}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Équipe {equipe.numero}
                    </h3>
                    <p className="text-white/90 text-sm font-medium">
                      {equipe.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Matériel :</h4>
                  <p className="text-sm text-gray-900 font-medium">{equipe.materiel}</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    Composition actuelle :
                  </h4>
                  {equipe.membresNoms && equipe.membresNoms.length > 0 ? (
                    <div className="space-y-2">
                      {equipe.membresNoms.map((nom, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg"
                        >
                          <span className="text-lg">👤</span>
                          <span className="text-sm font-bold text-gray-900">{nom}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-orange-600 font-medium p-3 bg-orange-50 rounded-lg">
                      ⚠️ Aucun opérateur affecté
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleComposer(equipe)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  ✏️ Composer l'Équipe
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Composition */}
      {showModal && editingEquipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`p-6 bg-gradient-to-r ${getEquipeCouleur(editingEquipe.numero)}`}>
              <h2 className="text-2xl font-bold text-white">
                {getEquipeIcon(editingEquipe.numero)} Composer Équipe {editingEquipe.numero}
              </h2>
              <p className="text-white/90 mt-1">
                Sélectionne 1, 2 ou 3 opérateurs
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-bold text-gray-900 mb-2">
                  📋 Opérateurs sélectionnés : {selectedOperateurs.length}
                </div>
                {selectedOperateurs.length > 0 && (
                  <div className="text-sm text-gray-900 font-medium">
                    {operateurs
                      .filter(op => selectedOperateurs.includes(op.id))
                      .map(op => `${op.prenom} ${op.nom}`)
                      .join(', ')}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {operateurs.map((op) => {
                  const isSelected = selectedOperateurs.includes(op.id)
                  const isDisponible = op.statut === 'Disponible'
                  
                  return (
                    <div
                      key={op.id}
                      onClick={() => isDisponible && toggleOperateur(op.id)}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : isDisponible
                          ? 'border-gray-300 hover:border-indigo-300 bg-white'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="text-white text-sm">✓</span>}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {op.prenom} {op.nom}
                            </div>
                            <div className="text-sm text-gray-900 font-medium">
                              {op.role}
                            </div>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          op.statut === 'Disponible'
                            ? 'bg-green-100 text-green-900'
                            : op.statut === 'Congé'
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-red-100 text-red-900'
                        }`}>
                          {op.statut}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6 border-t border-blue-200 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || selectedOperateurs.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? '⏳ Sauvegarde...' : '✅ Sauvegarder Composition'}
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
