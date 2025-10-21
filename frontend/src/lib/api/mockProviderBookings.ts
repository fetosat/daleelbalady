// Temporary mock API for testing the Provider Bookings Calendar
// This file provides sample data while the backend server is being set up

import { Booking, BookingAnalytics } from './providerBookings';

// Mock booking data
const mockBookings: Booking[] = [
  {
    id: '1',
    status: 'CONFIRMED',
    startAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endAt: new Date(Date.now() + 90000000).toISOString(),
    customerName: 'Ahmed Hassan',
    customerPhone: '+201234567890',
    customerEmail: 'ahmed@example.com',
    notes: 'First time customer',
    service: {
      translation: {
        name: 'Hair Cut & Styling'
      }
    },
    shop: {
      name: 'Modern Salon',
      city: 'Cairo'
    }
  },
  {
    id: '2',
    status: 'PENDING',
    startAt: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endAt: new Date(Date.now() + 176400000).toISOString(),
    customerName: 'Fatma Ali',
    customerPhone: '+201987654321',
    customerEmail: 'fatma@example.com',
    service: {
      translation: {
        name: 'Massage Therapy'
      }
    },
    shop: {
      name: 'Wellness Center',
      city: 'Alexandria'
    }
  },
  {
    id: '3',
    status: 'COMPLETED',
    startAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    endAt: new Date(Date.now() - 82800000).toISOString(),
    customerName: 'Mohamed Reda',
    customerPhone: '+201555666777',
    service: {
      translation: {
        name: 'Car Wash'
      }
    },
    shop: {
      name: 'Quick Clean',
      city: 'Giza'
    }
  },
  {
    id: '4',
    status: 'CANCELLED',
    startAt: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    endAt: new Date(Date.now() + 262800000).toISOString(),
    customerName: 'Sara Ibrahim',
    customerPhone: '+201444555666',
    notes: 'Customer requested cancellation',
    service: {
      translation: {
        name: 'Dental Cleaning'
      }
    },
    shop: {
      name: 'Dental Care',
      city: 'Cairo'
    }
  },
  {
    id: '5',
    status: 'CONFIRMED',
    startAt: new Date().toISOString(), // Today
    endAt: new Date(Date.now() + 3600000).toISOString(),
    customerName: 'Omar Khaled',
    customerPhone: '+201333444555',
    customerEmail: 'omar@example.com',
    service: {
      translation: {
        name: 'Home Repair'
      }
    },
    shop: {
      name: 'Fix It Pro',
      city: 'Cairo'
    }
  }
];

/**
 * Mock function to simulate fetching provider bookings with analytics
 * This replaces the real API call when the backend is not available
 */
export async function getMockProviderBookingsWithAnalytics(): Promise<{ 
  bookings: Booking[]; 
  analytics: BookingAnalytics 
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const bookings = mockBookings;

  // Compute analytics from mock data
  const analytics: BookingAnalytics = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  console.log('📊 Mock Provider Bookings Analytics:', analytics);
  console.log('📅 Mock Bookings Data:', bookings);

  return { bookings, analytics };
}

/**
 * Mock function for updating booking status
 */
export async function mockUpdateBookingStatus(
  bookingId: string,
  status: string,
  notes?: string
): Promise<Booking> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const booking = mockBookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  // Update the mock data
  booking.status = status;
  if (notes) booking.notes = notes;

  console.log(`📝 Mock: Updated booking ${bookingId} to status ${status}`);
  
  return booking;
}

/**
 * Check if we should use mock data (when backend is not available)
 */
export function shouldUseMockData(): boolean {
  // For now, always use mock data until backend is properly set up
  return true;
}
