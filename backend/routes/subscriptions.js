// Subscription Management routes
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { auth } from '../middleware/auth.js';
import { 
  authWithSubscription, 
  requireProviderAccess, 
  validatePlanUpgrade 
} from '../middleware/payment.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Subscription Management APIs
 */

// GET /api/subscriptions - Get user's subscriptions
router.get('/', auth, authWithSubscription, async (req, res) => {
  try {
    const subscriptions = [];

    if (req.user.role === 'PROVIDER' && req.user.providerSubscription) {
      const sub = req.user.providerSubscription;
      subscriptions.push({
        id: sub.id,
        planType: 'PROVIDER',
        planName: getProviderPlanDisplayName(sub.planType, false),
        planNameAr: getProviderPlanDisplayName(sub.planType, true),
        status: sub.isActive ? (isExpired(sub.expiresAt) ? 'EXPIRED' : 'ACTIVE') : 'CANCELLED',
        startDate: sub.startedAt?.toISOString(),
        endDate: sub.expiresAt?.toISOString(),
        autoRenew: sub.autoRenew || false,
        amount: sub.pricePerYear,
        currency: sub.currency || 'EGP',
        nextPaymentDate: sub.nextPaymentDue?.toISOString(),
        features: getProviderPlanFeatures(sub.planType, false),
        featuresAr: getProviderPlanFeatures(sub.planType, true),
        fieldRepDiscount: sub.fieldRepDiscount,
        matchingDiscount: sub.matchingDiscount,
        totalDiscount: sub.totalDiscount
      });
    }

    if (req.user.role === 'CUSTOMER' && req.user.userSubscription) {
      const sub = req.user.userSubscription;
      subscriptions.push({
        id: sub.id,
        planType: 'USER',
        planName: getUserPlanDisplayName(sub.planType, false),
        planNameAr: getUserPlanDisplayName(sub.planType, true),
        status: sub.isActive ? (isExpired(sub.expiresAt) ? 'EXPIRED' : 'ACTIVE') : 'CANCELLED',
        startDate: sub.startedAt?.toISOString(),
        endDate: sub.expiresAt?.toISOString(),
        autoRenew: sub.autoRenew || false,
        amount: sub.pricePerPeriod,
        currency: sub.currency || 'EGP',
        nextPaymentDate: sub.nextPaymentDue?.toISOString(),
        features: getUserPlanFeatures(sub.planType, false),
        featuresAr: getUserPlanFeatures(sub.planType, true),
        cardNumber: sub.cardNumber,
        qrCode: sub.qrCode,
        maxFamilyMembers: sub.maxFamilyMembers,
        periodMonths: sub.periodMonths
      });
    }

    // If no subscription exists, create default free subscription
    if (subscriptions.length === 0) {
      if (req.user.role === 'PROVIDER') {
        await createDefaultProviderSubscription(req.user.id);
        subscriptions.push(getDefaultProviderSubscription());
      } else if (req.user.role === 'CUSTOMER') {
        await createDefaultUserSubscription(req.user.id);
        subscriptions.push(getDefaultUserSubscription());
      }
    }

    res.json(subscriptions);

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions'
    });
  }
});

