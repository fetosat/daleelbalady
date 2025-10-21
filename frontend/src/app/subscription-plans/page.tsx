'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  Shield,
  Star,
  Calendar,
  Zap,
  Crown,
  Diamond,
  Trophy,
  Users,
  Heart,
  Sparkles,
  TrendingUp,
  BarChart3,
  Headphones,
  Award,
  Percent,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { subscriptionsAPI } from '@/lib/subscriptions-api';
import { useNavigate } from '@/lib/router-compat';
import { PlanCard, FeatureShowcase, SubscriptionTabs } from '@/components/subscriptions';
import type { Subscription } from '@/lib/auth';

export default function SubscriptionPlansPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'user' | 'provider'>('user');

  // Determine user role
  const isProvider = user?.role === 'PROVIDER' || user?.role === 'SHOP_OWNER';
  const isCustomer = user?.role === 'CUSTOMER' || user?.role === 'GUEST';

  // Set default view based on user role
  useEffect(() => {
    if (isProvider) {
      setViewMode('provider');
    } else if (isCustomer) {
      setViewMode('user');
    }
  }, [isProvider, isCustomer]);

  // Get current subscription
  const currentPlanId = userSubscriptions.length > 0 ? userSubscriptions[0].planName : (isProvider ? 'BASIC_FREE' : 'FREE');

  // Fetch user's current subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setSubscriptionsLoading(false);
        return;
      }

      try {
        setSubscriptionsLoading(true);
        const subscriptions = await subscriptionsAPI.getUserSubscriptions();
        setUserSubscriptions(subscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        setUserSubscriptions([]);
      } finally {
        setSubscriptionsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  // Provider Plans Data
  const providerPlans = [
    {
      id: 'BASIC_FREE',
      name: t('subscriptions.providerPlans.plans.basic.name'),
      price: 0,
      yearlyPrice: 0,
      icon: Star,
      color: 'text-stone-600',
      gradient: 'from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700',
      features: t('subscriptions.providerPlans.plans.basic.features', { returnObjects: true }) as string[],
    },
    {
      id: 'BOOKING_BASIC',
      name: t('subscriptions.providerPlans.plans.booking.name'),
      price: 83,
      yearlyPrice: 1000,
      icon: Calendar,
      color: 'text-blue-600',
      gradient: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
      popular: true,
      features: t('subscriptions.providerPlans.plans.booking.features', { returnObjects: true }) as string[],
    },
    {
      id: 'PRODUCTS_PREMIUM',
      name: t('subscriptions.providerPlans.plans.products.name'),
      price: 167,
      yearlyPrice: 2000,
      icon: Zap,
      color: 'text-purple-600',
      gradient: 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800',
      features: t('subscriptions.providerPlans.plans.products.features', { returnObjects: true }) as string[],
    },
    {
      id: 'TOP_BRONZE',
      name: t('subscriptions.providerPlans.plans.bronze.name'),
      price: 833,
      yearlyPrice: 10000,
      icon: Trophy,
      color: 'text-orange-600',
      gradient: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800',
      badge: t('subscriptions.providerPlans.plans.bronze.badge'),
      features: t('subscriptions.providerPlans.plans.bronze.features', { returnObjects: true }) as string[],
    },
    {
      id: 'TOP_SILVER',
      name: t('subscriptions.providerPlans.plans.silver.name'),
      price: 1667,
      yearlyPrice: 20000,
      icon: Crown,
      color: 'text-stone-500',
      gradient: 'from-stone-300 to-stone-400 dark:from-stone-600 dark:to-stone-500',
      badge: t('subscriptions.providerPlans.plans.silver.badge'),
      features: t('subscriptions.providerPlans.plans.silver.features', { returnObjects: true }) as string[],
    },
    {
      id: 'TOP_GOLD',
      name: t('subscriptions.providerPlans.plans.gold.name'),
      price: 2500,
      yearlyPrice: 30000,
      icon: Diamond,
      color: 'text-yellow-500',
      gradient: 'from-yellow-200 to-yellow-300 dark:from-yellow-700 dark:to-yellow-600',
      badge: t('subscriptions.providerPlans.plans.gold.badge'),
      features: t('subscriptions.providerPlans.plans.gold.features', { returnObjects: true }) as string[],
    },
  ];

  // User Plans Data
  const userPlans = [
    {
      id: 'FREE',
      name: t('subscriptions.userPlans.plans.free.name'),
      price: 0,
      features: t('subscriptions.userPlans.plans.free.features', { returnObjects: true }) as string[],
      color: 'text-stone-600',
    },
    {
      id: 'MEDICAL_CARD',
      name: t('subscriptions.userPlans.plans.medical.name'),
      price: 120,
      features: t('subscriptions.userPlans.plans.medical.features', { returnObjects: true }) as string[],
      color: 'text-green-600',
    },
    {
      id: 'ALL_INCLUSIVE',
      name: t('subscriptions.userPlans.plans.allInclusive.name'),
      price: 300,
      features: t('subscriptions.userPlans.plans.allInclusive.features', { returnObjects: true }) as string[],
      color: 'text-purple-600',
      popular: true,
    },
  ];

  // Handle plan selection
  const handlePayment = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId);

    try {
      if (planId === 'FREE' || planId === 'BASIC_FREE') {
        if (!user) {
          navigate('/signup');
          return;
        }
        if (currentPlanId === planId) {
          return;
        }
      }

      if (!user && planId !== 'FREE' && planId !== 'BASIC_FREE') {
        localStorage.setItem('intended-plan', planId);
        navigate('/signup');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('intended-plan', planId);
      }

      const query = new URLSearchParams({ plan: planId });
      navigate(`/payment-checkout?${query.toString()}`, {
        state: { planId },
      });
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  // Features for showcase
  const providerFeatures = [
    {
      icon: TrendingUp,
      title: t('subscriptions.features.visibility.title'),
      description: t('subscriptions.features.visibility.description'),
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      icon: BarChart3,
      title: t('subscriptions.features.analytics.title'),
      description: t('subscriptions.features.analytics.description'),
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    },
    {
      icon: Headphones,
      title: t('subscriptions.features.priority.title'),
      description: t('subscriptions.features.priority.description'),
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
    },
    {
      icon: Award,
      title: t('subscriptions.features.badges.title'),
      description: t('subscriptions.features.badges.description'),
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    },
  ];

  const userFeatures = [
    {
      icon: Percent,
      title: isRTL ? 'خصومات حصرية' : 'Exclusive Discounts',
      description: isRTL ? 'احصل على خصومات من آلاف مقدمي الخدمات' : 'Get discounts from thousands of service providers',
      gradient: 'bg-gradient-to-br from-red-500 to-rose-600',
    },
    {
      icon: Users,
      title: isRTL ? 'خطط عائلية' : 'Family Plans',
      description: isRTL ? 'أضف حتى 5 أفراد من العائلة' : 'Add up to 5 family members',
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    },
    {
      icon: QrCode,
      title: isRTL ? 'بطاقة رقمية' : 'Digital Card',
      description: isRTL ? 'بطاقة رقمية سهلة الاستخدام مع رمز QR' : 'Easy-to-use digital card with QR code',
      gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
    {
      icon: Zap,
      title: isRTL ? 'تفعيل فوري' : 'Instant Activation',
      description: isRTL ? 'ابدأ في الاستفادة من الخصومات فورًا' : 'Start benefiting from discounts instantly',
      gradient: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:bg-muted/80"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('subscriptions.back')}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('subscriptions.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('subscriptions.subtitle')}
                </p>
              </div>
            </div>

            {/* Current plan indicator */}
            {user && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  {t('subscriptions.currentPlan')}: {currentPlanId}
                </Badge>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading State */}
        {(authLoading || subscriptionsLoading) ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                {t('subscriptions.loading')}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* View Toggle Tabs */}
            {(isProvider || isCustomer) && (
              <div className="mb-12">
                <SubscriptionTabs
                  tabs={[
                    {
                      id: 'user',
                      label: t('subscriptions.toggleView.user'),
                      icon: Users,
                    },
                    {
                      id: 'provider',
                      label: t('subscriptions.toggleView.provider'),
                      icon: Trophy,
                    },
                  ]}
                  activeTab={viewMode}
                  onChange={(tab) => setViewMode(tab as 'user' | 'provider')}
                  isRTL={isRTL}
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {viewMode === 'provider' ? (
                <motion.div
                  key="provider"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Provider Plans Header */}
                  <div className="text-center mb-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-primary/20"
                    >
                      <Sparkles className="h-4 w-4" />
                      {t('subscriptions.providerPlans.badge')}
                    </motion.div>

                    <h2 className="text-4xl font-bold text-foreground mb-4">
                      {t('subscriptions.providerPlans.title')}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                      {t('subscriptions.providerPlans.description')}
                    </p>
                  </div>

                  {/* Yearly Toggle */}
                  <div className="flex justify-center mb-12">
                    <SubscriptionTabs
                      tabs={[
                        {
                          id: 'monthly',
                          label: t('subscriptions.providerPlans.billingCycle.monthly'),
                          icon: Calendar,
                        },
                        {
                          id: 'yearly',
                          label: t('subscriptions.providerPlans.billingCycle.yearly'),
                        },
                      ]}
                      activeTab={isYearly ? 'yearly' : 'monthly'}
                      onChange={(tab) => setIsYearly(tab === 'yearly')}
                      isRTL={isRTL}
                    />
                  </div>

                  {/* Provider Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {providerPlans.map((plan, index) => {
                      const price = isYearly ? plan.yearlyPrice : plan.price;
                      const period = isYearly 
                        ? t('subscriptions.pricing.perYear') 
                        : t('subscriptions.pricing.perMonth');
                      const isCurrentPlan = currentPlanId === plan.id;

                      return (
                        <PlanCard
                          key={plan.id}
                          id={plan.id}
                          name={plan.name}
                          price={price}
                          period={period}
                          features={plan.features}
                          icon={plan.icon}
                          gradient={plan.gradient}
                          color={plan.color}
                          popular={plan.popular}
                          badge={plan.badge}
                          isCurrentPlan={isCurrentPlan}
                          isLoading={loading && selectedPlan === plan.id}
                          onSelect={handlePayment}
                          index={index}
                          isRTL={isRTL}
                          currency={t('subscriptions.pricing.egp')}
                          buttonText={price === 0 ? t('subscriptions.actions.startFree') : t('subscriptions.actions.subscribeNow')}
                          currentPlanText={t('subscriptions.currentPlan')}
                          priceNote={
                            isYearly && plan.price > 0
                              ? `${plan.price} ${t('subscriptions.pricing.egp')}${t('subscriptions.pricing.perMonth')} ${t('subscriptions.pricing.whenPaidAnnually')}`
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Features Showcase */}
                  <FeatureShowcase
                    features={providerFeatures}
                    isRTL={isRTL}
                    title={t('subscriptions.features.title')}
                    subtitle={t('subscriptions.features.subtitle')}
                  />

                  {/* Discount Information */}
                  <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className={isRTL ? 'flex items-start gap-4 flex-row-reverse' : 'flex items-start gap-4'}>
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className={isRTL ? 'text-right' : ''}>
                              <h3 className="font-semibold text-foreground mb-2">
                                {t('subscriptions.providerPlans.discounts.fieldRep.title')}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {t('subscriptions.providerPlans.discounts.fieldRep.description')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-green-200 dark:border-green-800 hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className={isRTL ? 'flex items-start gap-4 flex-row-reverse' : 'flex items-start gap-4'}>
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                              <Heart className="h-6 w-6 text-white" />
                            </div>
                            <div className={isRTL ? 'text-right' : ''}>
                              <h3 className="font-semibold text-foreground mb-2">
                                {t('subscriptions.providerPlans.discounts.matching.title')}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {t('subscriptions.providerPlans.discounts.matching.description')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="user"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* User Plans Header */}
                  <div className="text-center mb-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-purple-500/20"
                    >
                      <Shield className="h-4 w-4" />
                      {t('subscriptions.userPlans.badge')}
                    </motion.div>

                    <h2 className="text-4xl font-bold text-foreground mb-4">
                      {t('subscriptions.userPlans.title')}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                      {t('subscriptions.userPlans.description')}
                    </p>
                  </div>

                  {/* User Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                    {userPlans.map((plan, index) => {
                      const isCurrentPlan = currentPlanId === plan.id;

                      return (
                        <PlanCard
                          key={plan.id}
                          id={plan.id}
                          name={plan.name}
                          price={plan.price}
                          period={t('subscriptions.pricing.perYear')}
                          features={plan.features}
                          color={plan.color}
                          popular={plan.popular}
                          isCurrentPlan={isCurrentPlan}
                          isLoading={loading && selectedPlan === plan.id}
                          onSelect={handlePayment}
                          index={index}
                          isRTL={isRTL}
                          currency={t('subscriptions.pricing.egp')}
                          buttonText={plan.price === 0 ? t('subscriptions.actions.startFree') : t('subscriptions.actions.getCard')}
                          currentPlanText={t('subscriptions.currentPlan')}
                        />
                      );
                    })}
                  </div>

                  {/* Features Showcase */}
                  <FeatureShowcase
                    features={userFeatures}
                    isRTL={isRTL}
                    title={t('subscriptions.features.title')}
                    subtitle={t('subscriptions.features.subtitle')}
                  />

                  {/* New Feature Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12"
                  >
                    <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800 max-w-2xl mx-auto hover:shadow-2xl transition-shadow">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-4">
                            {t('subscriptions.userPlans.newFeature.badge')}
                          </Badge>
                        </motion.div>
                        <h3 className="font-semibold text-foreground text-lg mb-3">
                          {t('subscriptions.userPlans.newFeature.title')}
                        </h3>
                        <p className="text-muted-foreground">
                          {t('subscriptions.userPlans.newFeature.description')}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Access Limited Message */}
            {!isProvider && !isCustomer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <Shield className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {t('subscriptions.access.limited')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('subscriptions.access.requiresAuth')}
                  </p>
                  <Button onClick={() => navigate('/login')}>
                    {t('subscriptions.access.login')}
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
