'use client'

interface HeroProps {
  onOpenDevis: () => void
}

export default function Hero({ onOpenDevis }: HeroProps) {
  return (
    <section className="mt-[77px] bg-gradient-to-br from-blue-600 to-blue-400 relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 md:py-32 pb-16 md:pb-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24] px-4 py-2 mb-6 md:mb-8">
          <span className="w-1.5 h-1.5 bg-[#fbbf24] rounded-full"></span>
          <span className="text-xs font-semibold text-[#fbbf24] tracking-widest uppercase">
            Leader Français depuis 2016
          </span>
        </div>

        {/* Titre Principal */}
        <h1 className="font-display text-3xl md:text-5xl lg:text-7xl font-semibold text-white leading-tight md:leading-none tracking-tight mb-4 md:mb-6 max-w-[900px]">
          Nettoyage Professionnel de Centrales Photovoltaïques
        </h1>

        {/* Sous-titre */}
        <p className="text-base md:text-xl text-blue-100 max-w-[700px] mb-8 md:mb-12 leading-relaxed">
          Expert en nettoyage de centrales solaires. 3 équipes mobiles, 
          équipement de pointe, certifications tous sites dont Seveso. Partenaire des plus 
          grands énergéticiens français.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          <button 
            onClick={onOpenDevis}
            className="bg-[#fbbf24] text-blue-900 px-8 md:px-10 py-4 text-sm md:text-base font-semibold hover:bg-[#fbbf24]/90 transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
          >
            Demander un devis
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <a href="tel:+33632134766" className="bg-white text-blue-900 px-8 md:px-10 py-4 text-sm md:text-base font-semibold hover:bg-[#fbbf24] transition-all hover:-translate-y-0.5 text-center">
            06 32 13 47 66
          </a>
          <a href="#clients" className="bg-transparent text-white px-8 md:px-10 py-4 text-sm md:text-base font-semibold border-2 border-blue-200 hover:border-white transition-all text-center">
            Nos références
          </a>
        </div>
      </div>
    </section>
  )
}