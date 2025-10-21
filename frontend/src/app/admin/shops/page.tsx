'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Store, Search, Filter, Plus, Trash2, Edit, Eye, MapPin, Phone, Mail, CheckCircle, XCircle, ExternalLink, Upload, Image as ImageIcon, X, Navigation, Crosshair, UserMinus, AlertTriangle, Briefcase, Package } from 'lucide-react'
import { toast } from 'sonner'
import UniversalConversionDialog from '@/components/admin/UniversalConversionDialog'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

interface Shop {
  id: string
  name: string
  slug?: string
  description?: string
  phone?: string
  email?: string
  website?: string
  city?: string
  locationLat?: number
  locationLon?: number
  coverImage?: string
  logo?: string
  logoImage?: string
  gallery?: string[]
  galleryImages?: string[]
  isVerified: boolean
  owner: {
    id: string
    name: string
    email: string
    phone?: string
  }
  _count: {
    services: number
    products: number
    reviews: number
  }
  createdAt: string
}

interface User {
  id: string
  name: string
  email?: string
  phone?: string
}

// Map click handler component - will be created dynamically
const MapClickHandler = dynamic(
  () => import('react-leaflet').then(mod => {
    const { useMapEvents } = mod
    return function MapClickHandlerComponent({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
      useMapEvents({
        dblclick(e) {
          console.log('Double-click detected at:', e.latlng.lat, e.latlng.lng)
          onLocationSelect(e.latlng.lat, e.latlng.lng)
        },
      })
      return null
    }
  }),
  { ssr: false }
)

// We'll handle map centering via key prop on MapContainer instead
// This avoids SSR/dynamic import issues with useMap hook

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | 'convert' | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [converting, setConverting] = useState(false)
  const [universalConversionDialog, setUniversalConversionDialog] = useState({
    isOpen: false,
    sourceType: 'shop' as 'user'|'shop'|'service'|'product',
    sourceId: '',
    sourceName: '',
    targetType: 'user' as 'user'|'shop'|'service'|'product'
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.0444, 31.2357])
  const [mapKey, setMapKey] = useState(0) // Used to force map re-render when centering
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    ownerId: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    locationLat: '',
    locationLon: '',
    coverImage: '',
    logo: '',
    logoImage: '',
    gallery: [] as string[],
    galleryImages: [] as string[],
    isVerified: false
  })

  useEffect(() => {
    fetchShops()
    fetchUsers()
  }, [page, searchTerm])

  const fetchShops = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/dashboard/admin/shops?${params}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setShops(data.shops || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        console.error('Failed to fetch shops:', response.status, response.statusText)
        // For development: provide mock data if API fails
        if (response.status === 404 || response.status >= 500) {
          console.warn('Using mock data for development')
          setShops([
            {
              id: '1',
              name: 'متجر الأزياء العصرية',
              description: 'متجر متخصص في الأزياء والملابس العصرية',
              phone: '+201234567890',
              email: 'fashion@example.com',
              website: 'https://fashion-store.com',
              city: 'القاهرة',
              locationLat: 30.0444,
              locationLon: 31.2357,
              coverImage: '/api/uploads/shops/cover1.jpg',
              logoImage: '/api/uploads/shops/logo1.jpg',
              galleryImages: ['/api/uploads/shops/gallery1.jpg'],
              isVerified: true,
              owner: {
                id: '1',
                name: 'أحمد محمد',
                email: 'ahmed@example.com',
                phone: '+201234567890'
              },
              _count: {
                services: 5,
                products: 23,
                reviews: 12
              },
              createdAt: '2024-01-15T10:30:00Z'
            },
            {
              id: '2',
              name: 'مطعم الأصالة',
              description: 'مطعم يقدم الأكلات الشعبية التراثية',
              phone: '+201234567891',
              email: 'asala@example.com',
              city: 'الإسكندرية',
              locationLat: 31.2001,
              locationLon: 29.9187,
              isVerified: false,
              owner: {
                id: '2',
                name: 'فاطمة علي',
                email: 'fatima@example.com',
                phone: '+201234567891'
              },
              _count: {
                services: 8,
                products: 15,
                reviews: 7
              },
              createdAt: '2024-01-10T14:20:00Z'
            }
          ])
          setTotalPages(1)
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error)
      toast.error('فشل في تحميل المتاجر - جاري استخدام بيانات تجريبية')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/dashboard/admin/users?limit=1000', {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText)
        // For development: provide mock data if API fails
        if (response.status === 404 || response.status >= 500) {
          console.warn('Using mock users data for development')
          setUsers([
            { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+201234567890' },
            { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', phone: '+201234567891' },
            { id: '3', name: 'محمد حسن', email: 'mohamed@example.com', phone: '+201234567892' }
          ])
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتجر؟')) return
    
    try {
      const response = await fetch(`/api/dashboard/admin/shops/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        toast.success('تم حذف المتجر بنجاح')
        fetchShops()
      }
    } catch (error) {
      console.error('Failed to delete shop:', error)
      toast.error('فشل في حذف المتجر')
    }
  }

  const handleConvertToUser = async () => {
    if (!selectedShop) return
    
    setConverting(true)
    try {
      const response = await fetch(`/api/dashboard/admin/shops/${selectedShop.id}/convert-to-user`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ deleteShopData: false }) // Soft delete by default
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(`تم تحويل المتجر "${selectedShop.name}" إلى مستخدم عادي بنجاح`)
        setDialogMode(null)
        setSelectedShop(null)
        fetchShops()
      } else {
        const errorData = await response.json()
        toast.error((errorData as any).message || 'فشل في تحويل المتجر')
      }
    } catch (error) {
      console.error('Failed to convert shop to user:', error)
      toast.error('حدث خطأ أثناء التحويل')
    } finally {
      setConverting(false)
    }
  }

  // Image upload handler
  const handleImageUpload = async (file: File, type: 'cover' | 'logo' | 'gallery'): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)  // Backend expects 'file' field name
    
    setUploadingImage(true)
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        },
        body: formDataUpload
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.url) {
          return data.url
        } else {
          throw new Error(data.error || 'Upload failed - no URL returned')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error((errorData as any).error || `Upload failed with status ${response.status}`)
      }
    } catch (error: any) {
      console.error('Image upload failed:', error)
      const errorMessage = error.message || 'فشل في رفع الصورة'
      toast.error(errorMessage)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Upload to server
      try {
        const url = await handleImageUpload(file, 'cover')
        setFormData({ ...formData, coverImage: url })
        toast.success('تم رفع صورة الغلاف بنجاح')
      } catch (error) {
        setCoverImagePreview('')
      }
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      try {
        const url = await handleImageUpload(file, 'logo')
        setFormData({ ...formData, logoImage: url })
        toast.success('تم رفع الشعار بنجاح')
      } catch (error) {
        setLogoPreview('')
      }
    }
  }

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    setUploadingImage(true)
    
    try {
      // Create previews first
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
      
      // Use multiple upload endpoint for batch upload
      const formDataUpload = new FormData()
      files.forEach(file => {
        formDataUpload.append('files', file)
      })
      
      const response = await fetch('https://api.daleelbalady.com/api/upload/multiple', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        body: formDataUpload
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.files) {
          const uploadedUrls = data.files.map((f: any) => f.url)
          setFormData({ ...formData, galleryImages: [...formData.galleryImages, ...uploadedUrls] })
          toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`)
        } else {
          throw new Error(data.error || 'Upload failed')
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error((errorData as any).error || `Upload failed with status ${response.status}`)
      }
    } catch (error: any) {
      console.error('Gallery upload failed:', error)
      toast.error(error.message || 'فشل في رفع بعض الصور')
      // Rollback previews on error
      setGalleryPreviews(prev => prev.slice(0, prev.length - files.length))
    } finally {
      setUploadingImage(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData({
      ...formData,
      galleryImages: formData.galleryImages.filter((_, i) => i !== index)
    })
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleMapLocationSelect = (lat: number, lon: number) => {
    setFormData({
      ...formData,
      locationLat: lat.toFixed(6),
      locationLon: lon.toFixed(6)
    })
    toast.success('تم تحديد الموقع على الخريطة')
  }

  // Get user's current location from browser
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع')
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        setUserLocation({ lat, lon })
        setMapCenter([lat, lon])
        setMapKey(prev => prev + 1) // Force map to re-center
        toast.success('تم تحديد موقعك الحالي')
        setLoadingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'فشل في تحديد الموقع'
        if (error.code === 1) {
          errorMessage = 'الرجاء السماح بالوصول إلى الموقع'
        } else if (error.code === 2) {
          errorMessage = 'الموقع غير متاح'
        } else if (error.code === 3) {
          errorMessage = 'انتهت مهلة تحديد الموقع'
        }
        toast.error(errorMessage)
        setLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Center map on current set location
  const centerOnSetLocation = () => {
    if (formData.locationLat && formData.locationLon) {
      const lat = parseFloat(formData.locationLat)
      const lon = parseFloat(formData.locationLon)
      setMapCenter([lat, lon])
      setMapKey(prev => prev + 1) // Force map to re-center
      toast.success('تم توسيط الخريطة على الموقع المحدد')
    } else {
      toast.error('لا يوجد موقع محدد')
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.ownerId) {
      toast.error('الرجاء إدخال اسم المتجر واختيار المالك')
      return
    }
    
    try {
      const url = dialogMode === 'create'
        ? '/api/dashboard/admin/shops'
        : `/api/dashboard/admin/shops/${selectedShop?.id}`

      const payload: any = {
        name: formData.name,
        ownerId: formData.ownerId,
        isVerified: formData.isVerified
      }

      // Optional fields
      if (formData.description) payload.description = formData.description
      if (formData.phone) payload.phone = formData.phone
      if (formData.email) payload.email = formData.email
      if (formData.website) payload.website = formData.website
      if (formData.city) payload.city = formData.city
      if (formData.locationLat) payload.locationLat = parseFloat(formData.locationLat)
      if (formData.locationLon) payload.locationLon = parseFloat(formData.locationLon)
      if (formData.coverImage) payload.coverImage = formData.coverImage
      if (formData.logoImage) payload.logoImage = formData.logoImage
      if (formData.galleryImages.length > 0) payload.galleryImages = formData.galleryImages

      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        toast.success(dialogMode === 'create' ? 'تم إنشاء المتجر بنجاح' : 'تم تحديث المتجر بنجاح')
        setDialogMode(null)
        setSelectedShop(null)
        fetchShops()
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في حفظ المتجر')
      }
    } catch (error) {
      console.error('Failed to save shop:', error)
      toast.error('فشل في حفظ المتجر')
    }
  }

  const openDialog = (mode: 'view' | 'edit' | 'create' | 'convert', shop?: Shop) => {
    setDialogMode(mode)
    setShowMapPicker(false)
    if (shop) {
      setSelectedShop(shop)
      setFormData({
        name: shop.name,
        ownerId: shop.owner.id,
        description: shop.description || '',
        phone: shop.phone || '',
        email: shop.email || '',
        website: shop.website || '',
        city: shop.city || '',
        locationLat: shop.locationLat?.toString() || '',
        locationLon: shop.locationLon?.toString() || '',
        coverImage: shop.coverImage || '',
        logo: shop.logo || '',
        logoImage: shop.logoImage || '',
        gallery: shop.gallery || [],
        galleryImages: shop.galleryImages || [],
        isVerified: shop.isVerified
      })
      setCoverImagePreview(shop.coverImage || '')
      setLogoPreview(shop.logoImage || '')
      setGalleryPreviews(shop.galleryImages || [])
    } else {
      setSelectedShop(null)
      setFormData({
        name: '',
        ownerId: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        city: '',
        locationLat: '',
        locationLon: '',
        coverImage: '',
        logo: '',
        logoImage: '',
        gallery: [],
        galleryImages: [],
        isVerified: false
      })
      setCoverImagePreview('')
      setLogoPreview('')
      setGalleryPreviews([])
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Store className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                إدارة المتاجر
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة جميع المتاجر في المنصة</p>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              onClick={() => openDialog('create')}
            >
              <Plus className="w-4 h-4 ml-2" />متجر جديد
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
                  placeholder="البحث عن متجر..."
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
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{shops.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي المتاجر</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {shops.filter(s => s.isVerified).length}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">موثقة</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {shops.reduce((sum, s) => sum + s._count.services, 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الخدمات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {shops.reduce((sum, s) => sum + s._count.products, 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي المنتجات</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة المتاجر</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد متاجر</div>
            ) : (
              <div className="space-y-3">
                {shops.map((shop) => (
                  <div key={shop.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-900 dark:text-stone-100">{shop.name}</div>
                        <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-3 mt-1">
                          <span>المالك: {shop.owner.name}</span>
                          {shop.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shop.city}</span>}
                          {shop.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{shop.phone}</span>}
                        </div>
                      </div>
                      <div className="text-sm text-stone-600 dark:text-stone-400">
                        <div>{shop._count.services} خدمة</div>
                        <div>{shop._count.products} منتج</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={shop.isVerified ? 'default' : 'secondary'}
                        className={shop.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'}>
                        {shop.isVerified ? 'موثق' : 'غير موثق'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`/shop/${shop.slug || shop.id}`, '_blank')}
                          className="dark:text-stone-400 dark:hover:bg-stone-800"
                          title="فتح الصفحة العامة"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDialog('view', shop)} className="dark:text-stone-400 dark:hover:bg-stone-800" title="عرض"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openDialog('edit', shop)} className="dark:text-stone-400 dark:hover:bg-stone-800" title="تعديل"><Edit className="w-4 h-4" /></Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openDialog('convert', shop)} 
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20" 
                          title="تحويل إلى مستخدم"
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setUniversalConversionDialog({
                              isOpen: true,
                              sourceType: 'shop',
                              sourceId: shop.id,
                              sourceName: shop.name,
                              targetType: 'service'
                            });
                          }}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20" 
                          title="تحويل إلى خدمة"
                        >
                          <Briefcase className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setUniversalConversionDialog({
                              isOpen: true,
                              sourceType: 'shop',
                              sourceId: shop.id,
                              sourceName: shop.name,
                              targetType: 'product'
                            });
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20" 
                          title="تحويل إلى منتج"
                        >
                          <Package className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(shop.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" title="حذف"><Trash2 className="w-4 h-4" /></Button>
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

        {/* View/Edit/Create Dialog */}
        <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle className="dark:text-stone-100">
                {dialogMode === 'view' && 'تفاصيل المتجر'}
                {dialogMode === 'edit' && 'تعديل المتجر'}
                {dialogMode === 'create' && 'إضافة متجر جديد'}
                {dialogMode === 'convert' && 'تحويل المتجر إلى مستخدم'}
              </DialogTitle>
              <DialogDescription className="dark:text-stone-400">
                {dialogMode === 'view' && 'عرض معلومات المتجر بالتفصيل'}
                {dialogMode === 'edit' && 'تعديل معلومات المتجر'}
                {dialogMode === 'create' && 'إضافة متجر جديد إلى المنصة'}
                {dialogMode === 'convert' && 'هل أنت متأكد من تحويل هذا المتجر إلى مستخدم عادي؟'}
              </DialogDescription>
            </DialogHeader>

            {dialogMode === 'view' && selectedShop && (
              <div className="space-y-4">
                {/* Cover Image */}
                {selectedShop.coverImage && (
                  <div className="w-full h-48 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700">
                    <img src={selectedShop.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Logo and Basic Info */}
                <div className="flex items-start gap-4">
                  {selectedShop.logo && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 flex-shrink-0">
                      <img src={selectedShop.logo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">{selectedShop.name}</h3>
                    {selectedShop.description && (
                      <p className="text-stone-600 dark:text-stone-400">{selectedShop.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">المدينة</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedShop.city || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">الهاتف</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedShop.phone || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">البريد الإلكتروني</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedShop.email || 'غير محدد'}</p>
                  </div>
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400">المالك</Label>
                    <p className="text-stone-900 dark:text-stone-100">{selectedShop.owner.name}</p>
                  </div>
                </div>

                {/* Gallery */}
                {selectedShop.gallery && selectedShop.gallery.length > 0 && (
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400 mb-2 block">معرض الصور</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedShop.gallery.map((img, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700">
                          <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {selectedShop.locationLat && selectedShop.locationLon && (
                  <div>
                    <Label className="text-stone-600 dark:text-stone-400 mb-2 block">الموقع</Label>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Lat: {selectedShop.locationLat.toFixed(6)}, Lon: {selectedShop.locationLon.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Verification Status */}
                <div>
                  <Label className="text-stone-600 dark:text-stone-400">حالة التوثيق</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedShop.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700 dark:text-green-400">موثق</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 dark:text-red-400">غير موثق</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-stone-800">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{selectedShop._count.services}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">خدمات</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{selectedShop._count.products}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">منتجات</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{selectedShop._count.reviews}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">تقييمات</p>
                  </div>
                </div>
              </div>
            )}

            {(dialogMode === 'edit' || dialogMode === 'create') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المتجر <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="أدخل اسم المتجر"
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerId">المالك <span className="text-red-500">*</span></Label>
                  <select
                    id="ownerId"
                    value={formData.ownerId}
                    onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                    className="mt-2 w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800 dark:text-stone-100"
                  >
                    <option value="">اختر مالك المتجر</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.email ? `(${user.email})` : ''}
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
                    placeholder="أدخل وصف المتجر"
                    rows={3}
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">الهاتف</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="رقم الهاتف"
                      className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="البريد الإلكتروني"
                      className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://example.com"
                      className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="اسم المدينة"
                      className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                    />
                  </div>
                </div>
                
                {/* Cover Image Upload */}
                <div>
                  <Label>صورة الغلاف</Label>
                  <div className="mt-2">
                    {coverImagePreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700">
                        <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => { setCoverImagePreview(''); setFormData({...formData, coverImage: ''}) }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          className="hidden"
                          id="coverImage"
                          disabled={uploadingImage}
                        />
                        <label htmlFor="coverImage" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                          <p className="text-sm text-stone-600 dark:text-stone-400">
                            {uploadingImage ? 'جاري الرفع...' : 'اضغط لرفع صورة الغلاف'}
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <Label>شعار المتجر</Label>
                  <div className="mt-2">
                    {logoPreview ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700">
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1"
                          onClick={() => { setLogoPreview(''); setFormData({...formData, logo: ''}) }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo"
                          disabled={uploadingImage}
                        />
                        <label htmlFor="logo" className="cursor-pointer text-center p-2">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 text-stone-400" />
                          <p className="text-xs text-stone-600 dark:text-stone-400">
                            {uploadingImage ? 'رفع...' : 'شعار'}
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <Label>معرض الصور</Label>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700">
                          <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                        id="gallery"
                        disabled={uploadingImage}
                      />
                      <label htmlFor="gallery" className="cursor-pointer">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-stone-400" />
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          {uploadingImage ? 'جاري الرفع...' : 'إضافة صور للمعرض'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>الموقع الجغرافي (اختياري)</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="dark:border-stone-700"
                    >
                      <MapPin className="w-4 h-4 ml-2" />
                      {showMapPicker ? 'إخفاء الخريطة' : 'اختر من الخريطة'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        id="locationLat"
                        type="number"
                        step="any"
                        value={formData.locationLat}
                        onChange={(e) => setFormData({...formData, locationLat: e.target.value})}
                        placeholder="خط العرض (Latitude)"
                        className="dark:bg-stone-800 dark:border-stone-700"
                      />
                    </div>
                    <div>
                      <Input
                        id="locationLon"
                        type="number"
                        step="any"
                        value={formData.locationLon}
                        onChange={(e) => setFormData({...formData, locationLon: e.target.value})}
                        placeholder="خط الطول (Longitude)"
                        className="dark:bg-stone-800 dark:border-stone-700"
                      />
                    </div>
                  </div>
                  
                  {/* Map Picker */}
                  {showMapPicker && typeof window !== 'undefined' && (
                    <div className="mt-3 space-y-2">
                      {/* Map Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={getCurrentLocation}
                          disabled={loadingLocation}
                          className="dark:border-stone-700"
                        >
                          <Navigation className="w-4 h-4 ml-2" />
                          {loadingLocation ? 'جاري التحديد...' : 'موقعي الحالي'}
                        </Button>
                        
                        {formData.locationLat && formData.locationLon && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={centerOnSetLocation}
                            className="dark:border-stone-700"
                          >
                            <Crosshair className="w-4 h-4 ml-2" />
                            توسيط على الموقع المحدد
                          </Button>
                        )}
                      </div>

                      <div className="h-64 rounded-lg overflow-hidden border border-stone-300 dark:border-stone-700 relative">
                        <MapContainer
                          key={mapKey}
                          center={mapCenter}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                          doubleClickZoom={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          />
                          <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                          
                          {/* User's current location marker */}
                          {userLocation && (
                            <Marker
                              position={[userLocation.lat, userLocation.lon]}
                            />
                          )}
                          
                          {/* Selected location marker */}
                          {formData.locationLat && formData.locationLon && (
                            <Marker
                              position={[
                                parseFloat(formData.locationLat),
                                parseFloat(formData.locationLon)
                              ]}
                            />
                          )}
                        </MapContainer>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                        <p>انقر مرتين على الخريطة لتحديد الموقع</p>
                        {userLocation && (
                          <p className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            موقعك الحالي معروض
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <Label htmlFor="isVerified">متجر موثق</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogMode(null)} className="dark:border-stone-700">
                    إلغاء
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    {dialogMode === 'edit' ? 'حفظ التغييرات' : 'إضافة المتجر'}
                  </Button>
                </div>
              </div>
            )}

            {dialogMode === 'convert' && selectedShop && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                        سيتم تنفيذ الإجراءات التالية:
                      </p>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                        <li>إلغاء المتجر "{selectedShop.name}"</li>
                        <li>تحويل المالك "{selectedShop.owner.name}" إلى مستخدم عادي</li>
                        <li>سيتم الاحتفاظ ببيانات المتجر للأرشفة</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Card className="dark:bg-stone-800 dark:border-stone-700">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">اسم المتجر:</span>
                      <span className="font-medium dark:text-stone-100">{selectedShop.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">المالك:</span>
                      <span className="font-medium dark:text-stone-100">{selectedShop.owner.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">عدد الخدمات:</span>
                      <span className="font-medium dark:text-stone-100">{selectedShop._count.services}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600 dark:text-stone-400">عدد المنتجات:</span>
                      <span className="font-medium dark:text-stone-100">{selectedShop._count.products}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogMode(null)
                      setSelectedShop(null)
                    }}
                    className="dark:border-stone-700"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleConvertToUser}
                    disabled={converting}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {converting ? (
                      <>جاري التحويل...</>
                    ) : (
                      <><UserMinus className="w-4 h-4 ml-2" />تأكيد التحويل</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Universal Conversion Dialog */}
        <UniversalConversionDialog
          isOpen={universalConversionDialog.isOpen}
          onClose={() => setUniversalConversionDialog({...universalConversionDialog, isOpen: false})}
          sourceType={universalConversionDialog.sourceType}
          sourceId={universalConversionDialog.sourceId}
          sourceName={universalConversionDialog.sourceName}
          targetType={universalConversionDialog.targetType}
          onSuccess={() => {
            fetchShops();
          }}
        />
      </div>
    </AdminLayout>
  )
}

