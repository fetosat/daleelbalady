'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge, Calendar, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Offer } from '@/hooks/useOffers';
import { useTranslation } from 'react-i18next';

interface DiscountCardProps {
  offer: Offer;
  size?: 'small' | 'medium' | 'large';
  onView?: () => void;
  onClick?: () => void;
  className?: string;
}

export const DiscountCard: React.FC<DiscountCardProps> = ({
  offer,
  size = 'medium',
  onView,
  onClick,
  className = '',
}) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Call onView when card is rendered
  useEffect(() => {
    if (onView) {
      onView();
    }
  }, [onView]);

  // Format discount display
  const formatDiscount = () => {
    if (offer.discountType === 'PERCENTAGE') {
      return `-${offer.discountValue}%`;
    } else {
      return `${t('common.save')} ${offer.discountValue} ${t('common.currency')}`;
    }
  };

  // Format validity date
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('offers.noExpiry');
    
    const date = new Date(dateString);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return t('offers.expired');
    if (daysUntil === 0) return t('offers.endsToday');
    if (daysUntil === 1) return t('offers.endsTomorrow');
    if (daysUntil <= 7) return `${t('offers.endsIn')} ${daysUntil} ${t('common.days')}`;
    
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get image URL with fallback
  const getImageUrl = () => {
    if (offer.imageUrl) return offer.imageUrl;
    if (offer.shop?.coverImage) return offer.shop.coverImage;
    if (offer.shop?.logoImage) return offer.shop.logoImage;
    if (offer.services && offer.services.length > 0 && offer.services[0].coverImage) {
      return offer.services[0].coverImage;
    }
    return '/images/placeholder-offer.jpg';
  };

  // Get title
  const getTitle = () => {
    if (offer.title) return offer.title;
    if (offer.shop?.name) return offer.shop.name;
    if (offer.services && offer.services.length > 0) {
      const service = offer.services[0];
      // Handle translation structure
      if (service.translation) {
        return isRTL ? service.translation.name_ar : service.translation.name_en;
      }
      // Fallback if name exists directly
      return (service as any).name || t('offers.specialOffer');
    }
    return t('offers.specialOffer');
  };

  // Get description
  const getDescription = () => {
    return offer.shortDescription || offer.description.substring(0, 80) + '...';
  };

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (offer.shop) {
      router.push(`/shop/${offer.shop.id}`);
    } else if (offer.services && offer.services.length > 0) {
      router.push(`/service/${offer.services[0].id}`);
    }
  };

  // Determine card size classes
  const sizeClasses = {
    small: 'h-[200px] w-full',
    medium: 'h-[280px] w-full',
    large: 'h-[360px] w-full',
  };

  const isUrgent = offer.validUntil && 
    Math.ceil((new Date(offer.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card 
        className={`
          ${sizeClasses[size]} 
          relative overflow-hidden cursor-pointer group
          border-none shadow-lg hover:shadow-2xl
          transition-all duration-300
          ${isUrgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
        `}
        onClick={handleClick}
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl()}
            alt={getTitle()}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder-offer.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-between p-4 text-white">
          {/* Top Section - Badges */}
          <div className="flex items-start justify-between gap-2">
            {/* Discount Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex-shrink-0"
            >
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-xl font-bold text-lg">
                {formatDiscount()}
              </div>
            </motion.div>

            {/* Level & Exclusive Badges */}
            <div className="flex flex-col gap-2 items-end">
              {offer.isExclusive && (
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-xs font-semibold">{t('offers.exclusive')}</span>
                </div>
              )}
              
              {offer.level === 'PREMIUM' || offer.level === 'EXCLUSIVE' ? (
                <div className={`
                  px-3 py-1 rounded-full flex items-center gap-1 shadow-lg text-xs font-semibold
                  ${offer.level === 'EXCLUSIVE' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }
                `}>
                  <Badge className="h-3 w-3" />
                  <span>{offer.level}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Bottom Section - Info */}
          <div className="space-y-2">
            {/* Title */}
            <h3 className="text-xl font-bold line-clamp-2 drop-shadow-lg">
              {getTitle()}
            </h3>

            {/* Description */}
            {size !== 'small' && (
              <p className="text-sm text-stone-200 line-clamp-2 drop-shadow">
                {getDescription()}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 pt-2">
              {/* Validity Date */}
              <div className={`
                flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm
                ${isUrgent ? 'bg-red-500/80 animate-pulse' : 'bg-white/20'}
              `}>
                <Calendar className="h-3 w-3" />
                <span className="font-medium">{formatDate(offer.validUntil)}</span>
              </div>

              {/* CTA Button */}
              <Button
                size="sm"
                variant="default"
                className="bg-white text-black hover:bg-stone-100 shadow-lg font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                {t('offers.viewOffer')}
              </Button>
            </div>

            {/* Category Tags */}
            {size === 'large' && offer.categories && offer.categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {offer.categories.slice(0, 2).map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{category.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      </Card>
    </motion.div>
  );
};

export default DiscountCard;

