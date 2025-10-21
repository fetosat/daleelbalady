'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardTransition } from '@/components/DashboardTransition';

const ProviderProductsPage = dynamic(() => import('@/components/dashboard/ProviderProductsPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function ProductsPage() {
  return (
    <DashboardTransition>
      <Suspense fallback={
        <div className="flex items-center bg-stone-50 dark:bg-stone-950 justify-center min-h-screen">
          <div className="text-lg">Loading products...</div>
        </div>
      }>
        <ProviderProductsPage />
      </Suspense>
    </DashboardTransition>
  );
}
