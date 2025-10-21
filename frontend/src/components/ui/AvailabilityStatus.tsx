import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AvailabilityStatusProps {
  availability?: string;
  isOpen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'outline';
  className?: string;
}

export function AvailabilityStatus({
  availability,
  isOpen,
  size = 'sm',
  showIcon = true,
  variant = 'outline',
  className = ''
}: AvailabilityStatusProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Determine status from availability string or isOpen boolean
  let status: 'open' | 'closed' | 'busy' | 'unknown' = 'unknown';
  let displayText = '';
  
  if (availability) {
    const availabilityLower = availability.toLowerCase();
    if (availabilityLower.includes('available') || availabilityLower.includes('open') || availabilityLower.includes('متاح')) {
      status = 'open';
      displayText = isRTL ? 'متاح الآن' : 'Available Now';
    } else if (availabilityLower.includes('closed') || availabilityLower.includes('مغلق')) {
      status = 'closed';
      displayText = isRTL ? 'مغلق' : 'Closed';
    } else if (availabilityLower.includes('busy') || availabilityLower.includes('مشغول')) {
      status = 'busy';
      displayText = isRTL ? 'مشغول' : 'Busy';
    } else {
      displayText = availability;
    }
  } else if (isOpen !== undefined) {
    status = isOpen ? 'open' : 'closed';
    displayText = isOpen ? (isRTL ? 'مفتوح' : 'Open') : (isRTL ? 'مغلق' : 'Closed');
  } else {
    // No availability information provided
    return null;
  }
  
  // Status configurations
  const statusConfig = {
    open: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      dot: 'bg-green-500'
    },
    closed: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      dot: 'bg-red-500'
    },
    busy: {
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dot: 'bg-yellow-500'
    },
    unknown: {
      icon: Clock,
      color: 'bg-stone-100 text-stone-800 border-stone-200',
      dot: 'bg-stone-500'
    }
  };
  
  const config = statusConfig[status];
  const IconComponent = config.icon;
  
  // Size configurations
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
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
    >
      {showIcon && (
        <div className="flex items-center gap-1">
          <div className={`${dotSizes[size]} ${config.dot} rounded-full animate-pulse`} />
          <IconComponent className={iconSizes[size]} />
        </div>
      )}
      <span>{displayText}</span>
    </Badge>
  );
}

export default AvailabilityStatus;
