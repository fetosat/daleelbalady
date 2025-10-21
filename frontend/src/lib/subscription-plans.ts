import { ProviderPlanType } from './subscription';

export interface PlanFeature {
  id: string;
  name: string;
  nameAr: string;
  included: boolean;
  description?: string;
  descriptionAr?: string;
  premium?: boolean;
}

export interface SubscriptionPlan {
  id: ProviderPlanType;
  name: string;
  nameAr: string;
  price: number;
  priceMonthly: number;
  currency: string;
  popular: boolean;
  badge?: string;
  badgeAr?: string;
  description: string;
  descriptionAr: string;
  features: PlanFeature[];
  color: string;
  icon: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: ProviderPlanType.BASIC_FREE,
    name: 'Basic (Free)',
    nameAr: 'الأساسي (مجاني)',
    price: 0,
    priceMonthly: 0,
    currency: 'EGP',
    popular: false,
    description: 'Get started with a basic business listing',
    descriptionAr: 'ابدأ بعرض أساسي لعملك',
    color: 'from-stone-400 to-stone-600',
    icon: '🆓',
    features: [
      { id: 'basic-listing', name: 'Full business listing', nameAr: 'عرض كامل للأعمال', included: true },
      { id: 'customer-reviews', name: 'Customer reviews', nameAr: 'تقييمات العملاء', included: true },
      { id: 'basic-profile', name: 'Basic profile', nameAr: 'الملف الأساسي', included: true },
      { id: 'bookings', name: 'Direct appointment booking', nameAr: 'حجز المواعيد المباشر', included: false, premium: true },
      { id: 'products', name: 'Product listing & sales', nameAr: 'عرض وبيع المنتجات', included: false, premium: true },
      { id: 'priority', name: 'Search priority', nameAr: 'أولوية الظهور', included: false, premium: true },
      { id: 'badge', name: 'Verified badge', nameAr: 'شارة التحقق', included: false, premium: true },
      { id: 'video', name: 'Promotional video', nameAr: 'فيديو ترويجي', included: false, premium: true },
    ],
  },
  {
    id: ProviderPlanType.BOOKING_BASIC,
    name: 'Booking Package',
    nameAr: 'باقة الحجز',
    price: 1000,
    priceMonthly: 83,
    currency: 'EGP',
    popular: true,
    badge: 'Most Popular',
    badgeAr: 'الأكثر شيوعاً',
    description: 'Enable direct booking system for your customers',
    descriptionAr: 'تفعيل نظام الحجز المباشر لعملائك',
    color: 'from-green-400 to-green-600',
    icon: '📅',
    features: [
      { id: 'basic-all', name: 'All Basic features', nameAr: 'جميع ميزات الأساسي', included: true },
      { id: 'bookings', name: 'Direct appointment booking', nameAr: 'حجز المواعيد المباشر', included: true },
      { id: 'calendar', name: 'Calendar management', nameAr: 'إدارة التقويم', included: true },
      { id: 'notifications', name: 'Booking notifications', nameAr: 'إشعارات الحجز', included: true },
      { id: 'products', name: 'Product listing & sales', nameAr: 'عرض وبيع المنتجات', included: false, premium: true },
      { id: 'priority', name: 'Search priority', nameAr: 'أولوية الظهور', included: false, premium: true },
      { id: 'badge', name: 'Verified badge', nameAr: 'شارة التحقق', included: false, premium: true },
      { id: 'video', name: 'Promotional video', nameAr: 'فيديو ترويجي', included: false, premium: true },
    ],
  },
  {
    id: ProviderPlanType.PRODUCTS_PREMIUM,
    name: 'Products Package',
    nameAr: 'باقة المنتجات',
    price: 2000,
    priceMonthly: 167,
    currency: 'EGP',
    popular: false,
    description: 'Sell products online with full e-commerce features',
    descriptionAr: 'بيع المنتجات عبر الإنترنت مع ميزات التجارة الإلكترونية الكاملة',
    color: 'from-blue-400 to-blue-600',
    icon: '🛍️',
    features: [
      { id: 'booking-all', name: 'All Booking features', nameAr: 'جميع ميزات الحجز', included: true },
      { id: 'products', name: 'Product listing & sales', nameAr: 'عرض وبيع المنتجات', included: true },
      { id: 'inventory', name: 'Inventory management', nameAr: 'إدارة المخزون', included: true },
      { id: 'delivery', name: 'Delivery coordination', nameAr: 'تنسيق التوصيل', included: true },
      { id: 'priority', name: 'Search priority', nameAr: 'أولوية الظهور', included: false, premium: true },
      { id: 'badge', name: 'Verified badge', nameAr: 'شارة التحقق', included: false, premium: true },
      { id: 'video', name: 'Promotional video', nameAr: 'فيديو ترويجي', included: false, premium: true },
    ],
  },
  {
    id: ProviderPlanType.TOP_BRONZE,
    name: 'Top 10 Bronze',
    nameAr: 'المركز 10 البرونزي',
    price: 10000,
    priceMonthly: 833,
    currency: 'EGP',
    popular: false,
    badge: 'Top Tier',
    badgeAr: 'الفئة الأعلى',
    description: 'Guaranteed top 10 placement in search results',
    descriptionAr: 'ضمان الظهور في أول 10 نتائج بحث',
    color: 'from-orange-400 to-orange-600',
    icon: '🥉',
    features: [
      { id: 'premium-all', name: 'All Premium features', nameAr: 'جميع الميزات المتميزة', included: true },
      { id: 'priority-10', name: 'Top 10 search priority', nameAr: 'أولوية الظهور في أول 10 نتائج', included: true },
      { id: 'badge', name: 'Priority badge', nameAr: 'شارة الأولوية', included: true },
      { id: 'analytics', name: 'Advanced analytics', nameAr: 'تحليلات متقدمة', included: true },
      { id: 'support', name: 'Priority support', nameAr: 'دعم بالأولوية', included: true },
      { id: 'video', name: 'Promotional video', nameAr: 'فيديو ترويجي', included: false, premium: true },
    ],
  },
  {
    id: ProviderPlanType.TOP_SILVER,
    name: 'Top 5 Silver',
    nameAr: 'المركز 5 الفضي',
    price: 20000,
    priceMonthly: 1667,
    currency: 'EGP',
    popular: false,
    badge: 'Premium',
    badgeAr: 'مميز',
    description: 'Guaranteed top 5 placement with silver badge',
    descriptionAr: 'ضمان الظهور في أول 5 نتائج مع شارة فضية',
    color: 'from-stone-300 to-stone-500',
    icon: '🥈',
    features: [
      { id: 'bronze-all', name: 'All Bronze features', nameAr: 'جميع ميزات البرونزي', included: true },
      { id: 'priority-5', name: 'Top 5 search priority', nameAr: 'أولوية الظهور في أول 5 نتائج', included: true },
      { id: 'silver-badge', name: 'Silver verified badge', nameAr: 'شارة التحقق الفضية', included: true },
      { id: 'premium-design', name: 'Premium listing design', nameAr: 'تصميم عرض مُمتاز', included: true },
      { id: 'featured', name: 'Featured in categories', nameAr: 'مميز في الفئات', included: true },
      { id: 'video', name: 'Promotional video', nameAr: 'فيديو ترويجي', included: false, premium: true },
    ],
  },
  {
    id: ProviderPlanType.TOP_GOLD,
    name: 'Top 3 Gold',
    nameAr: 'المركز 3 الذهبي',
    price: 30000,
    priceMonthly: 2500,
    currency: 'EGP',
    popular: false,
    badge: 'Elite',
    badgeAr: 'النخبة',
    description: 'Ultimate package with top 3 placement and promotional video',
    descriptionAr: 'الباقة المثالية مع الظهور في أول 3 نتائج وفيديو ترويجي',
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
    features: [
      { id: 'silver-all', name: 'All Silver features', nameAr: 'جميع ميزات الفضي', included: true },
      { id: 'priority-3', name: 'Top 3 search priority', nameAr: 'أولوية الظهور في أول 3 نتائج', included: true },
      { id: 'gold-badge', name: 'Gold verified badge', nameAr: 'شارة التحقق الذهبية', included: true },
      { id: 'video', name: 'Promotional video', nameAr: 'فيديو ترويجي', included: true },
      { id: 'account-manager', name: 'Dedicated account manager', nameAr: 'مدير حساب مُخصص', included: true },
      { id: 'custom-branding', name: 'Custom branding options', nameAr: 'خيارات علامة تجارية مخصصة', included: true },
    ],
  },
];

export const getPlanById = (planId: ProviderPlanType): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

export const isPremiumFeature = (featureId: string, currentPlan: ProviderPlanType): boolean => {
  const currentPlanData = getPlanById(currentPlan);
  if (!currentPlanData) return false;
  
  const feature = currentPlanData.features.find(f => f.id === featureId);
  return feature ? !feature.included && !!feature.premium : false;
};

export const getRequiredPlanForFeature = (featureId: string): ProviderPlanType | null => {
  for (const plan of SUBSCRIPTION_PLANS) {
    const feature = plan.features.find(f => f.id === featureId);
    if (feature && feature.included) {
      return plan.id;
    }
  }
  return null;
};

