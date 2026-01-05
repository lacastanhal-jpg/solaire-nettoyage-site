'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFournisseurById, updateFournisseur, fournisseurExistsByNom, type Fournisseur } from '@/lib/firebase/fournisseurs'

export default function ModifierFournisseurPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    siret: '',
    adresse: '',
    codePostal: '',
    ville: '',
    email: '',
    telephone: '',
    contactNom: '',
    contactTelephone: '',
    iban: '',
    bic: '',
    delaiPaiement: '30',
    notes: '',
    actif: true
  })

  useEffect(() => {
    loadFournisseur()
  }, [params.id])

  async function loadFournisseur() {
    if (!params.id || typeof params.id !== 'string') return

    try {
      setLoading(true)
      const data = await getFournisseurById(params.id)
      
      if (!data) {
        alert('Fournisseur introuvable')
        router.push('/admin/finances/fournisseurs')
        return
      }

      setFournisseur(data)
      setFormData({
        nom: data.nom,
        siret: data.siret || '',
        adresse: data.adresse || '',
        codePostal: data.codePostal || '',
        ville: data.ville || '',
        email: data.email || '',
        telephone: data.telephone || '',
        contactNom: data.contactNom || '',
        contactTelephone: data.contactTelephone || '',
        iban: data.iban || '',
        bic: data.bic || '',
        delaiPaiement: data.delaiPaiement.toString(),
        notes: data.notes || '',
        actif: data.actif
      })
    } catch (error) {
      console.error('Erreur chargement fournisseur:', error)
      alert('Erreur lors du chargement du fournisseur')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fournisseur) return

    // Validation
    if (!formData.nom) {
      alert('Le nom du fournisseur est obligatoire')
      return
    }

    const delaiPaiement = parseInt(formData.delaiPaiement)
    if (isNaN(delaiPaiement) || delaiPaiement < 0) {
      alert('Le délai de paiement doit être un nombre positif')
      return
    }

    setSaving(true)

    try {
      // Vérifier si le nom existe déjà (sauf pour ce fournisseur)
      if (formData.nom !== fournisseur.nom) {
        const exists = await fournisseurExistsByNom(formData.nom, fournisseur.id)
        if (exists) {
          alert('Un fournisseur avec ce nom existe déjà')
          setSaving(false)
          return
        }
      }

      // Mettre à jour le fournisseur
      await updateFournisseur(fournisseur.id, {
        nom: formData.nom,
        siret: formData.siret || undefined,
        adresse: formData.adresse || undefined,
        codePostal: formData.codePostal || undefined,
        ville: formData.ville || undefined,
        email: formData.email || undefined,
        telephone: formData.telephone || undefined,
        contactNom: formData.contactNom || undefined,
        contactTelephone: formData.contactTelephone || undefined,
        iban: formData.iban || undefined,
        bic: formData.bic || undefined,
        delaiPaiement: delaiPaiement,
        notes: formData.notes || undefined,
        actif: formData.actif
      })

      alert('Fournisseur modifié avec succès !')
      router.push(`/admin/finances/fournisseurs/${fournisseur.id}`)
    } catch (error) {
      console.error('Erreur modification fournisseur:', error)
      alert('Erreur lors de la modification du fournisseur')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!fournisseur) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Fournisseur introuvable</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Modifier le fournisseur</h1>
        <p className="text-gray-600 mt-1">{fournisseur.nom}</p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Informations générales */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du fournisseur <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIRET
              </label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai de paiement (jours)
              </label>
              <input
                type="number"
                min="0"
                value={formData.delaiPaiement}
                onChange={(e) => setFormData({ ...formData, delaiPaiement: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.actif}
                  onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Fournisseur actif</span>
              </label>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.codePostal}
                  onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du contact
              </label>
              <input
                type="text"
                value={formData.contactNom}
                onChange={(e) => setFormData({ ...formData, contactNom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone du contact
              </label>
              <input
                type="tel"
                value={formData.contactTelephone}
                onChange={(e) => setFormData({ ...formData, contactTelephone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Informations bancaires */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations bancaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IBAN
              </label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BIC
              </label>
              <input
                type="text"
                value={formData.bic}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link
            href={`/admin/finances/fournisseurs/${fournisseur.id}`}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}
