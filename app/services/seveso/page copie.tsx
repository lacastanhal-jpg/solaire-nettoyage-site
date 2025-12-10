'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Seveso() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const images = [
    '/images/services/seveso/seveso-1.jpg',
    '/images/services/seveso/seveso-2.jpg',
    '/images/services/seveso/seveso-3.jpg',
    '/images/services/seveso/seveso-4.jpg',
    '/images/services/seveso/seveso-5.jpg',
    '/images/services/seveso/seveso-6.jpg',
  ]

  const features = [
    'Certification GIES 1 & 2 exclusive',
    'Habilitations sites Seveso',
    'Formation sécurité spécifique',
    'Procédures d\'urgence validées',
    'Expérience sites sensibles',
    'Conformité règlements ICPE'
  ]

  const specs = [
    { label: 'Certification', value: 'GIES 1 & 2' },
    { label: 'Sites Seveso', value: 'Habilités' },
    { label: 'Formation', value: 'Continue' },
    { label: 'Exclusivité', value: 'Leader France' }
  ]

  return (
    <main className="bg-dark-bg pt-24">
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Link href="/#services" className="text-gold hover:text-white transition-colors text-sm mb-4 inline-block">
              ← Retour aux services
            </Link>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
              Sites Industriels & Seveso
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Habilitations exclusives pour interventions sur sites à hauts risques industriels. 
              Seul prestataire en France avec certification GIES complète pour sites Seveso.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Certifications exclusives</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 bg-dark-surface border border-white/8 p-6">
                  <span className="text-gold text-2xl">✓</span>
                  <span className="text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20 bg-dark-surface border border-white/8 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Notre expertise unique</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {specs.map((spec, index) => (
                <div key={index} className="text-center">
                  <div className="text-gold font-semibold mb-2">{spec.label}</div>
                  <div className="text-white text-xl font-bold">{spec.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20 bg-gold/10 border-2 border-gold p-8">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              Leader exclusif
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Solaire Nettoyage est le <strong className="text-white">seul prestataire en France</strong> disposant 
              des habilitations complètes GIES 1 & 2 pour intervenir sur l'ensemble des sites Seveso. 
              Une expertise unique acquise depuis 2016 auprès des plus grands groupes industriels français.
            </p>
          </div>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Nos interventions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className="relative aspect-[4/3] bg-gradient-to-br from-navy to-dark-bg cursor-pointer group overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📸</div>
                      <p className="text-white/50 text-sm">Photo {index + 1}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-navy p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Site industriel ou Seveso ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Contactez-nous pour une intervention certifiée et un devis gratuit sous 24h.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/#contact" className="bg-gold text-navy px-10 py-4 font-bold hover:bg-[#B8984E] transition-all inline-flex items-center gap-2">
                Demander un devis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a href="tel:+33632134766" className="bg-transparent text-white px-10 py-4 font-bold border-2 border-white/30 hover:border-white transition-all">
                06 32 13 47 66
              </a>
            </div>
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-8 right-8 text-white hover:text-gold text-5xl font-light" onClick={() => setSelectedImage(null)}>×</button>
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            <div className="bg-gradient-to-br from-navy to-dark-bg p-20 rounded-lg">
              <div className="text-center">
                <div className="text-8xl mb-6">📸</div>
                <p className="text-white text-2xl">Image sélectionnée</p>
                <p className="text-gray-400 mt-2">En attente de vos photos</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
