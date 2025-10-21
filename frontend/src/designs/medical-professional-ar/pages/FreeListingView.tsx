/**
 * Medical Free Listing Page (Plan 1)
 * Basic public listing with essential information only
 * No chat, no bookings, no advanced features
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Star, Phone, Mail, Eye, Award, Building2, ArrowLeft, Users
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import dynamic from 'next/dynamic'

// Dynamic map import
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

interface FreeListingViewProps {
  data: any
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function MedicalFreeListingView({ data, type }: FreeListingViewProps) {
  const router = useRouter()
  
  console.log('=== Medical FreeListingView Mounted ===')
  console.log('Type:', type)
  
  // Calculate basic stats
  const avgRating = data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
    : 0
  const totalReviews = data.reviews?.length || 0
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-stone-900 dark:to-blue-950">
      {/* Simple Medical Header */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
      
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        {/* Main Card - Basic Info Only */}
        <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-300 flex-shrink-0">
                {data.profilePic || data.logoImage ? (
                  <img
                    src={data.profilePic || data.logoImage}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {data.name}
                  </h1>
                  {data.role && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      {data.role === 'PROVIDER' ? 'Healthcare Provider' : data.role}
                    </p>
                  )}
                </div>
                
                {/* Rating */}
                {avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(avgRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {avgRating.toFixed(1)} ({totalReviews} reviews)
                    </span>
                  </div>
                )}
                
                {/* Category */}
                {data.mainCategory && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    {data.mainCategory}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Description */}
            {data.bio && (
              <div className="pt-4 border-t border-blue-100 dark:border-blue-900">
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  {data.bio}
                </p>
              </div>
            )}
            
            {/* Contact Information */}
            <div className="pt-4 border-t border-blue-100 dark:border-blue-900 space-y-3">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Contact Information</h3>
              <div className="space-y-2">
                {data.phone && (
                  <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <a href={`tel:${data.phone}`} className="hover:text-blue-600">
                      {data.phone}
                    </a>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <a href={`mailto:${data.email}`} className="hover:text-blue-600">
                      {data.email}
                    </a>
                  </div>
                )}
                {data.city && (
                  <div className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>{data.city}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* View Count (if available) */}
            {data.stats?.profileViews && (
              <div className="pt-4 border-t border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <Eye className="w-4 h-4" />
                  <span>{data.stats.profileViews} views</span>
                </div>
              </div>
            )}
            
            {/* Upgrade CTA */}
            <div className="pt-4 border-t border-blue-100 dark:border-blue-900">
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Upgrade to Premium
                      </h4>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        Get verified badge, enable bookings, and chat with clients
                      </p>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Reviews Section */}
        {totalReviews > 0 && (
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-4">
                Reviews ({totalReviews})
              </h3>
              <div className="space-y-4">
                {data.reviews.slice(0, 3).map((review: any) => (
                  <div key={review.id} className="pb-4 border-b border-blue-100 dark:border-blue-900 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-stone-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-stone-700 dark:text-stone-300">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
                {totalReviews > 3 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 text-center pt-2">
                    +{totalReviews - 3} more reviews
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Map (if location available) */}
        {data.locationLat && data.locationLon && (
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-4">Location</h3>
              <DynamicMap
                latitude={data.locationLat}
                longitude={data.locationLon}
                markerTitle={data.name}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