// GET /api/subscriptions/:subscriptionId - Get subscription details
router.get('/:subscriptionId', auth, authWithSubscription, async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    let subscription = null;

    if (req.user.providerSubscription?.id === subscriptionId) {
      const sub = req.user.providerSubscription;
      subscription = {
        id: sub.id,
        planType: 'PROVIDER',
        planName: getProviderPlanDisplayName(sub.planType, false),
        planNameAr: getProviderPlanDisplayName(sub.planType, true),
        status: sub.isActive ? (isExpired(sub.expiresAt) ? 'EXPIRED' : 'ACTIVE') : 'CANCELLED',
        startDate: sub.startedAt?.toISOString(),
        endDate: sub.expiresAt?.toISOString(),
        autoRenew: sub.autoRenew || false,
        amount: sub.pricePerYear,
        currency: sub.currency || 'EGP',
        features: getProviderPlanFeatures(sub.planType, false),
        featuresAr: getProviderPlanFeatures(sub.planType, true),
        canTakeBookings: sub.canTakeBookings,
        canListProducts: sub.canListProducts,
        searchPriority: sub.searchPriority,
        hasPriorityBadge: sub.hasPriorityBadge,
        hasPromotionalVideo: sub.hasPromotionalVideo,
        fieldRepDiscount: sub.fieldRepDiscount,
        matchingDiscount: sub.matchingDiscount,
        totalDiscount: sub.totalDiscount,
        lastPaymentAt: sub.lastPaymentAt?.toISOString(),
        nextPaymentDue: sub.nextPaymentDue?.toISOString()
      };
    } else if (req.user.userSubscription?.id === subscriptionId) {
      const sub = req.user.userSubscription;
      subscription = {
        id: sub.id,
        planType: 'USER',
        planName: getUserPlanDisplayName(sub.planType, false),
        planNameAr: getUserPlanDisplayName(sub.planType, true),
        status: sub.isActive ? (isExpired(sub.expiresAt) ? 'EXPIRED' : 'ACTIVE') : 'CANCELLED',
        startDate: sub.startedAt?.toISOString(),
        endDate: sub.expiresAt?.toISOString(),
        autoRenew: sub.autoRenew || false,
        amount: sub.pricePerPeriod,
        currency: sub.currency || 'EGP',
        features: getUserPlanFeatures(sub.planType, false),
        featuresAr: getUserPlanFeatures(sub.planType, true),
        hasMedicalDiscounts: sub.hasMedicalDiscounts,
        hasAllCategoryDiscounts: sub.hasAllCategoryDiscounts,
        maxFamilyMembers: sub.maxFamilyMembers,
        cardNumber: sub.cardNumber,
        qrCode: sub.qrCode,
        periodMonths: sub.periodMonths,
        isTrial: sub.isTrial,
        lastPaymentAt: sub.lastPaymentAt?.toISOString(),
        nextPaymentDue: sub.nextPaymentDue?.toISOString()
      };
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json(subscription);

  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription details'
    });
  }
});

// POST /api/subscriptions/upgrade - Upgrade subscription
router.post('/upgrade', 
  auth, 
  authWithSubscription, 
  validatePlanUpgrade,
  async (req, res) => {
    try {
      const { planType, planId, amount, paymentMethod } = req.body;

      // This endpoint would typically redirect to payment processing
      // For now, we'll simulate the upgrade flow
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid payment amount is required for plan upgrade'
        });
      }

      // Redirect to payment initialization
      res.json({
        success: true,
        message: 'Plan upgrade initiated',
        redirectUrl: '/api/payments/initialize',
        paymentData: {
          amount,
          currency: 'EGP',
          planType,
          planId,
          paymentMethod
        }
      });

    } catch (error) {
      console.error('Upgrade subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upgrade subscription'
      });
    }
  }
);

// POST /api/subscriptions/:subscriptionId/cancel - Cancel subscription
router.post('/:subscriptionId/cancel', auth, authWithSubscription, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { reason, immediate } = req.body;

    let updated = false;

    if (req.user.providerSubscription?.id === subscriptionId) {
      await prisma.providerSubscription.update({
        where: { id: subscriptionId },
        data: {
          autoRenew: false,
          isActive: immediate ? false : true, // If immediate, deactivate now
          // In production, you might set a cancellation date instead of immediate deactivation
        }
      });
      updated = true;
    } else if (req.user.userSubscription?.id === subscriptionId) {
      await prisma.userSubscription.update({
        where: { id: subscriptionId },
        data: {
          autoRenew: false,
          isActive: immediate ? false : true,
        }
      });
      updated = true;
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      message: immediate 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will not renew at the end of current period',
      cancelledAt: immediate ? new Date().toISOString() : null
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// PATCH /api/subscriptions/:subscriptionId/auto-renew - Update subscription auto-renewal
router.patch('/:subscriptionId/auto-renew', auth, authWithSubscription, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { autoRenew } = req.body;

    if (typeof autoRenew !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoRenew must be a boolean value'
      });
    }

    let updated = false;

    if (req.user.providerSubscription?.id === subscriptionId) {
      await prisma.providerSubscription.update({
        where: { id: subscriptionId },
        data: { autoRenew }
      });
      updated = true;
    } else if (req.user.userSubscription?.id === subscriptionId) {
      await prisma.userSubscription.update({
        where: { id: subscriptionId },
        data: { autoRenew }
      });
      updated = true;
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      autoRenew,
      message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Update auto-renewal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auto-renewal'
    });
  }
});

