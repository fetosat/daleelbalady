'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Award, Phone, Clock, Building2, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { medicalTheme } from '../theme'

interface ShopCardProps {
  shop: {
    id: string
    name: string
    description?: string
    city?: string
    phone?: string
    coverImage?: string
    logoImage?: string
    isVerified?: boolean
    reviews?: any[]
    _count?: {
      services?: number
      products?: number
      reviews?: number
    }
    openingHours?: string
    isOpen?: boolean
  }
  onClick?: () => void
}

export default function MedicalShopCard({ shop, onClick }: ShopCardProps) {
  const router = useRouter()
  
  const avgRating = shop.reviews?.length 
    ? shop.reviews.reduce((sum, r) => sum + r.rating, 0) / shop.reviews.length 
    : 0
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/shop/${shop.id}`)
    }
  }
  
  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-0 shadow-lg" 
      onClick={handleClick}
      style={{
        borderLeft: `4px solid ${medicalTheme.colors.primary[600]}`
      }}
    >
      {/* Header with Logo Overlay */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 overflow-hidden">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '15px 15px'
          }} />
        </div>
        
        {shop.coverImage && (
          <img 
            src={shop.coverImage} 
            alt={shop.name}
            className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
          />
        )}
        
        {/* Verified Badge */}
        {shop.isVerified && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 shadow-md">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
        
        {/* Open/Closed Badge */}
        <Badge 
          className={`absolute top-3 left-3 border-0 shadow-md ${
            shop.isOpen 
              ? 'bg-green-500 text-white' 
              : 'bg-stone-500 text-white'
          }`}
        >
          {shop.isOpen ? '● Open Now' : '● Closed'}
        </Badge>
        
        {/* Shop Logo - Prominent */}
        {shop.logoImage && (
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-xl border-4 border-white overflow-hidden bg-white shadow-xl">
              <img 
                src={shop.logoImage} 
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-5 pt-12 space-y-4">
        {/* Shop Name & Rating */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-blue-900 dark:text-blue-100 line-clamp-1">
                {shop.name}
              </h3>
              {shop.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {shop.description}
                </p>
              )}
            </div>
            
            {avgRating > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-950 rounded-full shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm text-yellow-600">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {shop._count?.services && shop._count.services > 0 && (
              <span>⚕️ {shop._count.services} services</span>
            )}
            {shop._count?.products && shop._count.products > 0 && (
              <span>💊 {shop._count.products} products</span>
            )}
            {shop._count?.reviews && shop._count.reviews > 0 && (
              <span>⭐ {shop._count.reviews} reviews</span>
            )}
          </div>
        </div>
        
        {/* Location & Hours */}
        <div className="space-y-2 text-sm">
          {shop.city && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
              <span>{shop.city}</span>
            </div>
          )}
          
          {shop.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-blue-500 shrink-0" />
              <span>{shop.phone}</span>
            </div>
          )}
          
          {shop.openingHours && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-500 shrink-0" />
              <span>{shop.openingHours}</span>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all" 
          size="lg"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Visit Pharmacy
        </Button>
      </CardContent>
    </Card>
  )
}

