'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Authentification temporaire (à remplacer par Supabase)
    const users = {
      'jerome@solairenettoyage.fr': 'Jérôme Gely',
      'axel@solairenettoyage.fr': 'Axel',
      'sebastien@solairenettoyage.fr': 'Sébastien',
      'joffrey@solairenettoyage.fr': 'Joffrey',
      'fabien@solairenettoyage.fr': 'Fabien',
      'angelo@solairenettoyage.fr': 'Angelo'
    }
    
    if (users[email as keyof typeof users] && password === 'solaire2024') {
      localStorage.setItem('intranet_logged_in', 'true')
      localStorage.setItem('user_name', users[email as keyof typeof users])
      router.push('/intranet/dashboard')
    } else {
      setError('Email ou mot de passe incorrect')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-navy flex items-center justify-center text-white font-bold text-lg">
              SN
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Solaire Nettoyage</h1>
              <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Intranet</span>
            </div>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="jerome@solairenettoyage.fr"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-navy text-white py-3 px-4 rounded-lg font-semibold hover:bg-navy-light transition-colors"
            >
              Se connecter
            </button>
          </form>

          {/* Info de test */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">🔑 Comptes disponibles :</p>
            <div className="space-y-1 text-xs text-blue-700">
              <p>• jerome@solairenettoyage.fr</p>
              <p>• axel@solairenettoyage.fr</p>
              <p>• sebastien@solairenettoyage.fr</p>
              <p>• joffrey@solairenettoyage.fr</p>
              <p>• fabien@solairenettoyage.fr</p>
              <p>• angelo@solairenettoyage.fr</p>
              <p className="mt-2 font-semibold">Mot de passe (tous) : solaire2024</p>
            </div>
          </div>
        </div>

        {/* Retour au site public */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour au site public
          </a>
        </div>
      </div>
    </div>
  )
}
