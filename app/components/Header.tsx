'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          <Link href="#services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Services
          </Link>
          <Link href="#expertise" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Expertise
          </Link>
          <Link href="#clients" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Références
          </Link>
          <Link href="#contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
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
          <nav className="flex flex-col px-6 py-4 space-y-4">
            <Link 
              href="#services" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="#expertise" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Expertise
            </Link>
            <Link 
              href="#clients" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Références
            </Link>
            <Link 
              href="#contact" 
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
              className="bg-white text-navy px-6 py-3 text-sm font-semibold hover:bg-gold transition-all text-center"
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