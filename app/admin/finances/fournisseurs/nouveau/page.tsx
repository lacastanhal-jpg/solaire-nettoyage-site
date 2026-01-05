'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createFournisseur, fournisseurExistsByNom } from '@/lib/firebase/fournisseurs'

export default function NouveauFournisseurPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    notes: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

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

    setLoading(true)

    try {
      // Vérifier si le nom existe déjà
      const exists = await fournisseurExistsByNom(formData.nom)
      if (exists) {
        alert('Un fournisseur avec ce nom existe déjà')
        setLoading(false)
        return
      }

      // Créer le fournisseur
      const id = await createFournisseur({
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
        actif: true
      })

      alert('Fournisseur créé avec succès !')
      router.push(`/admin/finances/fournisseurs/${id}`)
    } catch (error) {
      console.error('Erreur création fournisseur:', error)
      alert('Erreur lors de la création du fournisseur')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nouveau Fournisseur</h1>
        <p className="text-gray-600 mt-1">Ajouter un nouveau fournisseur</p>
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
                placeholder="Ex: KARCHER France"
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
                placeholder="14 chiffres"
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
                placeholder="Rue, numéro..."
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
                  placeholder="Ex: 31000"
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
                  placeholder="Ex: Toulouse"
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
                placeholder="contact@fournisseur.fr"
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
                placeholder="0123456789"
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
                placeholder="Ex: Jean Dupont"
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
                placeholder="0123456789"
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
                placeholder="FR76..."
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
                placeholder="BNPAFRPP..."
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
            placeholder="Notes internes..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link
            href="/admin/finances/fournisseurs"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer le fournisseur'}
          </button>
        </div>
      </form>
    </div>
  )
}
