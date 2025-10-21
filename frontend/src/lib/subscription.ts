import { UserRole } from './auth';

// Provider plan types matching Prisma schema
export enum ProviderPlanType {
  BASIC_FREE = 'BASIC_FREE',
  BOOKING_BASIC = 'BOOKING_BASIC',
  PRODUCTS_PREMIUM = 'PRODUCTS_PREMIUM',
  TOP_BRONZE = 'TOP_BRONZE',
  TOP_SILVER = 'TOP_SILVER',
  TOP_GOLD = 'TOP_GOLD'
}

// User plan types matching Prisma schema
export enum UserPlanType {
  FREE = 'FREE',
  MEDICAL_CARD = 'MEDICAL_CARD',
  ALL_INCLUSIVE = 'ALL_INCLUSIVE'
}

export interface ProviderSubscription {
  id: string;
  planType: ProviderPlanType;
  pricePerYear: number;
  canTakeBookings: boolean;
  canListProducts: boolean;
  searchPriority: number;
  hasPriorityBadge: boolean;
  hasPromotionalVideo: boolean;
  fieldRepDiscount?: number;
  matchingDiscount?: number;
  totalDiscount: number;
  isActive: boolean;
  expiresAt?: Date;
}

export interface UserSubscription {
  id: string;
  planType: UserPlanType;
  pricePerPeriod: number;
  periodMonths: number;
  hasMedicalDiscounts: boolean;
  hasAllCategoryDiscounts: boolean;
  maxFamilyMembers: number;
  cardNumber?: string;
  qrCode?: string;
  isActive: boolean;
  expiresAt?: Date;
}

// Plan pricing in EGP
export const PROVIDER_PLAN_PRICES = {
  [ProviderPlanType.BASIC_FREE]: 0,
  [ProviderPlanType.BOOKING_BASIC]: 1000,
  [ProviderPlanType.PRODUCTS_PREMIUM]: 2000,
  [ProviderPlanType.TOP_BRONZE]: 10000,
  [ProviderPlanType.TOP_SILVER]: 20000,
  [ProviderPlanType.TOP_GOLD]: 30000,
} as const;

export const USER_PLAN_PRICES = {
  [UserPlanType.FREE]: 0,
  [UserPlanType.MEDICAL_CARD]: {
    3: 60,
    6: 90,
    12: 120
  },
  [UserPlanType.ALL_INCLUSIVE]: {
    3: 150,
    6: 220,
    12: 300
  }
} as const;

/**
 * Check if a provider can take bookings based on their subscription
 */
export function canTakeBookings(subscription: ProviderSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false; // Free plan cannot take bookings
  }
  
  return subscription.planType !== ProviderPlanType.BASIC_FREE;
}

/**
 * Check if a provider can list products based on their subscription
 */
export function canListProducts(subscription: ProviderSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false; // Free plan cannot list products
  }
  
  return [
    ProviderPlanType.PRODUCTS_PREMIUM,
    ProviderPlanType.TOP_BRONZE,
    ProviderPlanType.TOP_SILVER,
    ProviderPlanType.TOP_GOLD
  ].includes(subscription.planType);
}

/**
 * Get search priority for a provider based on their subscription
 */
export function getSearchPriority(subscription: ProviderSubscription | null): number {
  if (!subscription || !subscription.isActive) {
    return 0; // No priority for free users
  }
  
  const priorityMap = {
    [ProviderPlanType.BASIC_FREE]: 0,
    [ProviderPlanType.BOOKING_BASIC]: 0,
    [ProviderPlanType.PRODUCTS_PREMIUM]: 0,
    [ProviderPlanType.TOP_BRONZE]: 10,
    [ProviderPlanType.TOP_SILVER]: 5,
    [ProviderPlanType.TOP_GOLD]: 3
  };
  
  return priorityMap[subscription.planType] || 0;
}

/**
 * Check if a provider has priority badge
 */
export function hasPriorityBadge(subscription: ProviderSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false;
  }
  
  return [
    ProviderPlanType.TOP_BRONZE,
    ProviderPlanType.TOP_SILVER,
    ProviderPlanType.TOP_GOLD
  ].includes(subscription.planType);
}

/**
 * Check if a provider can have promotional video
 */
export function hasPromotionalVideo(subscription: ProviderSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false;
  }
  
  return subscription.planType === ProviderPlanType.TOP_GOLD;
}

/**
 * Check if a user has medical discounts
 */
export function hasMedicalDiscounts(subscription: UserSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false;
  }
  
  return [
    UserPlanType.MEDICAL_CARD,
    UserPlanType.ALL_INCLUSIVE
  ].includes(subscription.planType);
}

/**
 * Check if a user has all category discounts
 */
export function hasAllCategoryDiscounts(subscription: UserSubscription | null): boolean {
  if (!subscription || !subscription.isActive) {
    return false;
  }
  
  return subscription.planType === UserPlanType.ALL_INCLUSIVE;
}

/**
 * Get max family members for a user subscription
 */
