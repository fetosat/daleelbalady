'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Star, ShoppingCart, Package, AlertCircle, CheckCircle2, Pill, ShieldCheck, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductImage } from '@/components/ui/OptimizedImage'
import { medicalTheme } from '../theme'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description?: string
    price: number
    currency?: string
    stock: number
    coverImage?: string
    image?: string
    tags?: Array<{ name: string }>
    reviews?: any[]
    shop?: {
      name: string
      isVerified?: boolean
    }
    requiresPrescription?: boolean
    expiryDate?: string
  }
  onClick?: () => void
}

export default function MedicalProductCard({ product, onClick }: ProductCardProps) {
  const router = useRouter()
  
  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
    : 0
  
  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const criticalStock = product.stock > 0 && product.stock <= 3
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/product/${product.id}`)
    }
  }
  
  // Get placeholder image based on product type
  const getPlaceholderImage = () => {
    const productName = product.name.toLowerCase()
    
    // Medical equipment
    if (productName.includes('thermometer') || productName.includes('blood pressure')) {
      return 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=400&fit=crop'
    }
    // Tablets/Pills
    if (productName.includes('tablet') || productName.includes('capsule') || productName.includes('pill')) {
      return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
    }
    // Syrup/Liquid medication
    if (productName.includes('syrup') || productName.includes('suspension')) {
      return 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop'
    }
    // Vitamins/Supplements
    if (productName.includes('vitamin') || productName.includes('supplement')) {
      return 'https://images.unsplash.com/photo-1550572017-4a6a53e52e0f?w=400&h=400&fit=crop'
    }
    // Injections/Vaccines
    if (productName.includes('injection') || productName.includes('vaccine')) {
      return 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop'
    }
    // First aid
    if (productName.includes('bandage') || productName.includes('gauze') || productName.includes('plaster')) {
      return 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop'
    }
    // Default pharmaceutical
    return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop'
  }
  
  const displayImage = product.coverImage || product.image || getPlaceholderImage()
  
  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-blue-100 dark:border-blue-900 shadow-lg hover:border-blue-300 dark:hover:border-blue-700" 
      onClick={handleClick}
    >
      {/* Medical Accent Strip */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600" />
      
      {/* Product Image */}
      <div className="relative h-52 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-blue-950 dark:via-cyan-950 dark:to-stone-900 overflow-hidden">
        {/* Medical Cross Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="medical-cross" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 10 5 L 10 15 M 5 10 L 15 10" stroke="currentColor" strokeWidth="1" className="text-blue-600" />
            </pattern>
            <rect width="100" height="100" fill="url(#medical-cross)" />
          </svg>
        </div>
        
        <ProductImage 
          src={displayImage} 
          alt={product.name}
          fallbackSrc={getPlaceholderImage()}
          className="relative w-full h-full p-6 group-hover:scale-105 transition-transform duration-500"
          objectFit="contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={85}
        />
        
        {/* Medical Shield Overlay for Verified */}
        {product.shop?.isVerified && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {!inStock ? (
            <Badge className="bg-red-500 text-white border-0 shadow-lg backdrop-blur-sm bg-opacity-95">
              <AlertCircle className="h-3 w-3 mr-1" />
              Out of Stock
            </Badge>
          ) : criticalStock ? (
            <Badge className="bg-orange-500 text-white border-0 shadow-lg backdrop-blur-sm bg-opacity-95 animate-pulse">
              <AlertCircle className="h-3 w-3 mr-1" />
              Only {product.stock} left!
            </Badge>
          ) : lowStock ? (
            <Badge className="bg-amber-500 text-white border-0 shadow-lg backdrop-blur-sm bg-opacity-95">
              <Clock className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          ) : (
            <Badge className="bg-green-500 text-white border-0 shadow-lg backdrop-blur-sm bg-opacity-95">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Available
            </Badge>
          )}
        </div>
        
        {/* Prescription Required Badge */}
        {product.requiresPrescription && (
          <Badge className="absolute bottom-3 left-3 bg-blue-600 text-white border-0 shadow-lg backdrop-blur-sm bg-opacity-95 font-semibold">
            <span className="text-lg mr-1">℞</span> Rx Required
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 space-y-3">
        {/* Product Name */}
        <div className="min-h-[60px]">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100 line-clamp-2 mb-1.5 leading-tight">
            {product.name}
          </h3>
          {product.shop && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="font-medium">{product.shop.name}</span>
            </div>
          )}
        </div>
        
        {/* Description Preview */}
        {product.description && (
          <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                {tag.name}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
              >
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(avgRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300 dark:text-stone-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-500">
              ({product.reviews?.length})
            </span>
          </div>
        )}
        
        {/* Expiry Warning */}
        {product.expiryDate && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="font-medium">Exp: {new Date(product.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        )}
        
        {/* Price & Stock */}
        <div className="pt-4 border-t-2 border-blue-100 dark:border-blue-900 space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wide font-medium">
                Price
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {product.price}
                </span>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  {product.currency || 'EGP'}
                </span>
              </div>
            </div>
            
            {inStock && (
              <div className="text-right">
                <div className="text-xs text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wide font-medium">
                  Stock
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-300">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span>{product.stock}</span>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full h-11 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!inStock}
            onClick={(e) => {
              e.stopPropagation()
              // Add to cart logic here
            }}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

