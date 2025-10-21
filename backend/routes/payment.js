import express from 'express';
import { advancedAuth } from '../middleware/advanced-auth.js';
import { validateAPIKeyFormat, generateDeviceFingerprint, logUserLogin } from '../middleware/digital-signature.js';
import { 
  createPaymentIntent, 
  verifyPaymentStatus, 
  refundPayment, 
  generatePaymentReport 
} from '../services/payment-system.js';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '../lib/db.js';

const router = express.Router();

/**
 * Payment Validation Schemas
 */
const createPaymentSchema = z.object({
  amount: z.number().positive('يجب أن يكون المبلغ أكبر من صفر'),
  currency: z.string().regex(/^(EGP|USD|EUR)$/, 'عملة غير مدعومة'),
  serviceId: z.string().uuid('معرف الخدمة غير صالح'),
  provider: z.enum(['PAYMOB', 'FAWRY', 'STRIPE', 'PAYPAL'], {
    errorMap: () => ({ message: 'مقدم الخدمة غير مدعوم' })
  }),
  metadata: z.object({}).optional()
});

const refundSchema = z.object({
  paymentRef: z.string().min(1, 'رقم المرجع مطلوب'),
  amount: z.number().positive().optional(),
  reason: z.string().max(500, 'السبب يجب أن يكون أقل من 500 حرف').optional()
});

/**
 * Rate Limiting Configuration
 */
const paymentAttempts = new Map();
const PAYMENT_RATE_LIMIT = 5; // 5 attempts per hour
const PAYMENT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Payment Rate Limiting Middleware
 */
const paymentRateLimit = (req, res, next) => {
  const userId = req.user?.id;
  const ip = req.ip;
  const key = userId || ip;
  
  const now = Date.now();
  const userAttempts = paymentAttempts.get(key) || [];
  
  // Clean old attempts
  const recentAttempts = userAttempts.filter(time => now - time < PAYMENT_WINDOW);
  
  if (recentAttempts.length >= PAYMENT_RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز الحد المسموح لطلبات الدفع. حاول مرة أخرى لاحقاً',
      retryAfter: Math.ceil(PAYMENT_WINDOW / 1000 / 60) // minutes
    });
  }
  
  recentAttempts.push(now);
  paymentAttempts.set(key, recentAttempts);
  
  next();
};

/**
 * Webhook Signature Verification
 */
const verifyWebhookSignature = (provider) => {
  return (req, res, next) => {
    const signature = req.headers['x-signature'] || req.headers['stripe-signature'];
    const payload = JSON.stringify(req.body);
    
    let expectedSignature;
    
    switch (provider) {
      case 'STRIPE':
        const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
        expectedSignature = crypto
          .createHmac('sha256', stripeSecret)
          .update(payload)
          .digest('hex');
        break;
        
      case 'PAYMOB':
        const paymobSecret = process.env.PAYMOB_HMAC_SECRET;
        expectedSignature = crypto
          .createHmac('sha512', paymobSecret)
          .update(payload)
          .digest('hex');
        break;
        
      default:
        return next();
    }
    
    if (!signature || !expectedSignature || signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_SIGNATURE',
        message: 'Webhook signature verification failed'
      });
    }
    
    next();
  };
};

/**
 * POST /api/payment/create-intent
 * إنشاء طلب دفع جديد
 */
