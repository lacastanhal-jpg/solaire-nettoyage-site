'use client'

import { useState, useEffect } from 'react'

interface DevisModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DevisModal({ isOpen, onClose }: DevisModalProps) {
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

  // Fermer avec Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

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

    // Préparer l'email
    const subject = `Demande de devis - ${formData.entreprise}`
    const body = `
Bonjour,

Je souhaite obtenir un devis pour le nettoyage de panneaux photovoltaïques.

INFORMATIONS CLIENT :
- Nom : ${formData.nom}
- Entreprise : ${formData.entreprise}
- Email : ${formData.email}
- Téléphone : ${formData.telephone}

CARACTÉRISTIQUES DE L'INSTALLATION :
- Surface à nettoyer : ${formData.surface || 'Non renseigné'} m²
- Puissance installée : ${formData.puissance || 'Non renseigné'} kWc
- Pente : ${formData.pente ? formData.pente + ' ' + (formData.unitePente === 'degres' ? '°' : '%') : 'Non renseigné'}
- Type d'installation : ${formData.typeInstallation}

DÉTAILS DU PROJET :
${formData.message || 'Aucun détail supplémentaire'}

Cordialement,
${formData.nom}
    `.trim()

    // Ouvrir le client mail
    window.location.href = `mailto:contact@solairenettoyage.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Afficher le message de succès
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

    // Fermer la modal après 3 secondes
    setTimeout(() => {
      setStatus('idle')
      onClose()
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1e3a8a] text-white px-8 py-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Demande de devis gratuit</h2>
            <p className="text-sm text-blue-100 mt-1">Réponse sous 24h</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#fbbf24] transition-colors text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Demande envoyée !
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Merci pour votre demande. Nous vous recontactons sous 24h.
              </p>
              <p className="text-sm text-gray-500">
                Cette fenêtre va se fermer automatiquement...
              </p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
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
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all text-gray-900"
                      placeholder="15"
                    />
                    <select
                      name="unitePente"
                      value={formData.unitePente}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all bg-white text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all bg-white text-gray-900"
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
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all resize-none text-gray-900"
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

              {/* Boutons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 bg-[#fbbf24] text-blue-900 py-3 px-6 rounded-lg hover:bg-[#fbbf24]/90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      Envoyer la demande
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                * Champs obligatoires - Vos données sont protégées
              </p>
            </form>
          )}
        </div>

        {/* Footer modal */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Ou appelez-nous directement : 
            <a href="tel:+33632134766" className="font-bold text-[#fbbf24] hover:text-[#fbbf24]/90 ml-2">
              06 32 13 47 66
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}