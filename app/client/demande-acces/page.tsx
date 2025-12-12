'use client'

import { useState } from 'react'

export default function DemandeAccesPage() {
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    sites: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      // TODO: Envoyer email à Jérôme
      // Pour l'instant, juste une simulation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Demande d\'accès envoyée:', formData)
      
      setSuccess(true)
      setFormData({
        company: '',
        contactName: '',
        email: '',
        phone: '',
        sites: '',
        message: ''
      })
    } catch (err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Demande envoyée !</h2>
            <p className="text-blue-700 mb-6">
              Nous avons bien reçu votre demande d'accès à l'espace client.<br />
              Notre équipe reviendra vers vous sous 48h pour créer votre compte.
            </p>
            <div className="space-y-3">
              <a
                href="/client/login"
                className="block w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Aller à la page de connexion
              </a>
              <a
                href="/"
                className="block text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Retour au site
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Demande d'Accès Client</h1>
            <p className="text-blue-700">
              Remplissez ce formulaire pour demander un accès à votre espace client.<br />
              Nous vous contacterons sous 48h.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entreprise */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Nom de votre entreprise *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="VOTRE ENTREPRISE"
                required
              />
            </div>

            {/* Contact et Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Nom du contact *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                  placeholder="contact@entreprise.fr"
                  required
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="06 12 34 56 78"
              />
            </div>

            {/* Sites */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Vos sites / centrales *
              </label>
              <textarea
                value={formData.sites}
                onChange={(e) => setFormData({ ...formData, sites: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                rows={3}
                placeholder="Listez vos sites, adresses ou centrales solaires..."
                required
              />
              <p className="text-xs text-blue-600 mt-1">
                Indiquez les sites pour lesquels vous souhaitez consulter les rapports
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                rows={4}
                placeholder="Informations complémentaires..."
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? '⏳ Envoi en cours...' : '📤 Envoyer la demande'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>ℹ️ À savoir :</strong> Seuls les clients existants de Solaire Nettoyage peuvent demander un accès. 
              Nous vérifierons vos informations avant de créer votre compte.
            </p>
          </div>
        </div>

        {/* Liens */}
        <div className="mt-6 text-center space-y-2">
          <a href="/client/login" className="block text-white hover:text-blue-100 text-sm font-medium">
            Vous avez déjà un compte ? → Se connecter
          </a>
          <a href="/" className="block text-white hover:text-blue-100 text-sm font-medium">
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