export function getMaxFamilyMembers(subscription: UserSubscription | null): number {
  if (!subscription || !subscription.isActive) {
    return 0; // Free users get no family members
  }
  
  if (subscription.planType === UserPlanType.FREE) {
    return 0;
  }
  
  return 5; // Paid plans get up to 5 family members
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(subscription: ProviderSubscription | UserSubscription | null): boolean {
  if (!subscription) {
    return true;
  }
  
  if (!subscription.expiresAt) {
    return false; // No expiration date means it doesn't expire
  }
  
  return new Date() > subscription.expiresAt;
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiration(subscription: ProviderSubscription | UserSubscription | null): number {
  if (!subscription || !subscription.expiresAt) {
    return Infinity;
  }
  
  const now = new Date();
  const expiration = subscription.expiresAt;
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Calculate discount for provider based on field representative and matching discounts
 */
export function calculateProviderDiscount(
  basePrice: number,
  hasFieldRepDiscount: boolean = false,
  matchingDiscountPercent: number = 0
): { discountedPrice: number; totalDiscount: number; breakdown: string[] } {
  let totalDiscountPercent = 0;
  const breakdown: string[] = [];
  
  if (hasFieldRepDiscount) {
    totalDiscountPercent += 20;
    breakdown.push('Field Representative: 20%');
  }
  
  if (matchingDiscountPercent > 0) {
    totalDiscountPercent += matchingDiscountPercent;
    breakdown.push(`Matching Discount: ${matchingDiscountPercent}%`);
  }
  
  // Cap total discount at 50%
  totalDiscountPercent = Math.min(totalDiscountPercent, 50);
  
  const discountAmount = (basePrice * totalDiscountPercent) / 100;
  const discountedPrice = basePrice - discountAmount;
  
  return {
    discountedPrice: Math.round(discountedPrice),
    totalDiscount: totalDiscountPercent,
    breakdown
  };
}

/**
 * Get plan display name
 */
export function getProviderPlanDisplayName(planType: ProviderPlanType, isArabic: boolean = false): string {
  const names = {
    [ProviderPlanType.BASIC_FREE]: isArabic ? 'الأساسي (مجاني)' : 'Basic (Free)',
    [ProviderPlanType.BOOKING_BASIC]: isArabic ? 'باقة الحجز' : 'Booking Package',
    [ProviderPlanType.PRODUCTS_PREMIUM]: isArabic ? 'باقة المنتجات' : 'Products Package',
    [ProviderPlanType.TOP_BRONZE]: isArabic ? 'المركز 10 البرونزي' : 'Top 10 Bronze',
    [ProviderPlanType.TOP_SILVER]: isArabic ? 'المركز 5 الفضي' : 'Top 5 Silver',
    [ProviderPlanType.TOP_GOLD]: isArabic ? 'المركز 3 الذهبي' : 'Top 3 Gold'
  };
  
  return names[planType];
}

/**
 * Get user plan display name
 */
export function getUserPlanDisplayName(planType: UserPlanType, isArabic: boolean = false): string {
  const names = {
    [UserPlanType.FREE]: isArabic ? 'مجاني' : 'Free',
    [UserPlanType.MEDICAL_CARD]: isArabic ? 'بطاقة الدليل الطبي' : 'Medical Directory Card',
    [UserPlanType.ALL_INCLUSIVE]: isArabic ? 'البطاقة الشاملة' : 'All-Inclusive Card'
  };
  
  return names[planType];
}

/**
 * Create default provider subscription (free)
 */
export function createDefaultProviderSubscription(providerId: string): Omit<ProviderSubscription, 'id'> {
  return {
    planType: ProviderPlanType.BASIC_FREE,
    pricePerYear: 0,
    canTakeBookings: false,
    canListProducts: false,
    searchPriority: 0,
    hasPriorityBadge: false,
    hasPromotionalVideo: false,
    totalDiscount: 0,
    isActive: true
  };
}

/**
 * Create default user subscription (free)
 */
export function createDefaultUserSubscription(userId: string): Omit<UserSubscription, 'id'> {
  return {
    planType: UserPlanType.FREE,
    pricePerPeriod: 0,
    periodMonths: 12,
    hasMedicalDiscounts: false,
    hasAllCategoryDiscounts: false,
    maxFamilyMembers: 0,
    isActive: true
  };
}

/**
 * Check if user needs upgrade prompt
 */
export function needsUpgradePrompt(
  userRole: UserRole,
  providerSubscription?: ProviderSubscription | null,
  userSubscription?: UserSubscription | null
): { needsUpgrade: boolean; reason: string; suggestedPlan: string } {
  if (userRole === 'PROVIDER') {
    if (!providerSubscription || providerSubscription.planType === ProviderPlanType.BASIC_FREE) {
      return {
        needsUpgrade: true,
        reason: 'Upgrade to enable booking system and reach more customers',
        suggestedPlan: ProviderPlanType.BOOKING_BASIC
      };
    }
    
    if (isSubscriptionExpired(providerSubscription)) {
      return {
        needsUpgrade: true,
        reason: 'Your subscription has expired. Renew to continue using premium features',
        suggestedPlan: providerSubscription.planType
      };
    }
  }
  
  if (userRole === 'CUSTOMER') {
    if (!userSubscription || userSubscription.planType === UserPlanType.FREE) {
      return {
        needsUpgrade: true,
        reason: 'Get a discount card to save on services and help your family too',
        suggestedPlan: UserPlanType.MEDICAL_CARD
      };
    }
    
    if (isSubscriptionExpired(userSubscription)) {
      return {
        needsUpgrade: true,
        reason: 'Your discount card has expired. Renew to continue getting discounts',
        suggestedPlan: userSubscription.planType
      };
    }
  }
  
  return { needsUpgrade: false, reason: '', suggestedPlan: '' };
}
