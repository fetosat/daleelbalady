'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Phone,
  TrendingUp,
  Star,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'

export default function DeliveryDashboardPage() {
  const deliveryStats = {
    totalDeliveries: 45,
    completedToday: 12,
    pendingPickup: 3,
    inTransit: 8,
    earnings: 450,
    monthlyEarnings: 2150,
    rating: 4.8
  }

  const activeDeliveries = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customer: 'أحمد محمد',
      address: 'شارع الهرم، الجيزة',
      phone: '01012345678',
      status: 'PICKED_UP',
      estimatedDelivery: '2:30 PM',
      amount: 25.50
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customer: 'فاطمة علي',
      address: 'مدينة نصر، القاهرة',
      phone: '01098765432',
      status: 'PENDING',
      estimatedDelivery: '3:15 PM',
      amount: 18.75
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customer: 'محمد حسن',
      address: 'شبرا، القاهرة',
      phone: '01156789012',
      status: 'IN_TRANSIT',
      estimatedDelivery: '4:00 PM',
      amount: 32.20
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PICKED_UP':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">تم الاستلام</Badge>
      case 'IN_TRANSIT':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">في الطريق</Badge>
      case 'PENDING':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">في الانتظار</Badge>
      case 'DELIVERED':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">تم التوصيل</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // مكون بطاقة إحصائيات
  const StatsCard = ({ title, value, change, icon: Icon, color }: any) => (
    <Card className="bg-stone-900 border-stone-800 hover:border-stone-700 transition-all hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-stone-400 mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-stone-100">{value}</span>
          {change && <span className="text-sm text-stone-400">{change}</span>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 bg-stone-950 min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-100">لوحة تحكم التوصيل</h1>
        <p className="text-stone-400 mt-1">إدارة ومتابعة عمليات التوصيل</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي التوصيلات"
          value={deliveryStats.totalDeliveries}
          change="هذا الشهر"
          icon={Package}
          color="bg-blue-500"
        />
        <StatsCard
          title="مكتمل اليوم"
          value={deliveryStats.completedToday}
          change="توصيلة"
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatsCard
          title="في الانتظار"
          value={deliveryStats.pendingPickup}
          change="للاستلام"
          icon={Clock}
          color="bg-orange-500"
        />
        <StatsCard
          title="الأرباح اليوم"
          value={`${deliveryStats.earnings} جنيه`}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Active Deliveries */}
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader className="border-b border-stone-800">
          <CardTitle className="flex items-center gap-2 text-stone-100">
            <Truck className="h-5 w-5" />
            التوصيلات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} className="bg-stone-800 border border-stone-700 rounded-lg p-4 space-y-3 hover:bg-stone-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-stone-100">{delivery.orderNumber}</p>
                      <p className="text-sm text-stone-400">{delivery.customer}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    {getStatusBadge(delivery.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <MapPin className="h-4 w-4" />
                  <span>{delivery.address}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-stone-300">
                      <Clock className="h-4 w-4 text-stone-400" />
                      <span>موعد التوصيل: {delivery.estimatedDelivery}</span>
                    </div>
                    <div className="text-sm font-semibold text-green-500">
                      {delivery.amount} جنيه
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-stone-600 hover:bg-stone-700 text-stone-300">
                      <Phone className="h-4 w-4 ml-1" />
                      اتصال
                    </Button>
                    <Button size="sm" variant="outline" className="border-stone-600 hover:bg-stone-700 text-stone-300">
                      <Navigation className="h-4 w-4 ml-1" />
                      خريطة
                    </Button>
                    {delivery.status === 'PICKED_UP' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        تم التوصيل
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeDeliveries.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-16 w-16 mx-auto text-stone-600 mb-4" />
              <h3 className="text-lg font-semibold text-stone-100 mb-2">لا توجد توصيلات نشطة</h3>
              <p className="text-stone-400">ستظهر هنا التوصيلات المتاحة للاستلام</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Account Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="border-b border-stone-800">
            <CardTitle className="text-stone-100">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Button className="w-full justify-start bg-stone-800 hover:bg-stone-750 text-stone-100 border-stone-700" variant="outline">
              <MapPin className="h-4 w-4 ml-2" />
              عرض الخريطة
            </Button>
            <Button className="w-full justify-start bg-stone-800 hover:bg-stone-750 text-stone-100 border-stone-700" variant="outline">
              <Package className="h-4 w-4 ml-2" />
              طلبات جديدة متاحة
            </Button>
            <Button className="w-full justify-start bg-stone-800 hover:bg-stone-750 text-stone-100 border-stone-700" variant="outline">
              <Clock className="h-4 w-4 ml-2" />
              سجل التوصيلات
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="border-b border-stone-800">
            <CardTitle className="flex items-center text-stone-100">
              <Star className="h-5 w-5 ml-2 text-yellow-500" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex justify-between items-center p-3 bg-stone-800 rounded-lg">
              <span className="text-sm text-stone-400">التقييم</span>
              <span className="font-medium text-stone-100">{deliveryStats.rating} ⭐</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-stone-800 rounded-lg">
              <span className="text-sm text-stone-400">التوصيلات هذا الشهر</span>
              <span className="font-medium text-stone-100">{deliveryStats.totalDeliveries}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-stone-800 rounded-lg">
              <span className="text-sm text-stone-400">الأرباح الشهرية</span>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                {deliveryStats.monthlyEarnings.toLocaleString()} جنيه
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
