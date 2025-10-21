'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Package, Search, Filter, Plus, Trash2, Edit, Eye, ExternalLink, User, Store, Briefcase } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import UniversalConversionDialog from '@/components/admin/UniversalConversionDialog'

interface Product {
  id: string
  name: string
  sku?: string
  description?: string
  price: number
  currency: string
  stock: number
  isActive: boolean
  embeddingText?: string
  shop: {
    id: string
    name: string
  }
  lister?: {
    id: string
    name: string
  }
  createdAt: string
  _count?: {
    reviews: number
  }
}

interface Shop {
  id: string
  name: string
  city?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | null>(null)
  const [conversionDialog, setConversionDialog] = useState({
    isOpen: false,
    sourceType: 'product' as 'user'|'shop'|'service'|'product',
    sourceId: '',
    sourceName: '',
    targetType: 'user' as 'user'|'shop'|'service'|'product'
  })
  const [formData, setFormData] = useState({
    name: '', 
    sku: '', 
    description: '', 
    price: '', 
    currency: 'EGP', 
    stock: '0', 
    isActive: true,
    shopId: '',
    embeddingText: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchShops()
  }, [page, searchTerm])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('https://api.daleelbalady.com/api/admin/shops?limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setShops(data.shops || [])
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        }
      })
      
      if (response.ok) {
        toast.success('تم حذف المنتج بنجاح')
        fetchProducts()
      }
    } catch (error) {
      toast.error('فشل في حذف المنتج')
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.shopId) {
      toast.error('الرجاء إدخال الاسم والسعر والمتجر')
      return
    }

    try {
      const url = dialogMode === 'create'
        ? 'https://api.daleelbalady.com/api/admin/products'
        : `https://api.daleelbalady.com/api/admin/products/${selectedProduct?.id}`

      const payload: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        shopId: formData.shopId,
        currency: formData.currency,
        stock: parseInt(formData.stock) || 0,
        isActive: formData.isActive
      }

      // Optional fields
      if (formData.sku) payload.sku = formData.sku
      if (formData.description) payload.description = formData.description
      if (formData.embeddingText) payload.embeddingText = formData.embeddingText

      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(dialogMode === 'create' ? 'تم إنشاء المنتج بنجاح' : 'تم تحديث المنتج بنجاح')
        setDialogMode(null)
        fetchProducts()
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في حفظ المنتج')
      }
    } catch (error) {
      toast.error('فشل في حفظ المنتج')
    }
  }

  const openDialog = (mode: 'view' | 'edit' | 'create', product?: Product) => {
    setDialogMode(mode)
    setSelectedProduct(product || null)
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku || '',
        description: product.description || '',
        price: product.price.toString(),
        currency: product.currency,
        stock: product.stock.toString(),
        isActive: product.isActive,
        shopId: product.shop.id,
        embeddingText: product.embeddingText || ''
      })
    } else {
      setFormData({
        name: '', 
        sku: '', 
        description: '', 
        price: '', 
        currency: 'EGP', 
        stock: '0', 
        isActive: true,
        shopId: shops.length > 0 ? shops[0].id : '',
        embeddingText: ''
      })
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                إدارة المنتجات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع المنتجات في المنصة</p>
            </div>
            <Button size="sm" onClick={() => openDialog('create')} className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
              <Plus className="w-4 h-4 ml-2" />
              منتج جديد
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="البحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                />
              </div>
              <Button variant="outline" size="sm" className="dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
                <Filter className="w-4 h-4 ml-2" />
                فلتر
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{products.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي المنتجات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {products.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">نشطة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                {products.filter(p => p.stock < 10).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">مخزون منخفض</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {products.filter(p => p.stock === 0).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">نفذ من المخزون</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                لا توجد منتجات
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900 dark:text-stone-100">{product.name}</div>
                        <div className="text-sm text-stone-500 dark:text-stone-400">
                          {product.shop?.name || 'بدون متجر'}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {product.price} {product.currency}
                        </div>
                        <div className="text-sm text-stone-500 dark:text-stone-400">
                          المخزون: {product.stock}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={product.isActive ? 'default' : 'secondary'}
                        className={product.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }
                      >
                        {product.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      {product.stock === 0 && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          نفذ
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {/* Conversion buttons */}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setConversionDialog({
                            isOpen: true,
                            sourceType: 'product',
                            sourceId: product.id,
                            sourceName: product.name,
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
                            sourceType: 'product',
                            sourceId: product.id,
                            sourceName: product.name,
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
                            sourceType: 'product',
                            sourceId: product.id,
                            sourceName: product.name,
                            targetType: 'service'
                          })}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                          title="تحويل إلى خدمة"
                        >
                          <Briefcase className="w-4 h-4" />
                        </Button>
                        {/* Regular buttons */}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/product/${product.id}`, '_blank')}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                          title="فتح الصفحة العامة"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog('view', product)}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog('edit', product)}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
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
                <span className="text-sm text-stone-600 dark:text-stone-400">
                  صفحة {page} من {totalPages}
                </span>
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

        <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
          <DialogContent className="sm:max-w-2xl dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">
                {dialogMode === 'view' ? 'تفاصيل المنتج' : dialogMode === 'edit' ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
              </DialogTitle>
            </DialogHeader>

            {dialogMode === 'view' && selectedProduct && (
              <div className="space-y-3">
                <div>
                  <Label>اسم المنتج</Label>
                  <p className="font-medium text-lg">{selectedProduct.name}</p>
                </div>
                {selectedProduct.sku && (
                  <div>
                    <Label>رمز المنتج (SKU)</Label>
                    <p className="text-sm font-mono text-stone-600 dark:text-stone-400">{selectedProduct.sku}</p>
                  </div>
                )}
                {selectedProduct.description && (
                  <div>
                    <Label>الوصف</Label>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{selectedProduct.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>السعر</Label>
                    <p className="font-semibold text-lg">{selectedProduct.price} {selectedProduct.currency}</p>
                  </div>
                  <div>
                    <Label>المخزون</Label>
                    <p className="font-semibold">{selectedProduct.stock}</p>
                  </div>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="mt-1">
                    <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'} className={selectedProduct.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                      {selectedProduct.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>المتجر</Label>
                  <p className="font-medium">{selectedProduct.shop.name}</p>
                </div>
                {selectedProduct.embeddingText && (
                  <div>
                    <Label>نص البحث</Label>
                    <p className="text-xs text-stone-500 dark:text-stone-500 bg-stone-50 dark:bg-stone-800 p-2 rounded">{selectedProduct.embeddingText}</p>
                  </div>
                )}
                {selectedProduct.lister && (
                  <div>
                    <Label>المعلن</Label>
                    <p className="text-sm">{selectedProduct.lister.name}</p>
                  </div>
                )}
              </div>
            )}

            {(dialogMode === 'edit' || dialogMode === 'create') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المنتج <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="أدخل اسم المنتج"
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                  <Input 
                    id="sku"
                    value={formData.sku} 
                    onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                    placeholder="رمز فريد للمنتج"
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label htmlFor="shop">المتجر <span className="text-red-500">*</span></Label>
                  <select 
                    id="shop"
                    value={formData.shopId} 
                    onChange={(e) => setFormData({...formData, shopId: e.target.value})} 
                    className="mt-2 w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="">اختر متجر</option>
                    {shops.map(shop => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name} {shop.city ? `- ${shop.city}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea 
                    id="description"
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="وصف المنتج"
                    rows={3} 
                    className="mt-2" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر <span className="text-red-500">*</span></Label>
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
                </div>
                <div>
                  <Label htmlFor="stock">المخزون</Label>
                  <Input 
                    id="stock"
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                    placeholder="0"
                    className="mt-2" 
                  />
                </div>
                <div>
                  <Label htmlFor="embeddingText">نص البحث (Embedding Text)</Label>
                  <Textarea 
                    id="embeddingText"
                    value={formData.embeddingText} 
                    onChange={(e) => setFormData({...formData, embeddingText: e.target.value})} 
                    placeholder="نص يستخدم للبحث الدلالي"
                    rows={2} 
                    className="mt-2" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">منتج نشط</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">حفظ</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Universal Conversion Dialog */}
        <UniversalConversionDialog
          isOpen={conversionDialog.isOpen}
          onClose={() => setConversionDialog({
            isOpen: false,
            sourceType: 'product',
            sourceId: '',
            sourceName: '',
            targetType: 'user'
          })}
          sourceType={conversionDialog.sourceType}
          sourceId={conversionDialog.sourceId}
          sourceName={conversionDialog.sourceName}
          targetType={conversionDialog.targetType}
          onSuccess={() => {
            fetchProducts();
            setConversionDialog({
              isOpen: false,
              sourceType: 'product',
              sourceId: '',
              sourceName: '',
              targetType: 'user'
            });
          }}
        />
      </div>
    </AdminLayout>
  )
}

