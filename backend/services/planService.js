const { PrismaClient } = require('../generated/prisma');
const PinService = require('./pinService');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * خدمة إدارة الخطط والاشتراكات
 */
class PlanService {
  
  /**
   * إنشاء خطة مجانية جديدة للمستخدم عند التسجيل
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} الخطة المنشأة
   */
  static async createFreePlan(userId) {
    try {
      const plan = await prisma.userGuidePlan.create({
        data: {
          userId,
          planType: 'FREE',
          pricePerMonth: 0,
          includesChat: false,
          includesDiscounts: false,
          maxFamilyMembers: 0,
          currentMembers: 1,
          isActive: true,
          startedAt: new Date(),
        }
      });

      return plan;
    } catch (error) {
      console.error('خطأ في إنشاء الخطة المجانية:', error);
      throw error;
    }
  }

  /**
   * ترقية المستخدم لخطة مدفوعة
   * @param {string} userId - معرف المستخدم
   * @param {Object} planData - بيانات الخطة الجديدة
   * @returns {Promise<Object>} الخطة المحدثة
   */
  static async upgradeToPaidPlan(userId, planData) {
    const {
      planType,
      selectedCategoryId,
      egyptianNationalId,
      fullArabicName,
      profilePicture,
      pricePerMonth = 100 // سعر افتراضي
    } = planData;

    try {
      // التحقق من صحة البيانات المطلوبة للخطط المدفوعة
      if (planType !== 'FREE') {
        if (!egyptianNationalId || !fullArabicName) {
          throw new Error('الرقم القومي والاسم الرباعي مطلوبان للخطط المدفوعة');
        }

        // التحقق من صحة الرقم القومي المصري (14 رقم)
        if (!/^\d{14}$/.test(egyptianNationalId)) {
          throw new Error('الرقم القومي يجب أن يكون 14 رقم');
        }
      }

      // توليد PIN شهري للخطط المدفوعة
      let currentMonthPin = null;
      let pinGeneratedAt = null;
      let pinExpiresAt = null;

      if (planType !== 'FREE') {
        currentMonthPin = PinService.generatePin();
        pinGeneratedAt = new Date();
        pinExpiresAt = PinService.getPinExpiryDate();
      }

      // تحديث الخطة
      const updatedPlan = await prisma.userGuidePlan.upsert({
        where: { userId },
        create: {
          userId,
          planType,
          selectedCategoryId: planType === 'SINGLE_CATEGORY' ? selectedCategoryId : null,
          pricePerMonth,
          includesChat: planType !== 'FREE',
          includesDiscounts: planType !== 'FREE',
          egyptianNationalId,
          fullArabicName,
          profilePicture,
          currentMonthPin,
          pinGeneratedAt,
          pinExpiresAt,
          maxFamilyMembers: planType !== 'FREE' ? 4 : 0,
          currentMembers: 1,
          isActive: true,
          startedAt: new Date(),
          lastPaymentAt: new Date(),
          nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // بعد شهر
        },
        update: {
          planType,
          selectedCategoryId: planType === 'SINGLE_CATEGORY' ? selectedCategoryId : null,
          pricePerMonth,
          includesChat: planType !== 'FREE',
          includesDiscounts: planType !== 'FREE',
          egyptianNationalId,
          fullArabicName,
          profilePicture,
          currentMonthPin,
          pinGeneratedAt,
          pinExpiresAt,
          maxFamilyMembers: planType !== 'FREE' ? 4 : 0,
          lastPaymentAt: new Date(),
          nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          selectedCategory: {
            select: { id: true, name: true, slug: true }
          }
        }
      });

      return {
        ...updatedPlan,
        maskedPin: currentMonthPin ? PinService.maskPin(currentMonthPin) : null,
        currentMonthPin: undefined // لا نعيد PIN الحقيقي
      };
    } catch (error) {
      console.error('خطأ في ترقية الخطة:', error);
      throw error;
    }
  }

  /**
   * تجديد PIN الشهري لجميع الخطط المدفوعة
   * @returns {Promise<number>} عدد الخطط التي تم تجديد PIN لها
   */
  static async renewMonthlyPins() {
    try {
      const paidPlans = await prisma.userGuidePlan.findMany({
        where: {
          planType: { not: 'FREE' },
          isActive: true,
        }
      });

      let renewedCount = 0;

      for (const plan of paidPlans) {
        if (PinService.isPinExpired(plan.pinGeneratedAt)) {
          const newPin = PinService.generatePin();
          
          await prisma.userGuidePlan.update({
            where: { id: plan.id },
            data: {
              currentMonthPin: newPin,
              pinGeneratedAt: new Date(),
              pinExpiresAt: PinService.getPinExpiryDate(),
              pinUsageCount: 0, // إعادة تعيين عداد الاستخدام
              updatedAt: new Date(),
            }
          });

          renewedCount++;
        }
      }

      return renewedCount;
    } catch (error) {
      console.error('خطأ في تجديد PINs الشهرية:', error);
      throw error;
    }
  }

