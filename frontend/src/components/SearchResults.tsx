
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, MapPin, Phone, Clock, Calendar, ShoppingCart, MessageCircle, Loader2, Stethoscope, Store, Package, Briefcase, MoreHorizontal, Share2, Filter, ChevronDown, X, Award, Info } from 'lucide-react';
import { searchSocket, type SearchResult as APISearchResult } from '@/services/searchSocket';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { bookingAPI, type TimeSlot, type BookingRequest } from '@/api/booking';
import { MedicalServiceView } from './MedicalServiceView';
import { UserCard } from './cards/UserCard';
import { ShopCard } from './cards/ShopCard';
import { ServiceCard } from './cards/ServiceCard';
import { ProductCard } from './cards/ProductCard';
// Import AI components
import CategoryBadge from '@/components/ui/CategoryBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import SearchQualityBadge from '@/components/ui/SearchQualityBadge';
import AvailabilityStatus from '@/components/ui/AvailabilityStatus';
import FilterTagsBadge from '@/components/ui/FilterTagsBadge';
import './SearchResults.css';

interface SearchResult extends Omit<APISearchResult, 'name' | 'translation'> {
    id: string;
    name: string;
    translation?: {
        name_ar?: string;
        name_en?: string;
        description_en?: string;
        description_ar?: string;
    };
    shop?: {
        name?: string;
        description?: string;
        phone?: string;
        city?: string;
        email?: string;
    };
    city?: string;
    design?: {
        slug?: string;
    };
    phone?: string;
    address?: string;
    reviews?: Array<{
        id: string;
        rating: number;
        comment: string;
        isVerified: boolean;
        authorId?: string;
    }>;
    reviewsCount?: number;
    avgRating?: number;
    locationLat?: number;
    locationLon?: number;
    isRecommended?: boolean;
    filterTags?: string[];
    priority?: number;
    description?: string;
    category?: {
        en: string;
        ar: string;
    };
    metadata?: {
        specialty?: string;
        availability?: string;
        price?: string;
        isRecommended?: boolean;
        isVerified?: boolean;
        categoryCode?: string;
        categoryNameEn?: string;
        categoryNameAr?: string;
    };
    // Additional properties used by getEntityType function
    entityType?: 'user' | 'service' | 'shop' | 'product' | 'users' | 'services' | 'shops' | 'products' | string;
    services?: any[]; // For user entities that provide services
    bio?: string; // For user entities
    role?: string; // For user entities
    price?: number; // For services and products
    stock?: number; // For products
    sku?: string; // For products
    duration?: string | number; // For services
    isVerified?: boolean; // For verification status
    _count?: { // For shops with counts
        products?: number;
        services?: number;
    };
}

interface SearchResultsProps {
    searchresults: any[];
    onSelectResult: (result: SearchResult) => void;
    chatQuery: string;
    Message: string;
    onChatQueryChange: (value: string) => void;
    onChatSubmit: () => void;
    cacheInfo?: { 
        id?: string; 
        shareUrl?: string; 
        dynamicFilters?: any[];
        processedResults?: any[];
        aiSummary?: {
            totalResults: number;
            primaryType: string;
            topCategories: string[];
            hasRecommended: boolean;
            searchQuality: string;
        };
        results?: {
            enhanced_results?: {
                users?: any[];
                services?: any[];
            };
            processedResults?: any[];
            dynamicFilters?: any[];
        };
        enhanced_results?: {
            users?: any[];
            services?: any[];
        };
        metadata?: {
            dynamic_filters?: any[];
        };
    } | null;
}

// Helper function to calculate average rating
const calculateAverageRating = (reviews: Array<{ rating: number }>): number => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
};

// Helper function to get display name
const getDisplayName = (result: SearchResult, isRTL: boolean): string => {
    if (result.translation) {
        const transtonedName = isRTL ? result.translation.name_ar : result.translation.name_en;
        if (transtonedName) {
            return transtonedName;
        }
    }
    if (result.shop?.name) {
        return result.shop.name;
    }
    return result.name || 'Unknown';
};

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 80): string => {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
};

// Helper function to get display description
const getDisplayDescription = (result: SearchResult, isRTL: boolean): string => {
    let description = '';
    if (result.translation) {
        description = isRTL ? result.translation.description_ar : result.translation.description_en;
    } else {
        description = result.shop?.description || '';
    }
    return truncateText(description);
};

// Helper function to get phone number
const getPhoneNumber = (result: SearchResult): string => {
    return result.phone || result.shop?.phone || '';
};

// Helper function to get address
const getAddress = (result: SearchResult): string => {
    // Try to get address from various sources
    if (result.address && result.address.trim() !== '') {
        return result.address;
    }
    if (result.shop?.city && result.shop.city.trim() !== '') {
        return result.shop.city;
    }
    if (result.city && result.city.trim() !== '') {
        return result.city;
    }
    return 'Address not available';
};

// Helper function to get display rating
const getDisplayRating = (result: SearchResult): number => {
    if (result.avgRating !== null && result.avgRating !== undefined) {
        return result.avgRating;
    }
    return calculateAverageRating(result.reviews || []);
};

// Helper function to get reviews count
const getReviewsCount = (result: SearchResult): number => {
    if (result.reviewsCount !== null && result.reviewsCount !== undefined) {
        return result.reviewsCount;
    }
    return result.reviews?.length || 0;
};

// Helper function to add sample data for missing fields (for testing)
const addSampleData = (result: SearchResult): SearchResult => {
    // Add sample reviews if none exist
    if (!result.reviews || result.reviews.length === 0) {
        const sampleReviews = [
            { id: '1', rating: 4, comment: 'Good service', isVerified: true },
            { id: '2', rating: 5, comment: 'Excellent', isVerified: true }
        ];
        result.reviews = sampleReviews;
    }

    // Add sample address if missing
    if (!result.address && !result.shop?.city && !result.city) {
        result.address = 'Kom Hamada, Egypt';
    }

    return result;
};

