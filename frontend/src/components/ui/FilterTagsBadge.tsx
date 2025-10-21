import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { 
  Star, Shield, Award, TrendingUp, Heart, 
  Stethoscope, Coffee, Car, Scissors, ShoppingBag,
  Building2, Package, Users
} from 'lucide-react';

interface FilterTagsBadgeProps {
  filterTags: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md';
  showIcons?: boolean;
  className?: string;
}

// Tag configurations with icons and labels
const TAG_CONFIG = {
  // Quality tags
  'recommended': {
    icon: Star,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: { en: 'Recommended', ar: 'موصى به' }
  },
  'verified': {
    icon: Shield,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: { en: 'Verified', ar: 'موثق' }
  },
  'top_rated': {
    icon: Award,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: { en: 'Top Rated', ar: 'عالي التقييم' }
  },
  'trending': {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: { en: 'Trending', ar: 'رائج' }
  },
  'popular': {
    icon: Heart,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    label: { en: 'Popular', ar: 'شائع' }
  },
  
  // Category tags
  'medical': {
    icon: Stethoscope,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: { en: 'Medical', ar: 'طبي' }
  },
  'doctors': {
    icon: Stethoscope,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: { en: 'Doctors', ar: 'أطباء' }
  },
  'dental': {
    icon: Stethoscope,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: { en: 'Dental', ar: 'أسنان' }
  },
  'pharmacy': {
    icon: Package,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: { en: 'Pharmacy', ar: 'صيدلية' }
  },
  'food': {
    icon: Coffee,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: { en: 'Food', ar: 'طعام' }
  },
  'restaurants': {
    icon: Coffee,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: { en: 'Restaurants', ar: 'مطاعم' }
  },
  'automotive': {
    icon: Car,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: { en: 'Automotive', ar: 'سيارات' }
  },
  'beauty': {
    icon: Scissors,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    label: { en: 'Beauty', ar: 'تجميل' }
  },
  'shopping': {
    icon: ShoppingBag,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: { en: 'Shopping', ar: 'تسوق' }
  },
  
  // Entity type tags
  'services': {
    icon: Building2,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    label: { en: 'Services', ar: 'الخدمات' }
  },
  'users': {
    icon: Users,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    label: { en: 'People', ar: 'الأشخاص' }
  },
  'shops': {
    icon: Building2,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: { en: 'Shops', ar: 'المتاجر' }
  },
  'products': {
    icon: Package,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: { en: 'Products', ar: 'المنتجات' }
  },
  
  // Default
  'default': {
    icon: Package,
    color: 'bg-stone-100 text-stone-700 border-stone-200',
    label: { en: 'Tag', ar: 'علامة' }
  }
};

export function FilterTagsBadge({
  filterTags,
  maxDisplay = 3,
  size = 'sm',
  showIcons = true,
  className = ''
}: FilterTagsBadgeProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  if (!filterTags || filterTags.length === 0) {
    return null;
  }
  
  // Filter out 'all' tag and get relevant tags
  const relevantTags = filterTags
    .filter(tag => tag !== 'all')
    .slice(0, maxDisplay);
  
  if (relevantTags.length === 0) {
    return null;
  }
  
  const remainingCount = filterTags.length - maxDisplay;
  
  // Size configurations
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  };
  
  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3'
  };
  
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {relevantTags.map((tag, index) => {
        const config = TAG_CONFIG[tag as keyof typeof TAG_CONFIG] || TAG_CONFIG.default;
        const IconComponent = config.icon;
        const displayText = isRTL ? config.label.ar : config.label.en;
        
        return (
          <Badge
            key={`${tag}-${index}`}
            variant="outline"
            className={`
              inline-flex items-center gap-1 font-medium transition-colors
              ${config.color}
              ${sizeStyles[size]}
            `}
          >
            {showIcons && <IconComponent className={iconSizes[size]} />}
            <span>{displayText}</span>
          </Badge>
        );
      })}
      
      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className={`
            inline-flex items-center font-medium transition-colors
            bg-stone-100 text-stone-600 border-stone-200
            ${sizeStyles[size]}
          `}
        >
          <span>+{remainingCount}</span>
        </Badge>
      )}
    </div>
  );
}

export default FilterTagsBadge;
