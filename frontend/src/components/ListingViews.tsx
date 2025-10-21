'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  Calendar,
  ShoppingCart,
  Shield,
  CheckCircle,
  Lock,
  X,
  Clock,
  DollarSign,
  Navigation
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'

// Dynamic import for Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

// VERIFIED LISTING VIEW
export function VerifiedListingView({ data, type }) {
  const router = useRouter()
  const theme = resolveTheme(data.design?.slug || type)
  const themeClasses = getThemeClasses(theme)
  const [isChatting, setIsChatting] = useState(false)

  async function startChat() {
    setIsChatting(true)
    try {
      const response = await fetch('https://api.daleelbalady.com/api/chats', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiatorId: 'currentUserId', // replace with current user id from context
          recipientId: data.ownerUser?.id || data.owner?.id,
          subject: `Inquiry about ${data.name}`
        })
      })
      const resData = await response.json()
      if (resData.chat?.id) {
        router.push(`/messages/${resData.chat.id}`)
      } else {
        alert('Failed to start chat')
      }
    } catch {
      alert('Error starting chat')
    }
    setIsChatting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="relative h-64"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center text-6xl">
              {data.logoImage || data.profilePic ? (
                <img
                  src={data.logoImage || data.profilePic}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{theme.emoji}</span>
              )}
            </div>
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{data.name}</h1>
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-lg opacity-90 mb-3">{data.description || data.bio}</p>
              <div className="flex items-center gap-4 text-sm">
                {data.reviews && data.reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{(data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length).toFixed(1)}</span>
                    <span className="opacity-75">({data.reviews.length} reviews)</span>
                  </div>
                )}
                {data.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{data.city}</span>
                  </div>
                )}
                {data.isVerified && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p>{data.phone}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p>{data.email}</p>
                    </div>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a href={data.website} target="_blank" rel="noreferrer" className="underline">
                      Website
                    </a>
                  </div>
                )}
                <Button onClick={startChat} disabled={isChatting} className="mt-4" variant="default">
                  {isChatting ? 'Starting Chat...' : <><MessageSquare className="mr-2 h-4 w-4" /> Chat</>}
                </Button>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {data.reviews && data.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Star
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          aria-label={`${review.rating} stars`}
                        />
                        <span className="font-medium">{review.author?.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Location Card */}
            {data.city && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{data.city}</span>
                  </div>
                  
                  {/* Interactive Map */}
                  {data.locationLat && data.locationLon && (
                    <>
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
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pricing info (if service) */}
            {type === "service" && data.price && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-lg font-semibold">
                    <DollarSign className="h-5 w-5" />
                    <span>{data.currency || "EGP"} {data.price}</span>
                    {data.durationMins && <><Clock className="h-5 w-5" /> {data.durationMins} minutes</>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// SERVICE BOOKING VIEW
export function ServiceBookingView({ data, type }) {
  const router = useRouter()
  const theme = resolveTheme(data.design?.slug || type)
  const themeClasses = getThemeClasses(theme)

  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(null)
  const [bookingError, setBookingError] = useState(null)

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const fetchSlots = async () => {
      try {
        const res = await fetch('https://api.daleelbalady.com/api/booking/available-slots', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId: data.id, date: selectedDate })
        })
        const json = await res.json()
        setAvailableSlots(json.availableSlots || [])
      } catch {
        setAvailableSlots([])
      }
    }
    fetchSlots()
  }, [selectedDate, data.id])

  const bookSlot = async (slot) => {
    setBookingLoading(true)
    setBookingError(null)
    try {
      const startAt = new Date(`${selectedDate}T${slot.start}:00Z`).toISOString()
      const endAt = new Date(`${selectedDate}T${slot.end}:00Z`).toISOString()
      const response = await fetch('https://api.daleelbalady.com/api/booking/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: data.id,
          userId: 'currentUserId', // replace with actual user id from context
          startAt,
          endAt,
          notes: ''
        })
      })
      const json = await response.json()
      if (json.success) {
        setBookingSuccess('Booking created successfully!')
      } else {
        setBookingError(json.error || 'Booking failed')
      }
    } catch {
      setBookingError('Booking failed')
    }
    setBookingLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="h-64 relative"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center text-6xl">
              {data.logoImage || data.profilePic ? (
                <img
                  src={data.logoImage || data.profilePic}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{theme.emoji}</span>
              )}
            </div>
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{data.name}</h1>
              </div>
              <p className="text-lg opacity-90 mb-3">{data.description || data.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with booking */}
      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Date */}
            <Card>
              <CardHeader>
                <CardTitle>Pick a date</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded-md p-2"
                  min={new Date().toISOString().split('T')[0]}
                />
              </CardContent>
            </Card>

            {/* Available Time Slots */}
            {availableSlots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot, idx) => (
                      <Button key={idx} onClick={() => bookSlot(slot)} disabled={bookingLoading}>
                        {slot.start} - {slot.end}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking status */}
            {bookingSuccess && (
              <Alert variant="success">{bookingSuccess}</Alert>
            )}
            {bookingError && (
              <Alert variant="destructive">{bookingError}</Alert>
            )}

            {/* Reviews */}
            {data.reviews && data.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Star
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          aria-label={`${review.rating} stars`}
                        />
                        <span className="font-medium">{review.author?.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p>{data.phone}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p>{data.email}</p>
                    </div>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a href={data.website} target="_blank" rel="noreferrer" className="underline">
                      Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Location Map */}
            {data.locationLat && data.locationLon && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// PRODUCT LISTING VIEW
export function ProductListingView({ data, type }) {
  const router = useRouter()
  const theme = resolveTheme(data.design?.slug || type)
  const themeClasses = getThemeClasses(theme)

  const [qty, setQty] = useState(1)
  const [addToCartLoading, setAddToCartLoading] = useState(false)
  const [addToCartSuccess, setAddToCartSuccess] = useState(null)
  const [addToCartError, setAddToCartError] = useState(null)

  async function addToCart() {
    setAddToCartLoading(true)
    setAddToCartError(null)
    try {
      const res = await fetch('https://api.daleelbalady.com/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.id,
          quantity: qty
        })
      })
      if (res.ok) {
        setAddToCartSuccess('Added to cart')
      } else {
        setAddToCartError('Failed to add to cart')
      }
    } catch {
      setAddToCartError('Failed to add to cart')
    }
    setAddToCartLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="h-64 relative" 
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white shadow-2xl flex items-center justify-center text-6xl">
              {data.logoImage || data.profilePic ? (
                <img 
                  src={data.logoImage || data.profilePic}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span>{theme.emoji}</span>
              )}
            </div>
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{data.name}</h1>
              </div>
              <p className="text-lg opacity-90 mb-3">{data.description || data.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Quantity selection */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="number"
                  min={1}
                  max={data.stock || 100}
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="border rounded-md p-2 w-24"
                />
              </CardContent>
            </Card>

            {/* Add to Cart button */}
            <Button
              onClick={addToCart}
              disabled={addToCartLoading || qty < 1 || qty > (data.stock || 0)}
            >
              {addToCartLoading ? 'Adding...' : 'Add to Cart'}
            </Button>

            {/* Add to Cart status */}
            {addToCartSuccess && <Alert variant="success">{addToCartSuccess}</Alert>}
            {addToCartError && <Alert variant="destructive">{addToCartError}</Alert>}
            
            {/* Reviews */}
            {data.reviews && data.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-label={`${review.rating} stars`} />
                        <span className="font-medium">{review.author?.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          <div className="space-y-6">
            {/* Inventory & Stock Info */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Stock: {data.stock}</p>
                <p>SKU: {data.sku}</p>
              </CardContent>
            </Card>

            {/* Shop Contact Info */}
            {data.shop && (
              <Card>
                <CardHeader>
                  <CardTitle>Shop Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{data.shop.city}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{data.shop.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{data.shop.email || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

