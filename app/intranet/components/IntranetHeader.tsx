'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function IntranetHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState('Utilisateur')
  const [isAdmin, setIsAdmin] = useState(false)
  
  // États pour les menus déroulants
  const [crmOpen, setCrmOpen] = useState(false)
  const [financesOpen, setFinancesOpen] = useState(false)
  const [operationsOpen, setOperationsOpen] = useState(false)
  const [conformiteOpen, setConformiteOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

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
    setCrmOpen(false)
    setFinancesOpen(false)
    setOperationsOpen(false)
    setConformiteOpen(false)
    setAdminMenuOpen(false)
  }

  return (
    <header className="bg-[#1e3a8a] border-b border-[#1e3a8a]/20 sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo + Badge */}
        <div className="flex items-center gap-4">
          <Link href="/intranet/dashboard" className="flex items-center gap-3">
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
        <nav className="flex items-center gap-5">
          
          {/* 🏠 ACCUEIL */}
          <Link 
            href="/intranet/dashboard" 
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            🏠 Accueil
          </Link>

          {/* 💼 CRM CLIENTS - ADMIN UNIQUEMENT */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setCrmOpen(!crmOpen)
                  setFinancesOpen(false)
                  setOperationsOpen(false)
                  setConformiteOpen(false)
                  setAdminMenuOpen(false)
                }}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                💼 CRM Clients
                <svg className={`w-4 h-4 transition-transform ${crmOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {crmOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <Link href="/admin/gestion-groupes" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    🏢 Groupes
                  </Link>
                  <Link href="/admin/gestion-clients" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    👥 Clients (600+)
                  </Link>
                  <Link href="/admin/gestion-sites" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    📍 Sites (3600)
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link href="/admin/import-sites" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    📥 Import Sites Excel
                  </Link>
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    📄 Contrats (à venir)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 💰 FINANCES - ADMIN UNIQUEMENT */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setFinancesOpen(!financesOpen)
                  setCrmOpen(false)
                  setOperationsOpen(false)
                  setConformiteOpen(false)
                  setAdminMenuOpen(false)
                }}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                💰 Finances
                <svg className={`w-4 h-4 transition-transform ${financesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {financesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <Link href="/admin/devis" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    📝 Devis
                  </Link>
                  <Link href="/admin/finances/factures" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    📄 Factures
                  </Link>
                  <Link href="/admin/finances/avoirs" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    🔴 Avoirs
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    💳 Notes de Frais (à venir)
                  </div>
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    📥 Factures Fournisseurs (à venir)
                  </div>
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    💵 Charges Fixes (à venir)
                  </div>
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    🏦 Lignes Bancaires (à venir)
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div className="px-4 py-2 text-xs text-gray-500 italic">
                    📊 Dashboard Finances (à venir)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🚀 OPÉRATIONS - TOUS */}
          <div className="relative">
            <button
              onClick={() => {
                setOperationsOpen(!operationsOpen)
                setCrmOpen(false)
                setFinancesOpen(false)
                setConformiteOpen(false)
                setAdminMenuOpen(false)
              }}
              className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              🚀 Opérations
              <svg className={`w-4 h-4 transition-transform ${operationsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {operationsOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                <Link href="/admin/calendrier" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  📅 Planning Interventions
                </Link>
                <Link href="/admin/nouvelle-intervention" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  ➕ Nouvelle Intervention
                </Link>
                <Link href="/admin/interventions" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  📄 Liste Interventions
                </Link>
                {isAdmin && (
                  <>
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link href="/admin/gestion-equipes" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                      👷 Équipes & Opérateurs
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 🎓 CONFORMITÉ - TOUS */}
          <div className="relative">
            <button
              onClick={() => {
                setConformiteOpen(!conformiteOpen)
                setCrmOpen(false)
                setFinancesOpen(false)
                setOperationsOpen(false)
                setAdminMenuOpen(false)
              }}
              className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              🎓 Conformité
              <svg className={`w-4 h-4 transition-transform ${conformiteOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {conformiteOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                <Link href="/intranet/certifications" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  🎓 Certifications CACES/Médical
                </Link>
                <Link href="/intranet/extincteurs" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                  🧯 Extincteurs
                </Link>
                <div className="px-4 py-2 text-xs text-gray-500 italic">
                  📋 Documents Légaux (à venir)
                </div>
              </div>
            )}
          </div>

          {/* ⚙️ ADMINISTRATION - ADMIN UNIQUEMENT */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => {
                  setAdminMenuOpen(!adminMenuOpen)
                  setCrmOpen(false)
                  setFinancesOpen(false)
                  setOperationsOpen(false)
                  setConformiteOpen(false)
                }}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                ⚙️ Admin
                <svg className={`w-4 h-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {adminMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <Link href="/admin/gely" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    🏢 GELY Management
                  </Link>
                  <Link href="/admin/parametres-entreprise" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    🏢 Paramètres Entreprise
                  </Link>
                  <Link href="/admin/articles" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    📦 Catalogue Articles
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link href="/admin/demandes-modifications" onClick={closeAllMenus} className="block px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600">
                    📨 Demandes Clients
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 🌐 Site public */}
          <Link href="/" className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors">
            🌐 Site public
          </Link>
        </nav>

        {/* Menu utilisateur */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-yellow-500 text-[#1e3a8a] flex items-center justify-center font-bold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-white">{userName}</span>
          <button
            onClick={handleLogout}
            className="ml-2 text-xs text-gray-300 hover:text-red-400 transition-colors font-semibold"
            title="Se déconnecter"
          >
            ⚠️ Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}
