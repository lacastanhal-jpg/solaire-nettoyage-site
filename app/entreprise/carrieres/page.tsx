'use client'

import Link from 'next/link'

export default function CarrieresPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              REJOIGNEZ-NOUS
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Carrières
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Rejoignez le leader français du nettoyage photovoltaïque et participez à la transition énergétique
          </p>

          <Link 
            href="/#contact"
            className="bg-[#fbbf24] text-blue-900 px-10 py-4 text-base font-semibold hover:bg-[#fbbf24]/90 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            Postuler
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Pourquoi <span className="text-[#fbbf24]">Solaire Nettoyage</span> ?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Leader du marché',
                desc: 'Rejoignez le n°1 français avec 3 600+ sites et un parc matériel de 1,5 M€'
              },
              {
                icon: '📈',
                title: 'Entreprise en croissance',
                desc: 'Développement continu depuis 2016 avec de nouveaux clients chaque année'
              },
              {
                icon: '🎓',
                title: 'Formations certifiantes',
                desc: 'Toutes les formations nécessaires prises en charge (CACES, SST, habilitations)'
              },
              {
                icon: '🛠️',
                title: 'Matériel professionnel',
                desc: 'Équipements de pointe : robots Solar Cleano, nacelles dernière génération'
              },
              {
                icon: '👥',
                title: 'Équipe soudée',
                desc: 'Ambiance familiale avec entraide et partage d\'expérience au quotidien'
              },
              {
                icon: '🌍',
                title: 'Impact écologique',
                desc: 'Participez à l\'optimisation de la production d\'énergie solaire en France'
              }
            ].map((raison, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-6xl mb-6">{raison.icon}</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{raison.title}</h3>
                <p className="text-gray-600 leading-relaxed">{raison.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profils recherchés */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Profils <span className="text-[#fbbf24]">recherchés</span>
          </h2>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Technicien de nettoyage photovoltaïque',
                type: 'CDI',
                desc: 'Intervention sur sites industriels et commerciaux. Déplacements France entière. Permis B requis.',
                competences: ['CACES souhaité', 'Travail en hauteur', 'Autonomie', 'Rigueur']
              },
              {
                title: 'Chef d\'équipe',
                type: 'CDI',
                desc: 'Coordination d\'une équipe de 2-3 personnes. Planification interventions et relation client.',
                competences: ['Expérience management', 'CACES R486/R482', 'Sens relationnel', 'Organisation']
              },
              {
                title: 'Conducteur de nacelle',
                type: 'CDI',
                desc: 'Conduite nacelles 16-20m pour nettoyage toitures. Formation CACES R486 prise en charge si besoin.',
                competences: ['Permis B', 'Aisance en hauteur', 'Précision', 'Sécurité']
              }
            ].map((poste, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">{poste.title}</h3>
                    <span className="inline-block px-4 py-1 bg-[#fbbf24]/20 border border-[#fbbf24] rounded-full text-blue-900 text-sm font-bold">
                      {poste.type}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{poste.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {poste.competences.map((comp, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-600">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Nos <span className="text-[#fbbf24]">avantages</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '💰', title: 'Salaire attractif', desc: 'Rémunération compétitive selon profil et expérience' },
              { icon: '🚗', title: 'Véhicule de service', desc: 'Mise à disposition pour déplacements professionnels' },
              { icon: '🏥', title: 'Mutuelle', desc: 'Complémentaire santé prise en charge' },
              { icon: '📚', title: 'Formations', desc: 'Toutes les certifications prises en charge par l\'entreprise' },
              { icon: '⏰', title: 'Horaires flexibles', desc: 'Adaptés selon les chantiers (journée, nuit, weekend)' },
              { icon: '🎯', title: 'Évolution', desc: 'Possibilités d\'évolution vers chef d\'équipe ou responsable' }
            ].map((avantage, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{avantage.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{avantage.title}</h3>
                    <p className="text-gray-600">{avantage.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processus recrutement */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Processus de <span className="text-[#fbbf24]">recrutement</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { num: '01', title: 'Candidature', desc: 'Envoyez votre CV et lettre de motivation par email' },
              { num: '02', title: 'Premier contact', desc: 'Échange téléphonique pour discuter de votre profil' },
              { num: '03', title: 'Entretien', desc: 'Rencontre avec le dirigeant pour présenter l\'entreprise' },
              { num: '04', title: 'Intégration', desc: 'Formation terrain avec un technicien expérimenté' }
            ].map((etape, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all">
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold text-[#fbbf24]/30">
                    {etape.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">{etape.title}</h3>
                    <p className="text-gray-600">{etape.desc}</p>
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
            Prêt à nous <span className="text-[#fbbf24]">rejoindre</span> ?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Envoyez votre candidature à :
          </p>
          
          <a href="mailto:contact@solairenettoyage.fr" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105 mb-6">
            contact@solairenettoyage.fr
          </a>

          <p className="text-blue-100 text-lg">
            Ou appelez-nous au <a href="tel:+33632134766" className="text-[#fbbf24] hover:text-[#fbbf24]/80">06 32 13 47 66</a>
          </p>
        </div>
      </section>
    </div>
  )
}