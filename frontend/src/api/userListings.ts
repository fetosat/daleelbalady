import axios from 'axios';

// Create axios instance with base configuration
const apiBaseURL = 'https://api.daleelbalady.com/api';

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('daleel-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('daleel-token');
      localStorage.removeItem('daleel-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================== TYPE DEFINITIONS ==================

export interface IndependentService {
  id: string;
  vid?: string;
  listingType: 'INDEPENDENT';
  embeddingText: string;
  phone?: string;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  price?: number;
  durationMins?: number;
  currency?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
  translation?: {
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
  };
  category: any[];
  tags: any[];
  design?: any;
  ownerUser: {
    name: string;
    profilePic?: string;
    isVerified: boolean;
  };
  reviews: any[];
  stats?: {
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
  };
}

export interface IndependentProduct {
  id: string;
  vid?: string;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  isActive: boolean;
  listingType: 'INDEPENDENT';
  embeddingText?: string;
  createdAt: string;
  updatedAt: string;
  tags: any[];
  design?: any;
  ownerUser: {
    name: string;
    profilePic?: string;
    isVerified: boolean;
  };
  reviews: any[];
  stats?: {
    totalOrders: number;
    totalReviews: number;
    averageRating: number;
  };
}

export interface CreateServiceData {
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price?: number;
  durationMins?: number;
  currency?: string;
  phone?: string;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  categoryIds?: string[];
  tags?: string[];
  designId?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock?: number;
  sku?: string;
  tags?: string[];
  designId?: string;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  available?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchServicesParams {
  q?: string;
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface SearchProductsParams {
  q?: string;
  page?: number;
  limit?: number;
  inStock?: boolean;
}

export interface SearchParams {
  query?: string;
  type?: 'service' | 'product';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  available?: boolean;
  tags?: string[];
  sortBy?: 'price_low' | 'price_high' | 'newest' | 'rating';
  limit?: number;
  page?: number;
}

// ================== INDEPENDENT SERVICES API ==================

/**
 * Get current user's independent services
 */
export const getUserServices = async (): Promise<IndependentService[]> => {
  try {
    const response = await api.get('/user-listings/services');
    if (response.data.success) {
      return response.data.services;
    }
    throw new Error(response.data.message || 'Failed to fetch services');
  } catch (error: any) {
    console.error('Error fetching user services:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch services');
  }
};

/**
 * Create a new independent service
 */
export const createUserService = async (serviceData: CreateServiceData): Promise<IndependentService> => {
  try {
    const response = await api.post('/user-listings/services', serviceData);
    if (response.data.success) {
      return response.data.service;
    }
    throw new Error(response.data.message || 'Failed to create service');
  } catch (error: any) {
    console.error('Error creating service:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create service');
  }
};

/**
 * Update an independent service
 */
export const updateUserService = async (serviceId: string, serviceData: UpdateServiceData): Promise<IndependentService> => {
  try {
    const response = await api.put(`/user-listings/services/${serviceId}`, serviceData);
    if (response.data.success) {
      return response.data.service;
    }
    throw new Error(response.data.message || 'Failed to update service');
  } catch (error: any) {
    console.error('Error updating service:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update service');
  }
};

/**
 * Delete an independent service
 */
export const deleteUserService = async (serviceId: string): Promise<void> => {
  try {
    const response = await api.delete(`/user-listings/services/${serviceId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete service');
    }
  } catch (error: any) {
    console.error('Error deleting service:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete service');
  }
};

// ================== INDEPENDENT PRODUCTS API ==================

/**
 * Get current user's independent products
 */
export const getUserProducts = async (): Promise<IndependentProduct[]> => {
  try {
    const response = await api.get('/user-listings/products');
    if (response.data.success) {
      return response.data.products;
    }
    throw new Error(response.data.message || 'Failed to fetch products');
  } catch (error: any) {
    console.error('Error fetching user products:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products');
  }
};

/**
 * Create a new independent product
 */
export const createUserProduct = async (productData: CreateProductData): Promise<IndependentProduct> => {
  try {
    const response = await api.post('/user-listings/products', productData);
    if (response.data.success) {
      return response.data.product;
    }
    throw new Error(response.data.message || 'Failed to create product');
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create product');
  }
};

/**
 * Update an independent product
 */
export const updateUserProduct = async (productId: string, productData: UpdateProductData): Promise<IndependentProduct> => {
  try {
    const response = await api.put(`/user-listings/products/${productId}`, productData);
    if (response.data.success) {
      return response.data.product;
    }
    throw new Error(response.data.message || 'Failed to update product');
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update product');
  }
};

/**
 * Delete an independent product
 */
export const deleteUserProduct = async (productId: string): Promise<void> => {
  try {
    const response = await api.delete(`/user-listings/products/${productId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete product');
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete product');
  }
};

// ================== COMBINED LISTINGS API ==================

/**
 * Get all user's independent listings (services + products)
 */
export const getAllUserListings = async (): Promise<{
  data: {
    services: number;
    products: number;
    totalListings: number;
  };
  services: IndependentService[];
  products: IndependentProduct[];
}> => {
  try {
    const response = await api.get('/user-listings/all');
    if (response.data.success) {
      return {
        data: response.data.data,
        services: response.data.services,
        products: response.data.products
      };
    }
    throw new Error(response.data.message || 'Failed to fetch listings');
  } catch (error: any) {
    console.error('Error fetching user listings:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch listings');
  }
};

// ================== PUBLIC SEARCH API ==================

/**
 * Search independent services (public)
 */
export const searchIndependentServices = async (params: SearchServicesParams): Promise<PaginatedResponse<IndependentService>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.city) queryParams.append('city', params.city);
    if (params.category) queryParams.append('category', params.category);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get(`/user-listings/search/services?${queryParams}`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.services,
        pagination: response.data.pagination
      };
    }
    throw new Error(response.data.message || 'Failed to search services');
  } catch (error: any) {
    console.error('Error searching services:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to search services');
  }
};

/**
 * Search independent products (public)
 */
export const searchIndependentProducts = async (params: SearchProductsParams): Promise<PaginatedResponse<IndependentProduct>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());

    const response = await api.get(`/user-listings/search/products?${queryParams}`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.products,
        pagination: response.data.pagination
      };
    }
    throw new Error(response.data.message || 'Failed to search products');
  } catch (error: any) {
    console.error('Error searching products:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to search products');
  }
};

