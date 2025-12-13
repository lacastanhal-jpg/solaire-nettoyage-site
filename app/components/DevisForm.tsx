'use client'

import { useState } from 'react'

export default function DevisForm() {
  const [formData, setFormData] = useState({
    nom: '',
    entreprise: '',
    email: '',
    telephone: '',
    surface: '',
    puissance: '',
    pente: '',
    unitePente: 'degres',
    typeInstallation: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    // Validation : au moins surface OU puissance requis
    if (!formData.surface && !formData.puissance) {
      setStatus('error')
      setErrorMessage('Veuillez renseigner au moins la surface (m²) ou la puissance (kWc)')
      return
    }

    try {
      const response = await fetch('/api/send-devis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi')
      }

      setStatus('success')
      setFormData({
        nom: '',
        entreprise: '',
        email: '',
        telephone: '',
        surface: '',
        puissance: '',
        pente: '',
        unitePente: 'degres',
        typeInstallation: '',
        message: ''
      })

      // Reset success message après 5 secondes
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setErrorMessage('Une erreur est survenue. Veuillez réessayer ou nous appeler au 06 32 13 47 66.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="devis" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Demandez votre devis gratuit
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nos équipes interviennent partout en France. Réponse sous 24h.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">✅</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Demande envoyée !
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Merci pour votre demande. Nous vous recontactons sous 24h.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="inline-flex items-center gap-2 bg-[#fbbf24] text-blue-900 px-8 py-3 rounded-lg hover:bg-[#fbbf24]/90 transition-colors font-semibold"
                >
                  Nouvelle demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom */}
                <div>
                  <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom et Prénom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                    placeholder="Jean Dupont"
                  />
                </div>

                {/* Entreprise */}
                <div>
                  <label htmlFor="entreprise" className="block text-sm font-semibold text-gray-700 mb-2">
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    id="entreprise"
                    name="entreprise"
                    required
                    value={formData.entreprise}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                {/* Email et Téléphone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                      placeholder="contact@entreprise.fr"
                    />
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      required
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                {/* Surface et Puissance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="surface" className="block text-sm font-semibold text-gray-700 mb-2">
                      Surface à nettoyer (m²)
                    </label>
                    <input
                      type="number"
                      id="surface"
                      name="surface"
                      min="1"
                      value={formData.surface}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label htmlFor="puissance" className="block text-sm font-semibold text-gray-700 mb-2">
                      Puissance installée (kWc)
                    </label>
                    <input
                      type="number"
                      id="puissance"
                      name="puissance"
                      min="1"
                      step="0.1"
                      value={formData.puissance}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <span className="text-blue-600 text-sm">ℹ️</span>
                  <p className="text-xs text-blue-800">
                    Veuillez renseigner au moins la surface (m²) ou la puissance (kWc)
                  </p>
                </div>

                {/* Pente et Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pente" className="block text-sm font-semibold text-gray-700 mb-2">
                      Pente de l'installation
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="pente"
                        name="pente"
                        min="0"
                        step="0.1"
                        value={formData.pente}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all"
                        placeholder="15"
                      />
                      <select
                        name="unitePente"
                        value={formData.unitePente}
                        onChange={handleChange}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all bg-white"
                      >
                        <option value="degres">° (degrés)</option>
                        <option value="pourcent">% (pourcent)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="typeInstallation" className="block text-sm font-semibold text-gray-700 mb-2">
                      Type d'installation *
                    </label>
                    <select
                      id="typeInstallation"
                      name="typeInstallation"
                      required
                      value={formData.typeInstallation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="toiture">Toiture</option>
                      <option value="ombriere">Ombrière</option>
                      <option value="sol">Au sol</option>
                      <option value="industriel">Site industriel</option>
                      <option value="agricole">Site agricole</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message / Détails du projet
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre projet, localisation, fréquence souhaitée..."
                  />
                </div>

                {/* Message d'erreur */}
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-red-600 text-xl">⚠️</span>
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                {/* Bouton submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#fbbf24] text-blue-900 py-4 px-8 rounded-lg hover:bg-[#fbbf24]/90 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Demander un devis gratuit
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  * Champs obligatoires - Vos données sont protégées et ne seront jamais partagées.
                </p>
              </form>
            )}
          </div>

          {/* Info contact */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">
              Vous préférez nous appeler directement ?
            </p>
            <a 
              href="tel:+33632134766"
              className="text-2xl font-bold text-[#fbbf24] hover:text-[#fbbf24]/90 transition-colors"
            >
              06 32 13 47 66
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Du lundi au vendredi, 8h-18h
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
