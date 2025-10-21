'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProviderBookingsCalendar from '@/components/dashboard/ProviderBookingsCalendar';
import { getProviderBookingsWithAnalytics, Booking, BookingAnalytics } from '@/lib/api/providerBookings';
import { getMockProviderBookingsWithAnalytics, shouldUseMockData } from '@/lib/api/mockProviderBookings';
import { Loader2, AlertCircle, RefreshCw, Info } from 'lucide-react';

export default function ProviderBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [analytics, setAnalytics] = useState<BookingAnalytics>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      // Check if we should use mock data
      if (shouldUseMockData()) {
        console.log('🔧 Using mock data - backend server not available');
        const { bookings: mockBookings, analytics: mockAnalytics } = 
          await getMockProviderBookingsWithAnalytics();
        
        setBookings(mockBookings);
        setAnalytics(mockAnalytics);
        setUsingMockData(true);
        return;
      }

      // Try real API first
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login?redirect=/dashboard/provider/bookings');
        return;
      }

      const { bookings: fetchedBookings, analytics: computedAnalytics } = 
        await getProviderBookingsWithAnalytics(token, 'ALL', 1000);

      setBookings(fetchedBookings);
      setAnalytics(computedAnalytics);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      
      // If API fails, fall back to mock data
      if (err.response?.status === 404 || err.code === 'ECONNREFUSED') {
        console.log('🔧 API unavailable, falling back to mock data');
        const { bookings: mockBookings, analytics: mockAnalytics } = 
          await getMockProviderBookingsWithAnalytics();
        
        setBookings(mockBookings);
        setAnalytics(mockAnalytics);
        setUsingMockData(true);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login?redirect=/dashboard/provider/bookings');
      } else {
        setError(err.response?.data?.message || 'Failed to load bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    fetchBookings();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-stone-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Failed to Load Bookings</h2>
          <p className="text-stone-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {usingMockData && (
        <div className="bg-blue-50 border border-blue-200 p-4 mb-4 mx-6 mt-6 rounded-lg flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm">
            <strong className="text-blue-900">Demo Mode:</strong>
            <span className="text-blue-700 ml-1">
              Showing sample data. Start the backend server to load real bookings.
            </span>
          </div>
        </div>
      )}
      
      <ProviderBookingsCalendar
        bookings={bookings}
        analytics={analytics}
        onRefresh={handleRefresh}
      />
    </div>
  );
}

