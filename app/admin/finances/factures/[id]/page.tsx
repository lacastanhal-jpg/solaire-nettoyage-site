'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getFactureById, addPaiement, Facture, PaiementFacture } from '@/lib/firebase/factures'
import Link from 'next/link'

export default function DetailFacturePage() {
  const params = useParams()
  const router = useRouter()
  const [facture, setFacture] = useState<Facture | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [nouveauPaiement, setNouveauPaiement] = useState({
    date: new Date().toISOString().split('T')[0],
    montant: 0,
    mode: 'virement' as PaiementFacture['mode'],
    reference: '',
    notes: ''
  })
  const [emailData, setEmailData] = useState({
    emailDestinataire: '',
    message: ''
  })

  useEffect(() => {
    loadFacture()
  }, [params.id])

  async function loadFacture() {
    try {
      const data = await getFactureById(params.id as string)
      setFacture(data)
      if (data) {
        setNouveauPaiement(prev => ({...prev, montant: data.resteAPayer}))
      }
    } catch (error) {
      console.error('Erreur chargement facture:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAjouterPaiement() {
    if (!facture) return
    
    try {
      await addPaiement(facture.id, nouveauPaiement)
      alert('✅ Paiement ajouté')
      setShowPaiementModal(false)
      loadFacture()
    } catch (error) {
      console.error('Erreur ajout paiement:', error)
      alert('❌ Erreur')
    }
  }

  async function handleTelechargerPDF() {
    if (!facture) return
    
    try {
      window.open(`/api/factures/${facture.id}/pdf`, '_blank')
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error)
      alert('❌ Erreur')
    }
  }

  async function handleEnvoyerEmail() {
    if (!facture || !emailData.emailDestinataire) {
      alert('Veuillez saisir un email destinataire')
      return
    }
    
    setSendingEmail(true)
    
    try {
      const response = await fetch(`/api/factures/${facture.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      
      if (response.ok) {
        alert('✅ Facture envoyée par email !')
        setShowEmailModal(false)
        setEmailData({ emailDestinataire: '', message: '' })
        loadFacture()
      } else {
        alert('❌ Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur envoi email:', error)
      alert('❌ Erreur')
    } finally {
      setSendingEmail(false)
    }
  }

  function getStatutBadge(statut: Facture['statut']) {
    const styles = {
      payee: 'bg-green-700 text-white',
      en_retard: 'bg-red-700 text-white',
      partiellement_payee: 'bg-orange-700 text-white',
      envoyee: 'bg-blue-700 text-white',
      brouillon: 'bg-gray-600 text-white',
      annulee: 'bg-gray-500 text-white'
    }
    
    const labels = {
      payee: 'Payée',
      en_retard: 'En retard',
      partiellement_payee: 'Partiellement payée',
      envoyee: 'Envoyée',
      brouillon: 'Brouillon',
      annulee: 'Annulée'
    }
    
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold ${styles[statut]}`}>
        {labels[statut]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-xl text-gray-900 font-semibold">Chargement...</div>
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="p-8">
        <div className="text-xl text-red-700 font-semibold">Facture introuvable</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{facture.numero}</h1>
            {getStatutBadge(facture.statut)}
          </div>
          <p className="text-gray-700">
            Client : <span className="font-bold text-gray-900">{facture.clientNom}</span>
          </p>
          <p className="text-gray-700">
            Date : {new Date(facture.date).toLocaleDateString('fr-FR')} | 
            Échéance : {new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTelechargerPDF}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 font-semibold"
          >
            📄 Télécharger PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold"
          >
            📧 Envoyer par email
          </button>
          <Link
            href={`/admin/finances/factures/${facture.id}/modifier`}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold"
          >
            📝 Modifier
          </Link>
          <button
            onClick={() => router.push('/admin/finances/factures')}
            className="px-4 py-2 border-2 border-gray-400 text-gray-900 rounded-lg hover:bg-gray-100 font-semibold"
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* MONTANTS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Montant total TTC</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {facture.totalTTC.toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Déjà payé</div>
          <div className="text-2xl font-bold text-green-700 mt-2">
            {(facture.totalTTC - facture.resteAPayer).toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Reste à payer</div>
          <div className="text-2xl font-bold text-orange-700 mt-2">
            {facture.resteAPayer.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {/* LIGNES DE FACTURE */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lignes de facture</h2>
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Article</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Quantité</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Prix unitaire</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">TVA</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Total TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {facture.lignes.map((ligne, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {ligne.articleCode} - {ligne.articleNom}
                </td>
                <td className="px-4 py-3 text-right text-gray-900">{ligne.quantite}</td>
                <td className="px-4 py-3 text-right text-gray-900">{ligne.prixUnitaire.toFixed(2)} €</td>
                <td className="px-4 py-3 text-right text-gray-900">{ligne.tva}%</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{ligne.totalTTC.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 border-t-2 border-gray-400">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total HT :</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{facture.totalHT.toFixed(2)} €</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total TVA :</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{facture.totalTVA.toFixed(2)} €</td>
            </tr>
            <tr className="text-lg">
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total TTC :</td>
              <td className="px-4 py-3 text-right font-bold text-blue-700">{facture.totalTTC.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* PAIEMENTS */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Paiements</h2>
          {facture.resteAPayer > 0 && (
            <button
              onClick={() => setShowPaiementModal(true)}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold"
            >
              ➕ Ajouter un paiement
            </button>
          )}
        </div>

        {facture.paiements.length === 0 ? (
          <p className="text-gray-700">Aucun paiement enregistré</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Référence</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {facture.paiements.map((paiement) => (
                <tr key={paiement.id}>
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(paiement.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{paiement.mode}</td>
                  <td className="px-4 py-3 text-gray-700">{paiement.reference || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">
                    {paiement.montant.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PAIEMENT */}
      {showPaiementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-gray-400">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter un paiement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Date</label>
                <input
                  type="date"
                  value={nouveauPaiement.date}
                  onChange={(e) => setNouveauPaiement({...nouveauPaiement, date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Montant (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nouveauPaiement.montant}
                  onChange={(e) => setNouveauPaiement({...nouveauPaiement, montant: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Mode de paiement</label>
                <select
                  value={nouveauPaiement.mode}
                  onChange={(e) => setNouveauPaiement({...nouveauPaiement, mode: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900 font-medium"
                >
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="prelevement">Prélèvement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Référence</label>
                <input
                  type="text"
                  value={nouveauPaiement.reference}
                  onChange={(e) => setNouveauPaiement({...nouveauPaiement, reference: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
                  placeholder="Ex: virement du 15/12"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaiementModal(false)}
                className="px-4 py-2 border-2 border-gray-400 text-gray-900 rounded-lg hover:bg-gray-100 font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleAjouterPaiement}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold"
              >
                ✅ Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMAIL */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full border-2 border-gray-400">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Envoyer la facture par email</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Email destinataire *
                </label>
                <input
                  type="email"
                  required
                  value={emailData.emailDestinataire}
                  onChange={(e) => setEmailData({...emailData, emailDestinataire: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
                  placeholder="client@email.fr"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg text-gray-900"
                  placeholder="Ajoutez un message personnalisé..."
                />
              </div>

              <div className="bg-gray-100 p-4 rounded-lg border border-gray-400">
                <p className="text-sm text-gray-800">
                  <strong>📄 Pièce jointe :</strong> facture-{facture.numero}.pdf<br/>
                  <strong>💶 Montant :</strong> {facture.totalTTC.toFixed(2)} €
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                disabled={sendingEmail}
                className="px-4 py-2 border-2 border-gray-400 text-gray-900 rounded-lg hover:bg-gray-100 font-semibold disabled:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={handleEnvoyerEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold disabled:bg-gray-500"
              >
                {sendingEmail ? '📤 Envoi en cours...' : '📧 Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