// POST /api/subscriptions/:subscriptionId/discount - Apply discount to subscription
router.post('/:subscriptionId/discount', 
  auth, 
  authWithSubscription, 
  requireProviderAccess,
  async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { type, percentage, description } = req.body;

      if (!type || !['FIELD_REPRESENTATIVE', 'MATCHING_DISCOUNT', 'CUSTOM'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount type'
        });
      }

      if (!percentage || percentage < 0 || percentage > 50) {
        return res.status(400).json({
          success: false,
          message: 'Discount percentage must be between 0 and 50'
        });
      }

      if (req.user.providerSubscription?.id !== subscriptionId) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      const currentSubscription = req.user.providerSubscription;
      let updatedDiscounts = {};

      if (type === 'FIELD_REPRESENTATIVE') {
        updatedDiscounts.fieldRepDiscount = percentage;
      } else if (type === 'MATCHING_DISCOUNT') {
        updatedDiscounts.matchingDiscount = percentage;
      }

      // Calculate total discount (capped at 50%)
      const totalDiscount = Math.min(
        (updatedDiscounts.fieldRepDiscount || currentSubscription.fieldRepDiscount || 0) +
        (updatedDiscounts.matchingDiscount || currentSubscription.matchingDiscount || 0),
        50
      );

      await prisma.providerSubscription.update({
        where: { id: subscriptionId },
        data: {
          ...updatedDiscounts,
          totalDiscount
        }
      });

      res.json({
        success: true,
        appliedDiscount: {
          type,
          percentage,
          description: description || `${type} discount applied`
        },
        totalDiscount,
        message: 'Discount applied successfully'
      });

    } catch (error) {
      console.error('Apply discount error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply discount'
      });
    }
  }
);

// GET /api/subscriptions/plans - Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const { planType } = req.query;

    const plans = {
      PROVIDER: [
        {
          id: 'BASIC_FREE',
          name: 'Basic (Free)',
          nameAr: 'الأساسي (مجاني)',
          price: 0,
          yearlyPrice: 0,
          features: getProviderPlanFeatures('BASIC_FREE', false),
          featuresAr: getProviderPlanFeatures('BASIC_FREE', true),
          popular: false
        },
        {
          id: 'BOOKING_BASIC',
          name: 'Booking Package',
          nameAr: 'باقة الحجز',
          price: 83,
          yearlyPrice: 1000,
          features: getProviderPlanFeatures('BOOKING_BASIC', false),
          featuresAr: getProviderPlanFeatures('BOOKING_BASIC', true),
          popular: true
        },
        {
          id: 'PRODUCTS_PREMIUM',
          name: 'Products Package',
          nameAr: 'باقة المنتجات',
          price: 167,
          yearlyPrice: 2000,
          features: getProviderPlanFeatures('PRODUCTS_PREMIUM', false),
          featuresAr: getProviderPlanFeatures('PRODUCTS_PREMIUM', true),
          popular: false
        },
        {
          id: 'TOP_BRONZE',
          name: 'Top 10 Bronze',
          nameAr: 'المركز 10 البرونزي',
          price: 833,
          yearlyPrice: 10000,
          features: getProviderPlanFeatures('TOP_BRONZE', false),
          featuresAr: getProviderPlanFeatures('TOP_BRONZE', true),
          popular: false
        },
        {
          id: 'TOP_SILVER',
          name: 'Top 5 Silver',
          nameAr: 'المركز 5 الفضي',
          price: 1667,
          yearlyPrice: 20000,
          features: getProviderPlanFeatures('TOP_SILVER', false),
          featuresAr: getProviderPlanFeatures('TOP_SILVER', true),
          popular: false
        },
        {
          id: 'TOP_GOLD',
          name: 'Top 3 Gold',
          nameAr: 'المركز 3 الذهبي',
          price: 2500,
          yearlyPrice: 30000,
          features: getProviderPlanFeatures('TOP_GOLD', false),
          featuresAr: getProviderPlanFeatures('TOP_GOLD', true),
          popular: false
        }
      ],
      USER: [
        {
          id: 'FREE',
          name: 'Free',
          nameAr: 'مجاني',
          price: 0,
          periods: [{ months: 12, price: 0 }],
          features: getUserPlanFeatures('FREE', false),
          featuresAr: getUserPlanFeatures('FREE', true),
          popular: false
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
          features: getUserPlanFeatures('MEDICAL_CARD', false),
          featuresAr: getUserPlanFeatures('MEDICAL_CARD', true),
          popular: true
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
          features: getUserPlanFeatures('ALL_INCLUSIVE', false),
          featuresAr: getUserPlanFeatures('ALL_INCLUSIVE', true),
          popular: false
        }
      ]
    };

    if (planType && plans[planType]) {
      res.json(plans[planType]);
    } else {
      res.json(plans);
    }

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
});

