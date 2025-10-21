import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, Building2, Car, Scissors, Coffee, 
  ShoppingBag, Wrench, Paintbrush, BookOpen, 
  Heart, Shield, Award, Package
} from 'lucide-react';

interface CategoryBadgeProps {
  category: {
    en: string;
    ar: string;
  };
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
}

// Category icon mapping
const CATEGORY_ICONS: { [key: string]: any } = {
  // Medical
  'doctor': Stethoscope,
  'clinic': Building2,
  'hospital': Building2,
  'pharmacy': Package,
  'medical': Stethoscope,
  
  // Food & Beverage
  'restaurant': Coffee,
  'cafe': Coffee,
  'bakery': Coffee,
  'food': Coffee,
  
  // Automotive
  'mechanic': Wrench,
  'auto garage': Car,
  'car': Car,
  'automotive': Car,
  
  // Beauty & Personal Care
  'barber shop': Scissors,
  'beauty salon': Heart,
  'salon': Heart,
  'barber': Scissors,
  
  // Shopping & Retail
  'shop': ShoppingBag,
  'store': ShoppingBag,
  'market': ShoppingBag,
  'retail': ShoppingBag,
  
  // Services
  'service provider': Wrench,
  'service': Wrench,
  
  // Electronics
  'electronics': Package,
  'technology': Package,
  
  // Education
  'school': BookOpen,
  'education': BookOpen,
  'books': BookOpen,
  
  // Default fallback
  'default': Package
};

// Category color schemes
const CATEGORY_COLORS: { [key: string]: string } = {
  // Medical - Blue
  'doctor': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'clinic': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'hospital': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'pharmacy': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'medical': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  
  // Food - Green
  'restaurant': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  'cafe': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  'bakery': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  'food': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  
  // Automotive - Orange
  'mechanic': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  'auto garage': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  'car': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  'automotive': 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  
  // Beauty - Pink
  'barber shop': 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
  'beauty salon': 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
  'salon': 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
  'barber': 'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
  
  // Shopping - Purple
  'shop': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  'store': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  'market': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  'retail': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  
  // Services - stone
  'service provider': 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200',
  'service': 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200',
  
  // Default - stone
  'default': 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
};

export function CategoryBadge({ 
  category, 
  variant = 'outline',
  size = 'sm',
  showIcon = true 
}: CategoryBadgeProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  if (!category || (!category.en && !category.ar)) {
    return null;
  }
  
  const displayText = isRTL ? category.ar : category.en;
  const categoryKey = category.en.toLowerCase();
  
  // Get icon and colors
  const IconComponent = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS['default'];
  const colorClasses = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS['default'];
  
  return (
    <Badge 
      variant={variant} 
      className={`
        inline-flex items-center gap-1 font-medium transition-colors
        ${variant === 'outline' ? colorClasses : ''}
        ${size === 'sm' ? 'text-xs px-2 py-1' : size === 'lg' ? 'text-sm px-3 py-2' : 'text-xs px-2.5 py-1.5'}
      `}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      <span>{displayText}</span>
    </Badge>
  );
}

export default CategoryBadge;
