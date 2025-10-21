import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Check,
  Star,
  Crown,
  Diamond,
  Trophy,
  Calendar,
  Zap,
  Shield,
  Users,
  Heart,
  Calculator,
  Info,
  Gift,
  Percent,
  User,
  Lock,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PaymentGateway from '@/components/payments/PaymentGateway';
import { useAuth } from '@/lib/auth';

interface PlanDetails {
  id: string;
  name: string;
  nameAr: string;
  type: 'PROVIDER' | 'USER';
  price: number;
  yearlyPrice?: number;
  period: number; // months
  icon: React.ElementType;
  color: string;
  features: string[];
  featuresAr: string[];
  description?: string;
  descriptionAr?: string;
}

interface DiscountInfo {
  type: 'FIELD_REPRESENTATIVE' | 'MATCHING_DISCOUNT' | 'INTRODUCTORY' | 'CUSTOM';
  percentage: number;
  description: string;
  descriptionAr: string;
  isApplicable: boolean;
}

const PaymentCheckout = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const isRTL = i18n.language === 'ar';
  
  const [currentStep, setCurrentStep] = useState<'auth' | 'summary' | 'payment'>('auth');
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [isYearlyBilling, setIsYearlyBilling] = useState(true);
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountInfo[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  // Guard to prevent re-initialization loops
  const initializedPlanKeyRef = useRef<string | null>(null);

  // Plan configurations based on the requirements
  const planConfigurations: Record<string, PlanDetails> = {
    // Provider Plans
    'BASIC_FREE': {
      id: 'BASIC_FREE',
      name: 'Basic Package (Free)',
      nameAr: 'الباقة الأساسية (مجانية)',
      type: 'PROVIDER',
      price: 0,
      yearlyPrice: 0,
      period: 12,
      icon: Star,
      color: 'text-stone-600',
      features: [
        'Full listing of your business on the platform',
        'No appointment booking or product listing',
        'Ideal for initial presence and building trust'
      ],
      featuresAr: [
        'عرض كامل لأعمالك على المنصة',
        'بدون حجز مواعيد أو عرض منتجات',
        'مثالي للحضور الأولي وبناء الثقة'
      ]
    },
    'BOOKING_BASIC': {
      id: 'BOOKING_BASIC',
      name: 'Booking Package (Basic Plus)',
      nameAr: 'باقة الحجز (الأساسية المحسنة)',
      type: 'PROVIDER',
      price: 83,
      yearlyPrice: 1000,
      period: 12,
      icon: Calendar,
      color: 'text-blue-600',
      features: [
        'Full listing of your business',
        'Add direct appointment booking through the platform'
      ],
      featuresAr: [
        'عرض كامل لأعمالك',
        'إضافة حجز المواعيد المباشر عبر المنصة'
      ]
    },
    'PRODUCTS_PREMIUM': {
      id: 'PRODUCTS_PREMIUM',
      name: 'Products Package (Premium)',
      nameAr: 'باقة المنتجات (المتميزة)',
      type: 'PROVIDER',
      price: 167,
      yearlyPrice: 2000,
      period: 12,
      icon: Zap,
      color: 'text-purple-600',
      features: [
        'All features of the Booking Package',
        'Add products (medications, supplies, or extra services) to your page',
        'Delivery Service - Deliver your products to customers',
        'Commission charged per delivery'
      ],
      featuresAr: [
        'جميع ميزات باقة الحجز',
        'إضافة منتجات (أدوية، مستلزمات، أو خدمات إضافية) لصفحتك',
        'خدمة التوصيل - توصيل منتجاتك للعملاء',
        'عمولة على كل عملية توصيل'
      ]
    },
    'TOP_BRONZE': {
      id: 'TOP_BRONZE',
      name: 'Top 10 Bronze',
      nameAr: 'المركز 10 البرونزي',
      type: 'PROVIDER',
      price: 833,
      yearlyPrice: 10000,
      period: 12,
      icon: Trophy,
      color: 'text-orange-600',
      features: [
        'Appear in the top 10 search results',
        'All Premium package features',
        'Priority listing'
      ],
      featuresAr: [
        'الظهور في أول 10 نتائج بحث',
        'جميع ميزات الباقة المتميزة',
        'عرض مُمتاز'
      ]
    },
    'TOP_SILVER': {
      id: 'TOP_SILVER',
      name: 'Top 5 Silver',
      nameAr: 'المركز 5 الفضي',
      type: 'PROVIDER',
      price: 1667,
      yearlyPrice: 20000,
      period: 12,
      icon: Crown,
      color: 'text-stone-500',
      features: [
        'Appear in the top 5 search results',
        'All Bronze package features',
        'Enhanced visibility'
      ],
      featuresAr: [
        'الظهور في أول 5 نتائج بحث',
        'جميع ميزات الباقة البرونزية',
        'ظهور محسن'
      ]
    },
    'TOP_GOLD': {
      id: 'TOP_GOLD',
      name: 'Top 3 Gold',
      nameAr: 'المركز 3 الذهبي',
      type: 'PROVIDER',
      price: 2500,
      yearlyPrice: 30000,
      period: 12,
      icon: Diamond,
      color: 'text-yellow-500',
      features: [
        'Appear in the top 3 search results',
        'Highlighted badge',
        'Promotional video about your business',
        'All Silver package features'
      ],
      featuresAr: [
        'الظهور في أول 3 نتائج بحث',
        'شارة مميزة',
        'فيديو ترويجي عن عملك',
        'جميع ميزات الباقة الفضية'
      ]
    },
    // User Plans
    'MEDICAL_CARD': {
      id: 'MEDICAL_CARD',
      name: 'Medical Directory Card',
      nameAr: 'بطاقة الدليل الطبي',
      type: 'USER',
      price: 10, // 120/12 months
      yearlyPrice: 120,
      period: 12,
      icon: Shield,
      color: 'text-green-600',
      features: [
        'Access discounts from medical service providers',
        'You and up to 5 family members can benefit',
        'Digital card + QR code for easy use',
        'One free month for new users to try the service'
      ],
      featuresAr: [
        'الحصول على خصومات من مقدمي الخدمات الطبية',
        'أنت وحتى 5 أفراد من عائلتك يمكنكم الاستفادة',
        'بطاقة رقمية + رمز QR للاستخدام السهل',
        'شهر مجاني للمستخدمين الجدد لتجربة الخدمة'
      ]
    },
    // User Plans
    'FREE': {
      id: 'FREE',
      name: 'Free',
      nameAr: 'مجاني',
      type: 'USER',
      price: 0,
      period: 12,
      icon: Star,
      color: 'text-stone-600',
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
      ]
    },
    'MEDICAL_CARD_3': {
      id: 'MEDICAL_CARD',
      name: 'Medical Directory Card (3 months)',
      nameAr: 'بطاقة الدليل الطبي (3 شهور)',
      type: 'USER',
      price: 60,
      period: 3,
      icon: Shield,
      color: 'text-green-600',
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
      ]
    },
    'MEDICAL_CARD_6': {
      id: 'MEDICAL_CARD',
      name: 'Medical Directory Card (6 months)',
      nameAr: 'بطاقة الدليل الطبي (6 شهور)',
      type: 'USER',
      price: 90,
      period: 6,
      icon: Shield,
      color: 'text-green-600',
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
      ]
    },
    'MEDICAL_CARD_12': {
      id: 'MEDICAL_CARD',
      name: 'Medical Directory Card (12 months)',
      nameAr: 'بطاقة الدليل الطبي (12 شهر)',
      type: 'USER',
      price: 120,
      period: 12,
      icon: Shield,
      color: 'text-green-600',
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
      ]
    },
    'ALL_INCLUSIVE_3': {
      id: 'ALL_INCLUSIVE',
      name: 'All-Inclusive Card (3 months)',
      nameAr: 'البطاقة الشاملة (3 شهور)',
      type: 'USER',
      price: 150,
      period: 3,
      icon: Heart,
      color: 'text-purple-600',
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
      ]
    },
    'ALL_INCLUSIVE_6': {
      id: 'ALL_INCLUSIVE',
      name: 'All-Inclusive Card (6 months)',
      nameAr: 'البطاقة الشاملة (6 شهور)',
      type: 'USER',
      price: 220,
      period: 6,
      icon: Heart,
      color: 'text-purple-600',
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
      ]
    },
    'ALL_INCLUSIVE_12': {
      id: 'ALL_INCLUSIVE',
      name: 'All-Inclusive Card (12 months)',
      nameAr: 'البطاقة الشاملة (12 شهر)',
      type: 'USER',
      price: 300,
      period: 12,
      icon: Heart,
      color: 'text-purple-600',
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
      ]
    },
    'ALL_INCLUSIVE': {
      id: 'ALL_INCLUSIVE',
      name: 'All-Inclusive Card',
      nameAr: 'البطاقة الشاملة',
      type: 'USER',
      price: 25, // 300/12 months
      yearlyPrice: 300,
      period: 12,
      icon: Heart,
      color: 'text-purple-600',
      features: [
        'Access discounts across all available categories and services',
        'You and up to 5 family members can benefit',
        'Digital card + QR code for easy use',
        'One free month for new users to try the service'
      ],
      featuresAr: [
        'الحصول على خصومات على جميع الفئات والخدمات المتاحة',
        'أنت وحتى 5 أفراد من عائلتك يمكنكم الاستفادة',
        'بطاقة رقمية + رمز QR للاستخدام السهل',
        'شهر مجاني للمستخدمين الجدد لتجربة الخدمة'
      ]
    }
  };

  // Available discounts
  const availableDiscounts: DiscountInfo[] = [
    {
      type: 'FIELD_REPRESENTATIVE',
      percentage: 20,
      description: 'Field Representative Discount - 20% off when contracting via a field representative',
      descriptionAr: 'خصم المندوب الميداني - خصم 20% عند التعاقد عبر مندوب ميداني',
      isApplicable: false
    },
    {
      type: 'MATCHING_DISCOUNT',
      percentage: 0, // This varies based on user input
      description: 'Matching Discount - Equal to the discount you offer to platform customers',
      descriptionAr: 'خصم المطابقة - يساوي الخصم الذي تقدمه لعملاء المنصة',
      isApplicable: false
    },
    {
      type: 'INTRODUCTORY',
      percentage: 100, // Free trial month
      description: 'Introductory Offer - One month free trial for new users',
      descriptionAr: 'العرض التقديمي - شهر مجاني تجريبي للمستخدمين الجدد',
      isApplicable: true
    }
  ];

  useEffect(() => {
    // Avoid running until auth state is available
    if (authLoading) return;

    // Read plan/period from URL or storage
    const planId = searchParams?.get('plan') ||
                   (typeof window !== 'undefined' ? localStorage.getItem('intended-plan') : null);

    const selectedPeriodFromState = parseInt(searchParams?.get('period') || '0') ||
                                    parseInt((typeof window !== 'undefined' ? localStorage.getItem('intended-period') : null) || '12');

    if (!planId) {
      // Missing plan - go back gracefully
      setTimeout(() => router.push('/subscription-plans'), 500);
      return;
    }

    setSelectedPeriod(selectedPeriodFromState);

    // Derive plan key and guard against re-initialization
    let planKey = planId as string;
    if (["MEDICAL_CARD", "ALL_INCLUSIVE"].includes(planKey) && selectedPeriodFromState > 0) {
      planKey = `${planKey}_${selectedPeriodFromState}`;
    }

    // Guard: if we've already initialized for this key, do nothing
    if (initializedPlanKeyRef.current === planKey) {
      return;
    }

    const plan = (planConfigurations as any)[planKey] || (planConfigurations as any)[planId as string];
    if (!plan) {
      setTimeout(() => router.push('/subscription-plans'), 1000);
      return;
    }

    initializedPlanKeyRef.current = planKey;
    setPlanDetails(plan);

    // Only clear storage after successful extraction
    if (typeof window !== 'undefined') {
      localStorage.removeItem('intended-plan');
      localStorage.removeItem('intended-period');
    }

    // Step selection based on auth
    if (plan.price > 0 && !user) {
      if (currentStep !== 'auth') setCurrentStep('auth');
    } else {
      if (currentStep !== 'summary') setCurrentStep('summary');
      // Removed automatic application of introductory discount
      // Users can manually apply discounts if needed
    }

    setLoading(false);
  }, [searchParams, user, authLoading, router]);

  const calculateTotalDiscount = () => {
    let totalDiscount = 0;
    
    appliedDiscounts.forEach(discount => {
      if (discount.isApplicable) {
        totalDiscount += discount.percentage;
      }
    });
    
    // Add coupon discount
    totalDiscount += couponDiscount;
    
    // Max discount is 100%
    return Math.min(totalDiscount, 100);
  };

  const calculateFinalPrice = () => {
    if (!planDetails) return 0;
    
    const basePrice = isYearlyBilling ? (planDetails.yearlyPrice || planDetails.price * 12) : planDetails.price;
    const discountPercentage = calculateTotalDiscount();
    const discountAmount = (basePrice * discountPercentage) / 100;
    
    return Math.max(0, basePrice - discountAmount);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      // Mock coupon validation since we don't have a real API client yet
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Mock coupon validation
      const mockCoupons: Record<string, number> = {
        'WELCOME10': 10,
        'SAVE20': 20,
        'STUDENT15': 15,
        'FAMILY25': 25
      };
      
      const discount = mockCoupons[couponCode.toUpperCase()];
      if (discount) {
        setCouponDiscount(discount);
        // Could show success toast here
      } else {
        setCouponDiscount(0);
        // Could show error toast here
      }
    } catch (error) {
      console.error('Coupon validation failed:', error);
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };
  
  const handleLoginRedirect = () => {
    // Store current plan details for after login
    if (planDetails) {
      localStorage.setItem('intended-plan', planDetails.id);
      if (selectedPeriod) {
        localStorage.setItem('intended-period', selectedPeriod.toString());
      }
    }
    router.push('/login');
  };
  
  const handleSignupRedirect = () => {
    // Store current plan details for after signup
    if (planDetails) {
      localStorage.setItem('intended-plan', planDetails.id);
      if (selectedPeriod) {
        localStorage.setItem('intended-period', selectedPeriod.toString());
      }
    }
    router.push('/signup');
  };

  const handlePaymentSuccess = (transactionId: string) => {
    // Store data in sessionStorage for the success page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('payment-success-data', JSON.stringify({
        transactionId,
        planId: planDetails?.id,
        amount: calculateFinalPrice(),
        planDetails
      }));
    }
    router.push('/payment-success');
  };

  const handlePaymentFailed = (error: string) => {
    // Store data in sessionStorage for the failed page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('payment-failed-data', JSON.stringify({
        error,
        planId: planDetails?.id,
        planDetails
      }));
    }
    router.push('/payment-failed');
  };

  if (loading || !planDetails || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }
  
  // Authentication Step
  if (currentStep === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary py-12">
        <div className="max-w-md mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isRTL ? 'تسجيل الدخول مطلوب' : 'Login Required'}
            </h1>
            <p className="text-text-secondary">
              {isRTL 
                ? 'يجب تسجيل الدخول للمتابعة مع عملية الدفع لهذه الخطة:'
                : 'You need to log in to continue with payment for:'}
            </p>
          </motion.div>
          
          {/* Plan Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${planDetails.color === 'text-green-600' ? 'from-green-100 to-green-200' : planDetails.color === 'text-purple-600' ? 'from-purple-100 to-purple-200' : 'from-blue-100 to-blue-200'}`}>
                    <planDetails.icon className={`h-6 w-6 ${planDetails.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">
                      {isRTL ? planDetails.nameAr : planDetails.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-green-primary">
                        {planDetails.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                      </span>
                      <span className="text-sm text-text-secondary">
                        /{planDetails.period} {isRTL ? 'شهر' : planDetails.period === 1 ? 'month' : 'months'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Authentication Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Button 
              onClick={handleLoginRedirect}
              className="w-full"
              size="lg"
            >
              <User className="h-4 w-4 mr-2" />
              {isRTL ? 'تسجيل الدخول' : 'Log In'}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-text-secondary">
                  {isRTL ? 'أو' : 'or'}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleSignupRedirect}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isRTL ? 'إنشاء حساب جديد' : 'Create New Account'}
            </Button>
            
            <Button 
              onClick={() => router.push('/subscription-plans')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isRTL ? 'رجوع للخطط' : 'Back to Plans'}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentStep === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background-secondary py-12">
        <div className="max-w-7xl mx-auto px-6">
          <PaymentGateway
            amount={calculateFinalPrice()}
            currency="EGP"
            planType={planDetails.type}
            planId={planDetails.id}
            discount={calculateTotalDiscount()}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
            onBack={() => setCurrentStep('summary')}
          />
        </div>
      </div>
    );
  }

  const Icon = planDetails.icon;

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
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {isRTL ? 'رجوع' : 'Back'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {isRTL ? 'الدفع والتحقق' : 'Checkout & Payment'}
                </h1>
                <p className="text-text-secondary">
                  {isRTL ? 'راجع وأكد طلب الاشتراك' : 'Review and confirm your subscription'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Details & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${planDetails.color}`} />
                  {isRTL ? 'الباقة المحددة' : 'Selected Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">
                      {isRTL ? planDetails.nameAr : planDetails.name}
                    </h3>
                    <p className="text-text-secondary mt-1">
                      {isRTL 
                        ? `باقة ${planDetails.type === 'PROVIDER' ? 'مقدمي الخدمات' : 'المستخدمين'}`
                        : `${planDetails.type === 'PROVIDER' ? 'Service Provider' : 'User'} Plan`
                      }
                    </p>
                  </div>
                  <Badge className="bg-green-primary text-white">
                    {planDetails.type === 'PROVIDER' 
                      ? (isRTL ? 'مقدم خدمة' : 'Provider')
                      : (isRTL ? 'مستخدم' : 'User')
                    }
                  </Badge>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-text-primary">
                    {isRTL ? 'الميزات المشمولة:' : 'Included Features:'}
                  </h4>
                  <ul className="space-y-2">
                    {(isRTL ? planDetails.featuresAr : planDetails.features).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-primary mt-0.5 flex-shrink-0" />
                        <span className="text-text-secondary text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Billing Options */}
            {planDetails.yearlyPrice && planDetails.yearlyPrice > planDetails.price && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {isRTL ? 'خيارات الفوترة' : 'Billing Options'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-background-secondary/30 rounded-lg">
                    <div>
                      <Label htmlFor="yearly-billing" className="font-medium">
                        {isRTL ? 'الفوترة السنوية' : 'Annual Billing'}
                      </Label>
                      <p className="text-sm text-text-secondary">
                        {isRTL ? 'وفر المال مع الفوترة السنوية' : 'Save money with annual billing'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="yearly-billing"
                        checked={isYearlyBilling}
                        onCheckedChange={setIsYearlyBilling}
                      />
                      {isYearlyBilling && (
                        <Badge className="bg-green-primary text-white">
                          {isRTL ? 'توفير!' : 'Save!'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Discounts */}
            {planDetails.type === 'PROVIDER' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-orange-600" />
                    {isRTL ? 'الخصومات المتاحة' : 'Available Discounts'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableDiscounts.map((discount, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {discount.type === 'FIELD_REPRESENTATIVE' && <Users className="h-4 w-4 text-blue-600" />}
                          {discount.type === 'MATCHING_DISCOUNT' && <Heart className="h-4 w-4 text-red-600" />}
                          {discount.type === 'INTRODUCTORY' && <Gift className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {discount.percentage}% {isRTL ? 'خصم' : 'Discount'}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {isRTL ? discount.descriptionAr : discount.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={appliedDiscounts.some(d => d.type === discount.type && d.isApplicable)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAppliedDiscounts(prev => [
                              ...prev.filter(d => d.type !== discount.type),
                              { ...discount, isApplicable: true }
                            ]);
                          } else {
                            setAppliedDiscounts(prev => prev.filter(d => d.type !== discount.type));
                          }
                        }}
                        disabled={discount.type === 'MATCHING_DISCOUNT' && discount.percentage === 0}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-purple-600" />
                  {isRTL ? 'كود الخصم' : 'Promo Code'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder={isRTL ? 'أدخل كود الخصم' : 'Enter promo code'}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={applyCoupon} variant="outline">
                    {isRTL ? 'تطبيق' : 'Apply'}
                  </Button>
                </div>
                {couponDiscount > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      {isRTL ? `تم تطبيق خصم ${couponDiscount}%` : `${couponDiscount}% discount applied`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-green-primary" />
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">
                      {isRTL ? 'السعر الأساسي' : 'Base Price'}
                    </span>
                    <span className="font-medium">
                      {(isYearlyBilling ? (planDetails.yearlyPrice || planDetails.price * 12) : planDetails.price).toLocaleString()} EGP
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">
                      {isRTL ? 'فترة الفوترة' : 'Billing Period'}
                    </span>
                    <span className="font-medium">
                      {isYearlyBilling ? (isRTL ? 'سنوي' : 'Annual') : (isRTL ? 'شهري' : 'Monthly')}
                    </span>
                  </div>

                  {calculateTotalDiscount() > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-green-600">
                          <span>{isRTL ? 'إجمالي الخصم' : 'Total Discount'}</span>
                          <span>-{calculateTotalDiscount()}%</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                          <span>{isRTL ? 'مبلغ الخصم' : 'Discount Amount'}</span>
                          <span>
                            -{((isYearlyBilling ? (planDetails.yearlyPrice || planDetails.price * 12) : planDetails.price) * calculateTotalDiscount() / 100).toLocaleString()} EGP
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-text-primary">
                    {isRTL ? 'إجمالي المبلغ' : 'Total Amount'}
                  </span>
                  <span className="text-green-primary">
                    {calculateFinalPrice().toLocaleString()} EGP
                  </span>
                </div>

                {calculateFinalPrice() === 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {isRTL ? 'مجاني!' : 'Free!'}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      {isRTL ? 'لا توجد رسوم هذا الشهر' : 'No charges this month'}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => setCurrentStep('payment')}
                  className="w-full"
                  size="lg"
                >
                  {calculateFinalPrice() === 0 
                    ? (isRTL ? 'تفعيل الباقة' : 'Activate Plan')
                    : (isRTL ? 'متابعة للدفع' : 'Continue to Payment')
                  }
                </Button>

                {/* Security Notice */}
                <div className="text-center space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-green-primary" />
                    <span className="text-sm font-medium text-green-primary">
                      {isRTL ? 'دفع آمن 100%' : '100% Secure Payment'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {isRTL 
                      ? 'معلوماتك محمية بتشفير SSL'
                      : 'Your information is protected with SSL encryption'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
