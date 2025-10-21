'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tag, Search, Plus, Trash2, Edit, Eye, Percent } from 'lucide-react'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  title?: string
  description?: string
  targetType: string
  discountPercent?: number
  discountAmount?: number
  maxUses?: number
  usesCount: number
  maxUsesPerUser?: number
  minOrderAmount?: number
  validFrom?: string
  expiresAt?: string
  active: boolean
  owner?: { id: string; name: string; email: string }
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null)
  const [formData, setFormData] = useState({
    code: '', title: '', description: '', targetType: 'GLOBAL',
    discountPercent: '', discountAmount: '', maxUses: '', maxUsesPerUser: '',
    minOrderAmount: '', validFrom: '', expiresAt: '', active: true
  })

  useEffect(() => { fetchCoupons() }, [page, searchTerm])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      const response = await fetch(`https://api.daleelbalady.com/api/admin/coupons?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCoupons(data.coupons || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      toast.error('فشل في تحميل الكوبونات')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = dialogMode === 'create' 
        ? 'https://api.daleelbalady.com/api/admin/coupons'
        : `https://api.daleelbalady.com/api/admin/coupons/${selectedCoupon?.id}`
      
      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : null,
          discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : null,
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null
        })
      })
      
      if (response.ok) {
        toast.success(dialogMode === 'create' ? 'تم إنشاء الكوبون بنجاح' : 'تم تحديث الكوبون بنجاح')
        setDialogMode(null)
        fetchCoupons()
      }
    } catch (error) {
      toast.error('فشل في حفظ الكوبون')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      if (response.ok) {
        toast.success('تم حذف الكوبون بنجاح')
        fetchCoupons()
      }
    } catch (error) {
      toast.error('فشل في حذف الكوبون')
    }
  }

  const openDialog = (mode: 'view' | 'edit' | 'create', coupon?: Coupon) => {
    setDialogMode(mode)
    setSelectedCoupon(coupon || null)
    if (coupon) {
      setFormData({
        code: coupon.code, title: coupon.title || '', description: coupon.description || '',
        targetType: coupon.targetType, discountPercent: coupon.discountPercent?.toString() || '',
        discountAmount: coupon.discountAmount?.toString() || '', maxUses: coupon.maxUses?.toString() || '',
        maxUsesPerUser: coupon.maxUsesPerUser?.toString() || '', minOrderAmount: coupon.minOrderAmount?.toString() || '',
        validFrom: coupon.validFrom || '', expiresAt: coupon.expiresAt || '', active: coupon.active
      })
    } else {
      setFormData({
        code: '', title: '', description: '', targetType: 'GLOBAL', discountPercent: '',
        discountAmount: '', maxUses: '', maxUsesPerUser: '', minOrderAmount: '',
        validFrom: '', expiresAt: '', active: true
      })
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Tag className="w-6 h-6 text-pink-600 dark:text-pink-500" />
              إدارة الكوبونات
            </h1>
            <p className="text-stone-600 dark:text-stone-400">إنشاء وإدارة كوبونات الخصم</p>
          </div>
          <Button onClick={() => openDialog('create')} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 ml-2" />كوبون جديد
          </Button>
        </div>

        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="البحث بالكود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{coupons.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الكوبونات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {coupons.filter(c => c.active).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">نشطة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {coupons.reduce((sum, c) => sum + c.usesCount, 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الاستخدامات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {coupons.filter(c => !c.active || (c.maxUses && c.usesCount >= c.maxUses)).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">منتهية</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة الكوبونات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد كوبونات</div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400 font-mono">
                          {coupon.code}
                        </Badge>
                        {coupon.title && <span className="font-medium text-stone-900 dark:text-stone-100">{coupon.title}</span>}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                        {coupon.discountPercent && <span><Percent className="w-3 h-3 inline" /> {coupon.discountPercent}% خصم</span>}
                        {coupon.discountAmount && <span>{coupon.discountAmount} EGP خصم</span>}
                        {coupon.maxUses && <span className="mr-3">• الاستخدامات: {coupon.usesCount}/{coupon.maxUses}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{coupon.targetType}</Badge>
                      <Badge variant={coupon.active ? 'default' : 'secondary'}
                        className={coupon.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                        {coupon.active ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => openDialog('view', coupon)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => openDialog('edit', coupon)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
          <DialogContent className="sm:max-w-2xl dark:bg-stone-900 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dialogMode === 'view' ? 'تفاصيل الكوبون' : dialogMode === 'edit' ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}</DialogTitle>
            </DialogHeader>

            {dialogMode === 'view' && selectedCoupon ? (
              <div className="space-y-3">
                <div><Label>الكود</Label><p className="font-mono text-lg">{selectedCoupon.code}</p></div>
                {selectedCoupon.title && <div><Label>العنوان</Label><p>{selectedCoupon.title}</p></div>}
                {selectedCoupon.description && <div><Label>الوصف</Label><p>{selectedCoupon.description}</p></div>}
                <div className="grid grid-cols-2 gap-4">
                  {selectedCoupon.discountPercent && <div><Label>نسبة الخصم</Label><p>{selectedCoupon.discountPercent}%</p></div>}
                  {selectedCoupon.discountAmount && <div><Label>مبلغ الخصم</Label><p>{selectedCoupon.discountAmount} EGP</p></div>}
                </div>
              </div>
            ) : (dialogMode === 'edit' || dialogMode === 'create') ? (
              <div className="space-y-4">
                <Input placeholder="كود الكوبون" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                <Input placeholder="العنوان" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <Textarea placeholder="الوصف" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={2} />
                <Select value={formData.targetType} onValueChange={(v) => setFormData({...formData, targetType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">عام</SelectItem>
                    <SelectItem value="SERVICE">خدمة</SelectItem>
                    <SelectItem value="PRODUCT">منتج</SelectItem>
                    <SelectItem value="SHOP">متجر</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="نسبة الخصم %" value={formData.discountPercent} onChange={(e) => setFormData({...formData, discountPercent: e.target.value})} />
                  <Input type="number" placeholder="مبلغ الخصم" value={formData.discountAmount} onChange={(e) => setFormData({...formData, discountAmount: e.target.value})} />
                  <Input type="number" placeholder="الحد الأقصى للاستخدام" value={formData.maxUses} onChange={(e) => setFormData({...formData, maxUses: e.target.value})} />
                  <Input type="number" placeholder="استخدام لكل مستخدم" value={formData.maxUsesPerUser} onChange={(e) => setFormData({...formData, maxUsesPerUser: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} />
                  <Label htmlFor="active">كوبون نشط</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button onClick={handleSave} className="bg-pink-600 hover:bg-pink-700">حفظ</Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

