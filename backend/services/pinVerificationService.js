const { PrismaClient } = require('../generated/prisma');
const PinService = require('./pinService');

const prisma = new PrismaClient();

/**
 * خدمة التحقق من PIN واستخدام العروض
 */
class PinVerificationService {
  
  /**
   * التحقق من PIN وتطبيق الخصم
   * @param {string} pin - رقم PIN المدخل
   * @param {string} providerId - معرف مقدم الخدمة
   * @param {Object} transactionData - بيانات المعاملة
   * @returns {Promise<Object>} تفاصيل التحقق والخصم
   */
  static async verifyPinAndApplyDiscount(pin, providerId, transactionData) {
    const {
      serviceId,
      productId,
      shopId,
      originalAmount,
      offerId,
      customerName,
      receiptNumber,
      verificationLocation
    } = transactionData;

    try {
      // تنسيق PIN
      const formattedPin = PinService.formatPin(pin);
      const currentMonthYear = PinService.getCurrentMonthYear();

      // البحث عن الخطة التي لها هذا PIN
      const plan = await prisma.userGuidePlan.findFirst({
        where: {
          currentMonthPin: formattedPin,
          isActive: true,
          planType: { not: 'FREE' }
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          selectedCategory: true,
          familyMembers: {
            where: { inviteStatus: 'ACCEPTED' },
            include: {
              invitedUser: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!plan) {
        throw new Error('رقم PIN غير صحيح أو منتهي الصلاحية');
      }

      // التحقق من انتهاء صلاحية PIN
      if (PinService.isPinExpired(plan.pinGeneratedAt)) {
        throw new Error('انتهت صلاحية رقم PIN هذا الشهر');
      }

      // التحقق من صلاحية استخدام الخصومات
      if (!plan.includesDiscounts) {
        throw new Error('هذه الخطة لا تشمل الخصومات');
      }

      let offer = null;
      let discount = { type: 'DEFAULT', percent: 10, amount: 0 }; // خصم افتراضي 10%

      // إذا كان هناك عرض محدد، التحقق منه
      if (offerId) {
        offer = await this.validateOffer(offerId, serviceId, productId, plan);
        discount = {
          type: 'OFFER',
          percent: offer.discountType === 'PERCENTAGE' ? offer.discountValue : 0,
          amount: offer.discountType === 'FIXED_AMOUNT' ? offer.discountValue : 0
        };
      }

      // حساب الخصم
      const discountCalculation = this.calculateDiscount(originalAmount, discount);
      
      // إنشاء كود التحقق الفريد
      const verificationCode = PinService.generateVerificationCode();

      // تسجيل التحقق من PIN
      const verification = await prisma.pinVerification.create({
        data: {
          planId: plan.id,
          userId: plan.userId, // المالك الأساسي للخطة
          pinUsed: formattedPin,
          verifiedBy: providerId,
          verificationCode,
          monthYear: currentMonthYear,
          originalAmount,
          discountAmount: discountCalculation.discountAmount,
          finalAmount: discountCalculation.finalAmount,
          discountPercent: discountCalculation.discountPercent,
          currency: 'EGP',
          serviceId,
          productId,
          shopId,
          offerId: offer?.id || null,
          verificationLocation,
          customerName,
          receiptNumber,
          status: 'COMPLETED',
        }
      });

      // تحديث عداد استخدام PIN
      await prisma.userGuidePlan.update({
        where: { id: plan.id },
        data: {
          pinUsageCount: { increment: 1 }
        }
      });

      // تسجيل استخدام العرض إذا كان موجود
      if (offer) {
        await this.recordOfferUsage(offer.id, plan.userId, verification.id, discountCalculation);
      }

      return {
        success: true,
        verification: {
          code: verificationCode,
          planOwner: plan.user,
          planType: plan.planType,
          originalAmount,
          discountAmount: discountCalculation.discountAmount,
          finalAmount: discountCalculation.finalAmount,
          discountPercent: discountCalculation.discountPercent,
          offerUsed: offer?.title || 'خصم الخطة الافتراضي',
          verificationLocation,
          verifiedAt: new Date(),
        }
      };
    } catch (error) {
      console.error('خطأ في التحقق من PIN:', error);
      throw error;
    }
  }

  /**
   * التحقق من صحة العرض وإمكانية تطبيقه
   * @param {string} offerId - معرف العرض
   * @param {string} serviceId - معرف الخدمة
   * @param {string} productId - معرف المنتج
   * @param {Object} plan - بيانات خطة المستخدم
   * @returns {Promise<Object>} بيانات العرض
   */
  static async validateOffer(offerId, serviceId, productId, plan) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: {
        services: true,
        products: true,
        categories: true,
        offerUsages: {
          where: { userId: plan.userId }
        }
      }
    });

    if (!offer) {
      throw new Error('العرض غير موجود');
    }

    if (!offer.isActive) {
      throw new Error('هذا العرض غير نشط');
    }

    // التحقق من صلاحية العرض زمنياً
    const now = new Date();
    if (offer.validFrom && now < offer.validFrom) {
      throw new Error('لم يبدأ هذا العرض بعد');
    }

    if (offer.validUntil && now > offer.validUntil) {
      throw new Error('انتهت صلاحية هذا العرض');
    }

    // التحقق من متطلبات الخطة
    if (offer.requiresPlan && plan.planType === 'FREE') {
      throw new Error('هذا العرض يتطلب خطة مدفوعة');
    }

    // التحقق من القيود الخاصة بالمستوى الحصري
    if (offer.isExclusive && offer.level === 'EXCLUSIVE' && plan.planType !== 'ALL_CATEGORIES') {
      throw new Error('هذا العرض الحصري متاح فقط للخطة الشاملة');
    }

    // التحقق من تطبيق العرض على الخدمة/المنتج
    let isApplicable = false;

    if (offer.targetType === 'SERVICE' && serviceId) {
      isApplicable = offer.services.some(s => s.id === serviceId);
    } else if (offer.targetType === 'PRODUCT' && productId) {
      isApplicable = offer.products.some(p => p.id === productId);
    } else if (offer.targetType === 'BOTH') {
      isApplicable = 
        (serviceId && offer.services.some(s => s.id === serviceId)) ||
        (productId && offer.products.some(p => p.id === productId));
    }

    if (!isApplicable) {
      throw new Error('هذا العرض لا ينطبق على الخدمة أو المنتج المحدد');
    }

    // التحقق من حدود الاستخدام
    this.checkUsageLimits(offer, plan.userId);

    return offer;
  }

  /**
   * التحقق من حدود استخدام العرض
   * @param {Object} offer - بيانات العرض
   * @param {string} userId - معرف المستخدم
   */
  static checkUsageLimits(offer, userId) {
    const userUsages = offer.offerUsages;

    // التحقق من الحد الأقصى للاستخدام الشخصي
    if (offer.maxUsagePerUser && userUsages.length >= offer.maxUsagePerUser) {
      throw new Error(`تم الوصول للحد الأقصى لاستخدام هذا العرض (${offer.maxUsagePerUser} مرات)`);
    }

    // التحقق من الحدود الزمنية (يومي، شهري، سنوي)
    const now = new Date();
    
    if (offer.maxUsagePerDay) {
      const todayUsages = userUsages.filter(usage => {
        const usageDate = new Date(usage.usedAt);
        return usageDate.toDateString() === now.toDateString();
      });
      
      if (todayUsages.length >= offer.maxUsagePerDay) {
        throw new Error(`تم الوصول للحد الأقصى اليومي لهذا العرض (${offer.maxUsagePerDay} مرات)`);
      }
    }

    if (offer.maxUsagePerMonth) {
      const thisMonthUsages = userUsages.filter(usage => {
        const usageDate = new Date(usage.usedAt);
        return usageDate.getMonth() === now.getMonth() && 
               usageDate.getFullYear() === now.getFullYear();
      });
      
      if (thisMonthUsages.length >= offer.maxUsagePerMonth) {
        throw new Error(`تم الوصول للحد الأقصى الشهري لهذا العرض (${offer.maxUsagePerMonth} مرات)`);
      }
    }

    if (offer.maxUsagePerYear) {
      const thisYearUsages = userUsages.filter(usage => {
        const usageDate = new Date(usage.usedAt);
        return usageDate.getFullYear() === now.getFullYear();
      });
      
      if (thisYearUsages.length >= offer.maxUsagePerYear) {
        throw new Error(`تم الوصول للحد الأقصى السنوي لهذا العرض (${offer.maxUsagePerYear} مرات)`);
      }
    }
  }

  /**
   * حساب الخصم المطبق
   * @param {number} originalAmount - المبلغ الأصلي
   * @param {Object} discount - بيانات الخصم
   * @returns {Object} تفاصيل الخصم المحسوب
   */
  static calculateDiscount(originalAmount, discount) {
    let discountAmount = 0;
    let discountPercent = 0;

    if (discount.percent > 0) {
      discountPercent = Math.min(discount.percent, 100); // الحد الأقصى 100%
      discountAmount = (originalAmount * discountPercent) / 100;
    } else if (discount.amount > 0) {
      discountAmount = Math.min(discount.amount, originalAmount);
      discountPercent = (discountAmount / originalAmount) * 100;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      discountPercent: Math.round(discountPercent * 100) / 100,
    };
  }

  /**
   * تسجيل استخدام العرض
   * @param {string} offerId - معرف العرض
   * @param {string} userId - معرف المستخدم
   * @param {string} verificationId - معرف التحقق
   * @param {Object} discountCalculation - حسابات الخصم
   */
  static async recordOfferUsage(offerId, userId, verificationId, discountCalculation) {
    await prisma.offerUsage.create({
      data: {
        offerId,
        userId,
        pinVerificationId: verificationId,
        originalAmount: discountCalculation.finalAmount + discountCalculation.discountAmount,
        discountAmount: discountCalculation.discountAmount,
        finalAmount: discountCalculation.finalAmount,
      }
    });

    // تحديث عدد الاستخدامات الإجمالية للعرض
    await prisma.offer.update({
      where: { id: offerId },
      data: {
        currentUsage: { increment: 1 },
        conversionCount: { increment: 1 }
      }
    });
  }

  /**
   * الحصول على تاريخ استخدام PIN للمستخدم
   * @param {string} userId - معرف المستخدم
   * @param {number} limit - عدد السجلات
   * @returns {Promise<Array>} تاريخ الاستخدام
   */
  static async getPinUsageHistory(userId, limit = 20) {
    try {
      const history = await prisma.pinVerification.findMany({
        where: { userId },
        orderBy: { verifiedAt: 'desc' },
        take: limit,
        include: {
          service: {
            select: { id: true, embeddingText: true }
          },
          product: {
            select: { id: true, name: true }
          },
          shop: {
            select: { id: true, name: true }
          },
          offer: {
            select: { id: true, title: true, level: true }
          }
        }
      });

      return history;
    } catch (error) {
      console.error('خطأ في الحصول على تاريخ استخدام PIN:', error);
      throw error;
    }
  }

  /**
   * البحث عن تحقق بكود التحقق
   * @param {string} verificationCode - كود التحقق
   * @returns {Promise<Object|null>} تفاصيل التحقق
   */
  static async getVerificationByCode(verificationCode) {
    try {
      const verification = await prisma.pinVerification.findUnique({
        where: { verificationCode },
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
          shop: {
            select: { id: true, name: true }
          },
          offer: {
            select: { id: true, title: true, description: true }
          }
        }
      });

      return verification;
    } catch (error) {
      console.error('خطأ في البحث عن التحقق:', error);
      throw error;
    }
  }
}

module.exports = PinVerificationService;
