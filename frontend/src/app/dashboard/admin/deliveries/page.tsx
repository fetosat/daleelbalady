'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, Truck, Search, Filter, MapPin, Clock, 
  CheckCircle, AlertCircle, User, Package, Phone, Calendar
} from 'lucide-react'

// Mock data for demonstration
const mockDeliveries = [
  { 
    id: 'DEL-001', 
    orderId: 'ORD-001',
    customerName: 'أحمد محمد',
    customerPhone: '01012345678',
    driverName: 'محمد علي',
    driverPhone: '01098765432',
    from: 'معرض الإلكترونيات الحديثة، كوم حمادة',
    to: 'شارع الجمهورية، منزل رقم 15، كوم حمادة',
    status: 'picked_up',
    estimatedTime: '30 دقيقة',
    distance: '5.2 كم',
    fee: 25,
    createdAt: '2024-01-15T10:30:00',
    estimatedDelivery: '2024-01-15T11:00:00',
    actualDelivery: null,
    items: [
      { name: 'جهاز كمبيوتر محمول HP', quantity: 1 },
      { name: 'ماوس لاسلكي', quantity: 2 }
    ]
  },
  { 
    id: 'DEL-002', 
    orderId: 'ORD-002',
    customerName: 'فاطمة علي',
    customerPhone: '01098765432',
    driverName: 'أحمد حسن',
    driverPhone: '01155443322',
    from: 'متجر الهواتف المحمولة، دمنهور',
    to: 'حي المحطة، شقة 4، الطابق الثالث، دمنهور',
    status: 'on_way',
    estimatedTime: '20 دقيقة',
    distance: '3.8 كم',
    fee: 20,
    createdAt: '2024-01-15T14:20:00',
    estimatedDelivery: '2024-01-15T15:00:00',
    actualDelivery: null,
    items: [
      { name: 'هاتف ذكي Samsung Galaxy', quantity: 1 }
    ]
  },
  { 
    id: 'DEL-003', 
    orderId: 'ORD-003',
    customerName: 'علي حسن',
    customerPhone: '01155443322',
    driverName: 'كريم محمود',
    driverPhone: '01066778899',
    from: 'متجر الأدوات المنزلية، كفر الدوار',
    to: 'شارع النصر، منزل رقم 28، كفر الدوار',
    status: 'delivered',
    estimatedTime: '25 دقيقة',
    distance: '4.5 كم',
    fee: 22,
    createdAt: '2024-01-14T09:15:00',
    estimatedDelivery: '2024-01-14T10:00:00',
    actualDelivery: '2024-01-14T09:58:00',
    items: [
      { name: 'طقم أدوات مطبخ', quantity: 1 },
      { name: 'مقلاة تيفال', quantity: 1 }
    ]
  },
  { 
    id: 'DEL-004', 
    orderId: 'ORD-004',
    customerName: 'نور أحمد',
    customerPhone: '01066778899',
    driverName: 'سامي عبدالله',
    driverPhone: '01023456789',
    from: 'متجر الرياضة والأزياء، كوم حمادة',
    to: 'شارع المدرسة، منزل رقم 7، كوم حمادة',
    status: 'pending',
    estimatedTime: '15 دقيقة',
    distance: '2.1 كم',
    fee: 15,
    createdAt: '2024-01-15T16:45:00',
    estimatedDelivery: '2024-01-15T17:15:00',
    actualDelivery: null,
    items: [
      { name: 'حذاء رياضي Nike', quantity: 1 }
    ]
  },
]

