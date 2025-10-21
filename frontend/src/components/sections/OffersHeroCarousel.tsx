'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOffers } from '@/hooks/useOffers';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export const OffersHeroCarousel: React.FC = () => {
  const { i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch top 5 exclusive/premium offers
  const { offers, loading } = useOffers({
    sortBy: 'discount',
    limit: 5,
    isActive: true,
  });

  // Filter for premium/exclusive offers
  const heroOffers = offers.filter(offer => 
    offer.level === 'PREMIUM' || offer.level === 'EXCLUSIVE'
  ).slice(0, 5);

  // Setup Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: isRTL ? 'rtl' : 'ltr',
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

  // Autoplay
  useEffect(() => {
    if (!emblaApi) return;

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
      }, 5000);
    };

    startAutoplay();

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [emblaApi]);

  // Navigation
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

  // Format discount
  const formatDiscount = (offer: any) => {
    if (offer.discountType === 'PERCENTAGE') {
      return `-${offer.discountValue}%`;
    } else {
      return `${offer.discountValue} جنيه`;
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'بدون تاريخ انتهاء';
    const date = new Date(dateString);
    const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 0) return 'منتهي';
    if (daysUntil === 1) return 'ينتهي غداً';
    if (daysUntil <= 7) return `ينتهي خلال ${daysUntil} أيام`;
    
    return `ينتهي في ${date.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })}`;
  };

  // Debug logging
  useEffect(() => {
    console.log('🎪 OffersHeroCarousel - Loading:', loading);
    console.log('🎪 OffersHeroCarousel - Total offers:', offers.length);
    console.log('🎪 OffersHeroCarousel - Hero offers:', heroOffers.length);
    console.log('🎪 OffersHeroCarousel - Offers:', offers);
  }, [loading, offers, heroOffers]);

  if (loading) {
    return (
      <div className="w-full bg-stone-900 h-[400px] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>جاري تحميل العروض...</p>
        </div>
      </div>
    );
  }

  if (heroOffers.length === 0) {
    console.log('🎪 No hero offers to display');
    return null;
  }

  return (
    <section className="relative lg:hidden w-full bg-gradient-to-b from-stone-900 to-stone-800 dark:from-stone-950 dark:to-stone-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {heroOffers.map((offer) => {
              const isUrgent = offer.validUntil && 
                Math.ceil((new Date(offer.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 3;

              return (
                <div key={offer.id} className="flex-[0_0_100%] min-w-0">
                  <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                      {offer.imageUrl ? (
                        <img
                          src={offer.imageUrl}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          style={{
                            background: offer.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center">
                      <div className="container mx-auto my-4 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-2xl">
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                          >
                            {/* Badges */}
                            <div className="flex items-center gap-3 mb-6">
                              {/* Discount Badge */}
                              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full shadow-2xl">
                                <span className="text-3xl font-bold">{formatDiscount(offer)}</span>
                              </div>

                              {/* Level Badge */}
                              {offer.level === 'EXCLUSIVE' && (
                                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                                  <Sparkles className="h-4 w-4" />
                                  <span className="font-bold text-sm">حصري</span>
                                </div>
                              )}

                              {/* Urgent Badge */}
                              {isUrgent && (
                                <div className="bg-red-500 text-white px-4 py-2 rounded-full animate-pulse shadow-xl">
                                  <span className="font-bold text-sm">ينتهي قريباً!</span>
                                </div>
                              )}
                            </div>

                            {/* Title */}
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
                              {offer.title}
                            </h2>

                            {/* Description */}
                            <p className="text-lg md:text-xl text-stone-200 mb-6 leading-relaxed drop-shadow-lg">
                              {offer.shortDescription || offer.description.substring(0, 150)}
                            </p>

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-stone-300">
                              {/* Validity */}
                              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(offer.validUntil)}</span>
                              </div>

                              {/* Category */}
                              {offer.categories && offer.categories.length > 0 && (
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                  <Tag className="h-4 w-4" />
                                  <span>{offer.categories[0].name}</span>
                                </div>
                              )}
                            </div>

                            {/* CTA Button */}
                            <Button
                              size="lg"
                              onClick={() => {
                                if (offer.shop) {
                                  router.push(`/shop/${offer.shop.id}`);
                                } else {
                                  router.push('/offers');
                                }
                              }}
                              className="bg-white text-black hover:bg-stone-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                              احصل على العرض الآن
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        {heroOffers.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -transtone-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -transtone-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {heroOffers.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -transtone-x-1/2 z-10 flex gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${index === selectedIndex 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/50 hover:bg-white/70'
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OffersHeroCarousel;

