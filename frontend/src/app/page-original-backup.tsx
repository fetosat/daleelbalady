'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Users,
  Tag,
  Star,
  CheckCircle,
  Zap,
  Crown,
  Gift,
  Sparkles,
  TrendingUp,
  Award,
  Heart,
  Globe
} from 'lucide-react';

// Import new components
import EnhancedHero from '@/components/home/EnhancedHero';
import QuickStats from '@/components/home/QuickStats';
import PopularServices from '@/components/home/PopularServices';
import LandingOffers from '@/components/sections/LandingOffers';
import OffersHeroCarousel from '@/components/sections/OffersHeroCarousel';

// Import missing components
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { BlurredText } from '@/components/ui/blurred-text';

// Import new artistic components
import { FloatingElements, ParticleField } from '@/components/ui/floating-elements';
import { GradientText, AnimatedCounter } from '@/components/ui/gradient-text';
import { GlassCard, FeatureGlassCard } from '@/components/ui/glass-card';
import { ClientOnly } from '@/components/ui/client-only';
import { NoSSR } from '@/components/ui/no-ssr';

// Enhanced Features data with more visual appeal
const features = [
  {
    icon: Shield,
    title: 'نظام PIN الآمن',
    description: 'رقم PIN شهري فريد للحصول على الخصومات في أي متجر مشارك',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Users,
    title: 'خطط عائلية',
    description: 'أضف حتى 5 أفراد من عائلتك واستفيدوا جميعاً من الخصومات',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Tag,
    title: 'عروض حصرية',
    description: 'اكتشف مئات العروض والخصومات في جميع انحاء الجمهورية',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Zap,
    title: 'تفعيل فوري',
    description: 'اعرض رقم PIN في أي متجر واحصل على خصمك فوراً',
    gradient: 'from-orange-500 to-red-500'
  }
];

// Stats data for counters
const stats = [
  { value: 10000, suffix: '+', label: 'مستخدم نشط' },
  { value: 500, suffix: '+', label: 'متجر مشارك' },
  { value: 25, suffix: '%', label: 'متوسط التوفير' },
  { value: 99, suffix: '%', label: 'رضا العملاء' }
];

// Sample offers
const sampleOffers = [
  {
    title: 'خصم 25% على جميع المطاعم',
    discount: '25%',
    category: 'مطاعم'
  },
  {
    title: 'خصم 15% على الأدوية',
    discount: '15%',
    category: 'صيدليات'
  },
  {
    title: 'خصم 200 جنيه على الوقود',
    discount: '200 جنيه',
    category: 'محطات وقود'
  }
];

