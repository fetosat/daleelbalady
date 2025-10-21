'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Wrench, Search, Filter, Plus, Trash2, Edit, Eye, MapPin, Star, ExternalLink,
  User, Store, Package, RefreshCw, AlertTriangle
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import UniversalConversionDialog from '@/components/admin/UniversalConversionDialog'

interface Service {
  id: string
  embeddingText: string
  phone?: string
  city?: string
  price?: number
  currency?: string
  durationMins?: number
  available: boolean
  ownerUser?: { id: string; name: string }
  shop?: { id: string; name: string }
  subCategory?: { id: string; name: string }
  createdAt: string
  _count?: { bookings: number; reviews: number }
}

interface Shop {
  id: string
  name: string
  city?: string
}

interface SubCategory {
  id: string
  name: string
  categoryId: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null)
  const [conversionDialog, setConversionDialog] = useState({
    isOpen: false,
    sourceType: 'service' as 'user'|'shop'|'service'|'product',
    sourceId: '',
    sourceName: '',
    targetType: 'user' as 'user'|'shop'|'service'|'product'
  })
  const [formData, setFormData] = useState({
    embeddingText: '',
    phone: '',
    city: '',
    price: '',
    currency: 'EGP',
    durationMins: '',
    available: true,
    shopId: '',
    subCategoryId: ''
  })

  useEffect(() => {
    fetchServices()
  }, [page, searchTerm])

  useEffect(() => {
    fetchShops()
    fetchSubCategories()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/services?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('https://api.daleelbalady.com/api/admin/shops?limit=1000', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setShops(data.shops || [])
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await fetch('https://api.daleelbalady.com/api/admin/subcategories?limit=1000', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSubCategories(data.subCategories || [])
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return
    
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        toast.success('تم حذف الخدمة بنجاح')
        fetchServices()
      }
    } catch (error) {
      toast.error('فشل في حذف الخدمة')
    }
  }

  const handleSave = async () => {
    if (!formData.embeddingText) {
      toast.error('الرجاء إدخال وصف الخدمة')
      return
    }

    try {
      const url = dialogMode === 'create'
        ? 'https://api.daleelbalady.com/api/admin/services'
        : `https://api.daleelbalady.com/api/admin/services/${selectedService?.id}`

      const payload: any = {
        embeddingText: formData.embeddingText,
        available: formData.available,
        currency: formData.currency
      }

      // Optional fields
      if (formData.phone) payload.phone = formData.phone
      if (formData.city) payload.city = formData.city
      if (formData.price) payload.price = parseFloat(formData.price)
      if (formData.durationMins) payload.durationMins = parseInt(formData.durationMins)
      if (formData.shopId) payload.shopId = formData.shopId
      if (formData.subCategoryId) payload.subCategoryId = formData.subCategoryId

      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(dialogMode === 'create' ? 'تم إنشاء الخدمة بنجاح' : 'تم تحديث الخدمة بنجاح')
        setDialogMode(null)
        fetchServices()
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في حفظ الخدمة')
      }
    } catch (error) {
      toast.error('فشل في حفظ الخدمة')
    }
  }

  const openDialog = (mode: 'view' | 'edit' | 'create', service?: Service) => {
    setDialogMode(mode)
    setSelectedService(service || null)
    if (service) {
      setFormData({
        embeddingText: service.embeddingText || '',
        phone: service.phone || '',
        city: service.city || '',
        price: service.price?.toString() || '',
        currency: service.currency || 'EGP',
        durationMins: service.durationMins?.toString() || '',
        available: service.available,
        shopId: service.shop?.id || '',
        subCategoryId: service.subCategory?.id || ''
      })
    } else {
      setFormData({
        embeddingText: '',
        phone: '',
        city: '',
        price: '',
        currency: 'EGP',
        durationMins: '',
        available: true,
        shopId: '',
        subCategoryId: ''
      })
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Wrench className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                إدارة الخدمات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع الخدمات في المنصة</p>
            </div>
            <Button size="sm" onClick={() => openDialog('create')} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">
              <Plus className="w-4 h-4 ml-2" />خدمة جديدة
            </Button>
          </div>
        </div>

        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث عن خدمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
              </div>
              <Button variant="outline" size="sm" className="dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                <Filter className="w-4 h-4 ml-2" />فلتر
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{services.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الخدمات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {services.filter(s => s.available).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">متاحة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                {services.reduce((sum, s) => sum + (s._count?.bookings || 0), 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الحجوزات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                {services.reduce((sum, s) => sum + (s._count?.reviews || 0), 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي التقييمات</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة الخدمات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد خدمات</div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-lg flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900 dark:text-stone-100 line-clamp-2">
                          {service.embeddingText?.substring(0, 100) || 'خدمة بدون وصف'}
                        </div>
                        <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-3 mt-1">
                          {service.shop && <span>المتجر: {service.shop.name}</span>}
                          {service.ownerUser && <span>المقدم: {service.ownerUser.name}</span>}
                          {service.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{service.city}</span>}
                        </div>
                      </div>
                      {service.price && (
                        <div className="text-left">
                          <div className="font-bold text-emerald-600 dark:text-emerald-500">
                            {service.price} {service.currency}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">السعر</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={service.available ? 'default' : 'secondary'}
                        className={service.available ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'}>
                        {service.available ? 'متاحة' : 'غير متاحة'}
                      </Badge>
                      {service._count && (
                        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                          <span>{service._count.bookings} حجز</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3" />{service._count.reviews}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {/* Conversion buttons */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setConversionDialog({
                            isOpen: true,
                            sourceType: 'service',
                            sourceId: service.id,
                            sourceName: service.embeddingText || 'Service',
                            targetType: 'user'
                          })}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                          title="تحويل إلى مستخدم"
                        >
                          <User className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setConversionDialog({
                            isOpen: true,
                            sourceType: 'service',
                            sourceId: service.id,
                            sourceName: service.embeddingText || 'Service',
                            targetType: 'shop'
                          })}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          title="تحويل إلى متجر"
                        >
                          <Store className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setConversionDialog({
                            isOpen: true,
                            sourceType: 'service',
                            sourceId: service.id,
                            sourceName: service.embeddingText || 'Service',
                            targetType: 'product'
                          })}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                          title="تحويل إلى منتج"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        {/* Regular buttons */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`/service/${service.id}`, '_blank')}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                          title="فتح الصفحة العامة"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDialog('view', service)} className="dark:text-stone-400 dark:hover:bg-stone-800"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openDialog('edit', service)} className="dark:text-stone-400 dark:hover:bg-stone-800"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
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

        <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
          <DialogContent className="sm:max-w-2xl dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">
                {dialogMode === 'view' ? 'تفاصيل الخدمة' : dialogMode === 'edit' ? 'تعديل الخدمة' : 'إنشاء خدمة جديدة'}
              </DialogTitle>
            </DialogHeader>

            {dialogMode === 'view' && selectedService && (
              <div className="space-y-3">
                <div><Label>الوصف</Label><p className="text-sm">{selectedService.embeddingText}</p></div>
                {selectedService.phone && <div><Label>الهاتف</Label><p>{selectedService.phone}</p></div>}
                {selectedService.city && <div><Label>المدينة</Label><p>{selectedService.city}</p></div>}
                {selectedService.price && <div><Label>السعر</Label><p>{selectedService.price} {selectedService.currency}</p></div>}
                <div><Label>الحالة</Label><Badge variant={selectedService.available ? 'default' : 'secondary'}>{selectedService.available ? 'متاحة' : 'غير متاحة'}</Badge></div>
              </div>
            )}

            {(dialogMode === 'edit' || dialogMode === 'create') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="embeddingText">وصف الخدمة <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="embeddingText"
                    value={formData.embeddingText} 
                    onChange={(e) => setFormData({...formData, embeddingText: e.target.value})} 
                    placeholder="أدخل وصف شامل للخدمة"
                    rows={3} 
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label htmlFor="shop">المتجر</Label>
                  <select 
                    id="shop"
                    value={formData.shopId} 
                    onChange={(e) => setFormData({...formData, shopId: e.target.value})} 
                    className="mt-2 w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="">اختياري - بدون متجر</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} {shop.city ? `- ${shop.city}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subCategory">الفئة الفرعية</Label>
                  <select 
                    id="subCategory"
                    value={formData.subCategoryId} 
                    onChange={(e) => setFormData({...formData, subCategoryId: e.target.value})} 
                    className="mt-2 w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="">اختياري - بدون فئة</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">الهاتف</Label>
                    <Input 
                      id="phone"
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      placeholder="رقم الهاتف"
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Input 
                      id="city"
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})} 
                      placeholder="اسم المدينة"
                      className="mt-2" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">السعر</Label>
                    <Input 
                      id="price"
                      type="number" 
                      step="0.01"
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} 
                      placeholder="0.00"
                      className="mt-2" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">العملة</Label>
                    <select
                      id="currency"
                      value={formData.currency} 
                      onChange={(e) => setFormData({...formData, currency: e.target.value})} 
                      className="mt-2 w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 dark:text-stone-100"
                    >
                      <option value="EGP">EGP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="durationMins">المدة (دقيقة)</Label>
                    <Input 
                      id="durationMins"
                      type="number" 
                      value={formData.durationMins} 
                      onChange={(e) => setFormData({...formData, durationMins: e.target.value})} 
                      placeholder="60"
                      className="mt-2" 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="available" 
                    checked={formData.available} 
                    onChange={(e) => setFormData({...formData, available: e.target.checked})} 
                    className="w-4 h-4"
                  />
                  <Label htmlFor="available">خدمة متاحة</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">حفظ</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Universal Conversion Dialog */}
        <UniversalConversionDialog
          isOpen={conversionDialog.isOpen}
          onClose={() => setConversionDialog({...conversionDialog, isOpen: false})}
          sourceType={conversionDialog.sourceType}
          sourceId={conversionDialog.sourceId}
          sourceName={conversionDialog.sourceName}
          targetType={conversionDialog.targetType}
          onSuccess={() => {
            fetchServices();
          }}
        />
      </div>
    </AdminLayout>
  )
}

