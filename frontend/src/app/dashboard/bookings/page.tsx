'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardTransition } from '@/components/DashboardTransition';
import { useAuth } from '@/lib/auth';

const ProviderBookingsPage = dynamic(() => import('@/components/dashboard/ProviderBookingsPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

const CustomerBookingsPage = dynamic(() => import('@/components/dashboard/CustomerBookingsPage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
});

export default function BookingsPage() {
  const { user } = useAuth();
  
  const BookingsComponent = user?.role === 'CUSTOMER' ? CustomerBookingsPage : ProviderBookingsPage;
  
  return (
    <DashboardTransition>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading bookings...</div>
        </div>
      }>
        <BookingsComponent />
      </Suspense>
    </DashboardTransition>
  );
}
