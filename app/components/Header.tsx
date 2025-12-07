'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-bg/95 backdrop-blur-lg border-b border-white/8' : 'bg-dark-bg/95 backdrop-blur-lg border-b border-white/8'
    }`}>
      <div className="max-w-[1400px] mx-auto px-12 py-5 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-11 h-11 bg-white flex items-center justify-center font-bold text-navy text-lg tracking-tighter">
            SN
          </div>
          <span className="text-lg font-semibold text-white tracking-tight group-hover:text-gold transition-colors">
            Solaire Nettoyage
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-10">
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
            🔐 Intranet
          </Link>
          <a href="tel:+33632134766" className="bg-white text-navy px-7 py-3 text-sm font-semibold hover:bg-gold transition-all inline-block">
            06 32 13 47 66
          </a>
        </nav>
      </div>
    </header>
  )
}