router.post('/create-intent', advancedAuth, paymentRateLimit, async (req, res) => {
  try {
    // Validate request data
    const validatedData = createPaymentSchema.parse(req.body);
    
    // Check service exists and belongs to user or is public
    const service = await prisma.medicalService.findUnique({
      where: { id: validatedData.serviceId },
      include: { provider: true }
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'SERVICE_NOT_FOUND',
        message: 'الخدمة المطلوبة غير موجودة'
      });
    }
    
    // Check if service is already paid
    const existingPayment = await prisma.payment.findFirst({
      where: {
        serviceId: validatedData.serviceId,
        userId: req.user.id,
        status: 'COMPLETED'
      }
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_PAID',
        message: 'تم دفع ثمن هذه الخدمة مسبقاً'
      });
    }
    
    // Generate device fingerprint for security
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    // Add security metadata
    const paymentMetadata = {
      ...validatedData.metadata,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      deviceFingerprint,
      timestamp: new Date().toISOString()
    };
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      ...validatedData,
      userId: req.user.id,
      metadata: paymentMetadata
    });
    
    // Log payment attempt
    await logUserLogin(req.user.id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      deviceFingerprint,
      location: null
    }, true, []);
    
    res.status(201).json({
      success: true,
      data: paymentIntent
    });
    
  } catch (error) {
    console.error('Payment creation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'بيانات غير صالحة',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'PAYMENT_CREATION_FAILED',
      message: error.message || 'فشل في إنشاء طلب الدفع'
    });
  }
});

/**
 * GET /api/payment/verify/:paymentRef
 * التحقق من حالة الدفع
 */
router.get('/verify/:paymentRef', advancedAuth, async (req, res) => {
  try {
    const { paymentRef } = req.params;
    
    // Validate payment ref format
    if (!paymentRef || !paymentRef.startsWith('PAY-')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYMENT_REF',
        message: 'رقم المرجع غير صالح'
      });
    }
    
    // Get payment info
    const payment = await prisma.payment.findUnique({
      where: { paymentRef },
      include: { user: true }
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'PAYMENT_NOT_FOUND',
        message: 'عملية الدفع غير موجودة'
      });
    }
    
    // Check ownership
    if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'غير مخول بالوصول لهذه المعاملة'
      });
    }
    
    // Verify with provider if not already completed
    let verificationResult = {
      status: payment.status,
      paidAt: payment.paidAt
    };
    
    if (payment.status !== 'COMPLETED' && payment.status !== 'FAILED') {
      try {
        verificationResult = await verifyPaymentStatus(paymentRef, payment.provider);
      } catch (error) {
        console.error('Payment verification error:', error);
        // Continue with database status if verification fails
      }
    }
    
    res.json({
      success: true,
      data: {
        paymentRef: payment.paymentRef,
        amount: payment.amount,
        currency: payment.currency,
        status: verificationResult.status,
        provider: payment.provider,
        createdAt: payment.createdAt,
        paidAt: verificationResult.paidAt,
        expiresAt: payment.expiresAt
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'VERIFICATION_FAILED',
      message: 'فشل في التحقق من حالة الدفع'
    });
  }
});

/**
 * POST /api/payment/refund
 * طلب استرداد الأموال
 */
router.post('/refund', advancedAuth, async (req, res) => {
  try {
    const validatedData = refundSchema.parse(req.body);
    const { paymentRef, amount, reason } = validatedData;
    
    // Get payment info
    const payment = await prisma.payment.findUnique({
      where: { paymentRef },
      include: { user: true }
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'PAYMENT_NOT_FOUND',
        message: 'عملية الدفع غير موجودة'
      });
    }
    
    // Check ownership or admin privileges
    if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'غير مخول بطلب الاسترداد'
      });
    }
    
    // Check if payment is eligible for refund
    const timeSincePayment = Date.now() - new Date(payment.paidAt || payment.createdAt).getTime();
    const refundWindow = 24 * 60 * 60 * 1000; // 24 hours
    
    if (timeSincePayment > refundWindow && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'REFUND_WINDOW_EXPIRED',
        message: 'انتهت فترة الاسترداد المسموحة (24 ساعة)'
      });
    }
    
    // Process refund
    const refundResult = await refundPayment(paymentRef, amount, reason);
    
    res.json({
      success: true,
      message: 'تم تقديم طلب الاسترداد بنجاح',
      data: refundResult
    });
    
  } catch (error) {
    console.error('Refund error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'بيانات غير صالحة',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'REFUND_FAILED',
      message: error.message || 'فشل في معالجة طلب الاسترداد'
    });
  }
});

/**
 * GET /api/payment/history
 * سجل المعاملات المالية للمستخدم
 */
