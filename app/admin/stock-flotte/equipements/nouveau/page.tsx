'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createEquipement } from '@/lib/firebase'

export default function NouvelEquipementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [typeEquipement, setTypeEquipement] = useState<'vehicule' | 'accessoire'>('vehicule')
  
  const [formData, setFormData] = useState({
    // Commun
    statut: 'en_service',
    // Véhicule
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
    // Accessoire
    nom: '',
    typeAccessoire: '',
    numeroSerie: '',
    dateAchat: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validations selon le type
    if (typeEquipement === 'vehicule') {
      if (!formData.immatriculation || !formData.marque || !formData.modele || !formData.typeVehicule) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }
    } else {
      if (!formData.nom || !formData.typeAccessoire) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }
    }

    try {
      setLoading(true)

      if (typeEquipement === 'vehicule') {
        await createEquipement({
          type: 'vehicule',
          statut: formData.statut as any,
          immatriculation: formData.immatriculation.toUpperCase(),
          marque: formData.marque,
          modele: formData.modele,
          annee: formData.annee ? parseInt(formData.annee) : 0,
          typeVehicule: formData.typeVehicule,
          kmHeures: formData.kmHeures ? parseInt(formData.kmHeures) : 0,
          carburant: formData.carburant || undefined,
          capaciteReservoir: formData.capaciteReservoir ? parseFloat(formData.capaciteReservoir) : 0,
          controleTechniqueExpiration: formData.controleTechnique || undefined,
          assuranceExpiration: formData.assuranceExpiration || undefined,
          vgpExpiration: formData.vgpExpiration || undefined,
          notes: formData.notes || undefined
        } as any)
      } else {
        await createEquipement({
          type: 'accessoire',
          statut: formData.statut as any,
          nom: formData.nom,
          typeAccessoire: formData.typeAccessoire,
          numeroSerie: formData.numeroSerie || undefined,
          dateAchat: formData.dateAchat || undefined,
          notes: formData.notes || undefined
        } as any)
      }

      alert('Équipement créé avec succès !')
      router.push('/admin/stock-flotte/equipements')
    } catch (error) {
      console.error('Erreur création équipement:', error)
      alert('Erreur lors de la création')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/equipements" className="hover:text-gray-900">Équipements</Link>
          <span>→</span>
          <span className="text-gray-900">Nouveau</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nouvel Équipement</h1>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type d'équipement */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Type d'équipement</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTypeEquipement('vehicule')}
              className={`p-6 rounded-lg border-2 text-center transition ${
                typeEquipement === 'vehicule'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="text-4xl mb-2">🚛</div>
              <div className="font-semibold text-lg">Véhicule</div>
              <div className="text-sm text-gray-600">Camion, porteur, semi-remorque</div>
            </button>

            <button
              type="button"
              onClick={() => setTypeEquipement('accessoire')}
              className={`p-6 rounded-lg border-2 text-center transition ${
                typeEquipement === 'accessoire'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
              }`}
            >
              <div className="text-4xl mb-2">🔧</div>
              <div className="font-semibold text-lg">Accessoire</div>
              <div className="text-sm text-gray-600">Brosse, nacelle, équipement</div>
            </button>
          </div>
        </div>

        {/* Formulaire Véhicule */}
        {typeEquipement === 'vehicule' && (
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
                    placeholder="AB-123-CD"
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
                    <option value="Utilitaire">Utilitaire</option>
                    <option value="Autre">Autre</option>
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
                    placeholder="Ex: Renault, Iveco..."
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
                    placeholder="Ex: Master, Daily..."
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
                    placeholder="2020"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Km / Heures initial
                  </label>
                  <input
                    type="number"
                    value={formData.kmHeures}
                    onChange={(e) => setFormData({ ...formData, kmHeures: e.target.value })}
                    placeholder="0"
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
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents & Contrôles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrôle Technique (expiration)
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
                    Assurance (expiration)
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
                    VGP (expiration)
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

        {/* Formulaire Accessoire */}
        {typeEquipement === 'accessoire' && (
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
                  placeholder="Ex: Brosse rotative, Nacelle..."
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
                  <option value="Brosse">Brosse</option>
                  <option value="Nacelle">Nacelle</option>
                  <option value="Perche">Perche</option>
                  <option value="Équipement de sécurité">Équipement de sécurité</option>
                  <option value="Outillage">Outillage</option>
                  <option value="Autre">Autre</option>
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
                  placeholder="N° série"
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
          </div>
        )}

        {/* Statut et Notes */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut et notes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut initial
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="en_service">✅ En service</option>
                <option value="en_maintenance">⚙️ En maintenance</option>
                <option value="hors_service">❌ Hors service</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes / Commentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Informations complémentaires..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/stock-flotte/equipements"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
          >
            {loading ? 'Création...' : 'Créer l\'équipement'}
          </button>
        </div>
      </form>
    </div>
  )
}