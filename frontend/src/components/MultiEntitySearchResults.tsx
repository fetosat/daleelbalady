import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, MapPin, Phone, User, Building2, Package, Briefcase, 
  Clock, Calendar, ShoppingCart, MessageCircle, Filter, Check, X,
  Heart, Shield, Award, Loader2, ChevronDown, Info
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
// Import new AI components
import CategoryBadge from '@/components/ui/CategoryBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import SearchQualityBadge from '@/components/ui/SearchQualityBadge';
import AvailabilityStatus from '@/components/ui/AvailabilityStatus';
import FilterTagsBadge from '@/components/ui/FilterTagsBadge';

interface MultiEntityResult {
  id: string;
  entityType: 'service' | 'user' | 'shop' | 'product';
  name: string;
  translation?: {
    name_ar?: string;
    name_en?: string;
    description_en?: string;
    description_ar?: string;
  };
  bio?: string; // for users
  description?: string; // for products/shops
  shop?: {
    name?: string;
    description?: string;
    phone?: string;
    city?: string;
  };
  city?: string;
  phone?: string;
  address?: string;
  reviews?: any[];
  reviewsCount?: number;
  avgRating?: number;
  locationLat?: number;
  locationLon?: number;
  isRecommended?: boolean;
  isVerified?: boolean;
  verifiedBadge?: string;
  role?: string; // for users
  price?: number; // for services/products
  currency?: string;
  stock?: number; // for products
  sku?: string; // for products
  design?: { slug?: string };
  // AI-processed metadata
  category?: {
    en: string;
    ar: string;
  };
  priority?: number;
  filterTags?: string[];
  metadata?: {
    specialty?: string;
    availability?: string;
    price?: string;
    isRecommended?: boolean;
    isVerified?: boolean;
    categoryCode?: string;
  };
}

interface MultiEntitySearchResultsProps {
  searchResults: MultiEntityResult[];
  onSelectResult: (result: MultiEntityResult) => void;
  chatQuery: string;
  Message: string;
  onChatQueryChange: (value: string) => void;
  onChatSubmit: () => void;
  dynamicFilters?: Array<{
    id: string;
    name: { en?: string; ar?: string };
    count: number;
    icon?: string;
    order?: number;
  }>;
  processedResults?: any[];
  aiSummary?: {
    totalResults: number;
    primaryType: string;
    topCategories: string[];
    hasRecommended: boolean;
    searchQuality: string;
  };
}

// Entity type configurations with colors and icons
const ENTITY_CONFIGS = {
  service: {
    icon: Briefcase,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-800',
    hoverColor: 'hover:border-blue-300',
    nameAr: 'الخدمات',
    nameEn: 'Services'
  },
  user: {
    icon: User,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600',
    badgeColor: 'bg-green-100 text-green-800',
    hoverColor: 'hover:border-green-300',
    nameAr: 'مقدمو الخدمة',
    nameEn: 'Providers'
  },
  shop: {
    icon: Building2,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-800',
    hoverColor: 'hover:border-purple-300',
    nameAr: 'المتاجر',
    nameEn: 'Shops'
  },
  product: {
    icon: Package,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600',
    badgeColor: 'bg-orange-100 text-orange-800',
    hoverColor: 'hover:border-orange-300',
    nameAr: 'المنتجات',
    nameEn: 'Products'
  }
};

