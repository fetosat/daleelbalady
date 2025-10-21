// Production-ready Payment routes with security fixes
import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/client.js';
import PaymobService from '../services/paymob.js';
import { auth } from '../middleware/auth.js';
import { 
  authWithSubscription, 
  rateLimitPayments, 
  validatePaymentRequest 
} from '../middleware/payment.js';

const router = express.Router();
const prisma = new PrismaClient();
const paymobService = new PaymobService();

// Rate limiting for payment endpoints
const PAYMENT_RATE_LIMIT = rateLimitPayments(15 * 60 * 1000, 3); // 3 requests per 15 minutes

/**
 * PRODUCTION PAYMENT PROCESSING
 */

// POST /api/payments/initialize - Initialize payment (PCI-compliant)
router.post('/initialize', 
  auth, 
  authWithSubscription, 
  PAYMENT_RATE_LIMIT,
  async (req, res) => {
    try {
      const {
        amount,
        currency = 'EGP',
        planType,
        planId,
        paymentMethod,
        mobileNumber,
        discountCode,
        holderName // Only non-sensitive data allowed
      } = req.body;

      // Server-side validation
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amount'
        });
      }

      if (!planType || !['PROVIDER', 'USER'].includes(planType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type'
        });
      }

      if (!paymentMethod || !['card', 'mobile_wallet', 'bank_transfer'].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
      }

      // Validate mobile wallet method
      if (paymentMethod === 'mobile_wallet') {
        if (!mobileNumber || !/^01[0125][0-9]{8}$/.test(mobileNumber)) {
          return res.status(400).json({
            success: false,
            message: 'Valid Egyptian mobile number required'
          });
        }
      }

      // Calculate final amount server-side (never trust client)
      let finalAmount = amount;
      let appliedDiscounts = [];

      // Apply discount code if provided (but don't increment usage yet)
      let coupon = null;
      if (discountCode) {
        try {
          coupon = await prisma.coupon.findFirst({
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
              finalAmount = Math.max(0, finalAmount - discountAmount);
              appliedDiscounts.push({
                type: 'COUPON',
                code: discountCode,
                percentage: coupon.discountPercent,
                amount: discountAmount
              });
            }
            if (coupon.discountAmount) {
              finalAmount = Math.max(0, finalAmount - coupon.discountAmount);
              appliedDiscounts.push({
                type: 'COUPON',
                code: discountCode,
                percentage: 0,
                amount: coupon.discountAmount
              });
            }
          }
        } catch (error) {
          console.error('Coupon validation error:', error);
          // Continue without coupon
        }
      }

      // Create payment record FIRST (with PENDING status)
      const payment = await prisma.payment.create({
        data: {
          userId: req.user.id,
          planType,
          planId,
          amount: finalAmount,
          originalAmount: amount,
          currency,
          paymentMethod,
          status: 'PENDING',
          appliedDiscounts,
          couponCode: discountCode || null,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });

      // Initialize payment with Paymob (no card data)
      const paymentResult = await paymobService.initializePayment({
        amount: finalAmount,
        currency,
        planType,
        planId,
        paymentMethod,
        // Only include safe data for Paymob
        mobileNumber: paymentMethod === 'mobile_wallet' ? mobileNumber : undefined,
        email: req.user.email,
        holderName: holderName || req.user.name
      });

      if (!paymentResult.success) {
        // Mark payment as failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });

        return res.status(400).json({
          success: false,
          message: paymentResult.message || 'Payment initialization failed'
        });
      }

      // Update payment with Paymob details
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymobOrderId: paymentResult.orderId.toString(),
          paymobPaymentKey: paymentResult.paymentKey
        }
      });

      // Log payment initialization (no sensitive data)
      console.log(`Payment initialized: ${payment.id} for user ${req.user.id}, amount: ${finalAmount} ${currency}`);

      res.json({
        success: true,
        paymentId: payment.id, // Our internal payment ID
        transactionId: paymentResult.transactionId, // For backwards compatibility
        redirectUrl: paymentResult.redirectUrl,
        iframeUrl: paymentResult.iframeUrl,
        message: 'Payment initialized successfully'
      });

    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment initialization failed'
      });
    }
  }
);

