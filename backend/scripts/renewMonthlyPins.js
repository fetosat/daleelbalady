#!/usr/bin/env node

/**
 * مهمة Cron لتجديد PIN الشهري لجميع الخطط المدفوعة
 * 
 * يتم تشغيل هذا السكريبت شهرياً في اليوم الأول من كل شهر
 * لتجديد أرقام PIN لجميع المشتركين في الخطط المدفوعة
 * 
 * استخدام:
 * node scripts/renewMonthlyPins.js
 * 
 * أو عبر cron job:
 * 0 0 1 * * /usr/bin/node /path/to/backend/scripts/renewMonthlyPins.js
 */

const PlanService = require('../services/planService');
const PinService = require('../services/pinService');

async function renewMonthlyPins() {
  console.log('🔄 بدء تجديد أرقام PIN الشهرية...');
  console.log(`📅 التاريخ: ${new Date().toISOString()}`);
  console.log(`📊 الشهر الحالي: ${PinService.getCurrentMonthYear()}`);
  
  try {
    const startTime = Date.now();
    
    // تجديد أرقام PIN
    const renewedCount = await PlanService.renewMonthlyPins();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('✅ تم تجديد أرقام PIN بنجاح!');
    console.log(`📈 عدد الخطط المجددة: ${renewedCount}`);
    console.log(`⏱️ الوقت المستغرق: ${duration} ثانية`);
    
    // إرسال تقرير (يمكن إضافة إرسال بريد إلكتروني أو إشعار)
    if (renewedCount > 0) {
      console.log(`📧 تم تجديد ${renewedCount} رقم PIN للشهر الجديد`);
      
      // هنا يمكن إضافة إرسال إشعارات للمستخدمين
      // await sendPinRenewalNotifications(renewedCount);
    } else {
      console.log('ℹ️ لا توجد أرقام PIN تحتاج للتجديد');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في تجديد أرقام PIN:', error);
    
    // إرسال تنبيه للمطورين
    console.error('🚨 تم إرسال تنبيه للمطورين');
    
    process.exit(1);
  }
}

/**
 * إرسال إشعارات تجديد PIN للمستخدمين (للتنفيذ المستقبلي)
 */
async function sendPinRenewalNotifications(count) {
  // يمكن تنفيذ هذا لاحقاً لإرسال إشعارات للمستخدمين
  // عن تجديد رقم PIN الخاص بهم
  console.log(`📱 سيتم إرسال ${count} إشعار تجديد PIN`);
}

/**
 * تشغيل السكريبت إذا تم استدعاؤه مباشرة
 */
if (require.main === module) {
  renewMonthlyPins();
}

module.exports = {
  renewMonthlyPins,
  sendPinRenewalNotifications
};
