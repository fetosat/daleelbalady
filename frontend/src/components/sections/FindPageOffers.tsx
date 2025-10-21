'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOffers } from '@/hooks/useOffers';
import DiscountCard from '@/components/DiscountCard';
import { Card } from '@/components/ui/card';

interface FindPageOffersProps {
  categoryId?: string;
  subCategoryId?: string;
  categoryName?: string;
  className?: string;
}

// Compact Shimmer Loading Skeleton
const CompactOfferSkeleton: React.FC = () => (
  <Card className="h-[200px] w-full relative overflow-hidden bg-stone-200 dark:bg-stone-700 animate-pulse rounded-lg">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
  </Card>
);

export const FindPageOffers: React.FC<FindPageOffersProps> = ({
  categoryId,
  subCategoryId,
  categoryName,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Fetch 3-6 category-specific offers
  const { offers, loading, error, refetch, incrementViewCount, incrementClickCount } = useOffers({
    categoryId,
    subCategoryId,
    sortBy: 'discount',
    limit: 6,
    isActive: true,
  });

  // Refetch when category/subcategory changes
  useEffect(() => {
    if (categoryId || subCategoryId) {
      refetch();
    }
  }, [categoryId, subCategoryId, refetch]);

  const handleOfferView = (offerId: string) => {
    incrementViewCount(offerId);
  };

  const handleOfferClick = (offerId: string) => {
    incrementClickCount(offerId);
  };

  // Don't render if there are no offers and not loading
  if (!loading && (!offers || offers.length === 0)) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={`offers-${categoryId}-${subCategoryId}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`mb-6 ${className}`}
      >
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-stone-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full blur-md opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-yellow-400 to-red-500 p-2 rounded-full">
                  <Tag className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  {categoryName 
                    ? t('find.offers.categoryTitle', { category: categoryName }, `عروض ${categoryName}`)
                    : t('find.offers.defaultTitle', 'عروض خاصة')}
                  {offers.some(offer => offer.isExclusive) && (
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                  )}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {t('find.offers.subtitle', 'خصومات حصرية متاحة الآن')}
                </p>
              </div>
            </div>

            {/* Offer Count Badge */}
            {!loading && offers.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg"
              >
                {offers.length} {t('find.offers.count', 'عرض')}
              </motion.div>
            )}
          </div>

          {/* Offers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <CompactOfferSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {offers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DiscountCard
                    offer={offer}
                    size="small"
                    onView={() => handleOfferView(offer.id)}
                    onClick={() => handleOfferClick(offer.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Auto-scroll hint for mobile */}
          {!loading && offers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center"
            >
              <div className="inline-flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ←
                </motion.div>
                <span>{t('find.offers.swipeHint', 'اسحب لعرض المزيد')}</span>
                <motion.div
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>
    </AnimatePresence>
  );
};

export default FindPageOffers;

