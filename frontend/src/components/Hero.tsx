import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, MapPin, Users, Briefcase, Star, Clock, Search, Heart, TrendingUp, Shield, Award, Calculator, Apple, Truck, Package } from 'lucide-react';
import Link from 'next/link';
import { searchSocket } from '@/services/searchSocket';
import { useTheme } from 'next-themes';
import { SubscriptionPromo } from '@/components/payments/PaymentButton';
import { useChatbox } from '@/contexts/ChatboxContext';
import { WorldMap } from './WorldMap';
import { SplineWrapper } from './SplineWrapper';

interface HeroProps {
  // Remove chatbox props since we're using the shared context
}

export function Hero({}: HeroProps) {
  const { t, i18n } = useTranslation();
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [showSubscriptionPromo, setShowSubscriptionPromo] = useState(true);
  const isRTL = i18n.language === 'ar';
  
  // Use shared chatbox context
  const { chatQuery, setPosition } = useChatbox();

  const { theme, setTheme } = useTheme();
  
  // Spline loading handlers
  const onLoad = useCallback((splineApp: any) => {
    console.log('Spline scene loaded successfully');
    // Optional: Store spline app reference if needed
  }, []);
  
  const onSplineError = useCallback((error: any) => {
    console.warn('Spline scene failed to load:', error);
    // Fallback to static image will be handled by SplineWrapper
  }, []);
  
  const changeBackground = useCallback((color: string) => {
    document.body.style.backgroundColor = color;
  }, []);
  // Sample connection dots for Egypt-focused local service network
  const connectionDots = [
    {
      start: { lat: 30.0444, lng: 31.2357 }, // Cairo
      end: { lat: 31.2001, lng: 29.9187 }, // Alexandria
    },
    {
      start: { lat: 30.0444, lng: 31.2357 }, // Cairo
      end: { lat: 25.6872, lng: 32.6396 }, // Luxor
    },
    {
      start: { lat: 31.2001, lng: 29.9187 }, // Alexandria
      end: { lat: 27.1828, lng: 31.1859 }, // Assiut
    },
    {
      start: { lat: 30.0444, lng: 31.2357 }, // Cairo
      end: { lat: 24.0889, lng: 32.8998 }, // Aswan
    },
    {
      start: { lat: 30.0444, lng: 31.2357 }, // Cairo
      end: { lat: 26.8206, lng: 30.8025 }, // Sohag
    },
  ];

  const suggestions = t('hero.suggestions', { returnObjects: true }) as string[] || [
    "Find a trusted doctor 🩺",
    "Get a job opportunity 💼",
    "Hire a skilled mechanic 🔧",
    "Book a great restaurant 🍽️",
    "Find a reliable lawyer ⚖️",
    "Discover local shops 🛒"
  ];

  // Debug logging
  console.log('Hero component rendered');
  console.log('i18n language:', i18n.language);
  console.log('i18n is ready:', i18n.isInitialized);
  console.log('raw t("hero.suggestions"):', t('hero.suggestions', { returnObjects: true }));
  console.log('suggestions:', suggestions);
  console.log('isRTL:', isRTL);
  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      changeBackground(systemTheme === 'dark' ? '#000000' : '#FFFFFF');
      return;
    }

    changeBackground(theme === 'dark' ? '#000000' : '#FFFFFF');
  }, [theme]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);

    // Set position to hero when component mounts
    setPosition('hero');

    return () => {
      clearInterval(interval);
    };
  }, [suggestions.length, setPosition]);


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient with Green Accent */}
      <motion.div
        animate={{
          opacity: chatQuery ? 0.2 : 0.4,
          scale: chatQuery ? 1.05 : 1,
          filter: chatQuery ? "blur(8px)" : "blur(0px)"
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0"
        style={{ background: 'var(--gradient-hero-accent)' }}
      />

      {/* Ambient Orbs
      <motion.div
        animate={{
          opacity: chatQuery ? 0.3 : 0.6,
          scale: chatQuery ? 1.2 : 1,
          filter: chatQuery ? "blur(40px)" : "blur(30px)"
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-transparent rounded-full"
      />
      <motion.div
        animate={{
          opacity: chatQuery ? 0.2 : 0.4,
          scale: chatQuery ? 1.2 : 1,
          filter: chatQuery ? "blur(30px)" : "blur(20px)"
        }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-transparent rounded-full"
      /> */}

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: chatQuery ? 0.8 : 0.4,
          scale: chatQuery ? 1.05 : 1,
          filter: chatQuery ? "blur(4px)" : "blur(0px)"
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: chatQuery ? 0.5 : 0.4,
            scale: chatQuery ? 1.05 : 1,
            filter: chatQuery ? "blur(4px)" : "blur(0px)"
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 flex bg-green-950 dark:bg-green-400/50 items-center justify-center"
        ></motion.div>
        <SplineWrapper
          onLoad={onLoad}
          onError={onSplineError}
          scene="https://prod.spline.design/C5EpvN6B6K3P3Txb/scene.splinecode"
          className="w-full h-full"
        />

        {/* <img
          src={heroImage}
          alt="AI Assistant"
          className="w-full h-full object-cover"
        />
        */}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center h-[calc(100vh-10rem)] max-w-4xl mx-auto px-6 flex flex-col items-center justify-between">
        {/* Main Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-text-primary mb-4 leading-tight"
        >
          {t('hero.tagline') || 'Your Local AI Guide.'}

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-text-secondary mb-12 font-medium"
          >
            {t('hero.subline') || 'Find services, jobs, doctors, shops & more in seconds.'}
          </motion.p>
        </motion.h1>

        {/* Subscription Promotion */}
        {showSubscriptionPromo && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full max-w-4xl mb-8 relative"
          >
            <button
              onClick={() => setShowSubscriptionPromo(false)}
              className="absolute -top-2 -right-2 z-20 bg-stone-800 hover:bg-stone-700 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Close subscription promotion"
            >
              <X size={16} />
            </button>
            <SubscriptionPromo planType="PROVIDER" discount={20} />
          </motion.div>
        )}

        {/* Rotating Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="h-20 flex items-center justify-center flex-col w-screen mb-12"
        >
          <motion.p
            key={currentSuggestionIndex}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-2xl text-text-secondary font-medium flex items-center gap-2"
          >
            <span className="inline-block w-2 h-2 bg-green-primary rounded-full animate-pulse" />
            {suggestions[currentSuggestionIndex]}
          </motion.p>

          {/* Chatbox is now handled by FloatingChatbox component */}
        </motion.div>

        {/* Delivery Service Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Delivery Card */}
            <Link href="/delivery/new" className="block">
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-4 shadow-xl border border-blue-400/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {isRTL ? '🚚 اطلب توصيل' : '🚚 Request Delivery'}
                    </h4>
                    <p className="text-blue-100 text-xs">
                      {isRTL ? 'احصل على طلباتك بسرعة' : 'Get your items delivered fast'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Delivery Driver Card */}
            <Link href="/delivery/dashboard" className="block">
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-4 shadow-xl border border-orange-400/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {isRTL ? '🏍️ كن مندوب' : '🏍️ Be a Driver'}
                    </h4>
                    <p className="text-orange-100 text-xs">
                      {isRTL ? 'ابدأ الربح من التوصيل' : 'Start earning from deliveries'}
                    </p>
                  </div>
                </div>
                
                {/* NEW Badge */}
                <div className="absolute top-2 right-2">
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {isRTL ? 'جديد' : 'NEW'}
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* CoachDiet Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
        >
          <Link href="/coach-diet" className="block">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl p-6 shadow-2xl border border-green-400/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer"
            >
              {/* Shine Effect */}
              <motion.div
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {isRTL ? 'كوتش & دايت' : 'Coach & Diet'}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {isRTL ? 'احسب سعراتك وتتبع صحتك' : 'Track Your Health & Nutrition'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Apple className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute top-3 right-3">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full"
                >
                  {isRTL ? 'جديد' : 'NEW'}
                </motion.div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
