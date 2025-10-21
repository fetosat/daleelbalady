import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.daleelbalady.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Booking {
  id: string;
  status: string;
  startAt: string;
  endAt: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  service?: {
    translation?: {
      name: string;
    };
  };
  shop?: {
    name: string;
    city?: string;
  };
}

export interface BookingAnalytics {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
}

/**
 * Fetch provider bookings and compute analytics
 * @param token - JWT authentication token
 * @param status - Optional status filter (PENDING, CONFIRMED, COMPLETED, CANCELLED, ALL)
 * @param limit - Number of records to fetch (default: 1000)
 * @returns Promise with bookings array and analytics summary
 */
export async function getProviderBookingsWithAnalytics(
  token: string,
  status: string = 'ALL',
  limit: number = 1000
): Promise<{ bookings: Booking[]; analytics: BookingAnalytics }> {
  try {
    const { data } = await api.get('/api/bookings/provider/list', {
      headers: { Authorization: `Bearer ${token}` },
      params: { status: status === 'ALL' ? undefined : status, limit },
    });

    // Backend returns { success: true, bookings: [...] }
    const bookings: Booking[] = data?.bookings || [];

    // Compute analytics from bookings
    const analytics: BookingAnalytics = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
    };

    return { bookings, analytics };
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    throw error;
  }
}

/**
 * Fetch only analytics summary for provider bookings
 * @param token - JWT authentication token
 * @returns Promise with analytics summary
 */
export async function getBookingAnalytics(token: string): Promise<BookingAnalytics> {
  const { analytics } = await getProviderBookingsWithAnalytics(token);
  return analytics;
}

/**
 * Update booking status
 * @param token - JWT authentication token
 * @param bookingId - Booking ID
 * @param status - New status
 * @param notes - Optional notes
 * @returns Promise with updated booking
 */
export async function updateBookingStatus(
  token: string,
  bookingId: string,
  status: string,
  notes?: string
): Promise<Booking> {
  try {
    const { data } = await api.patch(
      `/api/bookings/${bookingId}`,
      { status, notes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

/**
 * Get single booking details
 * @param token - JWT authentication token
 * @param bookingId - Booking ID
 * @returns Promise with booking details
 */
export async function getBookingById(token: string, bookingId: string): Promise<Booking> {
  try {
    const { data } = await api.get(`/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