/**
 * Helper Functions
 */

// Check if subscription is expired
function isExpired(expiresAt) {
  return expiresAt && new Date() > new Date(expiresAt);
}

// Get provider plan display name
function getProviderPlanDisplayName(planType, isArabic = false) {
  const names = {
    BASIC_FREE: { en: 'Basic (Free)', ar: 'الأساسي (مجاني)' },
    BOOKING_BASIC: { en: 'Booking Package', ar: 'باقة الحجز' },
    PRODUCTS_PREMIUM: { en: 'Products Package', ar: 'باقة المنتجات' },
    TOP_BRONZE: { en: 'Top 10 Bronze', ar: 'المركز 10 البرونزي' },
    TOP_SILVER: { en: 'Top 5 Silver', ar: 'المركز 5 الفضي' },
    TOP_GOLD: { en: 'Top 3 Gold', ar: 'المركز 3 الذهبي' }
  };
  
  return names[planType]?.[isArabic ? 'ar' : 'en'] || planType;
}

// Get user plan display name
function getUserPlanDisplayName(planType, isArabic = false) {
  const names = {
    FREE: { en: 'Free', ar: 'مجاني' },
    MEDICAL_CARD: { en: 'Medical Directory Card', ar: 'بطاقة الدليل الطبي' },
    ALL_INCLUSIVE: { en: 'All-Inclusive Card', ar: 'البطاقة الشاملة' }
  };
  
  return names[planType]?.[isArabic ? 'ar' : 'en'] || planType;
}

// Get provider plan features
function getProviderPlanFeatures(planId, isArabic = false) {
  const features = {
    BASIC_FREE: {
      en: ['Full business listing', 'Customer reviews', 'Basic profile'],
      ar: ['عرض كامل للأعمال', 'تقييمات العملاء', 'الملف الأساسي']
    },
    BOOKING_BASIC: {
      en: ['All Basic features', 'Direct appointment booking', 'Calendar management'],
      ar: ['جميع ميزات الأساسي', 'حجز المواعيد المباشر', 'إدارة التقويم']
    },
    PRODUCTS_PREMIUM: {
      en: ['All Booking features', 'Product listing & sales', 'Inventory management', 'Delivery coordination'],
      ar: ['جميع ميزات الحجز', 'عرض وبيع المنتجات', 'إدارة المخزون', 'تنسيق التوصيل']
    },
    TOP_BRONZE: {
      en: ['All Premium features', 'Top 10 search priority', 'Priority badge', 'Advanced analytics'],
      ar: ['جميع الميزات المتميزة', 'أولوية الظهور في أول 10 نتائج', 'شارة الأولوية', 'تحليلات متقدمة']
    },
    TOP_SILVER: {
      en: ['All Bronze features', 'Top 5 search priority', 'Silver verified badge', 'Premium listing design'],
      ar: ['جميع ميزات البرونزي', 'أولوية الظهور في أول 5 نتائج', 'شارة التحقق الفضية', 'تصميم عرض مُمتاز']
    },
    TOP_GOLD: {
      en: ['All Silver features', 'Top 3 search priority', 'Gold verified badge', 'Promotional video', 'Dedicated account manager'],
      ar: ['جميع ميزات الفضي', 'أولوية الظهور في أول 3 نتائج', 'شارة التحقق الذهبية', 'فيديو ترويجي', 'مدير حساب مُخصص']
    }
  };
  
  return features[planId]?.[isArabic ? 'ar' : 'en'] || [];
}

