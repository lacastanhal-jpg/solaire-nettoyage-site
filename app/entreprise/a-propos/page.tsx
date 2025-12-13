'use client'

import Link from 'next/link'

export default function AProposPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              DEPUIS 2016
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Solaire Nettoyage
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-4 leading-relaxed">
            Leader français du nettoyage professionnel de panneaux photovoltaïques
          </p>
          
          <p className="text-lg text-blue-200 mb-12">
            SAS Solaire Nettoyage - SIRET 820 504 421 00028
          </p>

          <Link 
            href="/#contact"
            className="bg-[#fbbf24] text-blue-900 px-10 py-4 text-base font-semibold hover:bg-[#fbbf24]/90 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            Nous contacter
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Notre <span className="text-[#fbbf24]">histoire</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-8 text-lg text-gray-700 leading-relaxed">
            <p>
              Créée en 2016, SAS Solaire Nettoyage s'est rapidement imposée comme le leader français 
              du nettoyage professionnel de panneaux photovoltaïques. Ce qui a commencé comme une entreprise 
              familiale père-fils s'est transformé en une référence nationale reconnue.
            </p>
            <p>
              Fort d'un investissement de <span className="text-blue-900 font-bold">1,5 million d'euros</span> en 
              matériel de pointe et d'une expertise reconnue sur plus de <span className="text-blue-900 font-bold">3 600 sites</span>, 
              nous sommes aujourd'hui le partenaire privilégié des plus grands énergéticiens français.
            </p>
            <p>
              Nos trois équipes professionnelles interviennent chaque année sur <span className="text-blue-900 font-bold">4 millions de m²</span> de 
              panneaux photovoltaïques, garantissant une production énergétique optimale à nos clients.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Nos <span className="text-[#fbbf24]">valeurs</span>
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
              <div key={idx} className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-6xl mb-6">{valeur.icon}</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{valeur.title}</h3>
                <p className="text-gray-600 leading-relaxed">{valeur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moyens */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Nos <span className="text-[#fbbf24]">moyens</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Matériel professionnel</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>3 équipes complètes avec matériel dédié</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>1 semi-remorque 44T + 2 porteurs 26T</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Robots Solar Cleano 3m (technologie unique)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Nacelles HA16, HA20 RTJ PRO, Matilsa 17m</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Tracteur Sunbrush pour terrains difficiles</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Équipe qualifiée</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>6 professionnels formés et certifiés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Certifications SST, CACES R486/R482</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Habilitations électriques B0 H0V BP</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>GIES 1&2 pour sites Seveso</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Formations continues et recyclages réguliers</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/20 border-2 border-[#fbbf24]/50 rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">1,5 M€</div>
                <p className="text-gray-700">Matériel pro</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">3 600+</div>
                <p className="text-gray-700">Sites nettoyés</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">4M m²</div>
                <p className="text-gray-700">Par an</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-blue-900 mb-2">2016</div>
                <p className="text-gray-700">Création</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Ils nous font <span className="text-[#fbbf24]">confiance</span>
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
              <div key={idx} className="bg-white border border-blue-200 rounded-xl p-6 text-center hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <p className="text-gray-700 font-semibold">{client}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-lg">
            Référencé exclusivement chez <span className="text-blue-900 font-bold">Coopérative U</span> pour le nettoyage des ombrières photovoltaïques
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Rejoignez nos <span className="text-[#fbbf24]">3 600+ clients</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Confiez le nettoyage de vos installations photovoltaïques au leader français. Devis gratuit sous 24h.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}