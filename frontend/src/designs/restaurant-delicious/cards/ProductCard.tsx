'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Star, Tag, Package, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    }
    design?: {
      slug?: string
    }
  }
  onClick?: () => void
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const router = useRouter()
  
  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
    : 0
  
  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(`/product/${product.id}`)
    }
  }
  
  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden" onClick={handleClick}>
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        {(product.coverImage || product.image) ? (
          <img 
            src={product.coverImage || product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Stock Badge */}
        {!inStock ? (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">
            Out of Stock
          </Badge>
        ) : lowStock ? (
          <Badge className="absolute top-2 right-2 bg-orange-500 text-white border-0">
            Low Stock
          </Badge>
        ) : null}
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          {product.shop && (
            <p className="text-sm text-muted-foreground">from {product.shop.name}</p>
          )}
        </div>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({product.reviews?.length} reviews)</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-2xl font-bold text-primary">
            {product.price} <span className="text-sm font-normal">{product.currency || 'EGP'}</span>
          </div>
          
          {inStock && (
            <Badge variant="secondary" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              {product.stock} in stock
            </Badge>
          )}
        </div>
        
        <Button 
          className="w-full" 
          variant={inStock ? "default" : "outline"}
          size="sm"
          disabled={!inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  )
}

