'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOperateur, getAllOperateurs, type Operateur } from '@/lib/firebase'

export default function InitOperateursPage() {
  const router = useRouter()
  const [operateurs, setOperateurs] = useState<(Operateur & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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
      const data = await getAllOperateurs()
      setOperateurs(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const initOperateurs = async () => {
    if (!confirm('Initialiser les 6 opérateurs ?')) return

    setCreating(true)

    const operateursData = [
      {
        nom: 'Nom1',
        prenom: 'Sebastien',
        email: 'sebastien@solairenettoyage.fr',
        telephone: '',
        statut: 'Disponible' as const,
        role: 'Operateur' as const,
        dateDebut: '2020-01-01',
        certificationRef: 'sebastien',
        notes: ''
      },
      {
        nom: 'Nom2',
        prenom: 'Joffrey',
        email: 'joffrey@solairenettoyage.fr',
        telephone: '',
        statut: 'Disponible' as const,
        role: 'Operateur' as const,
        dateDebut: '2020-01-01',
        certificationRef: 'joffrey',
        notes: ''
      },
      {
        nom: 'Nom3',
        prenom: 'Fabien',
        email: 'fabien@solairenettoyage.fr',
        telephone: '',
        statut: 'Disponible' as const,
        role: 'Operateur' as const,
        dateDebut: '2020-01-01',
        certificationRef: 'fabien',
        notes: ''
      },
      {
        nom: 'Nom4',
        prenom: 'Angelo',
        email: 'angelo@solairenettoyage.fr',
        telephone: '',
        statut: 'Disponible' as const,
        role: 'Operateur' as const,
        dateDebut: '2020-01-01',
        certificationRef: 'angelo',
        notes: ''
      },
      {
        nom: 'Gely',
        prenom: 'Jerome',
        email: 'jerome@solairenettoyage.fr',
        telephone: '',
        statut: 'Disponible' as const,
        role: 'Admin' as const,
        dateDebut: '2016-01-01',
        certificationRef: 'jerome',
        notes: 'Gérant'
      },
      {
        nom: 'Gely',
        prenom: 'Axel',
        email: 'axel@solairenettoyage.fr',
        telephone: '',
        statut: 'Disponible' as const,
        role: 'Admin' as const,
        dateDebut: '2016-01-01',
        certificationRef: 'axel',
        notes: 'Administrateur'
      }
    ]

    try {
      for (const operateur of operateursData) {
        await createOperateur(operateur)
      }
      alert('✅ 6 opérateurs créés !')
      loadOperateurs()
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
        <div className="text-gray-900 text-xl font-bold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">👷</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestion Opérateurs</h1>
                <p className="text-sm text-gray-900 font-medium">Initialiser les opérateurs terrain</p>
              </div>
            </div>
            <a
              href="/admin/gestion-operateurs"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              → Gestion Opérateurs
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
        {operateurs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-12 text-center">
            <div className="text-6xl mb-4">👷‍♂️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aucun opérateur configuré
            </h2>
            <p className="text-gray-900 font-medium mb-8">
              Initialise les 6 opérateurs de terrain (Sebastien, Joffrey, Fabien, Angelo, Jerome, Axel)
            </p>
            <button
              onClick={initOperateurs}
              disabled={creating}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-lg text-lg transition-all disabled:opacity-50"
            >
              {creating ? '⏳ Création...' : '✨ Initialiser les 6 opérateurs'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-2xl font-bold text-green-900 mb-2">
                ✅ Opérateurs configurés
              </div>
              <div className="text-green-900 font-medium">
                {operateurs.length} opérateur{operateurs.length > 1 ? 's' : ''} prêt{operateurs.length > 1 ? 's' : ''}
              </div>
            </div>

            {operateurs.map((op) => (
              <div
                key={op.id}
                className="bg-white rounded-xl shadow-lg border border-blue-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {op.prenom} {op.nom}
                    </h3>
                    <p className="text-gray-900 font-medium">{op.email}</p>
                  </div>
                  <div className="flex gap-2">
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
                </div>

                {op.notes && (
                  <div className="text-sm text-gray-900 font-medium mt-2">
                    📝 {op.notes}
                  </div>
                )}
              </div>
            ))}

            <div className="text-center">
              <a
                href="/admin/gestion-operateurs"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg text-lg transition-all"
              >
                👥 Gérer les Opérateurs
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
