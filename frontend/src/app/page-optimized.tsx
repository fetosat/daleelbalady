'use client';

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Users,
  Tag,
  Star,
  CheckCircle,
  Zap,
  Search,
  MapPin,
  Clock,
  TrendingUp,
  Phone,
  Mail
} from 'lucide-react';

// Lazy load heavy components
const QuickStats = lazy(() => import('@/components/home/QuickStats'));
const PopularServices = lazy(() => import('@/components/home/PopularServices'));
const LandingOffers = lazy(() => import('@/components/sections/LandingOffers'));

// Import mobile CSS
import '@/styles/homepage-mobile.css';

// Simple loading component
const LoadingCard = () => (
  <div className="skeleton-mobile rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
  </div>
);

// Optimized Features data
const features = [
  {
    icon: Shield,
    title: 'نظام PIN الآمن',
    description: 'رقم PIN شهري فريد للحصول على الخصومات',
    color: 'text-blue-600'
  },
  {
    icon: Users,
    title: 'خطط عائلية',
    description: 'أضف حتى 5 أفراد من عائلتك',
    color: 'text-purple-600'
  },
  {
    icon: Tag,
    title: 'عروض حصرية',
    description: 'مئات العروض والخصومات',
    color: 'text-green-600'
  },
  {
    icon: Zap,
    title: 'تفعيل فوري',
    description: 'احصل على خصمك فوراً',
    color: 'text-orange-600'
  }
];

