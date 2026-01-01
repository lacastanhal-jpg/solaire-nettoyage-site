'use client'

import { useState } from 'react'
import type { BonCommandeFournisseur } from '@/lib/firebase/bons-commande-fournisseurs'

type ModalEnvoiEmailProps = {
  bonCommande: BonCommandeFournisseur
  onClose: () => void
  onSuccess: () => void
}

export default function ModalEnvoiEmail({
  bonCommande,
  onClose,
  onSuccess
}: ModalEnvoiEmailProps) {
  const [sending, setSending] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailCc, setEmailCc] = useState('')
  const [message, setMessage] = useState('')

  // Générer le contenu de l'email
  const emailSubject = `Bon de Commande ${bonCommande.numero} - ${bonCommande.fournisseur}`
  
  const emailBody = `
Bonjour,

Veuillez trouver ci-dessous notre bon de commande ${bonCommande.numero}.

═══════════════════════════════════════════════════
📝 BON DE COMMANDE ${bonCommande.numero}
═══════════════════════════════════════════════════

🏢 Fournisseur : ${bonCommande.fournisseur}
📅 Date : ${new Date(bonCommande.date).toLocaleDateString('fr-FR')}
👤 Créé par : ${bonCommande.createdBy}

───────────────────────────────────────────────────
📦 ARTICLES À COMMANDER
───────────────────────────────────────────────────

${bonCommande.lignes.map((ligne, idx) => `
${idx + 1}. ${ligne.articleCode} - ${ligne.articleDescription}
   Quantité : ${ligne.quantiteSuggere} unités
   Prix unitaire estimé : ${ligne.prixUnitaireEstime.toFixed(2)} €
   Total : ${(ligne.quantiteSuggere * ligne.prixUnitaireEstime).toFixed(2)} €
   Raison : ${ligne.raisonSuggestion}
`).join('\n')}

───────────────────────────────────────────────────
💰 TOTAL ESTIMÉ : ${bonCommande.totalEstime.toFixed(2)} €
───────────────────────────────────────────────────

${bonCommande.notes ? `📝 Notes :\n${bonCommande.notes}\n\n` : ''}
Merci de nous confirmer la disponibilité et les délais de livraison.

Cordialement,
${bonCommande.createdBy}
SAS Solaire Nettoyage

═══════════════════════════════════════════════════
`.trim()

  async function handleEnvoi(e: React.FormEvent) {
    e.preventDefault()

    if (!emailTo) {
      alert('⚠️ Veuillez saisir une adresse email destinataire')
      return
    }

    try {
      setSending(true)

      // Copier le contenu dans le presse-papier
      const fullEmail = `À : ${emailTo}\n${emailCc ? `Cc : ${emailCc}\n` : ''}Objet : ${emailSubject}\n\n${emailBody}${message ? `\n\n${message}` : ''}`
      await navigator.clipboard.writeText(fullEmail)

      // Ouvrir email avec juste destinataire et sujet
      const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`
      window.location.href = mailtoLink

      // Message d'instruction
      setTimeout(() => {
        alert('✅ Email copié dans le presse-papier !\n\n📧 Votre client email va s\'ouvrir.\n\n👉 Collez le contenu (Cmd+V ou Ctrl+V) dans le corps de l\'email.')
        onSuccess()
      }, 500)

    } catch (error) {
      console.error('Erreur:', error)
      alert('❌ Erreur. Le contenu a été copié, ouvrez manuellement votre client email.')
    } finally {
      setSending(false)
    }
  }

  async function copyToClipboard() {
    try {
      const fullEmail = `À : ${emailTo || '(destinataire)'}\n${emailCc ? `Cc : ${emailCc}\n` : ''}Objet : ${emailSubject}\n\n${emailBody}${message ? `\n\n${message}` : ''}`
      await navigator.clipboard.writeText(fullEmail)
      alert('✅ Email copié dans le presse-papier !')
    } catch (error) {
      console.error('Erreur copie:', error)
      alert('❌ Erreur lors de la copie')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">📧 Envoyer Bon de Commande</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleEnvoi} className="p-6">
          {/* Info bon de commande */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-bold text-blue-900">{bonCommande.numero}</div>
                <div className="text-sm text-blue-700">
                  {bonCommande.fournisseur} • {bonCommande.lignes.length} article(s) • {bonCommande.totalEstime.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          {/* Destinataires */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📬 Destinataires</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email destinataire *
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="fournisseur@example.com"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailTo('contact@solairenettoyage.fr')}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    📧 Contact interne
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailTo('jerome@solairenettoyage.fr')}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    👤 Jérôme
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email en copie (optionnel)
                </label>
                <input
                  type="email"
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  placeholder="copie@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Message additionnel */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message additionnel (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajouter un message personnel..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Aperçu email */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📄 Aperçu de l'email</h3>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="text-xs space-y-1 mb-3">
                <div><strong>À :</strong> {emailTo || '(destinataire)'}</div>
                {emailCc && <div><strong>Cc :</strong> {emailCc}</div>}
                <div><strong>Objet :</strong> {emailSubject}</div>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
{emailBody}
{message && `\n\n${message}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="text-sm text-yellow-800">
                <strong>Comment ça marche :</strong>
                <ol className="mt-2 ml-4 space-y-1 list-decimal">
                  <li>Le contenu de l'email sera <strong>copié automatiquement</strong> dans votre presse-papier</li>
                  <li>Votre client email s'ouvrira avec le destinataire et l'objet pré-remplis</li>
                  <li>Collez le contenu (Cmd+V ou Ctrl+V) dans le corps de l'email</li>
                  <li>Vérifiez et envoyez !</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              📋 Copier Email
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
            >
              {sending ? 'Ouverture...' : '📧 Ouvrir dans Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
