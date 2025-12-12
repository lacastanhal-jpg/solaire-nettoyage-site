'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function NotreHistoirePage() {
  const [scrollY, setScrollY] = useState(0)
  const [countersVisible, setCountersVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCountersVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const target = document.getElementById('stats-section')
    if (target) observer.observe(target)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const Counter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      if (!countersVisible) return
      
      let startTime: number | null = null
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }, [countersVisible, end, duration])

    return <span>{count.toLocaleString()}{suffix}</span>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background avec parallax */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(218, 165, 32, 0.1) 0%, transparent 50%)',
          }}
        />
        
        {/* Grille décorative */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(rgba(218, 165, 32, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(218, 165, 32, 0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8 overflow-hidden">
            <h1 
              className="text-7xl md:text-8xl font-bold mb-6 tracking-tight"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                animation: 'slideUp 1s ease-out'
              }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
                Notre Histoire
              </span>
            </h1>
          </div>
          
          <p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              animation: 'fadeIn 1s ease-out 0.3s backwards'
            }}
          >
            Une aventure familiale devenue référence nationale du nettoyage photovoltaïque
          </p>

          <div className="flex gap-4 justify-center" style={{ animation: 'fadeIn 1s ease-out 0.6s backwards' }}>
            <Link 
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Demander un devis
            </Link>
            <Link 
              href="/services"
              className="px-8 py-4 border-2 border-yellow-600 text-yellow-600 font-bold rounded-lg hover:bg-yellow-600 hover:text-black transition-all duration-300"
            >
              Nos services
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-yellow-600 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-yellow-600 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-20" style={{ fontFamily: "'Playfair Display', serif" }}>
            De <span className="text-yellow-500">2016</span> à aujourd'hui
          </h2>

          <div className="relative">
            {/* Ligne verticale dorée */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-600 via-amber-500 to-yellow-600 transform -translate-x-1/2" />

            {/* 2016 - Les débuts */}
            <div className="relative mb-32">
              <div className="flex items-center justify-end pr-16 md:pr-32">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-8 max-w-lg transform hover:scale-105 transition-all duration-300 hover:border-yellow-600">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl font-bold text-yellow-500" style={{ fontFamily: "'Playfair Display', serif" }}>2016</span>
                    <div className="h-1 flex-1 bg-gradient-to-r from-yellow-600 to-transparent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-yellow-400">L'aventure commence</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Création de l'entreprise familiale : un père, un fils, et la volonté de proposer un service de nettoyage industriel et photovoltaïque sérieux, organisé et humain.
                  </p>
                </div>
              </div>
              {/* Point sur la timeline */}
              <div className="absolute left-1/2 top-8 w-6 h-6 bg-yellow-500 rounded-full transform -translate-x-1/2 ring-8 ring-yellow-500/20 animate-pulse" />
            </div>

            {/* Évolution */}
            <div className="relative mb-32">
              <div className="flex items-center justify-start pl-16 md:pl-32">
                <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-8 max-w-lg transform hover:scale-105 transition-all duration-300 hover:border-yellow-600">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-1 flex-1 bg-gradient-to-l from-yellow-600 to-transparent" />
                    <span className="text-6xl font-bold text-yellow-500" style={{ fontFamily: "'Playfair Display', serif" }}>2018</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-yellow-400">Structuration & croissance</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Développement des méthodes, acquisition de matériel professionnel, formation des équipes. L'entreprise se structure et perfectionne ses protocoles d'intervention.
                  </p>
                </div>
              </div>
              <div className="absolute left-1/2 top-8 w-6 h-6 bg-yellow-500 rounded-full transform -translate-x-1/2 ring-8 ring-yellow-500/20" />
            </div>

            {/* Aujourd'hui */}
            <div className="relative">
              <div className="flex items-center justify-end pr-16 md:pr-32">
                <div className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500 rounded-xl p-8 max-w-lg transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-yellow-500/20">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl font-bold text-yellow-400" style={{ fontFamily: "'Playfair Display', serif" }}>2024</span>
                    <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500 to-transparent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-yellow-300">Une référence nationale</h3>
                  <p className="text-gray-200 leading-relaxed font-medium">
                    6 professionnels spécialisés, plus de 4 millions de m² nettoyés par an, un matériel à la pointe de la technologie pour 1,5 million d'euros. Une histoire familiale devenue une référence.
                  </p>
                </div>
              </div>
              <div className="absolute left-1/2 top-8 w-8 h-8 bg-yellow-400 rounded-full transform -translate-x-1/2 ring-8 ring-yellow-400/30 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 via-transparent to-amber-600/10" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20" style={{ fontFamily: "'Playfair Display', serif" }}>
            Solaire Nettoyage en <span className="text-yellow-500">chiffres</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:border-yellow-600 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Counter end={6} />
                </div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Professionnels</h3>
                <p className="text-gray-400">Spécialisés et certifiés</p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:border-yellow-600 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Counter end={4} suffix="M" />
                </div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">m² nettoyés</h3>
                <p className="text-gray-400">Par an sur tout le territoire</p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 hover:border-yellow-600 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Counter end={1.5} suffix="M€" />
                </div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">de matériel</h3>
                <p className="text-gray-400">Équipements professionnels</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Équipe & Certifications */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
            Une équipe d'<span className="text-yellow-500">experts certifiés</span>
          </h2>
          
          <p className="text-xl text-gray-300 text-center max-w-3xl mx-auto mb-16 leading-relaxed">
            Chaque membre de notre équipe dispose des compétences et habilitations nécessaires pour intervenir en toute sécurité sur les installations les plus exigeantes.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🏥', title: 'SST', desc: 'Sauveteur Secouriste du Travail' },
              { icon: '⚡', title: 'Habilitation électrique', desc: 'B0 H0V BP photovoltaïque' },
              { icon: '🏗️', title: 'CACES R486', desc: 'PEMP - Nacelles' },
              { icon: '🚜', title: 'CACES R482', desc: 'Catégories A et F' },
              { icon: '⛑️', title: 'Travail en hauteur', desc: 'Port du harnais' },
              { icon: '🎯', title: 'GIES 1 & 2', desc: 'Sites Seveso' },
            ].map((cert, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20"
                style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s backwards` }}
              >
                <div className="text-4xl mb-4">{cert.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{cert.title}</h3>
                <p className="text-gray-400">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-amber-600/20 to-yellow-600/20" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Rejoignez nos <span className="text-yellow-500">3 600+ clients</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            De 2016 à aujourd'hui, l'entreprise a grandi, s'est transformée, mais a gardé son identité : une histoire familiale devenue une référence.
          </p>

          <Link 
            href="/contact"
            className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Demander un devis gratuit
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600&display=swap');
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
