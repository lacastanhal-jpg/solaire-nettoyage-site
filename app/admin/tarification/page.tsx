'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStatistiquesPrestations } from '@/lib/firebase/prestations-catalogue'
import { getStatistiquesGrilles } from '@/lib/firebase/grilles-tarifaires'
import { getStatistiquesTarifsSpeciaux } from '@/lib/firebase/tarifs-speciaux-sites'

export default function TarificationDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [statsPrestations, setStatsPrestations] = useState<any>(null)
  const [statsGrilles, setStatsGrilles] = useState<any>(null)
  const [statsTarifs, setStatsTarifs] = useState<any>(null)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    chargerStats()
  }, [router])

  async function chargerStats() {
    try {
      setLoading(true)
      const [prestations, grilles, tarifs] = await Promise.all([
        getStatistiquesPrestations(),
        getStatistiquesGrilles(),
        getStatistiquesTarifsSpeciaux()
      ])
      setStatsPrestations(prestations)
      setStatsGrilles(grilles)
      setStatsTarifs(tarifs)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/intranet/dashboard" className="hover:text-gray-900">Accueil</Link>
            <span>→</span>
            <span className="text-gray-900">Tarification</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Tarification</h1>
          <p className="text-gray-600">
            Gestion des prestations, grilles tarifaires et tarifs spéciaux
          </p>
        </div>

        {/* Cards statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Prestations */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📦 Prestations</h3>
              <span className="text-3xl font-black text-blue-600">
                {statsPrestations?.total || 0}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Actives</span>
                <span className="font-bold text-green-600">{statsPrestations?.actives || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inactives</span>
                <span className="font-bold text-gray-500">{statsPrestations?.inactives || 0}</span>
              </div>
              {statsPrestations?.prixMoyen && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix moyen</span>
                  <span className="font-bold text-blue-600">
                    {statsPrestations.prixMoyen.toFixed(2)}€
                  </span>
                </div>
              )}
            </div>
            <Link
              href="/admin/tarification/prestations"
              className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-bold"
            >
              Gérer les prestations
            </Link>
          </div>

          {/* Grilles tarifaires */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📊 Grilles</h3>
              <span className="text-3xl font-black text-green-600">
                {statsGrilles?.total || 0}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Actives</span>
                <span className="font-bold text-green-600">{statsGrilles?.actives || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Générales</span>
                <span className="font-bold text-gray-700">{statsGrilles?.parType?.general || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Groupes/Clients</span>
                <span className="font-bold text-gray-700">
                  {(statsGrilles?.parType?.groupe || 0) + (statsGrilles?.parType?.client || 0)}
                </span>
              </div>
            </div>
            <Link
              href="/admin/tarification/grilles"
              className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-bold"
            >
              Gérer les grilles
            </Link>
          </div>

          {/* Tarifs spéciaux */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">⭐ Tarifs spéciaux</h3>
              <span className="text-3xl font-black text-orange-600">
                {statsTarifs?.total || 0}
              </span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Actifs</span>
                <span className="font-bold text-green-600">{statsTarifs?.actifs || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avec forfait</span>
                <span className="font-bold text-gray-700">{statsTarifs?.avecForfait || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarifs fixes</span>
                <span className="font-bold text-gray-700">{statsTarifs?.avecTarifsFixes || 0}</span>
              </div>
            </div>
            <Link
              href="/admin/tarification/tarifs-speciaux"
              className="block w-full px-4 py-2 bg-orange-600 text-white text-center rounded-lg hover:bg-orange-700 font-bold"
            >
              Gérer les tarifs spéciaux
            </Link>
          </div>
        </div>

        {/* Aide */}
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Hiérarchie des tarifs</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-orange-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-bold text-gray-900">Tarif spécial SITE</div>
                <div className="text-sm text-gray-600">
                  Tarif spécifique à un site (forfait mensuel, prix fixe...)
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-bold text-gray-900">Grille CLIENT</div>
                <div className="text-sm text-gray-600">
                  Grille tarifaire spécifique à un client
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-bold text-gray-900">Grille GROUPE</div>
                <div className="text-sm text-gray-600">
                  Grille tarifaire pour un groupe (ex: EDF, ENGIE)
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-gray-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <div className="font-bold text-gray-900">Grille GÉNÉRALE (fallback)</div>
                <div className="text-sm text-gray-600">
                  Grille par défaut si aucune autre grille ne correspond
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
