import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Phone,
  Store,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { StarDisplay } from '@/components/StarRating';
import { searchShops, handleShopApiError, type Shop } from '../api/shops';
import { cn } from '@/lib/utils';


const ShopsListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(0);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all_cities');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all_categories');
  
  const limit = 12; // Number of shops per page

  // Popular cities (you can fetch this from API)
  const cities = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Khema', 'Port Said',
    'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia', 'Fayyum'
  ];

  // Popular categories (you can fetch this from API)
  const categories = [
    'restaurants', 'beauty-salons', 'auto-repair', 'home-services',
    'medical', 'education', 'retail', 'technology', 'fitness', 'entertainment'
  ];

  useEffect(() => {
    fetchShops();
  }, [page, searchQuery, selectedCity, selectedCategory]);

  useEffect(() => {
    // Update URL parameters when search/filter changes
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [searchQuery, selectedCity, selectedCategory, page, setSearchParams]);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParameters = {
        q: searchQuery || undefined,
        city: selectedCity === 'all_cities' ? undefined : selectedCity || undefined,
        category: selectedCategory === 'all_categories' ? undefined : selectedCategory || undefined,
        page,
        limit
      };

      // Only search if we have at least one search parameter
      if (!searchQuery && !selectedCity && !selectedCategory) {
        // Show a message encouraging users to search
        setShops([]);
        setTotalPages(1);
        setTotalShops(0);
        return;
      }

      const result = await searchShops(searchParameters);
      setShops(result.data);
      setTotalPages(result.pagination.pages);
      setTotalShops(result.pagination.total);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(handleShopApiError(err));
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedCategory, page, limit]);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchShops();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('all_cities');
    setSelectedCategory('all_categories');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFilters = searchQuery || selectedCity || selectedCategory;

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Browse Shops - Daleel Balady</title>
      <meta name="description" content="Discover and browse local shops and businesses in your area. Find services, products, and more." />
      <meta property="og:title" content="Browse Shops - Daleel Balady" />
      <meta property="og:description" content="Discover and browse local shops and businesses in your area." />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Shops</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Browse Shops
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover local businesses and services in your area
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-6 mb-8 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-foreground mb-2 block">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_cities">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleSearch} className="flex-1 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                {hasFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    <Filter className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Info */}
          {hasFilters && (
            <div className="mb-6">
              <p className="text-muted-foreground mb-3">
                {loading ? 'Searching...' : `Found ${totalShops} shops`}
              </p>
              {hasFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCity && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      City: {selectedCity}
                      <button
                        onClick={() => setSelectedCity('')}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Shop Results */}
          {!loading && !error && (
            <>
              {!hasFilters ? (
                <div className="text-center py-16">
                  <Store className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Start Exploring Shops
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Use the search filters above to find shops and businesses in your area
                  </p>
                </div>
              ) : shops.length === 0 ? (
                <div className="text-center py-16">
                  <Store className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    No Shops Found
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Try adjusting your search criteria or browse different categories
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                      <motion.div
                        key={shop.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to={`/shop/${shop.slug}`} className="block">
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6">
                              <div className="flex items-center mb-4">
                                <Avatar className="h-14 w-14 mr-3">
                                  <AvatarImage src={shop.owner.profilePic} alt={shop.name} />
                                  <AvatarFallback className="text-lg font-semibold">
                                    {shop.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-foreground truncate">
                                      {shop.name}
                                    </h3>
                                    {shop.isVerified && (
                                      <CheckCircle className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    by {shop.owner.name}
                                  </p>
                                </div>
                              </div>

                              <p 
                                className="text-sm text-muted-foreground mb-4"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {shop.description || 'No description available'}
                              </p>

                              {shop.stats.averageRating > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                  <StarDisplay 
                                    rating={shop.stats.averageRating} 
                                    size="sm" 
                                    showNumber={false}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    ({shop.stats.totalReviews})
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {shop.city || 'Location not specified'}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {shop.stats.totalServices} services
                                </Badge>
                              </div>

                              {shop.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {shop.phone}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Simple Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopsListing;
