export default function Clients() {
  const clients = [
    'EDF Solutions Solaires',
    'ENGIE Green',
    'TotalEnergies',
    'CGN Europe Energy',
    'JPEE',
    'Idex Solar',
    'GreenYellow',
    'Tenergie',
    'Séolis',
    'Mecojit',
    'Coopérative U',
    'ArcelorMittal',
    'Safran Landing Systems',
  ]

  return (
    <section id="clients" className="bg-dark-bg py-20 border-t border-b border-white/8">
      <div className="max-w-[1400px] mx-auto px-12">
        {/* Label */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-gray-600 tracking-[0.15em] uppercase">
            Ils nous font confiance
          </span>
        </div>

        {/* Grille clients */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-20 items-center justify-items-center">
          {clients.map((client, index) => (
            <div 
              key={index}
              className="text-lg font-semibold text-gray-600 hover:text-white transition-colors cursor-default text-center"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}