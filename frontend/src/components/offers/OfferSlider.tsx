'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Pause, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOffers } from '@/hooks/useOffers';
import { OfferCard } from './OfferCard';

interface OfferSliderProps {
  categoryId?: string;
  subCategoryId?: string;
  autoPlayDelay?: number;
  className?: string;
  fixedHeight?: string;
}

export const OfferSlider: React.FC<OfferSliderProps> = ({
  categoryId,
  subCategoryId,
  autoPlayDelay = 5000,
  className = '',
  fixedHeight = 'h-[320px] md:h-[400px]',
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [isPaused, setIsPaused] = useState(false);

  // Fetch featured offers
  const { offers, loading, error, incrementViewCount, incrementClickCount } = useOffers({
    categoryId,
    subCategoryId,
    sortBy: 'discount',
    limit: 8,
    isActive: true,
  });

  // Filter for featured/premium offers
  const featuredOffers = offers.filter(offer => 
    offer.level === 'PREMIUM' || offer.level === 'EXCLUSIVE'
  );

  const displayOffers = featuredOffers.length > 0 ? featuredOffers : offers.slice(0, 5);

  // Auto-advance slider
  useEffect(() => {
    if (isPaused || displayOffers.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, displayOffers.length, autoPlayDelay]);

  // Track view count when offer changes
  useEffect(() => {
    if (displayOffers[currentIndex]) {
      incrementViewCount(displayOffers[currentIndex].id);
    }
  }, [currentIndex, displayOffers]);

  const handleNext = useCallback(() => {
    setDirection('up');
    setCurrentIndex((prev) => (prev + 1) % displayOffers.length);
  }, [displayOffers.length]);

  const handlePrev = useCallback(() => {
    setDirection('down');
    setCurrentIndex((prev) => (prev - 1 + displayOffers.length) % displayOffers.length);
  }, [displayOffers.length]);

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 'up' : 'down');
    setCurrentIndex(index);
  };

  const handleOfferClick = (offerId: string) => {
    incrementClickCount(offerId);
  };

  // Swipe handlers for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe) {
      handleNext();
    } else if (isDownSwipe) {
      handlePrev();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`relative ${fixedHeight} w-full rounded-2xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-900 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
        </div>
      </div>
    );
  }

  // Error or no offers
  if (error || displayOffers.length === 0) {
    return null;
  }

  // Animation variants
  const variants = {
    enter: (direction: 'up' | 'down') => ({
      y: direction === 'up' ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: 'up' | 'down') => ({
      y: direction === 'up' ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div className={`relative ${fixedHeight} w-full rounded-2xl overflow-hidden ${className}`}>
      {/* Slider Container */}
      <div
        className="relative h-full w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
            }}
            className="absolute inset-0"
          >
            <OfferCard
              offer={displayOffers[currentIndex]}
              onView={incrementViewCount}
              onClick={handleOfferClick}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls - Only show if more than 1 offer */}
      {displayOffers.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="absolute top-4 right-4 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Previous offer"
          >
            <ChevronUp className="h-5 w-5" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute top-14 right-4 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Next offer"
          >
            <ChevronDown className="h-5 w-5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute top-24 right-4 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displayOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to offer ${index + 1}`}
              />
            ))}
          </div>

          {/* Offer Counter */}
          <div className="absolute top-4 left-4 z-20 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {displayOffers.length}
          </div>
        </>
      )}
    </div>
  );
};

export default OfferSlider;