// Helper function to determine result type based on data structure
const getEntityType = (result: SearchResult): string => {
    // First, check if we have explicit entityType from search cache transformation or API processing
    if (result.entityType) {
        // Normalize entityType to our card system
        switch (result.entityType) {
            case 'user': 
            case 'users': 
                return 'users';
            case 'service': 
            case 'services': 
                return 'services';
            case 'shop': 
            case 'shops': 
                return 'shops';
            case 'product': 
            case 'products': 
                return 'products';
            default: 
                return result.entityType;
        }
    }
    
    // Check filterTags from processedResults for type detection
    if (result.filterTags && Array.isArray(result.filterTags)) {
        if (result.filterTags.includes('users') || result.filterTags.includes('doctors')) {
            return 'users';
        }
        if (result.filterTags.includes('services')) {
            return 'services';
        }
        if (result.filterTags.includes('shops')) {
            return 'shops';
        }
        if (result.filterTags.includes('products')) {
            return 'products';
        }
    }
    
    // Enhanced detection logic based on data structure
    // Check if it's a user/doctor (has services array or bio)
    if (result.services && Array.isArray(result.services) && result.services.length > 0) {
        return 'users';
    }
    if (result.bio || result.role) {
        return 'users';
    }
    
    // Check if it's a product (has price with stock/sku, or explicit category)
    if ((result.price !== undefined && (result.stock !== undefined || result.sku)) || result.category) {
        return 'products';
    }
    
    // Check if it's a shop (has shop data or is shop entity)
    if (result.shop?.name || (result.name && result._count && (result._count.products || result._count.services))) {
        return 'shops';
    }
    
    // Check if it's a service (has duration, price without stock, or is standalone service)
    if (result.duration || (result.price !== undefined && !result.stock && !result.sku)) {
        return 'services';
    }
    
    // Enhanced translation-based detection
    if (result.translation) {
        const nameEn = result.translation.name_en?.toLowerCase() || '';
        const nameAr = result.translation.name_ar || '';
        
        // Doctor/medical professional detection
        if (nameEn.includes('doctor') || nameEn.includes('dr.') || 
            nameAr.includes('طبيب') || nameAr.includes('دكتور')) {
            return 'users';
        }
        
        // Medical service detection
        if (nameEn.includes('clinic') || nameEn.includes('hospital') || nameEn.includes('medical') ||
            nameAr.includes('عيادة') || nameAr.includes('مستشفى') || nameAr.includes('طبية')) {
            return 'services';
        }
        
        // Product detection
        if (nameEn.includes('product') || nameEn.includes('item') || nameEn.includes('equipment') ||
            nameAr.includes('منتج') || nameAr.includes('سلعة') || nameAr.includes('معدات')) {
            return 'products';
        }
        
        // Shop detection
        if (nameEn.includes('shop') || nameEn.includes('store') || nameEn.includes('pharmacy') ||
            nameAr.includes('محل') || nameAr.includes('متجر') || nameAr.includes('صيدلية')) {
            return 'shops';
        }
    }

    // Final fallback - if has shop data, it's a shop; otherwise service
    if (result.shop?.name) {
        return 'shops';
    }
    
    return 'services';
};

// Keep backward compatibility
const getResultType = getEntityType;

// Helper function to get tab display name
const getTabDisplayName = (type: string, isRTL: boolean): string => {
    const tabNames = {
        all: isRTL ? 'الكل' : 'All',
        users: isRTL ? 'الأطباء' : 'Doctors',
        services: isRTL ? 'الخدمات' : 'Services',
        shops: isRTL ? 'المتاجر' : 'Shops',
        products: isRTL ? 'المنتجات' : 'Products',
        jobs: isRTL ? 'الوظائف' : 'Jobs',
        other: isRTL ? 'أخرى' : 'Other'
    };
    return tabNames[type as keyof typeof tabNames] || type;
};

// Helper function to get icon for result type
const getResultTypeIcon = (type: string) => {
    const icons = {
        users: Stethoscope,
        services: Stethoscope,
        shops: Store,
        products: Package,
        jobs: Briefcase,
        other: MoreHorizontal
    };
    return icons[type as keyof typeof icons] || MoreHorizontal;
};

// Helper function to get type-specific color
const getResultTypeColor = (type: string): string => {
    const colors = {
        users: 'text-blue-500',
        services: 'text-blue-500',
        shops: 'text-green-500',
        products: 'text-purple-500',
        jobs: 'text-orange-500',
        other: 'text-stone-500'
    };
    return colors[type as keyof typeof colors] || 'text-stone-500';
};

// This function is no longer needed since we use dynamic filters directly

