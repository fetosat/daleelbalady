import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, DollarSign, User, Calendar, CheckCircle, Wrench, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
// Import AI components
import CategoryBadge from '@/components/ui/CategoryBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import AvailabilityStatus from '@/components/ui/AvailabilityStatus';
import FilterTagsBadge from '@/components/ui/FilterTagsBadge';

interface ServiceCardProps {
  result: any;
  index: number;
  onClick: () => void;
  isRTL: boolean;
}

export function ServiceCard({ result, index, onClick, isRTL }: ServiceCardProps) {
  const { t } = useTranslation();
  
  // Handle both enhanced API data and legacy format
  const displayName = result.translation?.name_en || result.translation?.name_ar || result.name || 'Unknown Service';
  const description = result.translation?.description_en || result.translation?.description_ar || result.description || result.shop?.description || '';
  const price = result.price || 0;
  const duration = result.duration || '';
  const city = result.city || result.shop?.city || result.location?.city || '';
  const isVerified = result.isVerified || result.shop?.isVerified || result.ownerUser?.isVerified || result.metadata?.isVerified || false;
  const avgRating = result.avgRating || result.rating?.average || 0;
  const reviewsCount = result.reviewsCount || result._count?.reviews || result.rating?.count || (result.reviews ? result.reviews.length : 0);
  const providerName = result.ownerUser?.name || result.ownerName || result.shop?.name || result.user?.name || 'Unknown Provider';
  // AI-enhanced fields
  const specialty = result.metadata?.specialty || result.specialty;
  const availability = result.metadata?.availability || result.availability;
  const priority = result.priority;
  const category = result.category;
  const filterTags = result.filterTags || [];

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
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Link to={`/service/${result.id}`} className="block">
        <Card className={`h-full bg-background border-blue-200 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 shadow-lg hover:shadow-xl ${
        result.isRecommended ? 'ring-2 ring-yellow-200 dark:ring-yellow-800/50' : ''
      } ${
        priority && priority >= 8 ? 'shadow-xl border-blue-300' : ''
      }`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                    {isRTL ? 'خدمة' : 'Service'}
                  </span>
                  
                  {/* AI Category Badge */}
                  {category && (
                    <CategoryBadge 
                      category={category} 
                      size="sm"
                      variant="outline"
                    />
                  )}
                  
                  {isVerified && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {isRTL ? 'موثق' : 'Verified'}
                    </Badge>
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

          {/* Service Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
              {displayName}
            </h3>
            
            {/* AI Specialty Information */}
            {specialty && (
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                <Info className="h-3 w-3 inline mr-1" />
                {specialty}
              </p>
            )}
            
            {description && (
              <p className="text-stone-600 dark:text-stone-300 text-sm mb-3 line-clamp-2">
                {description}
              </p>
            )}
            
            {/* Filter Tags Display */}
            {filterTags.length > 0 && (
              <div className="mb-3">
                <FilterTagsBadge 
                  filterTags={filterTags}
                  maxDisplay={3}
                  size="sm"
                />
              </div>
            )}
          </div>

          {/* Provider Info */}
          <div className="mb-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              <span className="text-sm text-stone-600 dark:text-stone-300">
                {isRTL ? 'مقدم الخدمة:' : 'Provider:'} 
                <span className="font-medium text-stone-800 dark:text-white ml-1">
                  {providerName}
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

            {duration && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-stone-600 dark:text-stone-300 text-sm">
                  {duration}
                </span>
              </div>
            )}

            {/* Price */}
            {price > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {formatPrice(price)}
                </span>
              </div>
            )}
            
            {/* Availability Status */}
            {availability && (
              <AvailabilityStatus 
                availability={availability}
                size="sm"
              />
            )}
          </div>
          {/* Enhanced Footer with Priority and Booking Status */}
          <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-800/30 space-y-2">
            {/* Priority Indicator */}
            {priority && (
              <div className="flex items-center justify-between">
                <PriorityIndicator 
                  priority={priority}
                  variant="bars"
                  size="sm"
                  showLabel={false}
                />
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {isRTL ? 'الأولوية' : 'Priority'}: {priority}/10
                </span>
              </div>
            )}
            
            {/* Booking Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Calendar className="h-3 w-3" />
                <span>{isRTL ? 'متاح للحجز' : 'Available for booking'}</span>
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {isRTL ? 'اضغط للتفاصيل' : 'Click for details'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </Link>
    </motion.div>
  );
}
