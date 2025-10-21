'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Clock, DollarSign, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { colors } from '../colors'

interface ServiceCardProps {
  service: {
    id: string
    name?: string
    translation?: {
      name_en?: string
      name_ar?: string
      description_en?: string
      description_ar?: string
    }
    price?: number
    currency?: string
    durationMins?: number
    city?: string
    coverImage?: string
    logoImage?: string
    category?: any[]
    reviews?: any[]
    ownerUser?: {
      name?: string
      isVerified?: boolean
    }
    design?: {
      slug?: string
    }
  }
  onClick?: () => void
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const router = useRouter()
  
  const serviceName = service.translation?.name_en || service.translation?.name_ar || service.name || 'Service'
  const avgRating = service.reviews?.length 
    ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / service.reviews.length 
    : 0
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/listing/${service.id}`)
    }
  }
  
  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden" onClick={handleClick}>
      {/* Image */}
      {(service.coverImage || service.logoImage) && (
        <div className="relative h-48 overflow-hidden" style={{ background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.primary}05)` }}>
          <img 
            src={service.coverImage || service.logoImage} 
            alt={serviceName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {service.ownerUser?.isVerified && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0">
              <Award className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{serviceName}</h3>
          {service.ownerUser?.name && (
            <p className="text-sm text-muted-foreground">by {service.ownerUser.name}</p>
          )}
        </div>
        
        {/* Category */}
        {service.category && service.category.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {service.category[0].name}
          </Badge>
        )}
        
        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}
          {service.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{service.city}</span>
            </div>
          )}
        </div>
        
        {/* Price & Duration */}
        <div className="flex items-center justify-between pt-2 border-t">
          {service.price ? (
            <div className="flex items-center gap-1 font-semibold" style={{ color: colors.primary }}>
              <DollarSign className="h-4 w-4" />
              <span>{service.price} {service.currency || 'EGP'}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Price on request</span>
          )}
          
          {service.durationMins && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{service.durationMins}min</span>
            </div>
          )}
        </div>
        
        <Button className="w-full" variant="outline" size="sm">
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}

