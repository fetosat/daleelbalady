import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, Share2, Clock, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import searchCacheAPI from '../services/searchCacheAPI';
import { SearchResults } from './SearchResults';

interface CachedSearchResultsProps {
  cacheId: string;
  onSelectResult?: (result: any) => void;
  onChatQueryChange?: (query: string) => void;
  onChatSubmit?: () => void;
  chatQuery?: string;
  Message?: string;
}

export function CachedSearchResults({
  cacheId,
  onSelectResult,
  onChatQueryChange,
  onChatSubmit,
  chatQuery = '',
  Message = ''
}: CachedSearchResultsProps) {
  const { t, i18n } = useTranslation();
  const [searchCache, setSearchCache] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (cacheId) {
      loadSearchCache();
    }
  }, [cacheId]);

  const loadSearchCache = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await searchCacheAPI.getSearchCache(cacheId);
      const cache = response.searchCache;
      
      setSearchCache(cache);
      setSearchResults(searchCacheAPI.transformCacheToSearchResults(cache));
      setShareUrl(searchCacheAPI.generateShareUrl(cache.id));
      
    } catch (error) {
      console.error('Error loading search cache:', error);
      
      if (error.message.includes('not found')) {
        setError(i18n.language === 'ar' 
          ? 'لم يتم العثور على نتائج البحث المحفوظة'
          : 'Cached search results not found');
      } else if (error.message.includes('expired')) {
        setError(i18n.language === 'ar'
          ? 'انتهت صلاحية نتائج البحث المحفوظة'
          : 'Cached search results have expired');
      } else {
        setError(i18n.language === 'ar'
          ? 'حدث خطأ في تحميل نتائج البحث'
          : 'Error loading search results');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: searchCache?.query || 'Search Results',
          text: searchCache?.description || 'Check out these search results from Daleel Balady',
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

  const handleRetry = () => {
    loadSearchCache();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {i18n.language === 'ar' ? 'جاري تحميل نتائج البحث...' : 'Loading search results...'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2">
            {i18n.language === 'ar' ? 'خطأ في البحث' : 'Search Error'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header with search info and share button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-700 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white mb-1">
              {searchCache?.query}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              {searchCache?.description && (
                <span>{searchCache.description}</span>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(searchCache?.createdAt).toLocaleDateString(
                      i18n.language === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>
                    {searchCache?.viewCount || 0} {i18n.language === 'ar' ? 'مشاهدة' : 'views'}
                  </span>
                </div>
                
                <span>
                  {searchResults.length} {i18n.language === 'ar' ? 'نتيجة' : 'results'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {showShareSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-lg text-sm font-medium"
              >
                {i18n.language === 'ar' ? 'تم النسخ!' : 'Copied!'}
              </motion.div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {i18n.language === 'ar' ? 'مشاركة' : 'Share'}
            </motion.button>
          </div>
        </div>
        
        {/* Cache metadata */}
        {searchCache?.metadata && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              {searchCache.metadata.city && (
                <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                  📍 {searchCache.metadata.city}
                </span>
              )}
              {searchCache.metadata.location && (
                <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                  🌍 {i18n.language === 'ar' ? 'موقع محدد' : 'Location-based'}
                </span>
              )}
              <span className="bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                🔗 {searchCache.slug}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Search Results */}
      <div className="pt-4">
        <SearchResults
          searchresults={searchResults}
          onSelectResult={onSelectResult}
          chatQuery={chatQuery}
          Message={Message || `${i18n.language === 'ar' ? 'نتائج البحث لـ' : 'Search results for'} "${searchCache?.query}"`}
          onChatQueryChange={onChatQueryChange}
          onChatSubmit={onChatSubmit}
        />
      </div>
    </div>
  );
}

export default CachedSearchResults;
