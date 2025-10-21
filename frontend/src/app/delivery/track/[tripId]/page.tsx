'use client';

import { useEffect } from 'react';
import TripTracker from '@/components/delivery/TripTracker';
import { useParams } from 'next/navigation';

export default function TripTrackerPage() {
  const params = useParams();
  const tripId = params.tripId as string;

  useEffect(() => {
    document.title = `تتبع الرحلة ${tripId} - دليل بلدي`;
  }, [tripId]);

  return (
    <div className="min-h-screen">
      <TripTracker tripId={tripId} />
    </div>
  );
}
