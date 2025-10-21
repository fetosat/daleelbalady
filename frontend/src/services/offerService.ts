import axios from 'axios';

// Build API base URL dynamically to support both browser and server runtimes
function getApiBaseUrl() {
  // On the server, Axios needs an absolute URL (including protocol + host)
  if (typeof window === 'undefined') {
    // Use environment variable or fallback to localhost for SSR
    const backendUrl = process.env.BACKEND_API_URL || 'https://api.daleelbalady.com/api';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || `http://localhost:${process.env.PORT || '3000'}`;
    
    // For production, use the backend directly
    if (process.env.NODE_ENV === 'production') {
      return backendUrl;
    }
    
    // For development, use Next.js proxy if available, otherwise use backend directly
    return `${siteUrl.replace(/\/$/, '')}/api`;
  }
  
  // On the client, always use relative URL for Next.js proxy
  return '/api';
}

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // Offers listing is public; avoid cookies to reduce CORS friction
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the resolved base URL once for debugging
if (typeof window === 'undefined') {
  console.log('[OfferService] Server baseURL resolved to:', API_BASE_URL);
} else {
  // no-op on client to avoid noisy logs
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('daleel-token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('daleel-token');
      localStorage.removeItem('daleel-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  offerType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_ONE_GET_ONE' | 'SPECIAL';
  discountValue: number;
  startDate: string;
  endDate: string;
  category: string;
  usageLimit?: number;
  terms?: string;
  featured: boolean;
  isActive: boolean;
  provider: {
    id: string;
    name: string;
    website?: string;
  };
}

export interface OffersResponse {
  offers: Offer[];
  total: number;
  page: number;
  limit: number;
}

export interface OfferFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  active?: boolean;
  page?: number;
  limit?: number;
}

// Offer Services
export class OfferService {
  // Get all offers
  static async getOffers(filters?: OfferFilters): Promise<OffersResponse> {
    console.log('🔄 Fetching offers with filters:', filters);
    
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      console.log('📡 Making API request via Next.js proxy to:', `/offers?${params.toString()}`);
      console.log('🔧 Proxy base URL:', API_BASE_URL, '(same-origin)');
      
      const response = await api.get(`/offers?${params.toString()}`);
      console.log('✅ Offers API response:', response.data);
      
      if (response.data.success) {
        return {
          offers: response.data.offers,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch offers');
      }
    } catch (error: any) {
      console.error('❌ Error fetching offers:', error);
      
      const errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        isNetworkError: !error.response,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.url ? (error.config.baseURL + error.config.url) : 'unknown'
      };
      
      try {
        // Stringify to ensure details are visible even if console flattens objects
        console.error('📋 Detailed error information:', JSON.stringify(errorDetails));
      } catch {
        console.error('📋 Detailed error information (raw):', errorDetails);
      }
      
      if (!error.response) {
        console.error('🚨 Network Error via Next.js proxy - Debugging steps:');
        console.error('   1. Verify Next.js dev server is running: npm run dev');
        console.error('   2. Check if port 3000 is available and accessible');
        console.error('   3. Verify next.config.js proxy configuration exists');
        console.error('   4. Check backend API health: https://api.daleelbalady.com/api/offers');
        console.error('   5. Verify network connectivity and DNS resolution');
        console.error('   6. Check browser developer tools for additional error details');
      } else if (error.response.status >= 500) {
        console.error('🔥 Server Error - Backend API issue:', error.response.status);
      } else if (error.response.status === 404) {
        console.error('🔍 Not Found - Check API endpoint exists and is correctly configured');
      } else if (error.response.status === 401 || error.response.status === 403) {
        console.error('🔒 Authentication/Authorization issue');
      }
      
      // Return fallback data if API fails
      return {
        offers: [
          {
            id: '1',
            title: 'خصم 50% على الاستشارة الطبية',
            description: 'احصل على خصم 50% على جميع الاستشارات الطبية المتخصصة',
            offerType: 'PERCENTAGE',
            discountValue: 50,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'طبي',
            featured: true,
            isActive: true,
            terms: 'العرض ساري لمدة شهر واحد فقط',
            provider: {
              id: '1',
              name: 'عيادة الدكتور أحمد',
              website: 'https://example.com'
            }
          },
          {
            id: '2',
            title: 'استشارة قانونية مجانية',
            description: 'احصل على استشارة قانونية مجانية لأول مرة',
            offerType: 'FIXED_AMOUNT',
            discountValue: 100,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'قانوني',
            featured: false,
            isActive: true,
            terms: 'العرض محدود لعدد 100 عميل',
            usageLimit: 100,
            provider: {
              id: '2',
              name: 'مكتب المحامي سمير',
            }
          }
        ],
        total: 2,
        page: 1,
        limit: 10
      };
    }
  }

  // Get offer by ID
  static async getOfferById(id: string): Promise<Offer> {
    try {
      const response = await api.get(`/offers/${id}`);
      console.log('Offer details API response:', response.data);
      
      if (response.data.success) {
        return response.data.offer;
      } else {
        throw new Error(response.data.message || 'Failed to fetch offer');
      }
    } catch (error: any) {
      console.error('Error fetching offer by ID:', error);
      throw error;
    }
  }

  // Get featured offers
  static async getFeaturedOffers(): Promise<Offer[]> {
    const response = await this.getOffers({ featured: true, active: true });
    return response.offers;
  }

  // Get offers by category
  static async getOffersByCategory(category: string): Promise<Offer[]> {
    const response = await this.getOffers({ category, active: true });
    return response.offers;
  }

  // Search offers
  static async searchOffers(searchTerm: string): Promise<Offer[]> {
    const response = await this.getOffers({ search: searchTerm, active: true });
    return response.offers;
  }
}

export default OfferService;