// Get user plan features
function getUserPlanFeatures(planId, isArabic = false) {
  const features = {
    FREE: {
      en: ['Browse all services', 'Basic search', 'Read reviews', 'Contact businesses'],
      ar: ['تصفح جميع الخدمات', 'البحث الأساسي', 'قراءة التقييمات', 'التواصل مع الأعمال']
    },
    MEDICAL_CARD: {
      en: ['Medical discounts', 'Up to 5 family members', 'Digital card + QR', 'Priority booking', '1 month free trial'],
      ar: ['خصومات طبية', 'حتى 5 أفراد من العائلة', 'بطاقة رقمية + QR', 'أولوية في الحجز', 'شهر مجاني تجريبي']
    },
    ALL_INCLUSIVE: {
      en: ['All category discounts', 'Up to 5 family members', 'Digital card + QR', 'Priority booking', 'Exclusive offers', '1 month free trial'],
      ar: ['خصومات جميع الفئات', 'حتى 5 أفراد من العائلة', 'بطاقة رقمية + QR', 'أولوية في الحجز', 'عروض حصرية', 'شهر مجاني تجريبي']
    }
  };
  
  return features[planId]?.[isArabic ? 'ar' : 'en'] || [];
}

// Create default provider subscription
async function createDefaultProviderSubscription(userId) {
  try {
    await prisma.providerSubscription.create({
      data: {
        providerId: userId,
        planType: 'BASIC_FREE',
        pricePerYear: 0,
        currency: 'EGP',
        canTakeBookings: false,
        canListProducts: false,
        searchPriority: 0,
        hasPriorityBadge: false,
        hasPromotionalVideo: false,
        totalDiscount: 0,
        isActive: true,
        autoRenew: false
      }
    });
  } catch (error) {
    console.error('Create default provider subscription error:', error);
  }
}

// Create default user subscription
async function createDefaultUserSubscription(userId) {
  try {
    await prisma.userSubscription.create({
      data: {
        userId: userId,
        planType: 'FREE',
        pricePerPeriod: 0,
        periodMonths: 12,
        currency: 'EGP',
        hasMedicalDiscounts: false,
        hasAllCategoryDiscounts: false,
        maxFamilyMembers: 0,
        isActive: true,
        isTrial: false,
        autoRenew: false
      }
    });
  } catch (error) {
    console.error('Create default user subscription error:', error);
  }
}

// Get default provider subscription object
function getDefaultProviderSubscription() {
  return {
    id: 'default',
    planType: 'PROVIDER',
    planName: 'Basic (Free)',
    planNameAr: 'الأساسي (مجاني)',
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    endDate: null,
    autoRenew: false,
    amount: 0,
    currency: 'EGP',
    features: getProviderPlanFeatures('BASIC_FREE', false),
    featuresAr: getProviderPlanFeatures('BASIC_FREE', true),
    totalDiscount: 0
  };
}

// Get default user subscription object
function getDefaultUserSubscription() {
  return {
    id: 'default',
    planType: 'USER',
    planName: 'Free',
    planNameAr: 'مجاني',
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    endDate: null,
    autoRenew: false,
    amount: 0,
    currency: 'EGP',
    features: getUserPlanFeatures('FREE', false),
    featuresAr: getUserPlanFeatures('FREE', true),
    maxFamilyMembers: 0,
    periodMonths: 12
  };
}

