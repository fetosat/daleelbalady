'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, 
  Users, ShoppingCart, Store, DollarSign, Calendar, Download, Filter
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Mock analytics data
  const analyticsData = {
    revenue: {
      current: 245680,
      previous: 198750,
      growth: 23.6,
      trend: 'up'
    },
    orders: {
      current: 1890,
      previous: 1654,
      growth: 14.3,
      trend: 'up'
    },
    users: {
      current: 1247,
      previous: 1089,
      growth: 14.5,
      trend: 'up'
    },
    shops: {
      current: 89,
      previous: 76,
      growth: 17.1,
      trend: 'up'
    }
  }

  const topProducts = [
    { name: 'جهاز كمبيوتر محمول HP', sales: 45, revenue: 675000 },
    { name: 'هاتف ذكي Samsung Galaxy', sales: 67, revenue: 569500 },
    { name: 'حذاء رياضي Nike', sales: 89, revenue: 249200 },
    { name: 'طقم أدوات مطبخ', sales: 123, revenue: 43050 },
  ]

  const topCities = [
    { name: 'كوم حمادة', orders: 567, percentage: 65 },
    { name: 'دمنهور', orders: 234, percentage: 27 },
    { name: 'كفر الدوار', orders: 89, percentage: 8 },
  ]

  // Chart data
  const monthlyRevenueData = [
    { month: 'يناير', revenue: 186000, orders: 1245 },
    { month: 'فبراير', revenue: 205000, orders: 1356 },
    { month: 'مارس', revenue: 189000, orders: 1189 },
    { month: 'أبريل', revenue: 225000, orders: 1465 },
    { month: 'مايو', revenue: 245000, orders: 1678 },
    { month: 'يونيو', revenue: 268000, orders: 1890 },
  ]

  const weeklyOrdersData = [
    { day: 'السبت', orders: 245, completed: 189, cancelled: 56 },
    { day: 'الأحد', orders: 167, completed: 143, cancelled: 24 },
    { day: 'الإثنين', orders: 198, completed: 176, cancelled: 22 },
    { day: 'الثلاثاء', orders: 234, completed: 201, cancelled: 33 },
    { day: 'الأربعاء', orders: 289, completed: 256, cancelled: 33 },
    { day: 'الخميس', orders: 312, completed: 278, cancelled: 34 },
    { day: 'الجمعة', orders: 276, completed: 245, cancelled: 31 },
  ]

  const categoryDistribution = [
    { name: 'مطاعم', value: 45, color: '#FF6B6B' },
    { name: 'ملابس', value: 25, color: '#4ECDC4' },
    { name: 'إلكترونيات', value: 20, color: '#45B7D1' },
    { name: 'خدمات', value: 10, color: '#FFA726' },
  ]

  const userGrowthData = [
    { month: 'يناير', users: 856 },
    { month: 'فبراير', users: 923 },
    { month: 'مارس', users: 1034 },
    { month: 'أبريل', users: 1156 },
    { month: 'مايو', users: 1198 },
    { month: 'يونيو', users: 1247 },
  ]

  return (
    <div className="p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/admin">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للوحة التحكم
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                التقارير والتحليلات
              </h1>
              <p className="text-stone-600">تحليل شامل لأداء المنصة والإحصائيات</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 ml-2" />
              اختر الفترة
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 ml-2" />
              تحميل التقرير
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-700">
                    {analyticsData.revenue.current.toLocaleString()} جنيه
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-green-500 text-xs font-medium">
                      +{analyticsData.revenue.growth}%
                    </span>
                    <span className="text-stone-500 text-xs">من الشهر السابق</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {analyticsData.orders.current.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-500 text-xs font-medium">
                      +{analyticsData.orders.growth}%
                    </span>
                    <span className="text-stone-500 text-xs">من الشهر السابق</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">المستخدمون الجدد</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {analyticsData.users.current.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-purple-500" />
                    <span className="text-purple-500 text-xs font-medium">
                      +{analyticsData.users.growth}%
                    </span>
                    <span className="text-stone-500 text-xs">من الشهر السابق</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">المتاجر النشطة</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {analyticsData.shops.current}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-500 text-xs font-medium">
                      +{analyticsData.shops.growth}%
                    </span>
                    <span className="text-stone-500 text-xs">من الشهر السابق</span>
                  </div>
                </div>
                <Store className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                الإيرادات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${Number(value).toLocaleString()} جنيه`, 'الإيرادات']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#revenueGradient)" 
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                الطلبات الأسبوعية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      value,
                      name === 'completed' ? 'مكتملة' : name === 'cancelled' ? 'ملغية' : 'إجمالي'
                    ]}
                  />
                  <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                نمو المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value} مستخدم`, 'المستخدمون']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-600" />
                توزيع الفئات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, 'النسبة']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {categoryDistribution.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-stone-600">
                      {category.name} ({category.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products and Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium text-stone-900">{product.name}</div>
                        <div className="text-sm text-stone-600">{product.sales} مبيعة</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {product.revenue.toLocaleString()} جنيه
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle>المدن الأكثر طلباً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCities.map((city, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-900">{city.name}</span>
                      <span className="text-sm text-stone-600">{city.orders} طلب</span>
                    </div>
                    <Progress value={city.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
