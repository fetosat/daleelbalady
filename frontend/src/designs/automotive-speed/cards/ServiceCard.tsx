'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Zap, Award, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { colors } from '../colors'

interface ServiceCardProps {
  service: any
  onClick?: () => void
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  const router = useRouter()
  
  const serviceName = service.translation?.name_en || service.translation?.name_ar || service.name || 'Service'
  const avgRating = service.reviews?.length 
    ? service.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / service.reviews.length 
    : 0
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/listing/${service.id}`)
    }
  }
  
  return (
    <Card 
      className="group hover:shadow-2xl transition-all cursor-pointer overflow-hidden border-0"
      onClick={handleClick}
      style={{
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 100%)`,
        borderLeft: `4px solid ${colors.primary}`
      }}
    >
      <CardContent className="p-0">
        <div className="flex h-full">
          {/* Racing Stripe & Image */}
          <div className="relative w-2/5 overflow-hidden">
            {(service.coverImage || service.logoImage) ? (
              <>
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `repeating-linear-gradient(
                      45deg,
                      ${colors.primary},
                      ${colors.primary} 10px,
                      ${colors.secondary} 10px,
                      ${colors.secondary} 20px
                    )`
                  }}
                />
                <img 
                  src={service.coverImage || service.logoImage} 
                  alt={serviceName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` 
                }}
              >
                <Zap className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            
            {service.ownerUser?.isVerified && (
              <div 
                className="absolute top-2 left-2 px-2 py-1 rounded text-white text-xs font-bold flex items-center gap-1"
                style={{ backgroundColor: colors.accent }}
              >
                <Award className="h-3 w-3" />
                VERIFIED
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 
                    className="font-bold text-lg line-clamp-1 uppercase tracking-wide"
                    style={{ color: colors.primary }}
                  >
                    {serviceName}
                  </h3>
                  {service.ownerUser?.name && (
                    <p className="text-sm opacity-70">{service.ownerUser.name}</p>
                  )}
                </div>
                
                {avgRating > 0 && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded"
                    style={{ backgroundColor: `${colors.accent}20` }}
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm">{avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              {/* Category Badge */}
              {service.category && service.category.length > 0 && (
                <Badge 
                  className="text-xs font-bold border-0"
                  style={{ 
                    backgroundColor: `${colors.secondary}30`,
                    color: colors.text
                  }}
                >
                  {service.category[0].name}
                </Badge>
              )}
            </div>
            
            {/* Footer */}
            <div className="space-y-2">
              {/* Location */}
              {service.city && (
                <div className="flex items-center gap-1 text-sm opacity-70">
                  <MapPin className="h-3 w-3" />
                  <span>{service.city}</span>
                </div>
              )}
              
              {/* Price Bar */}
              <div 
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                {service.price ? (
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-2xl font-black"
                      style={{ color: colors.primary }}
                    >
                      {service.price}
                    </span>
                    <span className="text-xs opacity-70">{service.currency || 'EGP'}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold opacity-70">QUOTE REQUIRED</span>
                )}
                
                <ChevronRight 
                  className="h-5 w-5 group-hover:transtone-x-1 transition-transform"
                  style={{ color: colors.primary }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

