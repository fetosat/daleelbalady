import api from '@/lib/api'

// Types for dashboard data
export interface DashboardStats {
  totalUsers: number
  totalServices: number
  totalOrders: number
  totalBookings: number
  totalRevenue: number
  totalShops: number
  activeUsers: number
  monthlyGrowth: {
    users: number
    revenue: number
    orders: number
    services: number
  }
}

export interface RecentActivity {
  id: string
  type: 'user' | 'order' | 'booking' | 'service' | 'review' | 'payment'
  title: string
  description: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: string
  metadata?: {
    amount?: number
    status?: string
    location?: string
  }
}

export interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  userGrowthData: Array<{
    date: string
    users: number
    newUsers: number
  }>
  usersByLocation: Array<{
    location: string
    count: number
  }>
  usersByRole: Array<{
    role: string
    count: number
  }>
}

export interface OrderAnalytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersToday: number
  orderGrowthData: Array<{
    date: string
    orders: number
    revenue: number
  }>
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  topProducts: Array<{
    name: string
    orderCount: number
    revenue: number
  }>
}

export interface ServiceAnalytics {
  totalServices: number
  totalBookings: number
  bookingsToday: number
  averageRating: number
  serviceGrowthData: Array<{
    date: string
    services: number
    bookings: number
  }>
  topServices: Array<{
    name: string
    bookingCount: number
    rating: number
  }>
  servicesByCategory: Array<{
    category: string
    count: number
  }>
}

export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  userId?: string
  metadata?: any
}

class DashboardService {
  private hasShownOfflineMessage = false;

  private showOfflineMessage() {
    if (!this.hasShownOfflineMessage) {
      console.info('📊 Dashboard running in offline mode with mock data');
      this.hasShownOfflineMessage = true;
    }
  }

