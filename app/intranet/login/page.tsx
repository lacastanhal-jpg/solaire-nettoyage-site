'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Liste des utilisateurs avec mots de passe personnalisés
    const users: { [key: string]: { name: string; role: string; password: string } } = {
      'jerome@solairenettoyage.fr': { 
        name: 'Jérôme Gely', 
        role: 'admin',
        password: 'Jerome2024!'
      },
      'axel@solairenettoyage.fr': { 
        name: 'Axel Gely', 
        role: 'admin',
        password: 'Axel2024!'
      },
      'sebastien@solairenettoyage.fr': { 
        name: 'Sébastien Henry', 
        role: 'employee',
        password: 'Sebastien2024!'
      },
      'joffrey@solairenettoyage.fr': { 
        name: 'Joffrey Belveze', 
        role: 'employee',
        password: 'Joffrey2024!'
      },
      'fabien@solairenettoyage.fr': { 
        name: 'Fabien', 
        role: 'employee',
        password: 'Fabien2024!'
      },
      'angelo@solairenettoyage.fr': { 
        name: 'Angelo', 
        role: 'employee',
        password: 'Angelo2024!'
      }
    }

    const user = users[email.toLowerCase()]

    // Vérifier si l'utilisateur existe et si le mot de passe est correct
    if (!user) {
      setError('❌ Email incorrect')
      return
    }

    if (user.password !== password) {
      setError('❌ Mot de passe incorrect')
      return
    }

    // Connexion réussie - Stocker les infos
    localStorage.setItem('intranet_logged_in', 'true')
    localStorage.setItem('user_name', user.name)
    localStorage.setItem('user_email', email.toLowerCase())
    localStorage.setItem('user_role', user.role)

    // Rediriger vers le dashboard
    router.push('/intranet/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Intranet</h1>
            <p className="text-blue-700 font-semibold">Solaire Nettoyage</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-blue-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                placeholder="prenom@solairenettoyage.fr"
                required
                autoComplete="email"
              />
            </div>

            {/* Mot de passe avec bouton œil */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-blue-900 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-blue-900 font-medium"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-900 px-4 py-3 rounded-lg text-sm font-bold">
                {error}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 font-bold py-3 px-4 rounded-lg transition-all shadow-lg"
            >
              🔓 Se connecter
            </button>
          </form>

          {/* Aide */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-700 font-medium">
              💬 Problème de connexion ? Contactez Jérôme ou Axel
            </p>
          </div>

          {/* Lien technicien extincteurs */}
          <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-bold text-orange-900 mb-2">
                🧯 Vous êtes technicien extincteurs ?
              </p>
              <a 
                href="/technicien/login"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                🔧 Connectez-vous ici
              </a>
            </div>
          </div>

          {/* Info identifiants */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-semibold mb-2 text-center">
              📋 Identifiants équipe
            </p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>👨‍💼 <strong>Admins:</strong> jerome@ / axel@</p>
              <p>👷 <strong>Équipe:</strong> sebastien@ / joffrey@ / fabien@ / angelo@</p>
              <p className="text-blue-500 mt-2">@solairenettoyage.fr</p>
            </div>
          </div>
        </div>

        {/* Lien retour */}
        <div className="mt-6 text-center">
          <a href="/" className="text-white hover:text-blue-100 text-sm font-semibold">
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}