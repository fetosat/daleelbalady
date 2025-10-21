'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardTransition } from '@/components/DashboardTransition';

const CustomerOrdersPage = dynamic(() => import('@/components/dashboard/CustomerOrdersPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function OrdersPage() {
  return (
    <DashboardTransition>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading orders...</div>
        </div>
      }>
        <CustomerOrdersPage />
      </Suspense>
    </DashboardTransition>
  );
}
