'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Star, DollarSign, Clock, ShoppingCart, Calendar, 
  Package, Briefcase, CheckCircle, User, Send
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { resolveTheme } from '@/utils/themeResolver'

// Services Tab Content
export function ServicesTabContent({ data, canBook, theme }: any) {
  const router = useRouter()

  if (!data.services || data.services.length === 0) {
    return (
      <Card className="dark:bg-stone-900 dark:border-stone-800">
        <CardContent className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 dark:text-stone-400">No services available yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.services.map((service: any) => (
          <Card 
            key={service.id}
            className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-stone-900 dark:border-stone-800"
            onClick={() => router.push(`/service/${service.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {service.image && (
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1 truncate">
                    {service.translation?.name_en || service.name}
                  </h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-2">
                    {service.translation?.description_en || service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {service.price && (
                        <span className="font-bold text-lg">
                          {service.currency || 'EGP'} {service.price}
                        </span>
                      )}
                      {service.durationMins && (
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.durationMins} mins
                        </span>
                      )}
                    </div>
                    {canBook && (
                      <Button size="sm" style={{ backgroundColor: theme.colors.primary }}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Products Tab Content
export function ProductsTabContent({ data, canBuyProducts, theme }: any) {
  const router = useRouter()

  if (!data.products || data.products.length === 0) {
    return (
      <Card className="dark:bg-stone-900 dark:border-stone-800">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 dark:text-stone-400">No products available yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.products.map((product: any) => (
          <Card 
            key={product.id}
            className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-stone-900 dark:border-stone-800"
            onClick={() => router.push(`/product/${product.id}`)}
          >
            <CardContent className="p-0">
              {product.images?.[0] && (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <h4 className="font-semibold mb-1 truncate">{product.name}</h4>
                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">
                      {product.currency || 'EGP'} {product.price}
                    </span>
                    {product.stock && (
                      <p className="text-xs text-stone-500">
                        {product.stock} in stock
                      </p>
                    )}
                  </div>
                  {canBuyProducts && (
                    <Button size="sm" style={{ backgroundColor: theme.colors.primary }}>
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Reviews Tab Content
export function ReviewsTabContent({ data, onWriteReview }: any) {
  const [filter, setFilter] = useState('all')
  
  const avgRating = data.reviews && data.reviews.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
    : 0

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: data.reviews?.filter((r: any) => r.rating === star).length || 0,
    percentage: data.reviews?.length > 0 
      ? ((data.reviews.filter((r: any) => r.rating === star).length / data.reviews.length) * 100).toFixed(0)
      : 0
  }))

  const filteredReviews = filter === 'all' 
    ? data.reviews 
    : data.reviews?.filter((r: any) => r.rating === parseInt(filter))

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card className="dark:bg-stone-900 dark:border-stone-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center p-6 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
              <div className="text-5xl font-bold mb-2">{avgRating.toFixed(1)}</div>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-stone-300 dark:text-stone-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Based on {data.reviews?.length || 0} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingCounts.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-12">{star} stars</span>
                  <Progress value={parseInt(percentage)} className="flex-1" />
                  <span className="text-sm text-stone-500 w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            className="w-full mt-6" 
            onClick={onWriteReview}
            variant="outline"
          >
            <Send className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        {[5, 4, 3, 2, 1].map(star => (
          <Button 
            key={star}
            variant={filter === star.toString() ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(star.toString())}
          >
            {star} <Star className="h-3 w-3 ml-1 fill-current" />
          </Button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews && filteredReviews.length > 0 ? (
          filteredReviews.map((review: any) => (
            <Card key={review.id} className="dark:bg-stone-900 dark:border-stone-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.author?.profilePic} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.author?.name}</span>
                          {review.author?.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-stone-300 dark:text-stone-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                      {review.comment}
                    </p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img: string, i: number) => (
                          <img 
                            key={i}
                            src={img} 
                            alt={`Review image ${i + 1}`}
                            className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80"
                          />
                        ))}
                      </div>
                    )}

                    {review.response && (
                      <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border-l-4 border-indigo-500">
                        <p className="font-semibold text-sm mb-1">Response from {data.name}</p>
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                          {review.response.comment}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {new Date(review.response.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-12 text-center">
              <Star className="w-16 h-16 mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500 dark:text-stone-400">
                {filter === 'all' ? 'No reviews yet. Be the first to review!' : 'No reviews with this rating'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Gallery Tab Content
export function GalleryTabContent({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return (
      <Card className="dark:bg-stone-900 dark:border-stone-800">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 dark:text-stone-400">No images available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div 
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedImage(img)}
          >
            <img 
              src={img} 
              alt={`Gallery image ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <Button 
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  )
}

