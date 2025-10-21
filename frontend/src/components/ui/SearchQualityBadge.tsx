import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Zap, Target } from 'lucide-react';

interface SearchQualityBadgeProps {
  quality: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'outline';
  className?: string;
}

export function SearchQualityBadge({
  quality,
  size = 'md',
  showIcon = true,
  variant = 'outline',
  className = ''
}: SearchQualityBadgeProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  if (!quality) return null;
  
  // Quality configurations
  const qualityConfig = {
    excellent: {
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: { en: 'Excellent Results', ar: 'نتائج ممتازة' },
      description: { en: 'Highly relevant matches found', ar: 'تم العثور على مطابقات عالية الصلة' }
    },
    good: {
      icon: Target,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: { en: 'Good Results', ar: 'نتائج جيدة' },
      description: { en: 'Relevant matches found', ar: 'تم العثور على مطابقات ذات صلة' }
    },
    fair: {
      icon: Zap,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: { en: 'Fair Results', ar: 'نتائج مقبولة' },
      description: { en: 'Some matches found', ar: 'تم العثور على بعض المطابقات' }
    },
    basic: {
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: { en: 'Basic Results', ar: 'نتائج أساسية' },
      description: { en: 'Limited matches found', ar: 'تم العثور على مطابقات محدودة' }
    },
    poor: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      label: { en: 'Limited Results', ar: 'نتائج محدودة' },
      description: { en: 'Few matches found', ar: 'تم العثور على مطابقات قليلة' }
    }
  };
  
  // Normalize quality string
  const normalizedQuality = quality.toLowerCase() as keyof typeof qualityConfig;
  const config = qualityConfig[normalizedQuality] || qualityConfig.basic;
  
  const IconComponent = config.icon;
  const displayLabel = isRTL ? config.label.ar : config.label.en;
  const displayDescription = isRTL ? config.description.ar : config.description.en;
  
  // Size configurations
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5', 
    lg: 'text-base px-4 py-2'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  return (
    <Badge
      variant={variant}
      className={`
        inline-flex items-center gap-1.5 font-medium transition-colors
        ${config.color}
        ${sizeStyles[size]}
        ${className}
      `}
      title={displayDescription}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span>{displayLabel}</span>
    </Badge>
  );
}

export default SearchQualityBadge;
