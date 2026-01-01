'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { type FactureFournisseur, type MouvementStock } from '@/lib/types/stock-flotte'
import {
  getFactureFournisseurById,
  genererMouvementsStockFacture,
  marquerFacturePayee
} from '@/lib/firebase/stock-factures-fournisseurs'
import { getMouvementStockById } from '@/lib/firebase/stock-mouvements'

export default function DetailFactureFournisseurPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [facture, setFacture] = useState<FactureFournisseur | null>(null)
  const [mouvements, setMouvements] = useState<MouvementStock[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [operateur, setOperateur] = useState('')

  useEffect(() => {
    chargerFacture()
    
    const userName = localStorage.getItem('user_name')
    if (userName) setOperateur(userName)
  }, [params.id])

  async function chargerFacture() {
    try {
      setLoading(true)
      const data = await getFactureFournisseurById(params.id)
      
      if (!data) {
        alert('Facture non trouvée')
        router.push('/admin/stock-flotte/factures-fournisseurs')
        return
      }

      setFacture(data)

      if (data.mouvementsStockIds && data.mouvementsStockIds.length > 0) {
        const mouvementsData: MouvementStock[] = []
        for (const mvtId of data.mouvementsStockIds) {
          const mvt = await getMouvementStockById(mvtId)
          if (mvt) mouvementsData.push(mvt)
        }
        setMouvements(mouvementsData)
      }
    } catch (error) {
      console.error('Erreur chargement facture:', error)
      alert('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenererStock() {
    if (!facture) return

    if (!confirm(
      `Générer les entrées stock pour cette facture ?\n\n` +
      `${facture.lignes.length} mouvements "entrée" seront créés automatiquement.\n` +
      `Les stocks seront mis à jour dans les dépôts concernés.`
    )) {
      return
    }

    try {
      setGenerating(true)
      
      await genererMouvementsStockFacture(params.id, operateur || 'Admin')
      
      alert('✅ Entrées stock générées avec succès !')
      
      await chargerFacture()
    } catch (error: any) {
      console.error('Erreur génération stock:', error)
      alert(`❌ ${error.message || 'Erreur lors de la génération'}`)
    } finally {
      setGenerating(false)
    }
  }

  async function handleMarquerPayee() {
    if (!facture) return

    if (!confirm('Marquer cette facture comme payée ?')) {
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await marquerFacturePayee(params.id, today, 'Virement', '')
      alert('✅ Facture marquée comme payée')
      await chargerFacture()
    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur lors de la mise à jour')
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

  if (!facture) return null

  const stockDejaGenere = facture.mouvementsStockIds.length > 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin/stock-flotte" className="hover:text-gray-900">Stock & Flotte</Link>
          <span>→</span>
          <Link href="/admin/stock-flotte/factures-fournisseurs" className="hover:text-gray-900">
            Factures Fournisseurs
          </Link>
          <span>→</span>
          <span className="text-gray-900">Détail</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">📄 {facture.numero}</h1>
              {facture.statut === 'en_attente' && (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  ⏳ En attente
                </span>
              )}
              {facture.statut === 'stock_genere' && (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  📦 Stock généré
                </span>
              )}
              {facture.statut === 'payee' && (
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  ✅ Payée
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {facture.fournisseur}
            </p>
          </div>

          <div className="flex gap-3">
            {!stockDejaGenere && (
              <button
                onClick={handleGenererStock}
                disabled={generating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
              >
                {generating ? 'Génération...' : '📦 Générer Entrées Stock'}
              </button>
            )}
            
            {stockDejaGenere && facture.statut !== 'payee' && (
              <button
                onClick={handleMarquerPayee}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                ✓ Marquer Payée
              </button>
            )}

            <Link
              href={`/admin/stock-flotte/factures-fournisseurs/${params.id}/modifier`}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              ✏️ Modifier
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations facture */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informations</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Date Facture</div>
                <div className="font-semibold text-gray-900">
                  {new Date(facture.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Date Échéance</div>
                <div className="font-semibold text-gray-900">
                  {new Date(facture.dateEcheance).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {facture.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Notes</div>
                <div className="text-gray-900">{facture.notes}</div>
              </div>
            )}
          </div>

          {/* Articles */}
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📦 Articles ({facture.lignes.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700">Article</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Qté</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">PU HT</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">TVA</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">Total HT</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-700">Total TTC</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-700">Dépôt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {facture.lignes.map((ligne, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{ligne.articleCode}</div>
                        <div className="text-xs text-gray-500">{ligne.articleDescription}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{ligne.quantite}</td>
                      <td className="px-4 py-3 text-right">{ligne.prixUnitaire.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-center">{ligne.tauxTVA}%</td>
                      <td className="px-4 py-3 text-right font-semibold">{ligne.totalHT.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-right font-bold">{ligne.totalTTC.toFixed(2)} €</td>
                      <td className="px-4 py-3 text-center text-sm">{ligne.depotDestination}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mouvements stock générés */}
          {mouvements.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📦 Entrées Stock Générées ({mouvements.length})
              </h2>
              
              <div className="space-y-3">
                {mouvements.map(mvt => (
                  <Link
                    key={mvt.id}
                    href={`/admin/stock-flotte/mouvements/${mvt.id}`}
                    className="block bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Entrée +{mvt.quantite} unités
                        </div>
                        <div className="text-sm text-gray-600">{mvt.raison}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Dépôt: {mvt.depotDestination} • {new Date(mvt.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-blue-600 font-semibold">
                        Voir →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Totaux */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Montants</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Total HT:</span>
                <span className="font-bold text-gray-900">{facture.totalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">TVA:</span>
                <span className="font-bold text-gray-900">{facture.totalTVA.toFixed(2)} €</span>
              </div>
              <div className="border-t-2 border-blue-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total TTC:</span>
                  <span className="text-2xl font-black text-blue-600">{facture.totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aide */}
          {!stockDejaGenere && (
            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-2">💡 Générer les entrées stock</h3>
              <p className="text-sm text-gray-700">
                Le bouton "Générer Entrées Stock" va automatiquement :
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>✓ Créer {facture.lignes.length} mouvement{facture.lignes.length > 1 ? 's' : ''} "entrée"</li>
                <li>✓ Mettre à jour les stocks dans les dépôts</li>
                <li>✓ Lier les mouvements à cette facture</li>
              </ul>
            </div>
          )}

          {stockDejaGenere && (
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-gray-900 mb-2">✅ Stock généré</h3>
              <p className="text-sm text-gray-700">
                Les entrées stock ont été créées avec succès. Les articles sont maintenant disponibles dans les dépôts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}