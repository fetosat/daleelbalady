// Extended Payment routes - Additional endpoints for the payment system
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import PaymobService from '../services/paymob.js';
import { auth } from '../middleware/auth.js';
import { authWithSubscription, requireProviderAccess } from '../middleware/payment.js';

const router = express.Router();
const prisma = new PrismaClient();
const paymobService = new PaymobService();

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
      brand: type === 'CARD' ? getCardBrand(cardData?.number) : null,
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

// PATCH /api/payments/methods/:methodId - Update payment method
router.patch('/methods/:methodId', auth, authWithSubscription, async (req, res) => {
  try {
    const { methodId } = req.params;
    const { isDefault, holderName } = req.body;

    // Simulate updating payment method
    const updatedMethod = {
      id: methodId,
      isDefault: isDefault !== undefined ? isDefault : false,
      holderName: holderName || 'Customer'
    };

    res.json(updatedMethod);
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    });
  }
});

// DELETE /api/payments/methods/:methodId - Delete payment method
router.delete('/methods/:methodId', auth, authWithSubscription, async (req, res) => {
  try {
    const { methodId } = req.params;

    res.json({
      success: true,
      message: 'Payment method removed successfully'
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    });
  }
});

/**
 * Coupon & Discount APIs
 */

// POST /api/coupons/validate - Validate coupon code
router.post('/coupons/validate', auth, async (req, res) => {
  try {
    const { code, planId, planType } = req.body;

    if (!code || !planId || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Code, planId, and planType are required'
      });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code,
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid coupon code'
      });
    }

    if (coupon.usesCount >= (coupon.maxUses || Infinity)) {
      return res.status(400).json({
        valid: false,
        message: 'Coupon usage limit reached'
      });
    }

    res.json({
      valid: true,
      discountPercent: coupon.discountPercent || 0,
      discountAmount: coupon.discountAmount || 0,
      description: coupon.description || 'Discount applied',
      descriptionAr: coupon.title || 'تم تطبيق الخصم',
      expiresAt: coupon.expiresAt?.toISOString(),
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses,
      usesCount: coupon.usesCount
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      valid: false,
      message: 'Failed to validate coupon'
    });
  }
});

// POST /api/coupons/apply - Apply coupon to order
router.post('/coupons/apply', auth, async (req, res) => {
  try {
    const { code, amount, planId } = req.body;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code,
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = (amount * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    }

    const finalAmount = Math.max(0, amount - discountAmount);

    res.json({
      success: true,
      originalAmount: amount,
      discountAmount,
      finalAmount,
      coupon: {
        code: coupon.code,
        description: coupon.description
      }
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply coupon'
    });
  }
});

/**
 * Analytics & Reporting APIs
 */

// GET /api/payments/analytics - Get payment analytics for providers
router.get('/analytics', auth, requireProviderAccess, async (req, res) => {
  try {
    const { dateRange } = req.query;
    
    // Mock analytics data - in production, query actual payment records
    const analytics = {
      totalRevenue: 0,
      totalTransactions: 0,
      successRate: 100,
      averageTransactionValue: 0,
      recentTransactions: [],
      monthlyRevenue: {},
      paymentMethodDistribution: {
        card: 0,
        mobile_wallet: 0,
        bank_transfer: 0
      }
    };

    res.json(analytics);

  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment analytics'
    });
  }
});

// GET /api/payments/earnings - Get earnings summary for providers
router.get('/earnings', auth, requireProviderAccess, async (req, res) => {
  try {
    const { period } = req.query;
    
    const earnings = {
      totalEarnings: 0,
      pendingEarnings: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0,
      transactions: []
    };

    res.json(earnings);

  } catch (error) {
    console.error('Get earnings summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get earnings summary'
    });
  }
});

/**
 * Refund APIs
 */

// POST /api/payments/:paymentId/refund - Request refund
router.post('/:paymentId/refund', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required'
      });
    }

    // Find the transaction (in memory storage for now)
    const transaction = paymentTransactions.get(paymentId);
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Only successful transactions can be refunded'
      });
    }

    const refundAmount = amount || transaction.amount;

    // Process refund through Paymob
    const refundResult = await paymobService.refundTransaction(
      transaction.paymobOrderId, 
      refundAmount
    );

    if (refundResult.success) {
      res.json({
        success: true,
        refundId: refundResult.refundId,
        amount: refundAmount,
        status: 'PROCESSING',
        message: 'Refund request submitted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: refundResult.message || 'Refund request failed'
      });
    }

  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request refund'
    });
  }
});

// GET /api/refunds/:refundId - Get refund status
router.get('/refunds/:refundId', auth, async (req, res) => {
  try {
    const { refundId } = req.params;

    // Mock refund status - in production, query actual refund records
    res.json({
      refundId,
      status: 'COMPLETED',
      amount: 0,
      currency: 'EGP',
      reason: 'Customer request',
      processedAt: new Date().toISOString(),
      estimatedArrival: 'Within 3-5 business days'
    });

  } catch (error) {
    console.error('Get refund status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get refund status'
    });
  }
});

/**
 * Invoice & Receipt APIs
 */

// POST /api/subscriptions/:subscriptionId/invoice - Generate invoice for subscription
router.post('/subscriptions/:subscriptionId/invoice', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const invoice = {
      id: `inv_${Date.now()}`,
      subscriptionId,
      amount: 0,
      currency: 'EGP',
      status: 'PAID',
      dueDate: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      downloadUrl: `/api/invoices/inv_${Date.now()}/download`
    };

    res.json(invoice);

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

// GET /api/invoices/:invoiceId/download - Download invoice
router.get('/invoices/:invoiceId/download', auth, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Generate simple invoice content
    const invoiceContent = generateInvoiceContent(invoiceId, req.user);

    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="invoice_${invoiceId}.txt"`
    });

    res.send(invoiceContent);

  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download invoice'
    });
  }
});

/**
 * Helper Functions
 */

// Get card brand from number
function getCardBrand(cardNumber) {
  if (!cardNumber) return 'Unknown';
  
  const num = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(num)) return 'Visa';
  if (/^5[1-5]/.test(num)) return 'MasterCard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^6/.test(num)) return 'Discover';
  
  return 'Unknown';
}

// Generate invoice content
function generateInvoiceContent(invoiceId, user) {
  return `
DALEEL BALADY - INVOICE
======================

Invoice ID: ${invoiceId}
Date: ${new Date().toISOString()}

Bill To:
${user.name}
${user.email}

Subscription Details:
Plan: [Plan Name]
Period: [Period]
Amount: [Amount] EGP

Thank you for your business!
  `.trim();
}

export default router;
