'use client'

import Link from 'next/link'

export default function CertificationsPage() {
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
            QUALIFICATIONS PROFESSIONNELLES
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Certifications
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Toutes nos équipes sont formées et certifiées pour intervenir en toute sécurité sur vos installations
          </p>
        </div>
      </section>

      {/* Certifications équipe */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Certifications <span className="text-yellow-500">équipe</span>
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
                icon: '🔐',
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
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl mb-4">{cert.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{cert.title}</h3>
                <p className="text-white font-semibold mb-2">{cert.name}</p>
                <p className="text-gray-400 text-sm">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EPI */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Équipements de <span className="text-yellow-500">protection</span>
          </h2>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 md:p-12">
            <p className="text-lg text-gray-300 mb-8 text-center">
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
                <div key={idx} className="flex items-center gap-4 bg-black/50 border border-yellow-600/20 rounded-lg p-4 hover:border-yellow-600 transition-all">
                  <span className="text-3xl">{epi.icon}</span>
                  <span className="text-gray-300">{epi.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Matériel contrôlé */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Matériel <span className="text-yellow-500">contrôlé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">VGP - Vérifications Générales Périodiques</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Contrôles tous les 6 mois par organisme agréé</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Nacelles HA16, HA20 RTJ PRO, Matilsa 17m</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Camions et engins de chantier</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Documentation complète disponible</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Harnais et EPI</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Contrôles visuels avant chaque utilisation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Vérifications périodiques tous les 6 mois</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Harnais, longes, antichutes certifiés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Traçabilité complète des équipements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Conformité totale</h3>
            <p className="text-xl text-gray-300">
              Tous nos équipements sont conformes aux normes en vigueur et contrôlés régulièrement
            </p>
          </div>
        </div>
      </section>

      {/* Formations */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Formation <span className="text-yellow-500">continue</span>
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
              <div key={idx} className="bg-gradient-to-r from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{formation.title}</h3>
                <p className="text-gray-400">{formation.desc}</p>
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
            Des équipes <span className="text-yellow-500">certifiées</span> pour votre sécurité
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Toutes nos interventions respectent les normes de sécurité les plus strictes
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Demander un devis
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
    </div>
  )
}
