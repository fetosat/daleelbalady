import axios from 'axios';
import type { User, UserRole } from './auth';
import { API_BASE } from '../utils/env';

// Use centralized API base URL
const API_URL = API_BASE;

console.log('🔧 API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  FINAL_API_URL: API_URL,
  STATUS: 'USING_ENV_CONFIG',
  IS_PRODUCTION: API_URL.includes('daleelbalady.com'),
  IS_LOCAL: API_URL.includes('localhost')
});

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('daleel-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('daleel-token');
      localStorage.removeItem('daleel-user');
      // Don't redirect here - let the component handle it
      // This prevents page reload and allows proper error handling
    }

    // Parse backend error messages
    if (error.response?.data?.error) {
      const backendError = new Error(error.response.data.error);
      return Promise.reject(backendError);
    }

    // Handle message field
    if (error.response?.data?.message) {
      const backendError = new Error(error.response.data.message);
      return Promise.reject(backendError);
    }

    // Handle validation errors
    if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
      const validationError = new Error(error.response.data.details[0]);
      return Promise.reject(validationError);
    }

    // Handle Prisma unique constraint errors (duplicate entries)
    if (error.response?.status === 409 || error.response?.data?.code === 'P2002') {
      const target = error.response?.data?.meta?.target || error.response?.data?.field;
      if (target) {
        if (Array.isArray(target)) {
          const field = target[0];
          if (field === 'email') {
            return Promise.reject(new Error('Email already exists'));
          } else if (field === 'phone') {
            return Promise.reject(new Error('Phone already exists'));
          }
        } else if (typeof target === 'string') {
          if (target.includes('email')) {
            return Promise.reject(new Error('Email already exists'));
          } else if (target.includes('phone')) {
            return Promise.reject(new Error('Phone already exists'));
          }
        }
      }
      return Promise.reject(new Error('This information is already registered'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const auth = {
  login: async (email: string, phone: string, password: string) => {
    console.log('🔐 Attempting login...');
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', {
      email: email || undefined,
      phone: phone || undefined,
      password,
    });
    
    console.log('✅ Login successful!');
    console.log('  - Response data:', data);
    console.log('  - User:', data.user);
    console.log('  - Token:', data.token ? 'Present' : 'Missing');
    
    localStorage.setItem('daleel-token', data.token);
    localStorage.setItem('token', data.token); // Also save as 'token' for compatibility
    localStorage.setItem('user', JSON.stringify(data.user)); // Save user data
    return data;
  },

  signup: async (name: string, email: string, password: string, role?: UserRole, phone?: string) => {
    console.log('📝 Attempting signup...');
    const { data } = await api.post<{ user: User; token: string }>('/auth/signup', {
      name,
      email,
      password,
      role,
      phone,
    });
    
    console.log('✅ Signup successful!');
    console.log('  - Response data:', data);
    console.log('  - User:', data.user);
    console.log('  - Token:', data.token ? 'Present' : 'Missing');
    
    localStorage.setItem('daleel-token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Save user data
    return data;
  },

  logout: () => {
    localStorage.removeItem('daleel-token');
    localStorage.removeItem('daleel-user');
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('daleel-token');
      console.log('🔍 Getting current user from API...');
      console.log('Token present:', token ? 'Yes (✓)' : 'No (✗)');
      console.log('API URL:', `${API_URL}/auth/me`);
      
      const { data } = await api.get<{ user: User } | User>('/auth/me');
      
      // Handle both response formats: { user: {...} } and direct user object
      const userData = 'user' in data ? data.user : data;
      
      console.log('✅ User data received from backend:');
      console.log('  - Raw response:', data);
      console.log('  - Extracted user data:', userData);
      console.log('  - ID:', userData.id);
      console.log('  - Name:', userData.name);
      console.log('  - Email:', userData.email);
      console.log('  - Phone:', userData.phone);
      console.log('  - Role:', userData.role);
      console.log('  - Subscription:', userData.subscription ? `${userData.subscription.planName} (${userData.subscription.status})` : 'None');
      
      return userData;
    } catch (error: any) {
      console.error('❌ Failed to get current user:');
      console.error('  - Error message:', error.message);
      console.error('  - Status code:', error.response?.status);
      console.error('  - Response data:', error.response?.data);
      throw error;
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { data } = await api.patch<User>('/auth/profile', updates);
    return data;
  },

  upgradeToProvider: async () => {
    console.log('🔄 Upgrading user to PROVIDER role...');
    const { data } = await api.patch<User>('/auth/profile', { role: 'PROVIDER' });
    console.log('✅ Role upgrade successful:', data);
    return data;
  },
};

// Dashboard API endpoints
export const dashboard = {
  getOverview: async (role: UserRole) => {
    const endpoint = role === 'ADMIN' ? '/dashboard/admin/overview' : `/dashboard/${role.toLowerCase()}/overview`;
    const { data } = await api.get(endpoint);
    return data;
  },
};

// Categories API endpoints
export const categories = {
  getAll: async () => {
    const { data } = await api.get('/advanced-search/categories');
    return data;
  },
};

// Provider API endpoints
export const provider = {
  // Shops management
  getShops: async () => {
    console.log('📌 Getting provider shops...');
    console.log('🔑 Current token:', localStorage.getItem('daleel-token') ? 'Present' : 'Missing');
    console.log('👤 Current user:', JSON.parse(localStorage.getItem('daleel-user') || '{}'));
    
    try {
      const { data } = await api.get('/dashboard/provider/shops');
      console.log('✅ Provider shops response:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Provider shops error:', error);
      console.error('📦 Error response data:', error.response?.data);
      console.error('🔢 Error status:', error.response?.status);
      throw error;
    }
  },

  createShop: async (shopData: {
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    website?: string;
    city: string;
    area?: string;
    address_en?: string;
    address_ar?: string;
    category?: string;
    serviceType?: string;
    designSlug?: string;
    locationLat?: string | number;
    locationLon?: string | number;
    workingDays?: string[];
    openingHours?: string;
    closingHours?: string;
    logo?: string;
    coverImage?: string;
    images?: string[];
  }) => {
    // Sanitize payload: remove empty strings, undefined, null, empty arrays
    const payload: Record<string, any> = {};
    Object.entries(shopData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'string' && value.trim() === '') return;
      if (Array.isArray(value) && value.length === 0) return;
      payload[key] = value;
    });

    // Convert coordinates to numbers if provided
    if (typeof payload.locationLat === 'string' && payload.locationLat) {
      const n = parseFloat(payload.locationLat);
      if (!Number.isNaN(n)) payload.locationLat = n; else delete payload.locationLat;
    }
    if (typeof payload.locationLon === 'string' && payload.locationLon) {
      const n = parseFloat(payload.locationLon);
      if (!Number.isNaN(n)) payload.locationLon = n; else delete payload.locationLon;
    }

    console.log('📤 [API] Creating shop with payload:', payload);
    const { data } = await api.post('/dashboard/provider/shops', payload);
    console.log('✅ [API] Create shop response:', data);
    return data;
  },

  updateShop: async (id: string, shopData: {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    city?: string;
    address_en?: string;
    address_ar?: string;
    locationLat?: string;
    locationLon?: string;
  }) => {
    const { data } = await api.put(`/dashboard/provider/shops/${id}`, shopData);
    return data;
  },

  getShop: async (id: string) => {
    const { data } = await api.get(`/dashboard/provider/shops/${id}`);
    return data;
  },

  // Products management
  getProducts: async (params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}) => {
    const { data } = await api.get('/products/provider', { params });
    return data;
  },

  createProduct: async (productData: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    sku?: string;
    isActive?: boolean;
    shopId: string;
    category?: string;
  }) => {
    const { data } = await api.post('/products', productData);
    return data;
  },

  updateProduct: async (id: string, productData: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    sku?: string;
    isActive?: boolean;
    category?: string;
  }) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  toggleProductStatus: async (id: string) => {
    const { data } = await api.patch(`/products/${id}/toggle-status`);
    return data;
  },
  
  // Upload product images
  uploadProductImages: async (productId: string, images: File[]) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    const { data } = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Types for services
  ProviderService: {} as {
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
  },

  CreateServiceDTO: {} as {
    name: string;
    category: string;
    description?: string;
    price: number;
    duration: number;
    isActive?: boolean;
    shopId?: string;
    availability?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
    images?: File[];
  },

  // Services management
  getServices: async (params: { page?: number; limit?: number; search?: string; category?: string; status?: string } = {}) => {
    const { data } = await api.get('/provider/services', { params });
    return data;
  },

  // Service categories - fallback to global categories endpoint
  getServiceCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      return data;
    } catch (error) {
      // Fallback to empty; caller can handle defaults
      return [];
    }
  },

  createService: async (serviceData: {
    name: string;
    category: string;
    description?: string;
    price: number;
    duration?: number;
    isActive?: boolean;
    shopId?: string;
    city?: string;
    area?: string;
    address?: string;
    phone?: string;
    availability?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
    images?: string[]; // Changed from File[] to string[] for URLs
  }) => {
    // Create JSON data (images are already uploaded and we have URLs)
    const jsonData = {
      name: serviceData.name,
      category: serviceData.category,
      description: serviceData.description,
      price: serviceData.price,
      duration: serviceData.duration || 60,
      isActive: serviceData.isActive ?? true,
      shopId: serviceData.shopId,
      availability: serviceData.availability,
      // Add images in multiple formats to ensure backend compatibility
      images: serviceData.images, // URLs array
      coverImage: serviceData.images?.[0], // First image as cover
      galleryImages: serviceData.images ? JSON.stringify(serviceData.images) : null, // All images as JSON string
      // Location data for independent services
      city: serviceData.city,
      area: serviceData.area,
      address: serviceData.address,
      phone: serviceData.phone
    };

    console.log('📤 Sending service data as JSON:', jsonData);
    
    // Send as JSON (images are already uploaded)
    const { data } = await api.post('/provider/services', jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },

  updateService: async (id: string, serviceData: {
    name?: string;
    category?: string;
    description?: string;
    price?: number;
    duration?: number;
    isActive?: boolean;
    shopId?: string;
    availability?: {
      days: string[];
      startTime: string;
      endTime: string;
    };
    images?: string[]; // Changed to URLs
  }) => {
    // Send as JSON (images are already uploaded URLs)
    const jsonData = {
      name: serviceData.name,
      category: serviceData.category,
      description: serviceData.description,
      price: serviceData.price,
      duration: serviceData.duration,
      isActive: serviceData.isActive,
      shopId: serviceData.shopId,
      availability: serviceData.availability,
      images: serviceData.images // URLs array
    };

    const { data } = await api.put(`/provider/services/${id}`, jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },

  deleteService: async (id: string) => {
    const { data } = await api.delete(`/provider/services/${id}`);
    return data;
  },

  toggleServiceStatus: async (id: string) => {
    console.log('🔄 API: toggleServiceStatus called for ID:', id);
    console.log('🌐 API: Making PATCH request to:', `/provider/services/${id}/toggle-status`);
    try {
      const { data } = await api.patch(`/provider/services/${id}/toggle-status`);
      console.log('✅ API: Toggle service status response:', data);
      return data;
    } catch (error: any) {
      console.error('❌ API: Toggle service status failed:', error);
      console.error('❌ API: Error response:', error?.response?.data);
      throw error;
    }
  },

  // Service validation helper
  validateService: (serviceData: any) => {
    const errors: string[] = [];
    
    if (!serviceData.name?.trim()) {
      errors.push('اسم الخدمة مطلوب');
    }
    
    if (!serviceData.category?.trim()) {
      errors.push('فئة الخدمة مطلوبة');
    }
    
    if (!serviceData.price || parseFloat(serviceData.price) <= 0) {
      errors.push('السعر مطلوب ويجب أن يكون أكبر من صفر');
    }
    
    if (!serviceData.duration || parseInt(serviceData.duration) <= 0) {
      errors.push('مدة الخدمة مطلوبة ويجب أن تكون أكبر من صفر');
    }
    
    // Location validation (only if no shop is selected)
    if (!serviceData.shopId) {
      if (!serviceData.city?.trim()) {
        errors.push('المدينة مطلوبة للخدمة المستقلة');
      }
      
      if (!serviceData.phone?.trim()) {
        errors.push('رقم الهاتف مطلوب للخدمة المستقلة');
      }
    }
    
    return errors;
  },
};

// Services API endpoints (public)
export const services = {
  // Get service by ID
  getById: async (id: string) => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },
  
  // Get all services
  getAll: async (params: { 
    page?: number; 
    limit?: number; 
    city?: string; 
    category?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    verified?: boolean; 
    available?: boolean;
    sortBy?: string;
    order?: string;
  } = {}) => {
    const { data } = await api.get('/services', { params });
    return data;
  },
  
  // Get service reviews
  getReviews: async (id: string, params: { page?: number; limit?: number } = {}) => {
    const { data } = await api.get(`/services/${id}/reviews`, { params });
    return data;
  },
};

