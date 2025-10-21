'use client'

import dynamic from 'next/dynamic'

const PaymentSuccess = dynamic(() => import('@/components/PaymentSuccess'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function PaymentSuccessPage() {
  return <PaymentSuccess />
}
