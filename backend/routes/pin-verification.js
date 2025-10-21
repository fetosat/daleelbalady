const express = require('express');
const PinVerificationService = require('../services/pinVerificationService');
const router = express.Router();

/**
 * التحقق من PIN وتطبيق الخصم
 * هذا endpoint سيتم استخدامه من قبل مقدمي الخدمات
 */
router.post('/verify', async (req, res) => {
  try {
    const providerId = req.user.id; // معرف مقدم الخدمة
    const {
      pin,
      serviceId,
      productId,
      shopId,
      originalAmount,
      offerId,
      customerName,
      receiptNumber,
      verificationLocation
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!pin) {
      return res.status(400).json({ error: 'رقم PIN مطلوب' });
    }

    if (!originalAmount || originalAmount <= 0) {
      return res.status(400).json({ error: 'مبلغ الخدمة مطلوب' });
    }

    if (!serviceId && !productId) {
      return res.status(400).json({ 
        error: 'معرف الخدمة أو المنتج مطلوب' 
      });
    }

    // التحقق من صلاحية المستخدم كمقدم خدمة
    if (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'غير مصرح لك بالتحقق من أرقام PIN' 
      });
    }

    const transactionData = {
      serviceId,
      productId,
      shopId,
      originalAmount: parseFloat(originalAmount),
      offerId,
      customerName,
      receiptNumber,
      verificationLocation
    };

    const result = await PinVerificationService.verifyPinAndApplyDiscount(
      pin, 
      providerId, 
      transactionData
    );

    res.json(result);
  } catch (error) {
    console.error('خطأ في التحقق من PIN:', error);
    res.status(400).json({ 
      error: error.message,
      success: false 
    });
  }
});

/**
 * البحث عن تحقق بكود التحقق
 */
router.get('/verification/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const verification = await PinVerificationService.getVerificationByCode(code);

    if (!verification) {
      return res.status(404).json({ 
        error: 'لم يتم العثور على كود التحقق' 
      });
    }

    // إخفاء المعلومات الحساسة
    const safeVerification = {
      id: verification.id,
      verificationCode: verification.verificationCode,
      originalAmount: verification.originalAmount,
      discountAmount: verification.discountAmount,
      finalAmount: verification.finalAmount,
      discountPercent: verification.discountPercent,
      currency: verification.currency,
      verificationLocation: verification.verificationLocation,
      customerName: verification.customerName,
      receiptNumber: verification.receiptNumber,
      verifiedAt: verification.verifiedAt,
      status: verification.status,
      monthYear: verification.monthYear,
      planOwner: verification.plan?.user ? {
        name: verification.plan.user.name,
        email: verification.plan.user.email
      } : null,
      service: verification.service ? {
        name: verification.service.embeddingText
      } : null,
      product: verification.product,
      shop: verification.shop,
      offer: verification.offer
    };

    res.json(safeVerification);
  } catch (error) {
    console.error('خطأ في البحث عن التحقق:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * تاريخ استخدام PIN للمستخدم
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const history = await PinVerificationService.getPinUsageHistory(userId, limit);

    // إخفاء رقم PIN من التاريخ
    const safeHistory = history.map(record => ({
      ...record,
      pinUsed: '****-****', // إخفاء رقم PIN
      verifiedBy: undefined, // إخفاء معرف مقدم الخدمة
    }));

    res.json(safeHistory);
  } catch (error) {
    console.error('خطأ في الحصول على تاريخ PIN:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * إحصائيات استخدام PIN للمستخدم
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await PinVerificationService.getPinUsageHistory(userId, 100);

    // حساب الإحصائيات
    const thisMonth = new Date();
    const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    
    const thisMonthUsages = history.filter(record => 
      new Date(record.verifiedAt) >= monthStart
    );

    const totalSavingsThisMonth = thisMonthUsages.reduce(
      (sum, record) => sum + record.discountAmount, 0
    );

    const totalUsages = history.length;
    const thisMonthUsagesCount = thisMonthUsages.length;

    const topOffers = {};
    history.forEach(record => {
      if (record.offer) {
        const offerTitle = record.offer.title;
        topOffers[offerTitle] = (topOffers[offerTitle] || 0) + 1;
      }
    });

    const sortedOffers = Object.entries(topOffers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const stats = {
      totalUsages,
      thisMonthUsages: thisMonthUsagesCount,
      totalSavingsThisMonth: Math.round(totalSavingsThisMonth * 100) / 100,
      averageDiscount: totalUsages > 0 
        ? Math.round((history.reduce((sum, r) => sum + r.discountPercent, 0) / totalUsages) * 100) / 100 
        : 0,
      topUsedOffers: sortedOffers.map(([title, count]) => ({ title, count })),
      lastUsed: history[0]?.verifiedAt || null
    };

    res.json(stats);
  } catch (error) {
    console.error('خطأ في إحصائيات PIN:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * التحقق من صحة رقم PIN بدون تطبيق خصم (للمعاينة فقط)
 */
router.post('/validate', async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: 'رقم PIN مطلوب' });
    }

    // التحقق من صحة تنسيق PIN
    const PinService = require('../services/pinService');
    
    if (!PinService.validatePinFormat(pin)) {
      return res.status(400).json({ 
        error: 'تنسيق رقم PIN غير صحيح. يجب أن يكون بصيغة XXXX-XXXX' 
      });
    }

    // البحث عن الخطة
    const { PrismaClient } = require('../generated/prisma');
    const prisma = new PrismaClient();

    const formattedPin = PinService.formatPin(pin);
    const plan = await prisma.userGuidePlan.findFirst({
      where: {
        currentMonthPin: formattedPin,
        isActive: true,
        planType: { not: 'FREE' }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'رقم PIN غير صحيح أو منتهي الصلاحية' 
      });
    }

    // التحقق من انتهاء صلاحية PIN
    if (PinService.isPinExpired(plan.pinGeneratedAt)) {
      return res.status(400).json({ 
        success: false,
        error: 'انتهت صلاحية رقم PIN هذا الشهر' 
      });
    }

    res.json({
      success: true,
      message: 'رقم PIN صحيح',
      planOwner: {
        name: plan.user.name,
        email: plan.user.email
      },
      planType: plan.planType,
      pinUsageCount: plan.pinUsageCount,
      includesDiscounts: plan.includesDiscounts
    });
  } catch (error) {
    console.error('خطأ في التحقق من صحة PIN:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * قائمة التحققات الأخيرة للمقدم (للمقدمين)
 */
router.get('/provider-history', async (req, res) => {
  try {
    const providerId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'غير مصرح لك بهذا الإجراء' });
    }

    const { PrismaClient } = require('../generated/prisma');
    const prisma = new PrismaClient();

    const verifications = await prisma.pinVerification.findMany({
      where: { verifiedBy: providerId },
      orderBy: { verifiedAt: 'desc' },
      take: limit,
      include: {
        plan: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        service: {
          select: { id: true, embeddingText: true }
        },
        product: {
          select: { id: true, name: true }
        },
        offer: {
          select: { id: true, title: true }
        }
      }
    });

    // إخفاء رقم PIN من السجلات
    const safeVerifications = verifications.map(record => ({
      ...record,
      pinUsed: '****-****',
      plan: {
        ...record.plan,
        currentMonthPin: undefined // إخفاء PIN الحقيقي
      }
    }));

    res.json(safeVerifications);
  } catch (error) {
    console.error('خطأ في تاريخ المقدم:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
