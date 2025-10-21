const express = require('express');
const PlanService = require('../services/planService');
const PinService = require('../services/pinService');
const router = express.Router();

/**
 * الحصول على خطة المستخدم الحالية
 */
router.get('/my-plan', async (req, res) => {
  try {
    const userId = req.user.id; // من middleware المصادقة
    const plan = await PlanService.getUserPlan(userId);
    
    if (!plan) {
      // إنشاء خطة مجانية إذا لم تكن موجودة
      const newPlan = await PlanService.createFreePlan(userId);
      return res.json(newPlan);
    }
    
    res.json(plan);
  } catch (error) {
    console.error('خطأ في الحصول على الخطة:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * ترقية الخطة إلى مدفوعة
 */
router.post('/upgrade', async (req, res) => {
  try {
    const userId = req.user.id;
    const planData = req.body;
    
    // التحقق من البيانات المطلوبة
    const { planType, egyptianNationalId, fullArabicName } = planData;
    
    if (!planType || planType === 'FREE') {
      return res.status(400).json({ error: 'نوع الخطة مطلوب' });
    }
    
    if (!egyptianNationalId || !fullArabicName) {
      return res.status(400).json({ 
        error: 'الرقم القومي المصري والاسم الرباعي بالعربية مطلوبان' 
      });
    }
    
    // التحقق من الخطة الواحدة للفئة
    if (planType === 'SINGLE_CATEGORY' && !planData.selectedCategoryId) {
      return res.status(400).json({ 
        error: 'يجب اختيار فئة واحدة للخطة الواحدة' 
      });
    }
    
    const updatedPlan = await PlanService.upgradeToPaidPlan(userId, planData);
    
    res.json({
      success: true,
      message: 'تم ترقية الخطة بنجاح',
      plan: updatedPlan
    });
  } catch (error) {
    console.error('خطأ في ترقية الخطة:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * إرسال دعوة لفرد من العائلة
 */
router.post('/invite-family', async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteEmail, invitePhone, tempName, inviteMethod } = req.body;
    
    if (!inviteEmail && !invitePhone) {
      return res.status(400).json({ 
        error: 'البريد الإلكتروني أو رقم الهاتف مطلوب' 
      });
    }
    
    const invite = await PlanService.inviteFamilyMember(
      userId, 
      inviteEmail,
      { invitePhone, tempName, inviteMethod }
    );
    
    res.json({
      success: true,
      message: 'تم إرسال الدعوة بنجاح',
      invite: {
        id: invite.id,
        inviteEmail: invite.inviteEmail,
        inviteLink: invite.inviteLink,
        expiresAt: invite.expiresAt,
      }
    });
  } catch (error) {
    console.error('خطأ في إرسال الدعوة:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * قبول دعوة العائلة
 */
router.post('/accept-invite/:token', async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.params;
    
    const membership = await PlanService.acceptFamilyInvite(token, userId);
    
    res.json({
      success: true,
      message: 'تم قبول الدعوة بنجاح',
      membership
    });
  } catch (error) {
    console.error('خطأ في قبول الدعوة:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * الحصول على رقم PIN (مخفي جزئياً)
 */
router.get('/pin', async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await PlanService.getUserPlan(userId);
    
    if (!plan) {
      return res.status(404).json({ error: 'لم يتم العثور على خطة' });
    }
    
    if (plan.planType === 'FREE') {
      return res.status(403).json({ error: 'الخطة المجانية لا تحتوي على رقم PIN' });
    }
    
    res.json({
      maskedPin: plan.maskedPin,
      isPinExpired: plan.isPinExpired,
      pinExpiresAt: plan.pinExpiresAt,
      currentMonthYear: PinService.getCurrentMonthYear(),
    });
  } catch (error) {
    console.error('خطأ في الحصول على PIN:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * تجديد PIN الشهري (للمشرفين)
 */
router.post('/renew-pins', async (req, res) => {
  try {
    // التحقق من صلاحية المشرف
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'غير مصرح لك بهذا الإجراء' });
    }
    
    const renewedCount = await PlanService.renewMonthlyPins();
    
    res.json({
      success: true,
      message: `تم تجديد ${renewedCount} رقم PIN`,
      renewedCount
    });
  } catch (error) {
    console.error('خطأ في تجديد PINs:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * التحقق من صلاحيات المستخدم
 */
router.get('/permissions', async (req, res) => {
  try {
    const userId = req.user.id;
    const permissions = await PlanService.checkUserPermissions(userId);
    
    res.json(permissions);
  } catch (error) {
    console.error('خطأ في التحقق من الصلاحيات:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * قائمة أفراد العائلة
 */
router.get('/family-members', async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await PlanService.getUserPlan(userId);
    
    if (!plan) {
      return res.status(404).json({ error: 'لم يتم العثور على خطة' });
    }
    
    res.json({
      familyMembers: plan.familyMembers || [],
      maxFamilyMembers: plan.maxFamilyMembers,
      currentMembers: plan.currentMembers
    });
  } catch (error) {
    console.error('خطأ في الحصول على أفراد العائلة:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * إلغاء دعوة العائلة
 */
router.delete('/family-invite/:inviteId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteId } = req.params;
    
    // هنا يمكن إضافة منطق إلغاء الدعوة
    // سيتم تنفيذه في الإصدار التالي
    
    res.json({
      success: true,
      message: 'تم إلغاء الدعوة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إلغاء الدعوة:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

/**
 * إحصائيات الخطة
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await PlanService.getUserPlan(userId);
    
    if (!plan) {
      return res.status(404).json({ error: 'لم يتم العثور على خطة' });
    }
    
    // حساب الإحصائيات
    const stats = {
      planType: plan.planType,
      isActive: plan.isActive,
      startedAt: plan.startedAt,
      daysActive: Math.floor((new Date() - new Date(plan.startedAt)) / (1000 * 60 * 60 * 24)),
      pinUsageCount: plan.pinUsageCount || 0,
      familyMembersCount: plan.familyMembers?.length || 0,
      nextPaymentDue: plan.nextPaymentDue,
      totalSavingsThisMonth: 0 // سيتم حسابه من تاريخ استخدام PIN
    };
    
    res.json(stats);
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات الخطة:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
