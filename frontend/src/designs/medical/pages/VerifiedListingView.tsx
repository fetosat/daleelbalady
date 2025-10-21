/**
 * Medical-themed Verified Listing Page - Complete Version
 * With all features: categories, Arabic labels, functional buttons, full data display
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  MapPin, Star, Phone, Mail, MessageCircle, Calendar,
  Award, Shield, Stethoscope, Activity, Building2,
  User, CheckCircle2, ChevronRight, Clock,
  TrendingUp, Eye, Tag, DollarSign, ExternalLink,
  Briefcase, MapPinned, Home, Info, Gift, Percent
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'
import { colors } from '../colors'
import BookingModal from '@/components/BookingModal'

// Dynamic map import
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gradient-to-br from-blue-100 to-cyan-100 animate-pulse rounded-2xl" />
})

interface VerifiedListingViewProps {
  data: any
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function MedicalVerifiedListingView({ data, type }: VerifiedListingViewProps) {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  
  const isDarkMode = resolvedTheme === 'dark' || theme === 'dark'
  
  console.log('=== Medical VerifiedListingView Mounted ===')
  console.log('Data:', data)
  
  // Fade in animation on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])
  
  // Calculate stats
  const totalServices = data.services?.length || 0
  const totalProducts = data.products?.length || 0
  const totalShops = data.shops?.length || 0
  const avgRating = data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
    : 0
  const totalReviews = data.reviews?.length || 0
  
  // Get address information
  const getAddress = () => {
    if (data.address?.text_ar) return data.address.text_ar
    if (data.address?.text_en) return data.address.text_en
    if (data.city) return data.city
    return null
  }
  
  // Handle chat button
  const handleStartChat = () => {
    // TODO: Implement chat functionality
    router.push(`/chat/${data.id}`)
  }
  
  // Handle booking button
  const handleBooking = (service?: any) => {
    const serviceToBook = service || (totalServices > 0 && data.services[0])
    if (serviceToBook) {
      setSelectedService(serviceToBook)
      setBookingModalOpen(true)
    }
  }
  
  // Handle service click
  const handleServiceClick = (serviceId: string) => {
    router.push(`/listing/${serviceId}`)
  }
  
  return (
    <div className="min-h-screen" style={{ 
      background: isDarkMode 
        ? `linear-gradient(to bottom right, #1a1a1a, ${colors.primary}20)` 
        : `linear-gradient(to bottom right, ${colors.background}, ${colors.primary}05)` 
    }}>
      {/* Animated Medical Header Strip */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-gradient bg-[length:200%_auto]" />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Medical Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 25 L30 35 M25 30 L35 30' stroke='%233b82f6' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        {/* Cover Image */}
        {data.coverImage && (
          <div className="relative h-80 overflow-hidden">
            <img
              src={data.coverImage}
              alt="Cover"
              className={`w-full h-full object-cover transition-all duration-1000 ${isVisible ? 'scale-100' : 'scale-110'}`}
            />
            <div className="absolute inset-0" style={{ 
              background: `linear-gradient(to bottom, transparent, ${colors.primary}80)` 
            }} />
          </div>
        )}
        
          {/* Profile Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative ${data.coverImage ? '-mt-32' : 'pt-8'} transition-all duration-700 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
            <Card className={`backdrop-blur-lg border-2 shadow-2xl rounded-3xl overflow-hidden ${isDarkMode ? 'bg-stone-900/95' : 'bg-white/95'}`} style={{ borderColor: `${colors.primary}30` }}>
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" 
                         style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }} />
                    <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-3xl overflow-hidden border-4 border-white shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                      {data.profilePic ? (
                        <img src={data.profilePic} alt={data.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" 
                             style={{ background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})` }}>
                          <User className="w-24 h-24 text-white" />
                        </div>
                      )}
                    </div>
                    {data.isVerified && (
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full p-3 shadow-lg border-4 border-white animate-bounce">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="flex-1 space-y-6">
                    {/* Name and Badges */}
                    <div className="space-y-3">
                      <div className="flex items-start flex-wrap gap-3">
                        <h1 className="text-4xl lg:text-5xl font-bold" style={{ color: colors.primary }}>
                          {data.name}
                        </h1>
                        {data.isVerified && (
                          <Badge className="text-white border-0 shadow-lg" style={{ background: colors.success }}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            مُوثّق
                          </Badge>
                        )}
                      </div>
                      
                      {/* Categories */}
                      {data.categories && data.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {data.categories.map((cat: any) => (
                            <Badge 
                              key={cat.id} 
                              className="border-0"
                              style={{ 
                                backgroundColor: `${colors.secondary}30`,
                                color: colors.text
                              }}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* SubCategories */}
                      {data.subcategories && data.subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {data.subcategories.map((subcat: any) => (
                            <Badge 
                              key={subcat.id} 
                              variant="outline"
                              style={{ borderColor: colors.accent }}
                            >
                              {subcat.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {data.role && (
                        <div className="flex items-center gap-2 text-lg font-medium" style={{ color: colors.secondary }}>
                          <Stethoscope className="w-5 h-5" />
                          <span>{data.role === 'PROVIDER' ? 'مقدم رعاية صحية' : data.role}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {avgRating > 0 && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 transform transition-all hover:scale-105 hover:shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{totalReviews} تقييم</p>
                        </div>
                      )}
                      
                      {totalServices > 0 && (
                        <div className="p-4 rounded-2xl border transform transition-all hover:scale-105 hover:shadow-lg"
                             style={{ 
                               background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10)`,
                               borderColor: `${colors.primary}30`
                             }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-5 h-5" style={{ color: colors.primary }} />
                            <span className="text-2xl font-bold">{totalServices}</span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>خدمات</p>
                        </div>
                      )}
                      
                      {totalProducts > 0 && (
                        <div className={`p-4 rounded-2xl border transform transition-all hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-800' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            <span className="text-2xl font-bold">{totalProducts}</span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>منتجات</p>
                        </div>
                      )}
                      
                      {data.stats?.profileViews && (
                        <div className={`p-4 rounded-2xl border transform transition-all hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-800' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-5 h-5 text-purple-600" />
                            <span className="text-2xl font-bold">{data.stats.profileViews}</span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>مشاهدة</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="lg"
                        className="text-white shadow-lg hover:shadow-xl transform transition-all hover:scale-105"
                        style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                        onClick={handleStartChat}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        بدء محادثة
                      </Button>
                      {data.phone && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-2 transform transition-all hover:scale-105"
                          style={{ borderColor: colors.primary }}
                          onClick={() => window.location.href = `tel:${data.phone}`}
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          اتصل الآن
                        </Button>
                      )}
                      {totalServices > 0 && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-2 transform transition-all hover:scale-105"
                          style={{ borderColor: colors.secondary }}
                          onClick={() => handleBooking()}
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          احجز موعد
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Quick Info Grid - Arabic Labels */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
          {/* Phone */}
          {data.phone && (
            <Card className="border-2 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: `${colors.primary}30` }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}20` }}>
                    <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <h3 className="font-bold text-lg">الهاتف</h3>
                </div>
                <a href={`tel:${data.phone}`} className="text-xl font-semibold hover:underline" style={{ color: colors.primary }}>
                  {data.phone}
                </a>
              </CardContent>
            </Card>
          )}
          
          {/* Address */}
          {getAddress() && (
            <Card className="border-2 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: `${colors.primary}30` }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.secondary}20` }}>
                    <MapPin className="w-5 h-5" style={{ color: colors.secondary }} />
                  </div>
                  <h3 className="font-bold text-lg">العنوان</h3>
                </div>
                <p className={isDarkMode ? 'text-stone-300' : 'text-stone-700'}>{getAddress()}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Email */}
          {data.email && (
            <Card className="border-2 shadow-lg hover:shadow-xl transition-all" style={{ borderColor: `${colors.primary}30` }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.accent}20` }}>
                    <Mail className="w-5 h-5" style={{ color: colors.accent }} />
                  </div>
                  <h3 className="font-bold text-lg">البريد الإلكتروني</h3>
                </div>
                <a href={`mailto:${data.email}`} className="text-lg hover:underline" style={{ color: colors.accent }}>
                  {data.email}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* About Section */}
        {data.bio && (
          <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
            <Card className="border-2 shadow-lg hover:shadow-2xl transition-all rounded-2xl overflow-hidden" style={{ borderColor: `${colors.primary}30` }}>
              <div className="h-2" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }} />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)` }}>
                    <Info className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>نبذة مختصرة</h2>
                </div>
                <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>{data.bio}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Services Section */}
        {totalServices > 0 && (
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)` }}>
                  <Stethoscope className="w-6 h-6" style={{ color: colors.primary }} />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>الخدمات الطبية</h2>
              </div>
              <Badge className="border-0" style={{ backgroundColor: `${colors.secondary}30`, color: colors.text }}>
                {totalServices} خدمة متاحة
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.services.map((service: any, index: number) => (
                <Card 
                  key={service.id} 
                  className="border-2 hover:shadow-2xl transition-all duration-300 group rounded-2xl overflow-hidden"
                  style={{ borderColor: `${colors.primary}30` }}
                >
                  <div className="h-1.5 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" 
                       style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }} />
                  <CardContent className="p-6">
                    {/* Service Categories */}
                    {service.category && service.category.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.category.map((cat: any) => (
                          <Badge key={cat.id} variant="outline" className="text-xs" style={{ borderColor: colors.accent }}>
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="cursor-pointer" onClick={() => handleServiceClick(service.id)}>
                      <h4 className="font-bold text-xl mb-3 group-hover:underline transition-colors" style={{ color: colors.text }}>
                        {service.translation?.name_ar || service.translation?.name_en || service.name || 'خدمة'}
                      </h4>
                      <p className={`text-sm line-clamp-3 mb-4 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        {service.translation?.description_ar || service.translation?.description_en || service.description}
                      </p>
                    </div>
                    
                    {/* Price and Book Button */}
                    {service.price && (
                      <div className="space-y-3 pt-4 border-t" style={{ borderColor: `${colors.primary}20` }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-stone-500 mb-1">سعر الكشف</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                                {service.price}
                              </span>
                              <span className="text-sm text-stone-500">{service.currency || 'جنيه'}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full text-white shadow-md hover:shadow-lg transition-all"
                          style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBooking(service)
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          احجز الآن
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Products Section */}
        {totalProducts > 0 && (
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>المنتجات الطبية</h2>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {totalProducts} منتج
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.products.map((product: any, index: number) => (
                <Card
                  key={product.id}
                  className="border-2 hover:shadow-xl transition-all cursor-pointer group"
                  style={{ borderColor: `${colors.primary}30` }}
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h4>
                    <p className="text-sm text-stone-600 line-clamp-2 mb-3">{product.description}</p>
                    {product.price && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold" style={{ color: colors.primary }}>{product.price}</span>
                        <span className="text-sm text-stone-500">جنيه</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Location Section */}
        {data.locationLat && data.locationLon && (
          <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
            <Card className="border-2 shadow-lg hover:shadow-2xl transition-all rounded-2xl overflow-hidden" style={{ borderColor: `${colors.primary}30` }}>
              <div className="h-2" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }} />
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)` }}>
                    <MapPin className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>الموقع</h2>
                </div>
                {data.city && (
                  <p className="text-stone-600 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: colors.secondary }} />
                    <span className="text-lg">{data.city}</span>
                  </p>
                )}
                <div className="rounded-2xl overflow-hidden border-2 shadow-inner mb-6" style={{ borderColor: `${colors.primary}20` }}>
                  <DynamicMap
                    center={[parseFloat(data.locationLat), parseFloat(data.locationLon)]}
                    zoom={15}
                    height="400px"
                    markers={[{
                      position: [parseFloat(data.locationLat), parseFloat(data.locationLon)],
                      title: data.name,
                      description: data.city || getAddress() || undefined
                    }]}
                    markerColor={colors.primary}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.phone && (
                    <Button
                      variant="outline"
                      className="border-2"
                      style={{ borderColor: colors.primary }}
                      onClick={() => window.location.href = `tel:${data.phone}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {data.phone}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-2"
                    style={{ borderColor: colors.secondary }}
                    onClick={() => window.open(`https://www.google.com/maps?q=${data.locationLat},${data.locationLon}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    فتح في خرائط جوجل
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Reviews Section */}
        {totalReviews > 0 && (
          <div className={`transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
            <Card className="border-2 shadow-lg hover:shadow-2xl transition-all rounded-2xl overflow-hidden" style={{ borderColor: `${colors.primary}30` }}>
              <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500" />
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl">
                      <Star className="w-6 h-6 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>تقييمات المرضى</h2>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {totalReviews} تقييم
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.reviews.slice(0, 6).map((review: any, index: number) => (
                    <div
                      key={review.id}
                      className="p-6 rounded-2xl border hover:shadow-lg transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(to bottom right, ${colors.primary}05, ${colors.secondary}05)`,
                        borderColor: `${colors.primary}20`
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-stone-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-stone-700 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {totalReviews > 6 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      className="border-2"
                      style={{ borderColor: colors.primary }}
                    >
                      عرض جميع التقييمات ({totalReviews})
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Contact Footer */}
        <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 transtone-y-0' : 'opacity-0 transtone-y-10'}`}>
          <Card className="border-2 shadow-lg rounded-2xl overflow-hidden" 
                style={{ 
                  background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10)`,
                  borderColor: `${colors.primary}30`
                }}>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.primary }}>تواصل معنا</h3>
              <div className="flex flex-wrap justify-center gap-6">
                {data.phone && (
                  <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-md">
                    <Phone className="w-5 h-5" style={{ color: colors.primary }} />
                    <a href={`tel:${data.phone}`} className="hover:underline" style={{ color: colors.text }}>
                      {data.phone}
                    </a>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-md">
                    <Mail className="w-5 h-5" style={{ color: colors.secondary }} />
                    <a href={`mailto:${data.email}`} className="hover:underline" style={{ color: colors.text }}>
                      {data.email}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          service={{
            id: selectedService.id,
            name: selectedService.name,
            translation: selectedService.translation,
            price: selectedService.price || 0,
            currency: selectedService.currency || 'جنيه',
            durationMins: selectedService.durationMins || 60,
            provider: {
              id: data.id,
              name: data.name,
              phone: data.phone,
              email: data.email
            }
          }}
          onSuccess={() => {
            console.log('Booking successful!')
          }}
        />
      )}
    </div>
  )
}

