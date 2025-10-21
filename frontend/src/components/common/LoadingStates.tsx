import React from 'react';
import { Loader2, Package, Search, CreditCard, MessageCircle, MapPin, Calendar, Users, Image, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

interface LoadingStateProps {
  type?: 'page' | 'card' | 'button' | 'inline' | 'modal' | 'skeleton';
  message?: string;
  description?: string;
  showSpinner?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

interface ContextualLoadingProps {
  context: 'search' | 'payment' | 'chat' | 'booking' | 'upload' | 'map' | 'products' | 'users' | 'generic';
  message?: string;
  className?: string;
}

// Basic Loading Spinner
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

// Skeleton Loader
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  className = ''
}) => {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse', // Could implement wave animation with CSS
    none: ''
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div
      className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Contextual Loading with Icons
export const ContextualLoading: React.FC<ContextualLoadingProps> = ({
  context,
  message,
  className = ''
}) => {
  const contextConfig = {
    search: {
      icon: Search,
      defaultMessage: 'جاري البحث...',
      color: 'text-blue-500'
    },
    payment: {
      icon: CreditCard,
      defaultMessage: 'جاري معالجة الدفع...',
      color: 'text-green-500'
    },
    chat: {
      icon: MessageCircle,
      defaultMessage: 'جاري إرسال الرسالة...',
      color: 'text-purple-500'
    },
    booking: {
      icon: Calendar,
      defaultMessage: 'جاري تأكيد الحجز...',
      color: 'text-orange-500'
    },
    upload: {
      icon: Image,
      defaultMessage: 'جاري رفع الملف...',
      color: 'text-indigo-500'
    },
    map: {
      icon: MapPin,
      defaultMessage: 'جاري تحميل الخريطة...',
      color: 'text-red-500'
    },
    products: {
      icon: Package,
      defaultMessage: 'جاري تحميل المنتجات...',
      color: 'text-yellow-500'
    },
    users: {
      icon: Users,
      defaultMessage: 'جاري تحميل البيانات...',
      color: 'text-teal-500'
    },
    generic: {
      icon: FileText,
      defaultMessage: 'جاري التحميل...',
      color: 'text-gray-500'
    }
  };

  const config = contextConfig[context];
  const IconComponent = config.icon;

  return (
    <div className={`flex items-center justify-center space-x-3 space-x-reverse ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`${config.color}`}
      >
        <IconComponent className="w-6 h-6" />
      </motion.div>
      <span className="text-gray-600 font-medium">
        {message || config.defaultMessage}
      </span>
    </div>
  );
};

// Main Loading State Component
export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'page',
  message = 'جاري التحميل...',
  description,
  showSpinner = true,
  className = '',
  children
}) => {
  const typeClasses = {
    page: 'min-h-screen flex items-center justify-center',
    card: 'p-8 flex items-center justify-center',
    button: 'flex items-center justify-center',
    inline: 'inline-flex items-center',
    modal: 'p-6 flex items-center justify-center',
    skeleton: 'space-y-2'
  };

  if (type === 'skeleton') {
    return (
      <div className={`${typeClasses[type]} ${className}`}>
        <div className="space-y-4 w-full">
          <Skeleton height="2rem" width="60%" />
          <Skeleton height="1rem" width="100%" />
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="90%" />
          <div className="flex space-x-4">
            <Skeleton height="3rem" width="3rem" variant="circular" />
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="70%" />
              <Skeleton height="1rem" width="50%" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${typeClasses[type]} ${className}`}>
      <div className="text-center">
        {showSpinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 flex justify-center"
          >
            <LoadingSpinner size={type === 'page' ? 'xl' : 'lg'} />
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {message}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {description}
            </p>
          )}
        </motion.div>
        
        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Card Loading Skeletons
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`border rounded-lg p-6 ${className}`}>
    <div className="space-y-4">
      <div className="flex items-center space-x-4 space-x-reverse">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>
      <Skeleton height="1rem" width="100%" />
      <Skeleton height="1rem" width="80%" />
      <div className="flex justify-between pt-4">
        <Skeleton width="5rem" height="2rem" variant="rounded" />
        <Skeleton width="4rem" height="2rem" variant="rounded" />
      </div>
    </div>
  </div>
);

// List Loading Skeleton
export const ListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 space-x-reverse p-3">
        <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height="1rem" />
          <Skeleton width="50%" height="0.75rem" />
        </div>
        <Skeleton width="4rem" height="1.5rem" variant="rounded" />
      </div>
    ))}
  </div>
);

// Table Loading Skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number; className?: string }> = ({ 
  rows = 5, 
  cols = 4, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4 space-x-reverse p-3 bg-gray-50">
      {Array.from({ length: cols }).map((_, index) => (
        <div key={index} className="flex-1">
          <Skeleton width="80%" height="1rem" />
        </div>
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 space-x-reverse p-3 border-b">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1">
            <Skeleton width={colIndex === 0 ? '60%' : '90%'} height="0.875rem" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

// Button Loading State
export const ButtonLoading: React.FC<{ 
  children: React.ReactNode; 
  loading?: boolean; 
  className?: string 
}> = ({ children, loading = false, className = '' }) => (
  <button 
    className={`flex items-center justify-center space-x-2 space-x-reverse ${className}`}
    disabled={loading}
  >
    {loading && <LoadingSpinner size="sm" color="white" />}
    <span className={loading ? 'opacity-75' : ''}>{children}</span>
  </button>
);

// Progressive Loading with Steps
interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  steps,
  currentStep,
  className = ''
}) => (
  <div className={`text-center ${className}`}>
    <LoadingSpinner size="lg" />
    <div className="mt-4 space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center justify-center space-x-2 space-x-reverse">
          <div className={`w-2 h-2 rounded-full ${
            index < currentStep ? 'bg-green-500' : 
            index === currentStep ? 'bg-blue-500 animate-pulse' : 
            'bg-gray-300'
          }`} />
          <span className={`text-sm ${
            index <= currentStep ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingState;
