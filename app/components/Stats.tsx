export default function Stats() {
  const stats = [
    { number: '2016', label: 'Année de création' },
    { number: '3600+', label: 'Sites d\'intervention' },
    { number: '3', label: 'Équipes professionnelles' },
    { number: '1,5M€', label: 'Parc matériel' },
    { number: '3,5M', label: 'm² nettoyés en 2025' },
  ]

  return (
    <section className="bg-blue-50 text-blue-900 py-12">
      <div className="max-w-[1400px] mx-auto px-12">
        <div className="grid grid-cols-5 gap-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`text-center py-6 ${
                index !== stats.length - 1 ? 'border-r border-blue-200' : ''
              }`}
            >
              <div className="font-display text-6xl font-semibold leading-none mb-2 text-yellow-500">
                {stat.number}
              </div>
              <div className="text-sm text-blue-700 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}