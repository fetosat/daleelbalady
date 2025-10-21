# دليل تشغيل السيرفر بعد الإصلاحات 🚀

## المشاكل التي تم إصلاحها:

### 1. ✅ مشكلة delivery.js routes
- تم تحويل الملف من CommonJS إلى ES6 modules
- تم إصلاح import statements
- تم إضافة export default

### 2. ✅ مشكلة PrismaClient في family.js
- تم إصلاح مسار PrismaClient import
- تم إصلاح auth middleware import

### 3. ✅ إضافة نظام الدفع الجديد
- تم إضافة payment routes الجديد
- تم ربطه في server.js

## الملفات الجديدة المضافة:

1. **Digital Signature System** 🔐
   - `backend/middleware/digital-signature.js`

2. **Advanced Payment System** 💳
   - `backend/services/payment-system.js`
   - `backend/routes/payment.js`

3. **Payment Interface Frontend** 🌐
   - `frontend/components/payment/PaymentInterface.tsx`

## كيفية تشغيل السيرفر:

### على Linux/Mac:
```bash
# في مجلد backend
cd /var/www/daleelai-backend
pm2 restart server
```

### على Windows (إذا كان Node.js مثبت):
```cmd
cd C:\Users\WDAGUtilityAccount\Desktop\daleelbalady\backend
node server.js
```

### إذا كان PM2 يعمل:
```bash
pm2 restart server
pm2 logs server --lines 50
```

## المتغيرات البيئية المطلوبة (.env):

```env
# Payment System Variables
PAYMENT_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
PAYMENT_SECRET=your-payment-secret-key
PASSWORD_SALT=your-password-salt

# PayMob
PAYMOB_API_URL=https://accept.paymobsolutions.com/api
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_HMAC_SECRET=your-hmac-secret

# Fawry
FAWRY_API_URL=https://atfawry.com
FAWRY_MERCHANT_ID=your-merchant-id
FAWRY_SECURITY_KEY=your-security-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# PayPal
PAYPAL_API_URL=https://api.paypal.com
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

## التحقق من عمل النظام:

1. **Health Check:**
   ```
   GET /api/health
   ```

2. **Payment System:**
   ```
   POST /api/payment/create-intent
   GET /api/payment/verify/:paymentRef
   ```

3. **WebSocket Connections:**
   - Socket.io should be working on the same port

## المميزات الجديدة:

✅ **نظام دفع متكامل** مع 4 مقدمي خدمات  
✅ **التوقيع الرقمي** للمعاملات الآمنة  
✅ **Device Fingerprinting** لكشف الأنشطة المشبوهة  
✅ **واجهة دفع عربية** متجاوبة  
✅ **Webhooks آمنة** لمعالجة المدفوعات  
✅ **نظام استرداد** مع قيود زمنية  
✅ **تقارير مالية** تفصيلية  

## في حالة استمرار المشاكل:

1. تأكد من أن Node.js مثبت وموجود في PATH
2. تأكد من أن PM2 مثبت: `npm install -g pm2`
3. تحقق من ملف .env وتأكد من وجود كل المتغيرات
4. راجع logs: `pm2 logs server`

السيرفر الآن جاهز للتشغيل مع نظام الدفع المتكامل! 🎉
