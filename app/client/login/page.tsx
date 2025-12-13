'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyGroupeCredentials } from '@/lib/firebase'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Vérifier les credentials du GROUPE
      const groupe = await verifyGroupeCredentials(email, password)

      if (!groupe) {
        setError('❌ Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      // Stocker les infos du GROUPE dans localStorage
      localStorage.setItem('client_logged_in', 'true')
      localStorage.setItem('groupe_id', groupe.id)
      localStorage.setItem('groupe_name', groupe.nom)
      localStorage.setItem('groupe_email', groupe.email)

      // Rediriger vers le dashboard
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Erreur login:', error)
      setError('❌ Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <span className="text-4xl">☀️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Espace Groupe</h1>
          <p className="text-blue-200">Accédez à vos sites et interventions</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Email du groupe
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/90 border-2 border-white/30 rounded-lg focus:border-yellow-500 focus:outline-none text-blue-900 font-medium"
                placeholder="groupe@exemple.fr"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/90 border-2 border-white/30 rounded-lg focus:border-yellow-500 focus:outline-none text-blue-900 font-medium pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-100 border-2 border-red-300 text-red-900 px-4 py-3 rounded-lg font-bold">
                {error}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/30">
            <div className="text-sm text-blue-100 font-medium">
              💡 <strong>Nouveau système :</strong> Connectez-vous avec les identifiants de votre GROUPE pour accéder à tous vos clients et sites.
            </div>
          </div>
        </div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-blue-200 hover:text-white font-medium transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
