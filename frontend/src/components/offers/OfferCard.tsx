'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Offer } from '@/hooks/useOffers';
import { Button } from '@/components/ui/button';

interface OfferCardProps {
  offer: Offer;
  onView?: (offerId: string) => void;
  onClick?: (offerId: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onView, onClick }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  // Format discount text
  const formatDiscount = () => {
    if (offer.discountType === 'PERCENTAGE') {
      return `-${offer.discountValue}%`;
    } else {
      return `-${offer.discountValue} ${t('common.currency', 'EGP')}`;
    }
  };

  // Calculate days until expiry
  const getDaysUntil = () => {
    if (!offer.validUntil) return null;
    const now = new Date();
    const expiry = new Date(offer.validUntil);
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const daysLeft = getDaysUntil();
  const isUrgent = daysLeft !== null && daysLeft <= 3;

  const handleClick = () => {
    if (onView) onView(offer.id);
    if (onClick) onClick(offer.id);

    // Navigate to shop or offer page
    if (offer.shop) {
      router.push(`/shop/${offer.shop.id}`);
    } else {
      router.push('/offers');
    }
  };

  // Determine background
  const backgroundStyle = offer.imageUrl
    ? { backgroundImage: `url(${offer.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: offer.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
      {/* Background Image/Gradient */}
      <div 
        className="absolute inset-0 transition-transform duration-700 hover:scale-110"
        style={backgroundStyle}
      />

      {/* Overlay Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t ${isRTL ? 'from-black/80 via-black/50 to-transparent' : 'from-black/80 via-black/50 to-transparent'}`} />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          {/* Discount Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-2xl"
          >
            <span className="text-2xl font-bold">{formatDiscount()}</span>
          </motion.div>

          {/* Level & Urgency Badges */}
          <div className="flex gap-2 flex-wrap">
            {offer.level === 'EXCLUSIVE' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"
              >
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-bold">{t('find.offers.exclusive', 'حصري')}</span>
              </motion.div>
            )}

            {isUrgent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.25 }}
                className="bg-red-500 text-white px-3 py-1 rounded-full animate-pulse shadow-lg"
              >
                <span className="text-xs font-bold">
                  {isRTL ? `ينتهي خلال ${daysLeft} يوم` : `Ends in ${daysLeft} days`}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Provider/Shop Logo */}
          {(offer.shop?.logoImage || offer.provider?.profilePic) && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm p-1 shadow-lg">
                <img
                  src={offer.shop?.logoImage || offer.provider?.profilePic}
                  alt={offer.shop?.name || offer.provider?.name || ''}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-white text-sm font-medium">
                {offer.shop?.name || offer.provider?.name}
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-2xl">
            {offer.title}
          </h3>

          {/* Description */}
          {offer.shortDescription && (
            <p className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-2 drop-shadow-lg">
              {offer.shortDescription}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-white/80">
            {daysLeft !== null && (
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Calendar className="h-3 w-3" />
                <span>
                  {isRTL 
                    ? `متبقي ${daysLeft} يوم` 
                    : `${daysLeft} days left`}
                </span>
              </div>
            )}

            {offer.categories && offer.categories.length > 0 && (
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Tag className="h-3 w-3" />
                <span>{offer.categories[0].name}</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            size="lg"
            className={`w-full bg-white hover:bg-stone-100 text-black font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('find.offers.viewOffer', 'عرض التفاصيل')}
            <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 mr-2' : 'ml-2'}`} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default OfferCard;

