'use client';

import { useEffect } from 'react';
import DeliveryRequestForm from '@/components/delivery/DeliveryRequestForm';

export default function NewDeliveryPage() {
  useEffect(() => {
    document.title = 'طلب توصيل جديد - دليل بلدي';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <DeliveryRequestForm />
    </div>
  );
}
