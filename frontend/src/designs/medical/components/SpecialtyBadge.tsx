'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { medicalTheme } from '../theme'

interface SpecialtyBadgeProps {
  specialty: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function SpecialtyBadge({ 
  specialty, 
  size = 'md',
  showIcon = true 
}: SpecialtyBadgeProps) {
  // Normalize specialty name
  const normalizedSpecialty = specialty.toLowerCase().replace(/\s+/g, '')
  
  // Get specialty config or use default
  const specialtyConfig = Object.entries(medicalTheme.specialties).find(
    ([key]) => normalizedSpecialty.includes(key)
  )?.[1] || medicalTheme.specialties.general
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }
  
  return (
    <Badge 
      className={`${sizeClasses[size]} font-medium border-0`}
      style={{ 
        backgroundColor: `${specialtyConfig.color}15`,
        color: specialtyConfig.color,
      }}
    >
      {showIcon && <span className="mr-1">{specialtyConfig.icon}</span>}
      {specialtyConfig.label}
    </Badge>
  )
}

