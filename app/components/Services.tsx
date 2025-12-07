export default function Services() {
  const services = [
    {
      title: 'Équipements Professionnels',
      description: '3 équipes mobiles autonomes avec camions (Semi 44T, Porteurs 26T), nacelles jusqu\'à 20m, robots Solar Cleano 3m30, cuves eau osmosée 8000-10000L.',
      highlight: '1,5M€ de matériel',
    },
    {
      title: 'Certifications & Conformité',
      description: 'Personnel certifié CACES R486/R482, SST, habilitations électriques photovoltaïques, GIES 1&2 pour sites Seveso. VGP matériel à jour.',
      highlight: 'Sites Seveso autorisés',
    },
    {
      title: 'Productivité & Autonomie',
      description: 'Capacité 2000-3000m²/h par équipe. Autonomie complète eau osmosée. Intervention sur tout type de centrale : toitures, ombrières, centrales au sol.',
      highlight: '3600+ sites/an',
    },
  ]

  return (
    <section id="services" className="bg-dark-surface py-24">
      <div className="max-w-[1400px] mx-auto px-12">
        {/* Titre section */}
        <div className="mb-16">
          <span className="text-xs font-semibold text-gold tracking-[0.15em] uppercase mb-4 block">
            Notre expertise
          </span>
          <h2 className="font-display text-5xl font-semibold text-white mb-6 max-w-[700px]">
            Un savoir-faire industriel au service de vos centrales
          </h2>
          <p className="text-xl text-gray-400 max-w-[600px]">
            Depuis 2016, nous intervenons sur les plus grandes installations 
            photovoltaïques de France avec un équipement de niveau industriel.
          </p>
        </div>

        {/* Grille services */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-dark-bg border border-white/8 p-8 hover:border-white/20 transition-all group"
            >
              <div className="text-sm font-semibold text-gold mb-4 tracking-wide">
                {service.highlight}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-gold transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}