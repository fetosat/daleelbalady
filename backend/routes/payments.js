// Payment routes - All endpoints expected by frontend
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import PaymobService from '../services/paymob.js';
import { auth } from '../middleware/auth.js';
import { 
  authWithSubscription, 
  rateLimitPayments, 
  validatePaymentRequest, 
  validateWebhookSignature 
} from '../middleware/payment.js';

const router = express.Router();
const prisma = new PrismaClient();
const paymobService = new PaymobService();

// Storage for payment transactions (in production, use Redis or database)
const paymentTransactions = new Map();

/**
 * Payment Processing APIs
 */

// POST /api/payments/initialize - Initialize payment with Paymob
router.post('/initialize', 
  auth, 
  authWithSubscription, 
  rateLimitPayments(), 
  validatePaymentRequest,
  async (req, res) => {
    try {
      const {
        amount,
        currency,
        planType,
        planId,
        paymentMethod,
        cardData,
        mobileNumber,
        discountCode
      } = req.body;

      // Validate payment method specific data
      paymobService.validatePaymentMethod(paymentMethod, req.body);

      // Calculate final amount after discounts
      let finalAmount = amount;
      let appliedDiscounts = [];

      // Apply discount code if provided
      if (discountCode) {
        try {
          const coupon = await prisma.coupon.findFirst({
            where: {
              code: discountCode,
              active: true,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          });

          if (coupon && coupon.usesCount < (coupon.maxUses || Infinity)) {
            if (coupon.discountPercent) {
              const discountAmount = (amount * coupon.discountPercent) / 100;
              finalAmount -= discountAmount;
              appliedDiscounts.push({
                type: 'COUPON',
                code: discountCode,
                percentage: coupon.discountPercent,
                amount: discountAmount
              });
            }
          }
        } catch (error) {
          console.error('Coupon validation error:', error);
        }
      }

      // Initialize payment with Paymob
      const paymentResult = await paymobService.initializePayment({
        amount: Math.max(0, finalAmount),
        currency: currency || 'EGP',
        planType,
        planId,
        paymentMethod,
        cardData,
        mobileNumber,
        email: req.user.email
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: paymentResult.message || 'Payment initialization failed'
        });
      }

      // Store transaction details
      const transactionData = {
        id: paymentResult.transactionId,
        userId: req.user.id,
        amount: finalAmount,
        originalAmount: amount,
        currency: currency || 'EGP',
        planType,
        planId,
        paymentMethod,
        status: 'PENDING',
        paymobOrderId: paymentResult.orderId,
        paymentKey: paymentResult.paymentKey,
        appliedDiscounts,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };

      paymentTransactions.set(paymentResult.transactionId, transactionData);

      // Save to database
      try {
        await prisma.$transaction(async (tx) => {
          // Create payment record (we'll need to add this to schema)
          // For now, we'll track in memory and update subscription on success
          
          // Update coupon usage if applied
          if (discountCode && appliedDiscounts.length > 0) {
            await tx.coupon.update({
              where: { code: discountCode },
              data: { usesCount: { increment: 1 } }
            });
          }
        });
      } catch (dbError) {
        console.error('Database transaction error:', dbError);
        // Continue with payment even if DB logging fails
      }

      res.json({
        success: true,
        transactionId: paymentResult.transactionId,
        redirectUrl: paymentResult.redirectUrl,
        iframeUrl: paymentResult.iframeUrl,
        message: 'Payment initialized successfully'
      });

    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Payment initialization failed'
      });
    }
  }
);

// POST /api/payments/confirm/:transactionId - Confirm payment after successful processing
router.post('/confirm/:transactionId', auth, authWithSubscription, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Get transaction data
    const transaction = paymentTransactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user owns this transaction
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to transaction'
      });
    }

    // Get transaction status from Paymob
    try {
      const paymobStatus = await paymobService.getTransactionStatus(transactionId);
      
      if (paymobStatus.success) {
        // Update transaction status
        transaction.status = 'SUCCESS';
        transaction.completedAt = new Date();
        paymentTransactions.set(transactionId, transaction);

        // Apply subscription upgrade
        await applySubscriptionUpgrade(req.user.id, transaction);

        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          subscription: await getUserSubscription(req.user.id, transaction.planType)
        });
      } else if (paymobStatus.pending) {
        res.json({
          success: false,
          pending: true,
          message: 'Payment is still processing'
        });
      } else {
        transaction.status = 'FAILED';
        paymentTransactions.set(transactionId, transaction);
        
        res.status(400).json({
          success: false,
          message: 'Payment failed'
        });
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment status'
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed'
    });
  }
});

