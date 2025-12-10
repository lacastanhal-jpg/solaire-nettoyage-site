'use client'

import Link from 'next/link'

export default function CentralesSolPage() {
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
            TERRAINS DIFFICILES
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Centrales Solaires au Sol
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Spécialistes du nettoyage de centrales en milieu marécageux ou accidenté avec tracteur Sunbrush haute performance
          </p>

          <Link href="/#contact" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Devis gratuit
          </Link>
        </div>
      </section>

      {/* Équipement */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Équipement <span className="text-yellow-500">spécialisé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">🚜</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Tracteur Sunbrush</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Fonctionne sur terrains accidentés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Adapté aux milieux marécageux</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Passe dans rangées de moins de 2 mètres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Nettoyage en continu sans interruption</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Citerne mobile</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>10 000L eau osmosée à 100%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Ravitaillement continu des tracteurs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Autonomie maximale sur site</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Citerne incendie sur demande</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>24/7</div>
                <p className="text-gray-300">Travail continu</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>&lt; 2m</div>
                <p className="text-gray-300">Largeur rangées</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>100%</div>
                <p className="text-gray-300">Terrains difficiles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos <span className="text-yellow-500">avantages</span>
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
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Déroulement de <span className="text-yellow-500">l'intervention</span>
          </h2>

          <div className="space-y-6">
            {[
              { num: '01', title: 'Sécurisation & déploiement', desc: 'Mise en place de la citerne et sécurisation de la zone' },
              { num: '02', title: 'Nettoyage continu', desc: 'Le Sunbrush travaille en continu sur tous types de terrains' },
              { num: '03', title: 'Ravitaillement', desc: 'Alimentation continue en eau osmosée depuis la citerne mobile' },
              { num: '04', title: 'Contrôle qualité', desc: 'Vérification et contrôles finaux avant départ' },
              { num: '05', title: 'Rapport détaillé', desc: 'Rapport avec photos, détection ombrages et panneaux endommagés' },
            ].map((step, idx) => (
              <div key={idx} className="bg-gradient-to-r from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold text-yellow-600/30" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-amber-600/20 to-yellow-600/20" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Centrales difficiles d'accès ? <span className="text-yellow-500">On s'en charge</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Expertise terrain marécageux et accidenté. Devis gratuit et intervention rapide sur toute la France.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
    </div>
  )
}
