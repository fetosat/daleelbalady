// Payment-specific middleware and utilities
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Enhanced auth middleware that includes subscription data
export const authWithSubscription = async (req, res, next) => {
  try {
    // User should already be authenticated by auth middleware
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate to access payment features'
      });
    }

    // Fetch user with subscription data
    const userWithSubscription = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        providerSubscription: true,
        userSubscription: true,
      },
    });

    if (!userWithSubscription) {
      return res.status(401).json({ 
        error: 'User not found',
        message: 'Invalid token - user does not exist'
      });
    }

    req.user = userWithSubscription;
    next();
  } catch (error) {
    console.error('Authentication with subscription error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Check if user can access provider features
export const requireProviderAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate to access provider features'
      });
    }

    if (req.user.role !== 'PROVIDER') {
      return res.status(403).json({ 
        error: 'Provider access required',
        message: 'This endpoint requires provider role access'
      });
    }

    next();
  } catch (error) {
    console.error('Provider access check error:', error);
    return res.status(500).json({ 
      error: 'Access check failed',
      message: 'Internal server error during access verification'
    });
  }
};

// Check subscription access level
export const checkSubscriptionAccess = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please authenticate to access subscription features'
        });
      }

      let hasAccess = false;

      if (req.user.role === 'PROVIDER') {
        const subscription = req.user.providerSubscription;
        
        if (!subscription || !subscription.isActive) {
          hasAccess = false;
        } else {
          switch (requiredFeature) {
            case 'booking':
              hasAccess = subscription.canTakeBookings;
              break;
            case 'products':
              hasAccess = subscription.canListProducts;
              break;
            case 'priority':
              hasAccess = subscription.searchPriority > 0;
              break;
            case 'badge':
              hasAccess = subscription.hasPriorityBadge;
              break;
            case 'video':
              hasAccess = subscription.hasPromotionalVideo;
              break;
            default:
              hasAccess = true;
          }
        }
      } else if (req.user.role === 'CUSTOMER') {
        const subscription = req.user.userSubscription;
        
        if (!subscription || !subscription.isActive) {
          hasAccess = false;
        } else {
          switch (requiredFeature) {
            case 'medical_discounts':
              hasAccess = subscription.hasMedicalDiscounts;
              break;
            case 'all_discounts':
              hasAccess = subscription.hasAllCategoryDiscounts;
              break;
            case 'family_members':
              hasAccess = subscription.maxFamilyMembers > 0;
              break;
            default:
              hasAccess = true;
          }
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Subscription upgrade required',
          message: `This feature requires a higher subscription plan that includes ${requiredFeature} access`,
          requiredFeature
        });
      }

      next();
    } catch (error) {
      console.error('Subscription access check error:', error);
      return res.status(500).json({ 
        error: 'Access check failed',
        message: 'Internal server error during subscription verification'
      });
    }
  };
};

