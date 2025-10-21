import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showText = false,
  className = '' 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const currentRating = isHovering ? hoverRating : rating;

  const handleStarClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (!readonly) {
      setHoverRating(starValue);
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setIsHovering(false);
      setHoverRating(0);
    }
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'No rating';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return `${rating} stars`;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div 
        className="flex items-center gap-1" 
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentRating;
          const isPartiallyFilled = currentRating > star - 1 && currentRating < star;
          
          return (
            <motion.button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              whileHover={readonly ? {} : { scale: 1.1 }}
              whileTap={readonly ? {} : { scale: 0.95 }}
              className={`${sizeClasses[size]} relative focus:outline-none transition-all duration-200 ${
                readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              {/* Background star */}
              <svg
                viewBox="0 0 24 24"
                className={`${sizeClasses[size]} absolute inset-0 text-stone-200 dark:text-stone-600`}
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              
              {/* Filled star */}
              <motion.svg
                viewBox="0 0 24 24"
                className={`${sizeClasses[size]} absolute inset-0 transition-all duration-200 ${
                  isFilled 
                    ? 'text-yellow-400' 
                    : isPartiallyFilled 
                      ? 'text-yellow-400' 
                      : 'text-transparent'
                }`}
                fill="currentColor"
                initial={false}
                animate={{ 
                  scale: isFilled && isHovering ? 1.1 : 1,
                  opacity: isFilled ? 1 : isPartiallyFilled ? 0.5 : 0
                }}
                transition={{ duration: 0.2 }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </motion.svg>

              {/* Hover effect */}
              {!readonly && (
                <motion.div
                  className="absolute inset-0 bg-yellow-400 rounded-full opacity-0"
                  whileHover={{ opacity: 0.2, scale: 1.5 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {showText && (
        <motion.span 
          className={`ml-2 text-stone-600 dark:text-stone-400 font-medium ${textSizes[size]}`}
          key={currentRating}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {getRatingText(currentRating)}
        </motion.span>
      )}
      
      {showText && currentRating > 0 && (
        <motion.span 
          className={`ml-1 text-yellow-500 font-bold ${textSizes[size]}`}
          key={`rating-${currentRating}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          ({currentRating})
        </motion.span>
      )}
    </div>
  );
}

// Read-only star rating display component
interface StarDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export function StarDisplay({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showNumber = true,
  className = '' 
}: StarDisplayProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.floor(rating);
          const isPartiallyFilled = starValue === Math.ceil(rating) && rating % 1 !== 0;
          const fillPercentage = isPartiallyFilled ? (rating % 1) * 100 : 0;
          
          return (
            <div key={starValue} className={`${sizeClasses[size]} relative`}>
              {/* Background star */}
              <svg
                viewBox="0 0 24 24"
                className={`${sizeClasses[size]} absolute inset-0 text-stone-200 dark:text-stone-600`}
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              
              {/* Filled star */}
              {(isFilled || isPartiallyFilled) && (
                <div className="relative overflow-hidden">
                  <svg
                    viewBox="0 0 24 24"
                    className={`${sizeClasses[size]} text-yellow-400`}
                    fill="currentColor"
                    style={isPartiallyFilled ? { 
                      clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` 
                    } : {}}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showNumber && (
        <span className={`ml-1 text-stone-600 dark:text-stone-400 font-medium ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
