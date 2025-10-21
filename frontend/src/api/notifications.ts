import api from '@/lib/api';

const API_BASE_URL = '/api';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('daleel-token');
  }
  return null;
}

// Customer Notifications
export async function getCustomerNotifications(page = 1, limit = 20, type?: string, isRead?: boolean) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(type && { type }),
    ...(isRead !== undefined && { isRead: isRead.toString() })
  });
  const { data } = await api.get(`/dashboard/customer/all-notifications?${params}`);
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { data } = await api.patch(`/dashboard/customer/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.patch('/dashboard/customer/notifications/read-all');
  return data;
}

/**
 * Get all notifications for a user (general purpose)
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<NotificationsResponse> {
  const token = getAuthToken();
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notifications');
  }

  return await response.json();
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(userId: string): Promise<NotificationStats> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notification stats');
  }

  const data = await response.json();
  return data.stats;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch unread count');
  }

  const data = await response.json();
  return data.unreadCount;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete notification');
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(userId: string): Promise<{ deletedCount: number }> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/mark-all-read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete read notifications');
  }

  const data = await response.json();
  return { deletedCount: data.deletedCount };
}

// Types
export interface Notification {
  id: string;
  type: 'SYSTEM' | 'BOOKING' | 'ORDER' | 'CHAT' | 'REVIEW' | 'PRODUCT' | 'COUPON' | 'BOOKING_NEW' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'MESSAGE_NEW' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'REMINDER' | 'PROMOTION';
  title: string;
  message: string;
  metadata?: any;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  imageUrl?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

// ==================== PROVIDER NOTIFICATIONS ====================

/**
 * Get all notifications for the authenticated provider
 */
export async function getProviderNotifications(
  page: number = 1,
  limit: number = 20,
  status: 'all' | 'read' | 'unread' = 'all',
  type?: string
): Promise<ProviderNotificationsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
    ...(type && { type }),
  });

  const { data } = await api.get(`/notifications/provider?${params}`);
  return data;
}

/**
 * Get unread notification count for provider
 */
export async function getProviderUnreadCount(): Promise<number> {
  const { data } = await api.get('/notifications/provider/unread-count');
  return data.unreadCount;
}

/**
 * Get notification statistics for provider
 */
export async function getProviderNotificationStats(): Promise<NotificationStats> {
  const { data } = await api.get('/notifications/provider/stats');
  return data.stats;
}

/**
 * Mark a specific provider notification as read
 */
export async function markProviderNotificationAsRead(notificationId: string) {
  const { data } = await api.patch(`/notifications/provider/${notificationId}/mark-read`);
  return data;
}

/**
 * Mark all provider notifications as read
 */
export async function markAllProviderNotificationsAsRead() {
  const { data } = await api.patch('/notifications/provider/mark-all-read');
  return data;
}

/**
 * Delete a provider notification
 */
export async function deleteProviderNotification(notificationId: string) {
  const { data } = await api.delete(`/notifications/provider/${notificationId}`);
  return data;
}

// Types
export interface ProviderNotificationsResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

/**
 * Get notification icon, color and background color based on type
 */
export function getNotificationMeta(type: string): {
  icon: string;
  color: string;
  bgColor: string;
} {
  const meta: Record<string, { icon: string; color: string; bgColor: string }> = {
    BOOKING: { icon: 'Calendar', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    BOOKING_NEW: { icon: 'Calendar', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    BOOKING_CONFIRMED: { icon: 'CheckCircle', color: 'text-green-500', bgColor: 'bg-green-50' },
    BOOKING_CANCELLED: { icon: 'XCircle', color: 'text-red-500', bgColor: 'bg-red-50' },
    BOOKING_COMPLETED: { icon: 'CheckCircle2', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    REVIEW: { icon: 'Star', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    CHAT: { icon: 'MessageSquare', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    MESSAGE_NEW: { icon: 'MessageSquare', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    ORDER: { icon: 'ShoppingCart', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    PAYMENT_SUCCESS: { icon: 'DollarSign', color: 'text-green-500', bgColor: 'bg-green-50' },
    PAYMENT_FAILED: { icon: 'AlertCircle', color: 'text-red-500', bgColor: 'bg-red-50' },
    REMINDER: { icon: 'Clock', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    SYSTEM: { icon: 'Info', color: 'text-stone-500', bgColor: 'bg-stone-50' },
    PRODUCT: { icon: 'Package', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
    COUPON: { icon: 'Gift', color: 'text-pink-500', bgColor: 'bg-pink-50' },
    PROMOTION: { icon: 'Gift', color: 'text-pink-500', bgColor: 'bg-pink-50' },
  };

  return meta[type] || meta.SYSTEM;
}
