'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setError('Email incorrect')
      return
    }

    if (user.password !== password) {
      setError('Mot de passe incorrect')
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
            <p className="text-blue-700">Solaire Nettoyage</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-6">
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
                placeholder="prenom@solairenettoyage.fr"
                required
                autoComplete="email"
              />
            </div>

            {/* Mot de passe - UNE SEULE FOIS */}
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
                autoComplete="current-password"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Se connecter
            </button>
          </form>

          {/* Aide */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-600">
              Problème de connexion ? Contactez Jérôme ou Axel
            </p>
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