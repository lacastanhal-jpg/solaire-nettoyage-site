'use client'

import Link from 'next/link'

export default function AProposPage() {
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
            DEPUIS 2016
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Solaire Nettoyage
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
            Leader français du nettoyage professionnel de panneaux photovoltaïques
          </p>
          
          <p className="text-lg text-gray-400 mb-12">
            SAS Solaire Nettoyage - SIRET 820 504 421 00028
          </p>

          <Link href="/#contact" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Nous contacter
          </Link>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Notre <span className="text-yellow-500">histoire</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-8 text-lg text-gray-300 leading-relaxed">
            <p>
              Créée en 2016, SAS Solaire Nettoyage s'est rapidement imposée comme le leader français 
              du nettoyage professionnel de panneaux photovoltaïques. Ce qui a commencé comme une entreprise 
              familiale père-fils s'est transformé en une référence nationale reconnue.
            </p>
            <p>
              Fort d'un investissement de <span className="text-yellow-400 font-bold">1,5 million d'euros</span> en 
              matériel de pointe et d'une expertise reconnue sur plus de <span className="text-yellow-400 font-bold">3 600 sites</span>, 
              nous sommes aujourd'hui le partenaire privilégié des plus grands énergéticiens français.
            </p>
            <p>
              Nos trois équipes professionnelles interviennent chaque année sur <span className="text-yellow-400 font-bold">4 millions de m²</span> de 
              panneaux photovoltaïques, garantissant une production énergétique optimale à nos clients.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos <span className="text-yellow-500">valeurs</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Excellence',
                desc: 'Matériel de pointe, équipes certifiées et processus rigoureux pour garantir la meilleure qualité d\'intervention sur chaque chantier.'
              },
              {
                icon: '🛡️',
                title: 'Sécurité',
                desc: 'Certifications CACES R486/R482, GIES 1&2 pour sites Seveso, et respect strict des normes de sécurité sur tous nos chantiers.'
              },
              {
                icon: '🤝',
                title: 'Engagement',
                desc: 'Réactivité, disponibilité et relation de confiance avec nos clients pour bâtir des partenariats durables et solides.'
              }
            ].map((valeur, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-6xl mb-6">{valeur.icon}</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">{valeur.title}</h3>
                <p className="text-gray-400 leading-relaxed">{valeur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moyens */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos <span className="text-yellow-500">moyens</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Matériel professionnel</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>3 équipes complètes avec matériel dédié</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>1 semi-remorque 44T + 2 porteurs 26T</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Robots Solar Cleano 3m (technologie unique)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Nacelles HA16, HA20 RTJ PRO, Matilsa 17m</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Tracteur Sunbrush pour terrains difficiles</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Équipe qualifiée</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>6 professionnels formés et certifiés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Certifications SST, CACES R486/R482</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Habilitations électriques B0 H0V BP</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>GIES 1&2 pour sites Seveso</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Formations continues et recyclages réguliers</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50 rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>1,5 M€</div>
                <p className="text-gray-300">Matériel pro</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>3 600+</div>
                <p className="text-gray-300">Sites nettoyés</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>4M m²</div>
                <p className="text-gray-300">Par an</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>2016</div>
                <p className="text-gray-300">Création</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ils nous font <span className="text-yellow-500">confiance</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              'EDF Solutions Solaires',
              'ENGIE Green France',
              'TotalEnergies',
              'CGN Europe Energy',
              'Coopérative U',
              'Ombrière Concept',
              'Générale du Solaire',
              'Albioma'
            ].map((client, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 text-center hover:border-yellow-600 transition-all duration-300">
                <p className="text-gray-300 font-semibold">{client}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-lg">
            Référencé exclusivement chez <span className="text-yellow-400 font-bold">Coopérative U</span> pour le nettoyage des ombrières photovoltaïques
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-amber-600/20 to-yellow-600/20" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Rejoignez nos <span className="text-yellow-500">3 600+ clients</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Confiez le nettoyage de vos installations photovoltaïques au leader français. Devis gratuit sous 24h.
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
