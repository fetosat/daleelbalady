const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * PIN Service للتعامل مع نظام الـ PIN الشهري
 */
class PinService {
  
  /**
   * توليد PIN من 8 أرقام بصيغة XXXX-XXXX
   * @returns {string} PIN بصيغة 4-4
   */
  static generatePin() {
    // توليد 8 أرقام عشوائية
    const randomBytes = crypto.randomBytes(4);
    let pin = '';
    
    for (let i = 0; i < 4; i++) {
      pin += randomBytes[i].toString().padStart(2, '0').slice(-2);
    }
    
    // ضمان أن PIN مكون من 8 أرقام فقط
    pin = pin.slice(0, 8);
    
    // تنسيق الـ PIN إلى 4-4
    return `${pin.slice(0, 4)}-${pin.slice(4, 8)}`;
  }

  /**
   * تشفير PIN للحفظ الآمن في قاعدة البيانات
   * @param {string} pin - PIN غير مشفر
   * @returns {Promise<string>} PIN مشفر
   */
  static async hashPin(pin) {
    // إزالة الشرطة للتشفير
    const cleanPin = pin.replace('-', '');
    const saltRounds = 12;
    return await bcrypt.hash(cleanPin, saltRounds);
  }

  /**
   * التحقق من صحة PIN
   * @param {string} inputPin - PIN المدخل من المستخدم
   * @param {string} hashedPin - PIN المشفر من قاعدة البيانات
   * @returns {Promise<boolean>} صحة PIN
   */
  static async verifyPin(inputPin, hashedPin) {
    // إزالة الشرطة من PIN المدخل
    const cleanPin = inputPin.replace('-', '');
    return await bcrypt.compare(cleanPin, hashedPin);
  }

  /**
   * فرمتة PIN لعرضه للمستخدم
   * @param {string} pin - PIN غير مفرمت
   * @returns {string} PIN مفرمت بصيغة XXXX-XXXX
   */
  static formatPin(pin) {
    const cleanPin = pin.replace(/\D/g, ''); // إزالة كل شيء غير الأرقام
    if (cleanPin.length !== 8) {
      throw new Error('PIN يجب أن يكون 8 أرقام');
    }
    return `${cleanPin.slice(0, 4)}-${cleanPin.slice(4, 8)}`;
  }

  /**
   * الحصول على شهر/سنة الحالي للـ PIN
   * @returns {string} الشهر والسنة بصيغة "YYYY-MM"
   */
  static getCurrentMonthYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * التحقق من انتهاء صلاحية PIN للشهر الحالي
   * @param {Date} pinGeneratedAt - تاريخ توليد PIN
   * @returns {boolean} هل PIN منتهي الصلاحية؟
   */
  static isPinExpired(pinGeneratedAt) {
    if (!pinGeneratedAt) return true;
    
    const now = new Date();
    const pinDate = new Date(pinGeneratedAt);
    
    // التحقق من أن PIN من نفس الشهر والسنة
    const nowMonthYear = this.getCurrentMonthYear();
    const pinMonthYear = `${pinDate.getFullYear()}-${(pinDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    return nowMonthYear !== pinMonthYear;
  }

  /**
   * حساب تاريخ انتهاء صلاحية PIN (آخر يوم في الشهر)
   * @returns {Date} تاريخ انتهاء الصلاحية
   */
  static getPinExpiryDate() {
    const now = new Date();
    // آخر يوم في الشهر الحالي
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // ضبط الوقت على آخر ثانية في اليوم
    lastDay.setHours(23, 59, 59, 999);
    return lastDay;
  }

  /**
   * إخفاء جزء من PIN للعرض الآمن
   * @param {string} pin - PIN كامل
   * @returns {string} PIN مع إخفاء جزء منه
   */
  static maskPin(pin) {
    if (!pin) return '****-****';
    const formatted = this.formatPin(pin);
    // إظهار أول رقمين والأخيرين فقط
    return `${formatted.slice(0, 2)}**-**${formatted.slice(-2)}`;
  }

  /**
   * التحقق من صحة تنسيق PIN
   * @param {string} pin - PIN للتحقق من صحته
   * @returns {boolean} صحة التنسيق
   */
  static validatePinFormat(pin) {
    if (!pin) return false;
    // التحقق من أن PIN يتبع صيغة XXXX-XXXX أو XXXXXXXX
    const patterns = [
      /^\d{4}-\d{4}$/,  // 4-4 format
      /^\d{8}$/         // 8 digits without dash
    ];
    return patterns.some(pattern => pattern.test(pin));
  }

  /**
   * توليد كود التحقق الفريد لكل معاملة PIN
   * @returns {string} كود التحقق
   */
  static generateVerificationCode() {
    // توليد كود من 12 حرف/رقم
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }
}

module.exports = PinService;
