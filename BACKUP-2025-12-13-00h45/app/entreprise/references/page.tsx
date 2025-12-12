'use client'

import Link from 'next/link'

export default function ReferencesPage() {
  const clients = [
    {
      name: 'EDF Solutions Solaires',
      category: 'Énergéticien majeur',
      desc: 'Partenaire historique depuis 2018'
    },
    {
      name: 'ENGIE Green France',
      category: 'Énergies renouvelables',
      desc: 'Interventions nationales régulières'
    },
    {
      name: 'TotalEnergies',
      category: 'Groupe énergétique',
      desc: 'Centrales sol et toitures industrielles'
    },
    {
      name: 'CGN Europe Energy',
      category: 'Producteur indépendant',
      desc: 'Contrats de maintenance pluriannuels'
    },
    {
      name: 'Coopérative U',
      category: 'Distribution',
      desc: 'Référencé exclusivement pour les ombrières'
    },
    {
      name: 'Ombrière Concept',
      category: 'Constructeur',
      desc: 'Maintenance post-installation'
    },
    {
      name: 'Générale du Solaire',
      category: 'Producteur',
      desc: 'Interventions terrains difficiles'
    },
    {
      name: 'Albioma',
      category: 'Énergies renouvelables',
      desc: 'Sites Seveso et industriels'
    }
  ]

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
            NOS CLIENTS
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Références
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
            Plus de 3 600 sites nettoyés pour les plus grands acteurs de l'énergie photovoltaïque en France
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {[
              { value: '3 600+', label: 'Sites nettoyés' },
              { value: '4M m²', label: 'Par an' },
              { value: '8+', label: 'Grands clients' },
              { value: '100%', label: 'France entière' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-6xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {stat.value}
                </div>
                <p className="text-gray-300 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos <span className="text-yellow-500">clients</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {clients.map((client, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">{client.name}</h3>
                <p className="text-yellow-400 font-semibold mb-3">{client.category}</p>
                <p className="text-gray-400">{client.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secteurs */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nos <span className="text-yellow-500">secteurs</span> d'intervention
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏭',
                title: 'Industriel',
                desc: 'Toitures usines, hangars agricoles, entrepôts logistiques'
              },
              {
                icon: '🏬',
                title: 'Commercial',
                desc: 'Ombrières supermarchés, centres commerciaux, parkings'
              },
              {
                icon: '⚡',
                title: 'Centrales au sol',
                desc: 'Terrains plats, marécageux ou accidentés de toutes tailles'
              },
              {
                icon: '🛡️',
                title: 'Sites Seveso',
                desc: 'Sites classés haute sécurité avec certifications GIES 1&2'
              },
              {
                icon: '🚛',
                title: 'Logistique',
                desc: 'Plateformes logistiques, entrepôts, zones de stockage'
              },
              {
                icon: '🌾',
                title: 'Agricole',
                desc: 'Hangars, bâtiments d\'élevage, serres photovoltaïques'
              }
            ].map((secteur, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-xl p-6 hover:border-yellow-600 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl mb-4">{secteur.icon}</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">{secteur.title}</h3>
                <p className="text-gray-400">{secteur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ce qu'ils <span className="text-yellow-500">disent</span> de nous
          </h2>

          <div className="space-y-8">
            {[
              {
                quote: "Partenaire fiable et réactif depuis plusieurs années. Le matériel professionnel et l'expertise technique font la différence.",
                author: 'Responsable maintenance',
                company: 'EDF Solutions Solaires'
              },
              {
                quote: "La qualité d'intervention et le respect des normes de sécurité sur nos sites Seveso sont irréprochables.",
                author: 'Chef de projet',
                company: 'Albioma'
              },
              {
                quote: "Interventions de nuit sur nos parkings sans aucune gêne pour nos clients. Service impeccable.",
                author: 'Directeur technique',
                company: 'Coopérative U'
              }
            ].map((temoignage, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8 hover:border-yellow-600 transition-all duration-300">
                <p className="text-lg text-gray-300 italic mb-6 leading-relaxed">
                  "{temoignage.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{temoignage.author}</p>
                    <p className="text-yellow-400 text-sm">{temoignage.company}</p>
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
            Rejoignez nos <span className="text-yellow-500">clients prestigieux</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Faites confiance au leader français du nettoyage photovoltaïque. Devis gratuit sous 24h.
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
