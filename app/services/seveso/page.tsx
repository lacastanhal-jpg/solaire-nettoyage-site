'use client'

import Link from 'next/link'

export default function SevesoPage() {
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
            HAUTE SÉCURITÉ
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Sites Seveso
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Habilités pour intervenir sur sites classés Seveso avec certifications GIES 1 & 2 et protocoles de sécurité renforcés
          </p>

          <Link href="/#contact" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Devis gratuit
          </Link>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Certifications <span className="text-yellow-500">haute sécurité</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🛡️', title: 'GIES 1 & 2', desc: 'Habilitation sites Seveso seuil haut et bas' },
              { icon: '⚡', title: 'Habilitation électrique', desc: 'B0 H0V BP photovoltaïque certifiée' },
              { icon: '🏗️', title: 'CACES R486/R482', desc: 'Nacelles et engins de chantier' },
              { icon: '⛑️', title: 'Travail en hauteur', desc: 'Port du harnais et sécurité certifiés' },
              { icon: '🏥', title: 'SST', desc: 'Sauveteur Secouriste du Travail' },
              { icon: '🔐', title: 'Chef de manœuvre', desc: 'Habilitation élingueur et chef de manœuvre' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-2 border-yellow-500/50 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Tous nos techniciens sont certifiés</h3>
            <p className="text-xl text-gray-300">
              Formations régulières et habilitations à jour pour garantir la sécurité sur sites sensibles
            </p>
          </div>
        </div>
      </section>

      {/* Protocoles */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Protocoles de <span className="text-yellow-500">sécurité</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Avant intervention</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Plan de prévention validé</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Analyse des risques spécifiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Permis de travail obtenu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Briefing sécurité obligatoire</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Pendant intervention</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>EPI certifiés portés en permanence</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Balisage renforcé de la zone</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Communication radio continue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-1">✓</span>
                  <span>Respect strict des consignes site</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
            <div className="text-5xl mb-4">🏭</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">EPI spécifiques</h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500">✓</span>
                <span>Casques avec jugulaire</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500">✓</span>
                <span>Chaussures sécurité S3</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500">✓</span>
                <span>Tenues haute visibilité floquées</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500">✓</span>
                <span>Harnais anti-chute certifiés</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500">✓</span>
                <span>Lunettes anti-UV et reflets</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-500">✓</span>
                <span>Gants adaptés aux risques</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matériel */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Matériel <span className="text-yellow-500">contrôlé</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">VGP à jour</h3>
              <p className="text-gray-400">Vérification Générale Périodique tous les 6 mois par organisme agréé</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Nacelles certifiées</h3>
              <p className="text-gray-400">Conformité APSAD et contrôles réguliers documentés</p>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300">
              <div className="text-5xl mb-4">⛑️</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">EPI contrôlés</h3>
              <p className="text-gray-400">Harnais et longes vérifiés tous les 6 mois</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-amber-600/20 to-yellow-600/20" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Site Seveso ? <span className="text-yellow-500">Nous sommes habilités</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Certifications GIES 1 & 2, protocoles renforcés et équipe formée aux sites haute sécurité. Devis gratuit.
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
