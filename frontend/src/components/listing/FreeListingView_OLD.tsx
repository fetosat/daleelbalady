'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  MapPin, Star, Phone, Mail, Globe, ArrowLeft, 
  ExternalLink, Clock, DollarSign, Shield, Lock,
  Eye, Award, Users, TrendingUp, Facebook, Instagram, Twitter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'

/**
 * FreeListingView - Free Plan View
 * Purpose: Publicly visible listing for all verified or basic users/services
 * Shows only essential business info with limited contact details
 * 
 * Data Sources: Service, User, Shop, Review, SubCategory, Category
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
  subCategory?: string
  category?: string | { en: string; ar: string }
  design?: {
    slug?: string
    name?: string
  }
  
  // Location data
  city?: string
  address?: string
  locationLat?: number
  locationLon?: number
  
  // Contact (limited)
  phone?: string
  email?: string
  website?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  
  // Rating and engagement
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
  
  // Verification
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
  
  // Resolve theme
  const theme = resolveTheme(data.design?.slug || type)
  const themeClasses = getThemeClasses(theme)

  // Calculate average rating
  const avgRating = data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
    : 0

  // Mask phone number for free tier
  const maskedPhone = data.phone ? data.phone.slice(0, -3) + 'XXX' : null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="h-64 relative"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-end gap-6">
            {/* Logo/Avatar */}
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center text-6xl">
              {data.logoImage || data.profilePic ? (
                <img 
                  src={data.logoImage || data.profilePic} 
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{theme.emoji}</span>
              )}
            </div>
            
            {/* Title Info */}
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{data.name}</h1>
                {data.isVerified && (
                  <Shield className="h-6 w-6 text-green-400" />
                )}
              </div>
              <p className="text-lg opacity-90 mb-3">{data.description || data.bio || 'No description available'}</p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{avgRating.toFixed(1)}</span>
                    <span className="opacity-75">({data.reviews?.length || 0} reviews)</span>
                  </div>
                )}
                {data.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{data.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upgrade Notice */}
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
              <Lock className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Viewing limited information. Upgrade to see full contact details and chat.</span>
                <Button size="sm" variant="default">
                  Upgrade Plan
                </Button>
              </AlertDescription>
            </Alert>

            {/* Description */}
            {(data.description || data.bio) && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {data.description || data.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* User's Services */}
            {data.services && data.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Services</span>
                    <Badge variant="secondary">{data._count?.services || data.services.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.services.slice(0, 3).map((service: any) => (
                      <div key={service.id} className="p-2 border rounded-lg">
                        <p className="font-medium text-sm">{service.translation?.name_en || service.name || 'Service'}</p>
                        {service.price && (
                          <p className="text-xs text-muted-foreground">{service.currency || 'EGP'} {service.price}</p>
                        )}
                      </div>
                    ))}
                    {data.services.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{data.services.length - 3} more services
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User's Shops */}
            {data.shops && data.shops.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Shops</span>
                    <Badge variant="secondary">{data._count?.shops || data.shops.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.shops.slice(0, 3).map((shop: any) => (
                      <div key={shop.id} className="p-2 border rounded-lg">
                        <p className="font-medium text-sm">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.city}</p>
                      </div>
                    ))}
                    {data.shops.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{data.shops.length - 3} more shops
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            {data.reviews && data.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.reviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.author?.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.comment?.substring(0, 150)}
                        {review.comment?.length > 150 && '...'}
                      </p>
                    </div>
                  ))}
                  
                  {data.reviews.length > 3 && (
                    <Button variant="outline" className="w-full">
                      View All {data.reviews.length} Reviews
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {maskedPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Phone</p>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">{maskedPhone}</p>
                        <Lock className="h-3 w-3 text-amber-500" />
                      </div>
                    </div>
                  </div>
                )}
                
                <Alert variant="default" className="bg-muted">
                  <AlertDescription className="text-xs">
                    Full contact details available with verification plan
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Location Card */}
            {data.city && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{data.city}</p>
                      {data.locationLat && data.locationLon && (
                        <p className="text-xs text-muted-foreground">
                          Approximate location (exact address locked)
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing (for services) */}
            {data.price && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="text-2xl font-bold">
                      {data.currency || 'EGP'} {data.price}
                    </span>
                  </div>
                  {data.durationMins && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{data.durationMins} minutes</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CTA Card */}
            <Card className={`border-2 ${themeClasses.cardContainer}`}>
              <CardHeader>
                <CardTitle>Ready to Connect?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upgrade your account to:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    View full contact information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Direct messaging & chat
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Make bookings & appointments
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  style={{ backgroundColor: theme.colors.primary }}
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

