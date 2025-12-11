'use client'

import Link from 'next/link'

export default function CarrieresPage() {
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
            REJOIGNEZ-NOUS
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Carrières
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Rejoignez le leader français du nettoyage photovoltaïque et participez à la transition énergétique
          </p>

          <Link href="/#contact" className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-bold rounded-lg hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105">
            Postuler
          </Link>
        </div>
      </section>

      {/* Pourquoi nous */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pourquoi <span className="text-yellow-500">Solaire Nettoyage</span> ?
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
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-6xl mb-6">{raison.icon}</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">{raison.title}</h3>
                <p className="text-gray-400 leading-relaxed">{raison.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profils recherchés */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Profils <span className="text-yellow-500">recherchés</span>
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
              <div key={idx} className="bg-gradient-to-r from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{poste.title}</h3>
                    <span className="inline-block px-4 py-1 bg-yellow-600/20 border border-yellow-600 rounded-full text-yellow-400 text-sm font-bold">
                      {poste.type}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{poste.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {poste.competences.map((comp, i) => (
                    <span key={i} className="px-3 py-1 bg-black border border-yellow-600/20 rounded-lg text-sm text-gray-400">
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
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos <span className="text-yellow-500">avantages</span>
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
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{avantage.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{avantage.title}</h3>
                    <p className="text-gray-400">{avantage.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processus recrutement */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Processus de <span className="text-yellow-500">recrutement</span>
          </h2>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { num: '01', title: 'Candidature', desc: 'Envoyez votre CV et lettre de motivation par email' },
              { num: '02', title: 'Premier contact', desc: 'Échange téléphonique pour discuter de votre profil' },
              { num: '03', title: 'Entretien', desc: 'Rencontre avec le dirigeant pour présenter l\'entreprise' },
              { num: '04', title: 'Intégration', desc: 'Formation terrain avec un technicien expérimenté' }
            ].map((etape, idx) => (
              <div key={idx} className="bg-gradient-to-r from-gray-900 to-black border border-yellow-600/20 rounded-xl p-6 hover:border-yellow-600 transition-all">
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-bold text-yellow-600/30" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {etape.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{etape.title}</h3>
                    <p className="text-gray-400">{etape.desc}</p>
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
            Prêt à nous <span className="text-yellow-500">rejoindre</span> ?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Envoyez votre candidature à :
          </p>
          
          <a href="mailto:contact@solairenettoyage.fr" className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 mb-6">
            contact@solairenettoyage.fr
          </a>

          <p className="text-gray-400 text-lg">
            Ou appelez-nous au <a href="tel:+33632134766" className="text-yellow-400 hover:text-yellow-300">06 32 13 47 66</a>
          </p>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
    </div>
  )
}
