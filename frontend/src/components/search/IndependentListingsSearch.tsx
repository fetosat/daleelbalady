import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  MapPin,
  DollarSign,
  Star,
  Clock,
  Package,
  Wrench as Service,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/components/ui/use-toast';
import {
  searchUserListings,
  handleUserListingsError,
  type IndependentService,
  type IndependentProduct,
  type SearchParams
} from '@/api/userListings';

interface SearchFilters {
  query: string;
  type: 'all' | 'service' | 'product';
  priceRange: [number, number];
  location: string;
  availability: 'all' | 'available' | 'unavailable';
  tags: string[];
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating';
}

interface IndependentListingsSearchProps {
  onResults?: (results: { services: IndependentService[]; products: IndependentProduct[] }) => void;
  showFilters?: boolean;
  className?: string;
}

const IndependentListingsSearch: React.FC<IndependentListingsSearchProps> = ({
  onResults,
  showFilters = true,
  className = ''
}) => {
  const { toast } = useToast();
  
  // Search state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    priceRange: [0, 1000],
    location: '',
    availability: 'all',
    tags: [],
    sortBy: 'relevance'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ services: IndependentService[]; products: IndependentProduct[] }>({
    services: [],
    products: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Popular locations and tags
  const popularLocations = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Khema', 'Port Said',
    'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta'
  ];

  const popularTags = [
    'repair', 'maintenance', 'consultation', 'delivery', 'installation',
    'handmade', 'custom', 'urgent', 'professional', 'certified'
  ];

  // Search function (not debounced directly)
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    if (!searchFilters.query.trim() && searchFilters.type === 'all') {
      setResults({ services: [], products: [] });
      return;
    }

    try {
      setIsSearching(true);

      const searchParams: SearchParams = {
        query: searchFilters.query,
        type: searchFilters.type === 'all' ? undefined : searchFilters.type,
        minPrice: searchFilters.priceRange[0],
        maxPrice: searchFilters.priceRange[1],
        location: searchFilters.location || undefined,
        available: searchFilters.availability === 'all' ? undefined : searchFilters.availability === 'available',
        tags: searchFilters.tags.length > 0 ? searchFilters.tags : undefined,
        sortBy: searchFilters.sortBy === 'relevance' ? undefined : searchFilters.sortBy,
        limit: 20
      };

      const searchResults = await searchUserListings(searchParams);
      setResults(searchResults);
      onResults?.(searchResults);
    } catch (err: any) {
      toast({
        title: "Search Error",
        description: handleUserListingsError(err),
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [onResults, toast]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
    [performSearch]
  );

  // Effect to trigger search when filters change
  useEffect(() => {
    debouncedSearch(filters);
  }, [filters, debouncedSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      handleFilterChange('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleFilterChange('tags', filters.tags.filter(t => t !== tag));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      priceRange: [0, 1000],
      location: '',
      availability: 'all',
      tags: [],
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.location !== '' || 
    filters.availability !== 'all' || filters.tags.length > 0 || 
    filters.sortBy !== 'relevance' || filters.priceRange[0] > 0 || filters.priceRange[1] < 1000;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services and products..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-10"
              />
            </div>
            
            {showFilters && (
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.tags.length + (filters.type !== 'all' ? 1 : 0) + (filters.location !== '' ? 1 : 0) + (filters.availability !== 'all' ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filters.type === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('type', 'all')}
            >
              All
            </Button>
            <Button
              variant={filters.type === 'service' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('type', 'service')}
              className="flex items-center gap-1"
            >
              <Service className="h-3 w-3" />
              Services
            </Button>
            <Button
              variant={filters.type === 'product' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('type', 'product')}
              className="flex items-center gap-1"
            >
              <Package className="h-3 w-3" />
              Products
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price Range (EGP)
                    </Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange('priceRange', value)}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{filters.priceRange[0]} EGP</span>
                        <span>{filters.priceRange[1]} EGP</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any location</SelectItem>
                        {popularLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability */}
                  <div className="space-y-3">
                    <Label>Availability</Label>
                    <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All listings</SelectItem>
                        <SelectItem value="available">Available only</SelectItem>
                        <SelectItem value="unavailable">Unavailable only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="default" className="flex items-center gap-1">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-3">
                  <Label>Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Summary */}
      {(filters.query || hasActiveFilters) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Found {results.services.length + results.products.length} listings
                    </span>
                    {results.services.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Service className="h-3 w-3" />
                        {results.services.length} services
                      </span>
                    )}
                    {results.products.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {results.products.length} products
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default IndependentListingsSearch;
