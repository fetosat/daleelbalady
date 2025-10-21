'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
  Clock, Wifi, Bell, AlertCircle, CheckCircle2, Loader2, RefreshCw,
  Package, Star, MessageSquare, MapPin, Eye
} from 'lucide-react'
import { 
  dashboardService, 
  DashboardStats, 
  RecentActivity, 
  UserAnalytics, 
  OrderAnalytics 
} from '@/services/dashboardService'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RealTimeMetrics {
  activeUsers: number
  onlineUsers: number
  currentOrders: number
  systemLoad: number
  responseTime: number
}

export default function RealTimeDashboardConnected() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null)
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealTimeMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [stats, activities, userAnalytics, orderAnalytics, realtime] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities(10),
        dashboardService.getUserAnalytics('30d'),
        dashboardService.getOrderAnalytics('30d'),
        dashboardService.getRealTimeMetrics()
      ])

      setDashboardStats(stats)
      setRecentActivities(activities)
      setUserAnalytics(userAnalytics)
      setOrderAnalytics(orderAnalytics)
      setRealtimeMetrics(realtime)
      setLastUpdated(new Date())
      setIsConnected(true)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('فشل في تحميل البيانات')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto refresh data
  useEffect(() => {
    fetchDashboardData()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Simulate real-time updates for metrics
  useEffect(() => {
    const realtimeInterval = setInterval(async () => {
      if (isConnected) {
        try {
          const newMetrics = await dashboardService.getRealTimeMetrics()
          setRealtimeMetrics(newMetrics)
          setLastUpdated(new Date())
        } catch (error) {
          console.error('Error fetching real-time metrics:', error)
        }
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(realtimeInterval)
  }, [isConnected])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart
      case 'user': return Users
      case 'payment': return DollarSign
      case 'service': return Package
      case 'review': return Star
      case 'booking': return Clock
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'text-purple-500'
      case 'user': return 'text-green-500'
      case 'payment': return 'text-blue-500'
      case 'service': return 'text-orange-500'
      case 'review': return 'text-yellow-500'
      case 'booking': return 'text-indigo-500'
      default: return 'text-stone-500'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `منذ ${diffInDays} أيام`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">جاري تحميل بيانات لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="font-medium">
              {isConnected ? 'متصل بالخادم' : 'انقطع الاتصال'}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-stone-600">
          <span>آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}</span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={fetchDashboardData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </motion.div>

      {/* Real-time Metrics */}
      {realtimeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">المستخدمون النشطون</p>
                    <motion.p 
                      className="text-3xl font-bold text-green-600"
                      key={realtimeMetrics.activeUsers}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {realtimeMetrics.activeUsers.toLocaleString()}
                    </motion.p>
                    <div className="flex items-center gap-1 mt-1">
                      <Eye className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-500">
                        {realtimeMetrics.onlineUsers} متصل الآن
                      </span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">الطلبات الجارية</p>
                    <motion.p 
                      className="text-3xl font-bold text-purple-600"
                      key={realtimeMetrics.currentOrders}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {realtimeMetrics.currentOrders.toLocaleString()}
                    </motion.p>
                    <div className="flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-purple-500">نشط</span>
                    </div>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">حمولة النظام</p>
                    <motion.p 
                      className="text-3xl font-bold text-orange-600"
                      key={Math.round(realtimeMetrics.systemLoad)}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {Math.round(realtimeMetrics.systemLoad)}%
                    </motion.p>
                    <Progress 
                      value={realtimeMetrics.systemLoad} 
                      className="mt-2 h-2"
                    />
                  </div>
                  <Activity className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">وقت الاستجابة</p>
                    <motion.p 
                      className="text-3xl font-bold text-blue-600"
                      key={Math.round(realtimeMetrics.responseTime)}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {Math.round(realtimeMetrics.responseTime)}
                      <span className="text-lg text-stone-500">مس</span>
                    </motion.p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-500">متوسط</span>
                    </div>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Main Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {dashboardStats.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{dashboardStats.monthlyGrowth.users}%
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {dashboardStats.totalOrders.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{dashboardStats.monthlyGrowth.orders}%
                    </span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(dashboardStats.totalRevenue)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{dashboardStats.monthlyGrowth.revenue}%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">الخدمات المتاحة</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {dashboardStats.totalServices.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +{dashboardStats.monthlyGrowth.services}%
                    </span>
                  </div>
                </div>
                <Package className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              النشاطات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {recentActivities.map((activity, index) => {
                  const IconComponent = getActivityIcon(activity.type)
                  const colorClass = getActivityColor(activity.type)
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-stone-100 ${colorClass}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-stone-900 text-sm">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-stone-500">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-stone-500">
                            {activity.user.name}
                          </span>
                          {activity.metadata?.amount && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(activity.metadata.amount)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Growth Chart */}
        {userAnalytics && (
          <Card>
            <CardHeader>
              <CardTitle>نمو المستخدمين (آخر 30 يوم)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userAnalytics.userGrowthData.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ar-EG')}
                    formatter={(value, name) => [value, name === 'users' ? 'المستخدمين' : 'مستخدمين جدد']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.1}
                    name="المستخدمين"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1}
                    name="مستخدمين جدد"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
