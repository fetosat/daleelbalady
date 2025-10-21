'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, Wrench, Search, Filter, Plus, MapPin, 
  Star, Clock, Eye, Edit, Trash2, CheckCircle, XCircle 
} from 'lucide-react'

// Mock data for demonstration
const mockServices = [
  { 
    id: 1, 
    name: 'صيانة الأجهزة الكهربائية', 
    provider: 'محمد عبد الرحمن',
    category: 'صيانة',
    city: 'كوم حمادة', 
    price: 150,
    rating: 4.8,
    isActive: true, 
    isVerified: true,
    bookings: 89,
    createdAt: '2024-01-15',
    description: 'خدمات صيانة شاملة لجميع الأجهزة الكهربائية المنزلية'
  },
  { 
    id: 2, 
    name: 'تنظيف المنازل', 
    provider: 'سارة أحمد',
    category: 'تنظيف',
    city: 'دمنهور', 
    price: 200,
    rating: 4.9,
    isActive: true, 
    isVerified: false,
    bookings: 156,
    createdAt: '2024-01-14',
    description: 'خدمات تنظيف شاملة للمنازل والمكاتب'
  },
  { 
    id: 3, 
    name: 'تصليح السباكة', 
    provider: 'علي حسن',
    category: 'سباكة',
    city: 'كفر الدوار', 
    price: 120,
    rating: 4.6,
    isActive: false, 
    isVerified: true,
    bookings: 45,
    createdAt: '2024-01-13',
    description: 'إصلاح وصيانة جميع أنواع مشاكل السباكة'
  },
  { 
    id: 4, 
    name: 'خدمات التوصيل السريع', 
    provider: 'كريم محمود',
    category: 'توصيل',
    city: 'كوم حمادة', 
    price: 25,
    rating: 4.7,
    isActive: true, 
    isVerified: true,
    bookings: 234,
    createdAt: '2024-01-12',
    description: 'توصيل سريع وآمن لجميع أنحاء المدينة'
  },
]

export default function AdminServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const categories = ['all', 'صيانة', 'تنظيف', 'سباكة', 'توصيل', 'أخرى']
  const statuses = ['all', 'active', 'inactive', 'verified', 'unverified']
  
  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && service.isActive) ||
                         (selectedStatus === 'inactive' && !service.isActive) ||
                         (selectedStatus === 'verified' && service.isVerified) ||
                         (selectedStatus === 'unverified' && !service.isVerified)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleToggleStatus = (serviceId: number) => {
    console.log(`Toggle status for service ${serviceId}`)
    // Here you would call the API to update the service status
  }

  const handleVerifyService = (serviceId: number) => {
    console.log(`Verify service ${serviceId}`)
    // Here you would call the API to verify the service
  }

  const handleDeleteService = (serviceId: number) => {
    console.log(`Delete service ${serviceId}`)
    // Here you would call the API to delete the service
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
                <Wrench className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                إدارة الخدمات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع الخدمات المتاحة في المنصة</p>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">
            <Plus className="w-4 h-4 ml-2" />
            خدمة جديدة
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
                    placeholder="بحث في الخدمات..."
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
                       status === 'verified' ? 'محقق' : 'غير محقق'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{mockServices.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الخدمات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {mockServices.filter(s => s.isActive).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">نشطة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                {mockServices.filter(s => s.isVerified).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">محققة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                {mockServices.reduce((sum, s) => sum + s.bookings, 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الحجوزات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                {(mockServices.reduce((sum, s) => sum + s.rating, 0) / mockServices.length).toFixed(1)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">متوسط التقييم</div>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow dark:bg-stone-900 dark:border-stone-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg dark:text-stone-100">{service.name}</CardTitle>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">مقدم بواسطة: {service.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.isActive ? (
                      <Badge className="bg-green-100 text-green-800">نشط</Badge>
                    ) : (
                      <Badge variant="secondary">غير نشط</Badge>
                    )}
                    {service.isVerified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">{service.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                      <MapPin className="w-3 h-3" />
                      {service.city}
                    </div>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{service.rating}</span>
                      <span className="text-sm text-stone-500 dark:text-stone-400">({service.bookings} حجز)</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500">{service.price} جنيه</div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(service.id)}>
                      <Eye className="w-3 h-3 ml-1" />
                      عرض
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleVerifyService(service.id)}>
                      <Edit className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    {!service.isVerified && (
                      <Button size="sm" variant="ghost" className="text-emerald-600 dark:text-emerald-500 dark:hover:bg-stone-800" onClick={() => handleVerifyService(service.id)}>
                        <CheckCircle className="w-3 h-3 ml-1" />
                        تحقق
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-500 dark:hover:bg-stone-800" onClick={() => handleDeleteService(service.id)}>
                      <Trash2 className="w-3 h-3 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-12 text-center">
              <Wrench className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">لا توجد خدمات</h3>
              <p className="text-stone-600 dark:text-stone-400 mb-4">لم يتم العثور على خدمات تطابق معايير البحث المحددة</p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedStatus('all')
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