// GET /api/payments/status/:paymentId - Get payment status (secure)
router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Get payment from database with ownership check
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.user.id // Ensure user owns this payment
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment has expired
    if (payment.expiresAt && new Date() > payment.expiresAt && payment.status === 'PENDING') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'EXPIRED' }
      });
      payment.status = 'EXPIRED';
    }

    res.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      originalAmount: payment.originalAmount,
      currency: payment.currency,
      planType: payment.planType,
      planId: payment.planId,
      paymentMethod: payment.paymentMethod,
      appliedDiscounts: payment.appliedDiscounts,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
});

// POST /api/payments/paymob/callback - Secure webhook handler
router.post('/paymob/callback', 
  express.raw({ type: '*/*' }), // Get raw body for HMAC verification
  async (req, res) => {
    try {
      // Get signature from headers (adjust based on Paymob documentation)
      const signature = req.headers['x-paymob-signature'] || 
                       req.headers['paymob-signature'] ||
                       req.query.hmac;

      if (!signature) {
        console.error('Webhook missing signature');
        return res.status(401).json({
          success: false,
          message: 'Missing webhook signature'
        });
      }

      // Verify HMAC with raw body
      const hmac = crypto.createHmac('sha512', process.env.PAYMOB_WEBHOOK_SECRET);
      hmac.update(req.body);
      const calculatedSignature = hmac.digest('hex');

      if (calculatedSignature !== signature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }

      // Parse the webhook payload
      let webhookData;
      try {
        webhookData = JSON.parse(req.body.toString('utf8'));
      } catch (parseError) {
        console.error('Webhook payload parse error:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook payload'
        });
      }

      // Process webhook with Paymob service
      const processedWebhook = paymobService.processWebhook(webhookData);
      
      // Find payment by Paymob order ID (more reliable than transaction ID)
      const payment = await prisma.payment.findFirst({
        where: {
          paymobOrderId: processedWebhook.orderId?.toString()
        },
        include: {
          user: {
            include: {
              providerSubscription: true,
              userSubscription: true
            }
          }
        }
      });

      if (!payment) {
        console.error(`Webhook: Payment not found for order ID: ${processedWebhook.orderId}`);
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Idempotency check: if already processed, return success
      if (payment.webhookReceived && payment.status === 'SUCCESS') {
        console.log(`Webhook: Already processed payment ${payment.id}`);
        return res.json({
          success: true,
          message: 'Webhook already processed'
        });
      }

      // Update payment status based on webhook
      let newStatus = 'FAILED';
      if (processedWebhook.success) {
        newStatus = 'SUCCESS';
      } else if (processedWebhook.pending) {
        newStatus = 'PENDING';
      }

      // Update payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paymobTransactionId: processedWebhook.transactionId?.toString(),
          webhookReceived: true,
          webhookProcessedAt: new Date(),
          completedAt: newStatus === 'SUCCESS' ? new Date() : null
        }
      });

      // If payment successful, apply subscription upgrade and increment coupon usage
      if (newStatus === 'SUCCESS' && !payment.subscriptionUpgraded) {
        await prisma.$transaction(async (tx) => {
          // Apply subscription upgrade
          await applySubscriptionUpgrade(tx, payment);
          
          // Increment coupon usage (only on successful payment)
          if (payment.couponCode) {
            await tx.coupon.update({
              where: { code: payment.couponCode },
              data: { usesCount: { increment: 1 } }
            });
          }

          // Mark as upgraded
          await tx.payment.update({
            where: { id: payment.id },
            data: { subscriptionUpgraded: true }
          });
        });

        console.log(`Subscription upgraded for user ${payment.userId}, payment ${payment.id}`);
      }

      // Log successful webhook processing (no sensitive data)
      console.log(`Webhook processed: Payment ${payment.id}, Status: ${newStatus}, User: ${payment.userId}`);

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });

    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }
);

