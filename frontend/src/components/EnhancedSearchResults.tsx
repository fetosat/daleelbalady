import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MapPin, Phone, Clock, Calendar, ShoppingCart, MessageCircle, 
  Loader2, Filter, ChevronDown, Check, X, Share2, Eye, 
  Users, Building2, Package, Briefcase, Heart, Shield, Award
} from 'lucide-react';
import { searchSocket } from '@/services/searchSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Import AI components
import CategoryBadge from '@/components/ui/CategoryBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import SearchQualityBadge from '@/components/ui/SearchQualityBadge';
import AvailabilityStatus from '@/components/ui/AvailabilityStatus';
import FilterTagsBadge from '@/components/ui/FilterTagsBadge';

// Types for processed results and filters
interface ProcessedResult {
  id: string;
  type: 'service' | 'user' | 'shop' | 'product';
  name: string;
  description: string;
  location: {
    city?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  rating: {
    average: number;
    count: number;
    stars: number;
  };
  filterTags: string[];
  priority: number;
  metadata: {
    specialty?: string;
    category?: string;
    price?: string;
    availability?: string;
    isRecommended?: boolean;
    isVerified?: boolean;
    categoryCode?: string;
  };
  category?: {
    en: string;
    ar: string;
  };
}

interface DynamicFilter {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  count: number;
  icon: string;
  order?: number;
}

interface AISearchSummary {
  totalResults: number;
  primaryType: string;
  topCategories: string[];
  hasRecommended: boolean;
  searchQuality: string;
}

interface EnhancedSearchResultsProps {
  onSelectResult: (result: any) => void;
  chatQuery: string;
  onChatQueryChange: (value: string) => void;
  onChatSubmit: () => void;
  cacheInfo?: { id?: string; shareUrl?: string } | null;
}

export function EnhancedSearchResults({
  onSelectResult,
  chatQuery,
  onChatQueryChange,
  onChatSubmit,
  cacheInfo
}: EnhancedSearchResultsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // States for processed results and filters
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([]);
  const [aiSummary, setAiSummary] = useState<AISearchSummary | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['all']));
  const [filteredResults, setFilteredResults] = useState<ProcessedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Debug logging
  const DEBUG = true;
  const LOG_PREFIX = "🔍 EnhancedSearchResults";

  // Listen for search results with processed data
  useEffect(() => {
    const unsubscribe = searchSocket.onSearchResults((apiResults) => {
      if (DEBUG) {
        console.log(`${LOG_PREFIX} 📥 Received search results:`, apiResults);
      }

      setIsLoading(false);

      // Handle enhanced results with AI processing
      if (apiResults && typeof apiResults === 'object' && 'processedResults' in apiResults) {
        const enhancedResults = apiResults as {
          processedResults?: ProcessedResult[];
          dynamicFilters?: DynamicFilter[];
          aiSummary?: AISearchSummary;
        };
        
        if (DEBUG) {
          console.log(`${LOG_PREFIX} ✅ Processing AI-enhanced results`);
          console.log(`${LOG_PREFIX} 📊 Processed results:`, enhancedResults.processedResults?.length || 0);
          console.log(`${LOG_PREFIX} 🏷️ Dynamic filters:`, enhancedResults.dynamicFilters?.length || 0);
          console.log(`${LOG_PREFIX} 📋 AI summary:`, enhancedResults.aiSummary);
        }

        // Set processed results
        if (enhancedResults.processedResults) {
          setProcessedResults(enhancedResults.processedResults);
        }

        // Set dynamic filters
        if (enhancedResults.dynamicFilters) {
          setDynamicFilters(enhancedResults.dynamicFilters);
          // Reset active filters to 'all'
          setActiveFilters(new Set(['all']));
        }

        // Set AI summary
        if (enhancedResults.aiSummary) {
          setAiSummary(enhancedResults.aiSummary);
          const totalResults = enhancedResults.aiSummary.totalResults || 0;
          setAiResponse(
            isRTL 
              ? `تم العثور على ${totalResults} نتيجة مع فلاتر ذكية`
              : `Found ${totalResults} results with smart filters`
          );
        }
      }
      // Handle legacy format as fallback
      else if (apiResults && (Array.isArray(apiResults) || 'results' in apiResults)) {
        if (DEBUG) {
          console.log(`${LOG_PREFIX} 🔄 Processing legacy results format`);
        }
        
        const results = Array.isArray(apiResults) ? apiResults : apiResults.results || [];
        
        // Convert legacy results to processed format
        const converted: ProcessedResult[] = results.map((result: any, index: number) => ({
          id: result.id || String(index),
          type: determineResultType(result),
          name: result.translation?.name_en || result.translation?.name_ar || result.shop?.name || result.name || 'Unknown',
          description: result.translation?.description_en || result.translation?.description_ar || result.shop?.description || '',
          location: {
            city: result.city || result.shop?.city || '',
            address: result.address || result.shop?.address || '',
            coordinates: result.locationLat && result.locationLon ? {
              lat: result.locationLat,
              lon: result.locationLon
            } : undefined
          },
          contact: {
            phone: result.phone || result.shop?.phone || '',
            email: '',
            website: ''
          },
          rating: {
            average: result.avgRating || 0,
            count: result.reviewsCount || 0,
            stars: Math.round(result.avgRating || 0)
          },
          filterTags: ['all', determineResultType(result)],
          priority: result.isRecommended ? 8 : 5,
          metadata: {
            isRecommended: result.isRecommended || false,
            isVerified: result.isVerified || false,
            category: determineResultType(result)
          }
        }));

        setProcessedResults(converted);
        
        // Create basic filters
        const basicFilters = createBasicFilters(converted, isRTL);
        setDynamicFilters(basicFilters);
        setActiveFilters(new Set(['all']));
        
        setAiResponse(
          isRTL 
            ? `تم العثور على ${converted.length} نتيجة`
            : `Found ${converted.length} results`
        );
      }
    });

    // Listen for AI messages
    const unsubscribeAI = searchSocket.onAiMessage((response) => {
      if (response && response.function === "reply_to_user" && response.parameters?.message) {
        setAiResponse(response.parameters.message);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAI();
    };
  }, [isRTL]);

  // Filter results based on active filters
  useEffect(() => {
    if (activeFilters.has('all')) {
      setFilteredResults(processedResults);
    } else {
      const filtered = processedResults.filter(result => 
        result.filterTags.some(tag => activeFilters.has(tag))
      );
      setFilteredResults(filtered);
    }
  }, [processedResults, activeFilters]);

  // Handle filter toggle
  const toggleFilter = (filterId: string) => {
    const newActiveFilters = new Set(activeFilters);
    
    if (filterId === 'all') {
      // If clicking 'all', clear others and set only 'all'
      setActiveFilters(new Set(['all']));
    } else {
      // Remove 'all' when selecting specific filters
      newActiveFilters.delete('all');
      
      if (newActiveFilters.has(filterId)) {
        newActiveFilters.delete(filterId);
        // If no filters left, default to 'all'
        if (newActiveFilters.size === 0) {
          newActiveFilters.add('all');
        }
      } else {
        newActiveFilters.add(filterId);
      }
      
      setActiveFilters(newActiveFilters);
    }
  };

  // Handle search submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && chatQuery.trim()) {
      setIsLoading(true);
      setProcessedResults([]);
      setDynamicFilters([]);
      setAiSummary(null);
      searchSocket.sendMessage(chatQuery);
      onChatSubmit();
    }
  };

  // Handle result selection
  const handleResultClick = (result: ProcessedResult) => {
    onSelectResult(result);
  };

  // Get filter icon component
  const getFilterIcon = (icon: string) => {
    const iconMap: { [key: string]: any } = {
      '🔍': Eye,
      '👤': Users,
      '🏥': Building2,
      '🏪': Building2,
      '📦': Package,
      '💼': Briefcase,
      '⭐': Star,
      '🛡️': Shield,
      '❤️': Heart
    };
    
    const IconComponent = iconMap[icon];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <span>{icon}</span>;
  };

  // Determine result type from legacy data
  const determineResultType = (result: any): 'service' | 'user' | 'shop' | 'product' => {
    if (result.ownerUser && !result.shop) return 'user';
    if (result.shop?.name) return 'shop';
    if (result.price && (result.sku || result.stock !== undefined)) return 'product';
    return 'service';
  };

  // Create basic filters for legacy results
  const createBasicFilters = (results: ProcessedResult[], isRTL: boolean): DynamicFilter[] => {
    const filters: DynamicFilter[] = [{
      id: 'all',
      name: { en: 'All', ar: 'الكل' },
      count: results.length,
      icon: '🔍',
      order: 0
    }];

    const types = ['service', 'user', 'shop', 'product'] as const;
    const typeNames = {
      service: { en: 'Services', ar: 'الخدمات' },
      user: { en: 'People', ar: 'الأشخاص' },
      shop: { en: 'Shops', ar: 'المتاجر' },
      product: { en: 'Products', ar: 'المنتجات' }
    };
    const typeIcons = {
      service: '🏥',
      user: '👤',
      shop: '🏪',
      product: '📦'
    };

    types.forEach((type, index) => {
      const count = results.filter(r => r.type === type).length;
      if (count > 0) {
        filters.push({
          id: type,
          name: typeNames[type],
          count,
          icon: typeIcons[type],
          order: index + 1
        });
      }
    });

    return filters;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced AI Response */}
        {aiResponse && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 p-6 bg-gradient-to-r from-green-subtle via-background-secondary to-green-subtle rounded-xl border border-green-primary/20 shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-text-primary font-medium text-lg">{aiResponse}</p>
              {aiSummary?.searchQuality && (
                <SearchQualityBadge 
                  quality={aiSummary.searchQuality}
                  size="md"
                />
              )}
            </div>
            
            {aiSummary && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {/* Primary Type */}
                {aiSummary.primaryType && (
                  <Badge variant="secondary" className="capitalize">
                    {isRTL ? 'النوع الأساسي:' : 'Primary:'} {aiSummary.primaryType}
                  </Badge>
                )}
                
                {/* Top Categories */}
                {aiSummary.topCategories && aiSummary.topCategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-secondary">
                      {isRTL ? 'الفئات:' : 'Categories:'}
                    </span>
                    {aiSummary.topCategories.slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Recommended Available */}
                {aiSummary.hasRecommended && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    {isRTL ? 'يتوفر موصى به' : 'Recommended Available'}
                  </Badge>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-primary" />
            <p className="text-text-secondary">
              {isRTL ? 'جاري البحث والمعالجة بالذكاء الاصطناعي...' : 'Searching and processing with AI...'}
            </p>
          </motion.div>
        )}

        {/* Dynamic Filters */}
        {dynamicFilters.length > 0 && !isLoading && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {isRTL ? 'فلاتر ذكية' : 'Smart Filters'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-text-muted hover:text-text-primary"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض' : 'Show')}
                <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 p-4 bg-background-secondary rounded-lg">
                    {dynamicFilters
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((filter) => (
                        <motion.button
                          key={filter.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleFilter(filter.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                            activeFilters.has(filter.id)
                              ? 'bg-green-primary text-white shadow-lg'
                              : 'bg-background border border-background-tertiary text-text-muted hover:text-text-primary hover:border-green-primary/30'
                          }`}
                        >
                          {getFilterIcon(filter.icon)}
                          <span>{isRTL ? filter.name.ar : filter.name.en}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              activeFilters.has(filter.id) 
                                ? 'bg-white/20 text-white' 
                                : 'bg-background-tertiary text-text-muted'
                            }`}
                          >
                            {filter.count}
                          </Badge>
                          {activeFilters.has(filter.id) && filter.id !== 'all' && (
                            <X className="h-3 w-3 ml-1" />
                          )}
                        </motion.button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Results Grid */}
        {filteredResults.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32"
          >
            {filteredResults.map((result, index) => (
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
                className="cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <Card className={`h-full bg-background backdrop-blur-sm border-background-tertiary/50 hover:border-green-primary/30 transition-all duration-300 ${
                  result.metadata.isRecommended ? 'ring-2 ring-green-primary/20 shadow-lg' : ''
                } ${
                  result.priority && result.priority >= 8 ? 'shadow-xl border-green-primary/40' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className={`flex items-center gap-1 text-${result.type === 'service' ? 'blue' : result.type === 'user' ? 'purple' : result.type === 'shop' ? 'green' : 'orange'}-500`}>
                            {result.type === 'service' && <Building2 className="h-4 w-4" />}
                            {result.type === 'user' && <Users className="h-4 w-4" />}
                            {result.type === 'shop' && <Building2 className="h-4 w-4" />}
                            {result.type === 'product' && <Package className="h-4 w-4" />}
                            <span className="text-xs font-medium uppercase tracking-wide">
                              {result.type}
                            </span>
                          </div>
                          
                          {/* AI Category Badge */}
                          {result.category && (
                            <CategoryBadge 
                              category={result.category} 
                              size="sm"
                              variant="outline"
                            />
                          )}
                          
                          {result.metadata.isVerified && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                              <Shield className="h-3 w-3 mr-1" />
                              {isRTL ? 'موثق' : 'Verified'}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-text-primary mb-1">
                          {result.name}
                        </h3>
                        
                        {/* AI Specialty Information */}
                        {result.metadata?.specialty && (
                          <p className="text-sm font-medium text-green-600 mb-2">
                            <Award className="h-3 w-3 inline mr-1" />
                            {result.metadata.specialty}
                          </p>
                        )}
                        
                        {result.description && (
                          <p className="text-text-secondary text-sm">
                            {result.description.length > 100 
                              ? result.description.substring(0, 100) + '...'
                              : result.description
                            }
                          </p>
                        )}
                        
                        {/* Filter Tags */}
                        {result.filterTags && result.filterTags.length > 0 && (
                          <div className="mt-2">
                            <FilterTagsBadge 
                              filterTags={result.filterTags}
                              maxDisplay={2}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 ml-4">
                        {result.metadata.isRecommended && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + 0.1 * index }}
                          >
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              {isRTL ? 'موصى به' : 'Recommended'}
                            </Badge>
                          </motion.div>
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

                    <div className="space-y-3">
                      {result.rating.average > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-subtle flex items-center justify-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          </div>
                          <span className="text-text-primary font-semibold">
                            {result.rating.average}
                          </span>
                          <span className="text-text-muted">
                            ({result.rating.count} {isRTL ? 'تقييم' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {(result.location.city || result.location.address) && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-background-secondary flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-text-muted" />
                          </div>
                          <span className="text-text-secondary text-sm font-medium">
                            {result.location.address || result.location.city}
                          </span>
                        </div>
                      )}

                      {result.contact.phone && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-background-secondary flex items-center justify-center">
                            <Phone className="h-3 w-3 text-text-muted" />
                          </div>
                          <span className="text-text-secondary text-sm">
                            {result.contact.phone}
                          </span>
                        </div>
                      )}

                      {result.metadata.price && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-subtle flex items-center justify-center">
                            <span className="text-xs font-bold text-green-primary">$</span>
                          </div>
                          <span className="text-green-primary font-semibold">
                            {result.metadata.price}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Priority indicator */}
                    <div className="mt-4 space-y-2">
                      {result.priority && (
                        <div className="flex items-center justify-between">
                          <PriorityIndicator 
                            priority={result.priority}
                            variant="bars"
                            size="sm"
                            showLabel={false}
                          />
                          <span className="text-xs text-text-muted font-medium">
                            {isRTL ? 'الأولوية' : 'Priority'}: {result.priority}/10
                          </span>
                        </div>
                      )}
                      
                      {/* Enhanced Price Display */}
                      {result.metadata?.price && (
                        <div className="flex items-center justify-between pt-1 border-t border-background-tertiary/30">
                          <span className="text-sm font-semibold text-green-600">
                            {result.metadata.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results Message */}
        {!isLoading && processedResults.length === 0 && !aiResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-text-muted text-lg">
              {isRTL ? 'ابدأ البحث للحصول على نتائج ذكية' : 'Start searching to get smart results'}
            </p>
          </motion.div>
        )}

        {/* Search Input */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="fixed bottom-6 left-6 right-6 max-w-2xl mx-auto z-40"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/80 to-background/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl" />
            <input
              type="text"
              placeholder={isRTL ? 'ابحث بالذكاء الاصطناعي...' : 'Search with AI...'}
              value={chatQuery}
              onChange={(e) => onChatQueryChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="relative w-full px-6 py-4 rounded-full bg-transparent border-none focus:outline-none focus:ring-0 transition-all duration-300 text-text-primary placeholder:text-text-muted/70 text-lg"
              style={{
                textAlign: isRTL ? 'right' : 'left',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
              disabled={isLoading}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-primary/5 via-transparent to-green-primary/5 opacity-50" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
