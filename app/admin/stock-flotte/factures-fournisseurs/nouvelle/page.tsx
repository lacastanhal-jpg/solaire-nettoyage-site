'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectNouvelleFacturePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirige vers la page Comptabilité avec paramètre origine
    router.replace('/admin/comptabilite/factures-fournisseurs/nouvelle?origine=stock_flotte')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-6 text-lg text-gray-700 font-medium">Redirection...</p>
        <p className="mt-2 text-sm text-gray-500">Chargement de la page de création</p>
      </div>
    </div>
  )
}
