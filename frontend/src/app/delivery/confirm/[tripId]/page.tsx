'use client';

import { useEffect } from 'react';
import DeliveryConfirmation from '@/components/delivery/DeliveryConfirmation';
import { useParams } from 'next/navigation';

export default function DeliveryConfirmationPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  useEffect(() => {
    document.title = `تأكيد التوصيل ${tripId} - دليل بلدي`;
  }, [tripId]);

  return (
    <div className="min-h-screen">
      <DeliveryConfirmation tripId={tripId} />
    </div>
  );
}