export function MultiEntitySearchResults({
  searchResults,
  onSelectResult,
  chatQuery,
  Message,
  onChatQueryChange,
  onChatSubmit,
  dynamicFilters = [],
  processedResults,
  aiSummary
}: MultiEntitySearchResultsProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedResult, setSelectedResult] = useState<MultiEntityResult | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['all']));
  const [filteredResults, setFilteredResults] = useState<MultiEntityResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const isRTL = i18n.language === 'ar';

  // Debug logging
  const DEBUG = true;
  const LOG_PREFIX = "🎨 MultiEntitySearchResults";

  useEffect(() => {
    console.log({searchResults, dynamicFilters, processedResults, aiSummary});
    if (DEBUG) {
      console.log(`${LOG_PREFIX} 📊 Component initialized with:`, {
        searchResultsCount: searchResults.length,
        dynamicFiltersCount: dynamicFilters.length,
        hasProcessedResults: !!processedResults,
        hasAiSummary: !!aiSummary
      });
    }
  }, []);

  // Build a lookup map for processed results by ID to extract categories and metadata
  const processedById = useMemo(() => {
    const map = new Map<string, any>();
    if (processedResults && Array.isArray(processedResults)) {
      for (const pr of processedResults as any[]) {
        if (pr && pr.id) {
          map.set(pr.id, pr);
        }
      }
    }
    return map;
  }, [processedResults]);

  // Helper: resolve category object for a given result from processedResults or fallback to result.category
  const getProcessedCategory = (result: MultiEntityResult): { en?: string; ar?: string } | null => {
    const pr = processedById.get(result.id);
    // Prefer processedResults.category if present (can be object or string)
    if (pr?.category) {
      if (typeof pr.category === 'string') {
        return { en: pr.category, ar: pr.category };
      }
      return pr.category as { en?: string; ar?: string };
    }
    // Fallback to processedResults.metadata.category if present (can be object or string)
    if (pr?.metadata?.category) {
      const c = pr.metadata.category;
      if (typeof c === 'string') {
        return { en: c, ar: c };
      }
      return c as { en?: string; ar?: string };
    }
    // Final fallback to the original result category if any
    if (result.category) {
      return result.category;
    }
    return null;
  };

  // Helper: get the display category label (localized) or default to entity type name
  const getCategoryLabel = (result: MultiEntityResult, config: typeof ENTITY_CONFIGS[keyof typeof ENTITY_CONFIGS]): string => {
    const cat = getProcessedCategory(result);
    const defaultName = isRTL ? config.nameAr : config.nameEn;
    if (!cat) return defaultName;
    const label = isRTL ? (cat.ar || cat.en) : (cat.en || cat.ar);
    return label || defaultName;
  };

  // Filter results based on active filters
  useEffect(() => {
    let filtered = searchResults;

    if (!activeFilters.has('all')) {
      filtered = searchResults.filter(result => {
        console.log(`\ud83d\udd0d Filtering result:`, {
          id: result.id,
          entityType: result.entityType,
          name: result.name,
          translationName: result.translation?.name_ar || result.translation?.name_en,
          filterTags: result.filterTags,
          activeFilters: Array.from(activeFilters)
        });
        
        // Check if result has AI filterTags and matches any active filter
        if (result.filterTags && Array.isArray(result.filterTags)) {
          for (const activeFilter of activeFilters) {
            if (result.filterTags.includes(activeFilter)) {
              console.log(`\u2705 Match found via filterTags:`, activeFilter);
              return true;
            }
          }
        }
        
        // Check entity type filters (handle both English and Arabic)
        const entityType = result.entityType;
        for (const filter of activeFilters) {
          // Check for direct entity type match
          if (filter === `${entityType}s` || filter === entityType) {
            console.log(`\u2705 Entity type match:`, filter, entityType);
            return true;
          }
          
          // Check for Arabic entity names
          if ((filter === 'أطباء' || filter === 'doctors') && entityType === 'user') {
            console.log(`\u2705 Arabic doctors match`);
            return true;
          }
          if ((filter === 'خدمات' || filter === 'services') && entityType === 'service') {
            console.log(`\u2705 Arabic services match`);
            return true;
          }
          if ((filter === 'متاجر' || filter === 'shops') && entityType === 'shop') {
            console.log(`\u2705 Arabic shops match`);
            return true;
          }
          if ((filter === 'منتجات' || filter === 'products') && entityType === 'product') {
            console.log(`\u2705 Arabic products match`);
            return true;
          }
        }
        
        // Check other dynamic filters
        return Array.from(activeFilters).some(filter => {
          // Quality filters
          if (filter === 'recommended' && result.isRecommended) {
            console.log(`\u2705 Recommended match`);
            return true;
          }
          if (filter === 'verified' && result.isVerified) {
            console.log(`\u2705 Verified match`);
            return true;
          }
          if (filter === 'top_rated' && (result.avgRating || 0) >= 4.5) {
            console.log(`\u2705 Top rated match`);
            return true;
          }
          
          // Category filters (enhanced matching)
          const displayName = result.translation?.name_ar || result.translation?.name_en || result.name || '';
          const displayDesc = result.translation?.description_ar || result.translation?.description_en || result.bio || result.description || '';
          
          if ((filter === 'medical' || filter === 'طبي') && (
            displayName.toLowerCase().includes('doctor') ||
            displayName.includes('طبيب') ||
            displayName.toLowerCase().includes('clinic') ||
            displayName.includes('عيادة') ||
            displayDesc.toLowerCase().includes('medical') ||
            displayDesc.includes('طبية') ||
            result.design?.slug === 'medical'
          )) {
            console.log(`\u2705 Medical match`);
            return true;
          }
          
          // Specialty filters (like internal medicine / باطنة)
          if ((filter === 'internal medicine' || filter === 'باطنة') && (
            displayName.toLowerCase().includes('internal medicine') ||
            displayName.includes('باطنة') ||
            displayDesc.toLowerCase().includes('internal medicine') ||
            displayDesc.includes('باطنة')
          )) {
            console.log(`\u2705 Internal medicine match`);
            return true;
          }
          
          // Generic matching against names and descriptions
          if (displayName.toLowerCase().includes(filter.toLowerCase()) ||
              displayDesc.toLowerCase().includes(filter.toLowerCase())) {
            console.log(`\u2705 Generic match:`, filter);
            return true;
          }

          return false;
        });
      });
    }

    setFilteredResults(filtered);

    if (DEBUG) {
      console.log(`${LOG_PREFIX} 🔽 Filtered results:`, {
        total: searchResults.length,
        filtered: filtered.length,
        activeFilters: Array.from(activeFilters)
      });
    }
  }, [searchResults, activeFilters]);

  // Get entity statistics
  const entityStats = {
    services: searchResults.filter(r => r.entityType === 'service').length,
    users: searchResults.filter(r => r.entityType === 'user').length,
    shops: searchResults.filter(r => r.entityType === 'shop').length,
    products: searchResults.filter(r => r.entityType === 'product').length,
  };

  const handleCardClick = (result: MultiEntityResult) => {
    console.log(`${LOG_PREFIX} 🎯 Card clicked:`, result);
    setSelectedResult(result);
    onSelectResult(result);
    
    // Navigate to appropriate page based on entity type
    if (result.entityType === 'user') {
      navigate(`/user/${result.id}`);
    } else if (result.entityType === 'service') {
      navigate(`/service/${result.id}`);
    } else if (result.entityType === 'shop') {
      // For now, we can show a placeholder or navigate to shop page when ready
      console.log('Shop navigation not yet implemented');
    } else if (result.entityType === 'product') {
      // For now, we can show a placeholder or navigate to product page when ready
      console.log('Product navigation not yet implemented');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && chatQuery.trim()) {
      console.log(`${LOG_PREFIX} 🚀 Chat query submitted:`, chatQuery);
      onChatSubmit();
    }
  };

  const toggleFilter = (filterId: string) => {
    const newFilters = new Set(activeFilters);
    
    if (filterId === 'all') {
      setActiveFilters(new Set(['all']));
    } else {
      newFilters.delete('all'); // Remove 'all' when selecting specific filters
      
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      
      // If no filters selected, default to 'all'
      if (newFilters.size === 0) {
        newFilters.add('all');
      }
      
      setActiveFilters(newFilters);
    }
  };

  // Get display name for result
  const getDisplayName = (result: MultiEntityResult): string => {
    if (result.translation) {
      return isRTL ? result.translation.name_ar : result.translation.name_en;
    }
    return result.name;
  };

  // Get display description for result
  const getDisplayDescription = (result: MultiEntityResult): string => {
    switch (result.entityType) {
      case 'service':
        return isRTL ? result.translation?.description_ar : result.translation?.description_en;
      case 'user':
        return result.bio;
      case 'shop':
      case 'product':
        return result.description || result.shop?.description;
      default:
        return '';
    }
  };

  // Get entity-specific action buttons
  const getActionButtons = (result: MultiEntityResult) => {
    const config = ENTITY_CONFIGS[result.entityType];
    
    switch (result.entityType) {
      case 'service':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-1" />
              {isRTL ? 'احجز الآن' : 'Book Now'}
            </Button>
            {result.phone && (
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
        
      case 'user':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-1" />
              {isRTL ? 'تواصل' : 'Contact'}
            </Button>
            <Button size="sm" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        );
        
      case 'shop':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <Building2 className="h-4 w-4 mr-1" />
              {isRTL ? 'زيارة المتجر' : 'Visit Shop'}
            </Button>
            {result.phone && (
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
        
      case 'product':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-1" />
              {isRTL ? 'أضف للسلة' : 'Add to Cart'}
            </Button>
            <Button size="sm" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (searchResults.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-24 px-6 flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-text-muted text-lg">
            {isRTL ? 'لم يتم العثور على نتائج' : 'No results found'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-24 px-6 pb-32"
    >
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with AI message and quality indicator */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl font-bold text-text-primary">
              {Message}
            </h2>
            {/* AI Search Quality Indicator */}
            {aiSummary?.searchQuality && (
              <SearchQualityBadge 
                quality={aiSummary.searchQuality}
                size="md"
              />
            )}
          </div>
          
          {/* Top Categories from AI Summary */}
          {aiSummary?.topCategories && aiSummary.topCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="text-sm text-text-muted">
                {isRTL ? 'الفئات الرئيسية:' : 'Top Categories:'}
              </span>
              {aiSummary.topCategories.slice(0, 3).map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Entity type statistics */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {Object.entries(entityStats).map(([type, count]) => {
              if (count === 0) return null;
              const singular = (type as string).replace(/s$/, '') as keyof typeof ENTITY_CONFIGS;
              const config = ENTITY_CONFIGS[singular];
              if (!config) return null;
              const Icon = config.icon;
              
              return (
                <div key={type} className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                  <Icon className={`h-4 w-4 ${config.textColor}`} />
                  <span className={`font-semibold ${config.textColor}`}>
                    {count}
                  </span>
                  <span className="text-sm text-stone-600">
                    {isRTL ? config.nameAr : config.nameEn}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {/* All filter */}
            <Button
              variant={activeFilters.has('all') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFilter('all')}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {isRTL ? 'الكل' : 'All'} ({searchResults.length})
            </Button>

            {/* Entity type filters */}
            {Object.entries(entityStats).map(([type, count]) => {
              if (count === 0) return null;
              const singular = (type as string).replace(/s$/, '') as keyof typeof ENTITY_CONFIGS;
              const config = ENTITY_CONFIGS[singular];
              if (!config) return null;
              const Icon = config.icon;
              const filterId = type as string; // keep plural for filter state
              
              return (
                <Button
                  key={type}
                  variant={activeFilters.has(filterId) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleFilter(filterId)}
                  className={`flex items-center gap-2 ${activeFilters.has(filterId) ? config.badgeColor : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {isRTL ? config.nameAr : config.nameEn} ({count})
                </Button>
              );
            })}

            {/* Dynamic filters from AI */}
            {dynamicFilters.slice(0, 5).map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilters.has(filter.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="flex items-center gap-2"
              >
                {filter.icon && <span className="text-sm">{filter.icon}</span>}
                {isRTL ? filter.name?.ar : filter.name?.en} ({filter.count})
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {filteredResults.map((result, index) => {
            const config = ENTITY_CONFIGS[result.entityType];
            const Icon = config.icon;
            const defaultTypeName = isRTL ? config.nameAr : config.nameEn;
            const resolvedCategory = getProcessedCategory(result);
            const categoryLabel = resolvedCategory 
              ? (isRTL ? (resolvedCategory.ar || resolvedCategory.en) : (resolvedCategory.en || resolvedCategory.ar))
              : defaultTypeName;

            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.1 * index,
                  duration: 0.5,
                  ease: "easeOut"
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => handleCardClick(result)}
              >
                <Card className={`h-full bg-background ${config.borderColor} ${config.hoverColor} border transition-all duration-300 ${
                  result.isRecommended ? `ring-2 ring-${config.color}-200` : ''
                } ${
                  result.priority && result.priority >= 8 ? 'shadow-lg' : ''
                }`}>
                  <CardContent className="p-6">
                    {/* Enhanced Header with entity type, badges, and AI category */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          
                          
                          {/* AI Category Badge - only show if we don't have specific category in text above */}
                          {resolvedCategory && categoryLabel !== defaultTypeName && (resolvedCategory.en || resolvedCategory.ar) && (
                            <CategoryBadge 
                              category={{
                                en: resolvedCategory.en || resolvedCategory.ar || defaultTypeName,
                                ar: resolvedCategory.ar || resolvedCategory.en || defaultTypeName
                              }} 
                              size="sm"
                            />
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-text-primary mb-1">
                          {getDisplayName(result)}
                        </h3>
                        
                        {/* AI Specialty Information */}
                        {result.metadata?.specialty && (
                          <p className="text-sm font-medium text-text-primary mb-1">
                            <Info className="h-3 w-3 inline mr-1" />
                            {result.metadata.specialty}
                          </p>
                        )}
                        
                        {getDisplayDescription(result) && (
                          <p className="text-text-secondary text-sm line-clamp-2">
                            {getDisplayDescription(result)}
                          </p>
                        )}
                        
                        {/* Filter Tags Display */}
                        {result.filterTags && result.filterTags.length > 0 && (
                          <div className="mt-2">
                            <FilterTagsBadge 
                              filterTags={result.filterTags}
                              maxDisplay={3}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 ml-4">
                        {/* Enhanced Recommendation Badge */}
                        {result.isRecommended && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                          >
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              {isRTL ? 'موصى به' : 'Recommended'}
                            </Badge>
                          </motion.div>
                        )}
                        
                        {result.isVerified && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            {isRTL ? 'موثق' : 'Verified'}
                          </Badge>
                        )}
                        
                        {/* Availability Status */}
                        {result.metadata?.availability && (
                          <AvailabilityStatus 
                            availability={result.metadata.availability}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* Content based on entity type */}
                    <div className="space-y-3 mb-4">
                      {/* Rating */}
                      {result.avgRating !== undefined && result.avgRating > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className={`h-4 w-4 fill-current ${config.textColor}`} />
                          <span className="font-semibold">{result.avgRating}</span>
                          <span className="text-text-muted text-sm">
                            ({result.reviewsCount || 0})
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      {(result.city || result.address) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-text-muted" />
                          <span className="text-text-secondary text-sm">
                            {result.city || result.address}
                          </span>
                        </div>
                      )}

                      {/* Entity-specific info */}
                      {result.entityType === 'user' && result.role && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-text-muted" />
                          <span className="text-text-secondary text-sm capitalize">
                            {result.role}
                          </span>
                        </div>
                      )}

                      {result.entityType === 'product' && (
                        <div className="flex items-center justify-between">
                          {result.price && (
                            <span className="font-semibold text-lg">
                              {result.price} {result.currency || 'EGP'}
                            </span>
                          )}
                          {result.stock !== undefined && (
                            <span className="text-sm text-text-muted">
                              {isRTL ? 'متوفر:' : 'Stock:'} {result.stock}
                            </span>
                          )}
                        </div>
                      )}

                      {result.entityType === 'service' && result.price && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {isRTL ? 'من' : 'From'} {result.price} {result.currency || 'EGP'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Priority and Action buttons */}
                    <div className="mt-4 space-y-3">
                      {/* Priority Indicator */}
                      {result.priority && (
                        <div className="flex items-center justify-between">
                          <PriorityIndicator 
                            priority={result.priority}
                            variant="bars"
                            size="sm"
                            showLabel={true}
                          />
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div>
                        {getActionButtons(result)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}
