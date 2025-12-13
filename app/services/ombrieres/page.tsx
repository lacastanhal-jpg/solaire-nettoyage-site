'use client'

import Link from 'next/link'

export default function OmbrieresPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              SERVICE ADAPTÉ
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Ombrières de Parking
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Nettoyage d'ombrières photovoltaïques pour supermarchés et zones commerciales avec interventions hors heures d'ouverture
          </p>

          <Link 
            href="/#contact"
            className="bg-[#fbbf24] text-blue-900 px-10 py-4 text-base font-semibold hover:bg-[#fbbf24]/90 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            Demander un devis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Notre <span className="text-[#fbbf24]">approche</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: '🌙', title: 'Intervention hors heures', desc: 'Nuit et weekend pour ne pas perturber votre activité' },
              { icon: '🚛', title: 'Matériel compact', desc: 'Adapté aux contraintes des parkings' },
              { icon: '⚠️', title: 'Balisage sécurisé', desc: 'Zone de sécurité délimitée pendant l\'intervention' },
              { icon: '⚡', title: 'Nettoyage rapide', desc: 'Jusqu\'à 3000m²/heure avec robot 3 mètres' },
              { icon: '📅', title: 'Planning flexible', desc: 'Adaptation à vos contraintes d\'exploitation' },
              { icon: '😊', title: 'Minimum de gêne', desc: 'Discrétion maximale pour vos clients' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/20 border-2 border-[#fbbf24]/50 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">Nuit & Weekend</div>
                <p className="text-gray-700">Horaires adaptés</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">3000 m²/h</div>
                <p className="text-gray-700">Rapidité maximale</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">1000+</div>
                <p className="text-gray-700">Sites nettoyés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matériel */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Matériel <span className="text-[#fbbf24]">spécialisé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Robot Solar Cleano</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Largeur 3 mètres - technologie unique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>100% eau osmosée - aucun produit chimique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Nettoyage sans traces ni résidus</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Eau osmosée</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Cuves jusqu'à 10 000 litres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Osmoseur professionnel embarqué</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Autonomie complète sur site</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Déroulement de <span className="text-[#fbbf24]">l'intervention</span>
          </h2>

          <div className="space-y-6">
            {[
              { num: '01', title: 'Planification', desc: 'Nous définissons ensemble le créneau d\'intervention optimal (nuit ou weekend)' },
              { num: '02', title: 'Balisage', desc: 'Mise en place de cônes et signalisation pour sécuriser la zone de travail' },
              { num: '03', title: 'Nettoyage', desc: 'Robot radiocommandé avec eau osmosée, aucun contact avec les panneaux' },
              { num: '04', title: 'Contrôle', desc: 'Vérification finale et nettoyage de la zone d\'intervention' },
              { num: '05', title: 'Rapport', desc: 'Envoi instantané du rapport avec photos et recommandations' },
            ].map((step, idx) => (
              <div key={idx} className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold text-[#fbbf24]/30">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Nettoyage d'ombrières <span className="text-[#fbbf24]">sans contrainte</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Intervention adaptée à votre planning commercial. Devis gratuit sous 24h et aucun frais de déplacement.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}