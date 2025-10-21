import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SearchResults } from '@/components/SearchResults';
import { MultiEntitySearchResults } from '@/components/MultiEntitySearchResults';
import { searchSocket } from '@/services/searchSocket';
import searchCacheAPI from '@/services/searchCacheAPI';
import { useTranslation } from 'react-i18next';
import { useSearchTitle } from '@/hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Search() {
  // Enhanced debug logging configuration
  const DEBUG_SEARCH_PAGE = true;
  const LOG_PREFIX = "📝 Search Page";
  
  const [searchParams] = useSearchParams();
  const searchId = searchParams.get('id');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [isMultiEntitySearch, setIsMultiEntitySearch] = useState(false);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [processedResults, setProcessedResults] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // Set dynamic document title
  useSearchTitle(searchQuery);
  
  // Initial component mount logging
  if (DEBUG_SEARCH_PAGE) {
    console.log(`${LOG_PREFIX} 🚀 Component initialized`);
    console.log(`${LOG_PREFIX} 🆔 Search ID:`, searchId);
    console.log(`${LOG_PREFIX} 🌍 Language:`, i18n.language, '| RTL:', isRTL);
  }


  useEffect(() => {
    if (DEBUG_SEARCH_PAGE) {
      console.log(`${LOG_PREFIX} ⚙️ Effect triggered - Loading search cache`);
      console.log(`${LOG_PREFIX} 🆔 Search ID:`, searchId);
      console.log(`${LOG_PREFIX} 🌍 Language:`, i18n.language);
    }
    
    if (!searchId) {
      if (DEBUG_SEARCH_PAGE) {
        console.warn(`${LOG_PREFIX} ⚠️ No search ID provided`);
      }
      setError('No search ID provided');
      setLoading(false);
      return;
    }

    const fetchSearchCache = async () => {
      try {
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} 🔄 Fetching search cache for ID:`, searchId);
        }
        
        const response = await searchCacheAPI.getSearchCache(searchId, true);
        
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} 📨 Cache API response:`, {
            success: response.success,
            hasCacheData: !!response.searchCache,
            cacheKeys: response.searchCache ? Object.keys(response.searchCache) : []
          });
        }
        
        if (!response.success || !response.searchCache) {
          if (DEBUG_SEARCH_PAGE) {
            console.error(`${LOG_PREFIX} ❌ Search results not found in cache`);
          }
          setError('Search results not found');
          return;
        }

        const cacheData = response.searchCache;
        
        // Set search query for dynamic title
        if (cacheData.query) {
          setSearchQuery(cacheData.query);
        }
        
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} ✅ Loaded search cache:`);
          console.log(`${LOG_PREFIX} 🔍 Query:`, cacheData.query);
          console.log(`${LOG_PREFIX} 📊 Results count:`, cacheData.results?.length || cacheData.services?.length || 'N/A');
          console.log(`${LOG_PREFIX} 📝 Description:`, cacheData.description);
          console.log(`${LOG_PREFIX} 🎯 Search type:`, cacheData.searchType);
          console.log(`${LOG_PREFIX} 🏷️ Has dynamic filters:`, !!cacheData.dynamicFilters);
          console.log(`${LOG_PREFIX} 📄 Full cache:`, cacheData);
        }
        
        // Check if this is a multi-entity search
        const isMultiEntity = !!(cacheData.results || cacheData.processedResults || cacheData.searchType);
        setIsMultiEntitySearch(isMultiEntity);
        
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} 🔍 Multi-entity search:`, isMultiEntity);
        }
        
        // Transform cached data to SearchResults format
        console.log(`${LOG_PREFIX} 🔄 About to transform cache data:`, cacheData);
        const transformedResults = searchCacheAPI.transformCacheToSearchResults(cacheData);
        console.log(`${LOG_PREFIX} ✨ Transformation complete:`, {
          originalCount: cacheData.results?.length || cacheData.services?.length || 0,
          transformedCount: transformedResults.length,
          sampleTransformed: transformedResults[0] || null,
          fullTransformed: transformedResults
        });
        
        if (transformedResults.length === 0) {
          console.warn(`${LOG_PREFIX} ⚠️ TRANSFORMATION RETURNED EMPTY ARRAY!`);
          console.warn(`${LOG_PREFIX} 📊 Cache data structure:`, {
            hasResults: !!cacheData.results,
            hasServices: !!cacheData.services,
            hasMetadata: !!cacheData.metadata,
            hasEnhancedResults: !!cacheData.metadata?.enhanced_results,
            metadataKeys: cacheData.metadata ? Object.keys(cacheData.metadata) : []
          });
        }
        
        // Sort the results: reverse order then by rating (highest first)
        const sortedResults = [...transformedResults]
          .reverse() // Reverse the original order first
          .sort((a, b) => {
            // Extract rating values, handle both avgRating and rating properties
            const aRating = a.avgRating || a.rating || a.stats?.avgRating || 0;
            const bRating = b.avgRating || b.rating || b.stats?.avgRating || 0;
            
            // Sort by rating descending (highest first)
            return bRating - aRating;
          });
        
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} 📊 Sorted results by rating:`, {
            originalLength: transformedResults.length,
            sortedLength: sortedResults.length,
            topRating: sortedResults[0]?.avgRating || sortedResults[0]?.rating || sortedResults[0]?.stats?.avgRating || 'N/A',
            sampleSorted: sortedResults.slice(0, 3).map(r => ({ 
              name: r.name, 
              rating: r.avgRating || r.rating || r.stats?.avgRating || 0 
            }))
          });
        }
        
        setSearchResults(sortedResults);
        
        // Set enhanced data if available - check both direct and metadata locations
        const dynamicFiltersFromCache = cacheData.dynamicFilters || cacheData.metadata?.dynamic_filters;
        if (dynamicFiltersFromCache) {
          if (DEBUG_SEARCH_PAGE) {
            console.log(`${LOG_PREFIX} 🎛️ Setting dynamic filters from cache:`, dynamicFiltersFromCache);
          }
          setDynamicFilters(dynamicFiltersFromCache);
        }
        
        const processedResultsFromCache = cacheData.processedResults || cacheData.metadata?.processed_results;
        if (processedResultsFromCache) {
          if (DEBUG_SEARCH_PAGE) {
            console.log(`${LOG_PREFIX} 📊 Setting processed results from cache:`, processedResultsFromCache.length);
          }
          setProcessedResults(processedResultsFromCache);
        }
        
        const aiSummaryFromCache = cacheData.aiSummary || cacheData.metadata?.ai_summary;
        if (aiSummaryFromCache) {
          if (DEBUG_SEARCH_PAGE) {
            console.log(`${LOG_PREFIX} 🤖 Setting AI summary from cache:`, aiSummaryFromCache);
          }
          setAiSummary(aiSummaryFromCache);
          
        }
        
        // Set AI message based on the search query (NOT description)
        let message;
        
        // Enhanced AI message based on summary data
        if (aiSummaryFromCache && aiSummaryFromCache.searchQuality && transformedResults.length > 0) {
          const qualityText = isRTL 
            ? { excellent: 'ممتازة', good: 'جيدة', fair: 'مقبولة', basic: 'أساسية', poor: 'محدودة' }[aiSummaryFromCache.searchQuality] || aiSummaryFromCache.searchQuality
            : aiSummaryFromCache.searchQuality;
            
          message = isRTL
            ? `تم العثور على ${aiSummaryFromCache.totalResults || transformedResults.length} نتيجة ${qualityText} لبحثك عن "${cacheData.query}"`
            : `Found ${aiSummaryFromCache.totalResults || transformedResults.length} ${qualityText} results for "${cacheData.query}"`;
            
          if (aiSummaryFromCache.hasRecommended) {
            message += isRTL ? ' مع خيارات موصى بها' : ' with recommended options';
          }
        } else if (isMultiEntity && cacheData.metadata?.result_summary) {
          const total = cacheData.metadata.result_summary.total || transformedResults.length;
          message = isRTL
            ? `تم العثور على ${total} نتيجة متنوعة لبحثك عن "${cacheData.query}"`
            : `Found ${total} diverse results for "${cacheData.query}"`;
        } else {
          message = isRTL
            ? `إليك النتائج التي وجدتها لـ "${cacheData.query}"`
            : `Here are the results I found for "${cacheData.query}"`;
        }
        
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} 💬 Setting AI message:`, message);
          console.log(`${LOG_PREFIX} 🔤 Setting initial chat query:`, cacheData.query);
        }
        setAiMessage(message);
        
        // Set the initial chat query to the original search query
        setChatQuery(cacheData.query || '');
        
      } catch (err) {
        if (DEBUG_SEARCH_PAGE) {
          console.error(`${LOG_PREFIX} ❌ Error fetching search cache:`, err);
        }
        setError('Failed to load search results');
      } finally {
        if (DEBUG_SEARCH_PAGE) {
          console.log(`${LOG_PREFIX} ✅ Loading complete`);
        }
        setLoading(false);
      }
    };

    fetchSearchCache();
  }, [searchId, isRTL]);

  // Enhanced chat functionality with debug logging
  const handleChatQueryChange = (value: string) => {
    if (DEBUG_SEARCH_PAGE) {
      console.log(`${LOG_PREFIX} ✏️ Chat query changed:`, value);
    }
    setChatQuery(value);
  };

  const handleChatSubmit = () => {
    if (chatQuery.trim()) {
      if (DEBUG_SEARCH_PAGE) {
        console.log(`${LOG_PREFIX} 🚀 New search query from cached search:`, chatQuery);
        console.log(`${LOG_PREFIX} 💾 Storing in sessionStorage and navigating to home`);
      }
      
      // Store the query in sessionStorage so the home page can pick it up
      sessionStorage.setItem('pendingSearchQuery', chatQuery);
      
      // Navigate back to home page
      window.location.href = '/';
    } else {
      if (DEBUG_SEARCH_PAGE) {
        console.warn(`${LOG_PREFIX} ⚠️ Empty chat query, not submitting`);
      }
    }
  };

  const handleSelectResult = (result: any) => {
    if (DEBUG_SEARCH_PAGE) {
      console.log(`${LOG_PREFIX} 🎯 Result selected:`, result);
    }
    setSelectedResult(result);
  };

  if (!searchId) {
    return <Navigate to="/" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar chatboxInNavbar={false} />
        <div className="flex items-center justify-center min-h-96 pt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-green-primary mx-auto mb-4" />
            <p className="text-text-muted text-lg">
              {isRTL ? 'جاري تحميل النتائج...' : 'Loading search results...'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar chatboxInNavbar={false} />
        <div className="max-w-md mx-auto pt-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background-secondary/50 border border-background-tertiary rounded-lg p-6"
            style={{ boxShadow: 'var(--shadow-soft)' }}
          >
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {isRTL ? 'عذراً! حدث خطأ ما' : 'Oops! Something went wrong'}
            </h2>
            <p className="text-text-muted mb-4">{error}</p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-primary text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                {isRTL ? 'العودة للرئيسية' : 'Return to Home'}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main render with AI-styled SearchResults
  console.log(`${LOG_PREFIX} 🎨 Rendering with:`, {
    searchResultsLength: searchResults.length,
    isMultiEntitySearch,
    dynamicFiltersCount: dynamicFilters.length,
    hasProcessedResults: !!processedResults,
    aiMessage
  });
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar chatboxInNavbar={false} />
      
      {searchResults.length > 0 ? (
        isMultiEntitySearch ? (
          <MultiEntitySearchResults
            searchResults={searchResults}
            onSelectResult={handleSelectResult}
            chatQuery={chatQuery}
            Message={aiMessage}
            onChatQueryChange={handleChatQueryChange}
            onChatSubmit={handleChatSubmit}
            dynamicFilters={dynamicFilters}
            processedResults={processedResults}
            aiSummary={aiSummary}
          />
        ) : (
          <SearchResults
            searchresults={searchResults}
            onSelectResult={handleSelectResult}
            chatQuery={chatQuery}
            Message={aiMessage}
            onChatQueryChange={handleChatQueryChange}
            onChatSubmit={handleChatSubmit}
            cacheInfo={{ 
              dynamicFilters: dynamicFilters,
              processedResults: processedResults,
              aiSummary: aiSummary,
              id: searchId,
              shareUrl: `${window.location.origin}/search?id=${searchId}`
            }}
          />
        )
      ) : (
        <div className="pt-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <p className="text-text-muted text-lg mb-6">
              {isRTL ? 'لم يتم العثور على نتائج' : 'No search results found'}
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-primary text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                {isRTL ? 'العودة للرئيسية' : 'Return to Home'}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
