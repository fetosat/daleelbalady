'use client'

import dynamic from 'next/dynamic'

const ShopsListing = dynamic(() => import('@/components/ShopsListing'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function ShopsPage() {
  return <ShopsListing />
}
