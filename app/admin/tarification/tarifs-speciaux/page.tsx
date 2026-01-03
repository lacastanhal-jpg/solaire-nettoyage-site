'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getAllTarifsSpeciaux,
  activerTarifSpecial,
  desactiverTarifSpecial
} from '@/lib/firebase/tarifs-speciaux-sites'
import type { TarifSpecialSite } from '@/lib/types/tarification'

export default function TarifsSpeciauxPage() {
  const router = useRouter()
  const [tarifs, setTarifs] = useState<TarifSpecialSite[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'actif' | 'inactif'>('all')

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/intranet/login')
      return
    }
    chargerTarifs()
  }, [router])

  async function chargerTarifs() {
    try {
      setLoading(true)
      const data = await getAllTarifsSpeciaux()
      setTarifs(data)
    } catch (error) {
      console.error('Erreur chargement tarifs:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActif(id: string, actif: boolean) {
    try {
      if (actif) {
        await desactiverTarifSpecial(id)
      } else {
        await activerTarifSpecial(id)
      }
      await chargerTarifs()
    } catch (error) {
      console.error('Erreur toggle actif:', error)
      alert('Erreur lors de la modification')
    }
  }

  const tarifsFiltres = tarifs.filter(t => {
    if (filter === 'actif') return t.actif
    if (filter === 'inactif') return !t.actif
    return true
  })

  const stats = {
    total: tarifs.length,
    actifs: tarifs.filter(t => t.actif).length,
    inactifs: tarifs.filter(t => !t.actif).length,
    avecForfait: tarifs.filter(t => t.forfait).length,
    avecTarifsFixes: tarifs.filter(t => t.tarifsFixes && t.tarifsFixes.length > 0).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/intranet/dashboard" className="hover:text-gray-900">Accueil</Link>
            <span>→</span>
            <Link href="/admin/tarification" className="hover:text-gray-900">Tarification</Link>
            <span>→</span>
            <span className="text-gray-900">Tarifs spéciaux</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">⭐ Tarifs Spéciaux Sites</h1>
              <p className="text-gray-600">
                Tarifs négociés spécifiques par site (priorité maximale)
              </p>
            </div>
            
            <Link
              href="/admin/tarification/tarifs-speciaux/nouveau"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              + Nouveau Tarif Spécial
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow border-2 border-gray-200 p-4">
            <div className="text-2xl font-black text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow border-2 border-green-200 p-4">
            <div className="text-2xl font-black text-green-600">{stats.actifs}</div>
            <div className="text-sm text-gray-600">Actifs</div>
          </div>
          <div className="bg-white rounded-lg shadow border-2 border-gray-200 p-4">
            <div className="text-2xl font-black text-gray-500">{stats.inactifs}</div>
            <div className="text-sm text-gray-600">Inactifs</div>
          </div>
          <div className="bg-white rounded-lg shadow border-2 border-blue-200 p-4">
            <div className="text-2xl font-black text-blue-600">{stats.avecForfait}</div>
            <div className="text-sm text-gray-600">Forfaits</div>
          </div>
          <div className="bg-white rounded-lg shadow border-2 border-purple-200 p-4">
            <div className="text-2xl font-black text-purple-600">{stats.avecTarifsFixes}</div>
            <div className="text-sm text-gray-600">Tarifs fixes</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900">Filtre:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setFilter('actif')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'actif'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Actifs ({stats.actifs})
            </button>
            <button
              onClick={() => setFilter('inactif')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'inactif'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactifs ({stats.inactifs})
            </button>
          </div>
        </div>

        {/* Liste */}
        {tarifsFiltres.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun tarif spécial
            </h3>
            <p className="text-gray-600 mb-6">
              Les tarifs spéciaux permettent de définir des conditions particulières par site
            </p>
            <Link
              href="/admin/tarification/tarifs-speciaux/nouveau"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold"
            >
              Créer un tarif spécial
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tarifsFiltres.map(tarif => (
              <div
                key={tarif.id}
                className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6 hover:border-orange-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {tarif.siteNom}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        tarif.actif
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tarif.actif ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Période */}
                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-1">📅 Période</div>
                        <div className="text-sm text-gray-600">
                          Du {new Date(tarif.dateDebut).toLocaleDateString('fr-FR')}
                          {tarif.dateFin && ` au ${new Date(tarif.dateFin).toLocaleDateString('fr-FR')}`}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <div className="text-sm font-bold text-gray-700 mb-1">🏷️ Type</div>
                        <div className="text-sm text-gray-600">
                          {tarif.forfait && '💰 Forfait'}
                          {tarif.tarifsFixes && tarif.tarifsFixes.length > 0 && '📊 Tarifs fixes'}
                        </div>
                      </div>

                      {/* Forfait */}
                      {tarif.forfait && (
                        <div>
                          <div className="text-sm font-bold text-gray-700 mb-1">💰 Forfait</div>
                          <div className="text-sm text-gray-600">
                            {tarif.forfait.montant}€ / {tarif.forfait.type}
                            <br />
                            {tarif.forfait.surfaceInclude}m² inclus
                            {tarif.forfait.prixSupplementaire && (
                              <span className="text-xs">
                                {' '}(+{tarif.forfait.prixSupplementaire}€/m² supp.)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tarifs fixes */}
                      {tarif.tarifsFixes && tarif.tarifsFixes.length > 0 && (
                        <div>
                          <div className="text-sm font-bold text-gray-700 mb-1">📊 Tarifs fixes</div>
                          <div className="text-sm text-gray-600">
                            {tarif.tarifsFixes.length} prestation(s)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Motif */}
                    {tarif.motif && (
                      <div className="mt-4 text-sm text-gray-600 italic">
                        💬 {tarif.motif}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/admin/tarification/tarifs-speciaux/${tarif.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center"
                    >
                      Détails
                    </Link>
                    <button
                      onClick={() => handleToggleActif(tarif.id, tarif.actif)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        tarif.actif
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {tarif.actif ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
