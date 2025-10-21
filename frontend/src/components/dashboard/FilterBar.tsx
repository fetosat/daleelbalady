'use client';

import React from 'react';
import { Search, SlidersHorizontal, Grid3x3, LayoutList } from 'lucide-react';
import { ListingFilters, ListingType, ViewMode } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  const updateFilter = (key: keyof ListingFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-6 py-4">
      <div className="flex flex-col gap-4">
        {/* Top Row: Search and View Toggle */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              )}
              title="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              )}
              title="Table view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-stone-400" />
            
            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="px-3 py-1.5 border border-stone-300 dark:border-stone-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            >
              <option value="ALL">All Types</option>
              <option value="SHOP">Shops</option>
              <option value="SERVICE">Services</option>
              <option value="PRODUCT">Products</option>
            </select>

            {/* City Filter */}
            <input
              type="text"
              placeholder="City..."
              value={filters.city}
              onChange={(e) => updateFilter('city', e.target.value)}
              className="px-3 py-1.5 border border-stone-300 dark:border-stone-600 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            />

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="px-3 py-1.5 border border-stone-300 dark:border-stone-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-1.5 border border-stone-300 dark:border-stone-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            >
              <option value="latest">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-stone-500">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