// Optimized Feature Card
const FeatureCard = React.memo(({ feature, index }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="no-hover-mobile"
    >
      <Card className="p-6 h-full border-0 shadow-md mobile-shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-stone-800">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${feature.color}`} />
        </div>
        <h3 className="text-lg font-bold mb-2 text-stone-900 dark:text-white">
          {feature.title}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {feature.description}
        </p>
      </Card>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

// Optimized Hero Section Component
const HeroSection = React.memo(() => {
  const { t } = useTranslation();
  const [categories] = useState(['أطباء', 'مطاعم', 'صيدليات', 'متاجر', 'فنادق', 'خدمات']);
  const [currentCategory, setCurrentCategory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory(prev => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [categories.length]);

  return (
    <section className="hero-mobile full-height-mobile relative flex items-center justify-center overflow-hidden mobile-gradient">
      {/* Simple gradient background - no heavy animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-blue-50/30 to-emerald-50/20 dark:from-stone-950 dark:via-blue-950/30 dark:to-emerald-950/20" />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mobile-spacing">
        <div className="text-center">
          {/* Optimized title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-stone-900 dark:text-white hero-title-mobile">
            {t('landing.hero.title', 'دليل بلدي - دليلك الذكي')}
          </h1>
          
          {/* Category switcher - simple transition */}
          <div className="mb-6 h-12 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl">
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {t('landing.hero.findNearby', 'اكتشف')}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="font-bold text-green-600 dark:text-green-400 px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20"
                >
                  {categories[currentCategory]}
                </motion.span>
              </AnimatePresence>
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {t('landing.hero.nearYou', 'بالقرب منك')}
              </span>
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg mb-8 text-stone-600 dark:text-stone-400 max-w-2xl mx-auto hero-subtitle-mobile">
            {t('landing.hero.subtitle', 'احصل على أفضل الخصومات والعروض الحصرية مع نظام PIN الشهري')}
          </p>
          
          {/* CTA buttons - touch optimized */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="touch-button w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl shadow-lg"
            >
              <Link href="/signup">
                <span className="flex items-center gap-2">
                  {t('landing.hero.startNow', 'ابدأ الآن')}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="touch-button w-full sm:w-auto border-2 border-stone-300 dark:border-stone-600 rounded-xl"
            >
              <Link href="/login">
                {t('landing.hero.login', 'تسجيل الدخول')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Simple scroll indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 border-2 border-stone-300 dark:border-stone-600 rounded-full flex justify-center"
        >
          <div className="w-1 h-2 bg-stone-400 dark:bg-stone-500 rounded-full mt-1" />
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

// Quick Actions Component
const QuickActions = React.memo(() => {
  const { t } = useTranslation();
  
  const actions = [
    { icon: Search, label: 'بحث سريع', href: '/search' },
    { icon: MapPin, label: 'بالقرب مني', href: '/nearby' },
    { icon: Tag, label: 'عروض اليوم', href: '/offers' },
    { icon: Star, label: 'المفضلة', href: '/favorites' }
  ];
  
  return (
    <section className="py-8 px-4 mobile-spacing bg-white dark:bg-stone-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors duration-200 touch-manipulation"
              >
                <Icon className="w-8 h-8 mb-2 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
});

QuickActions.displayName = 'QuickActions';

// Main HomePage Component
const HomePageOptimized: React.FC = () => {
  const { t } = useTranslation();
  
  // Sample offers
  const sampleOffers = [
    {
      title: 'خصم 25% على جميع المطاعم',
      discount: '25%',
      category: 'مطاعم',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'خصم 15% على الأدوية',
      discount: '15%',
      category: 'صيدليات',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'خصم 200 جنيه على الوقود',
      discount: '200 جنيه',
      category: 'محطات وقود',
      color: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-fix smooth-scroll-mobile">
      {/* Optimized Hero Section */}
      <HeroSection />
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Quick Stats - Lazy loaded */}
      <Suspense fallback={<LoadingCard />}>
        <QuickStats />
      </Suspense>
      
      {/* Features Section - Optimized */}
      <section className="py-12 mobile-spacing bg-stone-50 dark:bg-stone-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-stone-900 dark:text-white">
              {t('landing.features.title', 'لماذا دليل بلدي؟')}
            </h2>
            <p className="text-base text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              {t('landing.features.subtitle', 'منصة متكاملة توفر لك أفضل الخدمات والعروض')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mobile-card-grid">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Sample Offers - Simplified */}
      <section className="py-12 mobile-spacing bg-white dark:bg-stone-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-stone-900 dark:text-white">
              {t('landing.offers.title', 'عروض مميزة')}
            </h2>
            <p className="text-base text-stone-600 dark:text-stone-400">
              {t('landing.offers.subtitle', 'اكتشف أحدث العروض والخصومات')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleOffers.map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-stone-800 dark:text-stone-200">
                    {offer.title}
                  </h3>
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mb-2 ${offer.color}`}>
                    {offer.discount}
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {offer.category}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button 
              asChild 
              size="lg" 
              className="touch-button bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              <Link href="/offers">
                {t('landing.offers.viewAll', 'عرض جميع العروض')}
                <ArrowRight className="mr-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Popular Services - Lazy loaded */}
      <Suspense fallback={<LoadingCard />}>
        <PopularServices />
      </Suspense>
      
      {/* Landing Offers - Lazy loaded */}
      <Suspense fallback={<LoadingCard />}>
        <LandingOffers />
      </Suspense>
      
      {/* Simple CTA Section */}
      <section className="py-16 mobile-spacing bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {t('landing.cta.title', 'ابدأ رحلتك معنا اليوم')}
          </h2>
          <p className="text-lg mb-8 opacity-90">
            {t('landing.cta.subtitle', 'انضم لآلاف المستخدمين واستمتع بأفضل العروض')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <CheckCircle className="w-10 h-10 mb-2" />
              <span className="font-medium">{t('landing.cta.freeSignup.title', 'تسجيل مجاني')}</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-10 h-10 mb-2" />
              <span className="font-medium">{t('landing.cta.securePin.title', 'PIN آمن')}</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-10 h-10 mb-2" />
              <span className="font-medium">{t('landing.cta.instantSavings.title', 'توفير فوري')}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="touch-button bg-white text-blue-600 hover:bg-gray-100 rounded-xl"
            >
              <Link href="/signup">
                {t('landing.cta.createAccount', 'إنشاء حساب')}
                <ArrowRight className="mr-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="touch-button border-2 border-white text-white hover:bg-white/10 rounded-xl"
            >
              <Link href="/subscription-plans">
                {t('landing.cta.viewPlans', 'عرض الخطط')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <footer className="py-8 mobile-spacing bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold mb-3">دليل بلدي</h3>
              <p className="text-sm text-stone-400">
                منصتك الموثوقة للخصومات والعروض
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">روابط سريعة</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-stone-400 hover:text-white">
                  من نحن
                </Link>
                <Link href="/contact" className="block text-sm text-stone-400 hover:text-white">
                  اتصل بنا
                </Link>
                <Link href="/terms" className="block text-sm text-stone-400 hover:text-white">
                  الشروط والأحكام
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">تواصل معنا</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Phone className="w-4 h-4" />
                  <span>01234567890</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Mail className="w-4 h-4" />
                  <span>info@daleelbalady.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-stone-700 text-center text-sm text-stone-400">
            © 2024 دليل بلدي. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePageOptimized;
