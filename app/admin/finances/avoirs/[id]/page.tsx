'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAvoirById, updateAvoir, deleteAvoir, Avoir } from '@/lib/firebase/avoirs'
import Link from 'next/link'

export default function DetailAvoirPage() {
  const params = useParams()
  const router = useRouter()
  const [avoir, setAvoir] = useState<Avoir | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailData, setEmailData] = useState({
    emailDestinataire: '',
    message: ''
  })

  useEffect(() => {
    loadAvoir()
  }, [params.id])

  async function loadAvoir() {
    try {
      const data = await getAvoirById(params.id as string)
      setAvoir(data)
    } catch (error) {
      console.error('Erreur chargement avoir:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleTelechargerPDF() {
    if (!avoir) return
    
    try {
      window.open(`/api/avoirs/${avoir.id}/pdf`, '_blank')
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error)
      alert('❌ Erreur')
    }
  }

  async function handleEnvoyerEmail() {
    if (!avoir || !emailData.emailDestinataire) {
      alert('Veuillez saisir un email destinataire')
      return
    }
    
    setSendingEmail(true)
    
    try {
      const response = await fetch(`/api/avoirs/${avoir.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      
      if (response.ok) {
        alert('✅ Avoir envoyé par email !')
        setShowEmailModal(false)
        setEmailData({ emailDestinataire: '', message: '' })
        loadAvoir()
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

  async function handleChangerStatut(nouveauStatut: Avoir['statut']) {
    if (!avoir) return
    
    const confirmations = {
      applique: 'Confirmer l\'application de cet avoir ?',
      rembourse: 'Confirmer le remboursement de cet avoir ?',
      envoye: 'Marquer cet avoir comme envoyé ?'
    }
    
    if (!confirm(confirmations[nouveauStatut])) return
    
    try {
      await updateAvoir(avoir.id, { statut: nouveauStatut })
      alert('✅ Statut mis à jour')
      loadAvoir()
    } catch (error) {
      console.error('Erreur changement statut:', error)
      alert('❌ Erreur')
    }
  }

  async function handleSupprimer() {
    if (!avoir) return
    
    if (!confirm(`⚠️ Supprimer définitivement l'avoir ${avoir.numero} ?\n\nCette action est irréversible.`)) {
      return
    }
    
    try {
      await deleteAvoir(avoir.id)
      alert('✅ Avoir supprimé')
      router.push('/admin/finances/avoirs')
    } catch (error) {
      console.error('Erreur suppression avoir:', error)
      alert('❌ Erreur lors de la suppression')
    }
  }

  function getStatutBadge(statut: Avoir['statut']) {
    const styles = {
      brouillon: 'bg-gray-600 text-white',
      envoye: 'bg-blue-700 text-white',
      applique: 'bg-green-700 text-white',
      rembourse: 'bg-purple-700 text-white'
    }
    
    const labels = {
      brouillon: 'Brouillon',
      envoye: 'Envoyé',
      applique: 'Appliqué',
      rembourse: 'Remboursé'
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

  if (!avoir) {
    return (
      <div className="p-8">
        <div className="text-xl text-red-700 font-semibold">Avoir introuvable</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{avoir.numero}</h1>
            {getStatutBadge(avoir.statut)}
          </div>
          <p className="text-gray-700">
            Client : <span className="font-bold text-gray-900">{avoir.clientNom}</span>
          </p>
          <p className="text-gray-700">
            Date : {new Date(avoir.date).toLocaleDateString('fr-FR')}
          </p>
          {avoir.factureOrigineNumero && (
            <p className="text-gray-700">
              Facture d'origine : <span className="font-bold text-gray-900">{avoir.factureOrigineNumero}</span>
            </p>
          )}
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
          <button
            onClick={() => router.push(`/admin/finances/avoirs/${avoir.id}/modifier`)}
            className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 font-semibold"
          >
            📝 Modifier
          </button>
          <button
            onClick={handleSupprimer}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold"
          >
            🗑️ Supprimer
          </button>
          <button
            onClick={() => router.push('/admin/finances/avoirs')}
            className="px-4 py-2 border-2 border-gray-400 text-gray-900 rounded-lg hover:bg-gray-100 font-semibold"
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* MONTANT */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Montant de l'avoir</div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            {Math.abs(avoir.totalTTC).toLocaleString('fr-FR')} €
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Type d'utilisation</div>
          <div className="text-lg font-bold text-gray-900 mt-2">
            {avoir.typeUtilisation === 'deduction' ? 'Déduction' : 'Remboursement'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="text-sm text-gray-700 font-medium">Statut</div>
          <div className="mt-2">
            {getStatutBadge(avoir.statut)}
          </div>
        </div>
      </div>

      {/* MOTIF */}
      <div className="bg-yellow-50 border-2 border-yellow-600 p-4 rounded-lg mb-6">
        <div className="font-bold text-gray-900 mb-1">Motif de l'avoir :</div>
        <div className="text-gray-800">{avoir.motif}</div>
      </div>

      {/* ACTIONS RAPIDES */}
      {avoir.statut !== 'applique' && avoir.statut !== 'rembourse' && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-4">
            {avoir.statut === 'brouillon' && (
              <button
                onClick={() => handleChangerStatut('envoye')}
                className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold"
              >
                📤 Marquer comme envoyé
              </button>
            )}
            {avoir.statut === 'envoye' && (
              <>
                {avoir.typeUtilisation === 'deduction' && (
                  <button
                    onClick={() => handleChangerStatut('applique')}
                    className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 font-semibold"
                  >
                    ✅ Marquer comme appliqué (déduit)
                  </button>
                )}
                {avoir.typeUtilisation === 'remboursement' && (
                  <button
                    onClick={() => handleChangerStatut('rembourse')}
                    className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-semibold"
                  >
                    💰 Marquer comme remboursé
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* LIGNES D'AVOIR */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lignes d'avoir</h2>
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">Description</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Quantité</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Prix unitaire</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">TVA</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 uppercase">Total TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {avoir.lignes.map((ligne, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-gray-900 font-medium">{ligne.description}</td>
                <td className="px-4 py-3 text-right text-gray-900">{ligne.quantite}</td>
                <td className="px-4 py-3 text-right text-gray-900">{ligne.prixUnitaire.toFixed(2)} €</td>
                <td className="px-4 py-3 text-right text-gray-900">{ligne.tva}%</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{ligne.montantTTC.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 border-t-2 border-gray-400">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total HT :</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{avoir.totalHT.toFixed(2)} €</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total TVA :</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">{avoir.totalTVA.toFixed(2)} €</td>
            </tr>
            <tr className="text-lg">
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total TTC :</td>
              <td className="px-4 py-3 text-right font-bold text-red-700">-{Math.abs(avoir.totalTTC).toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* NOTES */}
      {avoir.notes && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notes internes</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{avoir.notes}</p>
        </div>
      )}

      {/* MODAL EMAIL */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full border-2 border-gray-400">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Envoyer l'avoir par email</h3>
            
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
                  <strong>📄 Pièce jointe :</strong> avoir-{avoir.numero}.pdf<br/>
                  <strong>💶 Montant :</strong> -{Math.abs(avoir.totalTTC).toFixed(2)} €
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
