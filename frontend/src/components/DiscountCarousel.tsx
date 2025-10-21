'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Offer } from '@/hooks/useOffers';
import DiscountCard from '@/components/DiscountCard';
import { useTranslation } from 'react-i18next';

interface DiscountCarouselProps {
  offers: Offer[];
  autoPlayDelay?: number;
  cardSize?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  showDots?: boolean;
  onOfferView?: (offerId: string) => void;
  onOfferClick?: (offerId: string) => void;
  className?: string;
}

export const DiscountCarousel: React.FC<DiscountCarouselProps> = ({
  offers,
  autoPlayDelay = 3000,
  cardSize = 'medium',
  showControls = true,
  showDots = true,
  onOfferView,
  onOfferClick,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, 
    direction: isRTL ? 'rtl' : 'ltr',
    align: 'start',
    slidesToScroll: 1,
  });

  // Handle selection
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Setup carousel
  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Custom autoplay implementation
  useEffect(() => {
    if (!emblaApi || !isPlaying) return;

    const startAutoplay = () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }

      autoplayTimerRef.current = setInterval(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
      }, autoPlayDelay);
    };

    startAutoplay();

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [emblaApi, isPlaying, autoPlayDelay]);

  // Navigation functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying && emblaApi) {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
      autoplayTimerRef.current = setInterval(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
      }, autoPlayDelay);
    }
  }, [isPlaying, emblaApi, autoPlayDelay]);

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.33%] xl:flex-[0_0_25%]"
            >
              <DiscountCard
                offer={offer}
                size={cardSize}
                onView={() => onOfferView?.(offer.id)}
                onClick={() => onOfferClick?.(offer.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && offers.length > 1 && (
        <>
          {/* Previous Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-2 -transtone-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-stone-800 border-none"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Next Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 right-2 -transtone-y-1/2 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="h-10 w-10 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-stone-800 border-none"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>

          {/* Play/Pause Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 z-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAutoplay}
              className="h-8 w-8 rounded-full bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-stone-800 border-none"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && offers.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === selectedIndex 
                  ? 'w-8 bg-gradient-to-r from-blue-500 to-green-500' 
                  : 'w-2 bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500'
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter Display */}
      {offers.length > 1 && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {offers.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCarousel;

