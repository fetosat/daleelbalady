'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, Phone, Mail, Globe, ArrowLeft, MessageCircle,
  ExternalLink, Clock, DollarSign, Shield, CheckCircle, Send, Navigation,
  Heart, Share2, Facebook, Instagram, Twitter, Linkedin, Eye, Award,
  Calendar, Tag, Package, Store, ChevronLeft, ChevronRight, Users, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'
import { toast } from 'sonner'
import { getCurrentUser, authenticatedFetch } from '@/utils/auth'
import { API_BASE } from '@/utils/env'

// Dynamic import for Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

interface VerifiedListingViewProps {
  data: any & {
    categories?: Array<{ id: string; name: string; slug: string; description?: string }>
    subcategories?: Array<{ id: string; name: string; slug: string }>
  }
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function VerifiedListingView({ data, type }: VerifiedListingViewProps) {
  const router = useRouter()
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [userReviews, setUserReviews] = useState<any[]>([]) // For user type reviews
  const [userHasBusinesses, setUserHasBusinesses] = useState(true) // Check if user has shops/services
  
  // Debug logging (only on mount)
  useEffect(() => {
    console.log('=== VerifiedListingView Mounted ===');
    console.log('Type:', type);
    console.log('Data ID:', data.id);
    console.log('Has location:', !!(data.locationLat && data.locationLon));
    console.log('🏷️ Categories data:', data.categories);
    console.log('🏷️ Subcategories data:', data.subcategories);
    console.log('🏷️ Services count:', data.services?.length);
    console.log('🏷️ Full data keys:', Object.keys(data));
  }, []); // Empty dependency array = only on mount
  
  // Load reviews for users - DIRECT USER REVIEWS SUPPORTED!
  useEffect(() => {
    const loadUserReviews = async () => {
      if (type !== 'user') return
      
      try {
        // Get direct user reviews
        const userReviewsResponse = await fetch(`${API_BASE}/reviews?userId=${data.id}`)
        if (userReviewsResponse.ok) {
          const reviewsData = await userReviewsResponse.json()
          const reviews = reviewsData.reviews || []
          
          // Sort by date (newest first)
          reviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          
          setUserReviews(reviews)
          console.log(`✅ Loaded ${reviews.length} reviews for user ${data.name}`)
        } else {
          console.log('No reviews found for user')
          setUserReviews([])
        }
      } catch (error) {
        console.error('Failed to load user reviews:', error)
        setUserReviews([])
      }
    }
    
    loadUserReviews()
  }, [type, data.id, data.name])
  
  // Resolve theme
  const theme = resolveTheme(data.design?.slug || type)
  const themeClasses = getThemeClasses(theme)

  // Calculate average rating
  const avgRating = data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
    : 0
  
  // Gather all images
  const allImages = [
    data.coverImage,
    data.logoImage,
    data.profilePic,
    ...(data.galleryImages || []),
    ...(data.images || [])
  ].filter(Boolean)
  
  // Get social links
  const hasSocialLinks = data.socialLinks && Object.keys(data.socialLinks).some(key => data.socialLinks[key])
  
  // Check if booking is available
  const canBook = type === 'service' && data.price !== undefined
  
  // Load favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        // Check if shop type
        if (type === 'shop') {
          const response = await fetch(`${API_BASE}/favorites/shops/${data.id}/check`, {
            credentials: 'include'
          })
          if (response.ok) {
            const result = await response.json()
            setIsFavorited(result.isFavorited || false)
          }
        }
        // For other types, skip favorite check for now
      } catch (error) {
        console.error('Failed to check favorite status:', error)
      }
    }
    checkFavorite()
  }, [data.id, type])

  // Start chat with provider
  const handleStartChat = async () => {
    try {
      setIsStartingChat(true)
      
      // Check if user is logged in
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        toast.error('Please login to start a chat')
        router.push('/login')
        return
      }
      
      const initiatorId = currentUser.id
      
      // Determine recipient ID based on listing type
      let recipientId: string | undefined
      
      if (type === 'user') {
        // For user type, the data itself is the user we want to chat with
        recipientId = data.id
      } else if (type === 'shop' || type === 'service' || type === 'product') {
        // For other types, look for owner information
        recipientId = data.ownerUser?.id || data.owner?.id || data.ownerId || data.userId
      }
      
      if (!recipientId) {
        console.error('Recipient ID not found. Data:', { type, data })
        toast.error('Unable to start chat - no recipient information found')
        return
      }
      
      // Don't allow chatting with yourself
      if (initiatorId === recipientId) {
        toast.error('You cannot start a chat with yourself')
        return
      }
      
      console.log('Starting chat:', { recipientId, subject: `Inquiry about ${data.name}` })
      
      const response = await authenticatedFetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          subject: `Inquiry about ${data.name}`
        })
      })
      
      if (!response.ok) {
        let errorData = {}
        let responseText = ''
        
        try {
          responseText = await response.text()
          console.log('Chat API raw response:', responseText)
          
          if (responseText) {
            errorData = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error('Failed to parse chat error response:', parseError)
          console.error('Raw chat response was:', responseText)
        }
        
        console.error('Chat API error:', errorData)
        
        // Handle specific errors
        if (response.status === 400 && ((errorData as any).message?.includes('yourself') || (errorData as any).error?.includes('yourself'))) {
          toast.error('لا يمكنك بدء محادثة مع نفسك')
          return
        }
        
        if (response.status === 404 && (errorData as any).error?.includes('not found')) {
          toast.error('المستخدم غير موجود')
          return
        }
        
        if (response.status === 401) {
          toast.error('يجب تسجيل الدخول لبدء محادثة')
          return
        }
        
        // Show specific error message if available
        const errorMsg = (errorData as any).message || (errorData as any).error || `فشل في بدء المحادثة (${response.status})`
        throw new Error(errorMsg)
      }
      
      const result = await response.json()
      if (result.success && result.chat?.id) {
        toast.success('Chat started successfully!')
        router.push(`/chats/${result.chat.id}`)
      } else {
        throw new Error('No chat ID returned')
      }
    } catch (error: any) {
      console.error('Failed to start chat:', error)
      toast.error(error.message || 'Failed to start chat. Please login first.')
    } finally {
      setIsStartingChat(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.name,
          text: data.description || data.bio,
          url: window.location.href
        })
        toast.success('Shared successfully!')
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error)
        toast.error('Failed to share')
      }
    }
  }
  
  // Handle favorite toggle
  const handleFavorite = async () => {
    try {
      // Only works for shops currently
      if (type !== 'shop') {
        toast.info('Favorites currently only available for shops')
        return
      }
      
      const url = isFavorited 
        ? `https://api.daleelbalady.com/api/favorites/shops/${data.id}`
        : `https://api.daleelbalady.com/api/favorites/shops`
      
      const response = await fetch(url, {
        method: isFavorited ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: isFavorited ? undefined : JSON.stringify({
          shopId: data.id
        })
      })
      
      if (response.status === 401) {
        toast.error('Please login to add favorites')
        router.push('/login')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error((errorData as any).error || 'Failed to toggle favorite')
      }
      
      const newStatus = !isFavorited
      setIsFavorited(newStatus)
      toast.success(newStatus ? 'Added to favorites!' : 'Removed from favorites')
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error)
      toast.error(error.message || 'Failed to update favorite status')
    }
  }
  
  // Navigate gallery
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
    } else {
      setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }
  }
  
  // Handle booking
  const handleBooking = async () => {
    if (!bookingDate) {
      toast.error('Please select a date')
      return
    }
    
    try {
      setIsBooking(true)
      
      // For now, show success message as booking endpoint may not be fully set up
      // TODO: Implement actual booking API
      toast.success('Booking request received! We\'ll contact you shortly.')
      setShowBookingDialog(false)
      setBookingDate('')
      setBookingNotes('')
      
      // Commented out actual API call until backend is ready
      /*
      const response = await fetch('https://api.daleelbalady.com/api/bookings', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId: data.id,
          date: bookingDate,
          notes: bookingNotes,
          price: data.price,
          currency: data.currency || 'EGP'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error((errorData as any).message || 'Failed to create booking')
      }
      
      const result = await response.json()
      toast.success('Booking created successfully!')
      setTimeout(() => {
        router.push('/bookings')
      }, 1500)
      */
    } catch (error: any) {
      console.error('Failed to create booking:', error)
      toast.error(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }
  
  // Submit review
  const handleSubmitReview = async () => {
    // Comprehensive validation
    if (!reviewComment || !reviewComment.trim()) {
      toast.error('برجاء كتابة تعليق للمراجعة')
      return
    }
    
    if (reviewComment.trim().length < 3) {
      toast.error('التعليق يجب أن يكون أكثر من 3 أحرف')
      return
    }
    
    if (reviewComment.trim().length > 1000) {
      toast.error('التعليق طويل جداً (الحد الأقصى 1000 حرف)')
      return
    }
    
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.error('برجاء اختيار تقييم من 1 إلى 5 نجوم')
      return
    }
    
    // Check if user is logged in only (no subscription required)
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      toast.error('برجاء تسجيل الدخول فقط لكتابة مراجعة')
      router.push('/login')
      return
    }
    
    try {
      setIsSubmittingReview(true)
      
      // Validate data.id exists and is a string
      if (!data || !data.id || typeof data.id !== 'string' || !data.id.trim()) {
        toast.error('معرف العنصر غير صالح - لا يمكن إرسال المراجعة')
        console.error('Invalid data object:', data)
        return
      }
      
      // Validate type
      if (!type || !['service', 'shop', 'product', 'user'].includes(type)) {
        toast.error('نوع العنصر غير صالح')
        console.error('Invalid type:', type)
        return
      }
      
      // Prepare review data based on type - DIRECT SUPPORT FOR ALL TYPES!
      const reviewData: any = {
        rating: reviewRating,
        comment: reviewComment.trim()
      }
      
      // Only add the relevant ID field based on type
      switch (type) {
        case 'service':
          reviewData.serviceId = data.id
          break
        case 'shop':
          reviewData.shopId = data.id
          break
        case 'product':
          reviewData.productId = data.id
          break
        case 'user':
          reviewData.userId = data.id
          break
        default:
          toast.error('Unknown item type - cannot submit review')
          return
      }
      
      console.log('=== Review Submission Debug ===');
      console.log('Submitting review:', reviewData)
      console.log('Review type:', type)
      console.log('Target ID:', data.id)
      console.log('Rating:', reviewRating)
      console.log('Comment length:', reviewComment.trim().length)
      console.log('User authenticated:', !!currentUser)
      console.log('Request payload:', JSON.stringify(reviewData, null, 2))
      
      const response = await authenticatedFetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      })
      
      if (response.status === 401) {
        toast.error('Please login to submit a review')
        router.push('/login')
        return
      }
      
      if (!response.ok) {
        let errorData = {}
        let responseText = ''
        
        try {
          responseText = await response.text()
          console.log('Raw response text:', responseText)
          
          if (responseText) {
            errorData = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          console.error('Raw response was:', responseText)
        }
        
        console.error('Review submission error:', errorData)
        console.error('Response status:', response.status)
        console.error('Response statusText:', response.statusText)
        console.error('Response headers:', Object.fromEntries(response.headers.entries()))
        
        // Show more specific error messages
        if ((errorData as any).message || (errorData as any).error) {
          toast.error((errorData as any).message || (errorData as any).error);
        } else if ((errorData as any).details && Array.isArray((errorData as any).details)) {
          const errors = (errorData as any).details.map((e: any) => (e.message || e.field || 'خطأ غير محدد')).join(', ')
          toast.error(`خطأ: ${errors}`)
        } else {
          toast.error('حدث خطأ في إضافة المراجعة. يرجى المحاولة لاحقاً.')
        }
        
        throw new Error((errorData as any).error || `Failed to submit review (${response.status})`)
      }
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError)
        toast.success('تم إرسال المراجعة بنجاح!')
        setShowReviewForm(false)
        setReviewComment('')
        setReviewRating(5)
        setTimeout(() => router.refresh(), 1000)
        return
      }
      
      console.log('Review submission result:', result)
      
      if (result && (result.success || result.review)) {
        toast.success('تم إرسال المراجعة بنجاح!')
        setShowReviewForm(false)
        setReviewComment('')
        setReviewRating(5)
        
        // Refresh page to show new review
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        throw new Error(result?.error || result?.message || 'فشل في إرسال المراجعة')
      }
    } catch (error: any) {
      console.error('Review submission failed:', error)
      console.error('Error stack:', error.stack)
      
      // Handle different types of errors
      let errorMessage = 'فشل في إرسال المراجعة. برجاء المحاولة مرة أخرى.'
      
      if (error.message) {
        if (error.message.includes('Authentication') || error.message.includes('تسجيل')) {
          errorMessage = 'يجب تسجيل الدخول لكتابة مراجعة'
        } else if (error.message.includes('Validation') || error.message.includes('بيانات')) {
          errorMessage = 'خطأ في البيانات المرسلة'
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'مشكلة في الاتصال. برجاء التأكد من الانترنت.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover Image */}
      <div className="relative h-[32rem] sm:h-96 overflow-hidden">
        {data.coverImage ? (
          <>
            <img 
              src={data.coverImage}
              alt={data.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </>
        ) : (
          <>
            <div
              style={{
                background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
              }}
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        )}
        <div className="container mx-auto px-4 h-full flex items-end pb-4 sm:pb-8 relative z-20">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-30 text-white hover:bg-white/20 backdrop-blur-sm bg-black/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 w-full">
            {/* Logo/Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center text-4xl sm:text-6xl relative flex-shrink-0">
              {data.logoImage || data.profilePic ? (
                <img 
                  src={data.logoImage || data.profilePic} 
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{theme.emoji}</span>
              )}
              {(data.isVerified || data.ownerUser?.isVerified) && (
                <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              )}
            </div>
            
            {/* Title Info */}
            <div className="flex-1 text-white pb-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">{data.name}</h1>
                <Badge variant="secondary" className="bg-green-500 text-white border-0 w-fit">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-3 line-clamp-2">{data.description || data.bio || 'No description available'}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
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

            {/* Action Buttons - Stack on mobile */}
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-2 sm:flex gap-2 mb-2">
                {canBook && (
                  <Button
                    size="sm"
                    onClick={() => setShowBookingDialog(true)}
                    style={{ backgroundColor: theme.colors.primary }}
                    className="shadow-lg col-span-2 sm:col-span-1"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-xs sm:text-sm">Book Now</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-lg"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">{isStartingChat ? 'Starting...' : 'Chat'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-lg"
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30 shadow-lg"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 -mt-8 sm:-mt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {allImages.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Gallery</span>
                    <Badge variant="secondary">{allImages.length} photos</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Main Image */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={allImages[selectedImageIndex]}
                        alt={`${data.name} - ${selectedImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {allImages.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -transtone-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => navigateImage('prev')}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -transtone-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => navigateImage('next')}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            {selectedImageIndex + 1} / {allImages.length}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Thumbnail Grid */}
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === idx
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-transparent hover:border-muted-foreground/30'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Categories & Tags */}
            {((data.categories && data.categories.length > 0) || (data.subcategories && data.subcategories.length > 0) || (data.category && data.category.length > 0) || (data.tags && data.tags.length > 0) || data.mainCategory || data.subCategory) && (
              <Card>
                <CardHeader>
                  <CardTitle>Categories & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Primary Categories from categories array */}
                  {((data.categories && data.categories.length > 0) || (data.subcategories && data.subcategories.length > 0) || data.mainCategory || data.subCategory) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {/* Show all categories from the categories array */}
                        {data.categories && data.categories.length > 0 ? (
                          data.categories.map((cat: any) => (
                            <Badge key={cat.id || cat.slug} variant="default">
                              {cat.name}
                            </Badge>
                          ))
                        ) : (
                          data.mainCategory && (
                            <Badge variant="default">
                              {typeof data.mainCategory === 'string' ? data.mainCategory : data.mainCategory.name}
                            </Badge>
                          )
                        )}
                        {/* Show subcategories from subcategories array */}
                        {data.subcategories && data.subcategories.length > 0 && (
                          data.subcategories.map((subcat: any) => (
                            <Badge key={subcat.id || subcat.slug} variant="outline">
                              {subcat.name}
                            </Badge>
                          ))
                        )}
                        {/* Legacy single subcategory */}
                        {!data.subcategories && data.subCategory && (
                          <Badge variant="outline">
                            {typeof data.subCategory === 'string' ? data.subCategory : data.subCategory.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Fallback for legacy category field */}
                  {(!data.categories || data.categories.length === 0) && data.category && data.category.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Additional Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {data.category.map((cat: any, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {typeof cat === 'string' ? cat : cat.name || cat.en}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.tags && data.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Metrics & Stats */}
            {(data.viewCount || data.clientsCount || data.messagesCount || data._count) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {data.viewCount !== undefined && (
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Eye className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <p className="text-xl font-bold text-blue-600">{data.viewCount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                    )}
                    {data.clientsCount !== undefined && (
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                        <p className="text-xl font-bold text-purple-600">{data.clientsCount}</p>
                        <p className="text-xs text-muted-foreground">Clients</p>
                      </div>
                    )}
                    {data._count?.services && (
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Package className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <p className="text-xl font-bold text-green-600">{data._count.services}</p>
                        <p className="text-xs text-muted-foreground">Services</p>
                      </div>
                    )}
                    {data._count?.products && (
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <Store className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                        <p className="text-xl font-bold text-orange-600">{data._count.products}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Description */}
            {(data.description || data.bio) && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
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
                    <span>Services Offered</span>
                    <Badge variant="secondary">{data._count?.services || data.services.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {data.services?.slice(0, 5).map((service: any) => (
                      <div key={service.id} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.translation?.name_en || service.name || 'Service'}</p>
                            {service.price && (
                              <p className="text-sm text-muted-foreground">
                                {service.currency || 'EGP'} {service.price}
                              </p>
                            )}
                            {service.durationMins && (
                              <p className="text-xs text-muted-foreground">{service.durationMins} minutes</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.services.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        +{data.services.length - 5} more services
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products (if shop) */}
            {data.products && data.products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Products</span>
                    <Badge variant="secondary">{data._count?.products || data.products.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.products?.slice(0, 6).map((product: any) => (
                      <div key={product.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                           onClick={() => router.push(`/product/${product.id}`)}>
                        <div className="flex gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            {product.price && (
                              <p className="text-sm font-bold text-primary">
                                {product.currency || 'EGP'} {product.price}
                              </p>
                            )}
                            {product.stock !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {data.products.length > 6 && (
                    <p className="text-sm text-muted-foreground text-center pt-3">
                      +{data.products.length - 6} more products
                    </p>
                  )}
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
                  <div className="grid grid-cols-1 gap-3">
                    {data.shops?.slice(0, 5).map((shop: any) => (
                      <div key={shop.id} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{shop.name}</p>
                            <p className="text-sm text-muted-foreground">{shop.city}</p>
                            {shop._count && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {shop._count.services || 0} services, {shop._count.products || 0} products
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.shops.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        +{data.shops.length - 5} more shops
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Dialog */}
            {showBookingDialog && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Book Appointment</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowBookingDialog(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Service</span>
                      <span className="font-bold">{data.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Price</span>
                      <span className="text-lg font-bold text-primary">
                        {data.currency || 'EGP'} {data.price}
                      </span>
                    </div>
                    {data.durationMins && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium">Duration</span>
                        <span className="text-sm">{data.durationMins} minutes</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Preferred Date & Time</Label>
                    <Input
                      id="booking-date"
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="booking-notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="booking-notes"
                      placeholder="Any special requests or information..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleBooking}
                      disabled={isBooking || !bookingDate}
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBookingDialog(false)}
                      disabled={isBooking}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Customer Reviews</span>
                  <Button size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                    Write Review
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Review Form */}
                {showReviewForm && (
                  <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                    <div>
                      <Label>Your Rating</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer ${
                              star <= reviewRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-stone-300'
                            }`}
                            onClick={() => setReviewRating(star)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Your Review</Label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitReview} 
                        disabled={isSubmittingReview || !reviewComment.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Reviews */}
                {(type === 'user' ? userReviews : data.reviews || []).length > 0 ? (
                  (type === 'user' ? userReviews : data.reviews).map((review: any) => (
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
                        {review.author?.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(data.phone || data.ownerUser?.phone) && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Phone</p>
                      <a href={`tel:${data.phone || data.ownerUser?.phone}`} 
                         className="text-primary hover:underline">
                        {data.phone || data.ownerUser?.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {(data.email || data.ownerUser?.email) && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email</p>
                      <a href={`mailto:${data.email || data.ownerUser?.email}`}
                         className="text-primary hover:underline">
                        {data.email || data.ownerUser?.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {data.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Website</p>
                      <a href={data.website} target="_blank" rel="noopener noreferrer"
                         className="text-primary hover:underline flex items-center gap-1">
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                <Separator />
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
            
            {/* Social Media Links */}
            {hasSocialLinks && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.socialLinks.facebook && (
                      <a href={data.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Facebook className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {data.socialLinks.instagram && (
                      <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Instagram className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {data.socialLinks.twitter && (
                      <a href={data.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {data.socialLinks.linkedin && (
                      <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="rounded-full">
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Working Hours */}
            {data.workHours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(data.workHours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span className="capitalize text-sm font-medium">{day}</span>
                        {(hours as any).closed ? (
                          <Badge variant="secondary" className="text-xs">Closed</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {(hours as any).start} - {(hours as any).end}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Card */}
            {data.city && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{data.city}</p>
                      {data.address && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {typeof data.address === 'string' ? data.address : data.address.text_en || data.address.text_ar}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Interactive Map */}
                  {data.locationLat && data.locationLon ? (
                    <>
                      <div className="rounded-lg overflow-hidden border bg-muted">
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
                      
                      {/* Get Directions Button */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${data.locationLat},${data.locationLon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full" size="sm">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                      </a>
                    </>
                  ) : (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        📍 Location coordinates not available
                      </p>
                    </div>
                  )}
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
            
            {/* Member Since / Dates */}
            {(data.createdAt || data.joinedAt) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Member since {new Date(data.createdAt || data.joinedAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFavorite}
                    className={isFavorited ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-red-500' : ''}`} />
                    {isFavorited ? 'Saved' : 'Save'}
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

