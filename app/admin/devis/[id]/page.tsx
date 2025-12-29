'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getDevisById, updateDevisStatut, type Devis } from '@/lib/firebase/devis'

const STATUT_LABELS = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
  envoyé: { label: 'Envoyé', color: 'bg-blue-100 text-blue-800' },
  accepté: { label: 'Accepté', color: 'bg-green-100 text-green-800' },
  refusé: { label: 'Refusé', color: 'bg-red-100 text-red-800' }
}

export default function VoirDevisPage() {
  const router = useRouter()
  const params = useParams()
  const devisId = params.id as string

  const [loading, setLoading] = useState(true)
  const [devis, setDevis] = useState<Devis | null>(null)
  const [changingStatut, setChangingStatut] = useState(false)

  useEffect(() => {
    loadDevis()
  }, [devisId])

  async function loadDevis() {
    try {
      setLoading(true)
      const data = await getDevisById(devisId)
      
      if (!data) {
        alert('Devis introuvable')
        router.push('/admin/devis')
        return
      }

      setDevis(data)
    } catch (error) {
      console.error('Erreur chargement devis:', error)
      alert('Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeStatut(newStatut: 'brouillon' | 'envoyé' | 'accepté' | 'refusé') {
    if (!devis) return

    try {
      setChangingStatut(true)
      await updateDevisStatut(devisId, newStatut)
      await loadDevis()
      alert(`Statut changé en "${STATUT_LABELS[newStatut].label}"`)
    } catch (error) {
      console.error('Erreur changement statut:', error)
      alert('Erreur lors du changement de statut')
    } finally {
      setChangingStatut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800">Chargement du devis...</div>
      </div>
    )
  }

  if (!devis) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/devis')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Retour aux devis
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{devis.numero}</h1>
              <p className="text-gray-800 mt-1">
                {new Date(devis.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/devis/${devisId}/modifier`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ✏️ Modifier
              </button>
            </div>
          </div>
        </div>

        {/* Statut et actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-800 mb-2">Statut actuel</div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUT_LABELS[devis.statut].color}`}>
                {STATUT_LABELS[devis.statut].label}
              </span>
            </div>
            <div className="flex gap-2">
              {devis.statut !== 'brouillon' && (
                <button
                  onClick={() => handleChangeStatut('brouillon')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Brouillon
                </button>
              )}
              {devis.statut !== 'envoyé' && (
                <button
                  onClick={() => handleChangeStatut('envoyé')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Envoyé
                </button>
              )}
              {devis.statut !== 'accepté' && (
                <button
                  onClick={() => handleChangeStatut('accepté')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Accepté
                </button>
              )}
              {devis.statut !== 'refusé' && (
                <button
                  onClick={() => handleChangeStatut('refusé')}
                  disabled={changingStatut}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  → Refusé
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-900">
            <div>
              <div className="text-sm text-gray-700">Nom</div>
              <div className="font-medium">{devis.clientNom}</div>
            </div>
            {devis.groupeNom && (
              <div>
                <div className="text-sm text-gray-700">Groupe</div>
                <div className="font-medium">{devis.groupeNom}</div>
              </div>
            )}
          </div>
        </div>

        {/* Lignes du devis */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Détail du devis</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Site</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Article</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Qté</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">P.U. HT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total HT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">TVA</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devis.lignes.map((ligne, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{ligne.siteNom}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{ligne.articleCode} - {ligne.articleNom}</div>
                      {ligne.articleDescription && (
                        <div className="text-sm text-gray-700 mt-1">{ligne.articleDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{ligne.quantite.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{ligne.prixUnitaire.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{ligne.totalHT.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-gray-900">{ligne.totalTVA.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right text-gray-900 font-bold">{ligne.totalTTC.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {devis.notes && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-900 whitespace-pre-wrap">{devis.notes}</p>
          </div>
        )}

        {/* Totaux */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Totaux</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-lg text-gray-900">
              <span>Total HT</span>
              <span className="font-bold">{devis.totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg text-gray-900">
              <span>Total TVA</span>
              <span className="font-bold">{devis.totalTVA.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-blue-600 pt-3 border-t">
              <span>Total TTC</span>
              <span>{devis.totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Infos création */}
        <div className="mt-6 text-sm text-gray-700 space-y-1">
          <div>Créé le : {new Date(devis.createdAt).toLocaleString('fr-FR')}</div>
          <div>Dernière modification : {new Date(devis.updatedAt).toLocaleString('fr-FR')}</div>
        </div>
      </div>
    </div>
  )
}
