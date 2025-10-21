import axios from 'axios';

// Create axios instance with base configuration
const apiBaseURL = 'https://api.daleelbalady.com/api';
console.log('Shops API Base URL:', apiBaseURL);

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

export interface Shop {
  id: string;
  vid?: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  isVerified: boolean;
  createdAt: string;
  slug: string;
  owner: {
    name: string;
    profilePic?: string;
    bio?: string;
    isVerified: boolean;
    verifiedBadge?: string;
  };
  services: any[];
  products: any[];
  reviews: any[];
  stats: {
    totalServices: number;
    totalProducts: number;
    totalReviews: number;
    averageRating: number;
    isVerified: boolean;
  };
  design?: any;
  address?: any;
}

export interface ShopSearchParams {
  q?: string;
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ShopServicesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface ShopProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  inStock?: boolean;
}

export interface ShopReviewsParams {
  page?: number;
  limit?: number;
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
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
  stats?: {
    totalReviews?: number;
    averageRating?: number;
    [key: string]: any;
  };
}

// Shop API functions

/**
 * Get shop by slug (public route)
 */
export const getShopBySlug = async (slug: string): Promise<Shop> => {
  console.log(`Fetching shop with slug: ${slug}`);
  console.log(`Request URL: ${apiBaseURL}/shops/public/${slug}`);

  try {
    const response = await api.get(`/shops/public/${slug}`);
    console.log('Shop API Response:', response.data);

    if (response.data.success) {
      return response.data.shop;
    }
    throw new Error(response.data.message || 'Failed to fetch shop');
  } catch (error: any) {
    console.error('Shop API Error:', error);
    console.error('Error response:', error.response?.data);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.response?.status === 404) {
      throw new Error(`Shop "${slug}" not found. Please check the shop name and try again.`);
    }

    if (error.response?.status >= 500) {
      throw new Error('Server error occurred while fetching shop data. Please try again later.');
    }

    throw new Error(error.message || 'Failed to fetch shop');
  }
};

/**
 * Get shop services by slug (public route)
 */
export const getShopServices = async (
  slug: string,
  params?: ShopServicesParams
): Promise<PaginatedResponse<any>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);
  if (params?.search) queryParams.append('search', params.search);

  const response = await api.get(`/shops/public/${slug}/services?${queryParams}`);
  if (response.data.success) {
    return {
      success: true,
      data: response.data.services,
      pagination: response.data.pagination
    };
  }
  throw new Error(response.data.message || 'Failed to fetch services');
};

/**
 * Get shop products by slug (public route)
 */
export const getShopProducts = async (
  slug: string,
  params?: ShopProductsParams
): Promise<PaginatedResponse<any>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());

  const response = await api.get(`/shops/public/${slug}/products?${queryParams}`);
  if (response.data.success) {
    return {
      success: true,
      data: response.data.products,
      pagination: response.data.pagination
    };
  }
  throw new Error(response.data.message || 'Failed to fetch products');
};

/**
 * Get shop reviews by slug (public route)
 */
export const getShopReviews = async (
  slug: string,
  params?: ShopReviewsParams
): Promise<PaginatedResponse<any>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get(`/shops/public/${slug}/reviews?${queryParams}`);
  if (response.data.success) {
    return {
      success: true,
      data: response.data.reviews,
      pagination: response.data.pagination,
      stats: response.data.stats
    };
  }
  throw new Error(response.data.message || 'Failed to fetch reviews');
};

/**
 * Search shops (public route)
 */
export const searchShops = async (params: ShopSearchParams): Promise<PaginatedResponse<Shop>> => {
  // Validate that at least one search parameter is provided
  if (!params.q && !params.city && !params.category) {
    throw new Error('At least one search parameter (q, city, or category) is required');
  }

  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.city) queryParams.append('city', params.city);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  console.log('Searching shops with params:', params);
  console.log('Query string:', queryParams.toString());

  try {
    const response = await api.get(`/shops/search?${queryParams}`);
    console.log('Shop search API response:', response.data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.shops,
        pagination: response.data.pagination
      };
    }
    throw new Error(response.data.message || 'Failed to search shops');
  } catch (error: any) {
    console.error('Shop search API error:', error);
    console.error('Error response:', error.response?.data);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.response?.status === 400) {
      throw new Error('Invalid search parameters. Please provide at least one search term, city, or category.');
    }
    
    throw new Error(error.message || 'Failed to search shops');
  }
};

/**
 * Add a review to a shop (requires authentication)
 */
export const addShopReview = async (
  shopId: string,
  reviewData: CreateReviewData
): Promise<any> => {
  const response = await api.post(`/shops/${shopId}/reviews`, reviewData);
  if (response.data.success) {
    return response.data.review;
  }
  throw new Error(response.data.message || 'Failed to add review');
};

/**
 * Get current user's shops (requires authentication)
 */
export const getMyShops = async (): Promise<Shop[]> => {
  const response = await api.get('/shops/my-shops');
  if (response.data.success) {
    return response.data.shops;
  }
  throw new Error(response.data.message || 'Failed to fetch shops');
};

/**
 * Generate shop slug from name
 */
export const generateShopSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate shop slug format
 */
export const isValidShopSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 100;
};

/**
 * Get shop URL by slug
 */
export const getShopUrl = (slug: string): string => {
  const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;
  return `${baseUrl}/shop/${slug}`;
};

// Error handler for API calls
export const handleShopApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

const shopsExports = {
  getShopBySlug,
  getShopServices,
  getShopProducts,
  getShopReviews,
  searchShops,
  addShopReview,
  getMyShops,
  generateShopSlug,
  isValidShopSlug,
  getShopUrl,
  handleShopApiError
};

export default shopsExports;
