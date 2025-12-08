import Link from 'next/link'

export default function Carrieres() {
  const avantages = [
    {
      icon: '💼',
      title: 'CDI stable',
      description: 'Des postes en CDI dans une entreprise en croissance continue depuis 2016'
    },
    {
      icon: '🎓',
      title: 'Formation continue',
      description: 'Financeme des certifications CACES, GIES, SST et formations spécialisées'
    },
    {
      icon: '🚗',
      title: 'Matériel de pointe',
      description: '1,5M€ d\'équipement professionnel : nacelles, robots, véhicules neufs'
    },
    {
      icon: '👥',
      title: 'Équipe soudée',
      description: 'Ambiance de travail conviviale au sein d\'équipes mobiles autonomes'
    },
    {
      icon: '💰',
      title: 'Rémunération attractive',
      description: 'Salaire compétitif avec primes de chantier et d\'astreinte'
    },
    {
      icon: '📈',
      title: 'Évolution',
      description: 'Possibilités d\'évolution vers chef d\'équipe ou responsable de secteur'
    },
  ]

  const profils = [
    {
      title: 'Technicien de maintenance',
      requirements: [
        'Permis B obligatoire',
        'CACES R486 (PEMP) souhaité ou formation assurée',
        'Expérience en travaux en hauteur appréciée',
        'Autonomie et rigueur',
      ]
    },
    {
      title: 'Chef d\'équipe',
      requirements: [
        'Expérience management d\'équipe',
        'CACES R486 et R482 obligatoires',
        'Habilitations électriques',
        'Sens des responsabilités et organisation',
      ]
    },
    {
      title: 'Conducteur poids lourd',
      requirements: [
        'Permis CE (semi-remorque) ou C (porteur)',
        'CACES R486 souhaité',
        'Expérience conduite PL',
        'Polyvalence et adaptabilité',
      ]
    },
  ]

  return (
    <main className="bg-dark-bg pt-24">
      {/* Hero */}
      <section className="bg-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Link href="/" className="text-gold hover:text-white transition-colors text-sm mb-4 inline-block">
              ← Retour à l'accueil
            </Link>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
              Rejoignez-nous
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Intégrez le leader français du nettoyage photovoltaïque et participez à la transition énergétique
            </p>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Intro */}
          <div className="mb-16 max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-6">Pourquoi Solaire Nettoyage ?</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              En rejoignant Solaire Nettoyage, vous intégrez une entreprise dynamique et innovante, 
              leader sur son marché. Nous recherchons des professionnels motivés pour accompagner 
              notre croissance et contribuer au développement des énergies renouvelables en France.
            </p>
          </div>

          {/* Avantages */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Nos avantages</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {avantages.map((avantage, index) => (
                <div key={index} className="bg-dark-surface border border-white/8 p-6 hover:border-gold/30 transition-all">
                  <div className="text-4xl mb-4">{avantage.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{avantage.title}</h3>
                  <p className="text-gray-400">{avantage.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Profils recherchés */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Profils recherchés</h2>
            <div className="space-y-6">
              {profils.map((profil, index) => (
                <div key={index} className="bg-dark-surface border border-white/8 p-8">
                  <h3 className="text-2xl font-bold text-gold mb-6">{profil.title}</h3>
                  <ul className="space-y-3">
                    {profil.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-gold mt-1">✓</span>
                        <span className="text-gray-300 text-lg">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Process de recrutement */}
          <div className="mb-20 bg-navy p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Notre process de recrutement</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-white mb-2">1. Candidature</h3>
                <p className="text-gray-300">Envoyez CV + lettre de motivation</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📞</div>
                <h3 className="text-xl font-bold text-white mb-2">2. Pré-sélection</h3>
                <p className="text-gray-300">Entretien téléphonique</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-2">3. Rencontre</h3>
                <p className="text-gray-300">Entretien physique</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-white mb-2">4. Intégration</h3>
                <p className="text-gray-300">Formation et accompagnement</p>
              </div>
            </div>
          </div>

          {/* Candidature */}
          <div className="bg-dark-surface border border-white/8 p-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Postuler</h2>
            <p className="text-lg text-gray-300 text-center mb-8 max-w-2xl mx-auto">
              Vous pensez correspondre à l'un de nos profils ? N'hésitez pas à nous envoyer 
              votre candidature spontanée.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-navy p-8 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Envoyez votre candidature :</h3>
                <div className="space-y-3 text-gray-300">
                  <p>📧 Email : <a href="mailto:recrutement@solairenettoyage.fr" className="text-gold hover:text-white">recrutement@solairenettoyage.fr</a></p>
                  <p>📞 Téléphone : <a href="tel:+33632134766" className="text-gold hover:text-white">06 32 13 47 66</a></p>
                  <p className="text-sm text-gray-400 mt-4">
                    * Merci de préciser le poste visé et votre disponibilité
                  </p>
                </div>
              </div>

              <div className="text-center">
                <a 
                  href="mailto:recrutement@solairenettoyage.fr?subject=Candidature spontanée"
                  className="bg-gold text-navy px-10 py-4 font-bold hover:bg-[#B8984E] transition-all inline-flex items-center gap-2"
                >
                  Envoyer ma candidature
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
