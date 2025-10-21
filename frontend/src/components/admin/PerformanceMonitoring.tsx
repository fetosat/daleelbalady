'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Zap, Clock, HardDrive, Cpu, MemoryStick,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Monitor, Smartphone, Globe, Wifi, WifiOff,
  BarChart3, LineChart, PieChart, Eye, Download,
  Gauge, Timer, Database, Network, Server,
  RefreshCw, Settings, Filter, Calendar, MapPin,
  Users, ShoppingCart, Package, CreditCard,
  ArrowUp, ArrowDown, Minus, X, MoreHorizontal
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  category: 'loading' | 'rendering' | 'memory' | 'network' | 'database' | 'user_experience'
  description: string
  benchmark: number
}

interface SystemResource {
  name: string
  usage: number
  capacity: number
  status: 'healthy' | 'warning' | 'critical'
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface PagePerformance {
  page: string
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  visits: number
  bounceRate: number
}

interface UserSession {
  id: string
  userId: string
  userName: string
  device: 'desktop' | 'mobile' | 'tablet'
  browser: string
  location: string
  sessionDuration: number
  pageViews: number
  actionsPerMinute: number
  loadTime: number
  status: 'active' | 'idle' | 'disconnected'
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: 'page-load-time',
    name: 'وقت تحميل الصفحة',
    value: 1.2,
    unit: 'ثانية',
    status: 'excellent',
    trend: 'down',
    trendValue: 0.3,
    category: 'loading',
    description: 'متوسط وقت تحميل جميع الصفحات',
    benchmark: 2.0
  },
  {
    id: 'first-contentful-paint',
    name: 'أول رسم للمحتوى',
    value: 0.8,
    unit: 'ثانية',
    status: 'excellent',
    trend: 'stable',
    trendValue: 0.0,
    category: 'rendering',
    description: 'وقت ظهور أول عنصر مرئي',
    benchmark: 1.8
  },
  {
    id: 'memory-usage',
    name: 'استخدام الذاكرة',
    value: 68,
    unit: '%',
    status: 'good',
    trend: 'up',
    trendValue: 5,
    category: 'memory',
    description: 'نسبة استخدام ذاكرة الخادم',
    benchmark: 80
  },
  {
    id: 'database-response',
    name: 'استجابة قاعدة البيانات',
    value: 45,
    unit: 'مللي ثانية',
    status: 'excellent',
    trend: 'down',
    trendValue: 8,
    category: 'database',
    description: 'متوسط وقت استجابة قاعدة البيانات',
    benchmark: 100
  },
  {
    id: 'api-response-time',
    name: 'وقت استجابة API',
    value: 120,
    unit: 'مللي ثانية',
    status: 'good',
    trend: 'stable',
    trendValue: 2,
    category: 'network',
    description: 'متوسط وقت استجابة واجهات البرمجة',
    benchmark: 200
  },
  {
    id: 'bounce-rate',
    name: 'معدل الارتداد',
    value: 32,
    unit: '%',
    status: 'good',
    trend: 'down',
    trendValue: 4,
    category: 'user_experience',
    description: 'نسبة المستخدمين الذين يغادرون فوراً',
    benchmark: 40
  }
]

const systemResources: SystemResource[] = [
  { name: 'المعالج', usage: 45, capacity: 100, status: 'healthy', trend: 'stable' },
  { name: 'الذاكرة', usage: 68, capacity: 100, status: 'warning', trend: 'increasing' },
  { name: 'التخزين', usage: 72, capacity: 100, status: 'warning', trend: 'increasing' },
  { name: 'الشبكة', usage: 25, capacity: 100, status: 'healthy', trend: 'stable' }
]

