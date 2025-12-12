'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyClientCredentials } from '@/lib/firebase'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Vérifier les identifiants dans Firebase
      const client = await verifyClientCredentials(email, password)

      if (client) {
        // Stocker les infos du client
        localStorage.setItem('client_logged_in', 'true')
        localStorage.setItem('client_name', client.contactName || client.company)
        localStorage.setItem('client_email', client.email)
        localStorage.setItem('client_company', client.company)
        localStorage.setItem('client_id', client.id)

        // Rediriger vers le dashboard
        router.push('/client/dashboard')
      } else {
        setError('Email ou mot de passe incorrect')
      }
    } catch (err) {
      console.error('Erreur login:', err)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">☀️</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Espace Client</h1>
            <p className="text-blue-700">Solaire Nettoyage</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-blue-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="votre@email.fr"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-blue-900 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Aide */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-600">
              Besoin d'aide ? Contactez-nous au 07 85 28 21 55
            </p>
          </div>

          {/* NOUVEAU : Lien demande d'accès */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Vous n'avez pas encore de compte ?</strong>
            </p>
            <a 
              href="/client/demande-acces"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
            >
              📝 Demander un accès
            </a>
          </div>
        </div>

        {/* Lien retour */}
        <div className="mt-6 text-center">
          <a href="/" className="text-white hover:text-blue-100 text-sm font-medium">
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
