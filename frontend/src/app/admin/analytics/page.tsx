'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  ShoppingCart, 
  Store,
  Calendar,
  FileText,
  Star,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'

interface Analytics {
  totalUsers: number
  totalBusinesses: number
  totalProducts: number
  totalServices: number
  totalOrders: number
  totalBookings: number
  totalApplications: number
  totalRevenue: number
  revenueGrowth: number
  userGrowth: number
  businessGrowth: number
  popularCategories: Array<{ name: string; count: number }>
  recentActivity: Array<{ type: string; description: string; timestamp: string }>
  monthlyStats: Array<{ month: string; users: number; businesses: number; revenue: number }>
  topRatedBusinesses: Array<{ name: string; rating: number; reviewCount: number }>
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.daleelbalady.com/api/admin/analytics?days=${timeRange}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        throw new Error('فشل في تحميل التحليلات')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast.error('فشل في تحميل التحليلات')
      // Mock data for development
      setAnalytics({
        totalUsers: 1847,
        totalBusinesses: 245,
        totalProducts: 3521,
        totalServices: 892,
        totalOrders: 1267,
        totalBookings: 634,
        totalApplications: 89,
        totalRevenue: 127500,
        revenueGrowth: 15.3,
        userGrowth: 12.7,
        businessGrowth: 8.9,
        popularCategories: [
          { name: 'المطاعم', count: 156 },
          { name: 'الخدمات الطبية', count: 98 },
          { name: 'التجميل والعناية', count: 87 },
          { name: 'السيارات', count: 76 },
          { name: 'التعليم', count: 65 }
        ],
        recentActivity: [
          { type: 'user', description: 'انضم مستخدم جديد: أحمد محمد', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { type: 'business', description: 'تم الموافقة على عمل: صالون الجمال', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { type: 'order', description: 'طلب جديد بقيمة 250 جنيه', timestamp: new Date(Date.now() - 10800000).toISOString() },
          { type: 'booking', description: 'حجز جديد في عيادة الأسنان', timestamp: new Date(Date.now() - 14400000).toISOString() }
        ],
        monthlyStats: [
          { month: 'يناير', users: 145, businesses: 23, revenue: 45200 },
          { month: 'فبراير', users: 178, businesses: 28, revenue: 52800 },
          { month: 'مارس', users: 203, businesses: 34, revenue: 67300 },
          { month: 'أبريل', users: 167, businesses: 31, revenue: 58900 },
          { month: 'مايو', users: 234, businesses: 42, revenue: 78400 },
          { month: 'يونيو', users: 189, businesses: 37, revenue: 69200 }
        ],
        topRatedBusinesses: [
          { name: 'مطعم الأصالة', rating: 4.9, reviewCount: 156 },
          { name: 'عيادة د. أحمد', rating: 4.8, reviewCount: 89 },
          { name: 'صالون الجمال الراقي', rating: 4.7, reviewCount: 67 },
          { name: 'ورشة السيارات المتطورة', rating: 4.6, reviewCount: 45 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (growth < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return null
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('ar-EG').format(number)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />
      case 'business': return <Store className="w-4 h-4 text-green-500" />
      case 'order': return <ShoppingCart className="w-4 h-4 text-purple-500" />
      case 'booking': return <Calendar className="w-4 h-4 text-orange-500" />
      default: return <FileText className="w-4 h-4 text-stone-500" />
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-500" />
            التقارير والتحليلات
          </h1>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 dark:bg-stone-800 dark:border-stone-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">آخر 7 أيام</SelectItem>
                <SelectItem value="30">آخر 30 يوم</SelectItem>
                <SelectItem value="90">آخر 3 أشهر</SelectItem>
                <SelectItem value="365">آخر سنة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} variant="outline" size="sm">
              تحديث
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* إحصائيات عامة */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">إجمالي المستخدمين</p>
                      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalUsers)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(analytics.userGrowth)}
                        <span className={`text-xs ${getGrowthColor(analytics.userGrowth)}`}>
                          {analytics.userGrowth > 0 ? '+' : ''}{analytics.userGrowth}%
                        </span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">الأعمال المسجلة</p>
                      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalBusinesses)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(analytics.businessGrowth)}
                        <span className={`text-xs ${getGrowthColor(analytics.businessGrowth)}`}>
                          {analytics.businessGrowth > 0 ? '+' : ''}{analytics.businessGrowth}%
                        </span>
                      </div>
                    </div>
                    <Store className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">إجمالي الإيرادات</p>
                      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {formatCurrency(analytics.totalRevenue)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {getGrowthIcon(analytics.revenueGrowth)}
                        <span className={`text-xs ${getGrowthColor(analytics.revenueGrowth)}`}>
                          {analytics.revenueGrowth > 0 ? '+' : ''}{analytics.revenueGrowth}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">طلبات الانضمام</p>
                      <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalApplications)}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">قيد المراجعة</p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* إحصائيات تفصيلية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">المنتجات</p>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalProducts)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-pink-500" />
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">الخدمات</p>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalServices)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">الطلبات</p>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalOrders)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-500" />
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">الحجوزات</p>
                      <p className="font-bold text-stone-900 dark:text-stone-100">
                        {formatNumber(analytics.totalBookings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* الفئات الأكثر شعبية */}
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="dark:text-stone-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    الفئات الأكثر شعبية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.popularCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-stone-900 dark:text-stone-100">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${(category.count / analytics.popularCategories[0].count) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            {formatNumber(category.count)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* الأعمال الأعلى تقييماً */}
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="dark:text-stone-100 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    الأعمال الأعلى تقييماً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topRatedBusinesses.map((business, index) => (
                      <div key={business.name} className="flex items-center justify-between p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">{business.name}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {formatNumber(business.reviewCount)} تقييم
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {business.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* النشاط الأخير */}
            <Card className="dark:bg-stone-900 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="dark:text-stone-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  النشاط الأخير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm text-stone-900 dark:text-stone-100">{activity.description}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {new Date(activity.timestamp).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500 dark:text-stone-400">
            لا توجد بيانات متاحة
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
