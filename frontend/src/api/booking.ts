// booking.ts
export interface TimeSlot {
  start: string;
  end: string;
  duration: number;
}

export interface AvailableSlotsResponse {
  serviceId: string;
  date: string;
  availableSlots: TimeSlot[];
  workingHours: {
    start: string;
    end: string;
  };
  totalSlots: number;
  bookedSlots: number;
}

export interface BookingRequest {
  serviceId: string;
  userId: string;
  startAt: string;
  endAt: string;
  notes?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  startAt: string;
  endAt: string;
  durationMins: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  bookingRef: string;
  createdAt: string;
  service?: {
    id: string;
    translation?: {
      name_en: string;
      name_ar: string;
    };
    shop?: {
      name: string;
      phone?: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const API_BASE_URL = '/api';

class BookingAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/booking${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Booking request failed');
    }

    return response.json();
  }

  async getAvailableSlots(serviceId: string, date: string): Promise<AvailableSlotsResponse> {
    return this.request<AvailableSlotsResponse>('/available-slots', {
      method: 'POST',
      body: JSON.stringify({ serviceId, date }),
    });
  }

  async createBooking(bookingData: BookingRequest): Promise<{ success: boolean; booking: Booking; message: string }> {
    return this.request<{ success: boolean; booking: Booking; message: string }>('/create', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getServiceBookings(serviceId: string, date?: string): Promise<{ bookings: Booking[] }> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    return this.request<{ bookings: Booking[] }>(`/service/${serviceId}?${params.toString()}`);
  }

  async getUserBookings(userId: string, status?: string): Promise<{ bookings: Booking[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    return this.request<{ bookings: Booking[] }>(`/user/${userId}?${params.toString()}`);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<{ booking: Booking }> {
    return this.request<{ booking: Booking }>(`/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const bookingAPI = new BookingAPI();
