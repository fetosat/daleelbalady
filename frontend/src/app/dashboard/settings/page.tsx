'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardTransition } from '@/components/DashboardTransition';

const SettingsPage = dynamic(() => import('@/components/dashboard/SettingsPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function ProviderSettingsPage() {
  return (
    <DashboardTransition>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading settings...</div>
        </div>
      }>
        <SettingsPage />
      </Suspense>
    </DashboardTransition>
  );
}