router.get('/history', advancedAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, provider } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {
      userId: req.user.id
    };
    
    if (status) whereClause.status = status;
    if (provider) whereClause.provider = provider;
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          service: { select: { title: true, provider: { select: { name: true } } } },
          refunds: { select: { amount: true, status: true, createdAt: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.payment.count({ where: whereClause })
    ]);
    
    res.json({
      success: true,
      data: {
        payments: payments.map(p => ({
          paymentRef: p.paymentRef,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          provider: p.provider,
          service: p.service ? {
            title: p.service.title,
            provider: p.service.provider?.name
          } : null,
          createdAt: p.createdAt,
          paidAt: p.paidAt,
          refunded: p.refunds.reduce((sum, r) => sum + (r.status === 'COMPLETED' ? r.amount : 0), 0)
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total
        }
      }
    });
    
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FAILED',
      message: 'فشل في جلب سجل المعاملات'
    });
  }
});

/**
 * POST /api/payment/webhook/stripe
 * Stripe Webhook Handler
 */
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), verifyWebhookSignature('STRIPE'), async (req, res) => {
  try {
    const event = req.body;
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailure(event.data.object);
        break;
        
      case 'charge.dispute.created':
        await handleStripeDispute(event.data.object);
        break;
        
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

/**
 * POST /api/payment/webhook/paymob
 * PayMob Webhook Handler
 */
router.post('/webhook/paymob', verifyWebhookSignature('PAYMOB'), async (req, res) => {
  try {
    const { type, obj } = req.body;
    
    switch (type) {
      case 'TRANSACTION':
        if (obj.success === true) {
          await handlePayMobPaymentSuccess(obj);
        } else {
          await handlePayMobPaymentFailure(obj);
        }
        break;
        
      default:
        console.log(`Unhandled PayMob event type: ${type}`);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('PayMob webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

/**
 * GET /api/payment/report
 * تقرير المعاملات المالية (للإدارة)
 */
router.get('/report', advancedAuth, async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'ADMIN' && req.user.role !== 'FINANCIAL_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'غير مخول بالوصول لهذا التقرير'
      });
    }
    
    const { startDate, endDate, provider, status, userId } = req.query;
    
    const report = await generatePaymentReport({
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
      endDate: endDate ? new Date(endDate) : new Date(),
      provider,
      status,
      userId
    });
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    console.error('Payment report error:', error);
    res.status(500).json({
      success: false,
      error: 'REPORT_FAILED',
      message: 'فشل في إنشاء التقرير'
    });
  }
});

/**
 * Helper Functions for Webhook Processing
 */
const handleStripePaymentSuccess = async (paymentIntent) => {
  const paymentRef = paymentIntent.metadata.paymentRef;
  
  await prisma.payment.update({
    where: { paymentRef },
    data: {
      status: 'COMPLETED',
      paidAt: new Date(),
      providerTransactionId: paymentIntent.id
    }
  });
};

const handleStripePaymentFailure = async (paymentIntent) => {
  const paymentRef = paymentIntent.metadata.paymentRef;
  
  await prisma.payment.update({
    where: { paymentRef },
    data: {
      status: 'FAILED',
      errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed'
    }
  });
};

const handleStripeDispute = async (charge) => {
  // Handle dispute/chargeback
  console.log('Stripe dispute created:', charge.id);
  
  // Create dispute record in database
  await prisma.dispute.create({
    data: {
      providerDisputeId: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      reason: charge.dispute_reason,
      status: 'OPEN',
      provider: 'STRIPE'
    }
  });
};

const handlePayMobPaymentSuccess = async (transaction) => {
  // PayMob specific success handling
  const orderId = transaction.order.id;
  
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: orderId.toString() }
  });
  
  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        providerTransactionId: transaction.id.toString()
      }
    });
  }
};

const handlePayMobPaymentFailure = async (transaction) => {
  // PayMob specific failure handling
  const orderId = transaction.order.id;
  
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: orderId.toString() }
  });
  
  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        errorMessage: 'Payment failed via PayMob'
      }
    });
  }
};

export default router;
