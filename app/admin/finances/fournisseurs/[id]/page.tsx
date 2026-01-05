'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFournisseurById, deleteFournisseur, type Fournisseur } from '@/lib/firebase/fournisseurs'

export default function DetailFournisseurPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null)

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
    } catch (error) {
      console.error('Erreur chargement fournisseur:', error)
      alert('Erreur lors du chargement du fournisseur')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!fournisseur) return

    if (!confirm(`Voulez-vous vraiment désactiver le fournisseur "${fournisseur.nom}" ?`)) {
      return
    }

    try {
      await deleteFournisseur(fournisseur.id)
      alert('Fournisseur désactivé avec succès')
      router.push('/admin/finances/fournisseurs')
    } catch (error) {
      console.error('Erreur suppression fournisseur:', error)
      alert('Erreur lors de la désactivation du fournisseur')
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{fournisseur.nom}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  fournisseur.actif
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {fournisseur.actif ? 'Actif' : 'Inactif'}
              </span>
              {fournisseur.siret && (
                <span className="text-gray-600">SIRET: {fournisseur.siret}</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/finances/fournisseurs/${fournisseur.id}/modifier`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Modifier
            </Link>
            {fournisseur.actif && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Désactiver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom</dt>
              <dd className="text-sm text-gray-900 mt-1">{fournisseur.nom}</dd>
            </div>
            {fournisseur.siret && (
              <div>
                <dt className="text-sm font-medium text-gray-500">SIRET</dt>
                <dd className="text-sm text-gray-900 mt-1">{fournisseur.siret}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Délai de paiement</dt>
              <dd className="text-sm text-gray-900 mt-1">{fournisseur.delaiPaiement} jours</dd>
            </div>
          </dl>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
          <dl className="space-y-3">
            {fournisseur.adresse && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                <dd className="text-sm text-gray-900 mt-1">{fournisseur.adresse}</dd>
              </div>
            )}
            {(fournisseur.codePostal || fournisseur.ville) && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Ville</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {fournisseur.codePostal} {fournisseur.ville}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
          <dl className="space-y-3">
            {fournisseur.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  <a href={`mailto:${fournisseur.email}`} className="text-blue-600 hover:text-blue-700">
                    {fournisseur.email}
                  </a>
                </dd>
              </div>
            )}
            {fournisseur.telephone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  <a href={`tel:${fournisseur.telephone}`} className="text-blue-600 hover:text-blue-700">
                    {fournisseur.telephone}
                  </a>
                </dd>
              </div>
            )}
            {fournisseur.contactNom && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom du contact</dt>
                <dd className="text-sm text-gray-900 mt-1">{fournisseur.contactNom}</dd>
              </div>
            )}
            {fournisseur.contactTelephone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Téléphone du contact</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  <a href={`tel:${fournisseur.contactTelephone}`} className="text-blue-600 hover:text-blue-700">
                    {fournisseur.contactTelephone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Informations bancaires */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations bancaires</h2>
          <dl className="space-y-3">
            {fournisseur.iban && (
              <div>
                <dt className="text-sm font-medium text-gray-500">IBAN</dt>
                <dd className="text-sm text-gray-900 mt-1 font-mono">{fournisseur.iban}</dd>
              </div>
            )}
            {fournisseur.bic && (
              <div>
                <dt className="text-sm font-medium text-gray-500">BIC</dt>
                <dd className="text-sm text-gray-900 mt-1 font-mono">{fournisseur.bic}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Notes */}
      {fournisseur.notes && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{fournisseur.notes}</p>
        </div>
      )}

      {/* Métadonnées */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Créé le:</span>
            <span className="ml-2 text-gray-900">
              {new Date(fournisseur.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Modifié le:</span>
            <span className="ml-2 text-gray-900">
              {new Date(fournisseur.updatedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Retour */}
      <div className="mt-6">
        <Link
          href="/admin/finances/fournisseurs"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Retour à la liste des fournisseurs
        </Link>
      </div>
    </div>
  )
}
