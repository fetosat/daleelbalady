import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, User, Stethoscope, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  result: any;
  index: number;
  onClick: () => void;
  isRTL: boolean;
}

export function UserCard({ result, index, onClick, isRTL }: UserCardProps) {
  const { t } = useTranslation();
  
  // Get doctor specialty from services or processed metadata
  const specialty = result.services?.[0]?.translation?.name_ar || 
                   result.services?.[0]?.translation?.name_en || 
                   result.metadata?.specialty ||
                   result.bio || 
                   (isRTL ? 'طبيب عام' : 'General Doctor');

  const displayName = result.name || 'Unknown Doctor';
  const phone = result.phone || result.contact?.phone || '';
  const isVerified = result.isVerified || result.metadata?.isVerified || false;
  const avgRating = result.avgRating || result.rating?.average || 0;
  const reviewsCount = result.reviewsCount || result._count?.reviews || result.rating?.count || 0;
  const city = result.city || result.location?.city || 'Location not specified';

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
    >
      <Link to={`/user/${result.id}`} className="block">
        <Card className="h-full bg-background border-blue-200 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                      {/* Show AI category instead of generic 'Doctor' */}
                      {result.category ? 
                        (isRTL ? result.category.ar : result.category.en) : 
                        (isRTL ? 'طبيب' : 'Doctor')
                      }
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
                      <Award className="h-3 w-3" />
                      {t('common.recommended')}
                    </span>
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2">
                {displayName}
              </h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3">
                {specialty}
              </p>
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
                  {city}
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
            </div>

            {/* Services Count */}
            {result.services && result.services.length > 0 && (
              <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-800/30">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {result.services.length} {isRTL ? 'خدمة متاحة' : 'services available'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
