import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Solaire Nettoyage — Leader Français du Nettoyage Photovoltaïque',
  description: 'Expert en nettoyage de panneaux photovoltaïques depuis 2016. 3 équipes professionnelles, 3600+ sites d\'intervention. Partenaire d\'EDF, ENGIE, TotalEnergies, CGN.',
  keywords: ['nettoyage photovoltaïque', 'panneaux solaires', 'maintenance solaire', 'EDF', 'ENGIE', 'TotalEnergies'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
