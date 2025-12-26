'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NotreHistoirePage() {
  const [countersVisible, setCountersVisible] = useState(false)

  useEffect(() => {
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

    return () => observer.disconnect()
  }, [])

  const Counter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      if (!countersVisible) return

      let start = 0
      const increment = end / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }, [countersVisible, end, duration])

    return <span>{count}{suffix}</span>
  }

  const timeline = [
    {
      year: '2016',
      title: 'Création de l\'entreprise',
      description: 'Jérôme et Axel Gely créent Solaire Nettoyage, une entreprise familiale spécialisée dans le nettoyage de panneaux photovoltaïques. L\'aventure commence avec une vision claire : offrir un service professionnel et écologique.'
    },
    {
      year: '2018',
      title: 'Première équipe professionnelle',
      description: 'Acquisition du premier camion équipé et formation d\'une équipe de 3 techniciens certifiés. Les premiers grands contrats avec des centrales solaires régionales sont signés.'
    },
    {
      year: '2020',
      title: 'Expansion nationale',
      description: 'Solaire Nettoyage devient une référence en France. Partenariats majeurs avec EDF Solutions Solaires et ENGIE Green France. L\'équipe passe à 4 professionnels et 2 camions spécialisés.'
    },
    {
      year: '2022',
      title: 'Certification Seveso',
      description: 'Obtention des certifications pour intervenir sur les sites Seveso haute sécurité (ArcelorMittal, Safran). Investissement dans du matériel de pointe pour 1,5M€.'
    },
    {
      year: '2024',
      title: 'Leader français',
      description: '6 professionnels, 4 camions, 3 équipes mobiles. Plus de 3600 sites nettoyés par an pour les plus grands énergéticiens français. 4 millions de m² traités annuellement.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-400 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-6 py-2 mb-8">
              <span className="text-2xl">📖</span>
              <span className="text-yellow-500 font-semibold">Notre Histoire</span>
            </div>

            {/* Titre */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Une histoire familiale,<br />
              une passion commune
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Depuis 2016, Jérôme et Axel Gely ont construit Solaire Nettoyage avec une vision claire : 
              devenir la référence française du nettoyage photovoltaïque professionnel.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-500 mb-4">
                {countersVisible && <Counter end={6} />}
              </div>
              <div className="text-xl font-semibold text-blue-900 mb-2">Professionnels certifiés</div>
              <p className="text-blue-700">
                Équipe experte formée aux normes les plus strictes
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-500 mb-4">
                {countersVisible && <Counter end={4} />}M
              </div>
              <div className="text-xl font-semibold text-blue-900 mb-2">m² nettoyés / an</div>
              <p className="text-blue-700">
                Plus de 3600 sites d'intervention chaque année
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="text-6xl font-bold text-yellow-500 mb-4">
                {countersVisible && <Counter end={1.5} />}M€
              </div>
              <div className="text-xl font-semibold text-blue-900 mb-2">de matériel professionnel</div>
              <p className="text-blue-700">
                4 camions spécialisés, nacelles, robots dernière génération
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titre section */}
          <div className="text-center mb-20">
            <span className="text-sm font-semibold text-yellow-500 tracking-[0.15em] uppercase block mb-4">
              2016 - 2024
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              8 ans d'excellence
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              De l'entreprise familiale au leader français du nettoyage photovoltaïque
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

            {/* Items timeline */}
            <div className="space-y-16">
              {timeline.map((item, index) => (
                <div key={index} className="relative pl-24">
                  {/* Point timeline */}
                  <div className="absolute left-4 w-9 h-9 bg-yellow-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>

                  {/* Contenu */}
                  <div className="bg-white border border-blue-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all">
                    <div className="text-5xl font-bold text-yellow-500 mb-4">{item.year}</div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">{item.title}</h3>
                    <p className="text-blue-700 leading-relaxed text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="bg-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titre */}
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-yellow-500 tracking-[0.15em] uppercase block mb-4">
              Excellence & Conformité
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Certifications professionnelles
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Nos équipes sont formées et certifiées pour intervenir sur tous types de sites, 
              y compris les installations les plus sensibles.
            </p>
          </div>

          {/* Grid certifications */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* CACES */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏗️</span>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">CACES R486 & R482</h3>
              <p className="text-sm text-blue-700">
                Nacelles et engins de chantier
              </p>
            </div>

            {/* SST */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏥</span>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">SST</h3>
              <p className="text-sm text-blue-700">
                Sauveteur Secouriste du Travail
              </p>
            </div>

            {/* Habilitations électriques */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Habilitations B0 H0V BP</h3>
              <p className="text-sm text-blue-700">
                Travaux électriques photovoltaïques
              </p>
            </div>

            {/* Seveso */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:border-blue-500 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Sites Seveso</h3>
              <p className="text-sm text-blue-700">
                Certification haute sécurité
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-400 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à confier vos installations<br />à des experts certifiés ?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Demandez votre devis gratuit et bénéficiez de notre expertise reconnue
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/contact"
              className="px-10 py-4 bg-yellow-500 text-blue-900 text-lg font-semibold rounded-lg hover:bg-yellow-600 transition-all hover:-translate-y-1 inline-flex items-center gap-2"
            >
              Demander un devis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="tel:+33632134766"
              className="px-10 py-4 bg-white text-blue-900 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all hover:-translate-y-1"
            >
              06 32 13 47 66
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}