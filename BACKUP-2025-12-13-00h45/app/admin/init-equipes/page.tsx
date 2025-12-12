'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createEquipe, getAllEquipes, type Equipe } from '@/lib/firebase'

export default function InitEquipesPage() {
  const router = useRouter()
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    loadEquipes()
  }, [router])

  const loadEquipes = async () => {
    try {
      const data = await getAllEquipes()
      setEquipes(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const initEquipes = async () => {
    if (!confirm('Initialiser les 3 équipes ?')) return

    setCreating(true)

    const equipesData = [
      {
        numero: 1 as 1,
        nom: 'Équipe 1',
        type: 'Semi-remorque 44t',
        materiel: 'Cuve 10 000L, Nacelle HA20 RTJ PRO, 2 Robots Solar Cleano 3m30',
        email: 'equipe1@solairenettoyage.fr',
        password: 'equipe1',
        membres: ['Sebastien', 'Joffrey'],
        active: true
      },
      {
        numero: 2 as 2,
        nom: 'Équipe 2',
        type: 'Porteur 26t',
        materiel: 'Cuve 8 000L, Nacelle HA16 RTJ PRO, 2 Robots Solar Cleano 3m30',
        email: 'equipe2@solairenettoyage.fr',
        password: 'equipe2',
        membres: ['Fabien'],
        active: true
      },
      {
        numero: 3 as 3,
        nom: 'Équipe 3',
        type: 'Porteur 26t',
        materiel: 'Cuve 8 000L, Nacelle HA16 RTJ PRO, 2 Robots Solar Cleano 3m30',
        email: 'equipe3@solairenettoyage.fr',
        password: 'equipe3',
        membres: ['Angelo'],
        active: true
      }
    ]

    try {
      for (const equipe of equipesData) {
        await createEquipe(equipe)
      }
      alert('✅ 3 équipes créées !')
      loadEquipes()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">👷</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">Gestion Équipes</h1>
                <p className="text-sm text-gray-900 font-medium">Initialiser les équipes terrain</p>
              </div>
            </div>
            <a
              href="/admin/calendrier"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              → Calendrier
            </a>
            <a
              href="/admin/gestion-equipes"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
            >
              → Gérer Équipes
            </a>
            <a
              href="/intranet/dashboard"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
            >
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {equipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-12 text-center">
            <div className="text-6xl mb-4">👷‍♂️</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Aucune équipe configurée
            </h2>
            <p className="text-gray-900 font-medium mb-8">
              Initialise les 3 équipes de terrain pour commencer à planifier les interventions
            </p>
            <button
              onClick={initEquipes}
              disabled={creating}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg text-lg transition-all disabled:opacity-50"
            >
              {creating ? '⏳ Création...' : '✨ Initialiser les 3 équipes'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-green-900 mb-2">
                ✅ Équipes configurées
              </div>
              <div className="text-green-700">
                {equipes.length} équipe{equipes.length > 1 ? 's' : ''} prête{equipes.length > 1 ? 's' : ''}
              </div>
            </div>

            {equipes.map((equipe) => (
              <div
                key={equipe.id}
                className="bg-white rounded-xl shadow-lg border border-blue-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">
                      {equipe.nom}
                    </h3>
                    <p className="text-gray-900 font-medium">{equipe.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    equipe.active 
                      ? 'bg-green-100 text-green-900' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {equipe.active ? '✅ Active' : '⏸️ Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-900">Email:</span>
                    <span className="ml-2 text-gray-900 font-medium">{equipe.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Membres:</span>
                    <span className="ml-2 text-gray-900 font-medium">{equipe.membres.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Matériel:</span>
                    <p className="text-gray-900 font-medium mt-1">{equipe.materiel}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center">
              <a
                href="/admin/calendrier"
                className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg text-lg transition-all"
              >
                📅 Aller au Calendrier
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