// GET /api/subscriptions/family-members - Get user's family members
router.get('/family-members', auth, authWithSubscription, async (req, res) => {
  try {
    const familyMembers = await prisma.familyMember.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      familyMembers: familyMembers.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        relationship: member.relationship,
        joinedAt: member.createdAt.toISOString(),
        isActive: member.isActive
      }))
    });

  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get family members'
    });
  }
});

// POST /api/subscriptions/family-members - Add new family member
router.post('/family-members', auth, authWithSubscription, async (req, res) => {
  try {
    const { name, email, phone, relationship } = req.body;

    if (!name || !email || !relationship) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and relationship are required'
      });
    }

    // Check family member limit based on subscription
    const currentMembers = await prisma.familyMember.count({
      where: {
        userId: req.user.id,
        isActive: true
      }
    });

    const maxMembers = req.user.userSubscription?.maxFamilyMembers || 0;
    if (currentMembers >= maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Maximum family members limit (${maxMembers}) reached for your plan`
      });
    }

    // Check if email already exists
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        userId: req.user.id,
        email: email.toLowerCase(),
        isActive: true
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Family member with this email already exists'
      });
    }

    const familyMember = await prisma.familyMember.create({
      data: {
        userId: req.user.id,
        name,
        email: email.toLowerCase(),
        phone,
        relationship,
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Family member added successfully',
      familyMember: {
        id: familyMember.id,
        name: familyMember.name,
        email: familyMember.email,
        phone: familyMember.phone,
        relationship: familyMember.relationship,
        joinedAt: familyMember.createdAt.toISOString(),
        isActive: familyMember.isActive
      }
    });

  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add family member'
    });
  }
});

// PUT /api/subscriptions/family-members/:memberId - Update family member
router.put('/family-members/:memberId', auth, authWithSubscription, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, email, phone, relationship } = req.body;

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        userId: req.user.id
      }
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    const updatedMember = await prisma.familyMember.update({
      where: { id: memberId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(relationship && { relationship })
      }
    });

    res.json({
      success: true,
      message: 'Family member updated successfully',
      familyMember: {
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        phone: updatedMember.phone,
        relationship: updatedMember.relationship,
        joinedAt: updatedMember.createdAt.toISOString(),
        isActive: updatedMember.isActive
      }
    });

  } catch (error) {
    console.error('Update family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family member'
    });
  }
});

// DELETE /api/subscriptions/family-members/:memberId - Remove family member
router.delete('/family-members/:memberId', auth, authWithSubscription, async (req, res) => {
  try {
    const { memberId } = req.params;

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        userId: req.user.id
      }
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: 'Family member not found'
      });
    }

    // Soft delete - mark as inactive
    await prisma.familyMember.update({
      where: { id: memberId },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Family member removed successfully'
    });

  } catch (error) {
    console.error('Remove family member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove family member'
    });
  }
});

// GET /api/subscriptions/:subscriptionId/digital-card - Download digital card
router.get('/:subscriptionId/digital-card', auth, authWithSubscription, async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    // Verify user owns this subscription
    if (req.user.userSubscription?.id !== subscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const subscription = req.user.userSubscription;
    
    if (!subscription.cardNumber) {
      return res.status(400).json({
        success: false,
        message: 'Digital card not available for this subscription'
      });
    }

    // In a real implementation, you would generate a PNG/PDF card image
    // For now, we'll return a placeholder response
    const cardData = {
      cardNumber: subscription.cardNumber,
      holderName: req.user.name,
      planName: getUserPlanDisplayName(subscription.planType, false),
      planNameAr: getUserPlanDisplayName(subscription.planType, true),
      validUntil: subscription.expiresAt?.toLocaleDateString() || 'N/A',
      qrCode: subscription.qrCode
    };

    // This would typically generate and return an image file
    // For demo purposes, returning JSON data
    res.json({
      success: true,
      message: 'Digital card data',
      cardData
    });

  } catch (error) {
    console.error('Get digital card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get digital card'
    });
  }
});

export default router;