// Helper function to apply smart filters to results
const applySmartFilters = (results: SearchResult[], activeFilters: Set<string>) => {
    console.log('🎛️ applySmartFilters called:', {
        totalResults: results.length,
        activeFilters: Array.from(activeFilters),
        sampleResult: results[0]
    });
    
    if (activeFilters.has('all') || activeFilters.size === 0) {
        console.log('✅ Returning all results (no active filters)');
        return results;
    }
    
    const filtered = results.filter(result => {
        let matched = false;
        
        // First check AI-processed filterTags for filtering (from processedResults)
        if (result.filterTags && Array.isArray(result.filterTags)) {
            // Check if any of the active filters match the result's filter tags
            for (const activeFilter of activeFilters) {
                if (result.filterTags.includes(activeFilter)) {
                    matched = true;
                    break;
                }
            }
            
            // If we found a match in filterTags, return it
            if (matched) {
                return true;
            }
        }
        
        // Always try fallback logic regardless of whether filterTags exist
        const entityType = getEntityType(result);
        
        // Check entity type filters (handle both singular and plural forms)
        if (activeFilters.has(entityType) || 
            activeFilters.has(entityType + 's') ||
            activeFilters.has('users') && entityType === 'user' ||
            activeFilters.has('services') && entityType === 'service' ||
            activeFilters.has('shops') && entityType === 'shop' ||
            activeFilters.has('products') && entityType === 'product') {
            return true;
        }
        
        // Check if active filter matches specific entity types
        for (const activeFilter of activeFilters) {
            if ((activeFilter === 'doctors' || activeFilter === 'أطباء') && entityType === 'users') {
                return true;
            }
            if ((activeFilter === 'services' || activeFilter === 'خدمات') && entityType === 'services') {
                return true;
            }
        }
        
        // Check quality filters
        if (activeFilters.has('recommended') && result.isRecommended) {
            return true;
        }
        if (activeFilters.has('verified') && result.isVerified) {
            return true;
        }
        if (activeFilters.has('top_rated') && (result.avgRating || 0) >= 4.5) {
            return true;
        }
        
        // Check specialty/category filters based on metadata and content
        for (const filterName of activeFilters) {
            // Medical/healthcare filters
            if ((filterName === 'medical' || filterName === 'طبي') && (
                result.metadata?.categoryNameEn?.toLowerCase().includes('clinic') ||
                result.metadata?.categoryNameAr?.includes('عيادة') ||
                result.translation?.name_en?.toLowerCase().includes('doctor') ||
                result.translation?.name_ar?.includes('طبيب') ||
                result.design?.slug === 'medical'
            )) {
                return true;
            }
            
            // Legal services filters
            if ((filterName === 'legal' || filterName === 'قانوني' || filterName === 'lawyer' || filterName === 'محامي') && (
                result.metadata?.categoryNameEn?.toLowerCase().includes('law') ||
                result.metadata?.categoryNameEn?.toLowerCase().includes('legal') ||
                result.metadata?.categoryNameAr?.includes('قانون') ||
                result.metadata?.categoryNameAr?.includes('محاماة') ||
                result.translation?.name_en?.toLowerCase().includes('lawyer') ||
                result.translation?.name_en?.toLowerCase().includes('attorney') ||
                result.translation?.name_ar?.includes('محامي') ||
                result.translation?.name_ar?.includes('مستشار قانوني') ||
                result.design?.slug === 'legal-services'
            )) {
                return true;
            }
            
            // Internal medicine filter
            if ((filterName === 'internal medicine' || filterName === 'باطنة') && (
                result.translation?.name_en?.toLowerCase().includes('internal medicine') ||
                result.translation?.name_ar?.includes('باطنة') ||
                result.translation?.description_en?.toLowerCase().includes('internal medicine') ||
                result.translation?.description_ar?.includes('باطنة')
            )) {
                return true;
            }
            
            // Generic specialty matching based on translation content
            if (result.translation?.name_en?.toLowerCase().includes(filterName.toLowerCase()) ||
                result.translation?.description_en?.toLowerCase().includes(filterName.toLowerCase()) ||
                result.shop?.description?.toLowerCase().includes(filterName.toLowerCase()) ||
                result.shop?.name?.toLowerCase().includes(filterName.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    });
    
    console.log('🔍 Filter results:', {
        originalCount: results.length,
        filteredCount: filtered.length,
        activeFilters: Array.from(activeFilters)
    });
    
    return filtered;
};

// Helper function to render the appropriate card based on entity type
const renderEntityCard = (result: SearchResult, index: number, onClick: () => void, isRTL: boolean) => {
    const entityType = getEntityType(result);
    
    switch (entityType) {
        case 'users':
            return (
                <UserCard
                    key={result.id}
                    result={result}
                    index={index}
                    onClick={onClick}
                    isRTL={isRTL}
                />
            );
        case 'shops':
            return (
                <ShopCard
                    key={result.id}
                    result={result}
                    index={index}
                    onClick={onClick}
                    isRTL={isRTL}
                />
            );
        case 'services':
            return (
                <ServiceCard
                    key={result.id}
                    result={result}
                    index={index}
                    onClick={onClick}
                    isRTL={isRTL}
                />
            );
        case 'products':
            return (
                <ProductCard
                    key={result.id}
                    result={result}
                    index={index}
                    onClick={onClick}
                    isRTL={isRTL}
                />
            );
        default:
            // Fallback to service card
            return (
                <ServiceCard
                    key={result.id}
                    result={result}
                    index={index}
                    onClick={onClick}
                    isRTL={isRTL}
                />
            );
    }
};

export function SearchResults({
    searchresults,
    onSelectResult,
    chatQuery,
    Message,
    onChatQueryChange,
    onChatSubmit,
    cacheInfo
}: SearchResultsProps) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [cartItems, setCartItems] = useState<SearchResult[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [bookingNotes, setBookingNotes] = useState<string>('');
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string>('');
    const isRTL = i18n.language === 'ar';
    const [searchCacheInfo, setSearchCacheInfo] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [showShareSuccess, setShowShareSuccess] = useState(false);
    
    // AI Dynamic filters state
    const [dynamicFilters, setDynamicFilters] = useState([]);
    const [activeFilters, setActiveFilters] = useState(new Set<string>());

    const [results, setResults] = useState([]);
    const [aiResponse, setAiResponse] = useState<string>('');

    // Filtered results state
    const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
    
    // Chat focus and animation states
    const [isSearching, setIsSearching] = useState(false);
    const [isWaitingForResults, setIsWaitingForResults] = useState(false);
    const [isChatFocused, setIsChatFocused] = useState(false);

    // Enhanced debug logging configuration
    const DEBUG_SEARCH_RESULTS = true;
    const LOG_PREFIX = "📊 SearchResults";

    // Initial mount log
    useEffect(() => {
        if (DEBUG_SEARCH_RESULTS) {
            console.log(`${LOG_PREFIX} 🚀 Component mounted/remounted`);
            console.log(`${LOG_PREFIX} 🌍 Language:`, i18n.language, '| RTL:', isRTL);
            console.log(`${LOG_PREFIX} 📥 Initial props:`, {
                searchResultsLength: searchresults?.length || 0,
                messageExists: !!Message,
                cacheInfoExists: !!cacheInfo
            });
        }
        
        // Set up socket listeners for new search results
        const unsubscribeResults = searchSocket.onSearchResults((apiResults: any) => {
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} 🎉 Socket results received:`);
                console.log(`${LOG_PREFIX} 🔍 Result type:`, typeof apiResults);
                console.log(`${LOG_PREFIX} 📦 Is array:`, Array.isArray(apiResults));
                console.log(`${LOG_PREFIX} 🔗 Has results property:`, apiResults && 'results' in apiResults);
            }
            
            // Handle different result formats
            if (Array.isArray(apiResults)) {
                if (DEBUG_SEARCH_RESULTS) {
                    console.log(`${LOG_PREFIX} ✅ Processing legacy array format:`, {
                        count: apiResults.length,
                        sampleItem: apiResults[0] || null
                    });
                }
                
                // Clear existing results first if this is a new search
                if (isWaitingForResults) {
                    setResults([]);
                    setTimeout(() => {
                        const processedResults = apiResults.map(addSampleData);
                        setResults(processedResults);
                        setAiResponse(i18n.language === 'ar' 
                            ? `تم تحميل ${apiResults.length} نتيجة بنجاح!`
                            : `${apiResults.length} results loaded successfully!`);
                        
                        // End search flow
                        setIsSearching(false);
                        setIsWaitingForResults(false);
                        setIsChatFocused(false);
                    }, 300);
                } else {
                    const processedResults = apiResults.map(addSampleData);
                    setResults(processedResults);
                    setAiResponse(i18n.language === 'ar' 
                        ? `تم تحميل ${apiResults.length} نتيجة بنجاح!`
                        : `${apiResults.length} results loaded successfully!`);
                }
            } else if (apiResults && typeof apiResults === 'object' && 'results' in apiResults) {
                if (DEBUG_SEARCH_RESULTS) {
                    console.log(`${LOG_PREFIX} ✅ Processing enhanced object format:`);
                    console.log(`${LOG_PREFIX} 📊 Results count:`, apiResults.results?.length || 0);
                    console.log(`${LOG_PREFIX} 🏷️ Search type:`, apiResults.searchType);
                    console.log(`${LOG_PREFIX} 📝 Summary:`, apiResults.summary);
                    console.log(`${LOG_PREFIX} 💾 Cache info:`, apiResults.cache);
                    console.log(`${LOG_PREFIX} 🗂️ Raw results structure:`, apiResults.rawResults);
                }
                
                // Handle search flow animations
                if (isWaitingForResults) {
                    // Clear existing results first
                    setResults([]);
                    
                    setTimeout(() => {
                        const processedResults = (apiResults.results || []).map(addSampleData);
                        setResults(processedResults);
                        
                        // Handle cache info
                        if (apiResults.cache) {
                            if (DEBUG_SEARCH_RESULTS) {
                                console.log(`${LOG_PREFIX} 💾 Setting cache info:`, apiResults.cache);
                            }
                            setSearchCacheInfo(apiResults.cache);
                            if (apiResults.cache.shareUrl) {
                                setShareUrl(apiResults.cache.shareUrl);
                            }
                        }
                        
                // Handle dynamic filters from AI
                if (apiResults.dynamicFilters) {
                    if (DEBUG_SEARCH_RESULTS) {
                        console.log(`${LOG_PREFIX} 🎛️ Setting dynamic filters:`, apiResults.dynamicFilters);
                    }
                    setDynamicFilters(apiResults.dynamicFilters);
                }
                        
                        // Set AI response based on search type and summary
                        const searchType = apiResults.searchType || 'MIXED';
                        const summary = apiResults.summary;
                        let message = i18n.language === 'ar' ? 'اكتمل البحث!' : 'Search completed!';
                        
                        if (summary && summary.total !== undefined) {
                            const totalResults = summary.total;
                            message = i18n.language === 'ar' 
                                ? `تم العثور على ${totalResults} نتيجة من نوع ${searchType}`
                                : `Found ${totalResults} ${searchType.toLowerCase()} results`;
                        } else {
                            const totalResults = processedResults.length;
                            message = i18n.language === 'ar' 
                                ? `تم العثور على ${totalResults} نتيجة`
                                : `Found ${totalResults} results`;
                        }
                        
                        if (DEBUG_SEARCH_RESULTS) {
                            console.log(`${LOG_PREFIX} 💬 Setting AI response:`, message);
                        }
                        setAiResponse(message);
                        
                        // End search flow
                        setIsSearching(false);
                        setIsWaitingForResults(false);
                        setIsChatFocused(false);
                    }, 300);
                } else {
                    // Regular handling without animations
                    const processedResults = (apiResults.results || []).map(addSampleData);
                    setResults(processedResults);
                    
                    // Handle cache info and other data normally...
                    if (apiResults.cache) {
                        setSearchCacheInfo(apiResults.cache);
                        if (apiResults.cache.shareUrl) {
                            setShareUrl(apiResults.cache.shareUrl);
                        }
                    }
                    
            if (apiResults.dynamicFilters) {
                setDynamicFilters(apiResults.dynamicFilters);
            }
                    
                    const searchType = apiResults.searchType || 'MIXED';
                    const summary = apiResults.summary;
                    let message = i18n.language === 'ar' ? 'اكتمل البحث!' : 'Search completed!';
                    
                    if (summary && summary.total !== undefined) {
                        const totalResults = summary.total;
                        message = i18n.language === 'ar' 
                            ? `تم العثور على ${totalResults} نتيجة من نوع ${searchType}`
                            : `Found ${totalResults} ${searchType.toLowerCase()} results`;
                    } else {
                        const totalResults = processedResults.length;
                        message = i18n.language === 'ar' 
                            ? `تم العثور على ${totalResults} نتيجة`
                            : `Found ${totalResults} results`;
                    }
                    
                    setAiResponse(message);
                }
            } else {
                if (DEBUG_SEARCH_RESULTS) {
                    console.warn(`${LOG_PREFIX} ⚠️ Unknown socket result format:`, apiResults);
                }
            }
        });
        
        // Set up socket listeners for AI messages
        const unsubscribeAiMessage = searchSocket.onAiMessage((response) => {
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} 🤖 AI Message received:`, response);
            }
            
            if (response && response.function === "reply_to_user" && response.parameters?.message) {
                setAiResponse(response.parameters.message);
                
                // If this is a chat-only response (no results expected), end the search flow
                if (isWaitingForResults) {
                    setIsSearching(false);
                    setIsWaitingForResults(false);
                    // Keep chat focused for continued conversation
                }
            } else if (typeof response === 'string') {
                // Handle direct string responses
                setAiResponse(response);
                
                // If this is a chat-only response, end the search flow
                if (isWaitingForResults) {
                    setIsSearching(false);
                    setIsWaitingForResults(false);
                }
            }
        });
        
        return () => {
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} 🧹 Cleaning up socket listeners`);
            }
            unsubscribeResults();
            unsubscribeAiMessage();
        };
    }, [i18n.language, isRTL]);


    // Enhanced prop change detection with new API structure support
    useEffect(() => {
        if (DEBUG_SEARCH_RESULTS) {
            console.log(`${LOG_PREFIX} 📥 Props changed:`);
            console.log(`${LOG_PREFIX} 🔢 SearchResults type:`, typeof searchresults);
            console.log(`${LOG_PREFIX} 📊 Is array:`, Array.isArray(searchresults));
            console.log(`${LOG_PREFIX} 📏 Length:`, searchresults?.length || 0);
            console.log(`${LOG_PREFIX} 💬 Message exists:`, !!Message);
            console.log(`${LOG_PREFIX} 💬 Message content:`, Message);
        }
        
        if (Message) {
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} 💬 Setting AI response from props:`, Message);
            }
            setAiResponse(Message);
        }
        
        // Handle both old format (direct array) and new format (with cache structure)
        let resultsToProcess = [];
        
        if (searchresults && searchresults.length > 0) {
            // Old format: direct array of results
            resultsToProcess = searchresults;
        } else if (cacheInfo && cacheInfo.results) {
            // New format: results from cache with enhanced_results structure
            const enhancedResults = cacheInfo.results.enhanced_results || cacheInfo.enhanced_results;
            const processedResults = cacheInfo.processedResults || cacheInfo.results.processedResults;
            
            if (enhancedResults) {
                // Combine users and services from enhanced_results
                const users = enhancedResults.users || [];
                const services = enhancedResults.services || [];
                
                // Transform enhanced results to our expected format
                const transformedUsers = users.map(user => ({
                    ...user,
                    entityType: 'users',
                    // Add any missing fields needed by the cards
                    avgRating: user.avgRating || 0,
                    reviewsCount: user._count?.reviews || 0,
                    city: user.city || '',
                    isVerified: user.isVerified || false,
                    isRecommended: false // Will be determined from processedResults if available
                }));
                
                const transformedServices = services.map(service => ({
                    ...service,
                    entityType: 'services',
                    // Map shop owner info to service level for compatibility
                    name: service.translation?.name_en || service.translation?.name_ar || service.shop?.name || 'Unknown Service',
                    ownerName: service.ownerUser?.name || service.shop?.name || 'Unknown Provider',
                    city: service.city || service.shop?.city || '',
                    isVerified: service.shop?.isVerified || service.ownerUser?.isVerified || false,
                    isRecommended: false // Will be determined from processedResults if available
                }));
                
                resultsToProcess = [...transformedUsers, ...transformedServices];
                
                // Enhance with processedResults data if available
                if (processedResults) {
                    resultsToProcess = resultsToProcess.map(result => {
                        const processedMatch = processedResults.find(pr => pr.id === result.id);
                        if (processedMatch) {
                            return {
                                ...result,
                                filterTags: processedMatch.filterTags,
                                priority: processedMatch.priority,
                                isRecommended: processedMatch.filterTags?.includes('recommended') || false,
                                description: processedMatch.description || result.description,
                                entityType: processedMatch.type === 'user' ? 'users' : 'services'
                            };
                        }
                        return result;
                    });
                }
            }
        }
        
        if (resultsToProcess.length > 0) {
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} ✅ Updating results: ${resultsToProcess.length} items`);
                console.log(`${LOG_PREFIX} 🔍 Sample result:`, resultsToProcess[0]);
            }
            
            // Add sample data for missing fields if needed
            const processedResults = resultsToProcess.map(result => {
                // Only add sample data if we don't already have rich data
                if (!result.reviews || result.reviews.length === 0) {
                    return addSampleData(result);
                }
                return result;
            });
            
            setResults(processedResults);
        } else {
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} ⚠️ No results to process, current state has ${results.length} items`);
            }
        }
    }, [searchresults, Message, cacheInfo]);

    // Filter results based on active AI filters
    useEffect(() => {
        if (DEBUG_SEARCH_RESULTS) {
            console.log(`${LOG_PREFIX} 🔍 Filtering results:`);
            console.log(`${LOG_PREFIX} 📊 Total results: ${results.length}`);
            console.log(`${LOG_PREFIX} 🎛️ Active filters:`, Array.from(activeFilters));
        }
        
        let filtered = results;
        
        // Apply AI dynamic filters
        if (activeFilters.size > 0) {
            filtered = applySmartFilters(filtered, activeFilters);
        }
        
        setFilteredResults(filtered);
        
        if (DEBUG_SEARCH_RESULTS) {
            console.log(`${LOG_PREFIX} ✅ Final filtered results: ${filtered.length}`);
        }
    }, [results, activeFilters]);

    // No longer needed - we only use AI dynamic filters

    // AI filter toggle function
    const toggleFilter = (filterId: string) => {
        const newActiveFilters = new Set(activeFilters);
        
        if (filterId === 'all') {
            // Clear all filters when "all" is selected
            setActiveFilters(new Set<string>());
        } else {
            if (newActiveFilters.has(filterId)) {
                newActiveFilters.delete(filterId);
            } else {
                newActiveFilters.add(filterId);
            }
            setActiveFilters(newActiveFilters);
        }
        
        if (DEBUG_SEARCH_RESULTS) {
            console.log(`${LOG_PREFIX} 🎛️ Filter toggled:`, filterId, 'Active:', Array.from(newActiveFilters));
        }
    };

    // This function is no longer needed since we removed tabs
    // useEffect(() => {
    //   const unsubscribeMessage = searchSocket.onAiMessage((response) => {
    //     if (response && response.function === "reply_to_user" && response.parameters?.message) {
    //       setAiResponse(response.parameters.message);
    //     }
    //   });

    // Search cache state

    // Enhanced cache info handling with dynamic filters support
    useEffect(() => {
        if (DEBUG_SEARCH_RESULTS) {
            console.log(`${LOG_PREFIX} 💾 Cache info prop changed:`);
            console.log(`${LOG_PREFIX} 🔍 Cache exists:`, !!cacheInfo);
            console.log(`${LOG_PREFIX} 📄 Cache content:`, cacheInfo);
        }
        
        if (cacheInfo) {
            setSearchCacheInfo(cacheInfo);
            if (cacheInfo.shareUrl) {
                if (DEBUG_SEARCH_RESULTS) {
                    console.log(`${LOG_PREFIX} 🔗 Setting share URL:`, cacheInfo.shareUrl);
                }
                setShareUrl(cacheInfo.shareUrl);
            }
            
            // Check for dynamic filters in cache (multiple possible locations)
            const cacheDynamicFilters = cacheInfo.dynamicFilters || 
                                      cacheInfo.metadata?.dynamic_filters || 
                                      cacheInfo.results?.dynamicFilters;
            
            if (cacheDynamicFilters && Array.isArray(cacheDynamicFilters)) {
                if (DEBUG_SEARCH_RESULTS) {
                    console.log(`${LOG_PREFIX} 🎛️ Found dynamic filters in cache:`, cacheDynamicFilters);
                }
                setDynamicFilters(cacheDynamicFilters);
                
                // Dynamic filters are used directly, no conversion needed
                if (DEBUG_SEARCH_RESULTS) {
                    console.log(`${LOG_PREFIX} ✨ Using dynamic filters directly:`, cacheDynamicFilters);
                }
            }
        } else {
            // Clear cache info if no cache is provided
            if (DEBUG_SEARCH_RESULTS) {
                console.log(`${LOG_PREFIX} 🧹 Clearing cache info`);
            }
            setSearchCacheInfo(null);
            setShareUrl('');
            setDynamicFilters([]);
        }
    }, [cacheInfo, isRTL]);

    // Share functionality
    const handleShare = async () => {
        if (!shareUrl) return;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Search Results - Daleel Balady',
                    text: 'Check out these search results from Daleel Balady',
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setShowShareSuccess(true);
                setTimeout(() => setShowShareSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                setShowShareSuccess(true);
                setTimeout(() => setShowShareSuccess(false), 3000);
            } catch (clipboardError) {
                console.error('Clipboard error:', clipboardError);
            }
        }
    };

    //   return () => {
    //     unsubscribeMessage();
    //     unsubscribeResults();
    //   };
    // }, [i18n.language]);


    const handleCardClick = (result: SearchResult) => {
        console.log('Card clicked:', result);
        setSelectedResult(result);
        onSelectResult(result);
        
        // Navigate to appropriate page based on entity type
        const entityType = getEntityType(result);
        if (entityType === 'users') {
            navigate(`/user/${result.id}`);
        } else if (entityType === 'services') {
            navigate(`/service/${result.id}`);
        } else if (entityType === 'shops') {
            // For now, log that shop navigation is not implemented
            console.log('Shop navigation not yet implemented');
        } else if (entityType === 'products') {
            // For now, log that product navigation is not implemented
            console.log('Product navigation not yet implemented');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && chatQuery.trim()) {
            console.log('🚀 Chat query submitted:', chatQuery);
            
            // Call the parent's submit handler which will navigate to home for new search
            onChatSubmit();
        }
    };
    

    const handleBookAppointment = () => {
        console.log('Book appointment clicked for:', selectedResult);
        setShowBookingModal(true);
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
        setSelectedTimeSlot(null);
        setBookingNotes('');
        setBookingError('');
        // Load available slots for today
        if (selectedResult) {
            loadAvailableSlots(selectedResult.id, today);
        }
    };

    const handleDateChange = (date: string) => {
        console.log('Date changed:', date);
        setSelectedDate(date);
        setSelectedTimeSlot(null);
        if (selectedResult) {
            loadAvailableSlots(selectedResult.id, date);
        }
    };



    const loadAvailableSlots = async (serviceId: string, date: string) => {
        console.log('Loading available slots for:', serviceId, date);
        setIsLoadingSlots(true);
        setBookingError('');
        try {
            const response = await bookingAPI.getAvailableSlots(serviceId, date);
            console.log('Available slots response:', response);
            setAvailableSlots(response.availableSlots);
        } catch (error) {
            console.error('Error loading available slots:', error);
            setBookingError(error instanceof Error ? error.message : 'Failed to load available slots');
        } finally {
            setIsLoadingSlots(false);
        }
    };

    const handleCreateBooking = async () => {
        console.log('Create booking clicked');
        if (!selectedResult || !selectedTimeSlot || !selectedDate) {
            setBookingError('Please select a date and time slot');
            return;
        }

        setIsCreatingBooking(true);
        setBookingError('');

        try {
            // Create start and end datetime strings
            const startAt = new Date(`${selectedDate}T${selectedTimeSlot.start}:00.000Z`).toISOString();
            const endAt = new Date(`${selectedDate}T${selectedTimeSlot.end}:00.000Z`).toISOString();

            // Try to get user from auth token first
            const authToken = localStorage.getItem('daleel-token');
            let userId = 'b1d1bba6-3807-4036-bfcc-3dadf3ae17d9'; // Default test user ID
            
            if (authToken) {
                try {
                    // Decode JWT to get user ID
                    const base64Url = authToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const decoded = JSON.parse(jsonPayload);
                    userId = decoded.userId;
                } catch (e) {
                    console.warn('Could not decode auth token:', e);
                }
            }

            const bookingData: BookingRequest = {
                serviceId: selectedResult.id,
                userId: userId,
                startAt,
                endAt,
                notes: bookingNotes,
            };

            console.log('Booking data:', bookingData);
            const response = await bookingAPI.createBooking(bookingData);
            console.log('Booking created successfully:', response.booking);

            // Close modal and reset state
            setShowBookingModal(false);
            setSelectedTimeSlot(null);
            setBookingNotes('');
            setAvailableSlots([]);

            // Show success notification
            alert(i18n.language === 'ar' ? 'تم إنشاء الحجز بنجاح!' : 'Booking created successfully!');

        } catch (error) {
            console.error('Error creating booking:', error);
            let errorMessage = 'Failed to create booking';
            
            if (error instanceof Error) {
                if (error.message.includes('Foreign key constraint')) {
                    errorMessage = i18n.language === 'ar' 
                        ? 'يجب تسجيل الدخول أولاً لحجز موعد' 
                        : 'Please log in first to book an appointment';
                } else {
                    errorMessage = error.message;
                }
            }
            
            setBookingError(errorMessage);
        } finally {
            setIsCreatingBooking(false);
        }
    };


    const handleTimeSlotSelect = (slot: TimeSlot) => {
        console.log('Time slot selected:', slot);
        setSelectedTimeSlot(slot);
    };

    const handleAddToCart = () => {
        console.log('Add to cart clicked:', selectedResult);
        if (selectedResult && !cartItems.find(item => item.id === selectedResult.id)) {
            setCartItems([...cartItems, selectedResult]);
            // Show success message or notification
            console.log('Added to cart:', selectedResult.name);
        }
    };

    const handleCallNow = () => {
        console.log('Call now clicked:', selectedResult);
        if (selectedResult && getPhoneNumber(selectedResult)) {
            window.open(`tel:${getPhoneNumber(selectedResult)}`);
        }
    };


    if (selectedResult && selectedResult.design.slug !== 'medical') {
        console.log('Rendering selectedResult:', selectedResult);
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen pt-24 px-6 pb-32"
            >
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setSelectedResult(null)}
                        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6"
                    >
                        <span className="text-2xl">←</span>
                        <span>{i18n.language === 'ar' ? 'العودة للنتائج' : 'Back to Results'}</span>
                    </motion.button>

                    {/* Main Service Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-background/80 backdrop-blur-md rounded-3xl p-8 mb-8"
                        style={{ boxShadow: 'var(--shadow-strong)' }}
                    >
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Service Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h1 className="text-4xl font-bold text-text-primary mb-2">
                                            {getDisplayName(selectedResult, isRTL)}
                                        </h1>
                                        <p className="text-xl text-text-secondary mb-4">
                                            {getDisplayDescription(selectedResult, isRTL) || (i18n.language === 'ar' ? 'خدمة طبية متخصصة' : 'Professional Medical Service')}
                                        </p>
                                    </div>
                                    {selectedResult.isRecommended && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Badge className="bg-yellow-400 text-black border-yellow-400 animate-glow-gold">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                                                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>★</span>
                                                    <span style={{ color: '#FFD700' }}>{t('common.recommended')}</span>
                                                </span>
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Service Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-green-subtle flex items-center justify-center">
                                            <Star className="h-6 w-6 text-green-primary" />
                                        </div>
                                        <div>
                                            <p className="text-text-primary font-semibold text-lg">
                                                {getDisplayRating(selectedResult) > 0 ? getDisplayRating(selectedResult) : 'No rating'}
                                            </p>
                                            <p className="text-text-muted text-sm">
                                                {getReviewsCount(selectedResult)} {i18n.language === 'ar' ? 'تقييم' : 'reviews'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-text-muted" />
                                        </div>
                                        <div>
                                            <p className="text-text-primary font-semibold text-lg">
                                                {i18n.language === 'ar' ? 'الموقع' : 'Location'}
                                            </p>
                                            <p className="text-text-muted text-sm">{getAddress(selectedResult)}</p>
                                        </div>
                                    </div>

                                    {getPhoneNumber(selectedResult) && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center">
                                                <Phone className="h-6 w-6 text-text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-text-primary font-semibold text-lg">
                                                    {i18n.language === 'ar' ? 'الهاتف' : 'Phone'}
                                                </p>
                                                <p className="text-text-muted text-sm">{getPhoneNumber(selectedResult)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-text-muted" />
                                        </div>
                                        <div>
                                            <p className="text-text-primary font-semibold text-lg">
                                                {i18n.language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                                            </p>
                                            <p className="text-text-muted text-sm">
                                                {i18n.language === 'ar' ? '9:00 ص - 9:00 م' : '9:00 AM - 9:00 PM'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    {(() => {
                                        const resultType = getResultType(selectedResult);

                                        // Service-specific actions
                                        if (resultType === 'services') {
                                            return (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleBookAppointment}
                                                        className="bg-green-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-green-primary/90 transition-colors flex items-center gap-2"
                                                    >
                                                        <Calendar className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleAddToCart}
                                                        className="bg-background-secondary text-text-primary px-8 py-4 rounded-full font-semibold hover:bg-background-tertiary transition-colors flex items-center gap-2"
                                                    >
                                                        <ShoppingCart className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                                                    </motion.button>
                                                </>
                                            );
                                        }

                                        // Shop-specific actions
                                        if (resultType === 'shops') {
                                            return (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleAddToCart}
                                                        className="bg-green-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-green-primary/90 transition-colors flex items-center gap-2"
                                                    >
                                                        <Store className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'زيارة المتجر' : 'Visit Shop'}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleAddToCart}
                                                        className="bg-background-secondary text-text-primary px-8 py-4 rounded-full font-semibold hover:bg-background-tertiary transition-colors flex items-center gap-2"
                                                    >
                                                        <ShoppingCart className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                                                    </motion.button>
                                                </>
                                            );
                                        }

                                        // Product-specific actions
                                        if (resultType === 'products') {
                                            return (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleAddToCart}
                                                        className="bg-green-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-green-primary/90 transition-colors flex items-center gap-2"
                                                    >
                                                        <Package className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'شراء الآن' : 'Buy Now'}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={handleAddToCart}
                                                        className="bg-background-secondary text-text-primary px-8 py-4 rounded-full font-semibold hover:bg-background-tertiary transition-colors flex items-center gap-2"
                                                    >
                                                        <ShoppingCart className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                                                    </motion.button>
                                                </>
                                            );
                                        }

                                        // Job-specific actions
                                        if (resultType === 'jobs') {
                                            return (
                                                <>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => window.open(`mailto:${selectedResult.shop?.email || 'contact@example.com'}?subject=Job Application: ${getDisplayName(selectedResult, isRTL)}`)}
                                                        className="bg-green-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-green-primary/90 transition-colors flex items-center gap-2"
                                                    >
                                                        <Briefcase className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'تقدم للوظيفة' : 'Apply Now'}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => window.open(`tel:${getPhoneNumber(selectedResult)}`)}
                                                        className="bg-background-secondary text-text-primary px-8 py-4 rounded-full font-semibold hover:bg-background-tertiary transition-colors flex items-center gap-2"
                                                    >
                                                        <Phone className="h-5 w-5" />
                                                        {i18n.language === 'ar' ? 'اتصل للاستفسار' : 'Call for Info'}
                                                    </motion.button>
                                                </>
                                            );
                                        }

                                        // Default actions
                                        return (
                                            <>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleAddToCart}
                                                    className="bg-green-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-green-primary/90 transition-colors flex items-center gap-2"
                                                >
                                                    <MessageCircle className="h-5 w-5" />
                                                    {i18n.language === 'ar' ? 'مزيد من التفاصيل' : 'More Details'}
                                                </motion.button>
                                            </>
                                        );
                                    })()}

                                    {getPhoneNumber(selectedResult) && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCallNow}
                                            className="border border-green-primary text-green-primary px-8 py-4 rounded-full font-semibold hover:bg-green-primary/10 transition-colors flex items-center gap-2"
                                        >
                                            <Phone className="h-5 w-5" />
                                            {i18n.language === 'ar' ? 'اتصل الآن' : 'Call Now'}
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* Service Image Placeholder */}
                            <div className="w-full lg:w-80 h-64 lg:h-80 bg-background-secondary rounded-2xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🏥</span>
                                    </div>
                                    <p className="text-text-muted">
                                        {i18n.language === 'ar' ? 'صورة الخدمة' : 'Service Image'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Reviews Section */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-background backdrop-blur-md rounded-3xl p-8 mb-8"
                        style={{ boxShadow: 'var(--shadow-strong)' }}
                    >
                        <h2 className="text-2xl font-bold text-text-primary mb-6">
                            {i18n.language === 'ar' ? 'التقييمات والمراجعات' : 'Reviews & Ratings'}
                        </h2>

                        {selectedResult.reviews && selectedResult.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {selectedResult.reviews.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-background-secondary/50 rounded-2xl p-6"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-subtle rounded-full flex items-center justify-center">
                                                    <span className="text-green-primary font-semibold">
                                                        {review.authorId?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text-primary">
                                                        {i18n.language === 'ar' ? 'مستخدم' : 'User'} {review.authorId?.slice(-4) || 'Anonymous'}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-stone-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.isVerified && (
                                                <Badge className="bg-green-primary text-white text-xs">
                                                    {i18n.language === 'ar' ? 'موثق' : 'Verified'}
                                                </Badge>
                                            )}
                                        </div>
                                        {review.comment && (
                                            <p className="text-text-secondary">{review.comment}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="h-8 w-8 text-text-muted" />
                                </div>
                                <p className="text-text-muted text-lg">
                                    {i18n.language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                                </p>
                                <p className="text-text-muted text-sm mt-2">
                                    {i18n.language === 'ar' ? 'كن أول من يقيم هذه الخدمة' : 'Be the first to review this service'}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* AI Chat Response */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-green-subtle/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-subtle/50"
                        style={{ boxShadow: 'var(--shadow-green)' }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">دب</span>
                            </div>
                            <div>
                                <p className="text-text-primary text-lg mb-2 font-medium">
                                    {i18n.language === 'ar'
                                        ? `دكتور ${getDisplayName(selectedResult, isRTL)} يبدو رائعاً! هل تريد مني مساعدتك في حجز موعد؟`
                                        : `Dr. ${getDisplayName(selectedResult, isRTL)} looks great! Would you like me to help you book an appointment?`
                                    }
                                </p>
                                <p className="text-text-secondary text-sm">
                                    {i18n.language === 'ar' ? 'دليلك المحلي الذكي' : 'Your smart local guide'}
                                </p>
                            </div>
                        </div>
                    </motion.div>


                    {/* Cart Indicator */}
                    {cartItems.length > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="fixed top-24 right-6 z-50"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCart(true)}
                                className="bg-green-primary text-white p-4 rounded-full shadow-lg flex items-center gap-2"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                <span className="font-semibold">{cartItems.length}</span>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Booking Modal */}
                    {showBookingModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                            onClick={() => setShowBookingModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-background/95 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                                style={{ boxShadow: 'var(--shadow-strong)' }}
                            >
                                <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                                    {i18n.language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
                                </h3>

                                {selectedResult && (
                                    <div className="mb-6 p-4 bg-background-secondary/50 rounded-xl">
                                        <h4 className="font-semibold text-text-primary mb-2">
                                            {getDisplayName(selectedResult, isRTL)}
                                        </h4>
                                        <p className="text-sm text-text-muted">
                                            {getAddress(selectedResult)}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-6 mb-6">
                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-text-primary font-semibold mb-2">
                                            {i18n.language === 'ar' ? 'التاريخ' : 'Date'}
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary/30"
                                        />
                                    </div>

                                    {/* Time Slots */}
                                    {isLoadingSlots ? (
                                        <div>
                                            <label className="block text-text-primary font-semibold mb-2">
                                                {i18n.language === 'ar' ? 'المواعيد المتاحة' : 'Available Times'}
                                            </label>
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin text-green-primary" />
                                                <span className="ml-2 text-text-muted">
                                                    {i18n.language === 'ar' ? 'جاري تحميل المواعيد...' : 'Loading available slots...'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : availableSlots.length > 0 ? (
                                        <div>
                                            <label className="block text-text-primary font-semibold mb-2">
                                                {i18n.language === 'ar' ? 'اختر وقت الموعد' : 'Select Time Slot'}
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {availableSlots.map((slot) => (
                                                    <motion.button
                                                        key={`${slot.start}-${slot.end}`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleTimeSlotSelect(slot)}
                                                        className={`p-3 rounded-xl border-2 font-medium transition-all duration-300 ${selectedTimeSlot?.start === slot.start && selectedTimeSlot?.end === slot.end
                                                            ? 'border-green-primary bg-green-primary/10 text-green-primary'
                                                            : 'border-background-tertiary text-text-secondary hover:border-green-primary/50 hover:text-green-primary'
                                                            }`}
                                                    >
                                                        🕒 {slot.start} - {slot.end}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : selectedDate ? (
                                        <div>
                                            <label className="block text-text-primary font-semibold mb-2">
                                                {i18n.language === 'ar' ? 'المواعيد المتاحة' : 'Available Times'}
                                            </label>
                                            <div className="text-center py-8 text-text-muted">
                                                😔 {i18n.language === 'ar' ? 'لا توجد مواعيد متاحة في هذا التاريخ' : 'No available slots for this date'}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-text-primary font-semibold mb-2">
                                            {i18n.language === 'ar' ? 'ملاحظات' : 'Notes'}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={bookingNotes}
                                            onChange={(e) => setBookingNotes(e.target.value)}
                                            placeholder={i18n.language === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                                            className="w-full px-4 py-3 rounded-xl bg-background-secondary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-green-primary/30 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {bookingError && (
                                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                                        {bookingError}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowBookingModal(false)}
                                        className="flex-1 bg-background-secondary text-text-primary py-3 rounded-xl font-semibold hover:bg-background-tertiary transition-colors"
                                    >
                                        {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCreateBooking}
                                        disabled={!selectedTimeSlot || isCreatingBooking}
                                        className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${!selectedTimeSlot || isCreatingBooking
                                            ? 'bg-background-tertiary text-text-muted cursor-not-allowed'
                                            : 'bg-green-primary text-white hover:bg-green-primary/90'
                                            }`}
                                    >
                                        {isCreatingBooking ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {i18n.language === 'ar' ? 'جاري الحجز...' : 'Booking...'}
                                            </>
                                        ) : (
                                            i18n.language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Cart Modal */}
                    {showCart && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                            onClick={() => setShowCart(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-background/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full"
                                style={{ boxShadow: 'var(--shadow-strong)' }}
                            >
                                <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                                    {i18n.language === 'ar' ? 'السلة' : 'Cart'}
                                </h3>

                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {cartItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center justify-between bg-background-secondary/50 rounded-xl p-4">
                                            <div>
                                                <p className="font-semibold text-text-primary">{getDisplayName(item, isRTL)}</p>
                                                <p className="text-sm text-text-muted">{getAddress(item)}</p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setCartItems(cartItems.filter((_, i) => i !== index))}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                ✕
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowCart(false)}
                                        className="flex-1 bg-background-secondary text-text-primary py-3 rounded-xl font-semibold hover:bg-background-tertiary transition-colors"
                                    >
                                        {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setShowCart(false);
                                            // Handle checkout logic here
                                            console.log('Proceeding to checkout...');
                                        }}
                                        className="flex-1 bg-green-primary text-white py-3 rounded-xl font-semibold hover:bg-green-primary/90 transition-colors"
                                    >
                                        {i18n.language === 'ar' ? 'الدفع' : 'Checkout'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    }

    if (selectedResult && selectedResult.design.slug === 'medical') {
        return (
            <MedicalServiceView
                selectedResult={selectedResult}
                onBack={() => setSelectedResult(null)}
                chatQuery={chatQuery}
                onChatQueryChange={onChatQueryChange}
                onChatSubmit={onChatSubmit}
                handleKeyPress={handleKeyPress}
                handleBookAppointment={handleBookAppointment}
                handleCallNow={handleCallNow}
                getDisplayName={getDisplayName}
                getDisplayDescription={getDisplayDescription}
                getDisplayRating={getDisplayRating}
                getReviewsCount={getReviewsCount}
                getAddress={getAddress}
                getPhoneNumber={getPhoneNumber}
                showBookingModal={showBookingModal}
                setShowBookingModal={setShowBookingModal}
                availableSlots={availableSlots}
                isLoadingSlots={isLoadingSlots}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                bookingNotes={bookingNotes}
                bookingError={bookingError}
                isCreatingBooking={isCreatingBooking}
                handleDateChange={handleDateChange}
                handleTimeSlotSelect={handleTimeSlotSelect}
                setBookingNotes={setBookingNotes}
                handleCreateBooking={handleCreateBooking}
            />
        );
    }
    
    console.log('Rendering main results grid:');
    console.log('- results:', results.length);
    console.log('- filteredResults:', filteredResults.length);
    console.log('- shareUrl:', shareUrl);
    console.log('- searchCacheInfo:', searchCacheInfo);
    console.log('- aiResponse:', aiResponse);
    return (
        <>
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="min-h-screen pt-24 px-6 pb-32 relative z-10"
            >
                <div className="max-w-6xl mx-auto">
                {/* Enhanced Header with AI Summary */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 text-center"
                >
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                        <h2 className="text-3xl font-bold text-text-primary">
                            {Message}
                        </h2>
                        {/* AI Search Quality Indicator */}
                        {cacheInfo?.aiSummary?.searchQuality && (
                            <SearchQualityBadge 
                                quality={cacheInfo.aiSummary.searchQuality}
                                size="md"
                            />
                        )}
                    </div>
                    
                    {/* Top Categories from AI Summary */}
                    {cacheInfo?.aiSummary?.topCategories && cacheInfo.aiSummary.topCategories.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <span className="text-sm text-text-muted font-medium">
                                {isRTL ? 'الفئات الرئيسية:' : 'Top Categories:'}
                            </span>
                            {cacheInfo.aiSummary.topCategories.slice(0, 3).map((category, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    )}
                    
                    {/* Results Summary */}
                    {cacheInfo?.aiSummary && (
                        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-text-muted">
                            {cacheInfo.aiSummary.primaryType && (
                                <Badge variant="outline" className="capitalize">
                                    {isRTL ? 'النوع الأساسي:' : 'Primary:'} {cacheInfo.aiSummary.primaryType}
                                </Badge>
                            )}
                            {cacheInfo.aiSummary.hasRecommended && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Star className="h-3 w-3 mr-1" />
                                    {isRTL ? 'يتوفر موصى به' : 'Recommended Available'}
                                </Badge>
                            )}
                        </div>
                    )}
                </motion.div>


                {/* AI Dynamic Filters */}
                {dynamicFilters.length > 0 && (
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex flex-wrap justify-center gap-2">
                            {dynamicFilters
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((filter) => {
                                    const isActive = activeFilters.has(filter.id) || (activeFilters.size === 0 && filter.id === 'all');
                                    const displayName = typeof filter.name === 'string' 
                                        ? filter.name 
                                        : (isRTL ? filter.name?.ar : filter.name?.en) || filter.id;
                                    
                                    return (
                                        <motion.button
                                            key={filter.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => toggleFilter(filter.id)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                                                isActive
                                                    ? 'bg-green-primary text-white shadow-lg shadow-green-primary/30'
                                                    : 'bg-background-secondary text-text-muted hover:bg-background-tertiary hover:text-text-primary'
                                            }`}
                                        >
                                            <span className="text-base">{filter.icon}</span>
                                            <span>{displayName}</span>
                                            <span className="ml-2 text-sm opacity-75">
                                                ({filter.count})
                                            </span>
                                        </motion.button>
                                    );
                                })}
                        </div>
                    </motion.div>
                )}
                
                {/* AI Response Display */}
                <AnimatePresence>
                    {aiResponse && (
                        <motion.div
                            key={aiResponse} // Re-animate when content changes
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -20, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm font-bold">🤖</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
                                        {aiResponse}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredResults.map((result, index) => (
                            <motion.div
                                key={result.id}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.4,
                                    ease: "easeOut"
                                }}
                                layout
                            >
                                {renderEntityCard(result, index, () => handleCardClick(result), isRTL)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Show More Button */}
                {/* Debug: shareUrl = {shareUrl ? shareUrl : 'NOT SET'} */}
                {shareUrl ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mb-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                // Extract the cache ID from the shareUrl
                                const url = new URL(shareUrl);
                                const cacheId = url.searchParams.get('id');
                                
                                // Navigate to the search page with the cache ID
                                if (cacheId) {
                                    window.location.href = `/search?id=${cacheId}`;
                                }
                            }}
                            className="bg-green-primary/10 hover:bg-green-primary/20 text-green-primary px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 mx-auto border border-green-primary/20"
                        >
                            <span>{isRTL ? 'عرض المزيد' : 'Show More'}</span>
                            <span className="text-sm opacity-70">({filteredResults.length} results)</span>
                        </motion.button>
                    </motion.div>
                ) : (
                    // Fallback button when no shareUrl is available yet
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mb-8"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                console.log('Fallback Show More clicked - no cache available yet');
                                alert('Cache not ready yet. Please wait a moment and try searching again.');
                            }}
                            className="bg-stone-500/10 hover:bg-stone-500/20 text-stone-500 px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 mx-auto border border-stone-500/20"
                        >
                            <span>{isRTL ? 'عرض المزيد (قيد التحميل)' : 'Show More (Loading...)'}</span>
                            <span className="text-sm opacity-70">({filteredResults.length} results)</span>
                        </motion.button>
                    </motion.div>
                )}

            </div>
        </motion.div>
        
        </>
    );
}