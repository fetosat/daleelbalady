'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, Phone, Mail, Globe, ArrowLeft, MessageCircle,
  Calendar, Clock, Users, MessageSquare, TrendingUp, CheckCircle,
  Home, Building2, Video, Shield, Award, Eye, DollarSign,
  ChevronLeft, ChevronRight, X, Check, Facebook, Instagram, Twitter,
  Linkedin, ExternalLink, Navigation, Share2, Heart, Verified
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'
import { bookingAPI, type TimeSlot, type AvailableSlotsResponse } from '@/api/booking'
import { useAuth } from '@/lib/auth'

// Dynamic import for Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

/**
 * ⚙️ ServiceBookingView - Services Plan View
 * 
 * Purpose:
 * Enables advanced features for premium users including bookings, 
 * availability management, scheduling, and client tracking.
 * 
 * Key Features:
 * - Booking calendar with availability
 * - Multiple booking types (Clinic, Home Visit, Consultation)
 * - Working hours display
 * - Client tracking (count, messages, follow-ups)
 * - Service metrics and analytics
 */

interface ServiceBookingData {
  id: string
  name: string
  description?: string
  bio?: string
  
  // Owner info
  ownerName?: string
  ownerUser?: {
    id?: string
    name?: string
    isVerified?: boolean
    verifiedBadge?: string
    profilePic?: string
  }
  
  // Location
  city?: string
  address?: any
  locationLat?: number
  locationLon?: number
  
  // Contact & Social
  phone?: string
  email?: string
  website?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    whatsapp?: string
  }
  
  // Category & Classification
  mainCategory?: {
    id?: string
    name?: string
    slug?: string
  }
  subCategory?: {
    id?: string
    name?: string
    slug?: string
  }
  category?: Array<{
    id: string
    name: string
    slug: string
  }>
  
  // Pricing & duration
  price?: number
  currency?: string
  durationMins?: number
  
  // Booking types
  bookingTypes?: string[]
  bookingTypesEnabled?: {
    clinicVisit?: boolean
    homeVisit?: boolean
    consultation?: boolean
  }
  
  // Availability
  workHours?: {
    [key: string]: { start: string; end: string; closed?: boolean }
  }
  availabilitySchedule?: any
  availability?: Array<{
    dayOfWeek: string
    startTime: string
    endTime: string
    isRecurring: boolean
  }>
  
  // Metrics (for Services Plan)
  clientsCount?: number
  messagesCount?: number
  followupsCount?: number
  bookingsEnabled?: boolean
  viewCount?: number
  
  // Subscription & Verification
  isVerified?: boolean
  verifiedBadge?: string
  verificationExpiry?: string
  providerSubscription?: {
    planType?: string
    canTakeBookings?: boolean
    searchPriority?: number
    hasPriorityBadge?: boolean
    hasPromotionalVideo?: boolean
    expiresAt?: string
  }
  
  // Referral & Gamification
  invitationPoints?: number
  
  // Media
  coverImage?: string
  logoImage?: string
  profilePic?: string
  galleryImages?: string[]
  
  // Reviews
  reviews?: Array<{
    id: string
    rating: number
    comment?: string
    author?: {
      id: string
      name: string
      profilePic?: string
      isVerified?: boolean
    }
    createdAt: string
    isVerified?: boolean
  }>
  avgRating?: number
  rating?: number
  
  // Shop info (if service belongs to shop)
  shop?: {
    id: string
    name: string
    isVerified: boolean
    ownerId: string
    owner?: {
      id: string
      name: string
      isVerified: boolean
    }
  }
  
  // Theme
  design?: {
    slug?: string
    name?: string
  }
  
  createdAt?: string
  updatedAt?: string
}

