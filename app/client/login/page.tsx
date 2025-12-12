'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllClients, type Client } from '@/lib/firebase'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Récupérer tous les clients
      const clients = await getAllClients()
      
      // Trouver le client avec cet email et mot de passe
      const client = clients.find(
        (c: Client) => c.email === email && c.password === password && c.active
      )

      if (!client) {
        setError('Email ou mot de passe incorrect, ou compte désactivé')
        setLoading(false)
        return
      }

      // Stocker les infos du client
      localStorage.setItem('client_logged_in', 'true')
      localStorage.setItem('client_id', client.id) // IMPORTANT: Stocker l'ID
      localStorage.setItem('client_email', client.email)
      localStorage.setItem('client_company', client.company)
      localStorage.setItem('client_name', client.contactName || client.company)

      // Rediriger vers le dashboard
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Erreur connexion:', error)
      setError('Erreur lors de la connexion')
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
          <p className="text-blue-600">Solaire Nettoyage</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              placeholder="votre@email.fr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
          </button>
        </form>

        {/* Lien Demande d'accès */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-600">
            Pas encore de compte ?{' '}
            <a
              href="/client/demande-acces"
              className="font-medium text-blue-700 hover:text-blue-900 underline"
            >
              Demander un accès
            </a>
          </p>
        </div>

        {/* Retour site */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-900"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
