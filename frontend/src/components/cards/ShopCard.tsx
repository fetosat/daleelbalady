import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Store, Globe, Clock, Package, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface ShopCardProps {
  result: any;
  index: number;
  onClick: () => void;
  isRTL: boolean;
}

export function ShopCard({ result, index, onClick, isRTL }: ShopCardProps) {
  const { t } = useTranslation();
  
  const displayName = result.name || 'Unknown Shop';
  const description = result.description || '';
  const phone = result.phone || '';
  const website = result.website || '';
  const city = result.city || '';
  const isVerified = result.isVerified || false;
  const avgRating = result.avgRating || 0;
  const reviewsCount = result.reviewsCount || 0;
  
  // Get category names from AI category field or fallback to generic
  const displayCategory = result.category ? 
    (isRTL ? result.category.ar : result.category.en) :
    (isRTL ? 'محل' : 'Shop');

  // Get product/service counts
  const productCount = result._count?.products || 0;
  const serviceCount = result._count?.services || 0;

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
      <Card className="h-full border-green-200 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-700/50 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Store className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                    {displayCategory}
                  </span>
                  {isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
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

          {/* Shop Info */}
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

            {phone && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-stone-600 dark:text-stone-300 text-sm font-medium">
                  {phone}
                </span>
              </div>
            )}

            {website && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
                  {website}
                </span>
              </div>
            )}
          </div>

          {/* Inventory */}
          {(productCount > 0 || serviceCount > 0) && (
            <div className="mt-4 pt-3 border-t border-green-100 dark:border-green-800/30">
              <div className="flex gap-4 text-xs text-green-600 dark:text-green-400 font-medium">
                {productCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {productCount} {isRTL ? 'منتج' : 'products'}
                  </div>
                )}
                {serviceCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {serviceCount} {isRTL ? 'خدمة' : 'services'}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
