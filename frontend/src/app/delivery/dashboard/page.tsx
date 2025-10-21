'use client';

import { useEffect } from 'react';
import DeliveryDashboard from '@/components/delivery/DeliveryDashboard';

export default function DeliveryDashboardPage() {
  useEffect(() => {
    document.title = 'لوحة المندوب - دليل بلدي';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <DeliveryDashboard />
    </div>
  );
}