// GET /api/payments/status/:transactionId - Get payment status
router.get('/status/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Get transaction data
    const transaction = paymentTransactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user owns this transaction
    if (transaction.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to transaction'
      });
    }

    // Check if transaction has expired
    if (new Date() > transaction.expiresAt && transaction.status === 'PENDING') {
      transaction.status = 'EXPIRED';
      paymentTransactions.set(transactionId, transaction);
    }

    res.json({
      transactionId,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      planType: transaction.planType,
      planId: transaction.planId,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt || null
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
});

// GET /api/payments/receipt/:paymentId - Download payment receipt
router.get('/receipt/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Get transaction data
    const transaction = paymentTransactions.get(paymentId);
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    if (transaction.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Receipt only available for successful payments'
      });
    }

    // Generate receipt (simple text format for now)
    const receipt = generateReceipt(transaction, req.user);
    
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="receipt_${paymentId}.txt"`
    });
    
    res.send(receipt);

  } catch (error) {
    console.error('Receipt download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download receipt'
    });
  }
});

// POST /api/payments/send-confirmation - Send confirmation email
router.post('/send-confirmation', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Get transaction data
    const transaction = paymentTransactions.get(transactionId);
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation email only available for successful payments'
      });
    }

    // TODO: Implement email sending (using nodemailer or similar)
    console.log(`Sending confirmation email for transaction ${transactionId} to ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Send confirmation email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send confirmation email'
    });
  }
});

/**
 * Payment History APIs
 */

// GET /api/payments/history - Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const {
      status,
      dateRange,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get user's transactions from memory storage
    const userTransactions = Array.from(paymentTransactions.values())
      .filter(tx => tx.userId === req.user.id)
      .filter(tx => {
        if (status && tx.status !== status) return false;
        if (search && !tx.planId.toLowerCase().includes(search.toLowerCase())) return false;
        // TODO: Add date range filtering
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    const payments = userTransactions.map(tx => ({
      id: tx.id,
      transactionId: tx.id,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      planName: getPlanDisplayName(tx.planId, false),
      planNameAr: getPlanDisplayName(tx.planId, true),
      planType: tx.planType,
      date: tx.createdAt.toISOString(),
      period: tx.planType === 'PROVIDER' ? 'Annual' : 'Variable',
      description: `Subscription payment for ${tx.planId}`,
      receipt: tx.status === 'SUCCESS' ? `/api/payments/receipt/${tx.id}` : null
    }));

    const total = Array.from(paymentTransactions.values())
      .filter(tx => tx.userId === req.user.id).length;

    res.json({
      payments,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
});

/**
 * Paymob Integration Utilities
 */

// GET /api/payments/paymob/iframe/:transactionId - Get Paymob iframe URL
router.get('/paymob/iframe/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = paymentTransactions.get(transactionId);
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const iframeUrl = paymobService.getIframeUrl(transaction.paymentKey);
    
    res.json({
      success: true,
      iframeUrl
    });

  } catch (error) {
    console.error('Get Paymob iframe URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Paymob iframe URL'
    });
  }
});

// POST /api/payments/paymob/callback - Handle Paymob webhook callback
router.post('/paymob/callback', validateWebhookSignature, async (req, res) => {
  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.webhookSignature;

    // Verify webhook signature
    if (!paymobService.verifyWebhookSignature(rawBody, signature)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Process webhook
    const webhookData = paymobService.processWebhook(req.body);
    
    // Find transaction
    const transactionId = webhookData.transactionId;
    const transaction = paymentTransactions.get(transactionId);
    
    if (transaction) {
      // Update transaction status
      if (webhookData.success) {
        transaction.status = 'SUCCESS';
        transaction.completedAt = new Date();
        
        // Apply subscription upgrade
        await applySubscriptionUpgrade(transaction.userId, transaction);
      } else if (!webhookData.pending) {
        transaction.status = 'FAILED';
      }
      
      paymentTransactions.set(transactionId, transaction);
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Paymob callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Paymob callback'
    });
  }
});

