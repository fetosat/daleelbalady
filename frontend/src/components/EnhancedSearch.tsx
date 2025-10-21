import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  SlidersHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarDisplay } from '@/components/StarRating';

// Import APIs for both shop-based and independent listings
import { searchShops, handleShopApiError, type Shop } from '@/api/shops';
import { 
  searchIndependentServices, 
  searchIndependentProducts, 
  handleUserListingsError,
  type IndependentService,
  type IndependentProduct 
} from '@/api/userListings';

interface EnhancedSearchProps {
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string;
}

type SearchResultType = 'all' | 'shops' | 'services' | 'products';
type ViewMode = 'grid' | 'list';

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  initialQuery = '',
  initialCity = '',
  initialCategory = ''
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState<string>('all_cities');
  const [selectedCategory, setSelectedCategory] = useState<string>('all_categories');
  const [searchType, setSearchType] = useState<SearchResultType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Results state
  const [shops, setShops] = useState<Shop[]>([]);
  const [independentServices, setIndependentServices] = useState<IndependentService[]>([]);
  const [independentProducts, setIndependentProducts] = useState<IndependentProduct[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const limit = 12;

  // Popular cities and categories
  const cities = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Khema', 'Port Said',
    'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia', 'Fayyum'
  ];

  const categories = [
    'restaurants', 'beauty-salons', 'auto-repair', 'home-services',
    'medical', 'education', 'retail', 'technology', 'fitness', 'entertainment'
  ];

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCity, selectedCategory, searchType, page]);

  useEffect(() => {
    // Update URL parameters when search changes
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchType !== 'all') params.set('type', searchType);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  }, [searchQuery, selectedCity, selectedCategory, searchType, page, setSearchParams]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery && (selectedCity === 'all_cities' || !selectedCity) && (selectedCategory === 'all_categories' || !selectedCategory)) {
      setShops([]);
      setIndependentServices([]);
      setIndependentProducts([]);
      return;
    }

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

      // Parallel searches based on search type
      const promises: Promise<any>[] = [];

      if (searchType === 'all' || searchType === 'shops') {
        promises.push(
          searchShops(searchParameters).catch(err => ({ type: 'shops', error: err }))
        );
      }

      if (searchType === 'all' || searchType === 'services') {
        promises.push(
          searchIndependentServices(searchParameters).catch(err => ({ type: 'services', error: err }))
        );
      }

      if (searchType === 'all' || searchType === 'products') {
        promises.push(
          searchIndependentProducts({
            q: searchParameters.q,
            page: searchParameters.page,
            limit: searchParameters.limit
          }).catch(err => ({ type: 'products', error: err }))
        );
      }

      const results = await Promise.all(promises);

      // Process results
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Search error for ${result.type}:`, result.error);
          return;
        }

        if (searchType === 'all') {
          if (index === 0 && result.data) { // shops
            setShops(page === 1 ? result.data : (prev) => [...prev, ...result.data]);
          } else if (index === 1 && result.data) { // services
            setIndependentServices(page === 1 ? result.data : (prev) => [...prev, ...result.data]);
          } else if (index === 2 && result.data) { // products
            setIndependentProducts(page === 1 ? result.data : (prev) => [...prev, ...result.data]);
          }
        } else if (searchType === 'shops' && result.data) {
          setShops(page === 1 ? result.data : (prev) => [...prev, ...result.data]);
        } else if (searchType === 'services' && result.data) {
          setIndependentServices(page === 1 ? result.data : (prev) => [...prev, ...result.data]);
        } else if (searchType === 'products' && result.data) {
          setIndependentProducts(page === 1 ? result.data : (prev) => [...prev, ...result.data]);
        }
      });

      setHasMore(results.some(result => result.pagination?.pages > page));

    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedCategory, searchType, page, limit]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('all_cities');
    setSelectedCategory('all_categories');
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const getTotalResults = () => {
    return shops.length + independentServices.length + independentProducts.length;
  };

  return (
    <>
      <title>Search - Daleel Balady</title>
      <meta name="description" content="Search for shops, services, and products in your area." />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          
          {/* Search Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Search Everything
                </h1>
                <p className="text-muted-foreground text-lg">
                  Find shops, independent services, and products all in one place
                </p>
              </div>
              <Link to="/search/advanced">
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Search
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 rounded-2xl p-6 mb-8 border border-border/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
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
              
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <Select value={searchType} onValueChange={(value) => setSearchType(value as SearchResultType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="shops">Shops Only</SelectItem>
                    <SelectItem value="services">Services Only</SelectItem>
                    <SelectItem value="products">Products Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={() => { setPage(1); handleSearch(); }} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                {(searchQuery || selectedCity || selectedCategory) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Results Header */}
          {(searchQuery || selectedCity || selectedCategory) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-muted-foreground">
                    {loading ? 'Searching...' : `Found ${getTotalResults()} results`}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchQuery && (
                      <Badge variant="secondary">Search: "{searchQuery}"</Badge>
                    )}
                    {selectedCity && (
                      <Badge variant="secondary">City: {selectedCity}</Badge>
                    )}
                    {selectedCategory && (
                      <Badge variant="secondary">Category: {selectedCategory}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
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

          {/* Results Tabs */}
          {(searchQuery || selectedCity || selectedCategory) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs value="results" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="results" className="flex items-center gap-2">
                    All ({getTotalResults()})
                  </TabsTrigger>
                  <TabsTrigger value="shops" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Shops ({shops.length})
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Services ({independentServices.length})
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Products ({independentProducts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="results">
                  {/* All Results Mixed */}
                  {getTotalResults() === 0 && !loading ? (
                    <div className="text-center py-12">
                      <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search terms or filters
                      </p>
                      <Button onClick={handleClearFilters} variant="outline">
                        Clear All Filters
                      </Button>
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {/* Render shops */}
                      {shops.map((shop) => (
                        <ShopResultCard key={`shop-${shop.id}`} shop={shop} viewMode={viewMode} />
                      ))}
                      
                      {/* Render independent services */}
                      {independentServices.map((service) => (
                        <ServiceResultCard key={`service-${service.id}`} service={service} viewMode={viewMode} />
                      ))}
                      
                      {/* Render independent products */}
                      {independentProducts.map((product) => (
                        <ProductResultCard key={`product-${product.id}`} product={product} viewMode={viewMode} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="shops">
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {shops.map((shop) => (
                      <ShopResultCard key={shop.id} shop={shop} viewMode={viewMode} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="services">
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {independentServices.map((service) => (
                      <ServiceResultCard key={service.id} service={service} viewMode={viewMode} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="products">
                  <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {independentProducts.map((product) => (
                      <ProductResultCard key={product.id} product={product} viewMode={viewMode} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Load More */}
              {hasMore && getTotalResults() > 0 && (
                <div className="flex justify-center mt-8">
                  <Button onClick={handleLoadMore} disabled={loading}>
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Getting Started */}
          {!searchQuery && !selectedCity && !selectedCategory && (
            <div className="text-center py-16">
              <Search className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Search Everything in One Place
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Find shops, independent services, and products all in one comprehensive search
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Component for rendering shop results
const ShopResultCard: React.FC<{ shop: Shop; viewMode: ViewMode }> = ({ shop, viewMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
            <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{shop.name}</h3>
              {shop.isVerified && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
              <Badge variant="outline" className="text-xs">Shop</Badge>
            </div>
            <p className="text-sm text-muted-foreground">by {shop.owner.name}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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

        <div className="flex items-center justify-between">
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
      </CardContent>
    </Card>
  </motion.div>
);

// Component for rendering independent service results
const ServiceResultCard: React.FC<{ service: IndependentService; viewMode: ViewMode }> = ({ service, viewMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={service.ownerUser.profilePic} />
            <AvatarFallback>{service.ownerUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">
                {service.translation?.name_en || 'Unnamed Service'}
              </h3>
              {service.ownerUser.isVerified && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
              <Badge variant="secondary" className="text-xs">Independent</Badge>
            </div>
            <p className="text-sm text-muted-foreground">by {service.ownerUser.name}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {service.translation?.description_en || 'No description available'}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {service.price && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ${service.price}
            </div>
          )}
          {service.durationMins && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {service.durationMins}min
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {service.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{service.city}</span>
            </div>
          )}
          <Badge variant={service.available ? "default" : "secondary"}>
            {service.available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Component for rendering independent product results
const ProductResultCard: React.FC<{ product: IndependentProduct; viewMode: ViewMode }> = ({ product, viewMode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={product.ownerUser.profilePic} />
            <AvatarFallback>{product.ownerUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              {product.ownerUser.isVerified && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
              <Badge variant="secondary" className="text-xs">Independent</Badge>
            </div>
            <p className="text-sm text-muted-foreground">by {product.ownerUser.name}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">${product.price}</span>
          </div>
          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default EnhancedSearch;