  // Get overall dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/admin/stats')
      return response.data
    } catch (error) {
      this.showOfflineMessage();
      return this.getMockDashboardStats()
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get(`/dashboard/recent-activities?limit=${limit}`)
      return response.data
    } catch (error) {
      // Silently use mock data when backend is not available
      return this.getMockRecentActivities()
    }
  }

  // Get user analytics
  async getUserAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<UserAnalytics> {
    try {
      const response = await api.get(`/analytics/users?period=${period}`)
      return response.data
    } catch (error) {
      // Silently use mock data when backend is not available
      return this.getMockUserAnalytics()
    }
  }

  // Get order analytics
  async getOrderAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<OrderAnalytics> {
    try {
      const response = await api.get(`/analytics/orders?period=${period}`)
      return response.data
    } catch (error) {
      // Silently use mock data when backend is not available
      return this.getMockOrderAnalytics()
    }
  }

  // Get service analytics
  async getServiceAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<ServiceAnalytics> {
    try {
      const response = await api.get(`/analytics/services?period=${period}`)
      return response.data
    } catch (error) {
      console.error('Error fetching service analytics:', error)
      return this.getMockServiceAnalytics()
    }
  }

  // Get notifications
  async getNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: NotificationData[]
    totalCount: number
    unreadCount: number
  }> {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return {
        notifications: this.getMockNotifications(),
        totalCount: 5,
        unreadCount: 2
      }
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/mark-all-read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Get real-time metrics
  async getRealTimeMetrics(): Promise<{
    activeUsers: number
    onlineUsers: number
    currentOrders: number
    systemLoad: number
    responseTime: number
  }> {
    try {
      const response = await api.get('/dashboard/realtime-metrics')
      return response.data
    } catch (error) {
      // Silently use mock data when backend is not available
      return {
        activeUsers: Math.floor(Math.random() * 100) + 50,
        onlineUsers: Math.floor(Math.random() * 50) + 25,
        currentOrders: Math.floor(Math.random() * 20) + 5,
        systemLoad: Math.random() * 100,
        responseTime: Math.random() * 500 + 100
      }
    }
  }

  // Mock data methods (fallbacks)
  private getMockDashboardStats(): DashboardStats {
    return {
      totalUsers: 1245,
      totalServices: 892,
      totalOrders: 3456,
      totalBookings: 2341,
      totalRevenue: 125000,
      totalShops: 324,
      activeUsers: 89,
      monthlyGrowth: {
        users: 12.5,
        revenue: 8.3,
        orders: 15.2,
        services: 6.7
      }
    }
  }

  private getMockRecentActivities(): RecentActivity[] {
    return [
      {
        id: '1',
        type: 'order',
        title: 'طلب جديد',
        description: 'تم إنشاء طلب بقيمة 250 ريال',
        user: { name: 'أحمد محمد' },
        timestamp: new Date().toISOString(),
        metadata: { amount: 250, status: 'pending' }
      },
      {
        id: '2',
        type: 'user',
        title: 'مستخدم جديد',
        description: 'انضم مستخدم جديد للمنصة',
        user: { name: 'فاطمة علي' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '3',
        type: 'booking',
        title: 'حجز جديد',
        description: 'تم حجز خدمة صيانة سيارات',
        user: { name: 'محمد سالم' },
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        metadata: { amount: 150, status: 'confirmed' }
      }
    ]
  }

  private getMockUserAnalytics(): UserAnalytics {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return {
      totalUsers: 1245,
      activeUsers: 89,
      newUsersToday: 12,
      userGrowthData: dates.map(date => ({
        date,
        users: Math.floor(Math.random() * 50) + 20,
        newUsers: Math.floor(Math.random() * 15) + 2
      })),
      usersByLocation: [
        { location: 'الرياض', count: 456 },
        { location: 'جدة', count: 342 },
        { location: 'الدمام', count: 234 },
        { location: 'المدينة', count: 123 },
        { location: 'أخرى', count: 90 }
      ],
      usersByRole: [
        { role: 'عميل', count: 890 },
        { role: 'مقدم خدمة', count: 234 },
        { role: 'صاحب متجر', count: 89 },
        { role: 'مدير', count: 32 }
      ]
    }
  }

  private getMockOrderAnalytics(): OrderAnalytics {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return {
      totalOrders: 3456,
      totalRevenue: 125000,
      averageOrderValue: 36.2,
      ordersToday: 24,
      orderGrowthData: dates.map(date => ({
        date,
        orders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000
      })),
      ordersByStatus: [
        { status: 'مكتمل', count: 2890 },
        { status: 'قيد المعالجة', count: 234 },
        { status: 'ملغي', count: 156 },
        { status: 'مرفوض', count: 176 }
      ],
      topProducts: [
        { name: 'هاتف ذكي', orderCount: 89, revenue: 45000 },
        { name: 'لابتوب', orderCount: 67, revenue: 67000 },
        { name: 'ساعة ذكية', orderCount: 45, revenue: 23000 }
      ]
    }
  }

  private getMockServiceAnalytics(): ServiceAnalytics {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return {
      totalServices: 892,
      totalBookings: 2341,
      bookingsToday: 18,
      averageRating: 4.6,
      serviceGrowthData: dates.map(date => ({
        date,
        services: Math.floor(Math.random() * 20) + 5,
        bookings: Math.floor(Math.random() * 40) + 10
      })),
      topServices: [
        { name: 'صيانة سيارات', bookingCount: 234, rating: 4.8 },
        { name: 'تنظيف منازل', bookingCount: 189, rating: 4.7 },
        { name: 'توصيل طعام', bookingCount: 156, rating: 4.5 }
      ],
      servicesByCategory: [
        { category: 'صيانة', count: 234 },
        { category: 'تنظيف', count: 189 },
        { category: 'توصيل', count: 156 },
        { category: 'استشارات', count: 123 },
        { category: 'أخرى', count: 190 }
      ]
    }
  }

  private getMockNotifications(): NotificationData[] {
    return [
      {
        id: '1',
        title: 'طلب جديد',
        message: 'لديك طلب جديد بقيمة 250 ريال',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'تأكيد الدفع',
        message: 'تم تأكيد دفع الطلب #12345',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '3',
        title: 'تحديث النظام',
        message: 'سيتم تحديث النظام في الساعة 12:00 ص',
        type: 'warning',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ]
  }
}

export const dashboardService = new DashboardService()
