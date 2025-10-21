'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, Phone, Globe, ArrowLeft, 
  Lock, Eye, Award, Users, TrendingUp, 
  Facebook, Instagram, Twitter, Linkedin, Navigation
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'

// Dynamic import for Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

/**
 * 🧩 FreeListingView - Free Plan View
 * 
 * Purpose:
 * Publicly visible listing for all verified or basic users/services,
 * showing only essential business info with limited contact details.
 * 
 * Data Sources:
 * - Service (primary)
 * - User (owner/provider)
 * - Shop (if applicable)
 * - Review (ratings and feedback)
 * - SubCategory & Category (classification)
 * 
 * Key Fields:
 * - serviceId: Service.id
 * - serviceName: Service.translation.name or fallback
 * - ownerName: User.name
 * - mainCategory: Category.name
 * - subCategory: SubCategory.name
 * - city: Service.city
 * - address: Shop.address / Service.city
 * - mapLat/mapLon: Service.locationLat/locationLon
 * - phone: Service.phone (masked for free tier)
 * - socialLinks: from Service.design / User
 * - rating: AVG(Review.rating)
 * - reviewsCount: COUNT(Review.id)
 * - viewCount: from Analytics table
 * - invitationPoints: from referral table
 * - coverImage: Service.coverImage
 * - logoImage: Service.logoImage
 */

interface FreeListingData {
  // Core identifiers
  id: string
  serviceId?: string
  
  // Names and descriptions
  name: string
  serviceName?: string
  ownerName?: string
  description?: string
  bio?: string
  translation?: {
    name_en?: string
    name_ar?: string
    description_en?: string
    description_ar?: string
  }
  
  // Categories
  mainCategory?: string
  subCategory?: string | { id: string; name: string; slug: string }
  category?: string | { id: string; name: string; slug: string }
  categories?: Array<{ id: string; name: string; slug: string; description?: string }>
  design?: {
    slug?: string
    name?: string
  }
  
  // Location data
  city?: string
  address?: string
  locationLat?: number
  locationLon?: number
  mapLat?: number
  mapLon?: number
  
  // Contact (limited/masked for free tier)
  phone?: string
  email?: string
  website?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  
  // Rating and engagement metrics
  rating?: number
  avgRating?: number
  reviews?: any[]
  reviewsCount?: number
  viewCount?: number
  invitationPoints?: number
  
  // Media
  coverImage?: string
  logoImage?: string
  profilePic?: string
  galleryImages?: string[]
  
  // Verification status
  isVerified?: boolean
  ownerUser?: {
    id?: string
    name?: string
    isVerified?: boolean
  }
  
  // Related entities
  services?: any[]
  shops?: any[]
  products?: any[]
  _count?: {
    services?: number
    shops?: number
    products?: number
    reviews?: number
  }
}

