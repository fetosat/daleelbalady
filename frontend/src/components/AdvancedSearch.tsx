import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle,
  Store,
  Package,
  Clock,
  DollarSign,
  User,
  Grid,
  List,
  SlidersHorizontal,
  TreePine,
  Users,
  ShoppingBag,
  TrendingUp,
  MapIcon,
  ThumbsUp,
  Calendar,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  FilterIcon,
  Navigation,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarDisplay } from '@/components/StarRating';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { resolveTheme, getThemeClasses, getThemeStyles } from '@/utils/themeResolver';
import dynamic from 'next/dynamic';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchSkeleton } from '@/components/skeletons/SearchSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ViewSwitcher, ViewMode as ViewModeType } from '@/components/ViewSwitcher';
import FindPageOffers from '@/components/sections/FindPageOffers';
import SavedSearches from '@/components/SavedSearches';

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[600px]"><SearchSkeleton /></div>
});

interface AdvancedSearchProps {
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string;
  initialSubcategory?: string;
  initialSubCategory?: string;
  hideCategoryFilters?: boolean;
}

type SearchResultType = 'all' | 'shops' | 'services' | 'users' | 'products';
type ViewMode = 'grid' | 'list' | 'map';
type SortBy = 'reviews' | 'recommendation' | 'location' | 'customers' | 'rating' | 'recent';

interface Category {
  id: string;
  name: string;
  slug: string;
  serviceCount: number;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  serviceCount: number;
}

interface SearchFilters {
  verified?: boolean;
  hasReviews?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';

interface SearchResults {
  shops: any[];
  services: any[];
  users: any[];
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  initialQuery = '',
  initialCity = '',
  initialCategory = '',
  initialSubcategory = '',
  initialSubCategory = '',
  hideCategoryFilters = false
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  // Search state
  const [searchQuery, setSearchQuery] = useState(() => {
    return initialQuery || searchParams.get('q') || '';
  });
  const [inputValue, setInputValue] = useState(() => {
    return initialQuery || searchParams.get('q') || '';
  });
  const [selectedCity, setSelectedCity] = useState(initialCity || searchParams.get('city') || '');
  const [locationQuery, setLocationQuery] = useState<string>(searchParams.get('loc') || '');

