'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function IntranetHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState('Utilisateur')
  const [isAdmin, setIsAdmin] = useState(false)
  
  // États pour les menus déroulants
  const [interventionsOpen, setInterventionsOpen] = useState(false)
  const [certificationsOpen, setCertificationsOpen] = useState(false)
  const [clientsOpen, setClientsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    const name = localStorage.getItem('user_name')
    if (name) setUserName(name)
    
    const userRole = localStorage.getItem('user_role')
    setIsAdmin(userRole === 'admin')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('intranet_logged_in')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    router.push('/intranet/login')
  }

  const closeAllMenus = () => {
    setInterventionsOpen(false)
    setCertificationsOpen(false)
    setClientsOpen(false)
    setAdminOpen(false)
  }

  return (
    <header className="bg-[#1e3a8a] border-b border-[#1e3a8a]/20 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-8 py-3 flex justify-between items-center">
        {/* Logo + Badge */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-[#1e3a8a] font-bold rounded">
              SN
            </div>
            <span className="text-base font-semibold text-white">Solaire Nettoyage</span>
          </Link>
          <span className="bg-yellow-500 text-[#1e3a8a] px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
            Intranet
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {/* Dashboard */}
          <Link href="/intranet/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>

          {/* MENU INTERVENTIONS */}
          <div className="relative">
            <button
              onClick={() => {
                setInterventionsOpen(!interventionsOpen)
                setCertificationsOpen(false)
                setClientsOpen(false)
                setAdminOpen(false)
              }}
              className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Interventions
              <svg className={`w-4 h-4 transition-transform ${interventionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {interventionsOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                <Link href="/admin/calendrier" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  Calendrier
                </Link>
                <Link href="/admin/nouvelle-intervention" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  Nouvelle intervention
                </Link>
                <Link href="/admin/interventions" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  Liste interventions
                </Link>
              </div>
            )}
          </div>

          {/* MENU CERTIFICATIONS */}
          <div className="relative">
            <button
              onClick={() => {
                setCertificationsOpen(!certificationsOpen)
                setInterventionsOpen(false)
                setClientsOpen(false)
                setAdminOpen(false)
              }}
              className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Certifications
              <svg className={`w-4 h-4 transition-transform ${certificationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {certificationsOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                <Link href="/intranet/certifications" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  Certifications équipe
                </Link>
                <Link href="/intranet/extincteurs" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  Extincteurs
                </Link>
              </div>
            )}
          </div>

          {/* MENU CLIENTS & SITES - ADMIN UNIQUEMENT */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setClientsOpen(!clientsOpen)
                  setInterventionsOpen(false)
                  setCertificationsOpen(false)
                  setAdminOpen(false)
                }}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Clients & Sites
                <svg className={`w-4 h-4 transition-transform ${clientsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {clientsOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <Link href="/admin/gestion-clients" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Clients
                  </Link>
                  <Link href="/admin/gestion-sites" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Sites
                  </Link>
                  <Link href="/admin/gestion-groupes" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Groupes
                  </Link>
                  <Link href="/admin/import-sites" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Import sites
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* MENU ADMIN - ADMIN UNIQUEMENT */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setAdminOpen(!adminOpen)
                  setInterventionsOpen(false)
                  setCertificationsOpen(false)
                  setClientsOpen(false)
                }}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Admin
                <svg className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {adminOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <Link href="/admin/demandes-modifications" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Demandes modifications
                  </Link>
                  <Link href="/admin/gestion-equipes" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Gestion équipes
                  </Link>
                  <Link href="/admin/init-operateurs" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    Opérateurs
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* GELY - ADMIN UNIQUEMENT */}
          {isAdmin && (
            <Link href="/admin/gely" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              GELY
            </Link>
          )}

          {/* Retour site public */}
          <Link href="/" className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors">
            Site public
          </Link>
        </nav>

        {/* Menu utilisateur */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-yellow-500 text-[#1e3a8a] flex items-center justify-center font-bold text-sm">
            {userName.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-white">{userName}</span>
          <button
            onClick={handleLogout}
            className="ml-2 text-xs text-gray-300 hover:text-red-400 transition-colors"
            title="Se déconnecter"
          >
            ⏏️
          </button>
        </div>
      </div>
    </header>
  )
}