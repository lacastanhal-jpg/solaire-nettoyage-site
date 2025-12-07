'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ServiceDetail {
  id: string
  title: string
  description: string
  features: string[]
  images: string[]
}

export default function ServicesDetailed() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const services: ServiceDetail[] = [
    {
      id: 'centrales-sol',
      title: 'Nettoyage Centrales au Sol',
      description: 'Intervention sur grandes installations photovoltaïques au sol avec équipement industriel mobile.',
      features: [
        'Semi-remorque 44T autonome',
        'Capacité 2000-3000m²/heure',
        'Robots Solar Cleano 3m30',
        'Eau osmosée 8000-10000L',
        'Nacelles jusqu\'à 20m'
      ],
      images: [
        '/images/services/centrales/placeholder-1.jpg',
        '/images/services/centrales/placeholder-2.jpg',
        '/images/services/centrales/placeholder-3.jpg',
      ]
    },
    {
      id: 'toitures',
      title: 'Nettoyage Toitures Photovoltaïques',
      description: 'Nettoyage professionnel de panneaux solaires en toiture avec respect des normes de sécurité.',
      features: [
        'Intervention tous types de toitures',
        'Harnais et ligne de vie certifiés',
        'Nacelles adaptées jusqu\'à 17m',
        'Personnel habilité travail en hauteur',
        'Eau osmosée sans traces'
      ],
      images: [
        '/images/services/toitures/placeholder-1.jpg',
        '/images/services/toitures/placeholder-2.jpg',
        '/images/services/toitures/placeholder-3.jpg',
      ]
    },
    {
      id: 'ombrieres',
      title: 'Nettoyage Ombrières de Parking',
      description: 'Spécialistes du nettoyage d\'ombrières photovoltaïques pour supermarchés et zones commerciales.',
      features: [
        'Intervention hors heures d\'ouverture',
        'Matériel compact pour parkings',
        'Balisage zone de sécurité',
        'Nettoyage rapide et efficace',
        'Planning adapté à votre activité'
      ],
      images: [
        '/images/services/ombrieres/placeholder-1.jpg',
        '/images/services/ombrieres/placeholder-2.jpg',
        '/images/services/ombrieres/placeholder-3.jpg',
      ]
    },
    {
      id: 'seveso',
      title: 'Sites Industriels & Seveso',
      description: 'Habilitations exclusives pour interventions sur sites à hauts risques industriels.',
      features: [
        'Certification GIES 1 & 2',
        'Habilitations sites Seveso',
        'Formation sécurité spécifique',
        'Procédures d\'urgence validées',
        'Expérience sites sensibles'
      ],
      images: [
        '/images/services/seveso/placeholder-1.jpg',
        '/images/services/seveso/placeholder-2.jpg',
        '/images/services/seveso/placeholder-3.jpg',
      ]
    }
  ]

  return (
    <section className="bg-dark-surface py-24">
      <div className="max-w-[1400px] mx-auto px-12">
        {/* En-tête section */}
        <div className="text-center mb-20">
          <span className="text-xs font-semibold text-gold tracking-[0.15em] uppercase mb-4 block">
            Nos Services
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-white mb-6">
            Expertise & Savoir-faire
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Des solutions professionnelles adaptées à chaque type d'installation photovoltaïque
          </p>
        </div>

        {/* Services détaillés */}
        <div className="space-y-32">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              id={service.id}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}
            >
              {/* Contenu texte */}
              <div className="flex-1">
                <div className="max-w-xl">
                  <h3 className="font-display text-4xl font-semibold text-white mb-6">
                    {service.title}
                  </h3>
                  <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Liste caractéristiques */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-gold mt-1">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a 
                    href="#contact"
                    className="inline-flex items-center gap-2 bg-gold text-navy px-8 py-4 font-semibold hover:bg-[#B8984E] transition-all"
                  >
                    Demander un devis
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Galerie photos */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  {service.images.map((image, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedImage(image)}
                      className={`relative overflow-hidden cursor-pointer group ${
                        idx === 0 ? 'col-span-2 h-80' : 'h-60'
                      }`}
                    >
                      {/* Placeholder tant qu'on n'a pas les vraies photos */}
                      <div className="absolute inset-0 bg-gradient-to-br from-navy to-dark-bg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📸</div>
                          <p className="text-white/50 text-sm">Photo {idx + 1}</p>
                          <p className="text-white/30 text-xs mt-2">{service.title}</p>
                        </div>
                      </div>
                      
                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <svg 
                          className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-8 right-8 text-white hover:text-gold text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            {/* Placeholder pour lightbox */}
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
    </section>
  )
}
