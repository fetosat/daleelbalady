import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
// Navbar is handled by App Router layout
import { Hero } from '@/components/Hero';
import { SearchResults } from '@/components/SearchResults';
import { searchSocket } from '@/services/searchSocket';

type AppState = 'hero' | 'searching' | 'results';

const Index = () => {
  const { i18n } = useTranslation();
  const [appState, setAppState] = useState<AppState>('hero');
  const [chatQuery, setChatQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [Message, setMessage] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [searchCacheInfo, setSearchCacheInfo] = useState(null);
  const [searchresults, setSearchResults] = useState([]);

  // Set dynamic document title
  useDocumentTitle('titles.home');

  // Debug logging
  console.log('Index component rendered, appState:', appState);
  console.log('i18n language:', i18n.language);

  // Set initial direction based on language
  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  // Removed old search listeners - now handled by FloatingChatbox context


  const handleSelectResult = (result: any) => {
    setSelectedResult(result);
  };

  const handleChatSubmit = () => {
    // Handle chat submission
    if (chatQuery.trim()) {
      setAppState('searching');
      // Add your search logic here
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects with Green Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-60"
          style={{ background: 'var(--gradient-hero-accent)' }}
        />
        <div className="absolute top-20 right-20 w-40 h-40 bg-green-subtle rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-40 left-20 w-32 h-32 bg-green-subtle rounded-full blur-2xl opacity-20" />
      </div>

      {/* Navbar is handled by App Router layout.tsx */}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {appState === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(10px)",
              scale: 0.98,
              transition: { duration: 0.5 }
            }}
          >
            <Hero />
          </motion.div>
        )}

        {appState === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(12px)"
            }}
          >
            {/* Keep the search box visible during transition */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -40 }}
              className="absolute w-full max-w-2xl px-6"
            >
              <input
                type="text"
                value={chatQuery}
                readOnly
                className="w-full px-8 py-6 text-xl rounded-full bg-background/90 backdrop-blur-md border border-green-subtle text-text-primary"
              />
            </motion.div>

            {/* Loading animation */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 40 }}
              className="text-center relative z-10"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-green-primary/20 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-background/10 border-t-green-primary rounded-full mx-auto mb-4"
                />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-white/90 mt-6"
              >
                {i18n.language === 'ar' ? 'أبحث لك...' : 'Searching for you...'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {appState === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-30"
          >
            <SearchResults
              searchresults={searchresults}
              onSelectResult={handleSelectResult}
              chatQuery={chatQuery}
              Message={Message}
              onChatQueryChange={setChatQuery}
              onChatSubmit={handleChatSubmit}
              cacheInfo={searchCacheInfo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
