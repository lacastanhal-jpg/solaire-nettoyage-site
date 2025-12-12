import Link from 'next/link'

export default function Footer() {
  return (
    <footer id="contact" className="bg-blue-900 border-t border-blue-700">
      {/* Footer principal */}
      <div className="max-w-[1400px] mx-auto px-12 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Colonne 1 - À propos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Solaire Nettoyage</h3>
            <p className="text-sm text-blue-200 leading-relaxed mb-4">
              Leader français du nettoyage professionnel de panneaux photovoltaïques depuis 2016.
            </p>
            <div className="text-sm text-blue-300">
              SAS Solaire Nettoyage<br />
              SIRET: 820 504 421 00028<br />
              511 Impasse de Saint Rames<br />
              12220 Vaureilles
            </div>
          </div>

          {/* Colonne 2 - Services */}
          <div id="services">
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/services/centrales-sol" className="hover:text-yellow-500 transition-colors">Nettoyage centrales au sol</Link></li>
              <li><Link href="/services/toitures" className="hover:text-yellow-500 transition-colors">Nettoyage toitures</Link></li>
              <li><Link href="/services/ombrieres" className="hover:text-yellow-500 transition-colors">Nettoyage ombrières</Link></li>
              <li><Link href="/services/seveso" className="hover:text-yellow-500 transition-colors">Sites industriels Seveso</Link></li>
            </ul>
          </div>

          {/* Colonne 3 - Entreprise */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/entreprise/a-propos" className="hover:text-yellow-500 transition-colors">À propos</Link></li>
              <li><Link href="/entreprise/certifications" className="hover:text-yellow-500 transition-colors">Nos certifications</Link></li>
              <li><Link href="/entreprise/references" className="hover:text-yellow-500 transition-colors">Nos références</Link></li>
              <li><Link href="/entreprise/carrieres" className="hover:text-yellow-500 transition-colors">Carrières</Link></li>
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="tel:+33632134766" className="hover:text-yellow-500 transition-colors">📞 06 32 13 47 66</a></li>
              <li><a href="mailto:contact@solairenettoyage.fr" className="hover:text-yellow-500 transition-colors">✉️ contact@solairenettoyage.fr</a></li>
              <li>📍 511 Impasse de Saint Rames<br />12220 Vaureilles, France</li>
            </ul>
          </div>
        </div>

        {/* Barre du bas */}
        <div className="pt-8 border-t border-blue-700 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-300">
          <div>
            © {new Date().getFullYear()} Solaire Nettoyage. Tous droits réservés.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-yellow-500 transition-colors">Mentions légales</Link>
            <Link href="#" className="hover:text-yellow-500 transition-colors">Politique de confidentialité</Link>
            <Link href="#" className="hover:text-yellow-500 transition-colors">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
