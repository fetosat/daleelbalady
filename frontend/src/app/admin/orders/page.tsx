'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShoppingCart, Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  currency: string
  status: string
  paymentMethod?: string
  user: { id: string; name: string; email: string; phone?: string }
  items: Array<{ id: string; quantity: number; unitPrice: number; totalPrice: number; product: { id: string; name: string } }>
  deliveryTracking?: { status: string; carrier?: string }
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [page, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        throw new Error('فشل في تحميل الطلبات')
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('فشل في تحميل الطلبات')
      // Mock data for development
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          totalAmount: 450.00,
          currency: 'EGP',
          status: 'CONFIRMED',
          paymentMethod: 'CREDIT_CARD',
          user: {
            id: 'u1',
            name: 'أحمد محمد علي',
            email: 'ahmed@example.com',
            phone: '+201234567890'
          },
          items: [
            {
              id: 'i1',
              quantity: 2,
              unitPrice: 125.00,
              totalPrice: 250.00,
              product: { id: 'p1', name: 'جهاز قياس الضغط الرقمي' }
            },
            {
              id: 'i2',
              quantity: 1,
              unitPrice: 200.00,
              totalPrice: 200.00,
              product: { id: 'p2', name: 'ميزان حرارة طبي' }
            }
          ],
          deliveryTracking: {
            status: 'IN_TRANSIT',
            carrier: 'أرامكس'
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          totalAmount: 320.00,
          currency: 'EGP',
          status: 'PENDING',
          paymentMethod: 'CASH_ON_DELIVERY',
          user: {
            id: 'u2',
            name: 'فاطمة حسن',
            email: 'fatima@example.com',
            phone: '+201987654321'
          },
          items: [
            {
              id: 'i3',
              quantity: 1,
              unitPrice: 320.00,
              totalPrice: 320.00,
              product: { id: 'p3', name: 'كرسي متحرك طبي' }
            }
          ],
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      CONFIRMED: { label: 'مؤكد', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      PACKED: { label: 'جاهز للشحن', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
      SHIPPED: { label: 'قيد الشحن', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      DELIVERED: { label: 'تم التسليم', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      CANCELLED: { label: 'ملغي', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      RETURNED: { label: 'مرتجع', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
    }
    return config[status] || { label: status, className: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />
      case 'SHIPPED': return <Truck className="w-4 h-4" />
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED': return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                إدارة الطلبات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع الطلبات في المنصة</p>
            </div>
          </div>
        </div>

        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input type="text" placeholder="البحث برقم الطلب أو اسم العميل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100" />
              </div>
              <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                <SelectTrigger className="w-[200px] dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                  <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                  <SelectItem value="PACKED">جاهز للشحن</SelectItem>
                  <SelectItem value="SHIPPED">قيد الشحن</SelectItem>
                  <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                  <SelectItem value="CANCELLED">ملغي</SelectItem>
                  <SelectItem value="RETURNED">مرتجع</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                <Filter className="w-4 h-4 ml-2" />المزيد
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{orders.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الطلبات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{orders.filter(o => o.status === 'PENDING').length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">قيد الانتظار</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">{orders.filter(o => o.status === 'SHIPPED').length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">قيد الشحن</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">{orders.filter(o => o.status === 'DELIVERED').length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">تم التسليم</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">{orders.filter(o => o.status === 'CANCELLED').length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">ملغي</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد طلبات</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status)
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-lg flex items-center justify-center">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-stone-900 dark:text-stone-100">طلب رقم: {order.orderNumber}</div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">{order.user.name} • {order.items.length} منتج</div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-blue-600 dark:text-blue-500">{order.totalAmount.toFixed(2)} {order.currency}</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        {order.deliveryTracking && (
                          <Badge variant="outline" className="dark:border-stone-700 dark:text-stone-300">{order.deliveryTracking.carrier || 'قيد التوصيل'}</Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowDetailsModal(true)
                          }}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                        >
                          <Eye className="w-4 h-4 ml-2" />التفاصيل
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="dark:border-stone-700 dark:text-stone-300">السابق</Button>
                <span className="text-sm text-stone-600 dark:text-stone-400">صفحة {page} من {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="dark:border-stone-700 dark:text-stone-300">التالي</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-stone-900 dark:border-stone-800">
              <DialogHeader>
                <DialogTitle className="dark:text-stone-100 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  تفاصيل الطلب {selectedOrder.orderNumber}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Order Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">حالة الطلب</label>
                    <div className="mt-1">
                      <Badge className={getStatusBadge(selectedOrder.status).className}>
                        {getStatusBadge(selectedOrder.status).label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">إجمالي المبلغ</label>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {selectedOrder.totalAmount.toFixed(2)} {selectedOrder.currency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 dark:text-stone-400">طريقة الدفع</label>
                    <p className="text-stone-900 dark:text-stone-100">
                      {selectedOrder.paymentMethod === 'CREDIT_CARD' ? 'بطاقة ائتمان' : 
                       selectedOrder.paymentMethod === 'CASH_ON_DELIVERY' ? 'الدفع عند التسليم' : 
                       selectedOrder.paymentMethod || 'غير محدد'}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    معلومات العميل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-stone-600 dark:text-stone-400">الاسم</label>
                      <p className="text-stone-900 dark:text-stone-100">{selectedOrder.user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-stone-600 dark:text-stone-400">البريد الإلكتروني</label>
                      <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-stone-500" />
                        {selectedOrder.user.email}
                      </p>
                    </div>
                    {selectedOrder.user.phone && (
                      <div>
                        <label className="text-sm text-stone-600 dark:text-stone-400">رقم الهاتف</label>
                        <p className="text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-stone-500" />
                          {selectedOrder.user.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    محتويات الطلب ({selectedOrder.items.length} منتج)
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-stone-900 dark:text-stone-100">{item.product.name}</h4>
                          <p className="text-sm text-stone-600 dark:text-stone-400">
                            سعر الوحدة: {item.unitPrice.toFixed(2)} {selectedOrder.currency}
                          </p>
                        </div>
                        <div className="text-center px-4">
                          <p className="font-medium text-stone-900 dark:text-stone-100">الكمية: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {item.totalPrice.toFixed(2)} {selectedOrder.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Summary */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">الإجمالي:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedOrder.totalAmount.toFixed(2)} {selectedOrder.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Tracking */}
                {selectedOrder.deliveryTracking && (
                  <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      تتبع الشحن
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-stone-600 dark:text-stone-400">حالة الشحن</label>
                        <p className="text-stone-900 dark:text-stone-100">{selectedOrder.deliveryTracking.status}</p>
                      </div>
                      {selectedOrder.deliveryTracking.carrier && (
                        <div>
                          <label className="text-sm text-stone-600 dark:text-stone-400">شركة الشحن</label>
                          <p className="text-stone-900 dark:text-stone-100">{selectedOrder.deliveryTracking.carrier}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Date */}
                <div className="border-t border-stone-300 dark:border-stone-800 pt-4">
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    تاريخ الطلب: {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy - HH:mm', { locale: ar })}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

