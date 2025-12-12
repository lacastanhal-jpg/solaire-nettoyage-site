import Link from 'next/link'

export default function Certifications() {
  const certifications = [
    {
      category: 'CACES (Certificat d\'Aptitude à la Conduite En Sécurité)',
      items: [
        'PEMP CACES R486 - Plateformes Élévatrices Mobiles de Personnes',
        'CACES R482 Catégorie A - Engins compacts',
        'CACES R482 Catégorie F - Chariots de manutention tout-terrain',
      ]
    },
    {
      category: 'Habilitations Électriques',
      items: [
        'Habilitation électrique photovoltaïque B0 H0V BP',
        'Formation spécifique installations solaires',
      ]
    },
    {
      category: 'Sécurité & Travail en Hauteur',
      items: [
        'SST - Sauveteur Secouriste du Travail',
        'Habilitation travail en hauteur',
        'Port du harnais de sécurité',
        'Habilitation Élingage',
        'Chef de manœuvre',
      ]
    },
    {
      category: 'Sites à Hauts Risques (Exclusivité)',
      items: [
        'GIES 1 - Gestion Intervention Entreprises extérieures Seveso niveau 1',
        'GIES 2 - Gestion Intervention Entreprises extérieures Seveso niveau 2',
        'Seul prestataire en France avec certification complète GIES 1 & 2',
      ]
    },
    {
      category: 'Contrôles & Vérifications',
      items: [
        'VGP - Vérifications Générales Périodiques (tous les 6 mois)',
        'Contrôle matériel par organisme agréé',
        'Contrôle harnais et longes de sécurité',
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
              Nos Certifications
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Des équipes 100% certifiées pour garantir sécurité et professionnalisme sur tous vos chantiers
            </p>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Intro */}
          <div className="mb-16 max-w-4xl">
            <p className="text-lg text-gray-300 leading-relaxed">
              Solaire Nettoyage investit massivement dans la formation continue de ses équipes. 
              Toutes nos certifications sont maintenues à jour et nos équipements font l'objet 
              de contrôles réguliers par des organismes agréés.
            </p>
          </div>

          {/* Certifications */}
          <div className="space-y-12">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-dark-surface border border-white/8 p-8">
                <h2 className="text-2xl font-bold text-gold mb-6">{cert.category}</h2>
                <ul className="space-y-4">
                  {cert.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <span className="text-gold mt-1 text-xl">✓</span>
                      <span className="text-gray-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Exclusivité GIES */}
          <div className="mt-16 bg-gold/10 border-2 border-gold p-12">
            <div className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Exclusivité France
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Solaire Nettoyage est le <strong>seul prestataire en France</strong> disposant des 
                habilitations complètes GIES 1 & 2 pour intervenir sur l'ensemble des sites classés Seveso. 
                Cette certification exclusive nous permet d'intervenir sur les sites industriels à hauts risques 
                tels qu'ArcelorMittal et Safran Landing Systems.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 bg-navy p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Besoin d'un prestataire certifié ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Nos équipes certifiées interviennent partout en France avec un matériel contrôlé.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/#contact"
                className="bg-gold text-navy px-10 py-4 font-bold hover:bg-[#B8984E] transition-all inline-flex items-center gap-2"
              >
                Nous contacter
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a 
                href="tel:+33632134766"
                className="bg-transparent text-white px-10 py-4 font-bold border-2 border-white/30 hover:border-white transition-all"
              >
                06 32 13 47 66
              </a>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
