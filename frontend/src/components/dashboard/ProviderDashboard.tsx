'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Calendar,
  Star,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  CreditCard,
  Settings,
  FileText,
  Crown,
  Zap,
  Store,
  Eye,
  Edit,
  ExternalLink,
  Bell,
  Percent,
  Target,
  Award,
  Activity,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import { SubscriptionButton, PaymentStatusButton } from '@/components/payments/PaymentButton';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function ProviderDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Enhanced state for comprehensive dashboard data
  const [stats, setStats] = useState({
    // Basic stats
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    totalBookings: 0,
    averageRating: 0,
    upcomingBookings: 0,
    activeServices: 0,
    
    // Enhanced metrics
    monthlyGrowth: {
      earnings: 0,
      bookings: 0,
      customers: 0
    },
    
    customerMetrics: {
      totalCustomers: 0,
      returningCustomers: 0,
      newThisMonth: 0,
      customerRetentionRate: 0
    },
    
    performance: {
      responseTime: 0, // hours
      cancellationRate: 0, // percentage
      completionRate: 0, // percentage
      popularServiceHours: []
    },
    
    financial: {
      pendingPayments: 0,
      thisWeekRevenue: 0,
      projectedMonthlyRevenue: 0,
      averageServiceValue: 0
    }
  });
  
  const [chartData, setChartData] = useState({
    monthlyEarnings: [],
    serviceDistribution: [],
    peakHours: [],
    customerGrowth: [],
    weeklyBookings: []
  });
  
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Get user display name
  const displayName = user?.name || 'مقدم الخدمة';

  // Process real chart data from API or show empty state
  const processChartData = (apiData: any) => {
    setChartData({
      monthlyEarnings: apiData?.monthlyEarnings || [],
      serviceDistribution: apiData?.serviceDistribution || [],
      peakHours: apiData?.peakHours || [],
      customerGrowth: apiData?.customerGrowth || [],
      weeklyBookings: apiData?.weeklyBookings || []
    });
  };

  // Fetch enhanced provider data
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setIsLoading(true);
        
        // Import the provider API
        const { providerAPI } = await import('@/api/provider');
        
        // Fetch stats from provider API using dedicated function
        const statsResponse = await providerAPI.getStats();
        if (statsResponse.success) {
          const apiStats = statsResponse.stats;
          
          // Use ONLY real API data - no mock fallbacks
          const enhancedStats = {
            // Basic stats from API
            totalEarnings: apiStats.totalRevenue || 0,
            thisMonth: apiStats.thisMonthRevenue || 0,
            lastMonth: apiStats.lastMonthRevenue || 0,
            totalBookings: apiStats.totalBookings || 0,
            averageRating: apiStats.avgRating || 0,
            upcomingBookings: apiStats.upcomingBookings || 0,
            activeServices: apiStats.activeServices || 0,
            
            // Enhanced metrics from API only
            monthlyGrowth: {
              earnings: apiStats.monthlyGrowth?.earnings || 0,
              bookings: apiStats.monthlyGrowth?.bookings || 0,
              customers: apiStats.monthlyGrowth?.customers || 0
            },
            
            customerMetrics: {
              totalCustomers: apiStats.customerMetrics?.total || 0,
              returningCustomers: apiStats.customerMetrics?.returning || 0,
              newThisMonth: apiStats.customerMetrics?.newThisMonth || 0,
              customerRetentionRate: apiStats.customerMetrics?.retentionRate || 0
            },
            
            performance: {
              responseTime: apiStats.performance?.responseTime || 0,
              cancellationRate: apiStats.performance?.cancellationRate || 0,
              completionRate: apiStats.performance?.completionRate || 0,
              popularServiceHours: apiStats.performance?.popularHours || []
            },
            
            financial: {
              pendingPayments: apiStats.financial?.pending || 0,
              thisWeekRevenue: apiStats.financial?.thisWeek || 0,
              projectedMonthlyRevenue: apiStats.financial?.projected || 0,
              averageServiceValue: apiStats.financial?.avgValue || 0
            }
          };
          
          setStats(enhancedStats);
          
          // Process real chart data from API
          processChartData(apiStats.chartData);
        } else {
          // Show empty state - NO mock data
          console.warn('⚠️ No stats data from API');
        }

        // Process real chart data
        
        // Fetch real notifications from API
        try {
          const notifResponse = await api.get('/notifications/recent');
          if (notifResponse.data && notifResponse.data.notifications) {
            setNotifications(notifResponse.data.notifications);
          } else {
            setNotifications([]); // Empty if no notifications
          }
        } catch (notifError) {
          console.warn('⚠️ Could not fetch notifications');
          setNotifications([]);
        }

        // Fetch subscription data
        try {
          const subscriptionResponse = await api.get('/subscriptions');
          if (subscriptionResponse.data && subscriptionResponse.data.length > 0) {
            const providerSub = subscriptionResponse.data.find((sub: any) => sub.planType === 'PROVIDER') || subscriptionResponse.data[0];
            setSubscription(providerSub);
          }
        } catch (subError) {
          console.error('Error fetching subscription:', subError);
        }

        // Fetch real recent bookings from API
        try {
          const bookingsResponse = await api.get('/dashboard/provider/bookings/recent?limit=5');
          if (bookingsResponse.data && bookingsResponse.data.bookings) {
            setRecentBookings(bookingsResponse.data.bookings);
          } else {
            setRecentBookings([]); // Empty if no bookings
          }
        } catch (bookingError) {
          console.warn('⚠️ Could not fetch recent bookings');
          setRecentBookings([]);
        }
        
      } catch (error: any) {
        console.error('❌ Error fetching provider data:', error);
        console.error('🔍 Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        });
        // Show empty state on error - NO mock data
        toast({
          title: 'خطأ في تحميل البيانات',
          description: 'لم نتمكن من تحميل إحصائيات حسابك. حاول مرة أخرى.',
          variant: 'destructive',
        });
        // Keep stats at zero - show empty state
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProviderData();
    }
  }, [user]);

  // Chart colors
  const chartColors = {
    primary: '#10b981',
    secondary: '#3b82f6', 
    accent: '#f59e0b',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#06b6d4',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1'
  };
  
  const pieColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  const getGrowthIcon = (value: number) => {
    return value > 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />;
  };
  
  const getGrowthColor = (value: number) => {
    return value > 0 ? 'text-green-500' : 'text-red-500';
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'REVIEW_RECEIVED':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-stone-500" />;
    }
  };
  
  const getNotificationPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-l-stone-500 bg-stone-50 dark:bg-stone-950';
    }
  };

  const quickActions = [
    {
      title: t('navbar.myListings'),
      description: t('dashboard.provider.manageListings'),
      icon: <Store className="h-6 w-6" />,
      action: () => router.push('/mylistings'),
      color: 'bg-indigo-500'
    },
    {
      title: t('dashboard.provider.bookingsManagement'),
      description: t('dashboard.provider.trackAppointments'),
      icon: <Calendar className="h-6 w-6" />,
      action: () => router.push('/dashboard/bookings'),
      color: 'bg-green-500'
    },
    {
      title: t('dashboard.provider.paymentsEarnings'),
      description: t('dashboard.provider.managePayments'),
      icon: <CreditCard className="h-6 w-6" />,
      action: () => router.push('/payment-history'),
      color: 'bg-purple-500'
    },
    {
      title: t('dashboard.provider.subscriptionPlans'),
      description: t('dashboard.provider.subscriptionDesc'),
      icon: <Crown className="h-6 w-6" />,
      action: () => router.push('/subscription-plans'),
      color: 'bg-yellow-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto mb-4"></div>
          <p className="text-stone-400">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-100 mb-2">
            مرحباً، {displayName}! 👋
          </h1>
          <p className="text-stone-400">إليك ما يحدث مع نشاطك التجاري اليوم</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <Button variant="outline" size="sm" className="border-stone-700 text-stone-300 hover:bg-stone-800">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
          <Button variant="outline" size="sm" className="border-stone-700 text-stone-300 hover:bg-stone-800">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث البيانات
          </Button>
        </div>
      </div>
      
      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-blue-500/50 bg-blue-950/20">
              <Bell className="h-4 w-4 text-blue-400" />
              <AlertTitle className="text-blue-400">إشعارات جديدة</AlertTitle>
              <AlertDescription className="text-stone-300 mt-2">
                <div className="space-y-2">
                  {notifications.slice(0, 2).map((notification) => (
                    <div key={notification.id} className="flex items-center gap-2 text-sm">
                      {getNotificationIcon(notification.type)}
                      <span>{notification.message}</span>
                      <span className="text-stone-500 text-xs">منذ {notification.time}</span>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        </AnimatePresence>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-stone-900 border border-stone-800">
          <TabsTrigger value="overview" className="text-stone-300 data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100">
            <BarChart3 className="h-4 w-4 mr-2" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-stone-300 data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100">
            <Activity className="h-4 w-4 mr-2" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-stone-300 data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100">
            <Users className="h-4 w-4 mr-2" />
            العملاء
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-stone-300 data-[state=active]:bg-stone-800 data-[state=active]:text-stone-100">
            <DollarSign className="h-4 w-4 mr-2" />
            الأموال
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700 hover:border-green-600 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(stats.monthlyGrowth.earnings)}
                      <span className={`text-xs font-medium ${getGrowthColor(stats.monthlyGrowth.earnings)}`}>
                        {formatPercentage(stats.monthlyGrowth.earnings)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-green-200 mb-2">إجمالي الأرباح</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</span>
                  </div>
                  <div className="text-xs text-green-300 mt-2">
                    هذا الشهر: {formatCurrency(stats.thisMonth)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 hover:border-blue-600 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(stats.monthlyGrowth.bookings)}
                      <span className={`text-xs font-medium ${getGrowthColor(stats.monthlyGrowth.bookings)}`}>
                        {formatPercentage(stats.monthlyGrowth.bookings)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-blue-200 mb-2">إجمالي الحجوزات</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{stats.totalBookings}</span>
                  </div>
                  <div className="text-xs text-blue-300 mt-2">
                    {stats.upcomingBookings} حجز قادم
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700 hover:border-yellow-600 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      ممتاز
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-yellow-200 mb-2">متوسط التقييم</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{stats.averageRating}</span>
                    <span className="text-sm text-yellow-400">⭐</span>
                  </div>
                  <div className="text-xs text-yellow-300 mt-2">
                    من 5 نجوم
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 hover:border-purple-600 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-xs text-purple-300">
                      نشط
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-purple-200 mb-2">الخدمات النشطة</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{stats.activeServices}</span>
                  </div>
                  <div className="text-xs text-purple-300 mt-2">
                    من {stats.activeServices + 2} إجمالي
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-stone-900 border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-stone-400" />
                    <h3 className="font-medium text-stone-200">متوسط وقت الاستجابة</h3>
                  </div>
                </div>
                <div className="text-2xl font-bold text-stone-100 mb-2">
                  {stats.performance.responseTime} ساعة
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-stone-400 mt-2">ممتاز! أقل من المتوسط</p>
              </CardContent>
            </Card>

            <Card className="bg-stone-900 border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-stone-400" />
                    <h3 className="font-medium text-stone-200">معدل الإكمال</h3>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {stats.performance.completionRate}%
                </div>
                <Progress value={stats.performance.completionRate} className="h-2" />
                <p className="text-xs text-stone-400 mt-2">أداء ممتاز</p>
              </CardContent>
            </Card>

            <Card className="bg-stone-900 border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-stone-400" />
                    <h3 className="font-medium text-stone-200">معدل الإلغاء</h3>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {stats.performance.cancellationRate}%
                </div>
                <Progress value={stats.performance.cancellationRate} className="h-2" />
                <p className="text-xs text-stone-400 mt-2">ضمن المعدل الطبيعي</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Earnings Chart */}
            <Card className="bg-stone-900 border-stone-800">
              <CardHeader>
                <CardTitle className="text-stone-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  الأرباح الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke={chartColors.primary} 
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Distribution */}
            <Card className="bg-stone-900 border-stone-800">
              <CardHeader>
                <CardTitle className="text-stone-100 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  توزيع الخدمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.serviceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {chartData.serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-stone-900 border-stone-800">
            <CardHeader>
              <CardTitle className="text-stone-100 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-stone-800 border border-stone-700 rounded-lg p-4 cursor-pointer hover:bg-stone-750 transition-colors"
                    onClick={action.action}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-stone-100">{action.title}</h3>
                        <p className="text-xs text-stone-400 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours Chart */}
            <Card className="bg-stone-900 border-stone-800">
              <CardHeader>
                <CardTitle className="text-stone-100">ساعات الذروة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="bookings" fill={chartColors.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Performance */}
            <Card className="bg-stone-900 border-stone-800">
              <CardHeader>
                <CardTitle className="text-stone-100">الأداء الأسبوعي</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.weeklyBookings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey="completed" fill={chartColors.success} />
                    <Bar dataKey="cancelled" fill={chartColors.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-stone-900 border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold text-stone-100">{stats.customerMetrics.totalCustomers}</span>
                </div>
                <h3 className="font-medium text-stone-200 mb-2">إجمالي العملاء</h3>
                <div className="text-sm text-stone-400">
                  {stats.customerMetrics.newThisMonth} عميل جديد هذا الشهر
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-900 border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold text-stone-100">{stats.customerMetrics.returningCustomers}</span>
                </div>
                <h3 className="font-medium text-stone-200 mb-2">العملاء العائدون</h3>
                <div className="text-sm text-stone-400">
                  معدل الاحتفاظ {stats.customerMetrics.customerRetentionRate}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-900 border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="h-8 w-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-stone-100">{stats.averageRating}</span>
                </div>
                <h3 className="font-medium text-stone-200 mb-2">رضا العملاء</h3>
                <div className="text-sm text-stone-400">
                  من 5 نجوم
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Growth Chart */}
          <Card className="bg-stone-900 border-stone-800">
            <CardHeader>
              <CardTitle className="text-stone-100">نمو قاعدة العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Line type="monotone" dataKey="customers" stroke={chartColors.primary} strokeWidth={2} />
                  <Line type="monotone" dataKey="returning" stroke={chartColors.secondary} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="font-medium text-green-200 mb-2">الرصيد المتاح</h3>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(stats.financial.thisWeekRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="font-medium text-yellow-200 mb-2">المدفوعات المعلقة</h3>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(stats.financial.pendingPayments)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-medium text-blue-200 mb-2">الدخل المتوقع</h3>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(stats.financial.projectedMonthlyRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-medium text-purple-200 mb-2">متوسط قيمة الخدمة</h3>
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(stats.financial.averageServiceValue)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-stone-900 border-stone-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-stone-100">المعاملات الأخيرة</CardTitle>
                <Button variant="outline" size="sm" className="border-stone-700 text-stone-300 hover:bg-stone-800">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-stone-800 rounded-lg border border-stone-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-200">{booking.serviceName}</div>
                        <div className="text-sm text-stone-400">{booking.customerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-stone-200">{formatCurrency(booking.price)}</div>
                      <div className="text-sm text-stone-400">{booking.dateTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
