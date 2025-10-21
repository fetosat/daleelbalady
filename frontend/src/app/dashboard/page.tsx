'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return // Wait for auth to load
    
    if (!user) {
      // Redirect to login if not authenticated
      router.replace('/login?redirect=/dashboard')
      return
    }

    // Route based on user role
    switch (user.role) {
      case 'ADMIN':
        router.replace('/admin')
        break
      case 'PROVIDER':
      case 'SHOP_OWNER':
        router.replace('/dashboard/provider')
        break
      case 'DELIVERY':
        router.replace('/dashboard/delivery')
        break
      case 'CUSTOMER':
      case 'GUEST':
      default:
        router.replace('/dashboard/customer')
        break
    }
  }, [router, user, isLoading])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="ml-3 text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting...</div>
    </div>
  )
}
