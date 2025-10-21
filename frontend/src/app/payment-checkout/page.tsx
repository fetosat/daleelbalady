'use client'

import dynamic from 'next/dynamic'

const PaymentCheckout = dynamic(() => import('@/components/PaymentCheckout'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function PaymentCheckoutPage() {
  return <PaymentCheckout />
}
