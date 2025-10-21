'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Touch-Friendly Button
interface TouchButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export function TouchButton({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled 
}: TouchButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px]',
    md: 'px-6 py-4 text-base min-h-[48px]',
    lg: 'px-8 py-5 text-lg min-h-[52px]'
  };

  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-700 shadow-none',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn(
        'rounded-xl font-medium transition-all duration-200 touch-manipulation select-none',
        'focus:outline-none focus:ring-4 focus:ring-green-500/20',
        'active:shadow-inner',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

// Swipeable Card
interface SwipeableCardProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
}

export function SwipeableCard({ 
  children, 
  className, 
  onSwipeLeft, 
  onSwipeRight, 
  onTap 
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.7, 1, 0.7]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    x.set(0); // Reset position
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, opacity, scale }}
      whileTap={onTap ? { scale: 0.95 } : {}}
      onTap={onTap}
      className={cn('touch-manipulation', className)}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm overflow-hidden">
        {children}
      </Card>
    </motion.div>
  );
}

// Mobile-Optimized Card Grid
interface MobileCardGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

export function MobileCardGrid({ children, className, cols = 2 }: MobileCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid gap-3 sm:gap-4 lg:gap-6',
      gridCols[cols],
      className
    )}>
      {children}
    </div>
  );
}

// Horizontal Scroll Container
interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
}

export function HorizontalScroll({ children, className, showArrows = true }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        scrollElement.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className={cn('relative', className)}>
      {showArrows && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute left-2 top-1/2 -transtone-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-lg backdrop-blur-sm',
              !canScrollLeft && 'opacity-0 pointer-events-none'
            )}
            onClick={() => scrollTo('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute right-2 top-1/2 -transtone-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-lg backdrop-blur-sm',
              !canScrollRight && 'opacity-0 pointer-events-none'
            )}
            onClick={() => scrollTo('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Mobile-Optimized Badge
interface MobileBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileBadge({ children, variant = 'default', size = 'md', className }: MobileBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs min-h-[24px]',
    md: 'px-3 py-2 text-sm min-h-[28px]',
    lg: 'px-4 py-2 text-base min-h-[32px]'
  };

  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-stone-100 text-stone-800 border-stone-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    outline: 'border-2 bg-transparent',
    success: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Badge className={cn(
      'rounded-full font-medium border touch-manipulation',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {children}
    </Badge>
  );
}

// Pull to Refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const y = useMotionValue(0);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > 60 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    }
    y.set(0);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.y > 0) {
      setPullDistance(Math.min(info.offset.y, 100));
    }
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.3}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ y }}
      className={cn('touch-manipulation', className)}
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 20 || isRefreshing) && (
        <div className="flex justify-center py-4">
          <div className={cn(
            'w-6 h-6 border-2 border-green-600 rounded-full',
            isRefreshing ? 'animate-spin border-t-transparent' : 'border-t-transparent rotate-180'
          )} />
        </div>
      )}
      
      {children}
    </motion.div>
  );
}

// Lazy Loading Image
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function LazyImage({ src, alt, className, fallback }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse" />
      )}
      
      {inView && (
        <Image
          src={error && fallback ? fallback : src}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const mobileOptimizedExports = {
  TouchButton,
  SwipeableCard,
  MobileCardGrid,
  HorizontalScroll,
  MobileBadge,
  PullToRefresh,
  LazyImage
};

export default mobileOptimizedExports;