/**
 * Helper Functions
 */

// Apply subscription upgrade after successful payment
async function applySubscriptionUpgrade(userId, transaction) {
  try {
    const { planType, planId, amount } = transaction;
    
    if (planType === 'PROVIDER') {
      // Update or create provider subscription
      await prisma.providerSubscription.upsert({
        where: { providerId: userId },
        update: {
          planType: planId,
          pricePerYear: amount,
          ...getProviderPlanFeatures(planId),
          isActive: true,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          lastPaymentAt: new Date(),
          nextPaymentDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        create: {
          providerId: userId,
          planType: planId,
          pricePerYear: amount,
          ...getProviderPlanFeatures(planId),
          isActive: true,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          lastPaymentAt: new Date(),
          nextPaymentDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
    } else if (planType === 'USER') {
      // Update or create user subscription
      const periodMonths = getUserPlanPeriod(planId, amount);
      
      await prisma.userSubscription.upsert({
        where: { userId: userId },
        update: {
          planType: planId,
          pricePerPeriod: amount,
          periodMonths,
          ...getUserPlanFeatures(planId),
          isActive: true,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000),
          lastPaymentAt: new Date(),
          nextPaymentDue: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000)
        },
        create: {
          userId: userId,
          planType: planId,
          pricePerPeriod: amount,
          periodMonths,
          ...getUserPlanFeatures(planId),
          isActive: true,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000),
          lastPaymentAt: new Date(),
          nextPaymentDue: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
  } catch (error) {
    console.error('Apply subscription upgrade error:', error);
    throw error;
  }
}

// Get provider plan features
function getProviderPlanFeatures(planId) {
  const features = {
    BASIC_FREE: {
      canTakeBookings: false,
      canListProducts: false,
      searchPriority: 0,
      hasPriorityBadge: false,
      hasPromotionalVideo: false
    },
    BOOKING_BASIC: {
      canTakeBookings: true,
      canListProducts: false,
      searchPriority: 0,
      hasPriorityBadge: false,
      hasPromotionalVideo: false
    },
    PRODUCTS_PREMIUM: {
      canTakeBookings: true,
      canListProducts: true,
      searchPriority: 0,
      hasPriorityBadge: false,
      hasPromotionalVideo: false
    },
    TOP_BRONZE: {
      canTakeBookings: true,
      canListProducts: true,
      searchPriority: 10,
      hasPriorityBadge: true,
      hasPromotionalVideo: false
    },
    TOP_SILVER: {
      canTakeBookings: true,
      canListProducts: true,
      searchPriority: 5,
      hasPriorityBadge: true,
      hasPromotionalVideo: false
    },
    TOP_GOLD: {
      canTakeBookings: true,
      canListProducts: true,
      searchPriority: 3,
      hasPriorityBadge: true,
      hasPromotionalVideo: true
    }
  };
  
  return features[planId] || features.BASIC_FREE;
}

// Get user plan features
function getUserPlanFeatures(planId) {
  const features = {
    FREE: {
      hasMedicalDiscounts: false,
      hasAllCategoryDiscounts: false,
      maxFamilyMembers: 0
    },
    MEDICAL_CARD: {
      hasMedicalDiscounts: true,
      hasAllCategoryDiscounts: false,
      maxFamilyMembers: 5
    },
    ALL_INCLUSIVE: {
      hasMedicalDiscounts: true,
      hasAllCategoryDiscounts: true,
      maxFamilyMembers: 5
    }
  };
  
  return features[planId] || features.FREE;
}

// Get user plan period based on amount
function getUserPlanPeriod(planId, amount) {
  // This is a simple mapping - in production you'd have a proper pricing table
  if (planId === 'MEDICAL_CARD') {
    if (amount <= 60) return 3;
    if (amount <= 90) return 6;
    return 12;
  }
  
  if (planId === 'ALL_INCLUSIVE') {
    if (amount <= 150) return 3;
    if (amount <= 220) return 6;
    return 12;
  }
  
  return 12; // Default to 12 months
}

// Get plan display name
function getPlanDisplayName(planId, isArabic = false) {
  const names = {
    BASIC_FREE: { en: 'Basic (Free)', ar: 'الأساسي (مجاني)' },
    BOOKING_BASIC: { en: 'Booking Package', ar: 'باقة الحجز' },
    PRODUCTS_PREMIUM: { en: 'Products Package', ar: 'باقة المنتجات' },
    TOP_BRONZE: { en: 'Top 10 Bronze', ar: 'المركز 10 البرونزي' },
    TOP_SILVER: { en: 'Top 5 Silver', ar: 'المركز 5 الفضي' },
    TOP_GOLD: { en: 'Top 3 Gold', ar: 'المركز 3 الذهبي' },
    FREE: { en: 'Free', ar: 'مجاني' },
    MEDICAL_CARD: { en: 'Medical Directory Card', ar: 'بطاقة الدليل الطبي' },
    ALL_INCLUSIVE: { en: 'All-Inclusive Card', ar: 'البطاقة الشاملة' }
  };
  
  return names[planId]?.[isArabic ? 'ar' : 'en'] || planId;
}

// Get user subscription
async function getUserSubscription(userId, planType) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerSubscription: planType === 'PROVIDER',
        userSubscription: planType === 'USER'
      }
    });
    
    return planType === 'PROVIDER' ? user?.providerSubscription : user?.userSubscription;
  } catch (error) {
    console.error('Get user subscription error:', error);
    return null;
  }
}

