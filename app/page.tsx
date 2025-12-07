'use client'

import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Clients from './components/Clients'
import Services from './components/Services'
import DevisCTA from './components/DevisCTA'
import DevisModal from './components/DevisModal'
import Footer from './components/Footer'

export default function Home() {
  const [isDevisModalOpen, setIsDevisModalOpen] = useState(false)

  return (
    <>
      <Header />
      <main>
        <Hero onOpenDevis={() => setIsDevisModalOpen(true)} />
        <Stats />
        <Clients />
        <Services />
        <DevisCTA onOpenModal={() => setIsDevisModalOpen(true)} />
      </main>
      <Footer />
      
      {/* Modal de devis */}
      <DevisModal 
        isOpen={isDevisModalOpen} 
        onClose={() => setIsDevisModalOpen(false)} 
      />
    </>
  )
}