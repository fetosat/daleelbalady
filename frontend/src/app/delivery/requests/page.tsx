'use client';

import { useEffect } from 'react';
import DeliveryRequestsList from '@/components/delivery/DeliveryRequestsList';

export default function DeliveryRequestsPage() {
  useEffect(() => {
    document.title = 'طلبات التوصيل - دليل بلدي';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <DeliveryRequestsList />
    </div>
  );
}
