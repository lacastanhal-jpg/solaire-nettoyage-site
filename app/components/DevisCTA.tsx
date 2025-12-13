'use client'

interface DevisCTAProps {
  onOpenModal: () => void
}

export default function DevisCTA({ onOpenModal }: DevisCTAProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-400 relative overflow-hidden">
      {/* Effet de fond */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#fbbf24] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#fbbf24] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#fbbf24]/20 border border-[#fbbf24]/30 rounded-full px-6 py-2 mb-8">
            <span className="text-2xl">🎯</span>
            <span className="text-[#fbbf24] font-semibold">Devis gratuit</span>
          </div>

          {/* Titre */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Prêt à optimiser vos installations ?
          </h2>

          {/* Description */}
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Nos équipes interviennent partout en France avec un matériel de pointe. 
            Demandez votre devis personnalisé et recevez une réponse sous 24h.
          </p>

          {/* Bouton principal */}
          <button
            onClick={onOpenModal}
            className="group inline-flex items-center gap-3 bg-[#fbbf24] text-blue-900 px-10 py-5 rounded-xl hover:bg-[#fbbf24]/90 transition-all shadow-2xl hover:shadow-[#fbbf24]/50 font-bold text-lg"
          >
            Demander un devis gratuit
            <svg 
              className="w-6 h-6 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          {/* Info complémentaires */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-white font-semibold">Réponse sous 24h</div>
              <div className="text-sm text-blue-100">Délai garanti</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">📞</div>
              <div className="text-white font-semibold">
                <a href="tel:+33632134766" className="hover:text-[#fbbf24] transition-colors">
                  06 32 13 47 66
                </a>
              </div>
              <div className="text-sm text-blue-100">Lun-Ven 8h-18h</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-white font-semibold">Sans engagement</div>
              <div className="text-sm text-blue-100">Devis 100% gratuit</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