// Tags API endpoints
export const tags = {
  // Get all tags
  getAllTags: async () => {
    const { data } = await api.get('/tags');
    return data;
  },
  
  // Create new tag
  createTag: async (name: string) => {
    const { data } = await api.post('/tags', { name });
    return data;
  },
};

// Admin API endpoints
export const admin = {
  // Users management
  getUsers: async (params: { page?: number; limit?: number; search?: string; role?: string; status?: string } = {}) => {
    const { data } = await api.get('/dashboard/admin/users', { params });
    return data;
  },

  updateUser: async (id: string, updates: { role?: UserRole; isVerified?: boolean; action?: 'delete' | 'restore' }) => {
    const { data } = await api.patch(`/dashboard/admin/users/${id}`, updates);
    return data;
  },

  // Shops management
  getShops: async (params: { page?: number; limit?: number; search?: string; verified?: boolean; city?: string } = {}) => {
    const { data } = await api.get('/dashboard/admin/shops', { params });
    return data;
  },

  verifyShop: async (id: string, isVerified: boolean) => {
    const { data } = await api.patch(`/dashboard/admin/shops/${id}/verify`, { isVerified });
    return data;
  },

  // Services management
  getServices: async (params: { page?: number; limit?: number; search?: string; city?: string; available?: boolean } = {}) => {
    const { data } = await api.get('/dashboard/admin/services', { params });
    return data;
  },

  // Products management
  getProducts: async (params: { page?: number; limit?: number; search?: string; active?: boolean; shopId?: string } = {}) => {
    const { data } = await api.get('/dashboard/admin/products', { params });
    return data;
  },

  updateProduct: async (id: string, updates: { isActive?: boolean; action?: 'delete' }) => {
    const { data } = await api.patch(`/dashboard/admin/products/${id}`, updates);
    return data;
  },

  // Orders management
  getOrders: async (params: { page?: number; limit?: number; status?: string; date?: string; userId?: string } = {}) => {
    const { data } = await api.get('/dashboard/admin/orders', { params });
    return data;
  },

  // Deliveries management
  getDeliveries: async (params: { page?: number; limit?: number; status?: string; date?: string } = {}) => {
    const { data } = await api.get('/dashboard/admin/deliveries', { params });
    return data;
  },

  updateDelivery: async (id: string, updates: { status: string; carrier?: string; trackingCode?: string; eta?: string }) => {
    const { data } = await api.patch(`/dashboard/admin/deliveries/${id}`, updates);
    return data;
  },

  // Reviews management
  getReviews: async (params: { page?: number; limit?: number; type?: 'service' | 'product' | 'shop'; rating?: number } = {}) => {
    const { data } = await api.get('/dashboard/admin/reviews', { params });
    return data;
  },

  updateReview: async (id: string, action: 'approve' | 'reject') => {
    const { data } = await api.patch(`/dashboard/admin/reviews/${id}`, { action });
    return data;
  },

  // Notifications management
  getNotifications: async (params: { page?: number; limit?: number; type?: string; isRead?: boolean; userId?: string } = {}) => {
    const { data } = await api.get('/dashboard/admin/notifications', { params });
    return data;
  },

  createNotification: async (notification: {
    title: string;
    message: string;
    type?: string;
    userIds?: string[];
    userRole?: UserRole;
    metadata?: any;
  }) => {
    const { data } = await api.post('/dashboard/admin/notifications', notification);
    return data;
  },

  // Analytics
  getAnalytics: async (period = '30d') => {
    const { data } = await api.get('/dashboard/admin/analytics', { params: { period } });
    return data;
  },
};

// Export both named and default
export { api };
export default api;