export default function AdminDeliveriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDriver, setSelectedDriver] = useState('all')
  
  const statuses = ['all', 'pending', 'assigned', 'picked_up', 'on_way', 'delivered', 'cancelled']
  const drivers = ['all', 'محمد علي', 'أحمد حسن', 'كريم محمود', 'سامي عبدالله']
  
  const filteredDeliveries = mockDeliveries.filter(delivery => {
    const matchesSearch = delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.driverName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus
    const matchesDriver = selectedDriver === 'all' || delivery.driverName === selectedDriver
    
    return matchesSearch && matchesStatus && matchesDriver
  })

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'في الانتظار', color: 'bg-stone-100 text-stone-800', icon: Clock },
      'assigned': { label: 'تم التعيين', color: 'bg-yellow-100 text-yellow-800', icon: User },
      'picked_up': { label: 'تم الاستلام', color: 'bg-blue-100 text-blue-800', icon: Package },
      'on_way': { label: 'في الطريق', color: 'bg-orange-100 text-orange-800', icon: Truck },
      'delivered': { label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'cancelled': { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    
    return statusMap[status] || statusMap['pending']
  }

  const handleStatusChange = (deliveryId: string, newStatus: string) => {
    console.log(`Update delivery ${deliveryId} status to ${newStatus}`)
    // Here you would call the API to update the delivery status
  }

  const handleAssignDriver = (deliveryId: string, driverId: string) => {
    console.log(`Assign delivery ${deliveryId} to driver ${driverId}`)
    // Here you would call the API to assign the delivery to a driver
  }

  return (
    <div className="p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                إدارة التوصيلات
              </h1>
              <p className="text-stone-600">متابعة وإدارة جميع عمليات التوصيل</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4 ml-2" />
              الخريطة
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    placeholder="بحث برقم التوصيل، اسم العميل، أو السائق..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة التوصيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="assigned">تم التعيين</SelectItem>
                  <SelectItem value="picked_up">تم الاستلام</SelectItem>
                  <SelectItem value="on_way">في الطريق</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="السائق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع السائقين</SelectItem>
                  {drivers.slice(1).map((driver) => (
                    <SelectItem key={driver} value={driver}>
                      {driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-900">{mockDeliveries.length}</div>
              <div className="text-sm text-stone-600">إجمالي التوصيلات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockDeliveries.filter(d => d.status === 'on_way').length}
              </div>
              <div className="text-sm text-stone-600">في الطريق</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockDeliveries.filter(d => d.status === 'delivered').length}
              </div>
              <div className="text-sm text-stone-600">تم التوصيل</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-600">
                {mockDeliveries.filter(d => d.status === 'pending').length}
              </div>
              <div className="text-sm text-stone-600">في الانتظار</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockDeliveries.reduce((sum, d) => sum + d.fee, 0)} جنيه
              </div>
              <div className="text-sm text-stone-600">رسوم التوصيل</div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries List */}
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => {
            const statusInfo = getStatusBadge(delivery.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={delivery.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Delivery Basic Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-blue-600">#{delivery.id}</h3>
                        <Badge variant="outline" className="text-xs">{delivery.orderId}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-stone-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{delivery.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{delivery.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(delivery.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="lg:col-span-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-stone-500">من</div>
                            <div className="text-sm font-medium text-stone-900">{delivery.from}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-stone-500">إلى</div>
                            <div className="text-sm font-medium text-stone-900">{delivery.to}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
                        <span>المسافة: {delivery.distance}</span>
                        <span>الوقت المقدر: {delivery.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-stone-500">السائق</div>
                          <div className="text-sm font-medium text-stone-900">{delivery.driverName}</div>
                          <div className="text-xs text-stone-500">{delivery.driverPhone}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="lg:col-span-3 text-left">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="text-lg font-bold text-green-600">
                          {delivery.fee} جنيه
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={delivery.status}
                            onValueChange={(value) => handleStatusChange(delivery.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">في الانتظار</SelectItem>
                              <SelectItem value="assigned">تم التعيين</SelectItem>
                              <SelectItem value="picked_up">تم الاستلام</SelectItem>
                              <SelectItem value="on_way">في الطريق</SelectItem>
                              <SelectItem value="delivered">تم التوصيل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <div className="text-sm text-stone-600">
                      <span className="font-medium">المنتجات: </span>
                      {delivery.items.map((item, index) => (
                        <span key={index}>
                          {item.name} ({item.quantity})
                          {index < delivery.items.length - 1 ? '، ' : ''}
                        </span>
                      ))}
                    </div>
                    
                    {delivery.actualDelivery && (
                      <div className="text-sm text-green-600 mt-1">
                        <span className="font-medium">تم التوصيل في: </span>
                        {new Date(delivery.actualDelivery).toLocaleString('ar-EG')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredDeliveries.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">لا توجد توصيلات</h3>
              <p className="text-stone-600 mb-4">لم يتم العثور على توصيلات تطابق معايير البحث المحددة</p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedStatus('all')
                setSelectedDriver('all')
              }}>
                مسح المرشحات
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
