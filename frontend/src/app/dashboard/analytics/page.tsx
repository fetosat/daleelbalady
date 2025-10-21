'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardTransition } from '@/components/DashboardTransition';

const ProviderAnalyticsPage = dynamic(() => import('@/components/dashboard/ProviderAnalyticsPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function AnalyticsPage() {
  return (
    <DashboardTransition>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading analytics...</div>
        </div>
      }>
        <ProviderAnalyticsPage />
      </Suspense>
    </DashboardTransition>
  );
}
