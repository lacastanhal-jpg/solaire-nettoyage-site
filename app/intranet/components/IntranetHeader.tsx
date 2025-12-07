'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function IntranetHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState('Utilisateur')

  useEffect(() => {
    const name = localStorage.getItem('user_name')
    if (name) setUserName(name)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('intranet_logged_in')
    localStorage.removeItem('user_name')
    router.push('/intranet/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex justify-between items-center">
        {/* Logo + Badge */}
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy flex items-center justify-center text-white font-bold">
              SN
            </div>
            <span className="text-base font-semibold text-navy">Solaire Nettoyage</span>
          </a>
          <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide">
            Intranet
          </span>
        </div>

        {/* Navigation + User */}
        <div className="flex items-center gap-8">
          <nav className="flex gap-6">
            <a href="/intranet/dashboard" className="text-sm font-medium text-gray-600 hover:text-navy transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-navy transition-colors">
              Aide
            </a>
          </nav>

          {/* Menu utilisateur */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-semibold text-sm">
              {userName.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-gray-900">{userName}</span>
            <button
              onClick={handleLogout}
              className="ml-2 text-xs text-gray-500 hover:text-red-600 transition-colors"
              title="Se déconnecter"
            >
              ⏏️
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
