import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '@/utils/env';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Global cache to prevent multiple fetches
let globalCache: {
  data: Category[] | null;
  timestamp: number | null;
  promise: Promise<Category[]> | null;
} = {
  data: null,
  timestamp: null,
  promise: null,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook to fetch and cache categories
 * Prevents multiple API calls by using a global cache
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(globalCache.data || []);
  const [loading, setLoading] = useState<boolean>(!globalCache.data);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      console.log('🔄 Fetching categories from API...');
      const response = await fetch(`${API_BASE}/advanced-search/categories`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      const categoriesData = data.categories || [];
      
      console.log(`✅ Categories fetched: ${categoriesData.length} items`);
      return categoriesData;
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      throw err;
    }
  };

  const loadCategories = async () => {
    // Check if cache is still valid
    const now = Date.now();
    if (
      globalCache.data &&
      globalCache.timestamp &&
      now - globalCache.timestamp < CACHE_DURATION
    ) {
      console.log('✅ Using cached categories');
      if (isMounted.current) {
        setCategories(globalCache.data);
        setLoading(false);
      }
      return;
    }

    // If there's an ongoing request, wait for it
    if (globalCache.promise) {
      console.log('⏳ Waiting for ongoing categories request...');
      try {
        const data = await globalCache.promise;
        if (isMounted.current) {
          setCategories(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err as Error);
          setLoading(false);
        }
      }
      return;
    }

    // Start a new request
    setLoading(true);
    setError(null);

    globalCache.promise = fetchCategories();

    try {
      const data = await globalCache.promise;
      
      // Update global cache
      globalCache.data = data;
      globalCache.timestamp = Date.now();
      
      if (isMounted.current) {
        setCategories(data);
        setLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
        setLoading(false);
      }
    } finally {
      globalCache.promise = null;
    }
  };

  const refetch = async () => {
    // Clear cache and refetch
    globalCache.data = null;
    globalCache.timestamp = null;
    globalCache.promise = null;
    await loadCategories();
  };

  useEffect(() => {
    isMounted.current = true;
    loadCategories();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    categories,
    loading,
    error,
    refetch,
  };
}

/**
 * Clear the categories cache manually
 */
export function clearCategoriesCache() {
  globalCache.data = null;
  globalCache.timestamp = null;
  globalCache.promise = null;
  console.log('🗑️ Categories cache cleared');
}

