'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const LoginRedesigned = dynamic(() => import('@/components/LoginRedesigned'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-50 via-green-50/30 to-blue-50/30 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
        <div className="text-lg text-stone-600 dark:text-stone-400">Loading...</div>
      </div>
    </div>
  )
})

export default function LoginPage() {
  return <LoginRedesigned />
}
