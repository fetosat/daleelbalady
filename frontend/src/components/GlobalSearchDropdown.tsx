'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Store, 
  Briefcase, 
  Package, 
  User, 
  Loader2,
  MapPin,
  Star,
  ArrowRight,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

// Types
interface SearchResult {
  id: string;
  name: string;
  type: 'service' | 'shop' | 'product' | 'user';
  slug?: string;
  description?: string;
  city?: string;
  rating?: number;
  image?: string;
  price?: number;
  category?: string;
}

interface GlobalSearchDropdownProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
  autoFocus?: boolean;
}

export default function GlobalSearchDropdown({
  placeholder = "ابحث عن طبيب، محل، خدمة، منتج...",
  className,
  onResultClick,
  autoFocus = false
}: GlobalSearchDropdownProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch(
        `https://api.daleelbalady.com/api/advanced-search?q=${encodeURIComponent(searchQuery)}&type=all&limit=8`
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      
      // Combine all results
      const combinedResults: SearchResult[] = [
        ...(data.services || []).map((s: any) => ({
          id: s.id,
          name: s.translation?.name_ar || s.translation?.name_en || 'خدمة',
          type: 'service' as const,
          description: s.translation?.description_ar || s.translation?.description_en,
          city: s.city,
          rating: s.stats?.averageRating,
          category: s.category?.[0]?.name,
          slug: s.id
        })),
        ...(data.shops || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          type: 'shop' as const,
          description: s.description,
          city: s.city,
          rating: s.stats?.averageRating,
          image: s.logoImage || s.coverImage,
          slug: s.slug
        })),
        ...(data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          type: 'product' as const,
          description: p.description,
          price: p.price,
          rating: p.stats?.averageRating,
          image: p.images?.[0],
          slug: p.id
        })),
        ...(data.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          type: 'user' as const,
          description: u.bio,
          rating: u.stats?.averageRating,
          image: u.profilePic,
          slug: u.id
        }))
      ];

      setResults(combinedResults.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search on debounced query change
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);

    // Call custom handler if provided
    if (onResultClick) {
      onResultClick(result);
      return;
    }

    // Navigate to the correct page based on type
    let path = '';
    switch (result.type) {
      case 'service':
        // Use /listing instead of /services
        path = `/listing/${result.id}`;
        break;
      case 'shop':
        path = `/shops/${result.slug}`;
        break;
      case 'product':
        path = `/products/${result.id}`;
        break;
      case 'user':
        path = `/profile/${result.id}`;
        break;
    }

    if (path) {
      router.push(path);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Get icon for result type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return <Briefcase className="h-4 w-4" />;
      case 'shop':
        return <Store className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Get type label in Arabic
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'service':
        return 'خدمة';
      case 'shop':
        return 'محل';
      case 'product':
        return 'منتج';
      case 'user':
        return 'مستخدم';
      default:
        return '';
    }
  };

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          className={cn(
            "pr-12 pl-12 h-14 text-lg rounded-full shadow-lg border-2 transition-all",
            isOpen && results.length > 0 && "rounded-b-none border-b-0"
          )}
        />
        
        {/* Loading Spinner or Clear Button */}
        <div className="absolute left-4 top-1/2 -transtone-y-1/2 z-10">
          {loading ? (
            <Loader2 className="h-5 w-5 text-stone-400 animate-spin" />
          ) : query && (
            <button
              onClick={handleClear}
              className="hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4 text-stone-400 hover:text-stone-600" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full bg-white dark:bg-stone-800 rounded-b-3xl shadow-2xl border-2 border-t-0 border-stone-200 dark:border-stone-700 max-h-[500px] overflow-y-auto"
          >
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full px-4 py-3 text-right hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-start gap-3 group",
                    selectedIndex === index && "bg-stone-50 dark:bg-stone-700"
                  )}
                >
                  {/* Type Icon */}
                  <div className={cn(
                    "mt-1 p-2 rounded-full shrink-0",
                    result.type === 'service' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    result.type === 'shop' && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                    result.type === 'product' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    result.type === 'user' && "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {getTypeIcon(result.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-stone-900 dark:text-white truncate">
                        {result.name}
                      </h4>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full shrink-0",
                        result.type === 'service' && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                        result.type === 'shop' && "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
                        result.type === 'product' && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                        result.type === 'user' && "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                      )}>
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    
                    {result.description && (
                      <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-1 mb-1">
                        {result.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                      {result.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.city}
                        </span>
                      )}
                      {result.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {result.rating.toFixed(1)}
                        </span>
                      )}
                      {result.price && (
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {result.price} جنيه
                        </span>
                      )}
                      {result.category && (
                        <span className="text-stone-500">
                          {result.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRight className="h-5 w-5 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Footer - View All Results */}
            {results.length >= 8 && (
              <div className="border-t dark:border-stone-700 p-3">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  عرض جميع النتائج
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results Message */}
      <AnimatePresence>
        {isOpen && !loading && query.trim().length >= 2 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full bg-white dark:bg-stone-800 rounded-b-3xl shadow-2xl border-2 border-t-0 border-stone-200 dark:border-stone-700 p-8 text-center"
          >
            <Search className="h-12 w-12 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
            <p className="text-stone-600 dark:text-stone-400">
              لا توجد نتائج لـ "{query}"
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
              جرب كلمات بحث مختلفة
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
