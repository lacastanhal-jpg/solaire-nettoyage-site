'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getEquipement, 
  updateEquipement
} from '@/lib/firebase'
import type { Equipement } from '@/lib/types/stock-flotte'
import { getEquipementDisplayName, getEquipementFullDisplay, isVehicule } from '@/lib/utils/equipement-display'

export default function ModifierEquipementPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [equipement, setEquipement] = useState<Equipement | null>(null)
  
  const [formData, setFormData] = useState({
    statut: '',
    immatriculation: '',
    marque: '',
    modele: '',
    annee: '',
    typeVehicule: '',
    kmHeures: '',
    carburant: '',
    capaciteReservoir: '',
    controleTechnique: '',
    assuranceExpiration: '',
    vgpExpiration: '',
    notes: '',
    nom: '',
    typeAccessoire: '',
    numeroSerie: '',
    dateAchat: ''
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    try {
      const eqData = await getEquipement(params.id)

      if (!eqData) {
        alert('Équipement non trouvé')
        router.push('/admin/stock-flotte/equipements')
        return
      }

      setEquipement(eqData)

      setFormData(prev => ({
        ...prev,
        statut: (eqData as any).statut,
        immatriculation: (eqData as any).immatriculation || '',
        marque: (eqData as any).marque || '',
        modele: (eqData as any).modele || '',
        annee: (eqData as any).annee?.toString() || '',
        typeVehicule: (eqData as any).typeVehicule || '',
        kmHeures: (eqData as any).kmHeures?.toString() || '',
        carburant: (eqData as any).carburant || '',
        capaciteReservoir: (eqData as any).capaciteReservoir?.toString() || '',
        controleTechnique: (eqData as any).controleTechniqueExpiration || '',
        assuranceExpiration: (eqData as any).assuranceExpiration || '',
        vgpExpiration: (eqData as any).vgpExpiration || '',
        notes: (eqData as any).notes || '',
        nom: (eqData as any).nom || '',
        typeAccessoire: (eqData as any).typeAccessoire || '',
        numeroSerie: (eqData as any).numeroSerie || '',
        dateAchat: (eqData as any).dateAchat || ''
      }))
    } catch (error) {
      console.error('Erreur chargement équipement:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!equipement) return

    try {
      setSaving(true)

      const updateData: any = {
        statut: formData.statut,
        notes: formData.notes || undefined
      }

      if (isVehicule(equipement as any)) {
        updateData.immatriculation = formData.immatriculation.toUpperCase()
        updateData.marque = formData.marque
        updateData.modele = formData.modele
        updateData.annee = formData.annee ? parseInt(formData.annee) : undefined
        updateData.typeVehicule = formData.typeVehicule
        updateData.kmHeures = formData.kmHeures ? parseInt(formData.kmHeures) : 0
        updateData.carburant = formData.carburant || undefined
        updateData.capaciteReservoir = formData.capaciteReservoir ? parseFloat(formData.capaciteReservoir) : undefined
        updateData.controleTechniqueExpiration = formData.controleTechnique || undefined
        updateData.assuranceExpiration = formData.assuranceExpiration || undefined
        updateData.vgpExpiration = formData.vgpExpiration || undefined
      } else {
        updateData.nom = formData.nom
        updateData.typeAccessoire = formData.typeAccessoire
        updateData.numeroSerie = formData.numeroSerie || undefined
        updateData.dateAchat = formData.dateAchat || undefined
      }

      await updateEquipement(params.id, updateData)

      alert('Équipement modifié avec succès !')
      router.push(`/admin/stock-flotte/equipements/${params.id}`)
    } catch (error) {
      console.error('Erreur modification équipement:', error)
      alert('Erreur lors de la modification')
      setSaving(false)
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

  const estVehicule = isVehicule(equipement as any)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/equipements" className="hover:text-gray-900">Équipements</Link>
          <span>→</span>
          <Link href={`/admin/stock-flotte/equipements/${params.id}`} className="hover:text-gray-900">
            {getEquipementDisplayName(equipement as any)}
          </Link>
          <span>→</span>
          <span className="text-gray-900">Modifier</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Modifier {estVehicule ? '🚛' : '🔧'} {getEquipementDisplayName(equipement as any)}
        </h1>
        {!estVehicule && (
          <p className="text-sm text-gray-600 mt-2">
            💡 Pour gérer l'affectation, utilisez la page{' '}
            <Link href="/admin/stock-flotte/affectations" className="text-blue-600 hover:underline font-medium">
              Affectations
            </Link>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {estVehicule && (
          <>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations véhicule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Immatriculation <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.immatriculation}
                    onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type véhicule <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.typeVehicule}
                    onChange={(e) => setFormData({ ...formData, typeVehicule: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="Porteur 26T">Porteur 26T</option>
                    <option value="Porteur 32T">Porteur 32T</option>
                    <option value="Semi-remorque">Semi-remorque</option>
                    <option value="Fourgon">Fourgon</option>
                    <option value="Utilitaire">Utilitaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.modele}
                    onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année
                  </label>
                  <input
                    type="number"
                    value={formData.annee}
                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilométrage / Heures
                  </label>
                  <input
                    type="number"
                    value={formData.kmHeures}
                    onChange={(e) => setFormData({ ...formData, kmHeures: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carburant
                  </label>
                  <select
                    value={formData.carburant}
                    onChange={(e) => setFormData({ ...formData, carburant: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité réservoir (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.capaciteReservoir}
                    onChange={(e) => setFormData({ ...formData, capaciteReservoir: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrôle technique
                  </label>
                  <input
                    type="date"
                    value={formData.controleTechnique}
                    onChange={(e) => setFormData({ ...formData, controleTechnique: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assurance expiration
                  </label>
                  <input
                    type="date"
                    value={formData.assuranceExpiration}
                    onChange={(e) => setFormData({ ...formData, assuranceExpiration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VGP expiration
                  </label>
                  <input
                    type="date"
                    value={formData.vgpExpiration}
                    onChange={(e) => setFormData({ ...formData, vgpExpiration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {!estVehicule && (
          <>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations accessoire</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type accessoire <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.typeAccessoire}
                    onChange={(e) => setFormData({ ...formData, typeAccessoire: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="Nacelle">Nacelle</option>
                    <option value="Échafaudage">Échafaudage</option>
                    <option value="Remorque">Remorque</option>
                    <option value="Citerne">Citerne</option>
                    <option value="Outillage">Outillage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de série
                  </label>
                  <input
                    type="text"
                    value={formData.numeroSerie}
                    onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'achat
                  </label>
                  <input
                    type="date"
                    value={formData.dateAchat}
                    onChange={(e) => setFormData({ ...formData, dateAchat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Affectation :</strong> Pour affecter cet accessoire à un véhicule, utilisez la page{' '}
                  <Link href="/admin/stock-flotte/affectations" className="underline font-semibold hover:text-blue-900">
                    Affectations
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut et notes</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="disponible">✅ En service</option>
                <option value="en_maintenance">🔧 En maintenance</option>
                <option value="hors_service">❌ Hors service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes / Commentaires
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Remarques, historique, etc."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/admin/stock-flotte/equipements/${params.id}`}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
