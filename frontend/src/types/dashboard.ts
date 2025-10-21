// Unified listing types for Provider Dashboard

export type ListingType = 'SHOP' | 'SERVICE' | 'PRODUCT';

export type ListingStatus = 'active' | 'inactive' | 'pending';

export interface BaseAnalytics {
  views: number;
  bookings?: number;
  orders?: number;
  reviews: number;
  avgRating: number;
}

export interface UnifiedListing {
  id: string;
  type: ListingType;
  name: string;
  description?: string;
  city?: string;
  price?: number;
  currency?: string;
  status: ListingStatus;
  coverImage?: string;
  logoImage?: string;
  galleryImages?: string[];
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Analytics
  analytics?: BaseAnalytics;
  
  // Type-specific fields
  // Shop fields
  slug?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationLat?: number;
  locationLon?: number;
  
  // Service fields
  durationMins?: number;
  available?: boolean;
  
  // Product fields
  stock?: number;
  sku?: string;
  isActive?: boolean;
  
  // Relationships
  parentShop?: string; // For products
  parentShopId?: string;
  ownerName?: string;
  
  // Sub-items count
  servicesCount?: number;
  productsCount?: number;
}

export interface ListingFilters {
  search: string;
  type: ListingType | 'ALL';
  city: string;
  status: ListingStatus | 'all';
  sortBy: 'latest' | 'views' | 'rating' | 'name';
}

export interface ListingFormData {
  type: ListingType;
  name: string;
  description?: string;
  city?: string;
  price?: number;
  currency?: string;
  phone?: string;
  email?: string;
  website?: string;
  locationLat?: number;
  locationLon?: number;
  durationMins?: number;
  stock?: number;
  sku?: string;
  coverImage?: string;
  logoImage?: string;
  galleryImages?: string[];
  shopId?: string; // For services and products
}

export type ViewMode = 'grid' | 'table';

export interface DashboardStats {
  totalListings: number;
  totalShops: number;
  totalServices: number;
  totalProducts: number;
  totalViews: number;
  totalBookings: number;
  totalOrders: number;
  avgRating: number;
}

