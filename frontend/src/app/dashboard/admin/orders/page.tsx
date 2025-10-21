'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, ShoppingCart, Search, Filter, Eye, Truck, 
  CheckCircle, XCircle, Clock, AlertCircle, User, Package, Calendar
} from 'lucide-react'

// Mock data for demonstration
const mockOrders = [
  { 
    id: 'ORD-001', 
    customerName: 'أحمد محمد',
    customerPhone: '01012345678',
    items: [
      { name: 'جهاز كمبيوتر محمول HP', quantity: 1, price: 15000 },
      { name: 'ماوس لاسلكي', quantity: 2, price: 250 }
    ],
    totalAmount: 15500,
    status: 'pending',
    paymentStatus: 'paid',
    shippingAddress: 'كوم حمادة، شارع الجمهورية، منزل رقم 15',
    orderDate: '2024-01-15T10:30:00',
    estimatedDelivery: '2024-01-17',
    shop: 'معرض الإلكترونيات الحديثة',
    notes: 'يرجى التوصيل في المساء'
  },
  { 
    id: 'ORD-002', 
    customerName: 'فاطمة علي',
    customerPhone: '01098765432',
    items: [
      { name: 'هاتف ذكي Samsung Galaxy', quantity: 1, price: 8500 }
    ],
    totalAmount: 8500,
    status: 'processing',
    paymentStatus: 'pending',
    shippingAddress: 'دمنهور، حي المحطة، شقة 4، الطابق الثالث',
    orderDate: '2024-01-14T14:20:00',
    estimatedDelivery: '2024-01-16',
    shop: 'متجر الهواتف المحمولة',
    notes: ''
  },
  { 
    id: 'ORD-003', 
    customerName: 'علي حسن',
    customerPhone: '01155443322',
    items: [
      { name: 'طقم أدوات مطبخ', quantity: 1, price: 350 },
      { name: 'مقلاة تيفال', quantity: 1, price: 180 }
    ],
    totalAmount: 530,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: 'كفر الدوار، شارع النصر، منزل رقم 28',
    orderDate: '2024-01-13T09:15:00',
    estimatedDelivery: '2024-01-15',
    shop: 'متجر الأدوات المنزلية',
    notes: 'عميل مهم - أولوية في التوصيل'
  },
  { 
    id: 'ORD-004', 
    customerName: 'نور أحمد',
    customerPhone: '01066778899',
    items: [
      { name: 'حذاء رياضي Nike', quantity: 1, price: 2800 }
    ],
    totalAmount: 2800,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: 'كوم حمادة، شارع المدرسة، منزل رقم 7',
    orderDate: '2024-01-10T16:45:00',
    estimatedDelivery: '2024-01-12',
    shop: 'متجر الرياضة والأزياء',
    notes: ''
  },
  { 
    id: 'ORD-005', 
    customerName: 'محمد سعيد',
    customerPhone: '01023456789',
    items: [
      { name: 'سماعات بلوتوث', quantity: 2, price: 450 }
    ],
    totalAmount: 900,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: 'دمنهور، شارع الحرية، شقة 12',
    orderDate: '2024-01-09T11:20:00',
    estimatedDelivery: '2024-01-11',
    shop: 'متجر الإلكترونيات',
    notes: 'العميل ألغى الطلب - تم استرداد المبلغ'
  },
]

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all')
  
  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentStatuses = ['all', 'paid', 'pending', 'refunded', 'failed']
  const dateRanges = ['all', 'today', 'week', 'month', 'custom']
  
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerPhone.includes(searchQuery)
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    const matchesPayment = selectedPayment === 'all' || order.paymentStatus === selectedPayment
    
    // For now, we'll ignore date filtering logic for simplicity
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'processing': { label: 'قيد التجهيز', color: 'bg-blue-100 text-blue-800', icon: Package },
      'shipped': { label: 'تم الشحن', color: 'bg-purple-100 text-purple-800', icon: Truck },
      'delivered': { label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'cancelled': { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    
    return statusMap[status] || statusMap['pending']
  }

  const getPaymentBadge = (status: string) => {
    const statusMap = {
      'paid': { label: 'مدفوع', color: 'bg-green-100 text-green-800' },
      'pending': { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
      'refunded': { label: 'مسترد', color: 'bg-blue-100 text-blue-800' },
      'failed': { label: 'فشل', color: 'bg-red-100 text-red-800' }
    }
    
    return statusMap[status] || statusMap['pending']
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log(`Update order ${orderId} status to ${newStatus}`)
    // Here you would call the API to update the order status
  }

  const handleViewOrder = (orderId: string) => {
    console.log(`View order details for ${orderId}`)
    // Navigate to order details page
  }

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
                <ShoppingCart className="w-6 h-6 text-green-600" />
                إدارة الطلبات
              </h1>
              <p className="text-stone-600">عرض وإدارة جميع الطلبات في المنصة</p>
            </div>
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
                    placeholder="بحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'جميع الحالات' : 
                       status === 'pending' ? 'في الانتظار' :
                       status === 'processing' ? 'قيد التجهيز' :
                       status === 'shipped' ? 'تم الشحن' :
                       status === 'delivered' ? 'تم التوصيل' : 'ملغي'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'جميع حالات الدفع' : 
                       status === 'paid' ? 'مدفوع' :
                       status === 'pending' ? 'في الانتظار' :
                       status === 'refunded' ? 'مسترد' : 'فشل'}
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
              <div className="text-2xl font-bold text-stone-900">{mockOrders.length}</div>
              <div className="text-sm text-stone-600">إجمالي الطلبات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockOrders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-stone-600">في الانتظار</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockOrders.filter(o => o.status === 'processing').length}
              </div>
              <div className="text-sm text-stone-600">قيد التجهيز</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockOrders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-stone-600">تم التوصيل</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-stone-600">إجمالي المبيعات</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status)
            const paymentInfo = getPaymentBadge(order.paymentStatus)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Order Basic Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-blue-600">#{order.id}</h3>
                      </div>
                      <div className="space-y-1 text-sm text-stone-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{order.customerName}</span>
                        </div>
                        <div>{order.customerPhone}</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.orderDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="lg:col-span-4">
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-stone-600">
                              الكمية: {item.quantity} × {item.price.toLocaleString()} جنيه
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-stone-600">
                        من: {order.shop}
                      </div>
                    </div>

                    {/* Status & Payment */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <Badge className={paymentInfo.color}>
                          {paymentInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="lg:col-span-3 text-left">
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-green-600">
                          {order.totalAmount.toLocaleString()} جنيه
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewOrder(order.id)}>
                            <Eye className="w-3 h-3 ml-1" />
                            عرض
                          </Button>
                          
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">في الانتظار</SelectItem>
                              <SelectItem value="processing">قيد التجهيز</SelectItem>
                              <SelectItem value="shipped">تم الشحن</SelectItem>
                              <SelectItem value="delivered">تم التوصيل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(order.shippingAddress || order.notes) && (
                    <div className="mt-4 pt-4 border-t border-stone-200 space-y-2 text-sm text-stone-600">
                      {order.shippingAddress && (
                        <div>
                          <span className="font-medium">عنوان التوصيل: </span>
                          {order.shippingAddress}
                        </div>
                      )}
                      {order.notes && (
                        <div>
                          <span className="font-medium">ملاحظات: </span>
                          {order.notes}
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div>
                          <span className="font-medium">التوصيل المتوقع: </span>
                          {new Date(order.estimatedDelivery).toLocaleDateString('ar-EG')}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">لا توجد طلبات</h3>
              <p className="text-stone-600 mb-4">لم يتم العثور على طلبات تطابق معايير البحث المحددة</p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedStatus('all')
                setSelectedPayment('all')
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