// Generate receipt text
function generateReceipt(transaction, user) {
  return `
DALEEL BALADY - PAYMENT RECEIPT
================================

Receipt ID: ${transaction.id}
Date: ${transaction.completedAt.toISOString()}

Customer Information:
Name: ${user.name}
Email: ${user.email}

Transaction Details:
Plan: ${getPlanDisplayName(transaction.planId, false)}
Plan Type: ${transaction.planType}
Payment Method: ${transaction.paymentMethod}
Amount: ${transaction.amount} ${transaction.currency}
Status: ${transaction.status}

Applied Discounts:
${transaction.appliedDiscounts.map(d => `- ${d.type}: ${d.percentage}% (${d.amount} ${transaction.currency})`).join('\n')}

Thank you for your payment!
For support, contact: support@daleelbalady.com
  `.trim();
}

/**
 * Payment Methods APIs
 */

// GET /api/payments/methods - Get saved payment methods
router.get('/methods', auth, authWithSubscription, async (req, res) => {
  try {
    // For now, return empty array since we don't store card details for security
    // In production, you'd integrate with a secure payment method storage service
    res.json([]);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    });
  }
});

// POST /api/payments/methods - Add new payment method
router.post('/methods', auth, authWithSubscription, async (req, res) => {
  try {
    const { type, cardData, walletProvider, isDefault } = req.body;

    if (!type || !['CARD', 'WALLET'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method type'
      });
    }

    // For security, we don't actually store card details
    // In production, you'd use Paymob's tokenization service
    const paymentMethod = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      last4: type === 'CARD' ? cardData?.number?.slice(-4) : null,
      brand: type === 'CARD' ? getCardBrandFromNumber(cardData?.number) : null,
      expiryMonth: type === 'CARD' ? parseInt(cardData?.expiry?.split('/')[0]) : null,
      expiryYear: type === 'CARD' ? parseInt(cardData?.expiry?.split('/')[1]) : null,
      holderName: cardData?.holderName || null,
      walletProvider: walletProvider || null,
      isDefault: isDefault || false
    };

    res.json(paymentMethod);
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method'
    });
  }
});

// Get card brand from number
function getCardBrandFromNumber(cardNumber) {
  if (!cardNumber) return 'Unknown';
  
  const num = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num)) return 'MasterCard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6/.test(num)) return 'Discover';
  
  return 'Unknown';
}

export default router;
