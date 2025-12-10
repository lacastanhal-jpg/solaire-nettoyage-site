'use client'

import Link from 'next/link'

export default function ServiceCentralesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 via-black to-amber-600/10" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-7xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
              Centrales Solaires au Sol
            </span>
          </h1>
          
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Spécialistes du nettoyage de centrales en milieu marécageux ou accidenté avec tracteur Sunbrush
          </p>

          <Link 
            href="/contact"
            className="px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all transform hover:scale-105"
          >
            Devis gratuit
          </Link>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-16 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            Équipement <span className="text-yellow-500">spécialisé</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
              <div className="text-5xl mb-4">🚜</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Tracteur Sunbrush</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✓</span>
                  <span>Fonctionne sur terrains accidentés</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✓</span>
                  <span>Adapté aux milieux marécageux</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✓</span>
                  <span>Rangées de moins de 2 mètres</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-2xl p-8">
              <div className="text-5xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Citerne mobile</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✓</span>
                  <span>10 000L eau osmosée</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✓</span>
                  <span>Ravitaillement continu</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-500">✓</span>
                  <span>Autonomie maximale</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Intervention <span className="text-yellow-500">rapide</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Nettoyage en continu sans interruption, même sur terrains difficiles
          </p>
          <Link 
            href="/contact"
            className="px-12 py-5 bg-gradient-to-r from-yellow-600 to-amber-600 text-black text-xl font-bold rounded-xl hover:shadow-2xl transition-all"
          >
            Demander un devis
          </Link>
        </div>
      </section>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap');
      `}</style>
    </div>
  )
}
