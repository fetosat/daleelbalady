'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  // Additional props for common use cases
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const aspectRatioClasses = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '3/2': 'aspect-[3/2]',
  auto: '',
};

const objectFitClasses = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className,
  aspectRatio = 'auto',
  objectFit = 'cover',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  width,
  height,
  fill,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If both width and height are provided, use them; otherwise use fill
  const usesFill = fill || (!width || !height);

  return (
    <div className={cn(
      'relative overflow-hidden',
      aspectRatio && aspectRatioClasses[aspectRatio],
      className
    )}>
      {isLoading && (
        <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-stone-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="m21 19v-14c0-1.1-.9-2-2-2h-14c0-1.1-.9-2-2-2s-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-10.5-11.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm3.5 6.5-3-4-2 3-3-2v8h14v-3z"/>
            </svg>
          </div>
        </div>
      )}
      
      {hasError && !fallbackSrc ? (
        <div className="absolute inset-0 bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
          <div className="text-center text-stone-500 dark:text-stone-400">
            <div className="w-12 h-12 mx-auto mb-2">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          fill={usesFill}
          width={!usesFill ? width : undefined}
          height={!usesFill ? height : undefined}
          className={cn(
            objectFitClasses[objectFit],
            isLoading ? 'opacity-0' : 'opacity-100',
            'transition-opacity duration-300'
          )}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}

// Convenience wrapper for common use cases
export function ProductImage({ className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      aspectRatio="square"
      objectFit="cover"
      className={cn("rounded-lg", className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      aspectRatio="square"
      objectFit="cover"
      className={cn("rounded-full", className)}
      {...props}
    />
  );
}

export function HeroImage({ className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      aspectRatio="16/9"
      objectFit="cover"
      priority
      className={className}
      {...props}
    />
  );
}