const pagePerformanceData: PagePerformance[] = [
  {
    page: '/dashboard',
    loadTime: 1.2,
    firstContentfulPaint: 0.8,
    largestContentfulPaint: 1.5,
    cumulativeLayoutShift: 0.05,
    firstInputDelay: 12,
    visits: 8520,
    bounceRate: 28
  },
  {
    page: '/products',
    loadTime: 1.8,
    firstContentfulPaint: 1.1,
    largestContentfulPaint: 2.2,
    cumulativeLayoutShift: 0.08,
    firstInputDelay: 18,
    visits: 6240,
    bounceRate: 35
  },
  {
    page: '/orders',
    loadTime: 1.5,
    firstContentfulPaint: 0.9,
    largestContentfulPaint: 1.9,
    cumulativeLayoutShift: 0.06,
    firstInputDelay: 15,
    visits: 4180,
    bounceRate: 22
  }
]

const activeUserSessions: UserSession[] = [
  {
    id: 'session_1',
    userId: 'user_123',
    userName: 'أحمد محمد',
    device: 'desktop',
    browser: 'Chrome',
    location: 'الرياض، السعودية',
    sessionDuration: 1847,
    pageViews: 12,
    actionsPerMinute: 3.2,
    loadTime: 1.1,
    status: 'active'
  },
  {
    id: 'session_2',
    userId: 'user_456',
    userName: 'فاطمة علي',
    device: 'mobile',
    browser: 'Safari',
    location: 'جدة، السعودية',
    sessionDuration: 925,
    pageViews: 8,
    actionsPerMinute: 2.8,
    loadTime: 1.6,
    status: 'active'
  },
  {
    id: 'session_3',
    userId: 'user_789',
    userName: 'محمد القاضي',
    device: 'tablet',
    browser: 'Edge',
    location: 'الدمام، السعودية',
    sessionDuration: 2105,
    pageViews: 15,
    actionsPerMinute: 2.1,
    loadTime: 1.4,
    status: 'idle'
  }
]

// Mock data for charts
const performanceHistoryData = [
  { time: '00:00', loadTime: 1.8, memoryUsage: 65, activeUsers: 120 },
  { time: '04:00', loadTime: 1.2, memoryUsage: 58, activeUsers: 85 },
  { time: '08:00', loadTime: 1.5, memoryUsage: 72, activeUsers: 340 },
  { time: '12:00', loadTime: 1.1, memoryUsage: 68, activeUsers: 520 },
  { time: '16:00', loadTime: 1.3, memoryUsage: 75, activeUsers: 680 },
  { time: '20:00', loadTime: 1.0, memoryUsage: 70, activeUsers: 450 },
  { time: '24:00', loadTime: 1.2, memoryUsage: 68, activeUsers: 320 }
]

const deviceBreakdownData = [
  { name: 'سطح المكتب', value: 45, color: '#3B82F6' },
  { name: 'الجوال', value: 38, color: '#10B981' },
  { name: 'التابلت', value: 17, color: '#F59E0B' }
]

