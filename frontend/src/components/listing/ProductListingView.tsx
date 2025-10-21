'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MapPin, Star, Phone, Mail, Globe, ArrowLeft, MessageCircle, ShoppingCart,
  Plus, Minus, Check, Package, Tag, Store, Shield, Award, TrendingUp,
  CreditCard, Truck, RefreshCw, ChevronLeft, ChevronRight, Heart, Share2, Navigation
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { resolveTheme, getThemeClasses } from '@/utils/themeResolver'

// Dynamic import for Leaflet map to avoid SSR issues
const DynamicMap = dynamic(() => import('@/components/SingleLocationMapView'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

/**
 * 🛍️ ProductListingView - Products Plan View
 * 
 * Purpose:
 * Used for the Products Plan - product-focused features with
 * e-commerce capabilities and POS system access.
 * 
 * Key Features:
 * - Product details (name, price, stock)
 * - Product gallery/images
 * - Add to cart functionality
 * - Tags and categories
 * - Reviews display
 * - Shop information
 * - Cashier/POS system indicator
 */

interface ProductData {
  id: string
  productId?: string
  
  // Product info
  name: string
  productName?: string
  description?: string
  
  // Pricing
  price: number
  currency?: string
  comparePrice?: number // Original price for discount display
  
  // Inventory
  stock: number
  sku?: string
  lowStockThreshold?: number
  
  // Media
  coverImage?: string
  image?: string
  images?: string[]
  galleryImages?: string[]
  
  // Categories & Tags
  category?: string
  tags?: string[]
  
  // Shop info
  shop?: {
    id: string
    name: string
    logo?: string
    city?: string
  }
  shopName?: string
  
  // Owner info
  ownerName?: string
  ownerUser?: {
    id?: string
    name?: string
    isVerified?: boolean
  }
  
  // Reviews
  reviews?: any[]
  avgRating?: number
  rating?: number
  reviewsCount?: number
  _count?: {
    reviews?: number
  }
  
  // Features
  cashierEnabled?: boolean // POS system access
  
  // Location
  city?: string
  locationLat?: number
  locationLon?: number
  
  // Contact
  phone?: string
  email?: string
  website?: string
  
  // Verification
  isVerified?: boolean
  
  // Theme
  design?: {
    slug?: string
    name?: string
  }
}

interface ProductListingViewProps {
  data: ProductData
  type: 'shop' | 'service' | 'user' | 'product'
}

export default function ProductListingView({ data, type }: ProductListingViewProps) {
  const router = useRouter()
  const theme = resolveTheme(data.design?.slug || 'shop')
  
  // Product state
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  
  // Get all images
  const allImages = [
    data.coverImage || data.image,
    ...(data.images || []),
    ...(data.galleryImages || [])
  ].filter(Boolean) as string[]
  
  const mainImage = allImages[selectedImage] || allImages[0]
  
  // Calculate metrics
  const avgRating = data.avgRating || data.rating || 0
  const totalReviews = data.reviewsCount || data._count?.reviews || data.reviews?.length || 0
  const inStock = data.stock > 0
  const lowStock = data.stock <= (data.lowStockThreshold || 5)
  const hasDiscount = data.comparePrice && data.comparePrice > data.price
  const discountPercent = hasDiscount 
    ? Math.round(((data.comparePrice! - data.price) / data.comparePrice!) * 100)
    : 0
  
  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1 && newQty <= data.stock) {
      setQuantity(newQty)
    }
  }
  
  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      // Call cart API
      const response = await fetch('https://api.daleelbalady.com/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.productId || data.id,
          quantity,
          shopId: data.shop?.id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error((errorData as any).message || 'Failed to add to cart')
      }
      
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      alert(error.message || 'Failed to add item to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % allImages.length)
    } else {
      setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero/Header */}
      <div className="border-b bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
              {mainImage ? (
                <>
                  <img 
                    src={mainImage} 
                    alt={data.productName || data.name}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-1">
                      -{discountPercent}%
                    </Badge>
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  {theme.emoji}
                </div>
              )}
              
              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -transtone-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -transtone-y-1/2 bg-white/80 hover:bg-white"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent hover:border-stone-300'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Details */}
          <div className="space-y-6">
            {/* Breadcrumb / Shop Info */}
            {data.shop && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                <button 
                  onClick={() => router.push(`/shop/${data.shop?.id}`)}
                  className="hover:text-primary hover:underline"
                >
                  {data.shop.name}
                </button>
                {data.shop.city && (
                  <>
                    <span>•</span>
                    <span>{data.shop.city}</span>
                  </>
                )}
              </div>
            )}
            
            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{data.productName || data.name}</h1>
              
              {/* Rating & Reviews */}
              {avgRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {avgRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                </div>
              )}
              
              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {inStock ? (
                  <>
                    <Badge variant={lowStock ? 'destructive' : 'default'} className="bg-green-500">
                      <Package className="h-3 w-3 mr-1" />
                      {lowStock ? `Only ${data.stock} left` : 'In Stock'}
                    </Badge>
                    {data.sku && (
                      <span className="text-sm text-muted-foreground">SKU: {data.sku}</span>
                    )}
                  </>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {data.currency || 'EGP'} {data.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-muted-foreground line-through">
                    {data.currency || 'EGP'} {data.comparePrice?.toFixed(2)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-medium">
                  Save {data.currency || 'EGP'} {(data.comparePrice! - data.price).toFixed(2)} ({discountPercent}% off)
                </p>
              )}
            </div>
            
            <Separator />
            
            {/* Description */}
            {data.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}
            
            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* Quantity & Add to Cart */}
            {inStock && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-20 text-center border-0 focus-visible:ring-0"
                        min={1}
                        max={data.stock}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= data.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {data.stock} available
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || addedToCart}
                    style={{ backgroundColor: addedToCart ? '#10b981' : theme.colors.primary }}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Total */}
                <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Subtotal ({quantity} items)</span>
                    <span className="text-xl font-bold">
                      {data.currency || 'EGP'} {((data.price || 0) * quantity).toFixed(2)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <p className="text-xs text-green-600">
                      You save {data.currency || 'EGP'} {((data.comparePrice! - data.price) * quantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Features/Benefits */}
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Purchase Benefits
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Fast delivery available</span>
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <span>Easy returns within 14 days</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>Secure payment options</span>
                </li>
                {data.cashierEnabled && (
                  <li className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-blue-600" />
                    <span>POS system available for in-store purchase</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="reviews" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="reviews">Reviews ({totalReviews})</TabsTrigger>
            <TabsTrigger value="shop">Shop Info</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {data.reviews && data.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {data.reviews.map((review: any) => (
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
                          {review.author?.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{review.comment}</p>
                        {review.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shop" className="mt-6">
            {data.shop ? (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-4 mb-4">
                    {data.shop.logo && (
                      <img 
                        src={data.shop.logo} 
                        alt={data.shop.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">{data.shop.name}</h3>
                      {data.shop.city && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {data.shop.city}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Shop Location Map */}
                  {data.locationLat && data.locationLon && (
                    <>
                      <div className="rounded-lg overflow-hidden border">
                        <DynamicMap
                          center={[data.locationLat, data.locationLon]}
                          zoom={15}
                          markers={[{
                            position: [data.locationLat, data.locationLon],
                            title: data.shop.name,
                            description: data.shop.city
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
                        <Button variant="outline" className="w-full">
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                      </a>
                    </>
                  )}
                  
                  <Button 
                    onClick={() => router.push(`/shop/${data.shop?.id}`)}
                    className="w-full"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Visit Shop
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No shop information available
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="related" className="mt-6">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Related products will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
