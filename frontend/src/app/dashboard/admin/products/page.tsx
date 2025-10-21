'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, Package, Search, Filter, Plus, MapPin, Store,
  Star, Eye, Edit, Trash2, CheckCircle, AlertTriangle, Image as ImageIcon
} from 'lucide-react'

// Mock data for demonstration
const mockProducts = [
  { 
    id: 1, 
    name: 'جهاز كمبيوتر محمول HP', 
    shop: 'معرض الإلكترونيات الحديثة',
    category: 'إلكترونيات',
    city: 'كوم حمادة', 
    price: 15000,
    originalPrice: 18000,
    stock: 5,
    sold: 23,
    rating: 4.5,
    isActive: true, 
    isFeatured: true,
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-15',
    description: 'جهاز كمبيوتر محمول عالي الأداء مناسب للألعاب والعمل'
  },
  { 
    id: 2, 
    name: 'هاتف ذكي Samsung Galaxy', 
    shop: 'متجر الهواتف المحمولة',
    category: 'هواتف',
    city: 'دمنهور', 
    price: 8500,
    originalPrice: 9500,
    stock: 0,
    sold: 45,
    rating: 4.8,
    isActive: true, 
    isFeatured: false,
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-14',
    description: 'هاتف ذكي بأحدث المواصفات وكاميرا عالية الدقة'
  },
  { 
    id: 3, 
    name: 'طقم أدوات مطبخ', 
    shop: 'متجر الأدوات المنزلية',
    category: 'منزل ومطبخ',
    city: 'كفر الدوار', 
    price: 350,
    originalPrice: 500,
    stock: 20,
    sold: 67,
    rating: 4.2,
    isActive: false, 
    isFeatured: false,
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-13',
    description: 'طقم أدوات مطبخ كامل من الستانلس ستيل عالي الجودة'
  },
  { 
    id: 4, 
    name: 'حذاء رياضي Nike', 
    shop: 'متجر الرياضة والأزياء',
    category: 'ملابس ورياضة',
    city: 'كوم حمادة', 
    price: 2800,
    originalPrice: 2800,
    stock: 12,
    sold: 89,
    rating: 4.9,
    isActive: true, 
    isFeatured: true,
    image: '/placeholder-product.jpg',
    createdAt: '2024-01-12',
    description: 'حذاء رياضي عالي الجودة مناسب لجميع الأنشطة الرياضية'
  },
]

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedStock, setSelectedStock] = useState('all')
  
  const categories = ['all', 'إلكترونيات', 'هواتف', 'منزل ومطبخ', 'ملابس ورياضة', 'أخرى']
  const statuses = ['all', 'active', 'inactive', 'featured', 'not-featured']
  const stockOptions = ['all', 'in-stock', 'out-of-stock', 'low-stock']
  
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.shop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && product.isActive) ||
                         (selectedStatus === 'inactive' && !product.isActive) ||
                         (selectedStatus === 'featured' && product.isFeatured) ||
                         (selectedStatus === 'not-featured' && !product.isFeatured)
    
    const matchesStock = selectedStock === 'all' ||
                        (selectedStock === 'in-stock' && product.stock > 5) ||
                        (selectedStock === 'out-of-stock' && product.stock === 0) ||
                        (selectedStock === 'low-stock' && product.stock > 0 && product.stock <= 5)
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'نفد', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    if (stock <= 5) return { label: 'قليل', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    return { label: 'متوفر', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  }

  const getDiscountPercentage = (price: number, originalPrice: number) => {
    if (price === originalPrice) return 0
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  const handleToggleStatus = (productId: number) => {
    console.log(`Toggle status for product ${productId}`)
  }

  const handleToggleFeatured = (productId: number) => {
    console.log(`Toggle featured for product ${productId}`)
  }

  const handleDeleteProduct = (productId: number) => {
    console.log(`Delete product ${productId}`)
  }

  return (
    <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="dark:text-stone-300 dark:hover:bg-stone-800">
              <Link href="/dashboard/admin">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للوحة التحكم
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                إدارة المنتجات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع المنتجات في المنصة</p>
            </div>
          </div>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
            <Plus className="w-4 h-4 ml-2" />
            منتج جديد
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    placeholder="بحث في المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'جميع الفئات' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'جميع الحالات' : 
                       status === 'active' ? 'نشط' :
                       status === 'inactive' ? 'غير نشط' :
                       status === 'featured' ? 'مميز' : 'غير مميز'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStock} onValueChange={setSelectedStock}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent>
                  {stockOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'all' ? 'جميع حالات المخزون' : 
                       option === 'in-stock' ? 'متوفر' :
                       option === 'out-of-stock' ? 'نفد' :
                       'قليل'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{mockProducts.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي المنتجات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {mockProducts.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">نشطة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {mockProducts.filter(p => p.isFeatured).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">مميزة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                {mockProducts.filter(p => p.stock === 0).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">نفدت</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                {mockProducts.reduce((sum, p) => sum + p.sold, 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">المبيعات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                {(mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length).toFixed(1)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">متوسط التقييم</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock)
            const discount = getDiscountPercentage(product.price, product.originalPrice)
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow dark:bg-stone-900 dark:border-stone-800">
                <div className="relative">
                  <div className="aspect-square bg-stone-100 dark:bg-stone-800 rounded-t-lg flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-stone-300 dark:text-stone-600" />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isFeatured && (
                      <Badge className="bg-yellow-500 text-white text-xs">مميز</Badge>
                    )}
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">-{discount}%</Badge>
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <Badge className={stockStatus.color}>
                      {stockStatus.label}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400 flex items-center gap-1 mt-1">
                        <Store className="w-3 h-3" />
                        {product.shop}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                        <MapPin className="w-3 h-3" />
                        {product.city}
                      </div>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-stone-500">({product.sold})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-500">{product.price.toLocaleString()} جنيه</div>
                        {discount > 0 && (
                          <div className="text-sm text-stone-500 dark:text-stone-400 line-through">
                            {product.originalPrice.toLocaleString()} جنيه
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600 dark:text-stone-400">المخزون: {product.stock}</span>
                      <div className="flex items-center gap-2">
                        {!product.isActive ? (
                          <Badge variant="secondary">غير نشط</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">نشط</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 pt-2 border-t">
                      <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(product.id)}>
                        <Eye className="w-3 h-3 ml-1" />
                        عرض
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleFeatured(product.id)}>
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button size="sm" variant="ghost" className="text-amber-600 dark:text-amber-500 dark:hover:bg-stone-800" onClick={() => handleToggleFeatured(product.id)}>
                        <Star className="w-3 h-3 ml-1" />
                        {product.isFeatured ? 'إلغاء التمييز' : 'تمييز'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-500 dark:hover:bg-stone-800" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">لا توجد منتجات</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-4">لم يتم العثور على منتجات تطابق معايير البحث المحددة</p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedStatus('all')
                setSelectedStock('all')
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
