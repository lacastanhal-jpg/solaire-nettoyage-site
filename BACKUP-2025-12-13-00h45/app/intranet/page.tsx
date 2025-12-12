'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IntranetPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/intranet/login')
  }, [router])
  
  return null
}