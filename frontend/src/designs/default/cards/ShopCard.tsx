'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Store, Award, Package, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ShopCardProps {
  shop: {
    id: string
    name: string
    description?: string
    city?: string
    coverImage?: string
    logoImage?: string
    isVerified?: boolean
    reviews?: any[]
    _count?: {
      services?: number
      products?: number
      reviews?: number
    }
    design?: {
      slug?: string
    }
  }
  onClick?: () => void
}

export default function ShopCard({ shop, onClick }: ShopCardProps) {
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
    <Card className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden" onClick={handleClick}>
      {/* Cover Image */}
      {shop.coverImage && (
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          <img 
            src={shop.coverImage} 
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {shop.isVerified && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0">
              <Award className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        {/* Logo & Title */}
        <div className="flex items-start gap-3">
          {shop.logoImage && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-border">
              <img 
                src={shop.logoImage} 
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-1">{shop.name}</h3>
            {shop.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{shop.city}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        {shop.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shop.description}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}
          
          {shop._count?.services && shop._count.services > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{shop._count.services} services</span>
            </div>
          )}
          
          {shop._count?.products && shop._count.products > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span>{shop._count.products} products</span>
            </div>
          )}
        </div>
        
        <Button className="w-full" variant="outline" size="sm">
          <Store className="h-4 w-4 mr-2" />
          Visit Shop
        </Button>
      </CardContent>
    </Card>
  )
}

