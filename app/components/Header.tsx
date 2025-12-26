'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [entrepriseOpen, setEntrepriseOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [mobileEntrepriseOpen, setMobileEntrepriseOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermer les menus dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setServicesOpen(false)
      setEntrepriseOpen(false)
    }
    
    if (servicesOpen || entrepriseOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [servicesOpen, entrepriseOpen])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#1e3a8a]/95 backdrop-blur-lg border-b border-white/8' : 'bg-[#1e3a8a]/95 backdrop-blur-lg border-b border-white/8'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 md:gap-4 group">
          <Image 
            src="/logo.png" 
            alt="Solaire Nettoyage" 
            width={36} 
            height={36}
            className="md:w-[44px] md:h-[44px] object-contain"
          />
          <span className="text-base md:text-lg font-semibold text-white tracking-tight group-hover:text-gold transition-colors">
            Solaire Nettoyage
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-10">
          {/* MENU SERVICES */}
          <div 
            className="relative"
            onClick={(e) => {
              e.stopPropagation()
              setServicesOpen(!servicesOpen)
              setEntrepriseOpen(false)
            }}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Services
              <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                <Link 
                  href="/services/centrales-sol" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Centrales au sol
                </Link>
                <Link 
                  href="/services/ombrieres" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Ombrières de parking
                </Link>
                <Link 
                  href="/services/seveso" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Sites SEVESO
                </Link>
                <Link 
                  href="/services/toitures" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Toitures industrielles
                </Link>
              </div>
            )}
          </div>

          {/* MENU ENTREPRISE */}
          <div 
            className="relative"
            onClick={(e) => {
              e.stopPropagation()
              setEntrepriseOpen(!entrepriseOpen)
              setServicesOpen(false)
            }}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Entreprise
              <ChevronDown className={`w-4 h-4 transition-transform ${entrepriseOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {entrepriseOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                <Link 
                  href="/entreprise/a-propos" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  À propos
                </Link>
                <Link 
                  href="/entreprise/carrieres" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Carrières
                </Link>
                <Link 
                  href="/entreprise/certifications" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Certifications
                </Link>
                <Link 
                  href="/entreprise/references" 
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  Références
                </Link>
              </div>
            )}
          </div>

          {/* LIEN NOTRE HISTOIRE */}
          <Link href="/notre-histoire" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Notre histoire
          </Link>

          {/* LIEN DIRECT CONTACT */}
          <Link href="/#contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
          <Link href="/intranet" className="text-sm font-medium text-gold hover:text-white transition-colors">
            🔒 Intranet
          </Link>
          <Link href="/client/login" className="text-sm font-medium text-gold hover:text-white transition-colors">
            👤 Espace Client
          </Link>
          <a href="tel:+33632134766" className="bg-white text-navy px-7 py-3 text-sm font-semibold hover:bg-gold transition-all inline-block">
            06 32 13 47 66
          </a>
        </nav>

        {/* Bouton Menu Mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white p-2"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1e3a8a] border-t border-white/8">
          <nav className="flex flex-col px-6 py-4 space-y-2">
            {/* MENU SERVICES MOBILE (Accordéon) */}
            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileServicesOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link 
                    href="/services/centrales-sol" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Centrales au sol
                  </Link>
                  <Link 
                    href="/services/ombrieres" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ombrières de parking
                  </Link>
                  <Link 
                    href="/services/seveso" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sites SEVESO
                  </Link>
                  <Link 
                    href="/services/toitures" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Toitures industrielles
                  </Link>
                </div>
              )}
            </div>

            {/* MENU ENTREPRISE MOBILE (Accordéon) */}
            <div>
              <button
                onClick={() => setMobileEntrepriseOpen(!mobileEntrepriseOpen)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              >
                Entreprise
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileEntrepriseOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileEntrepriseOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  <Link 
                    href="/entreprise/a-propos" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    À propos
                  </Link>
                  <Link 
                    href="/entreprise/carrieres" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Carrières
                  </Link>
                  <Link 
                    href="/entreprise/certifications" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Certifications
                  </Link>
                  <Link 
                    href="/entreprise/references" 
                    className="block text-sm text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Références
                  </Link>
                </div>
              )}
            </div>

            {/* LIEN NOTRE HISTOIRE */}
            <Link 
              href="/notre-histoire" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notre histoire
            </Link>

            <Link 
              href="/#contact" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link 
              href="/intranet" 
              className="text-sm font-medium text-gold hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              🔒 Intranet
            </Link>
            <Link 
              href="/client/login" 
              className="text-sm font-medium text-gold hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              👤 Espace Client
            </Link>
            <a 
              href="tel:+33632134766" 
              className="bg-white text-navy px-6 py-3 text-sm font-semibold hover:bg-gold transition-all text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              06 32 13 47 66
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}