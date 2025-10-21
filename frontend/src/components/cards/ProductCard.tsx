import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, DollarSign, User, Package, CheckCircle, ShoppingCart, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  result: any;
  index: number;
  onClick: () => void;
  isRTL: boolean;
}

export function ProductCard({ result, index, onClick, isRTL }: ProductCardProps) {
  const { t } = useTranslation();
  
  const displayName = result.name || 'Unknown Product';
  const description = result.description || '';
  const price = result.price || 0;
  // Use AI category field or fallback to generic category string
  const categoryDisplay = result.category ? 
    (typeof result.category === 'object' ? 
      (isRTL ? result.category.ar : result.category.en) : 
      result.category) : 
    '';
  const city = result.city || '';
  const isVerified = result.isVerified || false;
  const avgRating = result.avgRating || 0;
  const reviewsCount = result.reviewsCount || 0;
  const sellerName = result.shop?.name || result.user?.name || 'Unknown Seller';
  const stock = result.stock || 0;
  const isInStock = stock > 0;

  // Format price for display
  const formatPrice = (price: number) => {
    if (price === 0) return isRTL ? 'مجاني' : 'Free';
    return isRTL ? `${price} ريال` : `${price} SAR`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 * index,
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full border-purple-200 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                    {/* Show AI category instead of generic 'Product' */}
                    {result.category && typeof result.category === 'object' ? 
                      (isRTL ? result.category.ar : result.category.en) : 
                      (isRTL ? 'منتج' : 'Product')
                    }
                  </span>
                  {isVerified && (
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                  )}
                </div>
              </div>
            </div>
            
            {result.isRecommended && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + 0.1 * index }}
              >
                <Badge className="bg-yellow-400 text-black border-yellow-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                    {t('common.recommended')}
                  </span>
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Product Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
              {displayName}
            </h3>
            {description && (
              <p className="text-stone-600 dark:text-stone-300 text-sm mb-3 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Category & Seller */}
          <div className="mb-4 space-y-2">
            {categoryDisplay && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                <span className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                  {categoryDisplay}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              <span className="text-sm text-stone-600 dark:text-stone-300">
                {isRTL ? 'البائع:' : 'Seller:'} 
                <span className="font-medium text-stone-800 dark:text-white ml-1">
                  {sellerName}
                </span>
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-stone-800 dark:text-white font-semibold">
                {avgRating > 0 ? avgRating : 'New'}
              </span>
              <span className="text-stone-500 dark:text-stone-400 text-sm">
                ({reviewsCount} {isRTL ? 'تقييم' : 'reviews'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-stone-600 dark:text-stone-300" />
              </div>
              <span className="text-stone-600 dark:text-stone-300 text-sm">
                {city || 'Location not specified'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {/* Stock & Purchase */}
          <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-xs font-medium ${isInStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isInStock 
                    ? (isRTL ? `${stock} متوفر` : `${stock} in stock`)
                    : (isRTL ? 'غير متوفر' : 'Out of stock')
                  }
                </span>
              </div>
              
              {isInStock && (
                <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                  <ShoppingCart className="h-3 w-3" />
                  <span>{isRTL ? 'اضغط للشراء' : 'Click to buy'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
