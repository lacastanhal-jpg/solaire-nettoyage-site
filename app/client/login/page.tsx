'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyClientCredentials } from '@/lib/firebase'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Vérifier les credentials avec Firebase
      const client = await verifyClientCredentials(email, password)

      if (!client) {
        setError('❌ Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      // Stocker les infos du client
      localStorage.setItem('client_logged_in', 'true')
      localStorage.setItem('client_id', client.id!)
      localStorage.setItem('client_email', client.email)
      localStorage.setItem('client_company', client.company)
      localStorage.setItem('client_name', client.contactName || client.company)

      // Rediriger vers le dashboard
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Erreur connexion:', error)
      setError('❌ Erreur lors de la connexion. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">☀️</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Espace Client</h1>
          <p className="text-blue-600 font-medium">Solaire Nettoyage</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-900 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
              placeholder="votre@email.fr"
              required
            />
          </div>

          {/* Mot de passe avec bouton œil */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform"
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              💡 Cliquez sur l'œil pour voir votre mot de passe
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
          </button>
        </form>

        {/* Lien Demande d'accès */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-700 font-medium">
            Pas encore de compte ?{' '}
            <a
              href="/client/demande-acces"
              className="font-bold text-blue-800 hover:text-blue-900 underline"
            >
              Demander un accès
            </a>
          </p>
        </div>

        {/* Retour site */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-900 font-medium"
          >
            ← Retour au site
          </a>
        </div>

        {/* Info aide */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-medium text-center">
            ℹ️ En cas de problème de connexion, contactez-nous
          </p>
        </div>
      </div>
    </div>
  )
}