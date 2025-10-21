import api from '@/lib/api';

// Get the API URL for error logging
const API_URL = 'https://api.daleelbalady.com/api';

// Types
export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  rating?: number;
  totalBookings?: number;
  images?: string[];
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProviderStats {
  totalEarnings: number;
  thisMonth: number;
  lastMonth: number;
  pendingPayouts: number;
  totalBookings: number;
  averageRating: number;
  totalServices: number;
  activeServices: number;
}

export interface ProviderBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAvatar?: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  name: string;
  category: string;
  description?: string;
  price: number;
  duration: number;
  isActive?: boolean;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  images?: File[];
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {
  id: string;
}

// Provider Services API
export const providerAPI = {
  // Services
  async getServices(page = 1, limit = 20, filters?: {
    search?: string;
    category?: string;
    status?: 'active' | 'inactive' | 'all';
  }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.status && filters.status !== 'all') {
        params.append('isActive', filters.status === 'active' ? 'true' : 'false');
      }

      const response = await api.get(`/provider/services?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider services:', error);
      throw error;
    }
  },

  async getService(id: string) {
    try {
      const response = await api.get(`/provider/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  },

  async createService(data: CreateServiceDTO) {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('price', data.price.toString());
      formData.append('duration', data.duration.toString());
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.isActive !== undefined) {
        formData.append('isActive', data.isActive.toString());
      }
      
      if (data.availability) {
        formData.append('availability', JSON.stringify(data.availability));
      }
      
      // Add images if present
      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      const response = await api.post('/provider/services', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  async updateService(id: string, data: Partial<CreateServiceDTO>) {
    try {
      const formData = new FormData();
      
      // Only add fields that are being updated
      if (data.name) formData.append('name', data.name);
      if (data.category) formData.append('category', data.category);
      if (data.description) formData.append('description', data.description);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.duration !== undefined) formData.append('duration', data.duration.toString());
      if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
      if (data.availability) formData.append('availability', JSON.stringify(data.availability));
      
      // Add new images if present
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await api.put(`/provider/services/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  async deleteService(id: string) {
    try {
      const response = await api.delete(`/provider/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  async toggleServiceStatus(id: string) {
    try {
      const response = await api.patch(`/provider/services/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw error;
    }
  },

  // Provider Dashboard Stats
  async getStats() {
    try {
      console.log('📊 Fetching provider stats...');
      const response = await api.get('/provider/stats');
      console.log('✅ Provider stats fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching provider stats:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url
      });
      
      // No mock data - use production API only
      console.error('🌐 Network Error Details:', {
        isProduction: API_URL.includes('api.daleelbalady.com'),
        apiUrl: API_URL,
        suggestion: 'Check if https://api.daleelbalady.com is accessible'
      });
      
      throw error;
    }
  },

  // Bookings
  async getBookings(page = 1, limit = 20, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.dateFrom) {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters?.dateTo) {
        params.append('dateTo', filters.dateTo);
      }

      const response = await api.get(`/provider/bookings?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      throw error;
    }
  },

  async getBooking(id: string) {
    try {
      const response = await api.get(`/provider/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  async updateBookingStatus(id: string, status: string) {
    try {
      const response = await api.patch(`/provider/bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Earnings and Payments
  async getEarnings(period?: 'week' | 'month' | 'year') {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await api.get(`/provider/earnings${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  },

  async getTransactions(page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/provider/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async requestPayout(amount: number, method: string) {
    try {
      const response = await api.post('/provider/payouts/request', {
        amount,
        method,
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  },

  // Reviews
  async getReviews(page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/provider/reviews?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  // Profile
  async getProfile() {
    try {
      const response = await api.get('/provider/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      throw error;
    }
  },

  async updateProfile(data: any) {
    try {
      const response = await api.put('/provider/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating provider profile:', error);
      throw error;
    }
  },

  // Documents
  async uploadDocument(type: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('document', file);

      const response = await api.post('/provider/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocuments() {
    try {
      const response = await api.get('/provider/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
};

export default providerAPI;
