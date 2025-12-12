'use client'

import Link from 'next/link'

export default function OmbrieresPage() {
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
            SERVICE ADAPTÉ
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Ombrières de Parking
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Nettoyage d'ombrières photovoltaïques pour supermarchés et zones commerciales avec interventions hors heures d'ouverture
          </p>

          <Link href="/#contact" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Devis gratuit
          </Link>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Notre <span className="text-yellow-500">approche</span>
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
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Nuit & Weekend</div>
                <p className="text-gray-300">Horaires adaptés</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>3000 m²/h</div>
                <p className="text-gray-300">Rapidité maximale</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>1000+</div>
                <p className="text-gray-300">Sites nettoyés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matériel */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Matériel <span className="text-yellow-500">spécialisé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Robot Solar Cleano</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Largeur 3 mètres - technologie unique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>100% eau osmosée - aucun produit chimique</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Nettoyage sans traces ni résidus</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Eau osmosée</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Cuves jusqu'à 10 000 litres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Osmoseur professionnel embarqué</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Autonomie complète sur site</span>
                </li>
              </ul>
            </div>
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
              { num: '01', title: 'Planification', desc: 'Nous définissons ensemble le créneau d\'intervention optimal (nuit ou weekend)' },
              { num: '02', title: 'Balisage', desc: 'Mise en place de cônes et signalisation pour sécuriser la zone de travail' },
              { num: '03', title: 'Nettoyage', desc: 'Robot radiocommandé avec eau osmosée, aucun contact avec les panneaux' },
              { num: '04', title: 'Contrôle', desc: 'Vérification finale et nettoyage de la zone d\'intervention' },
              { num: '05', title: 'Rapport', desc: 'Envoi instantané du rapport avec photos et recommandations' },
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
            Nettoyage d'ombrières <span className="text-yellow-500">sans contrainte</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Intervention adaptée à votre planning commercial. Devis gratuit sous 24h et aucun frais de déplacement.
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
