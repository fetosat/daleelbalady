'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, Star, Search, Filter, User, Store, 
  CheckCircle, XCircle, Clock, AlertTriangle, Package, Calendar, Eye, Trash2
} from 'lucide-react'

// Mock data for demonstration
const mockReviews = [
  { 
    id: 'REV-001',
    type: 'product',
    itemName: 'جهاز كمبيوتر محمول HP',
    shopName: 'معرض الإلكترونيات الحديثة',
    customerName: 'أحمد محمد',
    customerPhone: '01012345678',
    rating: 5,
    comment: 'منتج ممتاز وجودة عالية، التوصيل كان سريع والخدمة ممتازة',
    status: 'approved',
    createdAt: '2024-01-15T10:30:00',
    isVerified: true,
    helpful: 12,
    photos: ['photo1.jpg', 'photo2.jpg']
  },
  { 
    id: 'REV-002',
    type: 'service',
    itemName: 'صيانة الأجهزة الكهربائية',
    shopName: 'خدمات محمد عبد الرحمن',
    customerName: 'فاطمة علي',
    customerPhone: '01098765432',
    rating: 4,
    comment: 'خدمة جيدة والفني ماهر، لكن التأخير كان قليل',
    status: 'pending',
    createdAt: '2024-01-14T14:20:00',
    isVerified: false,
    helpful: 8,
    photos: []
  },
  { 
    id: 'REV-003',
    type: 'shop',
    itemName: 'تقييم عام للمتجر',
    shopName: 'متجر الهواتف المحمولة',
    customerName: 'علي حسن',
    customerPhone: '01155443322',
    rating: 3,
    comment: 'الأسعار مناسبة لكن الخدمة بحاجة لتحسين، المكان نظيف',
    status: 'rejected',
    createdAt: '2024-01-13T09:15:00',
    isVerified: true,
    helpful: 3,
    photos: []
  },
  { 
    id: 'REV-004',
    type: 'product',
    itemName: 'هاتف ذكي Samsung Galaxy',
    shopName: 'متجر الهواتف المحمولة',
    customerName: 'نور أحمد',
    customerPhone: '01066778899',
    rating: 5,
    comment: 'هاتف رائع بمواصفات ممتازة، البطارية تدوم طويلاً والكاميرا حادة',
    status: 'approved',
    createdAt: '2024-01-12T16:45:00',
    isVerified: true,
    helpful: 25,
    photos: ['photo3.jpg']
  },
  { 
    id: 'REV-005',
    type: 'service',
    itemName: 'تنظيف المنازل',
    shopName: 'خدمات سارة أحمد',
    customerName: 'محمد سعيد',
    customerPhone: '01023456789',
    rating: 2,
    comment: 'الخدمة لم تكن كما هو متوقع، لم يتم تنظيف جميع الأماكن بشكل جيد',
    status: 'flagged',
    createdAt: '2024-01-11T11:20:00',
    isVerified: false,
    helpful: 1,
    photos: []
  },
]

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  
  const types = ['all', 'product', 'service', 'shop']
  const statuses = ['all', 'pending', 'approved', 'rejected', 'flagged']
  const ratings = ['all', '5', '4', '3', '2', '1']
  
  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || review.type === selectedType
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus
    const matchesRating = selectedRating === 'all' || review.rating === Number(selectedRating)
    
    return matchesSearch && matchesType && matchesStatus && matchesRating
  })

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'approved': { label: 'موافق عليه', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'rejected': { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle },
      'flagged': { label: 'مبلغ عنه', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
    }
    
    return statusMap[status] || statusMap['pending']
  }

  const getTypeBadge = (type: string) => {
    const typeMap = {
      'product': { label: 'منتج', color: 'bg-blue-100 text-blue-800', icon: Package },
      'service': { label: 'خدمة', color: 'bg-purple-100 text-purple-800', icon: User },
      'shop': { label: 'متجر', color: 'bg-green-100 text-green-800', icon: Store }
    }
    
    return typeMap[type] || typeMap['product']
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star 
            key={index} 
            className={`w-4 h-4 ${
              index < rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-stone-300'
            }`}
          />
        ))}
        <span className="text-sm text-stone-600 ml-1">({rating})</span>
      </div>
    )
  }

  const handleStatusChange = (reviewId: string, newStatus: string) => {
    console.log(`Update review ${reviewId} status to ${newStatus}`)
    // Here you would call the API to update the review status
  }

  const handleDeleteReview = (reviewId: string) => {
    console.log(`Delete review ${reviewId}`)
    // Here you would call the API to delete the review
  }

  // Calculate stats
  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: mockReviews.filter(r => r.rating === rating).length,
    percentage: (mockReviews.filter(r => r.rating === rating).length / mockReviews.length) * 100
  }))

  return (
    <div className="p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                إدارة التقييمات
              </h1>
              <p className="text-stone-600">مراجعة والموافقة على تقييمات العملاء</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 ml-2" />
              تقارير التقييمات
            </Button>
          </div>
        </div>

        {/* Overall Rating Stats */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div>
                <h3 className="text-lg font-semibold mb-4">التقييم العام</h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-500">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <div className="text-sm text-stone-500 mt-1">من أصل {mockReviews.length} تقييم</div>
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div>
                <h3 className="text-lg font-semibold mb-4">توزيع التقييمات</h3>
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{item.rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <div className="text-sm text-stone-600 w-8">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    placeholder="بحث في التقييمات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="product">منتج</SelectItem>
                  <SelectItem value="service">خدمة</SelectItem>
                  <SelectItem value="shop">متجر</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="flagged">مبلغ عنه</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التقييمات</SelectItem>
                  <SelectItem value="5">5 نجوم</SelectItem>
                  <SelectItem value="4">4 نجوم</SelectItem>
                  <SelectItem value="3">3 نجوم</SelectItem>
                  <SelectItem value="2">2 نجوم</SelectItem>
                  <SelectItem value="1">نجمة واحدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-stone-900">{mockReviews.length}</div>
              <div className="text-sm text-stone-600">إجمالي التقييمات</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockReviews.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-stone-600">في الانتظار</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockReviews.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-stone-600">موافق عليها</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockReviews.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-stone-600">مرفوضة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockReviews.filter(r => r.status === 'flagged').length}
              </div>
              <div className="text-sm text-stone-600">مبلغ عنها</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const statusInfo = getStatusBadge(review.status)
            const typeInfo = getTypeBadge(review.type)
            const StatusIcon = statusInfo.icon
            const TypeIcon = typeInfo.icon

            return (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Review Header */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-stone-900">{review.itemName}</h3>
                        <div className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          <Badge className={typeInfo.color} variant="secondary">
                            {typeInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-stone-600 mb-2">
                        في {review.shopName}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{review.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(review.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        {review.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                            محقق
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="text-right">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="bg-stone-50 rounded-lg p-4 mb-4">
                    <p className="text-stone-800">{review.comment}</p>
                    {review.photos.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                        <Package className="w-4 h-4" />
                        <span>{review.photos.length} صورة مرفقة</span>
                      </div>
                    )}
                  </div>

                  {/* Actions and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      {review.helpful > 0 && (
                        <span>{review.helpful} وجدوها مفيدة</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-3 h-3 ml-1" />
                        عرض التفاصيل
                      </Button>
                      
                      {review.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 border-green-600"
                            onClick={() => handleStatusChange(review.id, 'approved')}
                          >
                            <CheckCircle className="w-3 h-3 ml-1" />
                            موافقة
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-600"
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                          >
                            <XCircle className="w-3 h-3 ml-1" />
                            رفض
                          </Button>
                        </>
                      )}
                      
                      <Select
                        value={review.status}
                        onValueChange={(value) => handleStatusChange(review.id, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">في الانتظار</SelectItem>
                          <SelectItem value="approved">موافقة</SelectItem>
                          <SelectItem value="rejected">رفض</SelectItem>
                          <SelectItem value="flagged">بلاغ</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600"
                        onClick={() => handleDeleteReview(review.id)}
                      >
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

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">لا توجد تقييمات</h3>
              <p className="text-stone-600 mb-4">لم يتم العثور على تقييمات تطابق معايير البحث المحددة</p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
                setSelectedStatus('all')
                setSelectedRating('all')
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
