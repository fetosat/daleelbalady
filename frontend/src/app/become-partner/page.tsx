'use client'

import dynamic from 'next/dynamic'

const BecomePartnerRedesigned = dynamic(() => import('@/components/BecomePartnerRedesigned'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white font-bold text-2xl">دب</span>
        </div>
        <div className="text-lg font-semibold text-stone-700 dark:text-stone-300">Loading...</div>
      </div>
    </div>
  )
})

export default function BecomePartnerPage() {
  return <BecomePartnerRedesigned />
}
