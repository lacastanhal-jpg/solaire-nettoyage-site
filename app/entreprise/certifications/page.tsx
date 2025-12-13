'use client'

import Link from 'next/link'

export default function CertificationsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              QUALIFICATIONS PROFESSIONNELLES
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Certifications
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Toutes nos équipes sont formées et certifiées pour intervenir en toute sécurité sur vos installations
          </p>
        </div>
      </section>

      {/* Certifications équipe */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Certifications <span className="text-[#fbbf24]">équipe</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🏥',
                title: 'SST',
                name: 'Sauveteur Secouriste du Travail',
                desc: 'Formation aux premiers secours en entreprise'
              },
              {
                icon: '⚡',
                title: 'Habilitation électrique',
                name: 'B0 H0V BP photovoltaïque',
                desc: 'Travaux au voisinage d\'installations photovoltaïques'
              },
              {
                icon: '🏗️',
                title: 'CACES R486',
                name: 'Plateformes élévatrices mobiles',
                desc: 'Conduite de nacelles PEMP en sécurité'
              },
              {
                icon: '🚜',
                title: 'CACES R482',
                name: 'Catégories A et F',
                desc: 'Engins de chantier compacts et lourds'
              },
              {
                icon: '⛑️',
                title: 'Travail en hauteur',
                name: 'Port du harnais',
                desc: 'Protection contre les chutes de hauteur'
              },
              {
                icon: '🔧',
                title: 'Habilitation élingueur',
                name: 'Chef de manœuvre',
                desc: 'Levage et manutention en sécurité'
              },
              {
                icon: '🛡️',
                title: 'GIES 1 et 2',
                name: 'Sites Seveso',
                desc: 'Intervention sur sites classés haute sécurité'
              },
              {
                icon: '🏭',
                title: 'VGP',
                name: 'Vérifications périodiques',
                desc: 'Matériel contrôlé tous les 6 mois'
              },
              {
                icon: '📋',
                title: 'Plan de prévention',
                name: 'Analyse des risques',
                desc: 'Protocoles adaptés à chaque site'
              }
            ].map((cert, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-5xl mb-4">{cert.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{cert.title}</h3>
                <p className="text-gray-900 font-semibold mb-2">{cert.name}</p>
                <p className="text-gray-600 text-sm">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EPI */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Équipements de <span className="text-[#fbbf24]">protection</span>
          </h2>

          <div className="bg-white border border-blue-200 rounded-2xl p-8 md:p-12">
            <p className="text-lg text-gray-700 mb-8 text-center">
              Tous nos techniciens sont équipés d'EPI certifiés et portent des tenues de travail identiques floquées
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '⛑️', title: 'Casques avec jugulaire' },
                { icon: '👞', title: 'Chaussures de sécurité S3' },
                { icon: '🦺', title: 'Tenues haute visibilité floquées' },
                { icon: '🪢', title: 'Harnais anti-chute certifiés' },
                { icon: '🕶️', title: 'Lunettes anti-UV et reflets' },
                { icon: '🧤', title: 'Gants de protection adaptés' }
              ].map((epi, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4 hover:border-[#fbbf24] transition-all">
                  <span className="text-3xl">{epi.icon}</span>
                  <span className="text-gray-700">{epi.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Matériel contrôlé */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Matériel <span className="text-[#fbbf24]">contrôlé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">VGP - Vérifications Générales Périodiques</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Contrôles tous les 6 mois par organisme agréé</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Nacelles HA16, HA20 RTJ PRO, Matilsa 17m</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Camions et engins de chantier</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Documentation complète disponible</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Harnais et EPI</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Contrôles visuels avant chaque utilisation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Vérifications périodiques tous les 6 mois</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Harnais, longes, antichutes certifiés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Traçabilité complète des équipements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/20 border-2 border-[#fbbf24]/50 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-4">Conformité totale</h3>
            <p className="text-xl text-gray-700">
              Tous nos équipements sont conformes aux normes en vigueur et contrôlés régulièrement
            </p>
          </div>
        </div>
      </section>

      {/* Formations */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Formation <span className="text-[#fbbf24]">continue</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                title: 'Recyclages réguliers',
                desc: 'Toutes les certifications sont recyclées avant leur date d\'expiration'
              },
              {
                title: 'Veille réglementaire',
                desc: 'Suivi des évolutions des normes et réglementations en vigueur'
              },
              {
                title: 'Formations spécifiques',
                desc: 'Adaptées aux nouveaux équipements et techniques de nettoyage'
              },
              {
                title: 'Retours d\'expérience',
                desc: 'Partage des bonnes pratiques et analyse des situations à risque'
              }
            ].map((formation, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{formation.title}</h3>
                <p className="text-gray-600">{formation.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Des équipes <span className="text-[#fbbf24]">certifiées</span> pour votre sécurité
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Toutes nos interventions respectent les normes de sécurité les plus strictes
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis
          </Link>
        </div>
      </section>
    </div>
  )
}