'use client'

import React from 'react'
import { Award, GraduationCap, Briefcase, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { medicalTheme } from '../theme'

interface DoctorProfileCardProps {
  doctor: {
    name: string
    profilePic?: string
    isVerified?: boolean
    specialty?: string
    yearsOfExperience?: number
    education?: string
    city?: string
  }
  size?: 'sm' | 'md' | 'lg'
}

export default function DoctorProfileCard({ doctor, size = 'md' }: DoctorProfileCardProps) {
  const getExperienceLevel = (years: number = 0) => {
    if (years >= 15) return medicalTheme.experienceLevels.expert
    if (years >= 7) return medicalTheme.experienceLevels.senior
    if (years >= 3) return medicalTheme.experienceLevels.mid
    return medicalTheme.experienceLevels.junior
  }
  
  const experienceLevel = getExperienceLevel(doctor.yearsOfExperience)
  
  const sizeConfig = {
    sm: { avatar: 'w-12 h-12', text: 'text-sm', badge: 'text-xs' },
    md: { avatar: 'w-16 h-16', text: 'text-base', badge: 'text-sm' },
    lg: { avatar: 'w-20 h-20', text: 'text-lg', badge: 'text-base' },
  }
  
  const config = sizeConfig[size]
  
  return (
    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border-l-4 border-l-blue-500">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={`${config.avatar} rounded-full overflow-hidden bg-white shadow-lg border-4 border-white`}>
          {doctor.profilePic ? (
            <img 
              src={doctor.profilePic} 
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
              {doctor.name.charAt(0)}
            </div>
          )}
        </div>
        
        {doctor.isVerified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <Award className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className={`${config.text} font-bold text-blue-900 dark:text-blue-100 truncate`}>
              Dr. {doctor.name}
            </h3>
            {doctor.specialty && (
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {doctor.specialty}
              </p>
            )}
          </div>
          
          {doctor.yearsOfExperience && (
            <Badge className="bg-blue-600 text-white border-0 shrink-0">
              <span className="mr-1">{experienceLevel.badge}</span>
              {experienceLevel.label}
            </Badge>
          )}
        </div>
        
        {/* Details */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {doctor.yearsOfExperience && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3 w-3 text-blue-500" />
              <span>{doctor.yearsOfExperience} years experience</span>
            </div>
          )}
          
          {doctor.education && (
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-blue-500" />
              <span className="truncate">{doctor.education}</span>
            </div>
          )}
          
          {doctor.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-blue-500" />
              <span>{doctor.city}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

