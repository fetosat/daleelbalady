import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Crown, 
  Diamond, 
  Trophy,
  CreditCard,
  Calendar,
  Users,
  Zap,
  Heart,
  Shield,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from '@/lib/router-compat';
import { useAuth } from '@/lib/auth';
import { subscriptionsAPI } from '@/lib/subscriptions-api';
import type { Subscription } from '@/lib/auth';

interface ProviderPlan {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  yearlyPrice: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: string[];
  featuresAr: string[];
  popular?: boolean;
  badge?: string;
}

interface UserPlan {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  periods: { months: number; price: number }[];
  features: string[];
  featuresAr: string[];
  color: string;
}

const SubscriptionPlans = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const isRTL = i18n.language === 'ar';
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, number>>({});
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  
  // Determine if user should see provider or user plans based on role
  const isProvider = user?.role === 'PROVIDER' || user?.role === 'SHOP_OWNER';
  const isCustomer = user?.role === 'CUSTOMER' || user?.role === 'GUEST';
  
  // Get current subscription plan ID from real data
  const currentUserPlan = userSubscriptions.length > 0 ? userSubscriptions[0].planName : (isProvider ? 'BASIC_FREE' : 'FREE');
  
  // Debug: log subscription data
  console.log('User subscriptions:', userSubscriptions);
  console.log('Current user plan:', currentUserPlan);

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
        
        // Set default periods for user plans (choose the 12-month option by default)
        if (!isProvider) {
          setSelectedPeriods({
            'MEDICAL_CARD': 12,
            'ALL_INCLUSIVE': 12
          });
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        // Set default free subscription if API fails
        setUserSubscriptions([]);
      } finally {
        setSubscriptionsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user, isProvider]);

  const providerPlans: ProviderPlan[] = [
    {
      id: 'BASIC_FREE',
      name: 'Basic (Free)',
      nameAr: 'الأساسي (مجاني)',
      price: 0,
      yearlyPrice: 0,
      icon: Star,
      color: 'text-stone-600',
      gradient: 'from-stone-100 to-stone-200',
      features: [
        'Full business listing',
        'Basic profile setup',
        'Customer reviews',
        'No booking system',
        'No product listing'
      ],
      featuresAr: [
        'عرض كامل للأعمال',
        'إعداد الملف الأساسي',
        'تقييمات العملاء',
        'بدون نظام حجز',
        'بدون عرض منتجات'
      ]
    },
    {
      id: 'BOOKING_BASIC',
      name: 'Booking Package',
      nameAr: 'باقة الحجز',
      price: 83, // 1000 EGP / 12 months
      yearlyPrice: 1000,
      icon: Calendar,
      color: 'text-blue-600',
      gradient: 'from-blue-100 to-blue-200',
      popular: true,
      features: [
        'Everything in Basic',
        'Direct appointment booking',
        'Calendar management',
        'Customer notifications',
        'Booking analytics'
      ],
      featuresAr: [
        'كل ما في الباقة الأساسية',
        'حجز المواعيد المباشر',
        'إدارة التقويم',
        'إشعارات العملاء',
        'تحليلات الحجوزات'
      ]
    },
    {
      id: 'PRODUCTS_PREMIUM',
      name: 'Products Package',
      nameAr: 'باقة المنتجات',
      price: 167, // 2000 EGP / 12 months
      yearlyPrice: 2000,
      icon: Zap,
      color: 'text-purple-600',
      gradient: 'from-purple-100 to-purple-200',
      features: [
        'Everything in Booking Package',
        'Product listing & sales',
        'Inventory management',
        'Order processing',
        'Delivery coordination'
      ],
      featuresAr: [
        'كل ما في باقة الحجز',
        'عرض وبيع المنتجات',
        'إدارة المخزون',
        'معالجة الطلبات',
        'تنسيق التوصيل'
      ]
    },
    {
      id: 'TOP_BRONZE',
      name: 'Top 10 Bronze',
      nameAr: 'المركز 10 البرونزي',
      price: 833, // 10000 EGP / 12 months
      yearlyPrice: 10000,
      icon: Trophy,
      color: 'text-orange-600',
      gradient: 'from-orange-100 to-orange-200',
      badge: 'Priority',
      features: [
        'Everything in Products Package',
        'Top 10 search priority',
        'Featured listing badge',
        'Priority customer support',
        'Advanced analytics'
      ],
      featuresAr: [
        'كل ما في باقة المنتجات',
        'أولوية الظهور في أول 10 نتائج',
        'شارة العرض المميز',
        'دعم عملاء مُمتاز',
        'تحليلات متقدمة'
      ]
    },
    {
      id: 'TOP_SILVER',
      name: 'Top 5 Silver',
      nameAr: 'المركز 5 الفضي',
      price: 1667, // 20000 EGP / 12 months
      yearlyPrice: 20000,
      icon: Crown,
      color: 'text-stone-500',
      gradient: 'from-stone-300 to-stone-400',
      badge: 'Premium',
      features: [
        'Everything in Bronze',
        'Top 5 search priority',
        'Silver verified badge',
        'Premium listing design',
        'Social media integration'
      ],
      featuresAr: [
        'كل ما في البرونزي',
        'أولوية الظهور في أول 5 نتائج',
        'شارة التحقق الفضية',
        'تصميم عرض مُمتاز',
        'تكامل وسائل التواصل'
      ]
    },
    {
      id: 'TOP_GOLD',
      name: 'Top 3 Gold',
      nameAr: 'المركز 3 الذهبي',
      price: 2500, // 30000 EGP / 12 months
      yearlyPrice: 30000,
      icon: Diamond,
      color: 'text-yellow-500',
      gradient: 'from-yellow-200 to-yellow-300',
      badge: 'Ultimate',
      features: [
        'Everything in Silver',
        'Top 3 search priority',
        'Gold verified badge',
        'Promotional video feature',
        'Dedicated account manager',
        'Custom branding options'
      ],
      featuresAr: [
        'كل ما في الفضي',
        'أولوية الظهور في أول 3 نتائج',
        'شارة التحقق الذهبية',
        'ميزة الفيديو الترويجي',
        'مدير حساب مُخصص',
        'خيارات علامة تجارية مُخصصة'
      ]
    }
  ];

  const userPlans: UserPlan[] = [
    {
      id: 'FREE',
      name: 'Free',
      nameAr: 'مجاني',
      price: 0,
      periods: [{ months: 12, price: 0 }],
      features: [
        'Browse all services',
        'Basic search functionality',
        'Read reviews',
        'Contact businesses'
      ],
      featuresAr: [
        'تصفح جميع الخدمات',
        'وظائف البحث الأساسية',
        'قراءة التقييمات',
        'التواصل مع الأعمال'
      ],
      color: 'text-stone-600'
    },
    {
      id: 'MEDICAL_CARD',
      name: 'Medical Directory Card',
      nameAr: 'بطاقة الدليل الطبي',
      price: 120,
      periods: [
        { months: 3, price: 60 },
        { months: 6, price: 90 },
        { months: 12, price: 120 }
      ],
      features: [
        'Access to medical discounts',
        'Up to 5 family members',
        'Digital card with QR code',
        'Priority booking',
        '1 month free trial'
      ],
      featuresAr: [
        'خصومات على الخدمات الطبية',
        'حتى 5 أفراد من العائلة',
        'بطاقة رقمية مع رمز QR',
        'أولوية في الحجز',
        'شهر مجاني تجريبي'
      ],
      color: 'text-green-600'
    },
    {
      id: 'ALL_INCLUSIVE',
      name: 'All-Inclusive Card',
      nameAr: 'البطاقة الشاملة',
      price: 300,
      periods: [
        { months: 3, price: 150 },
        { months: 6, price: 220 },
        { months: 12, price: 300 }
      ],
      features: [
        'Discounts across all categories',
        'Up to 5 family members',
        'Digital card with QR code',
        'Priority booking',
        'Exclusive offers',
        '1 month free trial'
      ],
      featuresAr: [
        'خصومات على جميع الفئات',
        'حتى 5 أفراد من العائلة',
        'بطاقة رقمية مع رمز QR',
        'أولوية في الحجز',
        'عروض حصرية',
        'شهر مجاني تجريبي'
      ],
      color: 'text-purple-600'
    }
  ];

  const handlePayment = async (planId: string, selectedPeriod?: number) => {
    setLoading(true);
    setSelectedPlan(planId);
    
    try {
      // Handle FREE plan
      if (planId === 'FREE') {
        if (!user) {
          // Redirect to signup if not logged in
          navigate('/signup');
          return;
        }
        // If already logged in and on free plan, show they're already on this plan
        if (currentUserPlan === 'FREE') {
          // Already on free plan - no action needed
          return;
        }
      }
      
      // For paid plans, check authentication
      if (!user && planId !== 'FREE') {
        // Store intended plan and redirect to signup
        localStorage.setItem('intended-plan', planId);
        if (selectedPeriod) {
          localStorage.setItem('intended-period', selectedPeriod.toString());
        }
        navigate('/signup');
        return;
      }
      
      // Persist intended plan to ensure availability on the checkout page
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('intended-plan', planId);
          if (selectedPeriod) {
            localStorage.setItem('intended-period', selectedPeriod.toString());
          }
        }
      } catch {}

      // Navigate to checkout page with plan details and URL params as fallback
      const stateData: any = { planId };
      if (selectedPeriod) {
        stateData.selectedPeriod = selectedPeriod;
      }

      const query = new URLSearchParams({ plan: planId, ...(selectedPeriod ? { period: String(selectedPeriod) } : {}) });
      navigate(`/payment-checkout?${query.toString()}`, {
        state: stateData
      });
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-background-tertiary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {isRTL ? 'رجوع' : 'Back'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
                </h1>
                <p className="text-text-secondary">
                  {isRTL ? 'اختر الخطة المناسبة لك' : 'Choose the perfect plan for you'}
                </p>
              </div>
            </div>
            
            {/* Current plan indicator */}
            {user && (
              <div className="flex items-center gap-2 bg-background-secondary/50 px-4 py-2 rounded-full">
                <Badge className="bg-green-primary text-white">
                  {isRTL ? 'الخطة الحالية' : 'Current Plan'}: {currentUserPlan}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Show loading state while fetching subscriptions */}
        {(authLoading || subscriptionsLoading) ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-primary" />
              <p className="text-text-secondary">
                {isRTL ? 'جاري تحميل خطط الاشتراك...' : 'Loading subscription plans...'}
              </p>
            </div>
          </div>
        ) : isProvider ? (
          <>
            {/* Provider Plans */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-green-subtle/20 text-green-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                <Sparkles className="h-4 w-4" />
                {isRTL ? '📦 خطط مقدمي الخدمات' : '📦 Service Provider Plans'}
              </motion.div>
              
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                {isRTL ? 'اختر خطتك المثالية' : 'Choose Your Perfect Plan'}
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                {isRTL 
                  ? 'نوفر مجموعة متنوعة من الباقات لتناسب احتياجات عملك ومساعدتك في الوصول للمزيد من العملاء بسهولة'
                  : 'We offer a variety of packages to suit your business needs and help you reach more customers easily'
                }
              </p>
            </div>

            {/* Yearly Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-4 bg-background-secondary/50 p-1 rounded-full">
                <Button
                  variant={!isYearly ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsYearly(false)}
                  className="rounded-full"
                >
                  {isRTL ? 'شهري' : 'Monthly'}
                </Button>
                <Button
                  variant={isYearly ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsYearly(true)}
                  className="rounded-full flex items-center gap-2"
                >
                  {isRTL ? 'سنوي' : 'Yearly'}
                  <Badge className="bg-green-primary text-white text-xs">
                    {isRTL ? 'وفر أكثر' : 'Save More'}
                  </Badge>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providerPlans.map((plan, index) => {
                const Icon = plan.icon;
                const price = isYearly ? plan.yearlyPrice : plan.price;
                const period = isYearly ? (isRTL ? '/سنة' : '/year') : (isRTL ? '/شهر' : '/month');
                const isCurrentPlan = currentUserPlan === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -transtone-x-1/2">
                        <Badge className="bg-green-primary text-white px-4 py-1">
                          <Star className="h-3 w-3 mr-1" />
                          {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                        </Badge>
                      </div>
                    )}
                    
                    <Card className={`h-full transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      plan.popular ? 'ring-2 ring-green-primary/30 shadow-green' : ''
                    } ${
                      isCurrentPlan ? 'ring-2 ring-blue-primary shadow-blue-primary/20 bg-blue-subtle/10' : ''
                    }`}>
                      <CardHeader className="text-center pb-4">
                        <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4`}>
                          <Icon className={`h-8 w-8 ${plan.color}`} />
                        </div>
                        
                        <CardTitle className="text-xl font-bold text-text-primary">
                          {isRTL ? plan.nameAr : plan.name}
                        </CardTitle>
                        
                        {plan.badge && (
                          <Badge className="mx-auto bg-yellow-400 text-black">
                            {plan.badge}
                          </Badge>
                        )}
                        
                        {isCurrentPlan && (
                          <Badge className="mx-auto bg-blue-primary text-white animate-pulse">
                            {isRTL ? 'نشط' : 'Active'}
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <span className="text-3xl font-bold text-green-primary">
                            {price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                          </span>
                          <span className="text-text-secondary">{period}</span>
                        </div>
                        
                        {isYearly && plan.price > 0 && (
                          <p className="text-sm text-text-muted">
                            {isRTL ? `${plan.price} ج.م/شهر عند الدفع سنويًا` : `${plan.price} EGP/month when paid annually`}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {(isRTL ? plan.featuresAr : plan.features).map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-green-subtle flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-green-primary" />
                              </div>
                              <span className="text-text-secondary text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button 
                          className={`w-full mt-6 ${
                            isCurrentPlan && plan.id === 'BASIC_FREE' 
                              ? 'bg-blue-primary hover:bg-blue-primary/90 ring-2 ring-blue-primary/50' 
                              : ''
                          }`}
                          variant={plan.price === 0 ? (isCurrentPlan ? "default" : "outline") : (plan.popular ? "default" : "outline")}
                          onClick={() => handlePayment(plan.id)}
                          disabled={(loading && selectedPlan === plan.id) || (isCurrentPlan && plan.id === 'BASIC_FREE')}
                        >
                          {loading && selectedPlan === plan.id ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                            </div>
                          ) : isCurrentPlan && plan.id === 'BASIC_FREE' ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              {isRTL ? 'الخطة الحالية' : 'Current Plan'}
                            </>
                          ) : plan.price === 0 ? (
                            isRTL ? 'ابدأ مجانًا' : 'Start Free'
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              {isRTL ? 'اشترك الآن' : 'Subscribe Now'}
                            </>
                          )}
                        </Button>
                        
                        {isCurrentPlan && plan.id !== 'BASIC_FREE' && (
                          <p className="text-xs text-center text-blue-600 mt-2">
                            {isRTL ? '✨ هذه خطتك الحالية' : '✨ This is your current plan'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Discount Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900 dark:to-blue-800 dark:border-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-2">
                        {isRTL ? 'خصم المندوب الميداني' : 'Field Representative Discount'}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {isRTL 
                          ? 'احصل على خصم 20% عند التعاقد عبر مندوب ميداني'
                          : 'Get 20% discount when contracting via a field representative'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 dark:from-green-900 dark:to-green-800 dark:border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-2">
                        {isRTL ? 'خصم المطابقة' : 'Matching Discount'}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {isRTL 
                          ? 'إذا كنت تقدم خصومات لعملاء المنصة، ستحصل على خصم مماثل على اشتراكك'
                          : 'If you offer discounts to platform customers, get an equal discount on your subscription'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : isCustomer ? (
          <>
            {/* User Plans */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-purple-subtle/20 text-purple-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                <Shield className="h-4 w-4" />
                {isRTL ? '💳 بطاقات الخصم الرقمية' : '💳 Digital Discount Cards'}
              </motion.div>
              
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                {isRTL ? 'استمتع بخصومات من مقدمي الخدمات' : 'Enjoy Discounts from Service Providers'}
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                {isRTL 
                  ? 'بطاقات رقمية للخصومات، أنت وحتى 5 أفراد من عائلتك يمكنكم الاستفادة'
                  : 'Digital discount cards. You and up to 5 family members can benefit'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {userPlans.map((plan, index) => {
                const isCurrentPlan = currentUserPlan === plan.id;
                const selectedPeriod = selectedPeriods[plan.id] || (plan.periods?.[plan.periods.length - 1]?.months || 12);
                const currentPeriodData = plan.periods?.find(p => p.months === selectedPeriod) || plan.periods?.[0];
                const currentPrice = currentPeriodData?.price || plan.price;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`h-full transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      isCurrentPlan ? 'ring-2 ring-green-primary shadow-green-primary/20 bg-green-subtle/10' : ''
                    }`}>
                      <CardHeader className="text-center pb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CardTitle className="text-xl font-bold text-text-primary">
                            {isRTL ? plan.nameAr : plan.name}
                          </CardTitle>
                          {isCurrentPlan && (
                            <Badge className="bg-green-primary text-white animate-pulse">
                              {isRTL ? 'نشط' : 'Active'}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Period Selection for paid plans */}
                        {plan.periods && plan.periods.length > 1 ? (
                          <div className="space-y-3">
                            <Select
                              value={selectedPeriod.toString()}
                              onValueChange={(value) => {
                                setSelectedPeriods(prev => ({
                                  ...prev,
                                  [plan.id]: parseInt(value)
                                }));
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {plan.periods.map((period) => (
                                  <SelectItem key={period.months} value={period.months.toString()}>
                                    {period.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'} / {period.months} {isRTL ? 'شهر' : 'months'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <div className="text-center">
                              <span className={`text-3xl font-bold ${plan.color}`}>
                                {currentPrice?.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                              </span>
                              <p className="text-sm text-text-secondary">
                                {isRTL ? `/${selectedPeriod} شهر` : `/${selectedPeriod} months`}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <span className={`text-3xl font-bold ${plan.color}`}>
                              {plan.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                            </span>
                            {plan.price > 0 && (
                              <p className="text-sm text-text-secondary">
                                {isRTL ? '/سنة' : '/year'}
                              </p>
                            )}
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {(isRTL ? plan.featuresAr : plan.features).map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-green-subtle flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3 text-green-primary" />
                              </div>
                              <span className="text-text-secondary text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button 
                          className={`w-full mt-6 ${
                            isCurrentPlan && plan.id === 'FREE' 
                              ? 'bg-green-primary hover:bg-green-primary/90 ring-2 ring-green-primary/50' 
                              : ''
                          }`}
                          variant={plan.price === 0 ? (isCurrentPlan ? "default" : "outline") : "default"}
                          onClick={() => handlePayment(plan.id, currentPrice !== plan.price ? selectedPeriod : undefined)}
                          disabled={(loading && selectedPlan === plan.id) || (isCurrentPlan && plan.id === 'FREE')}
                        >
                          {loading && selectedPlan === plan.id ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                            </div>
                          ) : isCurrentPlan && plan.id === 'FREE' ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              {isRTL ? 'الخطة الحالية' : 'Current Plan'}
                            </>
                          ) : plan.price === 0 ? (
                            isRTL ? 'ابدأ مجانًا' : 'Start Free'
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              {isRTL ? 'احصل على البطاقة' : 'Get Card'}
                            </>
                          )}
                        </Button>
                        
                        {isCurrentPlan && plan.id !== 'FREE' && (
                          <p className="text-xs text-center text-green-600">
                            {isRTL ? '✨ هذه خطتك الحالية' : '✨ This is your current plan'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* New Feature Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-center"
            >
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 max-w-2xl mx-auto dark:from-green-950 dark:to-blue-900 dark:border-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Badge className="bg-green-primary text-white">
                      {isRTL ? 'جديد' : 'NEW'}
                    </Badge>
                    <h3 className="font-semibold text-text-primary">
                      {isRTL ? 'بطاقة رقمية + رمز QR' : 'Digital Card + QR Code'}
                    </h3>
                  </div>
                  <p className="text-text-secondary">
                    {isRTL 
                      ? 'سهولة الاستخدام مع البطاقات الرقمية بدلاً من البطاقات التقليدية. عرض تجريبي: شهر مجاني للمستخدمين الجدد لتجربة الخدمة'
                      : 'Easy to use digital cards instead of physical cards. Intro offer: One free month for new users to try the service'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Show message for users without proper role */
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Shield className="h-16 w-16 mx-auto mb-6 text-stone-400" />
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                {isRTL ? 'الوصول محدود' : 'Access Limited'}
              </h3>
              <p className="text-text-secondary mb-6">
                {isRTL 
                  ? 'يجب أن تكون مقدم خدمة أو عميل للوصول إلى خطط الاشتراك'
                  : 'You must be a provider or customer to access subscription plans'
                }
              </p>
              <Button onClick={() => navigate('/login')} className="mx-auto">
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
