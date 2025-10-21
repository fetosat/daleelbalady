'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardTransition } from '@/components/DashboardTransition';

const IndependentListingsPage = dynamic(() => import('@/components/dashboard/IndependentListingsPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function ProviderIndependentListingsPage() {
  return (
    <DashboardTransition>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading listings...</div>
        </div>
      }>
        <IndependentListingsPage />
      </Suspense>
    </DashboardTransition>
  );
}