// GET /api/payments/history - Get payment history (secure)
router.get('/history', auth, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          amount: true,
          originalAmount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          planType: true,
          planId: true,
          appliedDiscounts: true,
          createdAt: true,
          completedAt: true
        }
      }),
      prisma.payment.count({ where })
    ]);

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      transactionId: payment.id, // For compatibility
      amount: payment.amount,
      originalAmount: payment.originalAmount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      planName: getPlanDisplayName(payment.planId, false),
      planNameAr: getPlanDisplayName(payment.planId, true),
      planType: payment.planType,
      date: payment.createdAt.toISOString(),
      completedDate: payment.completedAt?.toISOString(),
      appliedDiscounts: payment.appliedDiscounts,
      receipt: payment.status === 'SUCCESS' ? `/api/payments/receipt/${payment.id}` : null
    }));

    res.json({
      payments: formattedPayments,
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

// GET /api/payments/receipt/:paymentId - Download receipt (secure)
router.get('/receipt/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: req.user.id,
        status: 'SUCCESS'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Generate receipt content
    const receipt = generateSecureReceipt(payment);
    
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

/**
 * HELPER FUNCTIONS
 */

// Apply subscription upgrade after successful payment
async function applySubscriptionUpgrade(tx, payment) {
  const { userId, planType, planId, amount } = payment;
  
  if (planType === 'PROVIDER') {
    await tx.providerSubscription.upsert({
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
    const periodMonths = getUserPlanPeriod(planId, amount);
    
    await tx.userSubscription.upsert({
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
  const periodMap = {
    'MEDICAL_CARD': {
      60: 3,
      90: 6,
      120: 12
    },
    'ALL_INCLUSIVE': {
      150: 3,
      220: 6,
      300: 12
    }
  };
  
  return periodMap[planId]?.[amount] || 12;
}

// Get plan display name
function getPlanDisplayName(planId, isArabic = false) {
  const names = {
    // Provider plans
    'BASIC_FREE': { en: 'Basic (Free)', ar: 'الأساسي (مجاني)' },
    'BOOKING_BASIC': { en: 'Booking Package', ar: 'باقة الحجز' },
    'PRODUCTS_PREMIUM': { en: 'Products Package', ar: 'باقة المنتجات' },
    'TOP_BRONZE': { en: 'Top 10 Bronze', ar: 'المركز 10 البرونزي' },
    'TOP_SILVER': { en: 'Top 5 Silver', ar: 'المركز 5 الفضي' },
    'TOP_GOLD': { en: 'Top 3 Gold', ar: 'المركز 3 الذهبي' },
    // User plans
    'FREE': { en: 'Free', ar: 'مجاني' },
    'MEDICAL_CARD': { en: 'Medical Directory Card', ar: 'بطاقة الدليل الطبي' },
    'ALL_INCLUSIVE': { en: 'All-Inclusive Card', ar: 'البطاقة الشاملة' }
  };
  
  return names[planId]?.[isArabic ? 'ar' : 'en'] || planId;
}

// Generate secure receipt
function generateSecureReceipt(payment) {
  const date = new Date(payment.completedAt || payment.createdAt);
  
  return `
=== DALEEL BALADY RECEIPT ===

Payment ID: ${payment.id}
Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
Customer: ${payment.user.name}
Email: ${payment.user.email}

--- PLAN DETAILS ---
Plan: ${getPlanDisplayName(payment.planId)}
Type: ${payment.planType}
Period: ${getUserPlanPeriod(payment.planId, payment.amount)} months

--- PAYMENT DETAILS ---
Original Amount: ${payment.originalAmount} ${payment.currency}
Discount Applied: ${payment.originalAmount - payment.amount} ${payment.currency}
Final Amount: ${payment.amount} ${payment.currency}
Payment Method: ${payment.paymentMethod}
Status: ${payment.status}

--- SECURITY ---
Payment processed securely via Paymob
Transaction verified and encrypted

Thank you for choosing Daleel Balady!

For support: support@daleelbalady.com
=================================
  `.trim();
}

/**
 * Payment Methods APIs
 */

// GET /api/payments/methods - Get saved payment methods
router.get('/methods', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if savedPaymentMethod model exists in Prisma client
    if (!prisma.savedPaymentMethod) {
      console.warn('SavedPaymentMethod model not found in Prisma client. Please run: npx prisma generate');
      return res.json([]);
    }
    
    const paymentMethods = await prisma.savedPaymentMethod.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { lastUsedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        type: true,
        cardLast4: true,
        cardBrand: true,
        cardHolderName: true,
        expiryMonth: true,
        expiryYear: true,
        walletProvider: true,
        walletNumber: true,
        bankName: true,
        accountLast4: true,
        isDefault: true,
        lastUsedAt: true,
        createdAt: true
      }
    });
    
    // Transform to match frontend interface
    const formattedMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      last4: method.cardLast4 || method.walletNumber || method.accountLast4,
      brand: method.cardBrand,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      holderName: method.cardHolderName,
      walletProvider: method.walletProvider,
      isDefault: method.isDefault
    }));
    
    res.json(formattedMethods);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    });
  }
});

