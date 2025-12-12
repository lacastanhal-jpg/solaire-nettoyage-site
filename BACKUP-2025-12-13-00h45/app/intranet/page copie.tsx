'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IntranetPage() {
  const router = useRouter()

  useEffect(() => {
    // Vérifier si connecté
    const isLoggedIn = localStorage.getItem('intranet_logged_in')
    
    if (isLoggedIn) {
      router.push('/intranet/dashboard')
    } else {
      router.push('/intranet/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}
