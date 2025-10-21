'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditCard, Search, Filter, Eye, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  id: string
  userId: string
  planType: string
  planId: string
  amount: number
  originalAmount?: number
  currency: string
  paymentMethod: string
  status: string
  paymobOrderId?: string
  paymobTransactionId?: string
  appliedDiscounts?: any
  couponCode?: string
  createdAt: string
  completedAt?: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [page, searchTerm, statusFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/payments?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      toast.error('فشل في تحميل المدفوعات')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      SUCCESS: { 
        label: 'ناجح', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle 
      },
      PENDING: { 
        label: 'قيد الانتظار', 
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock 
      },
      FAILED: { 
        label: 'فشل', 
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle 
      },
      EXPIRED: { 
        label: 'منتهي', 
        className: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400',
        icon: Clock 
      },
      REFUNDED: { 
        label: 'مسترد', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: DollarSign 
      }
    }
    
    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setDialogOpen(true)
  }

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-green-600 dark:text-green-500" />
                إدارة المدفوعات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض ومراقبة جميع المعاملات المالية</p>
            </div>
          </div>
        </div>

        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث بمعرف المعاملة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              >
                <option value="">جميع الحالات</option>
                <option value="SUCCESS">ناجح</option>
                <option value="PENDING">قيد الانتظار</option>
                <option value="FAILED">فشل</option>
                <option value="EXPIRED">منتهي</option>
                <option value="REFUNDED">مسترد</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{payments.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي المعاملات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {payments.filter(p => p.status === 'SUCCESS').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">معاملات ناجحة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {payments.filter(p => p.status === 'PENDING').length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">قيد الانتظار</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                {totalRevenue.toFixed(2)} EGP
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الإيرادات</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة المدفوعات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد مدفوعات</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-stone-800">
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">المستخدم</th>
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">نوع الخطة</th>
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">المبلغ</th>
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">طريقة الدفع</th>
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">الحالة</th>
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">التاريخ</th>
                      <th className="text-right p-3 text-sm font-medium text-stone-600 dark:text-stone-400">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="p-3">
                          <div className="font-medium text-stone-900 dark:text-stone-100">{payment.user.name}</div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">{payment.user.email}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="dark:border-stone-700">
                            {payment.planType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-stone-900 dark:text-stone-100">
                            {payment.amount} {payment.currency}
                          </div>
                          {payment.originalAmount && payment.originalAmount !== payment.amount && (
                            <div className="text-xs text-stone-500 dark:text-stone-400 line-through">
                              {payment.originalAmount} {payment.currency}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-stone-700 dark:text-stone-300">{payment.paymentMethod}</td>
                        <td className="p-3">{getStatusBadge(payment.status)}</td>
                        <td className="p-3 text-sm text-stone-600 dark:text-stone-400">
                          {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDetails(payment)}
                            className="dark:text-stone-400 dark:hover:bg-stone-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="dark:border-stone-700 dark:text-stone-300"
                >
                  السابق
                </Button>
                <span className="text-sm text-stone-600 dark:text-stone-400">صفحة {page} من {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="dark:border-stone-700 dark:text-stone-300"
                >
                  التالي
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">تفاصيل المدفوعة</DialogTitle>
              <DialogDescription className="dark:text-stone-400">
                معلومات تفصيلية عن المعاملة المالية
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">معرف المعاملة</p>
                    <p className="font-mono text-sm text-stone-900 dark:text-stone-100">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">الحالة</p>
                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">المستخدم</p>
                    <p className="text-stone-900 dark:text-stone-100">{selectedPayment.user.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{selectedPayment.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">نوع الخطة</p>
                    <p className="text-stone-900 dark:text-stone-100">{selectedPayment.planType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">المبلغ</p>
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      {selectedPayment.amount} {selectedPayment.currency}
                    </p>
                    {selectedPayment.originalAmount && selectedPayment.originalAmount !== selectedPayment.amount && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-through">
                        {selectedPayment.originalAmount} {selectedPayment.currency}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">طريقة الدفع</p>
                    <p className="text-stone-900 dark:text-stone-100">{selectedPayment.paymentMethod}</p>
                  </div>
                  {selectedPayment.couponCode && (
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">كود الخصم</p>
                      <Badge variant="outline" className="mt-1">{selectedPayment.couponCode}</Badge>
                    </div>
                  )}
                  {selectedPayment.paymobTransactionId && (
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">معرف Paymob</p>
                      <p className="font-mono text-xs text-stone-900 dark:text-stone-100">
                        {selectedPayment.paymobTransactionId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">تاريخ الإنشاء</p>
                    <p className="text-stone-900 dark:text-stone-100">
                      {new Date(selectedPayment.createdAt).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  {selectedPayment.completedAt && (
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">تاريخ الإتمام</p>
                      <p className="text-stone-900 dark:text-stone-100">
                        {new Date(selectedPayment.completedAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

