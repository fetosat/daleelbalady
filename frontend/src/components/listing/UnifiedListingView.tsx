'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MapPin, Star, Phone, Mail, Globe, ArrowLeft, MessageCircle,
  ExternalLink, Clock, DollarSign, Shield, CheckCircle, Send,
  Calendar, Heart, Share2, ChevronLeft, ChevronRight, Package,
  Briefcase, Store, User, Eye, Lock, Award, TrendingUp, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'

interface UnifiedListingViewProps {
  data: any
  type: 'shop' | 'service' | 'user' | 'product'
  planType: 'FREE' | 'VERIFICATION' | 'SERVICES' | 'PRODUCTS'
}

export default function UnifiedListingView({ data, type, planType }: UnifiedListingViewProps) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  // Resolve theme
  const theme = resolveTheme(data.design?.slug || type)
  const themeClasses = getThemeClasses(theme)

  // Check permissions
  const isVerified = planType !== 'FREE'
  const canBook = planType === 'SERVICES'
  const canBuyProducts = planType === 'PRODUCTS'
  const canViewFullContact = isVerified

  // Calculate average rating
  const avgRating = data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
    : 0

  // Get all images
  const allImages = [
    data.logoImage || data.profilePic || data.coverImage,
    ...(data.galleryImages || []),
    ...(data.images || [])
  ].filter(Boolean)

  // Get display phone
  const displayPhone = canViewFullContact 
    ? (data.phone || data.ownerUser?.phone)
    : data.phone ? data.phone.slice(0, -3) + 'XXX' : null

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite)
    // TODO: API call to save favorite
  }

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: data.description || data.bio,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast
    }
  }

  // Handle start chat
  const handleStartChat = async () => {
    if (!isVerified) {
      router.push('/pricing')
      return
    }

    try {
      setIsStartingChat(true)
      const response = await fetch('https://api.daleelbalady.com/api/chats', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: data.ownerUser?.id || data.owner?.id || data.id,
          subject: `Inquiry about ${data.name}`
        })
      })
      
      const result = await response.json()
      if (result.success) {
        router.push(`/messages/${result.chat.id}`)
      }
    } catch (error) {
      console.error('Failed to start chat:', error)
    } finally {
      setIsStartingChat(false)
    }
  }

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return
    
    try {
      setIsSubmittingReview(true)
      await fetch('https://api.daleelbalady.com/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          serviceId: type === 'service' ? data.id : undefined,
          shopId: type === 'shop' ? data.id : undefined,
          productId: type === 'product' ? data.id : undefined
        })
      })
      
      setShowReviewDialog(false)
      setReviewComment('')
      setReviewRating(5)
      router.refresh()
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Hero Section with Images */}
      <div className="relative">
        {/* Cover Image/Gallery */}
        <div className="h-96 relative overflow-hidden">
          {allImages.length > 0 ? (
            <>
              <div className="relative h-full">
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              </div>
              
              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                    className="absolute left-4 top-1/2 -transtone-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                    className="absolute right-4 top-1/2 -transtone-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -transtone-x-1/2 flex gap-2">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div 
              className="h-full relative"
              style={{
                background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
              }}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute inset-0 flex items-center justify-center text-9xl">
                {theme.emoji}
              </div>
            </div>
          )}

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Floating Info Card */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-24 mb-8">
            <Card className="border-2 shadow-2xl dark:bg-stone-900 dark:border-stone-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Logo/Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                      <AvatarImage src={data.logoImage || data.profilePic} alt={data.name} />
                      <AvatarFallback className="text-4xl">{theme.emoji}</AvatarFallback>
                    </Avatar>
                    {(data.isVerified || data.ownerUser?.isVerified) && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 truncate">
                            {data.name}
                          </h1>
                          {(data.isVerified || data.ownerUser?.isVerified) && (
                            <Badge className="bg-green-500 text-white border-0">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        {data.category && (
                          <Badge variant="outline" className="mb-2">
                            {data.category}
                          </Badge>
                        )}

                        <p className="text-stone-600 dark:text-stone-400 line-clamp-2">
                          {data.description || data.bio || 'No description available'}
                        </p>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-2">
                        {canViewFullContact && (
                          <Button
                            size="lg"
                            onClick={handleStartChat}
                            disabled={isStartingChat}
                            style={{ backgroundColor: theme.colors.primary }}
                            className="text-white"
                          >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            {isStartingChat ? 'Starting...' : 'Chat Now'}
                          </Button>
                        )}
                        {!canViewFullContact && (
                          <Button
                            size="lg"
                            variant="default"
                            onClick={() => router.push('/pricing')}
                          >
                            <Lock className="h-5 w-5 mr-2" />
                            Upgrade to Contact
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400">
                            ({data.reviews?.length || 0} reviews)
                          </span>
                        </div>
                      )}
                      
                      {data.city && (
                        <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                          <MapPin className="h-4 w-4" />
                          <span>{data.city}</span>
                        </div>
                      )}

                      {data._count && (
                        <>
                          {data._count.services > 0 && (
                            <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                              <Briefcase className="h-4 w-4" />
                              <span>{data._count.services} services</span>
                            </div>
                          )}
                          {data._count.products > 0 && (
                            <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                              <Package className="h-4 w-4" />
                              <span>{data._count.products} products</span>
                            </div>
                          )}
                        </>
                      )}

                      {data.views && (
                        <div className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                          <Eye className="h-4 w-4" />
                          <span>{data.views} views</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upgrade Notice for Free Tier */}
            {!canViewFullContact && (
              <Alert className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
                <Lock className="h-5 w-5 text-amber-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Limited Access - Upgrade to See More
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Get full contact details, chat access, and booking capabilities
                    </p>
                  </div>
                  <Button size="sm" onClick={() => router.push('/pricing')}>
                    View Plans
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Tabs for organized content */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">
                  Services
                  {data._count?.services > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {data._count.services}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="products">
                  Products
                  {data._count?.products > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {data._count.products}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews
                  {data.reviews?.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {data.reviews.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="gallery" className="hidden lg:block">Gallery</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <Card className="dark:bg-stone-900 dark:border-stone-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-indigo-600" />
                      About {data.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                      {data.description || data.bio || 'No detailed description available'}
                    </p>

                    {/* Highlights */}
                    {data.highlights && data.highlights.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Highlights</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {data.highlights.map((highlight: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-indigo-500" />
                              <span className="text-sm">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Hours */}
                    {data.businessHours && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Business Hours</h4>
                        <div className="space-y-1">
                          {Object.entries(data.businessHours).map(([day, hours]: [string, any]) => (
                            <div key={day} className="flex justify-between text-sm">
                              <span className="capitalize">{day}</span>
                              <span className="text-stone-500">
                                {(hours as any).closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* User's Shops */}
                {data.shops && data.shops.length > 0 && (
                  <Card className="dark:bg-stone-900 dark:border-stone-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-purple-600" />
                        Shops ({data.shops.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        {data.shops.map((shop: any) => (
                          <div 
                            key={shop.id} 
                            className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/listing/${shop.id}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={shop.logoImage} />
                                  <AvatarFallback>
                                    <Store className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{shop.name}</p>
                                  <p className="text-sm text-stone-500">{shop.city}</p>
                                </div>
                              </div>
                              {shop._count && (
                                <div className="text-xs text-stone-500">
                                  {shop._count.services || 0} services, {shop._count.products || 0} products
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Services Tab - Implementation continues in next part... */}
              
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-4 dark:bg-stone-900 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-stone-500" />
                    <div className="flex-1">
                      <p className="text-sm text-stone-500 dark:text-stone-400">Phone</p>
                      {canViewFullContact ? (
                        <a href={`tel:${displayPhone}`} className="font-medium text-primary hover:underline">
                          {displayPhone}
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{displayPhone}</span>
                          <Lock className="h-3 w-3 text-amber-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {canViewFullContact && (data.email || data.ownerUser?.email) && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-stone-500" />
                    <div className="flex-1">
                      <p className="text-sm text-stone-500 dark:text-stone-400">Email</p>
                      <a 
                        href={`mailto:${data.email || data.ownerUser?.email}`}
                        className="font-medium text-primary hover:underline break-all"
                      >
                        {data.email || data.ownerUser?.email}
                      </a>
                    </div>
                  </div>
                )}

                {data.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-stone-500" />
                    <div className="flex-1">
                      <p className="text-sm text-stone-500 dark:text-stone-400">Website</p>
                      <a 
                        href={data.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                <Separator />

                <Button 
                  className="w-full" 
                  style={{ backgroundColor: theme.colors.primary }}
                  onClick={handleStartChat}
                  disabled={isStartingChat || !canViewFullContact}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {canViewFullContact ? 'Send Message' : 'Upgrade to Message'}
                </Button>

                {!canViewFullContact && (
                  <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                    <AlertDescription className="text-xs">
                      Upgrade to verification plan to access full contact details and messaging
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            {data.city && (
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-stone-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{data.city}</p>
                      {data.address && canViewFullContact && (
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                          {data.address.text_en || data.address.text_ar}
                        </p>
                      )}
                      {!canViewFullContact && data.address && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                          <Lock className="h-3 w-3" />
                          Full address hidden
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {data.locationLat && data.locationLon && canViewFullContact && (
                    <Button variant="outline" className="w-full" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            {data._count && (
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data._count.services > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">Services</span>
                        <span className="font-bold">{data._count.services}</span>
                      </div>
                    )}
                    {data._count.products > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">Products</span>
                        <span className="font-bold">{data._count.products}</span>
                      </div>
                    )}
                    {data._count.reviews > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">Reviews</span>
                        <span className="font-bold">{data._count.reviews}</span>
                      </div>
                    )}
                    {data.views && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">Total Views</span>
                        <span className="font-bold">{data.views.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="dark:bg-stone-900">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {data.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      star <= reviewRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-stone-300 dark:text-stone-600'
                    }`}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Your Review</Label>
              <Textarea
                placeholder="Tell others about your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mt-2"
                rows={5}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview} 
                disabled={isSubmittingReview || !reviewComment.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

