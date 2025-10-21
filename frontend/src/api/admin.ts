import api from '@/lib/api';

// Admin Overview Dashboard
export async function getAdminOverview() {
  const { data } = await api.get('/dashboard/admin/overview');
  return data;
}

// User Management
export async function getAdminUsers(page = 1, limit = 20, search?: string, role?: string, status?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(role && { role }),
    ...(status && { status })
  });
  const { data } = await api.get(`/dashboard/admin/users?${params}`);
  return data;
}

export async function updateAdminUser(userId: string, updateData: {
  role?: string;
  isVerified?: boolean;
  action?: 'delete' | 'restore';
}) {
  const { data } = await api.patch(`/dashboard/admin/users/${userId}`, updateData);
  return data;
}

// Shop Management
export async function getAdminShops(page = 1, limit = 20, search?: string, verified?: boolean, city?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(verified !== undefined && { verified: verified.toString() }),
    ...(city && { city })
  });
  const { data } = await api.get(`/dashboard/admin/shops?${params}`);
  return data;
}

export async function verifyShop(shopId: string, isVerified: boolean) {
  const { data } = await api.patch(`/dashboard/admin/shops/${shopId}/verify`, { isVerified });
  return data;
}

// Service Management
export async function getAdminServices(page = 1, limit = 20, search?: string, city?: string, available?: boolean) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(city && { city }),
    ...(available !== undefined && { available: available.toString() })
  });
  const { data } = await api.get(`/dashboard/admin/services?${params}`);
  return data;
}

// Product Management
export async function getAdminProducts(page = 1, limit = 20, search?: string, active?: boolean, shopId?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(active !== undefined && { active: active.toString() }),
    ...(shopId && { shopId })
  });
  const { data } = await api.get(`/dashboard/admin/products?${params}`);
  return data;
}

// Delivery Management
export async function getAdminDeliveries(page = 1, limit = 20, status?: string, date?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
    ...(date && { date })
  });
  const { data } = await api.get(`/dashboard/admin/deliveries?${params}`);
  return data;
}

export async function updateDelivery(deliveryId: string, updateData: {
  status?: string;
  carrier?: string;
  trackingCode?: string;
  eta?: string;
}) {
  const { data } = await api.patch(`/dashboard/admin/deliveries/${deliveryId}`, updateData);
  return data;
}

// Analytics
export async function getAdminAnalytics(period = '30d') {
  const params = new URLSearchParams({ period });
  const { data } = await api.get(`/dashboard/admin/analytics?${params}`);
  return data;
}

// Types
export interface AdminOverview {
  stats: {
    totalUsers: number;
    totalShops: number;
    totalServices: number;
    totalProducts: number;
    totalOrders: number;
    totalBookings: number;
    activeUsers: number;
    verifiedShops: number;
    pendingOrders: number;
    unreadNotifications: number;
    userGrowth: string;
    shopGrowth: string;
    serviceGrowth: string;
    productGrowth: string;
    orderGrowth: string;
    bookingGrowth: string;
  };
  recentActivities: {
    users: AdminUser[];
    shops: AdminShop[];
    orders: AdminOrder[];
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'SHOP_OWNER' | 'DELIVERY' | 'ADMIN' | 'GUEST';
  isVerified: boolean;
  verifiedBadge?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AdminShop {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  isVerified: boolean;
  createdAt: string;
  owner: {
    name: string;
    email: string;
    phone?: string;
  };
  _count: {
    services: number;
    products: number;
  };
}

export interface AdminService {
  id: string;
  vid?: string;
  phone?: string;
  city?: string;
  locationLat?: number;
  locationLon?: number;
  price?: number;
  currency: string;
  available: boolean;
  createdAt: string;
  translation?: {
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
  };
  ownerUser?: {
    name: string;
    email: string;
  };
  shop?: {
    name: string;
    isVerified: boolean;
  };
  _count: {
    bookings: number;
  };
}

export interface AdminProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  shop: {
    name: string;
    isVerified: boolean;
  };
  lister?: {
    name: string;
    email: string;
  };
  _count: {
    orderItems: number;
  };
}

export interface AdminDelivery {
  id: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  carrier?: string;
  trackingCode?: string;
  eta?: string;
  lastLocation?: any;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    user: {
      name: string;
      phone?: string;
    };
    items: Array<{
      product: {
        name: string;
        shop: {
          name: string;
          city?: string;
        };
      };
    }>;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface AdminAnalytics {
  revenue: {
    total: number;
    orders: number;
  };
  userGrowth: Array<{
    role: string;
    _count: number;
  }>;
  popularServices: Array<{
    serviceId: string;
    _count: { serviceId: number };
  }>;
  popularProducts: Array<{
    productId: string;
    _sum: { quantity: number };
  }>;
  period: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
