import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Star,
  Clock,
  Target,
  Award,
  Eye,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getProviderAnalytics, exportAnalyticsReport, type AnalyticsData } from '@/api/analytics';
import { useToast } from '@/components/ui/use-toast';

interface ProviderAnalytics {
  earnings: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    trend: 'up' | 'down';
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    completionRate: number;
  };
  customers: {
    total: number;
    returning: number;
    new: number;
    retention: number;
  };
  rating: {
    average: number;
    totalReviews: number;
    breakdown: { stars: number; count: number }[];
  };
  performance: {
    responseTime: number; // hours
    onTimeRate: number; // percentage
    customerSatisfaction: number;
  };
}

export default function ProviderAnalyticsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch real analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const data = await getProviderAnalytics(user.id, selectedPeriod);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: 'فشل تحميل البيانات',
          description: 'حدث خطأ أثناء تحميل بيانات التحليلات',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, selectedPeriod, toast]);

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      await exportAnalyticsReport(user.id, format, selectedPeriod);
      toast({
        title: 'تم التصدير بنجاح',
        description: `تم تحميل التقرير بصيغة ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'فشل التصدير',
        description: 'حدث خطأ أثناء تصدير التقرير',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Transform API data for charts and display
  const analytics = analyticsData ? {
    earnings: {
      total: analyticsData.metrics.earnings.total,
      thisMonth: analyticsData.metrics.earnings.total,
      lastMonth: analyticsData.metrics.earnings.total / (1 + analyticsData.metrics.earnings.growth / 100),
      growth: analyticsData.metrics.earnings.growth,
      trend: analyticsData.metrics.earnings.trend
    },
    bookings: {
      total: analyticsData.metrics.completionRate.total,
      completed: analyticsData.metrics.completionRate.completed,
      pending: 0,
      cancelled: analyticsData.metrics.completionRate.total - analyticsData.metrics.completionRate.completed,
      completionRate: analyticsData.metrics.completionRate.rate
    },
    customers: {
      total: analyticsData.metrics.customerRetention.totalCustomers,
      returning: analyticsData.metrics.customerRetention.returningCustomers,
      new: analyticsData.metrics.customerRetention.totalCustomers - analyticsData.metrics.customerRetention.returningCustomers,
      retention: analyticsData.metrics.customerRetention.rate
    },
    rating: {
      average: analyticsData.metrics.averageRating.rating,
      totalReviews: analyticsData.metrics.averageRating.totalReviews,
      breakdown: [
        { stars: 5, count: analyticsData.ratingDistribution.star5 },
        { stars: 4, count: analyticsData.ratingDistribution.star4 },
        { stars: 3, count: analyticsData.ratingDistribution.star3 },
        { stars: 2, count: analyticsData.ratingDistribution.star2 },
        { stars: 1, count: analyticsData.ratingDistribution.star1 }
      ]
    },
    performance: {
      responseTime: analyticsData.performanceMetrics.responseTime.average,
      onTimeRate: analyticsData.performanceMetrics.onTimeRate.rate,
      customerSatisfaction: analyticsData.performanceMetrics.customerSatisfaction.score / 20 // Convert to 0-5 scale
    }
  } : null;

  const earningsData = analyticsData?.monthlyEarnings || [];
  const servicePerformance = analyticsData?.servicePerformance || [];
  const customerActivityData = analyticsData?.customerActivity || [];

  const ratingDistribution = analytics?.rating.breakdown.map(item => ({
    name: `${item.stars} نجوم`,
    value: item.count,
    percentage: analytics.rating.totalReviews > 0 ? (item.count / analytics.rating.totalReviews) * 100 : 0
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التحليلات والإحصائيات</h1>
          <p className="text-muted-foreground">
            تتبع أداءك المهني وإيراداتك ورضا العملاء
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'quarter' | 'year')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'جاري التصدير...' : 'تحميل التقرير'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800 ">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600  tex dark:text-green-400 t-sm font-medium">إجمالي الأرباح</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400" >
                    {analytics.earnings.total.toLocaleString()} جنيه
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.earnings.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-green-500 dark:text-green-400 " />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 dark:text-red-400" />
                    )}
                    <span className={`text-xs font-medium ${analytics.earnings.trend === 'up' ? 'text-green-500 dark:text-green-400 ' : 'text-red-500 dark:text-red-400'
                      }`}>
                      {analytics.earnings.growth > 0 ? '+' : ''}{analytics.earnings.growth}%
                    </span>
                    <span className="text-stone-500 text-xs">من الشهر السابق</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 dark:text-green-400 " />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800  ">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">معدل الإنجاز</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {analytics.bookings.completionRate}%
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    {analytics.bookings.completed} من {analytics.bookings.total} حجز
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">التقييم العام</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {analytics.rating.average} ⭐
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    من {analytics.rating.totalReviews} تقييم
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950 dark:to-pink-950 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">معدل العودة</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {analytics.customers.retention}%
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    {analytics.customers.returning} عميل عائد
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="earnings">الأرباح</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  الأرباح الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'earnings' ? `${value} جنيه` : `${value} حجز`,
                        name === 'earnings' ? 'الأرباح' : 'الحجوزات'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#earningsGradient)"
                    />
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  نشاط العملاء الأسبوعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip formatter={(value, name) => [
                      value,
                      name === 'bookings' ? 'الحجوزات' : 'المكتمل'
                    ]} />
                    <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service Performance */}
          <Card>
            <CardHeader>
              <CardTitle>أداء الخدمات</CardTitle>
              <CardDescription>إحصائيات مفصلة لكل خدمة تقدمها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicePerformance.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{service.name}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{service.bookings} حجز</span>
                        <span>{service.revenue.toLocaleString()} جنيه</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{service.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {((service.revenue / service.bookings) || 0).toFixed(0)} جنيه/حجز
                      </Badge>
                      {service.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 inline-block mr-2" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 inline-block mr-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          {/* Detailed earnings analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {analytics.earnings.thisMonth.toLocaleString()} جنيه
                </div>
                <p className="text-sm text-muted-foreground">أرباح هذا الشهر</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {(analytics.earnings.thisMonth / analytics.bookings.completed || 0).toFixed(0)} جنيه
                </div>
                <p className="text-sm text-muted-foreground">متوسط الربح للحجز</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {((analytics.earnings.thisMonth - analytics.earnings.lastMonth) || 0).toLocaleString()} جنيه
                </div>
                <p className="text-sm text-muted-foreground">الزيادة عن الشهر الماضي</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings trend chart */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الأرباح</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} جنيه`, 'الأرباح']} />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <Badge variant="secondary">ممتاز</Badge>
                </div>
                <div className="text-2xl font-bold mb-2">{analytics.performance.responseTime} ساعة</div>
                <p className="text-sm text-muted-foreground">متوسط وقت الاستجابة</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-green-500" />
                  <Badge variant="default">جيد جداً</Badge>
                </div>
                <div className="text-2xl font-bold mb-2">{analytics.performance.onTimeRate}%</div>
                <p className="text-sm text-muted-foreground">معدل الالتزام بالمواعيد</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 w-8 text-yellow-500" />
                  <Badge variant="outline">ممتاز</Badge>
                </div>
                <div className="text-2xl font-bold mb-2">{analytics.performance.customerSatisfaction}/5</div>
                <p className="text-sm text-muted-foreground">رضا العملاء</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tips */}
          <Card>
            <CardHeader>
              <CardTitle>نصائح لتحسين الأداء</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">تحسين وقت الاستجابة</h4>
                  <p className="text-sm text-blue-600">حاول الرد على الحجوزات الجديدة خلال ساعة واحدة</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">الالتزام بالمواعيد</h4>
                  <p className="text-sm text-green-600">أداؤك ممتاز في الالتزام بالمواعيد، استمر هكذا!</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">طلب المزيد من التقييمات</h4>
                  <p className="text-sm text-yellow-600">اطلب من عملائك تقييم خدماتك لزيادة مصداقيتك</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع التقييمات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ratingDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[
                          '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'
                        ][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} تقييم`, 'العدد']} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="space-y-2 mt-4">
                  {ratingDistribution.map((rating, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][index] }}
                        />
                        <span>{rating.name}</span>
                      </div>
                      <span className="font-medium">{rating.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص التقييمات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {analytics.rating.average}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(analytics.rating.average)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-stone-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    من {analytics.rating.totalReviews} تقييم
                  </p>
                </div>

                <div className="space-y-3">
                  {analytics.rating.breakdown.reverse().map((rating, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating.stars}★</span>
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{
                            width: `${(rating.count / analytics.rating.totalReviews) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm w-8">{rating.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
