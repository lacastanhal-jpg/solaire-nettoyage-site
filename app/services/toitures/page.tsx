'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ToituresPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      number: '01',
      title: 'Sécurisation de la zone',
      desc: 'Mise en place de cônes et signalisation adaptée pour garantir la protection de vos installations et la sécurité de nos techniciens.',
      icon: '⚠️'
    },
    {
      number: '02',
      title: 'Positionnement nacelle',
      desc: 'Utilisation d\'une nacelle de 16m ou 20m pour positionner le robot de nettoyage en toute sécurité sur la toiture, sans que le technicien ait besoin de sortir de la nacelle.',
      icon: '🏗️'
    },
    {
      number: '03',
      title: 'Nettoyage écologique',
      desc: 'Le robot de 3 mètres de large fonctionne exclusivement avec de l\'eau osmosée à 100%, garantissant un nettoyage sans résidus calcaire, sans traces et écologique.',
      icon: '💧'
    },
    {
      number: '04',
      title: 'Récupération & vérifications',
      desc: 'Une fois le nettoyage terminé, nous récupérons le robot et procédons aux vérifications finales avant de quitter le site.',
      icon: '✅'
    },
    {
      number: '05',
      title: 'Rapport détaillé',
      desc: 'Vous recevez instantanément un rapport complet avec photos avant/pendant/après, détection d\'ombrages, panneaux endommagés et conseils personnalisés.',
      icon: '📊'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              SERVICE PROFESSIONNEL
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Toitures Photovoltaïques
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Nettoyage professionnel de panneaux sur toitures industrielles et hangars agricoles avec robots de dernière génération
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link 
              href="/#contact"
              className="bg-[#fbbf24] text-blue-900 px-10 py-4 text-base font-semibold hover:bg-[#fbbf24]/90 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              Demander un devis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a href="#processus" className="px-8 py-4 border-2 border-blue-200 text-white font-bold rounded-lg hover:bg-white hover:text-blue-900 transition-all duration-300">
              Comment ça marche ?
            </a>
          </div>
        </div>
      </section>

      {/* Matériel */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Un matériel <span className="text-[#fbbf24]">de pointe</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🚛</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Camions équipés</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Semi-remorque 44T avec cuve 10 000L eau osmosée</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Porteurs 26T avec cuves 8 000L</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Osmoseur professionnel haute performance</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Robot Solar Cleano</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Largeur de 3 mètres - technologie unique sur le marché</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Radiocommandé depuis la nacelle</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>100% eau osmosée - aucun produit chimique</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Nacelles certifiées</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Nacelles HA16 RTJ PRO (16 mètres)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Nacelle HA20 RTJ PRO (20 mètres)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>VGP à jour - contrôles tous les 6 mois</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Performance</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Rapidité : 2000 à 3000 m²/heure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Équipes de 2 à 3 personnes formées</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Intervention sur toute la France</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/20 border-2 border-[#fbbf24]/50 rounded-2xl p-8 text-center">
            <div className="text-6xl font-bold text-blue-900 mb-4">
              1,5 M€
            </div>
            <p className="text-xl text-gray-700">
              de matériel professionnel pour garantir la qualité de nos interventions
            </p>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section id="processus" className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Notre <span className="text-[#fbbf24]">processus</span> d'intervention
          </h2>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                className={`bg-white border rounded-2xl p-8 transition-all duration-500 cursor-pointer ${
                  activeStep === idx ? 'border-[#fbbf24] scale-105 shadow-2xl shadow-[#fbbf24]/20' : 'border-blue-200'
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`text-7xl font-bold transition-all duration-500 ${
                    activeStep === idx ? 'text-[#fbbf24] scale-110' : 'text-[#fbbf24]/30'
                  }`}>
                    {step.number}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-4xl">{step.icon}</span>
                      <h3 className="text-2xl font-bold text-blue-900">{step.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rapport */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Rapport d'intervention <span className="text-[#fbbf24]">détaillé</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🌳', title: 'Détection ombrages', desc: 'Végétation, objets, poussières identifiés' },
              { icon: '🔍', title: 'Panneaux endommagés', desc: 'Localisation précise avec photos' },
              { icon: '📸', title: 'Photos complètes', desc: 'Avant, pendant et après intervention' },
              { icon: '💊', title: 'Type de salissure', desc: 'Analyse détaillée des dépôts' },
              { icon: '📋', title: 'Conseils personnalisés', desc: 'Recommandations d\'entretien' },
              { icon: '⚡', title: 'Rapport instantané', desc: 'Envoyé dès la fin de l\'intervention' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Augmentez votre rendement de <span className="text-[#fbbf24]">15 à 30%</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Intervention rapide sur toute la France sans frais de déplacement. Devis gratuit sous 24h.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}