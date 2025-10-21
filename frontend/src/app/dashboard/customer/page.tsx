'use client'

import dynamic from 'next/dynamic'
import { DashboardTransition } from '@/components/DashboardTransition'

const CustomerDashboard = dynamic(() => import('@/components/dashboard/CustomerDashboard'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function CustomerDashboardPage() {
  return (
    <DashboardTransition>
      <CustomerDashboard />
    </DashboardTransition>
  )
}
