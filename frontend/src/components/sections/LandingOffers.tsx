'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Tag, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useOffers } from '@/hooks/useOffers';
import DiscountCarousel from '@/components/DiscountCarousel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Shimmer Loading Skeleton
const OfferCardSkeleton: React.FC = () => (
  <Card className="h-[280px] w-full relative overflow-hidden bg-stone-200 dark:bg-stone-700 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
  </Card>
);

export const LandingOffers: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Fetch top 12 offers sorted by discount value and recency
  const { offers, loading, error, incrementViewCount, incrementClickCount } = useOffers({
    sortBy: 'discount',
    limit: 12,
    isActive: true,
  });

  const handleOfferView = (offerId: string) => {
    incrementViewCount(offerId);
  };

  const handleOfferClick = (offerId: string) => {
    incrementClickCount(offerId);
  };

  const handleViewAll = () => {
    router.push('/offers');
  };

  // Don't render if there are no offers and not loading
  if (!loading && (!offers || offers.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-stone-50 dark:from-stone-900 dark:to-stone-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Icon Header */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Tag className="h-8 w-8 text-red-500" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp className="h-8 w-8 text-green-500" />
            </motion.div>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
            {t('landing.offers.title', 'أكبر الخصومات وأحدث العروض')}
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            {t('landing.offers.subtitle', 'اكتشف عروضاً حصرية وخصومات مذهلة من متاجرنا المميزة')}
          </p>

          {/* Stats Bar */}
          {!loading && offers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 mt-6 flex-wrap"
            >
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-stone-600 dark:text-stone-400">
                  {t('landing.offers.activeOffers', { count: offers.length }, `${offers.length} عروض نشطة`)}
                </span>
              </div>
              
              {offers.some(offer => {
                const daysLeft = offer.validUntil 
                  ? Math.ceil((new Date(offer.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                return daysLeft !== null && daysLeft <= 3;
              }) && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {t('landing.offers.urgentDeals', 'عروض تنتهي قريباً!')}
                  </span>
                </div>
              )}

              {offers.some(offer => offer.level === 'EXCLUSIVE') && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {t('landing.offers.exclusiveAvailable', 'عروض حصرية متاحة')}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Offers Carousel or Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DiscountCarousel
              offers={offers}
              autoPlayDelay={4000}
              cardSize="medium"
              showControls={true}
              showDots={true}
              onOfferView={handleOfferView}
              onOfferClick={handleOfferClick}
            />
          </motion.div>
        )}

        {/* View All Button */}
        {!loading && offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-12"
          >
            <Button
              size="lg"
              onClick={handleViewAll}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              {t('landing.offers.viewAll', 'عرض جميع العروض')}
              <ArrowRight className="mr-2 h-5 w-5 group-hover:transtone-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LandingOffers;

