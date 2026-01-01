'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getAllGrillesTarifaires,
  activerGrilleTarifaire,
  desactiverGrilleTarifaire,
  dupliquerGrilleTarifaire
} from '@/lib/firebase/grilles-tarifaires'
import type { GrilleTarifaire } from '@/lib/types/tarification'

export default function GrillesPage() {
  const router = useRouter()
  const [grilles, setGrilles] = useState<GrilleTarifaire[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    chargerGrilles()
  }, [router])

  async function chargerGrilles() {
    try {
      setLoading(true)
      const data = await getAllGrillesTarifaires()
      setGrilles(data)
    } catch (error) {
      console.error('Erreur chargement grilles:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActif(id: string, actif: boolean) {
    try {
      if (actif) {
        await desactiverGrilleTarifaire(id)
      } else {
        await activerGrilleTarifaire(id)
      }
      await chargerGrilles()
    } catch (error) {
      console.error('Erreur toggle:', error)
      alert('Erreur lors de la modification')
    }
  }

  async function handleDupliquer(id: string, nom: string) {
    const nouveauNom = prompt(`Nom de la nouvelle grille (copie de "${nom}") :`, `${nom} - Copie`)
    if (!nouveauNom) return

    try {
      await dupliquerGrilleTarifaire(id, nouveauNom)
      alert('✅ Grille dupliquée')
      await chargerGrilles()
    } catch (error: any) {
      alert(`❌ ${error.message}`)
    }
  }

  function getTypeBadge(type: string) {
    const styles = {
      general: 'bg-gray-100 text-gray-800',
      groupe: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      site: 'bg-orange-100 text-orange-800'
    }
    const labels = {
      general: 'Générale',
      groupe: 'Groupe',
      client: 'Client',
      site: 'Site'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    )
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
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/intranet/dashboard" className="hover:text-gray-900">Accueil</Link>
            <span>→</span>
            <Link href="/admin/tarification" className="hover:text-gray-900">Tarification</Link>
            <span>→</span>
            <span className="text-gray-900">Grilles</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Grilles Tarifaires</h1>
              <p className="text-gray-600">
                Gestion des grilles multi-niveaux ({grilles.length} grilles)
              </p>
            </div>
            <Link
              href="/admin/tarification/grilles/nouvelle"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
            >
              ➕ Nouvelle grille
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Astuce :</strong> Les grilles sont appliquées par ordre de priorité.
            Plus le chiffre de priorité est bas, plus la grille est prioritaire.
          </p>
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {grilles.map(grille => (
            <div
              key={grille.id}
              className={`bg-white rounded-lg shadow-lg border-2 p-6 ${
                grille.actif ? 'border-green-200' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{grille.nom}</h3>
                    {getTypeBadge(grille.type)}
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Priorité {grille.priorite}
                    </span>
                  </div>
                  
                  {grille.entiteNom && (
                    <p className="text-sm text-gray-600 mb-2">
                      📌 {grille.entiteNom}
                    </p>
                  )}
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                      📅 Du {new Date(grille.dateDebut).toLocaleDateString('fr-FR')}
                      {grille.dateFin ? ` au ${new Date(grille.dateFin).toLocaleDateString('fr-FR')}` : ' (sans fin)'}
                    </span>
                    <span>
                      📋 {grille.lignes.length} prestation{grille.lignes.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {grille.conditionsParticulieres && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      {grille.conditionsParticulieres}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActif(grille.id, grille.actif)}
                    className={`px-3 py-2 text-sm font-bold rounded ${
                      grille.actif
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {grille.actif ? '✓ Active' : '✗ Inactive'}
                  </button>
                  
                  <button
                    onClick={() => handleDupliquer(grille.id, grille.nom)}
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 rounded font-bold"
                    title="Dupliquer"
                  >
                    📋 Dupliquer
                  </button>
                  
                  <Link
                    href={`/admin/tarification/grilles/${grille.id}`}
                    className="px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded font-bold"
                  >
                    ✏️ Modifier
                  </Link>
                </div>
              </div>

              {/* Aperçu lignes */}
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grille.lignes.slice(0, 3).map((ligne, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3 border border-gray-200">
                      <div className="font-bold text-sm text-gray-900 mb-1">{ligne.prestationCode}</div>
                      <div className="text-xs text-gray-600">
                        {ligne.tarifForfaitaire !== undefined ? (
                          <>Forfait : {ligne.tarifForfaitaire.toFixed(2)}€</>
                        ) : (
                          <>{ligne.tranchesSurface.length} tranche{ligne.tranchesSurface.length > 1 ? 's' : ''}</>
                        )}
                      </div>
                      {ligne.majorations.length > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          +{ligne.majorations.length} majoration{ligne.majorations.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {ligne.remises.length > 0 && (
                        <div className="text-xs text-green-600 mt-1">
                          {ligne.remises.length} remise{ligne.remises.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                  {grille.lignes.length > 3 && (
                    <div className="bg-gray-50 rounded p-3 border border-gray-200 flex items-center justify-center">
                      <span className="text-sm text-gray-600">
                        +{grille.lignes.length - 3} autre{grille.lignes.length - 3 > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {grilles.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">
                Aucune grille tarifaire. Commencez par créer une grille générale.
              </p>
              <Link
                href="/admin/tarification/grilles/nouvelle"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
              >
                ➕ Créer la première grille
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
