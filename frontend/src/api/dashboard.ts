import api from '@/lib/api';

// Customer Dashboard Overview
export async function getCustomerOverview() {
  const { data } = await api.get('/dashboard/customer/overview');
  return data;
}

// Customer Notifications
export async function getCustomerNotifications(page = 1, limit = 10) {
  const { data } = await api.get(`/dashboard/customer/notifications?page=${page}&limit=${limit}`);
  return data;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { data } = await api.patch(`/dashboard/customer/notifications/${notificationId}/read`);
  return data;
}

// Types for the dashboard data
export interface CustomerOverview {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePic: string;
    role: string;
    isVerified: boolean;
    verifiedBadge: string;
    createdAt: string;
  };
  stats: {
    totalBookings: number;
    totalOrders: number;
    totalSpent: number;
    unreadNotifications: number;
  };
  recentBookings: Array<{
    id: string;
    bookingRef: string;
    serviceName: string;
    shopName: string;
    startAt: string;
    endAt: string;
    status: string;
    price: number;
    currency: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    currency: string;
    status: string;
    createdAt: string;
    itemsCount: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
  activeSubscriptions: Array<{
    id: string;
    planName: string;
    planDescription: string;
    priceCents: number;
    startedAt: string;
    expiresAt: string;
    selectedCategory: string;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    shopName: string;
    createdAt: string;
    isVerified: boolean;
  }>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string;
}