export default function PerformanceMonitoring() {
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<PerformanceMetric | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      // Simulate real-time data updates
      console.log('Refreshing performance data...')
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isAutoRefresh, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-stone-600 bg-stone-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircle
      case 'good': return CheckCircle
      case 'warning': return AlertTriangle
      case 'critical': return AlertTriangle
      default: return Activity
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp
      case 'down': return ArrowDown
      case 'stable': return Minus
      default: return Minus
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) return `${hrs}س ${mins}د`
    if (mins > 0) return `${mins}د ${secs}ث`
    return `${secs}ث`
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return Monitor
      case 'mobile': return Smartphone
      case 'tablet': return Monitor
      default: return Monitor
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
            <Gauge className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">مراقبة الأداء</h2>
            <p className="text-sm text-stone-600">
              مراقبة شاملة لأداء النظام والمستخدمين
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Activity className="w-3 h-3 mr-1" />
            مراقبة مباشرة
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={isAutoRefresh}
              onCheckedChange={setIsAutoRefresh}
            />
            <span className="text-sm text-stone-600">تحديث تلقائي</span>
          </div>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 ساعة</SelectItem>
              <SelectItem value="6h">6 ساعات</SelectItem>
              <SelectItem value="24h">24 ساعة</SelectItem>
              <SelectItem value="7d">7 أيام</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="resources">الموارد</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric) => {
              const StatusIcon = getStatusIcon(metric.status)
              const TrendIcon = getTrendIcon(metric.trend)
              
              return (
                <Card 
                  key={metric.id}
                  className={`
                    cursor-pointer transition-all hover:shadow-lg border-l-4
                    ${metric.status === 'excellent' ? 'border-l-green-500' :
                      metric.status === 'good' ? 'border-l-blue-500' :
                      metric.status === 'warning' ? 'border-l-yellow-500' :
                      'border-l-red-500'}
                  `}
                  onClick={() => setSelectedMetric(metric)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${getStatusColor(metric.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-medium text-stone-900">{metric.name}</h3>
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${
                        metric.trend === 'up' ? 'text-red-600' :
                        metric.trend === 'down' ? 'text-green-600' :
                        'text-stone-600'
                      }`}>
                        <TrendIcon className="w-3 h-3" />
                        {metric.trendValue !== 0 && `${Math.abs(metric.trendValue)}`}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-stone-900">
                        {metric.value} <span className="text-lg font-normal text-stone-500">{metric.unit}</span>
                      </div>
                      
                      <Progress 
                        value={(metric.value / metric.benchmark) * 100} 
                        className="h-2"
                      />
                      
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>0</span>
                        <span>الهدف: {metric.benchmark} {metric.unit}</span>
                      </div>
                      
                      <p className="text-xs text-stone-600 mt-2">{metric.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  اتجاهات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={performanceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loadTime" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="وقت التحميل (ث)"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  توزيع الأجهزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="flex justify-center gap-6 mt-4">
                  {deviceBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-stone-600">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Page Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                أداء الصفحات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b">
                    <tr>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">الصفحة</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">وقت التحميل</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">FCP</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">LCP</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">CLS</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">FID</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">الزيارات</th>
                      <th className="text-right p-3 text-xs font-medium text-stone-500 uppercase">معدل الارتداد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagePerformanceData.map((page) => (
                      <tr key={page.page} className="border-b hover:bg-stone-50">
                        <td className="p-3 font-medium text-stone-900">{page.page}</td>
                        <td className="p-3">
                          <Badge variant={page.loadTime < 1.5 ? 'default' : page.loadTime < 2.5 ? 'secondary' : 'destructive'}>
                            {page.loadTime}ث
                          </Badge>
                        </td>
                        <td className="p-3 text-stone-600">{page.firstContentfulPaint}ث</td>
                        <td className="p-3 text-stone-600">{page.largestContentfulPaint}ث</td>
                        <td className="p-3 text-stone-600">{page.cumulativeLayoutShift}</td>
                        <td className="p-3 text-stone-600">{page.firstInputDelay}مس</td>
                        <td className="p-3 text-stone-600">{page.visits.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={page.bounceRate < 30 ? 'default' : page.bounceRate < 50 ? 'secondary' : 'destructive'}>
                            {page.bounceRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                مقارنة مقاييس الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsBarChart data={performanceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="loadTime" fill="#3B82F6" name="وقت التحميل (ث)" />
                  <Bar dataKey="memoryUsage" fill="#10B981" name="استخدام الذاكرة (%)" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          {/* System Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemResources.map((resource) => (
              <Card key={resource.name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      resource.status === 'healthy' ? 'bg-green-100 text-green-600' :
                      resource.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {resource.name === 'المعالج' && <Cpu className="w-5 h-5" />}
                      {resource.name === 'الذاكرة' && <MemoryStick className="w-5 h-5" />}
                      {resource.name === 'التخزين' && <HardDrive className="w-5 h-5" />}
                      {resource.name === 'الشبكة' && <Network className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-900">{resource.name}</h3>
                      <p className="text-xs text-stone-500">
                        {resource.trend === 'increasing' ? 'متزايد' :
                         resource.trend === 'decreasing' ? 'متناقص' : 'ثابت'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">الاستخدام</span>
                      <span className="font-medium">{resource.usage}%</span>
                    </div>
                    
                    <Progress value={resource.usage} className="h-3" />
                    
                    <div className="text-xs text-stone-500">
                      {resource.usage}% من {resource.capacity}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resource Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                استخدام الموارد عبر الوقت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="memoryUsage" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.1}
                    name="استخدام الذاكرة (%)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1}
                    name="المستخدمين النشطين"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Active User Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                جلسات المستخدمين النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeUserSessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.device)
                  
                  return (
                    <div 
                      key={session.id}
                      className={`p-4 border rounded-lg flex items-center justify-between ${
                        session.status === 'active' ? 'border-green-200 bg-green-50' :
                        session.status === 'idle' ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          session.status === 'active' ? 'bg-green-100 text-green-600' :
                          session.status === 'idle' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          <DeviceIcon className="w-5 h-5" />
                        </div>
                        
                        <div>
                          <div className="font-medium text-stone-900">{session.userName}</div>
                          <div className="text-sm text-stone-600 flex items-center gap-2">
                            <span>{session.browser}</span>
                            <span>•</span>
                            <span>{session.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-stone-900">
                            {formatDuration(session.sessionDuration)}
                          </div>
                          <div className="text-xs text-stone-500">مدة الجلسة</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-medium text-stone-900">{session.pageViews}</div>
                          <div className="text-xs text-stone-500">صفحات</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="font-medium text-stone-900">{session.loadTime}ث</div>
                          <div className="text-xs text-stone-500">متوسط التحميل</div>
                        </div>
                        
                        <Badge variant={
                          session.status === 'active' ? 'default' :
                          session.status === 'idle' ? 'secondary' :
                          'destructive'
                        }>
                          {session.status === 'active' ? 'نشط' :
                           session.status === 'idle' ? 'خامل' : 'منقطع'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monitoring Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات المراقبة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">مراقبة الأداء التلقائية</div>
                      <div className="text-sm text-stone-500">فحص الأداء كل دقيقة</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">تنبيهات الأداء</div>
                      <div className="text-sm text-stone-500">إرسال تنبيهات عند تجاوز الحدود</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">حفظ بيانات تاريخية</div>
                      <div className="text-sm text-stone-500">الاحتفاظ بسجل لـ 30 يوماً</div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-stone-700 block mb-2">
                      فترة التحديث (ثواني)
                    </label>
                    <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1 ثانية</SelectItem>
                        <SelectItem value="5000">5 ثواني</SelectItem>
                        <SelectItem value="10000">10 ثواني</SelectItem>
                        <SelectItem value="30000">30 ثانية</SelectItem>
                        <SelectItem value="60000">دقيقة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  حدود التنبيهات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">
                    حد وقت التحميل (ثانية)
                  </label>
                  <Input type="number" defaultValue="3" step="0.1" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">
                    حد استخدام الذاكرة (%)
                  </label>
                  <Input type="number" defaultValue="80" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">
                    حد استخدام المعالج (%)
                  </label>
                  <Input type="number" defaultValue="85" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-2">
                    حد معدل الارتداد (%)
                  </label>
                  <Input type="number" defaultValue="60" />
                </div>
                
                <Button className="w-full">
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Metric Detail Modal */}
      <AnimatePresence>
        {selectedMetric && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMetric(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{selectedMetric.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMetric(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <div className="text-3xl font-bold text-stone-900 mb-1">
                      {selectedMetric.value}
                    </div>
                    <div className="text-sm text-stone-500">{selectedMetric.unit}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <div className="text-3xl font-bold text-stone-900 mb-1">
                      {selectedMetric.benchmark}
                    </div>
                    <div className="text-sm text-stone-500">الهدف ({selectedMetric.unit})</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">الوصف</h4>
                  <p className="text-stone-600 text-sm">{selectedMetric.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">الفئة</h4>
                  <Badge variant="outline">
                    {selectedMetric.category === 'loading' ? 'التحميل' :
                     selectedMetric.category === 'rendering' ? 'العرض' :
                     selectedMetric.category === 'memory' ? 'الذاكرة' :
                     selectedMetric.category === 'network' ? 'الشبكة' :
                     selectedMetric.category === 'database' ? 'قاعدة البيانات' :
                     'تجربة المستخدم'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Eye className="w-4 h-4 ml-2" />
                    عرض التفاصيل
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    تصدير البيانات
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
