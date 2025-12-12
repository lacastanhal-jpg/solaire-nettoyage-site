'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ServiceToituresPage() {
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
      desc: 'Utilisation d\'une nacelle de 16m ou 20m pour positionner le robot de nettoyage en toute sécurité sur la toiture, sans sortir de la nacelle.',
      icon: '🏗️'
    },
    {
      number: '03',
      title: 'Nettoyage écologique',
      desc: 'Le robot de 3 mètres de large fonctionne exclusivement avec de l\'eau osmosée à 100%, garantissant un nettoyage sans résidus calcaire, sans traces.',
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
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 via-black to-amber-600/10" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle, rgba(218, 165, 32, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-block px-6 py-2 bg-yellow-600/20 border border-yellow-600 rounded-full text-yellow-400 text-sm font-bold mb-8">
            SERVICE PROFESSIONNEL
          </div>
          
          <h1 
            className="text-6xl md:text-8xl font-bold mb-8 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Toitures & Ombrières
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Nettoyage professionnel de panneaux photovoltaïques sur toitures industrielles, hangars agricoles et ombrières de parking
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Devis gratuit
            </Link>
            <a 
              href="#processus"
              className="px-8 py-4 border-2 border-yellow-600 text-yellow-600 font-bold rounded-lg hover:bg-yellow-600 hover:text-black transition-all duration-300"
            >
              Comment ça marche ?
            </a>
          </div>
        </div>
      </section>

      {/* Matériel */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Un matériel <span className="text-yellow-500">de pointe</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              4 camions spécialisés équipés des dernières technologies pour garantir un résultat irréprochable
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">🚛</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Camions équipés</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Cuves jusqu'à 10 000 litres d'eau osmosée</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Osmoseur professionnel haute performance</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Robot Solar Cleano</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Largeur de 3 mètres - technologie unique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>100% eau osmosée - aucun produit chimique</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section id="processus" className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Notre <span className="text-yellow-500">processus</span>
          </h2>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveStep(idx)}
                className={`bg-gradient-to-r from-gray-900 to-black border rounded-2xl p-8 transition-all duration-500 ${
                  activeStep === idx ? 'border-yellow-500 scale-105' : 'border-yellow-600/20'
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`text-7xl font-bold ${activeStep === idx ? 'text-yellow-400' : 'text-yellow-600/30'}`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-4xl">{step.icon}</span>
                      <h3 className="text-2xl font-bold text-gray-300">{step.title}</h3>
                    </div>
                    <p className="text-lg text-gray-400">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-r from-yellow-600/20 to-amber-600/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Prêt à optimiser vos installations ?
          </h2>
          <Link 
            href="/contact"
            className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl transition-all"
          >
            Devis gratuit
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
    </div>
  )
}
