import React from 'react';
import ProviderBookingsPage from './ProviderBookingsPage';
import CustomerBookingsPage from './CustomerBookingsPage';
import { useAuth } from '@/lib/auth';

export default function BookingsPage() {
  const { user } = useAuth();
  
  if (user?.role === 'PROVIDER' || user?.role === 'SHOP_OWNER') {
    return <ProviderBookingsPage />;
  }
  
  return <CustomerBookingsPage />;
}
