'use client'

import Link from 'next/link'

export default function CentralesSolPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              TERRAINS DIFFICILES
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Centrales Solaires au Sol
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Spécialistes du nettoyage de centrales en milieu marécageux ou accidenté avec tracteur Sunbrush haute performance
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

      {/* Équipement */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Équipement <span className="text-[#fbbf24]">spécialisé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] transition-all duration-300">
              <div className="text-5xl mb-4">🚜</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Tracteur Sunbrush</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Fonctionne sur terrains accidentés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Adapté aux milieux marécageux</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Passe dans rangées de moins de 2 mètres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Nettoyage en continu sans interruption</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] transition-all duration-300">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Citerne mobile</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>10 000L eau osmosée à 100%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Ravitaillement continu des tracteurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Autonomie maximale sur site</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Citerne incendie sur demande</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/20 border-2 border-[#fbbf24]/50 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">24/7</div>
                <p className="text-gray-700">Travail continu</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">&lt; 2m</div>
                <p className="text-gray-700">Largeur rangées</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">100%</div>
                <p className="text-gray-700">Terrains difficiles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Nos <span className="text-[#fbbf24]">avantages</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🌿', title: 'Terrains marécageux', desc: 'Stabilité optimale sur sols meubles' },
              { icon: '⛰️', title: 'Terrains accidentés', desc: 'S\'adapte aux pentes et dénivelés' },
              { icon: '📏', title: 'Rangées étroites', desc: 'Passe dans moins de 2 mètres' },
              { icon: '⚡', title: 'Nettoyage continu', desc: 'Sans interruption, 24h/24 si besoin' },
              { icon: '💧', title: 'Eau osmosée', desc: 'Aucun résidu, aucune trace' },
              { icon: '📊', title: 'Rapport complet', desc: 'Photos et analyse détaillée' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
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
              { num: '01', title: 'Sécurisation & déploiement', desc: 'Mise en place de la citerne et sécurisation de la zone' },
              { num: '02', title: 'Nettoyage continu', desc: 'Le Sunbrush travaille en continu sur tous types de terrains' },
              { num: '03', title: 'Ravitaillement', desc: 'Alimentation continue en eau osmosée depuis la citerne mobile' },
              { num: '04', title: 'Contrôle qualité', desc: 'Vérification et contrôles finaux avant départ' },
              { num: '05', title: 'Rapport détaillé', desc: 'Rapport avec photos, détection ombrages et panneaux endommagés' },
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
            Centrales difficiles d'accès ? <span className="text-[#fbbf24]">On s'en charge</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Expertise terrain marécageux et accidenté. Devis gratuit et intervention rapide sur toute la France.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}