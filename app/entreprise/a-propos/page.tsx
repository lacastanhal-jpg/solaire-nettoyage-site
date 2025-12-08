import Link from 'next/link'

export default function APropos() {
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
              À propos de Solaire Nettoyage
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Leader français du nettoyage professionnel de panneaux photovoltaïques depuis 2016
            </p>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Notre histoire */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Notre histoire</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Créée en 2016, SAS Solaire Nettoyage (SIRET 820 504 421 00028) s'est rapidement imposée comme 
                le leader français du nettoyage professionnel de panneaux photovoltaïques.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Fort d'un investissement de 1,5 million d'euros en matériel de pointe et d'une expertise 
                reconnue sur plus de 3600 sites, nous sommes aujourd'hui le partenaire privilégié des plus 
                grands énergéticiens français.
              </p>
            </div>
          </div>

          {/* Nos valeurs */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8">Nos valeurs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-dark-surface border border-white/8 p-8">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-4">Excellence</h3>
                <p className="text-gray-400">
                  Matériel de pointe, équipes certifiées et processus rigoureux pour garantir 
                  la meilleure qualité d'intervention.
                </p>
              </div>

              <div className="bg-dark-surface border border-white/8 p-8">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-4">Sécurité</h3>
                <p className="text-gray-400">
                  Certifications CACES, GIES 1&2 pour sites Seveso, et respect strict des normes 
                  de sécurité sur tous nos chantiers.
                </p>
              </div>

              <div className="bg-dark-surface border border-white/8 p-8">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-4">Engagement</h3>
                <p className="text-gray-400">
                  Réactivité, disponibilité et relation de confiance avec nos clients pour 
                  des partenariats durables.
                </p>
              </div>
            </div>
          </div>

          {/* Nos moyens */}
          <div className="mb-20 bg-dark-surface border border-white/8 p-12">
            <h2 className="text-3xl font-bold text-white mb-8">Nos moyens</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gold mb-4">3 Équipes mobiles</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Semi-remorque 44T + Porteurs 26T</li>
                  <li>• Nacelles jusqu'à 20m (HA20, HA16)</li>
                  <li>• Robots Solar Cleano 3m30</li>
                  <li>• Cuves eau osmosée 8000-10000L</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gold mb-4">Capacités</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Jusqu'à 3000m²/heure</li>
                  <li>• 20 000m² de surface autonome</li>
                  <li>• Intervention toute France</li>
                  <li>• 3600+ sites nettoyés annuellement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Nos coordonnées */}
          <div className="bg-navy p-12">
            <h2 className="text-3xl font-bold text-white mb-8">Nous contacter</h2>
            <div className="grid md:grid-cols-2 gap-8 text-gray-300">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Siège social</h3>
                <p>SAS Solaire Nettoyage<br />
                SIRET: 820 504 421 00028<br />
                511 Impasse de Saint Rames<br />
                12220 Vaureilles, France</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Contact</h3>
                <p>Téléphone: <a href="tel:+33632134766" className="text-gold hover:text-white">06 32 13 47 66</a><br />
                Email: <a href="mailto:contact@solairenettoyage.fr" className="text-gold hover:text-white">contact@solairenettoyage.fr</a></p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