interface ServiceBookingViewProps {
  data: ServiceBookingData
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function ServiceBookingView({ data, type }: ServiceBookingViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const theme = resolveTheme(data.design?.slug || type)
  
  // Booking state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bookingType, setBookingType] = useState<string>('clinic')
  const [bookingNotes, setBookingNotes] = useState('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  
  // Calculate metrics
  const avgRating = data.avgRating || data.rating || 0
  const totalReviews = data.reviews?.length || 0
  
  // Default booking types if not specified
  const bookingTypes = data.bookingTypes || [
    data.bookingTypesEnabled?.clinicVisit !== false && 'Clinic Visit',
    data.bookingTypesEnabled?.homeVisit && 'Home Visit',
    data.bookingTypesEnabled?.consultation && 'Consultation'
  ].filter(Boolean) as string[]
  
  // Default work hours (Mon-Fri 9am-5pm)
  const workHours = data.workHours || {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { closed: true },
    sunday: { closed: true }
  }
  
  // Load available slots when date changes
  useEffect(() => {
    if (data.bookingsEnabled !== false) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate, data.id])
  
  const loadAvailableSlots = async (date: Date) => {
    setLoadingSlots(true)
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await bookingAPI.getAvailableSlots(data.id, dateStr)
      setAvailableSlots(response.availableSlots)
    } catch (error) {
      console.error('Failed to load slots:', error)
      // Generate mock slots for demo
      setAvailableSlots(generateMockSlots())
    } finally {
      setLoadingSlots(false)
    }
  }
  
  const generateMockSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const duration = data.durationMins || 60
    for (let hour = 9; hour < 17; hour++) {
      slots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + Math.floor(duration / 60)).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`,
        duration
      })
    }
    return slots
  }
  
  const handleBooking = async () => {
    if (!selectedSlot || !user) {
      alert('Please login to book an appointment')
      return
    }
    
    setIsBooking(true)
    try {
      const startDateTime = new Date(selectedDate)
      const [hours, minutes] = selectedSlot.start.split(':')
      startDateTime.setHours(parseInt(hours), parseInt(minutes))
      
      const endDateTime = new Date(startDateTime)
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedSlot.duration)
      
      await bookingAPI.createBooking({
        serviceId: data.id,
        userId: user.id,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        notes: `${bookingType}: ${bookingNotes}`.trim()
      })
      
      setBookingDialogOpen(false)
      setSelectedSlot(null)
      setBookingNotes('')
      setBookingType('clinic')
      // Show success message
      alert('Booking confirmed! You will receive a confirmation shortly.')
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }
  
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }
  
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  }
  
  const todayHours = workHours[getDayName(selectedDate)]
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-72"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
        }}
      >
        {data.coverImage && (
          <>
            <img src={data.coverImage} alt={data.name} className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
          </>
        )}
        
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-end gap-6 w-full">
            {/* Logo */}
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center text-6xl relative overflow-hidden">
              {data.logoImage || data.profilePic ? (
                <img src={data.logoImage || data.profilePic} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <span>{theme.emoji}</span>
              )}
              {data.isVerified && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            
            {/* Title */}
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{data.name}</h1>
                <Badge variant="secondary" className="bg-purple-500 text-white border-0">
                  <Calendar className="h-3 w-3 mr-1" />
                  Services Plan
                </Badge>
              </div>
              <p className="text-lg opacity-90 mb-3">{data.description || data.bio || 'Professional service provider'}</p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm flex-wrap">
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{avgRating.toFixed(1)}</span>
                    <span className="opacity-75">({totalReviews} reviews)</span>
                  </div>
                )}
                {data.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{data.city}</span>
                  </div>
                )}
                {data.clientsCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{data.clientsCount} clients</span>
                  </div>
                )}
                {data.viewCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{data.viewCount} views</span>
                  </div>
                )}
                {(data.subCategory?.name || data.category?.[0]?.name) && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="bg-white/20 border-white/40 text-white">
                      {data.subCategory?.name || data.category?.[0]?.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <Button size="lg" className="mb-2" style={{ backgroundColor: theme.colors.primary }}>
              <MessageCircle className="h-5 w-5 mr-2" />
              Message Provider
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Metadata */}
            {(data.subCategory || data.category || data.createdAt || data.viewCount) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Service Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {data.category?.[0]?.name && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Main Category</p>
                        <Badge variant="outline" className="text-sm">
                          {data.category[0].name}
                        </Badge>
                      </div>
                    )}
                    {data.subCategory?.name && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Subcategory</p>
                        <Badge variant="outline" className="text-sm">
                          {data.subCategory.name}
                        </Badge>
                      </div>
                    )}
                    {data.createdAt && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                        <p className="text-sm font-medium">
                          {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                    {data.viewCount !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Profile Views</p>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">{data.viewCount.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {data.invitationPoints !== undefined && data.invitationPoints > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Referral Points</p>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <p className="text-sm font-medium text-yellow-600">{data.invitationPoints} points</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Service Metrics */}
            {data.bookingsEnabled !== false && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Service Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">{data.clientsCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-600">{data.messagesCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Messages</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">{data.followupsCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Follow-ups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Booking Types */}
            {(bookingTypes.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {bookingTypes.map((type) => (
                      <div key={type} className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                          {type.includes('Clinic') && <Building2 className="h-4 w-4" />}
                          {type.includes('Home') && <Home className="h-4 w-4" />}
                          {type.includes('Consultation') && <Video className="h-4 w-4" />}
                          <span className="font-medium">{type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Typical duration: {data.durationMins || 45} mins</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Calendar - Always show for Services Plan */}
            {(
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Book an Appointment
                    </div>
                    <div className="text-sm font-normal text-muted-foreground">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Navigator */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateDate('prev')}
                      disabled={selectedDate <= new Date()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateDate('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Available slots */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {loadingSlots ? (
                      <p className="text-muted-foreground">Loading slots...</p>
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map((slot, idx) => (
                        <Button
                          key={idx}
                          variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
                          onClick={() => setSelectedSlot(slot)}
                          className="justify-center"
                        >
                          {slot.start} - {slot.end}
                        </Button>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No available slots for this date.</p>
                    )}
                  </div>

                  {/* Booking type and notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>Visit Type</Label>
                      <Select value={bookingType} onValueChange={setBookingType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select booking type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookingTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        placeholder="Any notes for the provider..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={!selectedSlot || isBooking}
                      onClick={() => setBookingDialogOpen(true)}
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>

                  {/* Confirm booking dialog */}
                  <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm your booking</DialogTitle>
                        <DialogDescription>
                          {selectedSlot ? (
                            <>
                              <div className="mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{selectedDate.toDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{selectedSlot.start} - {selectedSlot.end}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{data.currency || 'EGP'} {data.price?.toFixed(2) || 'N/A'}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <span>Select a time slot to continue</span>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleBooking} disabled={!selectedSlot || isBooking}>
                          {isBooking ? 'Booking...' : 'Confirm'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
            
            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(workHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="capitalize font-medium">{day}</span>
                      {(hours as any).closed ? (
                        <Badge variant="secondary">Closed</Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          {(hours as any).start} - {(hours as any).end}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* About */}
            {data.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {data.description}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Reviews */}
            {data.reviews && data.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews ({totalReviews})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.reviews.slice(0, 5).map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.author?.name || review.user?.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      {review.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact & Pricing */}
          <div className="space-y-6">
            {/* Pricing Card - Sticky */}
            {data.price && (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">Starting from</p>
                    <p className="text-4xl font-bold" style={{ color: theme.colors.primary }}>
                      {data.currency || 'EGP'} {data.price}
                    </p>
                    {data.durationMins && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {data.durationMins} minutes session
                      </p>
                    )}
                  </div>
                  <Button className="w-full" size="lg" style={{ backgroundColor: theme.colors.primary }}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                  <Button className="w-full" variant="outline" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Contact & Social Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact & Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Primary Contacts */}
                {data.phone && (
                  <a href={`tel:${data.phone}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{data.phone}</p>
                    </div>
                  </a>
                )}
                
                {data.email && (
                  <a href={`mailto:${data.email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{data.email}</p>
                    </div>
                  </a>
                )}
                
                {data.website && (
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="font-medium text-sm">Visit Website</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                
                {/* Social Links */}
                {(data.socialLinks?.facebook || data.socialLinks?.instagram || data.socialLinks?.twitter || data.socialLinks?.linkedin || data.socialLinks?.whatsapp) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-3">Follow Us</p>
                      <div className="flex gap-2">
                        {data.socialLinks.facebook && (
                          <a href={data.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <Facebook className="h-5 w-5 text-white" />
                          </a>
                        )}
                        {data.socialLinks.instagram && (
                          <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center hover:opacity-90 transition-opacity">
                            <Instagram className="h-5 w-5 text-white" />
                          </a>
                        )}
                        {data.socialLinks.twitter && (
                          <a href={data.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center hover:bg-sky-600 transition-colors">
                            <Twitter className="h-5 w-5 text-white" />
                          </a>
                        )}
                        {data.socialLinks.linkedin && (
                          <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-colors">
                            <Linkedin className="h-5 w-5 text-white" />
                          </a>
                        )}
                        {data.socialLinks.whatsapp && (
                          <a href={`https://wa.me/${data.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors">
                            <MessageCircle className="h-5 w-5 text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Location with Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Navigation className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{data.city}</p>
                    {data.address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {typeof data.address === 'string' ? data.address : data.address.text_en || data.address.text_ar}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Map */}
                {data.locationLat && data.locationLon && (
                  <div className="rounded-lg overflow-hidden border">
                    <DynamicMap
                      center={[data.locationLat, data.locationLon]}
                      zoom={15}
                      markers={[{
                        position: [data.locationLat, data.locationLon],
                        title: data.name,
                        description: data.city
                      }]}
                      height="250px"
                    />
                  </div>
                )}
                
                {/* Directions Button */}
                {data.locationLat && data.locationLon && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${data.locationLat},${data.locationLon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
            
            {/* Verification Badge */}
            {(data.isVerified || data.verifiedBadge) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Verified Provider</p>
                      {data.verifiedBadge && (
                        <p className="text-xs text-muted-foreground capitalize">{data.verifiedBadge.replace('_', ' ')}</p>
                      )}
                    </div>
                  </div>
                  {data.verificationExpiry && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Valid until {new Date(data.verificationExpiry).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Service Added Date */}
            {data.createdAt && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-muted-foreground text-center">
                    Member since {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
