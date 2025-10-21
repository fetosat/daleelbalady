import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import { 
  Crown, 
  CreditCard, 
  ArrowRight, 
  Star,
  Zap,
  Shield,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';

interface PaymentButtonProps {
  variant?: 'subscription' | 'upgrade' | 'renew' | 'gift';
  size?: 'sm' | 'default' | 'lg';
  planType?: 'PROVIDER' | 'USER';
  specificPlan?: string;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  variant = 'subscription',
  size = 'default',
  planType = 'PROVIDER',
  specificPlan,
  showBadge = false,
  badgeText,
  className = '',
  children,
  onClick
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (specificPlan) {
      navigate(`/payment-checkout?planId=${specificPlan}`);
    } else {
      navigate('/subscription-plans');
    }
  };

  const getButtonConfig = () => {
    switch (variant) {
      case 'upgrade':
        return {
          icon: Zap,
          text: isRTL ? 'ترقية الباقة' : 'Upgrade Plan',
          textAr: 'ترقية الباقة',
          bgClass: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
          iconClass: 'text-white'
        };
      case 'renew':
        return {
          icon: CreditCard,
          text: isRTL ? 'تجديد الاشتراك' : 'Renew Subscription',
          textAr: 'تجديد الاشتراك',
          bgClass: 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700',
          iconClass: 'text-white'
        };
      case 'gift':
        return {
          icon: Gift,
          text: isRTL ? 'اشتراك هدية' : 'Gift Subscription',
          textAr: 'اشتراك هدية',
          bgClass: 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
          iconClass: 'text-white'
        };
      default: // subscription
        return {
          icon: Crown,
          text: isRTL ? 'اختر باقتك' : 'Choose Your Plan',
          textAr: 'اختر باقتك',
          bgClass: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
          iconClass: 'text-white'
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <Badge className="bg-red-500 text-white animate-pulse">
            {badgeText || (isRTL ? 'جديد!' : 'New!')}
          </Badge>
        </motion.div>
      )}
      
      <Button
        onClick={handleClick}
        size={size}
        className={`${config.bgClass} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      >
        {children || (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.iconClass}`} />
            <span className="font-medium">
              {isRTL ? config.textAr : config.text}
            </span>
            <ArrowRight className={`h-4 w-4 ${config.iconClass} ${isRTL ? 'rotate-180' : ''}`} />
          </div>
        )}
      </Button>
    </motion.div>
  );
};

// Specific preset components for common use cases
export const SubscriptionButton: React.FC<Omit<PaymentButtonProps, 'variant'>> = (props) => (
  <PaymentButton variant="subscription" {...props} />
);

export const UpgradeButton: React.FC<Omit<PaymentButtonProps, 'variant'>> = (props) => (
  <PaymentButton variant="upgrade" {...props} />
);

export const RenewButton: React.FC<Omit<PaymentButtonProps, 'variant'>> = (props) => (
  <PaymentButton variant="renew" {...props} />
);

export const GiftButton: React.FC<Omit<PaymentButtonProps, 'variant'>> = (props) => (
  <PaymentButton variant="gift" {...props} />
);

// Mini payment button for compact spaces
export const PaymentButtonMini: React.FC<{
  planId?: string;
  className?: string;
}> = ({ planId, className = '' }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const handleClick = () => {
    if (planId) {
      navigate(`/payment-checkout?planId=${planId}`);
    } else {
      navigate('/subscription-plans');
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="sm"
      className={`bg-green-primary hover:bg-green-primary/90 text-white ${className}`}
    >
      <Crown className="h-3 w-3 mr-1" />
      {isRTL ? 'اشترك' : 'Subscribe'}
    </Button>
  );
};

// Payment status button for showing current subscription status
export const PaymentStatusButton: React.FC<{
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  expiryDate?: string;
  onClick?: () => void;
}> = ({ status, expiryDate, onClick }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: Shield,
          text: isRTL ? 'نشط' : 'Active',
          bgClass: 'bg-green-100 text-green-800 border-green-200',
          iconClass: 'text-green-600'
        };
      case 'expired':
        return {
          icon: CreditCard,
          text: isRTL ? 'منتهي الصلاحية' : 'Expired',
          bgClass: 'bg-red-100 text-red-800 border-red-200',
          iconClass: 'text-red-600'
        };
      case 'cancelled':
        return {
          icon: CreditCard,
          text: isRTL ? 'ملغي' : 'Cancelled',
          bgClass: 'bg-stone-100 text-stone-800 border-stone-200',
          iconClass: 'text-stone-600'
        };
      case 'trial':
        return {
          icon: Star,
          text: isRTL ? 'تجريبي' : 'Trial',
          bgClass: 'bg-blue-100 text-blue-800 border-blue-200',
          iconClass: 'text-blue-600'
        };
      default:
        return {
          icon: CreditCard,
          text: isRTL ? 'غير محدد' : 'Unknown',
          bgClass: 'bg-stone-100 text-stone-800 border-stone-200',
          iconClass: 'text-stone-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={`${config.bgClass} hover:opacity-80 cursor-pointer`}
    >
      <Icon className={`h-3 w-3 mr-1 ${config.iconClass}`} />
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium">{config.text}</span>
        {expiryDate && (
          <span className="text-xs opacity-75">
            {isRTL ? 'ينتهي:' : 'Expires:'} {new Date(expiryDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </Button>
  );
};

// Subscription promotion banner component
export const SubscriptionPromo: React.FC<{
  planType?: 'PROVIDER' | 'USER';
  discount?: number;
  onDismiss?: () => void;
}> = ({ planType = 'PROVIDER', discount, onDismiss }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg shadow-lg relative overflow-hidden"
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">
              {isRTL ? '🎉 عرض خاص على الاشتراكات!' : '🎉 Special Subscription Offer!'}
            </h3>
            <p className="text-sm opacity-90">
              {discount
                ? isRTL
                  ? `احصل على خصم ${discount}% على جميع الباقات`
                  : `Get ${discount}% off on all subscription plans`
                : isRTL
                ? 'اكتشف الباقات المناسبة لك واحصل على ميزات حصرية'
                : 'Discover plans that fit you and get exclusive features'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/subscription-plans')}
            variant="secondary"
            size="sm"
            className="bg-white text-green-600 hover:bg-stone-100"
          >
            {isRTL ? 'اعرض الباقات' : 'View Plans'}
          </Button>
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          )}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -transtone-y-16 transtone-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transtone-y-12 -transtone-x-12"></div>
    </motion.div>
  );
};

export default PaymentButton;
