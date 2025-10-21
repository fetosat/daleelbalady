import { useTranslation } from 'react-i18next';
import { TrendingUp, Award, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PriorityIndicatorProps {
  priority: number;
  variant?: 'bars' | 'badge' | 'stars' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function PriorityIndicator({ 
  priority = 5, 
  variant = 'bars',
  size = 'md',
  showLabel = false,
  className = ''
}: PriorityIndicatorProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Safety checks for props
  if (!priority && priority !== 0) {
    console.warn('PriorityIndicator: priority prop is missing, using default value 5');
  }
  
  // Ensure priority is within valid range (1-10) with safe defaults
  const safePriority = typeof priority === 'number' && !isNaN(priority) ? priority : 5;
  const normalizedPriority = Math.max(1, Math.min(10, safePriority));
  
  // Priority levels and colors
  const getPriorityLevel = (priority: number) => {
    if (priority >= 9) return { level: 'excellent', color: 'emerald', icon: Award };
    if (priority >= 7) return { level: 'high', color: 'green', icon: TrendingUp };
    if (priority >= 5) return { level: 'good', color: 'blue', icon: Star };
    if (priority >= 3) return { level: 'fair', color: 'yellow', icon: Zap };
    return { level: 'low', color: 'stone', icon: Zap };
  };
  
  const { level, color, icon: IconComponent } = getPriorityLevel(normalizedPriority);
  
  // Priority labels
  const priorityLabels = {
    excellent: { en: 'Excellent Match', ar: 'مطابقة ممتازة' },
    high: { en: 'High Priority', ar: 'أولوية عالية' },
    good: { en: 'Good Match', ar: 'مطابقة جيدة' },
    fair: { en: 'Fair Match', ar: 'مطابقة مقبولة' },
    low: { en: 'Low Priority', ar: 'أولوية منخفضة' }
  };
  
  // Size configurations
  const sizeConfigs = {
    sm: {
      bar: 'h-1 w-3',
      badge: 'text-xs px-2 py-1',
      star: 'h-3 w-3',
      icon: 'h-3 w-3'
    },
    md: {
      bar: 'h-1.5 w-4',
      badge: 'text-sm px-3 py-1.5',
      star: 'h-4 w-4',
      icon: 'h-4 w-4'
    },
    lg: {
      bar: 'h-2 w-5',
      badge: 'text-base px-4 py-2',
      star: 'h-5 w-5',
      icon: 'h-5 w-5'
    }
  };
  
  const sizeConfig = sizeConfigs[size as keyof typeof sizeConfigs] || sizeConfigs['md'];
  
  // Color classes
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      fill: 'fill-emerald-500'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-800 border-green-200',
      fill: 'fill-green-500'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      fill: 'fill-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      fill: 'fill-yellow-500'
    },
    stone: {
      bg: 'bg-stone-400',
      text: 'text-stone-500',
      badge: 'bg-stone-100 text-stone-700 border-stone-200',
      fill: 'fill-stone-400'
    }
  };
  
  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses['blue'];
  
  if (variant === 'bars') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`
              ${sizeConfig.bar} rounded-full transition-colors
              ${i < normalizedPriority ? colors.bg : 'bg-stone-200'}
            `}
          />
        ))}
        {showLabel && (
          <span className={`text-xs font-medium ml-2 ${colors.text}`}>
            {normalizedPriority}/10
          </span>
        )}
      </div>
    );
  }
  
  if (variant === 'badge') {
    return (
      <Badge 
        variant="outline"
        className={`${colors.badge} inline-flex items-center gap-1 ${sizeConfig.badge} ${className}`}
      >
        <IconComponent className={sizeConfig.icon} />
        <span>{isRTL ? (priorityLabels[level as keyof typeof priorityLabels]?.ar || 'Unknown') : (priorityLabels[level as keyof typeof priorityLabels]?.en || 'Unknown')}</span>
        {showLabel && <span className="ml-1">({normalizedPriority}/10)</span>}
      </Badge>
    );
  }
  
  if (variant === 'stars') {
    const starCount = Math.round(normalizedPriority / 2); // Convert to 5-star scale
    return (
      <div className={`flex items-center gap-0.5 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`
              ${sizeConfig.star} transition-colors
              ${i < starCount ? `${colors.text} ${colors.fill}` : 'text-stone-300'}
            `}
          />
        ))}
        {showLabel && (
          <span className={`text-xs font-medium ml-2 ${colors.text}`}>
            {starCount}/5
          </span>
        )}
      </div>
    );
  }
  
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <IconComponent className={`${sizeConfig.icon} ${colors.text}`} />
        {showLabel && (
          <span className={`text-xs font-medium ${colors.text}`}>
            {normalizedPriority}/10
          </span>
        )}
      </div>
    );
  }
  
  return null;
}

export default PriorityIndicator;