  // Geolocation state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>('idle');
  const [selectedRadius, setSelectedRadius] = useState<number>(5); // Default 5km radius
  const [useGeolocation, setUseGeolocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchResultType>(() => {
    const urlType = searchParams.get('type') as SearchResultType;
    return (urlType && ['all', 'shops', 'services', 'users', 'products'].includes(urlType)) ? urlType : 'all';
  });
  const [activeResultTab, setActiveResultTab] = useState<SearchResultType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recommendation');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    return initialCategory || searchParams.get('category') || '';
  });
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(() => {
    return initialSubcategory || initialSubCategory || searchParams.get('subcategory') || '';
  });
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const urlFilters: SearchFilters = {};
    const verified = searchParams.get('verified');
    const hasReviews = searchParams.get('hasReviews');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (verified === 'true') urlFilters.verified = true;
    if (hasReviews === 'true') urlFilters.hasReviews = true;
    if (minPrice || maxPrice) {
      urlFilters.priceRange = {
        min: minPrice ? parseInt(minPrice) : undefined,
        max: maxPrice ? parseInt(maxPrice) : undefined
      };
    }
    return urlFilters;
  });
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    return [
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 1000
    ];
  });

  // Results and UI state
  const [results, setResults] = useState<SearchResults>({
    shops: [],
    services: [],
    users: [],
    products: [],
    pagination: { page: 1, limit: 12, total: 0, pages: 0 }
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isInitialBrowse, setIsInitialBrowse] = useState(false);
  const [activeTab, setActiveTab] = useState('results');

  // Category tree state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // If initialCategory is provided, expand it by default
    return initialCategory ? new Set([initialCategory]) : new Set();
  });

  // Mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  
  // SavedSearches state
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  // Location free-text fallback (manual)
  // Removed city select in favor of text-based location query.

  // Radius options in kilometers (starting from 100m = 0.1km)
  const radiusOptions = [
    { value: 0.1, label: '100 m' },
    { value: 0.25, label: '250 m' },
    { value: 0.5, label: '500 m' },
    { value: 1, label: '1 km' },
    { value: 2, label: '2 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 20, label: '20 km' },
    { value: 50, label: '50 km' },
  ];

  // Geolocation functions
  const requestGeolocation = useCallback(async () => {
    console.log('🌍 Requesting geolocation permission...');
    setGeolocationStatus('requesting');
    setLocationError(null);

    if (!navigator.geolocation) {
      console.error('🌍 Geolocation not supported');
      setGeolocationStatus('unavailable');
      setLocationError(t('find.location.notSupported') || 'Geolocation is not supported by this browser');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 300000, // 5 minutes cache
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const newLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now(),
      };

      console.log('🌍 Geolocation successful:', newLocation);
      setUserLocation(newLocation);
      setGeolocationStatus('granted');
      setUseGeolocation(true);
      setLocationError(null);

      // Store location in localStorage for next session
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
    } catch (error: any) {
      console.error('🌍 Geolocation error:', error);

      let errorMessage = t('find.location.error') || 'Failed to get your location';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          setGeolocationStatus('denied');
          errorMessage = t('find.location.denied') || 'Location access denied. Please allow location access to use this feature.';
          break;
        case error.POSITION_UNAVAILABLE:
          setGeolocationStatus('error');
          errorMessage = t('find.location.unavailable') || 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          setGeolocationStatus('error');
          errorMessage = t('find.location.timeout') || 'Location request timed out. Please try again.';
          break;
        default:
          setGeolocationStatus('error');
          break;
      }

      setLocationError(errorMessage);
      setUseGeolocation(false);
    }
  }, [t]);

  const refreshLocation = useCallback(async () => {
    if (geolocationStatus === 'requesting') return;
    await requestGeolocation();
  }, [requestGeolocation, geolocationStatus]);

  const toggleLocationMode = useCallback(() => {
    if (useGeolocation) {
      setUseGeolocation(false);
      setUserLocation(null);
      setGeolocationStatus('idle');
      localStorage.removeItem('userLocation');
    } else {
      requestGeolocation();
    }
  }, [useGeolocation, requestGeolocation]);

  // Load cached location on mount
  useEffect(() => {
    try {
      const cachedLocation = localStorage.getItem('userLocation');
      if (cachedLocation) {
        const location: UserLocation = JSON.parse(cachedLocation);
        // Check if cached location is less than 1 hour old
        if (Date.now() - location.timestamp < 3600000) {
          setUserLocation(location);
          setGeolocationStatus('granted');
          setUseGeolocation(true);
          console.log('🌍 Loaded cached location:', location);
        } else {
          localStorage.removeItem('userLocation');
        }
      }
    } catch (error) {
      console.error('🌍 Error loading cached location:', error);
      localStorage.removeItem('userLocation');
    }
  }, []);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Debounced search query update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue !== searchQuery) {
        setSearchQuery(inputValue);
        setPage(1);
      }
    }, 500); // 500ms debounce for search input

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchQuery]);

  // Listen for URL parameter changes and sync with state
  useEffect(() => {
    const urlType = searchParams.get('type') as SearchResultType;
    const urlQuery = searchParams.get('q');
    const urlLocQuery = searchParams.get('loc');
    const urlCategory = searchParams.get('category');
    const urlSubCategory = searchParams.get('subcategory');
    const urlSortBy = searchParams.get('sort') as SortBy;
    const urlPage = searchParams.get('page');

    // Handle type parameter
    if (urlType && ['all', 'shops', 'services', 'users', 'products'].includes(urlType) && urlType !== searchType) {
      setSearchType(urlType);
    }

    // Handle query parameter
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setInputValue(urlQuery);
    }

    // Handle location text parameter
    if (urlLocQuery !== null && urlLocQuery !== locationQuery) {
      setLocationQuery(urlLocQuery);
    }

    // Handle category parameters
    if (urlCategory !== null && urlCategory !== selectedCategoryId) {
      setSelectedCategoryId(urlCategory);
    }
    if (urlSubCategory !== null && urlSubCategory !== selectedSubCategoryId) {
      setSelectedSubCategoryId(urlSubCategory);
    }

    // Handle sort parameter
    if (urlSortBy && ['reviews', 'recommendation', 'location', 'customers', 'rating', 'recent'].includes(urlSortBy) && urlSortBy !== sortBy) {
      setSortBy(urlSortBy);
    }

    // Handle page parameter
    if (urlPage && parseInt(urlPage) !== page) {
      setPage(parseInt(urlPage));
    }
  }, [searchParams]);

  // Update URL parameters - debounced to prevent loops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams);
      const newParams = new URLSearchParams();

      if (searchQuery) newParams.set('q', searchQuery);
      if (useGeolocation && userLocation) {
        newParams.set('location', 'geolocation');
        newParams.set('radius', selectedRadius.toString());
      } else if (locationQuery) {
        newParams.set('loc', locationQuery);
      }
      if (searchType !== 'all') newParams.set('type', searchType);
      if (sortBy !== 'recommendation') newParams.set('sort', sortBy);
      if (page > 1) newParams.set('page', page.toString());
      if (selectedCategoryId) newParams.set('category', selectedCategoryId);
      if (selectedSubCategoryId) newParams.set('subcategory', selectedSubCategoryId);
      if (filters.verified) newParams.set('verified', 'true');
      if (filters.hasReviews) newParams.set('hasReviews', 'true');
      if (priceRange[0] > 0) newParams.set('minPrice', priceRange[0].toString());
      if (priceRange[1] < 1000) newParams.set('maxPrice', priceRange[1].toString());

      // Only update if params actually changed
      if (currentParams.toString() !== newParams.toString()) {
        setSearchParams(newParams, { replace: true });
      }
    }, 300); // Increase debounce to 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, locationQuery, searchType, sortBy, page, selectedCategoryId, selectedSubCategoryId, filters, priceRange, setSearchParams, useGeolocation, userLocation, selectedRadius]);

  const loadCategories = async () => {
    console.log('📁 Loading categories...');
    try {
      const apiUrl = '/api';
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout | null = null;

      try {
        timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        const response = await fetch(`${apiUrl}/advanced-search/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal
        });
        if (timeoutId) clearTimeout(timeoutId);
        console.log('📁 Categories response status:', response.status, response.statusText);

        if (!response.ok) {
          console.error('📁 Categories response not OK:', await response.text());
          return;
        }

        const data = await response.json();
        console.log('📁 Categories data:', data);

        if (data.success) {
          console.log('📁 Setting categories:', data.categories.length, 'categories');
          setCategories(data.categories);
        } else {
          console.error('📁 Categories request failed:', data.error);
        }
      } catch (fetchError: any) {
        if (timeoutId) clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('📁 Categories request timed out');
        } else {
          console.error('📁 Categories fetch error:', fetchError);
        }
      }
    } catch (error) {
      console.error('📁 Error loading categories:', error);
    }
  };

  const performSearch = useCallback(async () => {
    console.log('🔍 AdvancedSearch: performSearch called');
    console.log('🔍 Search params:', { searchQuery, selectedCity, selectedCategoryId, selectedSubCategoryId, searchType });

    // Allow browsing even without search criteria - show popular/recommended results
    const hasLocationCriteria = (useGeolocation && userLocation) || (!!locationQuery && locationQuery.trim().length > 0);
    const hasSearchCriteria = searchQuery || hasLocationCriteria || selectedCategoryId || searchType !== 'all';
    const shouldShowInitialResults = !searchQuery && !hasLocationCriteria && !selectedCategoryId && searchType === 'all';

    console.log('🔍 Search conditions:', {
      searchQuery,
      hasLocationCriteria,
      selectedCategoryId,
      searchType,
      shouldShowInitialResults
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      console.log('🔍 Starting search...');
      setLoading(true);
      setError(null);

      // Prepare location data
      let locationData;
      if (useGeolocation && userLocation) {
        locationData = {
          type: 'coordinates',
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: selectedRadius // radius in kilometers
        };
      } else if (locationQuery) {
        locationData = {
          type: 'query',
          query: locationQuery
        };
      }

      const searchData = {
        q: searchQuery || undefined,
        type: searchType,
        location: locationData,
        category: {
          categoryId: selectedCategoryId || undefined,
          subCategoryId: selectedSubCategoryId || undefined,
        },
        sortBy,
        page,
        limit: itemsPerPage,
        filters: {
          ...filters,
          priceRange: filters.priceRange || (priceRange[1] < 1000 ? {
            min: priceRange[0],
            max: priceRange[1]
          } : undefined)
        }
      };

      console.log('🔍 Search data to send:', JSON.stringify(searchData, null, 2));

      const apiUrl = '/api';

      timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for search

      const response = await fetch(`${apiUrl}/advanced-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify(searchData),
      });
      if (timeoutId) clearTimeout(timeoutId);

      console.log('🔍 Response status:', response.status, response.statusText);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Response not OK:', errorText);
        setError(`Search failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log('🔍 Response data:', data);

      if (data.success) {
        console.log('🔍 Search successful, setting results');
        console.log('🔍 Results count:', {
          shops: data.shops?.length || 0,
          services: data.services?.length || 0,
          users: data.users?.length || 0,
          products: data.products?.length || 0
        });

        setResults({
          shops: data.shops || [],
          services: data.services || [],
          users: data.users || [],
          products: data.products || [],
          pagination: data.pagination
        });
        
        // Add to search history if there was a valid search query
        if (searchQuery || hasLocationCriteria || selectedCategoryId) {
          addToSearchHistory({
            q: searchQuery,
            filters: { ...filters, priceRange: filters.priceRange },
            location: locationQuery || (useGeolocation && userLocation ? 'Current Location' : ''),
            category: categories.find(cat => cat.id === selectedCategoryId)?.name || '',
            type: searchType,
            results: data
          });
        }
      } else {
        console.error('🔍 Search failed:', data.error);
        setError(data.error || 'Search failed');
      }
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('🔍 Search error:', error);

      if (error.name === 'AbortError') {
        console.error('🔍 Search request timed out');
        setError('Search request timed out. Please try again.');
      } else {
        console.error('🔍 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        setError('Failed to search. Please check your connection and try again.');
      }
    } finally {
      console.log('🔍 Search completed, setting loading to false');
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedCategoryId, selectedSubCategoryId, searchType, sortBy, page, itemsPerPage, filters, priceRange, categories, locationQuery, useGeolocation, userLocation, selectedRadius]);

  // Perform search when parameters change - always perform search (including initial load)
  useEffect(() => {
    const hasLocationCriteria = (useGeolocation && userLocation) || (!!locationQuery && locationQuery.trim().length > 0);
    const hasSearchCriteria = searchQuery || hasLocationCriteria || selectedCategoryId || searchType !== 'all';
    const shouldShowInitialResults = !searchQuery && !hasLocationCriteria && !selectedCategoryId && searchType === 'all';

    // Always perform search - either with criteria or to show initial popular results
    // But only after categories have been loaded
    if (categories.length > 0) {
      const timeoutId = setTimeout(() => {
        performSearch();
        setIsInitialBrowse(!hasSearchCriteria && shouldShowInitialResults);
      }, 150); // Debounce search calls

      return () => clearTimeout(timeoutId);
    }
  }, [performSearch, searchQuery, locationQuery, selectedCategoryId, selectedSubCategoryId, searchType, sortBy, page, filters, itemsPerPage, useGeolocation, userLocation, selectedRadius, categories.length]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setInputValue('');
    setSelectedCity('');
    setLocationQuery('');
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setFilters({});
    setPriceRange([0, 1000]);
    setPage(1);
    // Don't clear geolocation data, just disable it
    setUseGeolocation(false);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const getTotalResults = () => {
    return results.shops.length + results.services.length + results.users.length + results.products.length;
  };
  
  // Search history and saved searches functionality
  const addToSearchHistory = (searchParams: any) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newEntry = {
        ...searchParams,
        timestamp: Date.now()
      };
      
      // Remove duplicates and add to beginning
      const filteredHistory = history.filter((h: any) => 
        h.q !== newEntry.q || JSON.stringify(h.filters) !== JSON.stringify(newEntry.filters)
      );
      
      const updatedHistory = [newEntry, ...filteredHistory].slice(0, 20); // Keep last 20
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving to search history:', error);
    }
  };
  
  const handleSelectSavedSearch = (search: any) => {
    // Update search parameters from saved search
    if (search.query || search.q) {
      const query = search.query || search.q;
      setSearchQuery(query);
      setInputValue(query);
    }
    
    if (search.metadata?.location || search.location) {
      const location = search.metadata?.location || search.location;
      if (location === 'Current Location') {
        setUseGeolocation(true);
        setLocationQuery('');
      } else {
        setLocationQuery(location);
        setUseGeolocation(false);
      }
    }
    
    if (search.metadata?.category || search.category) {
      const categoryName = search.metadata?.category || search.category;
      const category = categories.find(cat => cat.name === categoryName);
      if (category) {
        setSelectedCategoryId(category.id);
      }
    }
    
    if (search.metadata?.filters || search.filters) {
      const searchFilters = search.metadata?.filters || search.filters;
      setFilters(searchFilters);
      if (searchFilters.priceRange) {
        setPriceRange([searchFilters.priceRange.min || 0, searchFilters.priceRange.max || 1000]);
      }
    }
    
    if (search.type && search.type !== 'all') {
      setSearchType(search.type);
    }
    
    // Reset page to 1
    setPage(1);
    
    // Close saved searches modal
    setShowSavedSearches(false);
  };
  
  const getCurrentSearchParams = () => {
    return {
      q: searchQuery,
      filters,
      location: locationQuery || (useGeolocation && userLocation ? 'Current Location' : ''),
      category: categories.find(cat => cat.id === selectedCategoryId)?.name || '',
      type: searchType,
      results
    };
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter(category => {
    // If initialCategory is provided, only show that category
    if (initialCategory && category.id !== initialCategory) {
      return false;
    }
    
    // Apply search filter
    return category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      category.subCategories.some(sub =>
        sub.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
      );
  });

  // Category Sidebar Component (separate component for right sidebar)
  const CategorySidebar = ({ isMobile = false }) => {
    // Get the selected category name if initialCategory is set
    const initialCategoryName = initialCategory 
      ? categories.find(cat => cat.id === initialCategory)?.name 
      : null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t('find.categories')}</h3>
        </div>

        {/* Show info badge when filtering by specific category */}
        {initialCategory && initialCategoryName && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('find.filteringByCategory') || 'عرض التصنيفات الفرعية لـ:'}
            </p>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-1">
              {initialCategoryName}
            </p>
          </div>
        )}

        {/* Category Search - Only show if not filtering by specific category */}
        {!initialCategory && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('find.searchCategories')}
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Category Tree */}
        <ScrollArea className={isMobile ? "h-[60vh]" : "h-[calc(100vh-16rem)]"}>
          <div className="space-y-1">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <Collapsible
                  open={expandedCategories.has(category.id)}
                  onOpenChange={() => toggleCategoryExpansion(category.id)}
                >
                  <div className="flex items-center space-x-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-1 m-1">
                        {expandedCategories.has(category.id) ?
                          <ChevronDown className="h-4 w-4" /> :
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      variant={selectedCategoryId === category.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        // Don't allow deselecting if this is the initialCategory
                        if (initialCategory && category.id === initialCategory) {
                          return;
                        }
                        setSelectedCategoryId(category.id === selectedCategoryId ? '' : category.id);
                        setSelectedSubCategoryId('');
                        if (isMobile && category.id !== selectedCategoryId) {
                          setShowMobileCategories(false);
                        }
                      }}
                      className="flex-1 justify-between p-2"
                      disabled={initialCategory && category.id === initialCategory}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.serviceCount}
                      </Badge>
                    </Button>
                  </div>
                  <CollapsibleContent className="ml-6">
                    <div className="space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <Button
                          key={subCategory.id}
                          variant={selectedSubCategoryId === subCategory.id ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setSelectedSubCategoryId(
                              subCategory.id === selectedSubCategoryId ? '' : subCategory.id
                            );
                            if (isMobile) {
                              setShowMobileCategories(false);
                            }
                          }}
                          className="w-full justify-between p-2"
                        >
                          <span className="text-sm">{subCategory.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {subCategory.serviceCount}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };
  var inputtext = ''
  var locatext = ''
  // Filter Content Component (without category tree, for left sidebar)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Desktop Search Bar - Only shown on desktop */}
      <div className="hidden lg:block">
        <Label className="text-sm font-medium mb-2 block">{t('find.searchQuery')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('find.searchPlaceholder')}
            onChange={(e) => { inputtext = e.target.value; }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setInputValue(inputtext);
                setPage(1);
              }
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Type filters removed - showing all listings together */}

      {/* Filter 2: Sort By */}
      <div>
        <Label className="text-sm font-medium mb-3 block">{t('find.orderBy')}</Label>
        <div className="space-y-2">
          {[
            { value: 'reviews', label: t('find.sortOptions.reviews'), icon: Star },
            { value: 'recommendation', label: t('find.sortOptions.recommendation'), icon: ThumbsUp },
            { value: 'location', label: t('find.sortOptions.location'), icon: MapIcon },
            { value: 'customers', label: t('find.sortOptions.customers'), icon: Users },
            { value: 'rating', label: t('find.sortOptions.rating'), icon: Star },
            { value: 'recent', label: t('find.sortOptions.recent'), icon: Calendar }
          ].map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={sortBy === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy(value as SortBy)}
              className="w-full justify-start"
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Location Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">{t('find.location')}</Label>

        {/* Location Mode Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant={useGeolocation ? 'default' : 'outline'}
            size="sm"
            onClick={toggleLocationMode}
            disabled={geolocationStatus === 'requesting'}
            className="flex-1"
          >
            {geolocationStatus === 'requesting' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 mr-2" />
            )}
            {useGeolocation ? t('find.location.nearMe') || 'Near Me' : t('find.location.useLocation') || 'Use My Location'}
          </Button>
        </div>

        {/* Geolocation Mode */}
        {useGeolocation && (
          <div className="space-y-3">
            {/* Location Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {geolocationStatus === 'granted' && userLocation ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">
                      {t('find.location.located') || 'Location found'}
                    </span>
                  </>
                ) : geolocationStatus === 'requesting' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400">
                      {t('find.location.requesting') || 'Getting location...'}
                    </span>
                  </>
                ) : geolocationStatus === 'denied' ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      {t('find.location.denied') || 'Access denied'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400">
                      {t('find.location.error') || 'Location error'}
                    </span>
                  </>
                )}
              </div>

              {userLocation && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshLocation}
                  disabled={geolocationStatus === 'requesting'}
                  className="h-6 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${geolocationStatus === 'requesting' ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>

            {/* Location Details */}
            {userLocation && (
              <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span>±{Math.round(userLocation.accuracy)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(userLocation.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Radius Selector */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t('find.location.searchRadius') || 'Search Radius'}
              </Label>
              <Select
                value={selectedRadius.toString()}
                onValueChange={(value) => setSelectedRadius(parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {radiusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {locationError && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                {locationError}
              </div>
            )}
          </div>
        )}

        {/* Text Location Mode (Fallback) */}
        {!useGeolocation && (
          <div className="space-y-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('find.location.searchPlaceholder') || 'Type a location (e.g., Zamalek, Cairo)'}
                onChange={(e) => { locatext = e.target.value; }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLocationQuery(locatext);
                    setPage(1);
                  }
                }}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('find.location.helpText') || 'We will try to find results near the typed area.'}
            </p>
          </div>
        )}
      </div>

      {/* Additional Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verified || false}
            onCheckedChange={(checked) =>
              setFilters(prev => ({ ...prev, verified: checked === true }))
            }
          />
          <Label htmlFor="verified" className="text-sm">{t('find.verifiedOnly')}</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasReviews"
            checked={filters.hasReviews || false}
            onCheckedChange={(checked) =>
              setFilters(prev => ({ ...prev, hasReviews: checked === true }))
            }
          />
          <Label htmlFor="hasReviews" className="text-sm">{t('find.hasReviews')}</Label>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            {t('find.priceRange')}: ${priceRange[0]} - ${priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={1000}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(searchQuery || (!!locationQuery && locationQuery.trim().length > 0) || selectedCategoryId || filters.verified || filters.hasReviews || useGeolocation) && (
        <Button
          variant="outline"
          onClick={() => {
            handleClearFilters();
            setShowMobileFilters(false);
          }}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          {t('find.clearAllFilters')}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 mt-4">
            {t('find.title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            {t('find.description')}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Left Sidebar - Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-80 shrink-0"
          >
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    {t('find.filters')}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSavedSearches(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">

            {/* Mobile Search Bar - Always Visible */}
            <div className="lg:hidden mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('find.searchPlaceholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Mobile Filter and Category Buttons */}
            <div className="lg:hidden mb-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="justify-start text-sm">
                      <FilterIcon className="h-4 w-4 mr-1" />
                      {t('find.filters')}
                      {((selectedCity && selectedCity !== '__all__') || filters.verified || filters.hasReviews) && (
                        <Badge variant="destructive" className="ml-1 h-3 w-3 p-0 flex items-center justify-center text-xs">
                          !
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-6 pb-4">
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        {t('find.filters')}
                      </SheetTitle>
                      <SheetDescription>
                        {t('find.filtersDescription') || 'Refine your search results'}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="px-6 pb-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Mobile Category Drawer Trigger */}
                {!hideCategoryFilters && (
                  <Button
                    variant="outline"
                    className="justify-start text-sm"
                    onClick={() => setShowMobileCategories(true)}
                  >
                    <TreePine className="h-4 w-4 mr-1" />
                    {t('find.categories')}
                    {selectedCategoryId && (
                      <Badge variant="destructive" className="ml-1 h-3 w-3 p-0 flex items-center justify-center text-xs">
                        !
                      </Badge>
                    )}
                  </Button>
                )}
                
                {/* SavedSearches Button */}
                <Button
                  variant="outline"
                  className="justify-start text-sm"
                  onClick={() => setShowSavedSearches(true)}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{t('find.savedSearches') || 'Saved'}</span>
                  <span className="sm:hidden">Saved</span>
                </Button>
              </div>
            </div>

            {/* Results Header */}
            {(searchQuery || (!!locationQuery && locationQuery.trim().length > 0) || selectedCategoryId || searchType !== 'all' || (useGeolocation && userLocation)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {loading ? t('find.searching') :
                        isInitialBrowse ?
                          t(`find.browsing.browseAll${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`) + ` (${t('find.browsing.totalAvailable', { count: results.pagination.total })})` :
                          t('find.foundResults', { count: getTotalResults() })}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="text-xs">{t('find.badges.search', { query: searchQuery })}</Badge>
                      )}
                      {useGeolocation && userLocation && (
                        <Badge variant="secondary" className="text-xs">
                          <Navigation className="h-3 w-3 mr-1" />
                          {t('find.badges.nearMe', { radius: selectedRadius }) || `Within ${selectedRadius}km`}
                        </Badge>
                      )}
                      {!useGeolocation && locationQuery && (
                        <Badge variant="secondary" className="text-xs">{t('find.badges.location', { location: locationQuery }) || `Near ${locationQuery}`}</Badge>
                      )}
                      {selectedCategoryId && (
                        <Badge variant="secondary" className="text-xs">
                          {t('find.badges.category', { category: categories.find(c => c.id === selectedCategoryId)?.name })}
                        </Badge>
                      )}
                      {isInitialBrowse && (
                        <Badge variant="outline" className="text-xs">{t(`find.searchTypes.${searchType}`)}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setViewMode('grid')}
                      className="flex-1 sm:flex-none sm:px-6 sm:py-5"
                    >
                      <Grid className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="ml-2">Grid</span>
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setViewMode('list')}
                      className="flex-1 sm:flex-none sm:px-6 sm:py-5"
                    >
                      <List className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="ml-2">List</span>
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => {
                        setViewMode('map');
                        // Auto-switch to shops if on users or products (but allow 'all')
                        if (searchType === 'users' || searchType === 'products') {
                          setSearchType('shops');
                        }
                      }}
                      className={`flex-1 sm:flex-none sm:px-6 sm:py-5 ${
                        viewMode === 'map' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-700 shadow-lg' 
                          : 'border-blue-300 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-700 dark:hover:bg-blue-950'
                      }`}
                    >
                      <MapIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="ml-2">Map</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {(searchQuery || (selectedCity && selectedCity !== '__all__') || selectedCategoryId || searchType !== 'all') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {getTotalResults() === 0 && !loading ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('find.noResults')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('find.noResultsDescription')}
                    </p>
                    <Button onClick={handleClearFilters} variant="outline">
                      {t('find.clearAllFilters')}
                    </Button>
                  </div>
                ) : viewMode === 'map' ? (
                  <MapView
                    results={results}
                    userLocation={userLocation}
                    selectedRadius={selectedRadius}
                  />
                ) : (
                  <>
                    {/* Category-Specific Offers Section */}
                    <FindPageOffers
                      categoryId={selectedCategoryId}
                      subCategoryId={selectedSubCategoryId}
                      categoryName={selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : undefined}
                    />
                    
                    <Tabs value={activeResultTab} onValueChange={(value) => setActiveResultTab(value as SearchResultType)} className="w-full">
                      <TabsList className="grid w-full grid-cols-5 mb-6">
                      <TabsTrigger value="all" className="relative">
                        {t('find.tabs.all') || 'All'}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getTotalResults()}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="shops" className="relative">
                        🏪 {t('find.tabs.shops') || 'Shops'}
                        {results.shops.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {results.shops.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="services" className="relative">
                        🛠️ {t('find.tabs.services') || 'Services'}
                        {results.services.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {results.services.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="users" className="relative">
                        👥 {t('find.tabs.users') || 'Users'}
                        {results.users.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {results.users.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="products" className="relative">
                        📦 {t('find.tabs.products') || 'Products'}
                        {results.products.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {results.products.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {results.shops.map((shop) => (
                          <ShopResultCard key={`shop-${shop.id}`} shop={shop} viewMode={viewMode} />
                        ))}
                        {results.services.map((service) => (
                          <ServiceResultCard key={`service-${service.id}`} service={service} viewMode={viewMode} />
                        ))}
                        {results.users.map((user) => (
                          <UserResultCard key={`user-${user.id}`} user={user} viewMode={viewMode} />
                        ))}
                        {results.products.map((product) => (
                          <ProductResultCard key={`product-${product.id}`} product={product} viewMode={viewMode} />
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="shops">
                      {results.shops.length === 0 ? (
                        <div className="text-center py-12">
                          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">{t('find.noShops') || 'No shops found'}</h3>
                          <p className="text-muted-foreground">{t('find.noShopsDescription') || 'Try adjusting your filters'}</p>
                        </div>
                      ) : (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {results.shops.map((shop) => (
                            <ShopResultCard key={`shop-${shop.id}`} shop={shop} viewMode={viewMode} />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="services">
                      {results.services.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">{t('find.noServices') || 'No services found'}</h3>
                          <p className="text-muted-foreground">{t('find.noServicesDescription') || 'Try adjusting your filters'}</p>
                        </div>
                      ) : (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {results.services.map((service) => (
                            <ServiceResultCard key={`service-${service.id}`} service={service} viewMode={viewMode} />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="users">
                      {results.users.length === 0 ? (
                        <div className="text-center py-12">
                          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">{t('find.noUsers') || 'No users found'}</h3>
                          <p className="text-muted-foreground">{t('find.noUsersDescription') || 'Try adjusting your filters'}</p>
                        </div>
                      ) : (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {results.users.map((user) => (
                            <UserResultCard key={`user-${user.id}`} user={user} viewMode={viewMode} />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="products">
                      {results.products.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">{t('find.noProducts') || 'No products found'}</h3>
                          <p className="text-muted-foreground">{t('find.noProductsDescription') || 'Try adjusting your filters'}</p>
                        </div>
                      ) : (
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                          {results.products.map((product) => (
                            <ProductResultCard key={`product-${product.id}`} product={product} viewMode={viewMode} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  </>
                )}

                {/* Pagination Controls */}
                {results.pagination.total > 0 && (
                  <div className="mt-8 space-y-4 pb-20">
                    {/* Items per page selector */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm whitespace-nowrap">{t('find.pagination.itemsPerPage')}:</Label>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                          setItemsPerPage(parseInt(value));
                          setPage(1);
                        }}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                            <SelectItem value="48">48</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground text-center">
                        <span className="hidden sm:inline">
                          {t('find.pagination.showing')} {((page - 1) * itemsPerPage) + 1} {t('find.pagination.to')} {Math.min(page * itemsPerPage, results.pagination.total)} {t('find.pagination.total')} {results.pagination.total} {t('find.pagination.results')}
                        </span>
                        <span className="sm:hidden">
                          {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, results.pagination.total)} of {results.pagination.total}
                        </span>
                      </div>
                    </div>

                    {/* Page navigation */}
                    {results.pagination.pages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="hidden sm:flex"
                          >
                            {t('find.pagination.first')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                          >
                            <span className="hidden sm:inline">{t('find.pagination.previous')}</span>
                            <span className="sm:hidden">‹</span>
                          </Button>
                        </div>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(3, results.pagination.pages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(
                              results.pagination.pages - 2,
                              Math.max(1, page - 1)
                            )) + i;
                            return pageNum <= results.pagination.pages ? (
                              <Button
                                key={pageNum}
                                variant={page === pageNum ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPage(pageNum)}
                                className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
                              >
                                {pageNum}
                              </Button>
                            ) : null;
                          })}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === results.pagination.pages}
                          >
                            <span className="hidden sm:inline">{t('find.pagination.next')}</span>
                            <span className="sm:hidden">›</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(results.pagination.pages)}
                            disabled={page === results.pagination.pages}
                            className="hidden sm:flex"
                          >
                            {t('find.pagination.last')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Getting Started */}
            {!searchQuery && (!locationQuery || locationQuery.trim().length === 0) && !selectedCategoryId && searchType === 'all' && !(useGeolocation && userLocation) && (
              <div className="text-center py-16">
                <Search className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {t('find.gettingStarted')}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t('find.gettingStartedDescription')}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar - Categories */}
          {!hideCategoryFilters && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-80 shrink-0"
            >
              <Card className="sticky top-6">
                <CardContent className="pt-6">
                  <CategorySidebar />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Mobile Category Drawer */}
        {!hideCategoryFilters && (
          <div className="lg:hidden">
            <Sheet open={showMobileCategories} onOpenChange={setShowMobileCategories}>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="p-6 pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <TreePine className="h-5 w-5" />
                    {t('find.categories')}
                  </SheetTitle>
                  <SheetDescription>
                    {t('find.categoriesDescription') || 'Browse by category'}
                  </SheetDescription>
                </SheetHeader>
                <div className="px-6 pb-6">
                  <CategorySidebar isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
      
      {/* SavedSearches Modal */}
      <SavedSearches 
        isOpen={showSavedSearches}
        onClose={() => setShowSavedSearches(false)}
        onSelectSearch={handleSelectSavedSearch}
        currentSearchParams={getCurrentSearchParams()}
      />
    </div>
  );
};

  // Shop Result Card Component
  const ShopResultCard: React.FC<{ shop: any; viewMode: ViewMode }> = ({ shop, viewMode }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
  
    // Resolve theme based on design slug
    const theme = resolveTheme(shop.design?.slug);
    const themeClasses = getThemeClasses(theme);
    const themeStyles = getThemeStyles(theme);
  
  const handleClick = () => {
    // Navigate to owner's listing page
    const targetId = shop.owner?.id || shop.ownerId;
    if (targetId) {
      navigate(`/listing/${targetId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={themeClasses.specialEffects.join(' ')}
    >
      <Card
        className={`h-full cursor-pointer border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl group`}
        style={{
          borderColor: theme.colors.primary,
          boxShadow: `0 4px 20px ${theme.colors.primary}20`
        }}
        onClick={handleClick}
      >
        {/* Hero Section with Gradient */}
        <div
          className="h-28 relative flex items-center px-4 transition-all duration-300 group-hover:h-32"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.via || theme.gradient.to}, ${theme.gradient.to})`,
          }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30">
            <div className="absolute top-1 right-4 w-12 h-12 rounded-lg bg-white/30 rotate-12 transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110"></div>
            <div className="absolute bottom-2 right-6 w-10 h-10 rounded-full bg-white/25 transition-transform duration-500 group-hover:scale-125"></div>
            <div className="absolute top-3 right-1/4 w-8 h-8 bg-white/20 transform rotate-45 transition-transform duration-500 group-hover:rotate-90"></div>
            <div className="absolute bottom-4 left-6 w-6 h-6 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-150"></div>
          </div>

          {/* Design-specific pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${theme.colors.primary}20 0, ${theme.colors.primary}20 10px, transparent 10px, transparent 20px)`,
            }}
          />

          {/* Main Content */}
          <div className="relative z-10 flex items-center gap-3">
            <div 
              className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg ring-2 ring-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
              style={{ boxShadow: `0 4px 15px ${theme.colors.primary}40` }}
            >
              <span>{theme.emoji}</span>
            </div>
            <div className="text-white flex-1">
              <h3 className="font-bold text-lg truncate max-w-[180px] drop-shadow-md">
                {shop.name}
              </h3>
              <p className="text-sm opacity-90 line-clamp-1 drop-shadow-sm">
                {shop.owner.name}
              </p>
              {/* Design badge */}
              <div className="mt-1">
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm font-medium uppercase tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {shop.design?.name || 'Shop'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          {shop.isVerified && (
            <div className="absolute top-3 right-3 animate-pulse">
              <CheckCircle className="h-6 w-6 text-white drop-shadow-lg" fill="white" fillOpacity={0.3} />
            </div>
          )}
        </div>

        {/* Info Section */}
        <CardContent className="p-4 bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 relative overflow-hidden">
          {/* Design accent bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary || theme.colors.primary})` }}
          />
          
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2 leading-relaxed">
            {shop.description || t('find.cardLabels.noDescription')}
          </p>

          {/* Rating */}
          {shop.stats.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarDisplay
                rating={shop.stats.averageRating}
                size="sm"
                showNumber={false}
              />
              <span className="text-sm font-medium" style={{ color: theme.colors.primary }}>
                ({shop.stats.totalReviews})
              </span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div 
              className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: `${theme.colors.primary}10` }}
            >
              <MapPin className="h-4 w-4" style={{ color: theme.colors.primary }} />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">
                {shop.city || 'N/A'}
              </span>
            </div>
            <div 
              className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: `${theme.colors.primary}10` }}
            >
              <Package className="h-4 w-4" style={{ color: theme.colors.primary }} />
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {shop.stats.totalServices} services
              </span>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.primary }} />
              <span>Active</span>
            </div>

            <Button
              size="sm"
              className="h-9 px-4 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: 'white'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle visit/call action
              }}
            >
              <Store className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:scale-110" />
              {t('find.actions.visit') || 'Visit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Service Result Card Component
const ServiceResultCard: React.FC<{ service: any; viewMode: ViewMode }> = ({ service, viewMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Resolve theme based on design slug
  const theme = resolveTheme(service.design?.slug);
  const themeClasses = getThemeClasses(theme);
  const themeStyles = getThemeStyles(theme);

  const handleClick = () => {
    // Navigate to owner's listing page
    // Services can be owned by users OR shops. If shop, use shop's owner ID
    const targetId = service.ownerUser?.id || service.ownerUserId || service.shop?.owner?.id || service.shop?.ownerId;
    if (targetId) {
      navigate(`/listing/${targetId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={themeClasses.specialEffects.join(' ')}
    >
      <Card
        className={`h-full cursor-pointer border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl group`}
        style={{
          borderColor: theme.colors.primary,
          boxShadow: `0 4px 20px ${theme.colors.primary}20`
        }}
        onClick={handleClick}
      >
        {/* Hero Section with Gradient */}
        <div
          className="h-24 relative flex items-center px-4"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`,
          }}
        >
          {/* Abstract Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/30"></div>
            <div className="absolute bottom-3 right-8 w-6 h-6 rounded-full bg-white/20"></div>
            <div className="absolute top-4 right-1/3 w-4 h-4 rotate-45 bg-white/25"></div>
          </div>

          {/* Main Icon */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              <span>{theme.emoji}</span>
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg truncate max-w-[200px]">
                {service.translation?.name_en || 'Unnamed Service'}
              </h3>
              <p
                className="text-sm opacity-90 line-clamp-2"
                style={{ WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)' }}
              >
                {service.ownerUser?.name || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          {service.ownerUser?.isVerified && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <CardContent className="p-4 bg-white dark:bg-stone-800">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2">
            {service.translation?.description_en || t('find.cardLabels.noDescription')}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
              {service.price && (
                <div className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-stone-900 dark:text-white">${service.price}</span>
                </div>
              )}
              {service.durationMins && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.durationMins}min</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {service.city && (
                <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                  <MapPin className="h-4 w-4" />
                  <span>{service.city}</span>
                </div>
              )}
            </div>

            <Button
              size="sm"
              className="h-8 px-4"
              style={{ backgroundColor: theme.colors.primary }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle booking action
              }}
            >
              📞 {t('find.actions.book') || 'Book Now'}
            </Button>
          </div>

          {/* Debug: show design name/slug */}
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700">
            <span className="text-[10px] uppercase tracking-wide opacity-50 text-stone-500">
              Design: {service.design?.name || service.design?.slug || 'default'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// User Result Card Component
const UserResultCard: React.FC<{ user: any; viewMode: ViewMode }> = ({ user, viewMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Resolve theme based on user role or default
  const theme = resolveTheme(user.role?.toLowerCase());
  const themeClasses = getThemeClasses(theme);
  const themeStyles = getThemeStyles(theme);

  const handleClick = () => {
    // User listing - use user's own ID
    if (user.id) {
      navigate(`/listing/${user.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={themeClasses.specialEffects.join(' ')}
    >
      <Card
        className={`h-full ${themeClasses.cardContainer} cursor-pointer border-0 shadow-lg overflow-hidden`}
        onClick={handleClick}
      >
        {/* Hero Section with Gradient */}
        <div
          className="h-24 relative flex items-center px-4"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`,
          }}
        >
          {/* Abstract Pattern Overlay for Users */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/30"></div>
            <div className="absolute bottom-3 right-8 w-10 h-4 rounded-full bg-white/25"></div>
            <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-white/20 transform rotate-45"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex items-center gap-3">
            {/* Use avatar if available, otherwise use theme emoji */}
            {user.profilePic ? (
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30">
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                <span>{theme.emoji}</span>
              </div>
            )}
            <div className="text-white">
              <h3 className="font-bold text-lg truncate max-w-[160px]">
                {user.name}
              </h3>
              <p
                className="text-sm opacity-90 capitalize line-clamp-2"
                style={{ WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)' }}
              >
                {user.role?.toLowerCase() || 'Member'}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          {user.isVerified && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <CardContent className="p-4 bg-white dark:bg-stone-800">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
            {user.bio || t('find.cardLabels.noBioAvailable')}
          </p>

          {/* Rating */}
          {user.stats.averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarDisplay rating={user.stats.averageRating} size="sm" showNumber={false} />
              <span className="text-sm text-stone-500 dark:text-stone-400">
                ({user.stats.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex gap-3 text-sm text-stone-500 dark:text-stone-400">
                {user.stats.totalServices > 0 && (
                  <span>{user.stats.totalServices} {t('find.cardLabels.services')}</span>
                )}
                {user.stats.totalShops > 0 && (
                  <span>{user.stats.totalShops} {t('find.cardLabels.shops')}</span>
                )}
              </div>
              <div className="text-xs text-stone-400">
                {t('find.cardLabels.memberSince')} {new Date(user.createdAt).getFullYear()}
              </div>
            </div>

            <Button
              size="sm"
              className="h-8 px-4"
              style={{ backgroundColor: theme.colors.primary }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle contact action
              }}
            >
              💬 {t('find.actions.contact') || 'Contact'}
            </Button>
          </div>

          {/* Debug: show theme key used for user card */}
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700">
            <span className="text-[10px] uppercase tracking-wide opacity-50 text-stone-500">
              Design: {user.role?.toLowerCase() || 'default'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Product Result Card Component
const ProductResultCard: React.FC<{ product: any; viewMode: ViewMode }> = ({ product, viewMode }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Resolve theme based on design slug
  const theme = resolveTheme(product.design?.slug);
  const themeClasses = getThemeClasses(theme);
  const themeStyles = getThemeStyles(theme);

  const handleClick = () => {
    // Navigate to lister's or shop owner's listing page
    const targetId = product.lister?.id || product.shop?.owner?.id || product.listerId || product.shop?.ownerId;
    if (targetId) {
      navigate(`/listing/${targetId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={themeClasses.specialEffects.join(' ')}
    >
      <Card
        className={`h-full ${themeClasses.cardContainer} cursor-pointer border-0 shadow-lg overflow-hidden`}
        onClick={handleClick}
      >
        {/* Hero Section with Gradient */}
        <div
          className="h-24 relative flex items-center px-4"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient.from}, ${theme.gradient.to})`,
          }}
        >
          {/* Abstract Pattern Overlay for Products */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-3 w-12 h-6 rounded bg-white/30 transform -rotate-12"></div>
            <div className="absolute bottom-1 right-8 w-8 h-8 rounded-full bg-white/25"></div>
            <div className="absolute top-1/2 right-16 w-4 h-8 bg-white/20 rounded transform rotate-45"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              <span>{theme.emoji}</span>
            </div>
            <div className="text-white">
              <h3 className="font-bold text-lg truncate max-w-[160px]">
                {product.name}
              </h3>
              <p
                className="text-sm opacity-90 line-clamp-2"
                style={{ WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)' }}
              >
                {product.shop?.name || product.lister?.name || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          {product.shop?.isVerified && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <CardContent className="p-4 bg-white dark:bg-stone-800">
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2">
            {product.description || t('find.cardLabels.noDescription')}
          </p>

          {/* Bottom Action Area */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-stone-500" />
                <span className="font-bold text-lg text-stone-900 dark:text-white">
                  ${product.price}
                </span>
              </div>
              <div className="text-xs text-stone-400">
                {product.stock > 0 ?
                  `${product.stock} ${t('find.cardLabels.inStock')}` :
                  t('find.cardLabels.outOfStock')
                }
              </div>
            </div>

            <Button
              size="sm"
              className="h-8 px-4"
              style={{ backgroundColor: theme.colors.primary }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle add to cart action
              }}
              disabled={product.stock <= 0}
            >
              🛍️ {product.stock > 0 ? (t('find.actions.addToCart') || 'Add to Cart') : (t('find.actions.outOfStock') || 'Out of Stock')}
            </Button>
          </div>

          {/* Debug: show design name/slug */}
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700">
            <span className="text-[10px] uppercase tracking-wide opacity-50 text-stone-500">
              Design: {product.design?.name || product.design?.slug || 'default'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdvancedSearch;
