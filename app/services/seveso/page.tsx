'use client'

import Link from 'next/link'

export default function SevesoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              HAUTE SÉCURITÉ
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Sites Seveso
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Habilités pour intervenir sur sites classés Seveso avec certifications GIES 1 & 2 et protocoles de sécurité renforcés
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

      {/* Certifications */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Certifications <span className="text-[#fbbf24]">haute sécurité</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '🛡️', title: 'GIES 1 & 2', desc: 'Habilitation sites Seveso seuil haut et bas' },
              { icon: '⚡', title: 'Habilitation électrique', desc: 'B0 H0V BP photovoltaïque certifiée' },
              { icon: '🏗️', title: 'CACES R486/R482', desc: 'Nacelles et engins de chantier' },
              { icon: '⛑️', title: 'Travail en hauteur', desc: 'Port du harnais et sécurité certifiés' },
              { icon: '🏥', title: 'SST', desc: 'Sauveteur Secouriste du Travail' },
              { icon: '🔧', title: 'Chef de manœuvre', desc: 'Habilitation élingueur et chef de manœuvre' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#fbbf24]/20 border-2 border-[#fbbf24]/50 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-blue-900 mb-4">Tous nos techniciens sont certifiés</h3>
            <p className="text-xl text-gray-700">
              Formations régulières et habilitations à jour pour garantir la sécurité sur sites sensibles
            </p>
          </div>
        </div>
      </section>

      {/* Protocoles */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Protocoles de <span className="text-[#fbbf24]">sécurité</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Avant intervention</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Plan de prévention validé</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Analyse des risques spécifiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Permis de travail obtenu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Briefing sécurité obligatoire</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Pendant intervention</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>EPI certifiés portés en permanence</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Balisage renforcé de la zone</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Communication radio continue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#fbbf24] mt-1">✓</span>
                  <span>Respect strict des consignes site</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-blue-200 rounded-2xl p-8">
            <div className="text-5xl mb-4">🏭</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">EPI spécifiques</h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-[#fbbf24]">✓</span>
                <span>Casques avec jugulaire</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fbbf24]">✓</span>
                <span>Chaussures sécurité S3</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fbbf24]">✓</span>
                <span>Tenues haute visibilité floquées</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fbbf24]">✓</span>
                <span>Harnais anti-chute certifiés</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fbbf24]">✓</span>
                <span>Lunettes anti-UV et reflets</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#fbbf24]">✓</span>
                <span>Gants adaptés aux risques</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matériel */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Matériel <span className="text-[#fbbf24]">contrôlé</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">VGP à jour</h3>
              <p className="text-gray-600">Vérification Générale Périodique tous les 6 mois par organisme agréé</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Nacelles certifiées</h3>
              <p className="text-gray-600">Conformité APSAD et contrôles réguliers documentés</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
              <div className="text-5xl mb-4">⛑️</div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">EPI contrôlés</h3>
              <p className="text-gray-600">Harnais et longes vérifiés tous les 6 mois</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-blue-400">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Site Seveso ? <span className="text-[#fbbf24]">Nous sommes habilités</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Certifications GIES 1 & 2, protocoles renforcés et équipe formée aux sites haute sécurité. Devis gratuit.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}