  /**
   * الحصول على تفاصيل خطة المستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object|null>} تفاصيل الخطة
   */
  static async getUserPlan(userId) {
    try {
      const plan = await prisma.userGuidePlan.findUnique({
        where: { userId },
        include: {
          user: {
            select: { id: true, name: true, email: true, profilePic: true }
          },
          selectedCategory: {
            select: { id: true, name: true, slug: true }
          },
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

      if (!plan) return null;

      return {
        ...plan,
        maskedPin: plan.currentMonthPin ? PinService.maskPin(plan.currentMonthPin) : null,
        currentMonthPin: undefined, // لا نعيد PIN الحقيقي
        isPinExpired: PinService.isPinExpired(plan.pinGeneratedAt),
      };
    } catch (error) {
      console.error('خطأ في الحصول على خطة المستخدم:', error);
      throw error;
    }
  }

  /**
   * إرسال دعوة لفرد من العائلة
   * @param {string} userId - معرف صاحب الخطة
   * @param {string} inviteEmail - البريد الإلكتروني المدعو
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<Object>} تفاصيل الدعوة
   */
  static async inviteFamilyMember(userId, inviteEmail, options = {}) {
    const { invitePhone, tempName, inviteMethod = 'EMAIL' } = options;

    try {
      // الحصول على خطة المستخدم
      const plan = await prisma.userGuidePlan.findUnique({
        where: { userId },
        include: {
          familyMembers: {
            where: { inviteStatus: { in: ['PENDING', 'ACCEPTED'] } }
          }
        }
      });

      if (!plan) {
        throw new Error('لم يتم العثور على خطة للمستخدم');
      }

      if (plan.planType === 'FREE') {
        throw new Error('الخطة المجانية لا تسمح بدعوة أفراد العائلة');
      }

      // التحقق من عدد أفراد العائلة الحالي
      const currentFamilyCount = plan.familyMembers.length;
      if (currentFamilyCount >= plan.maxFamilyMembers) {
        throw new Error(`لا يمكن دعوة أكثر من ${plan.maxFamilyMembers} أفراد`);
      }

      // التحقق من عدم وجود دعوة مسبقة لنفس البريد الإلكتروني
      const existingInvite = await prisma.planFamilyMember.findFirst({
        where: {
          planId: plan.id,
          inviteEmail,
          inviteStatus: { in: ['PENDING', 'ACCEPTED'] }
        }
      });

      if (existingInvite) {
        throw new Error('تم إرسال دعوة مسبقاً لهذا البريد الإلكتروني');
      }

      // إنشاء رمز دعوة فريد
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // صالحة لمدة 7 أيام

      // إنشاء الدعوة
      const invite = await prisma.planFamilyMember.create({
        data: {
          planId: plan.id,
          inviteEmail,
          invitePhone,
          inviteToken,
          inviteMethod,
          tempName,
          expiresAt,
          canUseChat: plan.includesChat,
          canUseDiscounts: plan.includesDiscounts,
        }
      });

      return {
        ...invite,
        inviteLink: `${process.env.FRONTEND_URL}/join-family/${inviteToken}`,
        planOwnerName: plan.user?.name
      };
    } catch (error) {
      console.error('خطأ في إرسال دعوة العائلة:', error);
      throw error;
    }
  }

  /**
   * قبول دعوة العائلة
   * @param {string} inviteToken - رمز الدعوة
   * @param {string} userId - معرف المستخدم المقبول للدعوة
   * @returns {Promise<Object>} تفاصيل العضوية المقبولة
   */
  static async acceptFamilyInvite(inviteToken, userId) {
    try {
      // البحث عن الدعوة
      const invite = await prisma.planFamilyMember.findUnique({
        where: { inviteToken },
        include: {
          plan: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!invite) {
        throw new Error('رمز الدعوة غير صحيح');
      }

      if (invite.inviteStatus !== 'PENDING') {
        throw new Error('هذه الدعوة غير صالحة');
      }

      if (new Date() > invite.expiresAt) {
        throw new Error('انتهت صلاحية الدعوة');
      }

      // التحقق من أن المستخدم ليس صاحب الخطة نفسه
      if (invite.plan.userId === userId) {
        throw new Error('لا يمكن للمستخدم قبول دعوة خطته الخاصة');
      }

      // قبول الدعوة
      const acceptedInvite = await prisma.planFamilyMember.update({
        where: { id: invite.id },
        data: {
          invitedUserId: userId,
          inviteStatus: 'ACCEPTED',
          acceptedAt: new Date(),
          lastActiveAt: new Date(),
        }
      });

      // تحديث عدد الأعضاء في الخطة
      await prisma.userGuidePlan.update({
        where: { id: invite.planId },
        data: {
          currentMembers: {
            increment: 1
          }
        }
      });

      return {
        ...acceptedInvite,
        planOwner: invite.plan.user
      };
    } catch (error) {
      console.error('خطأ في قبول دعوة العائلة:', error);
      throw error;
    }
  }

  /**
   * التحقق من صلاحية المستخدم للاستفادة من المزايا
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} معلومات الصلاحيات
   */
  static async checkUserPermissions(userId) {
    try {
      // البحث عن خطة المستخدم أولاً
      let plan = await prisma.userGuidePlan.findUnique({
        where: { userId }
      });

      // إذا لم يكن المستخدم يملك خطة، البحث عن عضوية عائلية
      if (!plan) {
        const familyMembership = await prisma.planFamilyMember.findFirst({
          where: {
            invitedUserId: userId,
            inviteStatus: 'ACCEPTED'
          },
          include: {
            plan: true
          }
        });

        if (familyMembership) {
          plan = familyMembership.plan;
        }
      }

      if (!plan) {
        return {
          hasActivePlan: false,
          canUseChat: false,
          canUseDiscounts: false,
          planType: 'FREE'
        };
      }

      return {
        hasActivePlan: plan.isActive,
        canUseChat: plan.includesChat,
        canUseDiscounts: plan.includesDiscounts,
        planType: plan.planType,
        selectedCategoryId: plan.selectedCategoryId,
        isPinExpired: PinService.isPinExpired(plan.pinGeneratedAt),
      };
    } catch (error) {
      console.error('خطأ في التحقق من صلاحيات المستخدم:', error);
      throw error;
    }
  }
}

module.exports = PlanService;