// POST /api/payments/methods - Add new payment method
router.post('/methods', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, cardData, walletProvider, walletNumber, bankName, accountLast4, isDefault } = req.body;

    if (!type || !['CARD', 'WALLET', 'BANK_TRANSFER'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method type'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.savedPaymentMethod.updateMany({
        where: {
          userId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Create payment method
    const paymentMethod = await prisma.savedPaymentMethod.create({
      data: {
        userId,
        type,
        cardLast4: type === 'CARD' ? cardData?.number?.slice(-4) : null,
        cardBrand: type === 'CARD' ? getCardBrandFromNumber(cardData?.number) : null,
        cardHolderName: cardData?.holderName || null,
        expiryMonth: type === 'CARD' ? parseInt(cardData?.expiry?.split('/')[0]) : null,
        expiryYear: type === 'CARD' ? parseInt(cardData?.expiry?.split('/')[1]) : null,
        walletProvider: type === 'WALLET' ? walletProvider : null,
        walletNumber: type === 'WALLET' ? walletNumber : null,
        bankName: type === 'BANK_TRANSFER' ? bankName : null,
        accountLast4: type === 'BANK_TRANSFER' ? accountLast4 : null,
        isDefault: isDefault || false,
        isActive: true
      }
    });

    res.json({
      id: paymentMethod.id,
      type: paymentMethod.type,
      last4: paymentMethod.cardLast4 || paymentMethod.walletNumber || paymentMethod.accountLast4,
      brand: paymentMethod.cardBrand,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      holderName: paymentMethod.cardHolderName,
      walletProvider: paymentMethod.walletProvider,
      isDefault: paymentMethod.isDefault
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add payment method'
    });
  }
});

// PATCH /api/payments/methods/:id - Update payment method
router.patch('/methods/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { isDefault, holderName } = req.body;

    // Verify ownership
    const existingMethod = await prisma.savedPaymentMethod.findFirst({
      where: { id, userId }
    });

    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.savedPaymentMethod.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: id }
        },
        data: {
          isDefault: false
        }
      });
    }

    // Update the method
    const updatedMethod = await prisma.savedPaymentMethod.update({
      where: { id },
      data: {
        isDefault: isDefault !== undefined ? isDefault : existingMethod.isDefault,
        cardHolderName: holderName || existingMethod.cardHolderName
      }
    });

    res.json({
      id: updatedMethod.id,
      type: updatedMethod.type,
      last4: updatedMethod.cardLast4 || updatedMethod.walletNumber || updatedMethod.accountLast4,
      brand: updatedMethod.cardBrand,
      expiryMonth: updatedMethod.expiryMonth,
      expiryYear: updatedMethod.expiryYear,
      holderName: updatedMethod.cardHolderName,
      walletProvider: updatedMethod.walletProvider,
      isDefault: updatedMethod.isDefault
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    });
  }
});

// DELETE /api/payments/methods/:id - Delete payment method
router.delete('/methods/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify ownership
    const existingMethod = await prisma.savedPaymentMethod.findFirst({
      where: { id, userId }
    });

    if (!existingMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    // Soft delete by setting isActive to false
    await prisma.savedPaymentMethod.update({
      where: { id },
      data: {
        isActive: false,
        isDefault: false
      }
    });

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
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