// Rate limiting middleware for payment endpoints
export const rateLimitPayments = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  const requestCounts = new Map();
  
  return (req, res, next) => {
    const identifier = req.ip + (req.user?.id || '');
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, data] of requestCounts.entries()) {
      if (data.windowStart < windowStart) {
        requestCounts.delete(key);
      }
    }
    
    // Get current request count
    const currentData = requestCounts.get(identifier) || { count: 0, windowStart: now };
    
    if (currentData.windowStart < windowStart) {
      // Reset window
      currentData.count = 0;
      currentData.windowStart = now;
    }
    
    if (currentData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many payment requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / (60 * 1000)} minutes.`,
        retryAfter: Math.ceil((currentData.windowStart + windowMs - now) / 1000)
      });
    }
    
    currentData.count++;
    requestCounts.set(identifier, currentData);
    
    next();
  };
};

// Validate payment request data
export const validatePaymentRequest = (req, res, next) => {
  try {
    const { amount, currency, planType, planId, paymentMethod } = req.body;

    // Basic validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    if (!currency || typeof currency !== 'string') {
      return res.status(400).json({
        error: 'Invalid currency',
        message: 'Currency is required'
      });
    }

    if (!planType || !['PROVIDER', 'USER'].includes(planType)) {
      return res.status(400).json({
        error: 'Invalid plan type',
        message: 'Plan type must be either PROVIDER or USER'
      });
    }

    if (!planId || typeof planId !== 'string') {
      return res.status(400).json({
        error: 'Invalid plan ID',
        message: 'Plan ID is required'
      });
    }

    if (!paymentMethod || !['card', 'mobile_wallet', 'bank_transfer'].includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method',
        message: 'Payment method must be card, mobile_wallet, or bank_transfer'
      });
    }

    // Method-specific validation
    if (paymentMethod === 'card' && !req.body.cardData) {
      return res.status(400).json({
        error: 'Card data required',
        message: 'Card information is required for card payments'
      });
    }

    if (paymentMethod === 'mobile_wallet' && !req.body.mobileNumber) {
      return res.status(400).json({
        error: 'Mobile number required',
        message: 'Mobile number is required for mobile wallet payments'
      });
    }

    next();
  } catch (error) {
    console.error('Payment validation error:', error);
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Invalid payment request data'
    });
  }
};

// Webhook signature validation
export const validateWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-paymob-signature'] || req.headers['paymob-signature'];
    
    if (!signature) {
      return res.status(401).json({
        error: 'Missing webhook signature',
        message: 'Webhook signature is required for security'
      });
    }

    req.webhookSignature = signature;
    next();
  } catch (error) {
    console.error('Webhook validation error:', error);
    return res.status(400).json({
      error: 'Webhook validation failed',
      message: 'Invalid webhook request'
    });
  }
};

// Plan validation utilities
export const validatePlanUpgrade = async (req, res, next) => {
  try {
    const { planType, planId } = req.body;
    const user = req.user;

    // Define valid plan transitions
    const providerPlanHierarchy = [
      'BASIC_FREE',
      'BOOKING_BASIC', 
      'PRODUCTS_PREMIUM',
      'TOP_BRONZE',
      'TOP_SILVER',
      'TOP_GOLD'
    ];

    const userPlanHierarchy = [
      'FREE',
      'MEDICAL_CARD',
      'ALL_INCLUSIVE'
    ];

    if (planType === 'PROVIDER') {
      const currentSubscription = user.providerSubscription;
      const currentPlanIndex = providerPlanHierarchy.indexOf(currentSubscription?.planType || 'BASIC_FREE');
      const newPlanIndex = providerPlanHierarchy.indexOf(planId);

      if (newPlanIndex === -1) {
        return res.status(400).json({
          error: 'Invalid provider plan',
          message: 'The specified provider plan does not exist'
        });
      }

      if (newPlanIndex <= currentPlanIndex && currentSubscription?.isActive) {
        return res.status(400).json({
          error: 'Invalid plan upgrade',
          message: 'You can only upgrade to a higher tier plan'
        });
      }
    } else if (planType === 'USER') {
      const currentSubscription = user.userSubscription;
      const currentPlanIndex = userPlanHierarchy.indexOf(currentSubscription?.planType || 'FREE');
      const newPlanIndex = userPlanHierarchy.indexOf(planId);

      if (newPlanIndex === -1) {
        return res.status(400).json({
          error: 'Invalid user plan',
          message: 'The specified user plan does not exist'
        });
      }

      if (newPlanIndex <= currentPlanIndex && currentSubscription?.isActive) {
        return res.status(400).json({
          error: 'Invalid plan upgrade',
          message: 'You can only upgrade to a higher tier plan'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Plan validation error:', error);
    return res.status(500).json({
      error: 'Plan validation failed',
      message: 'Internal server error during plan validation'
    });
  }
};

export default {
  authWithSubscription,
  requireProviderAccess,
  checkSubscriptionAccess,
  rateLimitPayments,
  validatePaymentRequest,
  validateWebhookSignature,
  validatePlanUpgrade
};