/**
 * Combined search for user listings (services and products)
 */
export const searchUserListings = async (params: SearchParams): Promise<{ services: IndependentService[]; products: IndependentProduct[] }> => {
  try {
    const promises: Promise<any>[] = [];
    
    // Build service search params
    const serviceParams: SearchServicesParams = {
      q: params.query,
      city: params.location,
      page: params.page || 1,
      limit: params.limit || 20
    };
    
    // Build product search params  
    const productParams: SearchProductsParams = {
      q: params.query,
      page: params.page || 1,
      limit: params.limit || 20,
      inStock: params.available
    };
    
    // Search based on type parameter
    if (!params.type || params.type === 'service') {
      promises.push(
        searchIndependentServices(serviceParams)
          .then(result => ({ services: result.data }))
          .catch(() => ({ services: [] }))
      );
    } else {
      promises.push(Promise.resolve({ services: [] }));
    }
    
    if (!params.type || params.type === 'product') {
      promises.push(
        searchIndependentProducts(productParams)
          .then(result => ({ products: result.data }))
          .catch(() => ({ products: [] }))
      );
    } else {
      promises.push(Promise.resolve({ products: [] }));
    }
    
    const results = await Promise.all(promises);
    
    // Combine results
    const services = results[0]?.services || [];
    const products = results[1]?.products || [];
    
    // Apply price filtering if specified
    let filteredServices = services;
    let filteredProducts = products;
    
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const minPrice = params.minPrice || 0;
      const maxPrice = params.maxPrice || Number.MAX_VALUE;
      
      filteredServices = services.filter(s => {
        const price = s.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
      
      filteredProducts = products.filter(p => {
        const price = p.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    // Apply sorting if specified
    if (params.sortBy) {
      const sortFn = (a: any, b: any) => {
        switch (params.sortBy) {
          case 'price_low':
            return (a.price || 0) - (b.price || 0);
          case 'price_high':
            return (b.price || 0) - (a.price || 0);
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'rating':
            return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
          default:
            return 0;
        }
      };
      
      filteredServices.sort(sortFn);
      filteredProducts.sort(sortFn);
    }
    
    return {
      services: filteredServices,
      products: filteredProducts
    };
  } catch (error: any) {
    console.error('Error searching user listings:', error);
    throw new Error(error.message || 'Failed to search listings');
  }
};

// ================== ERROR HANDLER ==================

export const handleUserListingsError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const userListingsExports = {
  // Services
  getUserServices,
  createUserService,
  updateUserService,
  deleteUserService,
  
  // Products
  getUserProducts,
  createUserProduct,
  updateUserProduct,
  deleteUserProduct,
  
  // Combined
  getAllUserListings,
  
  // Search
  searchIndependentServices,
  searchIndependentProducts,
  searchUserListings,
  
  // Error handling
  handleUserListingsError
};

export default userListingsExports;
