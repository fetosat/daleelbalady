'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Loader2, AlertCircle, ArrowLeft, ShoppingCart, Star,
  MapPin, Phone, Mail, CheckCircle, Shield, Heart, Share2,
  MessageCircle, Package, Truck, RotateCcw, Award, Plus, Minus, Clock
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { resolveTheme } from '@/utils/themeResolver'

interface ProductData {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  sku?: string
  category: string
  images: string[]
  specifications?: Record<string, string>
  shop?: {
    id: string
    name: string
    logoImage: string
    phone: string
    email: string
    city: string
    isVerified: boolean
  }
  seller?: {
    id: string
    name: string
    profilePic: string
    isVerified: boolean
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    user: {
      name: string
      profilePic: string
    }
  }>
  _count?: {
    orders: number
    reviews: number
  }
  shippingInfo?: {
    available: boolean
    cost: number
    estimatedDays: number
  }
  returnPolicy?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`https://api.daleelbalady.com/api/products/${id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Product not found')
        }

        const data = await response.json()
        
        if (data.product) {
          setProduct(data.product)
        } else {
          throw new Error('Product data not found')
        }

      } catch (err: any) {
        console.error('Error fetching product:', err)
        setError(err.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true)
      const response = await fetch('https://api.daleelbalady.com/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          quantity
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Product added to cart!')
      } else {
        throw new Error(result.message || 'Failed to add to cart')
      }
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      alert(error.message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    router.push('/payment-checkout')
  }

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite)
    // TODO: API call to save favorite
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Product not found'}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => router.push('/find')}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const avgRating = product.reviews?.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  const seller = product.shop || product.seller
  const theme = resolveTheme(product.category || 'product')
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="bg-white dark:bg-stone-900 rounded-lg overflow-hidden mb-4">
              <div className="aspect-square relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl"
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`
                    }}
                  >
                    {theme.emoji}
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Out of Stock
                    </Badge>
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-1">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white dark:bg-stone-900 rounded-lg p-6">
              {product.sku && (
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                  SKU: {product.sku}
                </p>
              )}
              
              <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline">
                  <Package className="h-3 w-3 mr-1" />
                  {product.category}
                </Badge>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{avgRating.toFixed(1)}</span>
                    <span className="text-stone-500 dark:text-stone-400">
                      ({product._count?.reviews || 0})
                    </span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-2xl text-stone-400 line-through">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {product.stock > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      In Stock ({product.stock} available)
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || isAddingToCart}
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {isAddingToCart ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
                  ) : (
                    <><ShoppingCart className="h-5 w-5 mr-2" />Buy Now</>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Shipping Info */}
              {product.shippingInfo?.available && (
                <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">Free Shipping Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Clock className="h-4 w-4" />
                    <span>Estimated delivery: {product.shippingInfo.estimatedDays} days</span>
                  </div>
                  {product.returnPolicy && (
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                      <RotateCcw className="h-4 w-4" />
                      <span>{product.returnPolicy}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description and Specs */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium text-stone-700 dark:text-stone-300">{key}</span>
                        <span className="text-stone-600 dark:text-stone-400">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews ({product.reviews.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={review.user.profilePic} alt={review.user.name} />
                          <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{review.user.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
                            {review.comment}
                          </p>
                          <span className="text-xs text-stone-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Seller Card */}
          {seller && (
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={seller.logoImage || seller.profilePic} alt={seller.name} />
                      <AvatarFallback>{seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{seller.name}</span>
                        {seller.isVerified && (
                          <Shield className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/listing/${seller.id}`)}
                      >
                        View Shop
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm mb-4">
                    {seller.phone && (
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Phone className="h-4 w-4" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                    {seller.email && (
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <Mail className="h-4 w-4" />
                        <span>{seller.email}</span>
                      </div>
                    )}
                    {product.shop?.city && (
                      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                        <MapPin className="h-4 w-4" />
                        <span>{product.shop.city}</span>
                      </div>
                    )}
                  </div>

                  <Button variant="default" className="w-full" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>

                  {product._count?.orders && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{product._count.orders} orders completed</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
