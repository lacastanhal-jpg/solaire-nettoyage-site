'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  getFactureFournisseurById, 
  deleteFactureFournisseur,
  validerFactureFournisseur,
  marquerCommePaye,
  type FactureFournisseur 
} from '@/lib/firebase/factures-fournisseurs'

export default function DetailFactureFournisseurPage() {
  const params = useParams()
  const router = useRouter()
  const [facture, setFacture] = useState<FactureFournisseur | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Modales
  const [showModalValidation, setShowModalValidation] = useState(false)
  const [showModalPaiement, setShowModalPaiement] = useState(false)
  
  // Formulaire paiement
  const [paiementData, setPaiementData] = useState({
    datePaiement: new Date().toISOString().split('T')[0],
    modePaiement: 'virement' as FactureFournisseur['modePaiement'],
    referencePaiement: ''
  })

  useEffect(() => {
    loadFacture()
  }, [params.id])

  async function loadFacture() {
    if (!params.id || typeof params.id !== 'string') return
    
    setLoading(true)
    try {
      const data = await getFactureFournisseurById(params.id)
      setFacture(data)
    } catch (error) {
      console.error('Erreur chargement facture:', error)
      alert('Erreur lors du chargement de la facture')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!facture) return
    
    if (!confirm(`Supprimer la facture ${facture.numero} ?\n\nCette action est irréversible.`)) {
      return
    }

    try {
      await deleteFactureFournisseur(facture.id)
      alert('Facture supprimée')
      router.push('/admin/comptabilite/factures-fournisseurs')
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  async function handleValider() {
    if (!facture) return
    
    setActionLoading(true)
    try {
      const userName = localStorage.getItem('user_name') || 'Inconnu'
      await validerFactureFournisseur(facture.id, userName)
      
      setShowModalValidation(false)
      await loadFacture() // Recharger la facture
      alert('Facture validée avec succès !\n\nMouvements stock et écritures comptables générés.')
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la validation')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleMarquerPayee() {
    if (!facture) return
    
    setActionLoading(true)
    try {
      await marquerCommePaye(
        facture.id,
        paiementData.datePaiement,
        paiementData.modePaiement,
        paiementData.referencePaiement || undefined
      )
      
      setShowModalPaiement(false)
      await loadFacture() // Recharger la facture
      alert('Facture marquée comme payée')
    } catch (error: any) {
      alert(error.message || 'Erreur lors du marquage paiement')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Facture introuvable</h2>
          <p className="text-red-600 mb-4">La facture demandée n'existe pas.</p>
          <Link 
            href="/admin/comptabilite/factures-fournisseurs"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  const statutColors = {
    brouillon: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    validee: 'bg-blue-100 text-blue-800 border-blue-300',
    payee: 'bg-green-100 text-green-800 border-green-300'
  }

  const statutLabels = {
    brouillon: '🟡 Brouillon',
    validee: '✅ Validée',
    payee: '💚 Payée'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/comptabilite/factures-fournisseurs"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Retour aux factures
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facture {facture.numero}</h1>
            <p className="text-gray-600 mt-1">
              Fournisseur : <span className="font-medium">{facture.fournisseur}</span>
            </p>
          </div>
          
          <div className={`px-4 py-2 rounded-lg border-2 font-bold ${statutColors[facture.statut]}`}>
            {statutLabels[facture.statut]}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {facture.statut === 'brouillon' && (
            <>
              <Link
                href={`/admin/comptabilite/factures-fournisseurs/${facture.id}/modifier`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                ✏️ Modifier
              </Link>
              
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                🗑️ Supprimer
              </button>
              
              <button
                onClick={() => setShowModalValidation(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                ⚡ Valider la facture
              </button>
            </>
          )}
          
          {facture.statut === 'validee' && (
            <button
              onClick={() => setShowModalPaiement(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              💳 Marquer comme payée
            </button>
          )}

          <button
            disabled
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium opacity-50 cursor-not-allowed"
            title="Fonction à venir"
          >
            📄 Télécharger PDF
          </button>
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">N° Facture Fournisseur :</span>
              <p className="font-medium text-gray-900">{facture.numeroFournisseur}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Fournisseur :</span>
              <p className="font-medium text-gray-900">{facture.fournisseur}</p>
              {facture.siretFournisseur && (
                <p className="text-sm text-gray-500">SIRET : {facture.siretFournisseur}</p>
              )}
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Date Facture :</span>
              <p className="font-medium text-gray-900">
                {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <div>
              <span className="text-sm text-gray-600">Date Échéance :</span>
              <p className="font-medium text-gray-900">
                {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {facture.notes && (
              <div>
                <span className="text-sm text-gray-600">Notes :</span>
                <p className="text-gray-900">{facture.notes}</p>
              </div>
            )}

            {/* PDF Facture */}
            <div className="pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Document PDF :</span>
              {facture.pdfURL ? (
                <div className="mt-2">
                  <a
                    href={facture.pdfURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📄 Télécharger le PDF
                  </a>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Aucun PDF uploadé</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Traçabilité</h2>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Créée le :</span>
              <p className="font-medium text-gray-900">
                {new Date(facture.createdAt).toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-gray-500">Par : {facture.createdBy}</p>
            </div>

            {facture.dateValidation && (
              <div>
                <span className="text-sm text-gray-600">Validée le :</span>
                <p className="font-medium text-gray-900">
                  {new Date(facture.dateValidation).toLocaleString('fr-FR')}
                </p>
                {facture.validePar && (
                  <p className="text-sm text-gray-500">Par : {facture.validePar}</p>
                )}
              </div>
            )}

            {facture.datePaiement && (
              <div>
                <span className="text-sm text-gray-600">Payée le :</span>
                <p className="font-medium text-gray-900">
                  {new Date(facture.datePaiement).toLocaleString('fr-FR')}
                </p>
                {facture.modePaiement && (
                  <p className="text-sm text-gray-500">Mode : {facture.modePaiement}</p>
                )}
                {facture.referencePaiement && (
                  <p className="text-sm text-gray-500">Ref : {facture.referencePaiement}</p>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Mouvements stock générés :</span>
              <p className="font-medium text-gray-900">
                {facture.mouvementsStockIds.length} mouvement(s)
              </p>
              {facture.mouvementsStockIds.length > 0 && (
                <Link
                  href={`/admin/stock-flotte/mouvements?factureId=${facture.id}`}
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  📊 Voir les mouvements →
                </Link>
              )}
            </div>

            <div>
              <span className="text-sm text-gray-600">Écritures comptables générées :</span>
              <p className="font-medium text-gray-900">
                {facture.ecrituresComptablesIds.length} écriture(s)
              </p>
              {facture.ecrituresComptablesIds.length > 0 && (
                <Link
                  href={`/admin/comptabilite/ecritures?factureId=${facture.id}`}
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  📄 Voir les écritures →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lignes de facture */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lignes de facture</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Désignation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compte
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix Unit. HT
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant HT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant TTC
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dépôt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facture.lignes.map((ligne) => (
                <tr key={ligne.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{ligne.designation}</div>
                    {ligne.articleCode && (
                      <div className="text-xs text-gray-500">Code : {ligne.articleCode}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{ligne.compteComptable}</div>
                    <div className="text-xs text-gray-500">{ligne.compteIntitule}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {ligne.quantite}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {ligne.prixUnitaireHT.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {ligne.tauxTVA}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {ligne.montantHT.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {ligne.montantTTC.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {ligne.depotDestination}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totaux */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Totaux</h2>
        
        <div className="space-y-3 max-w-md ml-auto">
          <div className="flex justify-between text-lg">
            <span className="text-gray-700">Total HT :</span>
            <span className="font-medium">{facture.montantHT.toFixed(2)} €</span>
          </div>
          
          <div className="flex justify-between text-lg">
            <span className="text-gray-700">Total TVA :</span>
            <span className="font-medium">{facture.montantTVA.toFixed(2)} €</span>
          </div>
          
          <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-gray-300">
            <span className="text-gray-900">Total TTC :</span>
            <span className="text-orange-600">{facture.montantTTC.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Modal Validation */}
      {showModalValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">⚡ Valider la facture</h3>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Cette action va automatiquement :</strong>
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Générer les entrées de stock pour chaque article</li>
                <li>Mettre à jour les quantités dans les dépôts</li>
                <li>Créer les écritures comptables (6064, TVA, 401)</li>
                <li>Changer le statut en "Validée"</li>
              </ul>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ Cette action est <strong>irréversible</strong>
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModalValidation(false)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleValider}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Validation en cours...' : '✅ Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {showModalPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">💳 Marquer comme payée</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de paiement *
                </label>
                <input
                  type="date"
                  value={paiementData.datePaiement}
                  onChange={(e) => setPaiementData({ ...paiementData, datePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement *
                </label>
                <select
                  value={paiementData.modePaiement}
                  onChange={(e) => setPaiementData({ ...paiementData, modePaiement: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="cb">Carte Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence de paiement
                </label>
                <input
                  type="text"
                  value={paiementData.referencePaiement}
                  onChange={(e) => setPaiementData({ ...paiementData, referencePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="N° transaction, chèque..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModalPaiement(false)}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleMarquerPayee}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Enregistrement...' : '✅ Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
