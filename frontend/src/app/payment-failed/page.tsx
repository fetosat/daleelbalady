'use client'

import dynamic from 'next/dynamic'

const PaymentFailed = dynamic(() => import('@/components/pages/PaymentFailed'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function PaymentFailedPage() {
  return <PaymentFailed />
}
