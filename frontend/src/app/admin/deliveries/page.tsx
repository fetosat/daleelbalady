'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Search, Filter, Eye, Package, MapPin, Clock } from 'lucide-react'

interface Delivery {
  id: string
  status: string
  carrier?: string
  trackingCode?: string
  eta?: string
  order: {
    id: string
    orderNumber: string
    user: { id: string; name: string; phone?: string }
  }
  createdAt: string
  updatedAt: string
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchDeliveries()
  }, [page, searchTerm, statusFilter])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/deliveries?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDeliveries(data.deliveries || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      PICKED_UP: { label: 'تم الاستلام', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      IN_TRANSIT: { label: 'قيد النقل', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      DELIVERED: { label: 'تم التسليم', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      FAILED: { label: 'فشل', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    }
    return config[status] || { label: status, className: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300' }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600 dark:text-purple-500" />
            إدارة التوصيلات
          </h1>
          <p className="text-stone-600 dark:text-stone-400">متابعة وإدارة جميع عمليات التوصيل</p>
        </div>

        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input type="text" placeholder="البحث برقم التتبع..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100" />
              </div>
              <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                <SelectTrigger className="w-[200px] dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100">
                  <SelectValue placeholder="حالة التوصيل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                  <SelectItem value="PICKED_UP">تم الاستلام</SelectItem>
                  <SelectItem value="IN_TRANSIT">قيد النقل</SelectItem>
                  <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                  <SelectItem value="FAILED">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED'].map((status) => {
            const badge = getStatusBadge(status)
            return (
              <Card key={status} className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {deliveries.filter(d => d.status === status).length}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">{badge.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة التوصيلات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : deliveries.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد توصيلات</div>
            ) : (
              <div className="space-y-3">
                {deliveries.map((delivery) => {
                  const statusBadge = getStatusBadge(delivery.status)
                  return (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-lg flex items-center justify-center">
                          <Truck className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-stone-900 dark:text-stone-100">طلب: {delivery.order.orderNumber}</div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">{delivery.order.user.name}</div>
                        </div>
                        {delivery.trackingCode && (
                          <div className="text-left">
                            <div className="font-mono text-sm text-stone-900 dark:text-stone-100">{delivery.trackingCode}</div>
                            <div className="text-xs text-stone-500 dark:text-stone-400">{delivery.carrier}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        {delivery.eta && (
                          <div className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(delivery.eta).toLocaleDateString('ar-EG')}
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="dark:text-stone-400 dark:hover:bg-stone-800">
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
      </div>
    </AdminLayout>
  )
}

