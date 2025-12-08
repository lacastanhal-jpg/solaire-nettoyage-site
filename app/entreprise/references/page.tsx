import Link from 'next/link'

export default function References() {
  const majors = [
    'EDF Solutions Solaires',
    'ENGIE Green',
    'TotalEnergies',
    'CGN Europe Energy',
  ]

  const producteurs = [
    'JPEE',
    'Idex Solar',
    'GreenYellow',
    'Tenergie',
    'Séolis',
    'Mecojit',
    'Coopérative U',
  ]

  const seveso = [
    'ArcelorMittal',
    'Safran Landing Systems',
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
              Nos Références
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              La confiance des leaders de l'énergie et de l'industrie française
            </p>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Intro */}
          <div className="mb-16 max-w-4xl">
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              Depuis 2016, Solaire Nettoyage a l'honneur d'être le partenaire privilégié des plus grands 
              énergéticiens et industriels français.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Avec plus de 3600 sites nettoyés annuellement, notre expertise et notre professionnalisme 
              nous ont permis de construire des relations durables avec nos clients.
            </p>
          </div>

          {/* Majors */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Majors de l'énergie</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {majors.map((client, index) => (
                <div 
                  key={index}
                  className="bg-dark-surface border border-white/8 p-8 hover:border-gold/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">⭐</div>
                    <h3 className="text-2xl font-bold text-white">{client}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Producteurs */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Producteurs & Installateurs</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {producteurs.map((client, index) => (
                <div 
                  key={index}
                  className="bg-dark-surface border border-white/8 p-6 hover:border-gold/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gold text-2xl">✓</span>
                    <h3 className="text-lg font-bold text-white">{client}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sites Seveso */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Sites Seveso</h2>
            <div className="bg-gold/10 border-2 border-gold p-8 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">🏆</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Exclusivité GIES 1 & 2</h3>
                  <p className="text-gray-200">
                    Seul prestataire en France habilité pour l'ensemble des sites classés Seveso
                  </p>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {seveso.map((client, index) => (
                <div 
                  key={index}
                  className="bg-dark-surface border border-white/8 p-8 hover:border-gold/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🛡️</div>
                    <h3 className="text-2xl font-bold text-white">{client}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="bg-navy p-12 mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Notre activité en chiffres</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-gold mb-2">3600+</div>
                <div className="text-gray-300">Sites nettoyés / an</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gold mb-2">13</div>
                <div className="text-gray-300">Clients majeurs</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gold mb-2">8 ans</div>
                <div className="text-gray-300">D'expérience</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-gold mb-2">1,5M€</div>
                <div className="text-gray-300">Parc matériel</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-dark-surface border border-white/8 p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Rejoignez nos clients
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Bénéficiez de l'expertise du leader français du nettoyage photovoltaïque
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/#contact"
                className="bg-gold text-navy px-10 py-4 font-bold hover:bg-[#B8984E] transition-all inline-flex items-center gap-2"
              >
                Demander un devis
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