interface FreeListingViewProps {
  data: FreeListingData
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function FreeListingView({ data, type }: FreeListingViewProps) {
  const router = useRouter()
  
  // Resolve theme based on category/type
  const theme = resolveTheme(data.design?.slug || data.mainCategory || type)
  const themeClasses = getThemeClasses(theme)

  // Extract display values with fallbacks
  const displayName = data.serviceName || data.name
  const displayOwner = data.ownerName || data.ownerUser?.name
  const displayCategory = typeof data.category === 'string' 
    ? data.category 
    : data.category?.en || data.mainCategory
  const displaySubCategory = data.subCategory
  
  // Calculate average rating from reviews or use provided value
  const avgRating = data.avgRating || (
    data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
      : 0
  )
  const totalReviews = data.reviewsCount || data._count?.reviews || data.reviews?.length || 0

  // Mask phone number for free tier (show first digits, hide last 3)
  const maskedPhone = data.phone ? `${data.phone.slice(0, -3)}XXX` : null

  // Get location coordinates
  const latitude = data.locationLat || data.mapLat
  const longitude = data.locationLon || data.mapLon
  const hasLocation = latitude && longitude

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Hero Section with Cover */}
      <div className="relative h-80 overflow-hidden">
        {data.coverImage ? (
          <>
            <img 
              src={data.coverImage} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div 
            className="h-full relative"
            style={{
              background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-20">
              {theme.emoji}
            </div>
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm z-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Hero Content */}
        <div className="container mx-auto px-4 absolute bottom-0 left-0 right-0 pb-8">
          <div className="flex items-end gap-6">
            {/* Logo/Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-4 border-white dark:border-stone-800 shadow-2xl flex items-center justify-center overflow-hidden">
              {data.logoImage || data.profilePic ? (
                <img 
                  src={data.logoImage || data.profilePic} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">{theme.emoji}</span>
              )}
            </div>
            
            {/* Title Info */}
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold drop-shadow-lg">{displayName}</h1>
                {data.isVerified && (
                  <Badge className="bg-green-500 text-white border-0">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {displayOwner && (
                <p className="text-lg opacity-90 mb-2">by {displayOwner}</p>
              )}
              
              {/* Categories & Subcategory Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {/* Display all main categories */}
                {data.categories && data.categories.length > 0 ? (
                  data.categories.map((cat, idx) => (
                    <Badge 
                      key={cat.id || idx} 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    >
                      {cat.name}
                    </Badge>
                  ))
                ) : displayCategory && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {displayCategory}
                  </Badge>
                )}
                
                {/* Display subcategory */}
                {data.subCategory && (
                  <Badge 
                    variant="outline" 
                    className="bg-white/10 text-white border-white/30 backdrop-blur-sm"
                  >
                    {typeof data.subCategory === 'string' ? data.subCategory : data.subCategory.name}
                  </Badge>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm drop-shadow-md">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{avgRating.toFixed(1)}</span>
                    <span className="opacity-90">({totalReviews} reviews)</span>
                  </div>
                )}
                {data.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{data.city}</span>
                  </div>
                )}
                {data.viewCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{data.viewCount} views</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upgrade Notice */}
            <Alert className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
              <Lock className="h-5 w-5 text-amber-600" />
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Limited Access - Free Plan
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Upgrade to see full contact details, chat directly, and access premium features
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => router.push('/subscription-plans')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  View Plans
                </Button>
              </AlertDescription>
            </Alert>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                  {data.description || data.bio || 'No description available.'}
                </p>
                
                {data.translation && (
                  <div className="mt-4 p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">Arabic:</p>
                    <p className="text-stone-700 dark:text-stone-300" dir="rtl">
                      {data.translation.description_ar || data.translation.name_ar}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services (if available) */}
            {data.services && data.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Services Offered</span>
                    <Badge variant="secondary">{data._count?.services || data.services.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.services.slice(0, 4).map((service: any, idx: number) => (
                      <div key={service.id || idx} className="p-3 border rounded-lg hover:border-primary transition-colors">
                        <p className="font-medium text-sm">
                          {service.translation?.name_en || service.name || 'Service'}
                        </p>
                        {service.price && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {service.currency || 'EGP'} {service.price}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {data.services.length > 4 && (
                    <p className="text-sm text-center text-muted-foreground mt-3">
                      +{data.services.length - 4} more services
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews Preview */}
            {data.reviews && data.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews ({totalReviews})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.reviews.slice(0, 3).map((review: any, idx: number) => (
                    <div key={review.id || idx} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-stone-300 dark:text-stone-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-sm">
                          {review.user?.name || review.author?.name || 'Anonymous'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment?.substring(0, 200)}
                        {review.comment?.length > 200 && '...'}
                      </p>
                      {review.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                  {data.reviews.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View All Reviews
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone (masked) */}
                {maskedPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-base font-mono">{maskedPhone}</p>
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Full number visible for verified members
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(data.city || data.address) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="text-base">{data.address || data.city}</p>
                      {hasLocation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Website (if available) */}
                {data.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Website</p>
                      <a 
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Social Links */}
                {data.socialLinks && Object.keys(data.socialLinks).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Social Media</p>
                    <div className="flex gap-2">
                      {data.socialLinks.facebook && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={data.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {data.socialLinks.instagram && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {data.socialLinks.twitter && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={data.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {data.socialLinks.linkedin && (
                        <Button variant="outline" size="icon" asChild>
                          <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Engagement Stats */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                  <div className="grid grid-cols-2 gap-3">
                    {data.viewCount && (
                      <div className="text-center p-2 bg-stone-100 dark:bg-stone-800 rounded">
                        <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-bold">{data.viewCount}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                    )}
                    {data.invitationPoints && (
                      <div className="text-center p-2 bg-stone-100 dark:bg-stone-800 rounded">
                        <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-lg font-bold">{data.invitationPoints}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => router.push('/subscription-plans')}
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock Full Access
                </Button>
              </CardContent>
            </Card>

            {/* Interactive Map (if location available) */}
            {hasLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg overflow-hidden border">
                    <DynamicMap
                      center={[latitude!, longitude!]}
                      zoom={15}
                      markers={[{
                        position: [latitude!, longitude!],
                        title: displayName,
                        description: data.city || data.address
                      }]}
                      height="250px"
                    />
                  </div>
                  
                  {/* Get Directions Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

