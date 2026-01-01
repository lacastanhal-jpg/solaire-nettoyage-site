'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEquipement, getAllEquipements } from '@/lib/firebase'
import type { Equipement } from '@/lib/types/stock-flotte'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

export default function FicheEquipementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [equipement, setEquipement] = useState<Equipement | null>(null)
  const [accessoires, setAccessoires] = useState<Equipement[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      // Charger l'équipement
      const eqData = await getEquipement(params.id)
      if (!eqData) {
        alert('Équipement non trouvé')
        router.push('/admin/stock-flotte/equipements')
        return
      }
      setEquipement(eqData)

      // Si c'est un véhicule, charger ses accessoires
      if (eqData.type === 'vehicule') {
        const allEquipements = await getAllEquipements()
        const accessoiresAffectes = allEquipements.filter(
          e => e.type === 'accessoire' && (e as any).vehiculeParentId === params.id
        )
        setAccessoires(accessoiresAffectes)
      }

      // Charger les interventions (TODO: quand module interventions sera créé)
      // const interventionsData = await getInterventionsParEquipement(params.id)
      // setInterventions(interventionsData)
    } catch (error) {
      console.error('Erreur chargement équipement:', error)
      alert('Erreur lors du chargement')
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

  if (!equipement) return null

  function getStatutBadge(statut: string) {
    switch(statut) {
      case 'en_service':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">✅ En service</span>
      case 'en_maintenance':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">⚙️ En maintenance</span>
      case 'hors_service':
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">❌ Hors service</span>
      default:
        return <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">{statut}</span>
    }
  }

  const isVehicule = equipement.type === 'vehicule'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/equipements" className="hover:text-gray-900">Équipements</Link>
          <span>→</span>
          <span className="text-gray-900">{isVehicule ? (equipement as any).immatriculation : (equipement as any).nom}</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {isVehicule ? `🚛 ${(equipement as any).immatriculation}` : `🔧 ${(equipement as any).nom}`}
              </h1>
              {getStatutBadge((equipement as any).statut)}
            </div>
            {isVehicule && (
              <p className="text-gray-600 text-lg">
                {(equipement as any).marque} {(equipement as any).modele} {(equipement as any).annee && `(${(equipement as any).annee})`}
              </p>
            )}
            {!isVehicule && (
              <p className="text-gray-600 text-lg">{(equipement as any).typeAccessoire}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/stock-flotte/equipements/${params.id}/modifier`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Modifier
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations principales */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations principales</h2>
            
            {isVehicule ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Immatriculation</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).immatriculation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type véhicule</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).typeVehicule}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Marque</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).marque}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Modèle</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).modele}</p>
                </div>
                {(equipement as any).annee && (
                  <div>
                    <p className="text-sm text-gray-600">Année</p>
                    <p className="font-semibold text-gray-900">{(equipement as any).annee}</p>
                  </div>
                )}
                {(equipement as any).carburant && (
                  <div>
                    <p className="text-sm text-gray-600">Carburant</p>
                    <p className="font-semibold text-gray-900">{(equipement as any).carburant}</p>
                  </div>
                )}
                {(equipement as any).capaciteReservoir && (
                  <div>
                    <p className="text-sm text-gray-600">Capacité réservoir</p>
                    <p className="font-semibold text-gray-900">{(equipement as any).capaciteReservoir} L</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Km / Heures</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).kmHeures?.toLocaleString() || 0}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).nom}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900">{(equipement as any).typeAccessoire}</p>
                </div>
                {(equipement as any).numeroSerie && (
                  <div>
                    <p className="text-sm text-gray-600">Numéro de série</p>
                    <p className="font-semibold text-gray-900">{(equipement as any).numeroSerie}</p>
                  </div>
                )}
                {(equipement as any).dateAchat && (
                  <div>
                    <p className="text-sm text-gray-600">Date d'achat</p>
                    <p className="font-semibold text-gray-900">
                      {new Date((equipement as any).dateAchat).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {(equipement as any).vehiculeParentId && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Affecté à</p>
                    <Link
                      href={`/admin/stock-flotte/equipements/${(equipement as any).vehiculeParentId}`}
                      className="font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Voir le véhicule →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {(equipement as any).notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-gray-900 mt-1">{(equipement as any).notes}</p>
              </div>
            )}
          </div>

          {/* Documents & Contrôles (véhicules uniquement) */}
          {isVehicule && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents & Contrôles</h2>
              
              <div className="grid grid-cols-3 gap-4">
                {(equipement as any).controleTechniqueExpiration && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Contrôle Technique</p>
                    <p className="font-semibold text-gray-900">
                      {new Date((equipement as any).controleTechniqueExpiration).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {(equipement as any).assuranceExpiration && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Assurance</p>
                    <p className="font-semibold text-gray-900">
                      {new Date((equipement as any).assuranceExpiration).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {(equipement as any).vgpExpiration && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">VGP</p>
                    <p className="font-semibold text-gray-900">
                      {new Date((equipement as any).vgpExpiration).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessoires affectés (véhicules uniquement) */}
          {isVehicule && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Accessoires affectés ({accessoires.length})
              </h2>
              
              {accessoires.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun accessoire affecté</p>
              ) : (
                <div className="space-y-2">
                  {accessoires.map(acc => (
                    <Link
                      key={acc.id}
                      href={`/admin/stock-flotte/equipements/${acc.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">🔧 {(acc as any).nom}</p>
                          <p className="text-sm text-gray-600">{(acc as any).typeAccessoire}</p>
                        </div>
                        {getStatutBadge((acc as any).statut)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Historique interventions */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Historique interventions ({interventions.length})
            </h2>
            
            {interventions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune intervention enregistrée</p>
            ) : (
              <div className="space-y-3">
                {interventions.slice(0, 5).map((intervention: any) => (
                  <div key={intervention.id} className="p-3 border-l-4 border-orange-500 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{intervention.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(intervention.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Link
                        href={`/admin/stock-flotte/interventions/${intervention.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Voir →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Actions & Infos */}
        <div className="space-y-6">
          {/* Statut */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Statut actuel</p>
            <div>{getStatutBadge((equipement as any).statut)}</div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/stock-flotte/interventions/nouveau?equipementId=${params.id}`}
                className="block w-full px-4 py-2 text-center bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium"
              >
                ⚙️ Nouvelle intervention
              </Link>
              {isVehicule && (
                <Link
                  href={`/admin/stock-flotte/equipements/nouveau?type=accessoire&vehiculeId=${params.id}`}
                  className="block w-full px-4 py-2 text-center bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium"
                >
                  🔧 Ajouter accessoire
                </Link>
              )}
              <Link
                href={`/admin/stock-flotte/equipements/${params.id}/modifier`}
                className="block w-full px-4 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
              >
                ✏️ Modifier
              </Link>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Informations système</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Créé le</p>
                <p className="text-gray-900">
                  {new Date(equipement.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Modifié le</p>
                <p className="text-gray-900">
                  {new Date(equipement.updatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
