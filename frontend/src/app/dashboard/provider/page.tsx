'use client'

import dynamic from 'next/dynamic'
import { DashboardTransition } from '@/components/DashboardTransition'

const ProviderDashboard = dynamic(() => import('@/components/dashboard/ProviderDashboard'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function ProviderDashboardPage() {
  return (
    <DashboardTransition>
      <ProviderDashboard />
    </DashboardTransition>
  )
}
