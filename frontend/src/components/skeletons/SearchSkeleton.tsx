import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Search Page Loading Skeleton
 * Beautiful animated loading state for search results
 */
export function SearchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded animate-shimmer bg-[length:200%_100%]" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-3/4 animate-shimmer bg-[length:200%_100%]" />
                  <div className="h-8 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded animate-shimmer bg-[length:200%_100%]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Results Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar Skeleton */}
          <div className="h-12 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-lg animate-shimmer bg-[length:200%_100%]" />

          {/* Categories Skeleton */}
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-8 w-24 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-full animate-shimmer bg-[length:200%_100%]"
              />
            ))}
          </div>

          {/* Results Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                {/* Image Skeleton */}
                <div className="h-48 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 animate-shimmer bg-[length:200%_100%]" />
                
                <CardContent className="p-4 space-y-3">
                  {/* Title */}
                  <div className="h-6 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded animate-shimmer bg-[length:200%_100%]" />
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-full animate-shimmer bg-[length:200%_100%]" />
                    <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-3/4 animate-shimmer bg-[length:200%_100%]" />
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-20 animate-shimmer bg-[length:200%_100%]" />
                    <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-16 animate-shimmer bg-[length:200%_100%]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Result Card Skeleton
 * For list view
 */
export function ResultCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 animate-shimmer bg-[length:200%_100%]" />
        
        {/* Content */}
        <CardContent className="flex-1 p-4 space-y-3">
          <div className="h-6 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-3/4 animate-shimmer bg-[length:200%_100%]" />
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-full animate-shimmer bg-[length:200%_100%]" />
            <div className="h-4 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded w-5/6 animate-shimmer bg-[length:200%_100%]" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-16 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-full animate-shimmer bg-[length:200%_100%]"
              />
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

/**
 * Category Pills Skeleton
 */
export function CategorySkeleton() {
  return (
    <div className="flex gap-2 flex-wrap">
      {[80, 100, 90, 110, 85, 95].map((width, i) => (
        <div
          key={i}
          className="h-10 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 rounded-full animate-shimmer bg-[length:200%_100%]"
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  );
}

