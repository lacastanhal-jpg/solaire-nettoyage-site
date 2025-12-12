'use client'

interface HeroProps {
  onOpenDevis: () => void
}

export default function Hero({ onOpenDevis }: HeroProps) {
  return (
    <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
      <div className="max-w-[1400px] mx-auto px-12 py-32 pb-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500 px-4 py-2 mb-8">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
          <span className="text-xs font-semibold text-yellow-500 tracking-widest uppercase">
            Leader Français depuis 2016
          </span>
        </div>

        {/* Titre Principal */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-none tracking-tight mb-6 max-w-[900px]">
          Nettoyage Professionnel de Panneaux Photovoltaïques
        </h1>

        {/* Sous-titre */}
        <p className="text-xl text-blue-100 max-w-[700px] mb-12 leading-relaxed">
          Expert en maintenance et nettoyage de centrales solaires. 3 équipes mobiles, 
          équipement de pointe, certifications tous sites dont Seveso. Partenaire des plus 
          grands énergéticiens français.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center">
          <button 
            onClick={onOpenDevis}
            className="bg-yellow-500 text-blue-900 px-10 py-4 text-base font-semibold hover:bg-yellow-600 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            Demander un devis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <a href="tel:+33632134766" className="bg-white text-blue-900 px-10 py-4 text-base font-semibold hover:bg-yellow-500 transition-all hover:-translate-y-0.5 inline-block">
            06 32 13 47 66
          </a>
          <a href="#clients" className="bg-transparent text-white px-10 py-4 text-base font-semibold border-2 border-blue-200 hover:border-white transition-all inline-block">
            Nos références
          </a>
        </div>
      </div>
    </section>
  )
}