// Enhanced Features Card Component
const FeatureCard: React.FC<{ feature: any; index: number }> = ({ feature, index }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <Card className="relative border-none shadow-xl hover:shadow-2xl dark:shadow-2xl dark:hover:shadow-green-500/10 transition-all duration-300 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <motion.div 
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          <CardTitle className="text-xl font-bold text-stone-900 dark:text-white">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  
  // Stats data with translations
  const stats = [
    { value: 10000, suffix: '+', label: t('landing.stats.activeUsers') },
    { value: 500, suffix: '+', label: t('landing.stats.partners') },
    { value: 25, suffix: '%', label: t('landing.stats.avgSavings') },
    { value: 99, suffix: '%', label: t('landing.stats.satisfaction') }
  ];

  // Features data with translations
  const features = [
    {
      icon: Shield,
      title: t('landing.features.securePin.title'),
      description: t('landing.features.securePin.description'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: t('landing.features.familyPlans.title'),
      description: t('landing.features.familyPlans.description'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Tag,
      title: t('landing.features.exclusiveOffers.title'),
      description: t('landing.features.exclusiveOffers.description'),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: t('landing.features.instantActivation.title'),
      description: t('landing.features.instantActivation.description'),
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  // Sample offers with translations
  const sampleOffers = [
    {
      title: t('landing.offers.sample1.title'),
      discount: t('landing.offers.sample1.discount'),
      category: t('landing.offers.sample1.category')
    },
    {
      title: t('landing.offers.sample2.title'),
      discount: t('landing.offers.sample2.discount'),
      category: t('landing.offers.sample2.category')
    },
    {
      title: t('landing.offers.sample3.title'),
      discount: t('landing.offers.sample3.discount'),
      category: t('landing.offers.sample3.category')
    }
  ];
  
  // State for dynamically fetched categories with client-side loading check
  const [categoryNames, setCategoryNames] = useState<string[]>(["أطباء", "مطاعم", "صيدليات", "محطات وقود", "متاجر", "فنادق"]);
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Refs for scroll animations - ONLY FOR WORLDMAP
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start end", "end start"] });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = 'https://api.daleelbalady.com/api';
        const fullUrl = `${apiUrl}/advanced-search/categories`;
        console.log('Fetching categories from:', fullUrl);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        console.log('Categories API response status:', response.status);
        console.log('Categories API response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Categories API response data:', data);
          
          if (data.success && data.categories && data.categories.length > 0) {
            // Extract category names and limit to 6 for better UX
            const names = data.categories
              .map((category: any) => category.name)
              .slice(0, 6);
            console.log('Setting category names:', names);
            setCategoryNames(names);
          }
        } else {
          console.error('Categories API failed with status:', response.status);
          const errorText = await response.text();
          console.error('Categories API error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        // Keep default fallback categories if API fails
      }
    };

    fetchCategories();
  }, []);


  return (
    <div className="min-h-screen relative overflow-hidden smooth-scroll">
      {/* Static background - NO MOVEMENT */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient background - FIXED POSITION */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-blue-50/50 to-emerald-50/30 dark:from-stone-950 dark:via-blue-950/50 dark:to-emerald-950/30" />
        
        {/* Subtle animated gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-purple-500/2 to-green-500/2 " />
        
        {/* Minimal floating elements */}
        <ClientOnly fallback={<div className="absolute inset-0 pointer-events-none" />}>
          <FloatingElements count={4} />
        </ClientOnly>
      </div>


      {/* Enhanced Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient layer */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.5) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.5) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.5) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.5) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.5) 0%, transparent 50%), radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.5) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.5) 0%, transparent 50%)',
              ]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Secondary gradient layer */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: 2
            }}
          />
          
          {/* Tertiary accent layer */}
          <motion.div
            className="absolute inset-0 opacity-15"
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.3) 0%, transparent 40%)',
                'radial-gradient(circle at 30% 40%, rgba(234, 179, 8, 0.3) 0%, transparent 40%)',
                'radial-gradient(circle at 70% 60%, rgba(234, 179, 8, 0.3) 0%, transparent 40%)',
                'radial-gradient(circle at 40% 70%, rgba(234, 179, 8, 0.3) 0%, transparent 40%)',
                'radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.3) 0%, transparent 40%)',
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Mesh overlay for texture */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Hero Content with glass morphism */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            {/* Main title with gradient effect */}
            <div className="mb-8">
              <GradientText
                text={t('landing.hero.title')}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-shadow-lg"
                delay={0.2}
                gradient="from-stone-900 via-blue-800 to-emerald-700 dark:from-stone-100 dark:via-blue-300 dark:to-emerald-300"
              />
            </div>

            {/* Dynamic text flipper in glass container */}
            <GlassCard className="max-w-4xl mx-auto mb-8 cursor-pointer" hover={true} glow={true}>
              <div className="py-6">
                <motion.div className="text-xl sm:text-2xl md:text-3xl" suppressHydrationWarning>
                  {isClient ? (
                    <LayoutTextFlip
                      text={t('landing.hero.findNearby')}
                      words={categoryNames}
                      suffix={t('landing.hero.nearYou')}
                      duration={2500}
                    />
                  ) : (
                    <div className="flex items-center justify-center flex-row min-w- gap-2" suppressHydrationWarning>
                      <span className="text-base font-bold tracking-tight drop-shadow-lg md:text-4xl" suppressHydrationWarning>
                        {t('landing.hero.findNearby')}
                      </span>
                      <span className="relative w-fit overflow-hidden rounded-md border border-transparent bg-white px-2 py-1 font-sans text-base font-bold tracking-tight text-black shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg md:text-4xl dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10" suppressHydrationWarning>
                        {categoryNames[0]}
                      </span>
                      <span className="text-base font-bold tracking-tight drop-shadow-lg md:text-4xl" suppressHydrationWarning>
                        {t('landing.hero.nearYou')}
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </GlassCard>

            {/* Subtitle with blur animation - hydration safe */}
            <div suppressHydrationWarning>
              <BlurredText 
                text={t('landing.hero.subtitle')} 
                className="text-lg sm:text-xl mb-10 leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto" 
                delay={0.5}
              />
            </div>

            {/* Enhanced CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-lg px-8 py-6 rounded-2xl shadow-2xl shadow-blue-500/25">
                  <Link href="/signup">
                    <span className="relative z-10 flex items-center gap-2">
                      {t('landing.hero.startNow')}
                      <ArrowRight className="w-5 h-5 group-hover:transtone-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" size="lg" className="glass border-2 border-stone-200/50 dark:border-stone-700/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 text-lg px-8 py-6 rounded-2xl">
                  <Link href="/login">
                    {t('landing.hero.login')}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -transtone-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-stone-300 dark:border-stone-700 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-stone-400 dark:bg-stone-600 rounded-full mt-2 animate-bounce" />
          </div>
        </motion.div>
      </section>
      {/* Widescreen Offers Hero Carousel */}
      {/* <OffersHeroCarousel /> */}

      {/* Enhanced Stats Section with Images */}
      <QuickStats />

      {/* Dynamic Offers Carousel Section */}
      <LandingOffers />

      {/* Enhanced Features Section */}
      <section className="relative py-24 bg-gradient-to-br from-white to-stone-50 dark:from-stone-950 dark:to-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <GradientText
              text={t('landing.features.title')}
              className="text-3xl md:text-4xl lg:text-5xl mb-6"
              gradient="from-stone-800 via-blue-700 to-emerald-600 dark:from-stone-200 dark:via-blue-400 dark:to-emerald-400"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-stone-600 dark:text-stone-400 max-w-3xl mx-auto leading-relaxed"
            >
              {t('landing.features.subtitle')}
            </motion.p>
          </motion.div>

          {/* Enhanced features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FeatureGlassCard
                  key={index}
                  icon={<Icon className="w-8 h-8" />}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Sample Offers Section */}
      <section className="relative py-24 bg-gradient-to-br from-emerald-50/50 to-blue-50/30 dark:from-emerald-950/30 dark:to-blue-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <GradientText
              text={t('landing.offers.title')}
              className="text-3xl md:text-4xl lg:text-5xl mb-6"
              gradient="from-emerald-600 via-teal-600 to-blue-600 dark:from-emerald-400 dark:via-teal-400 dark:to-blue-400"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed"
            >
              {t('landing.offers.subtitle')}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {sampleOffers.map((offer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <GlassCard className="h-full p-6 text-center group">
                  {/* Animated discount badge */}
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 relative"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full animate-pulse-glow" />
                    <div className="relative z-10 bg-white dark:bg-stone-900 rounded-full w-12 h-12 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </motion.div>

                  <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-4">
                    {offer.title}
                  </h3>

                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full text-lg shadow-lg"
                    >
                      {offer.discount}
                    </motion.div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                      {offer.category}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg px-10 py-6 rounded-2xl shadow-2xl shadow-emerald-500/25">
                <Link href="/find">
                  {t('landing.offers.viewAll')}
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-600 dark:from-blue-800 dark:via-purple-800 dark:to-emerald-800" />
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/20 via-transparent to-emerald-500/20" />
        
        {/* Floating elements */}
        <ClientOnly fallback={<div className="absolute inset-0 pointer-events-none" />}>
          <FloatingElements count={10} className="absolute inset-0 pointer-events-none" />
        </ClientOnly>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GradientText
              text={t('landing.cta.title')}
              className="text-3xl md:text-4xl lg:text-5xl mb-6 text-white"
              gradient="from-white via-blue-100 to-emerald-100"
              shimmer={false}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {t('landing.cta.subtitle')}
            </motion.p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {[
              { icon: CheckCircle, title: t('landing.cta.freeSignup.title'), desc: t('landing.cta.freeSignup.description') },
              { icon: Shield, title: t('landing.cta.securePin.title'), desc: t('landing.cta.securePin.description') },
              { icon: Star, title: t('landing.cta.instantSavings.title'), desc: t('landing.cta.instantSavings.description') }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 group-hover:bg-white/30 transition-colors">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-6 rounded-2xl shadow-2xl font-bold">
                <Link href="/signup">
                  <span className="flex items-center gap-2">
                    {t('landing.cta.createAccount')}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" size="lg" className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-10 py-6 rounded-2xl">
                <Link href="/subscription-plans">
                  {t('landing.cta.viewPlans')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
