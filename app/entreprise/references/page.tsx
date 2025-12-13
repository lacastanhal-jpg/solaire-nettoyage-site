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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
        <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
            <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
              NOS CLIENTS
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
            Références
          </h1>

          <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
            Plus de 3 600 sites nettoyés pour les plus grands acteurs de l'énergie photovoltaïque en France
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {[
              { value: '3 600+', label: 'Sites nettoyés' },
              { value: '4M m²', label: 'Par an' },
              { value: '8+', label: 'Grands clients' },
              { value: '100%', label: 'France entière' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-6xl font-bold text-blue-900 mb-4">
                  {stat.value}
                </div>
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Nos <span className="text-[#fbbf24]">clients</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {clients.map((client, idx) => (
              <div key={idx} className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{client.name}</h3>
                <p className="text-[#fbbf24] font-semibold mb-3">{client.category}</p>
                <p className="text-gray-600">{client.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secteurs */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Nos <span className="text-[#fbbf24]">secteurs</span> d'intervention
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
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <div className="text-5xl mb-4">{secteur.icon}</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{secteur.title}</h3>
                <p className="text-gray-600">{secteur.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center text-blue-900">
            Ce qu'ils <span className="text-[#fbbf24]">disent</span> de nous
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
              <div key={idx} className="bg-white border border-blue-200 rounded-2xl p-8 hover:border-[#fbbf24] hover:shadow-lg transition-all duration-300">
                <p className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                  "{temoignage.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fbbf24]/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    <p className="text-blue-900 font-semibold">{temoignage.author}</p>
                    <p className="text-[#fbbf24] text-sm">{temoignage.company}</p>
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
            Rejoignez nos <span className="text-[#fbbf24]">clients prestigieux</span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Faites confiance au leader français du nettoyage photovoltaïque. Devis gratuit sous 24h.
          </p>

          <Link href="/#contact" className="inline-block px-12 py-5 bg-[#fbbf24] text-blue-900 text-xl font-bold rounded-xl hover:bg-[#fbbf24]/90 transition-all duration-300 transform hover:scale-105">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}