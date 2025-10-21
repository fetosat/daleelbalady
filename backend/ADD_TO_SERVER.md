# إضافة المسارات الجديدة إلى server.js

## لتفعيل نظام الخطط والPIN، قم بإضافة السطور التالية:

### 1. في أعلى الملف مع باقي الـ imports (بعد السطر 28):
```javascript
import plansRoutes from "./routes/plans.js";
import pinVerificationRoutes from "./routes/pin-verification.js";
```

### 2. في قسم الـ routes (بعد السطر 95):
```javascript
app.use('/api/plans', plansRoutes);
app.use('/api/pin-verification', pinVerificationRoutes);
```

## ملاحظات:
- تأكد من تحويل الملفات إلى ES modules (.js) أو CommonJS (.cjs) حسب إعداد مشروعك
- المسارات الحالية تستخدم ES modules (import/export)
- إذا كنت تستخدم CommonJS، غيّر import إلى require

## مثال كامل للإضافة:
```javascript
// في قسم الـ imports
import plansRoutes from "./routes/plans.js";
import pinVerificationRoutes from "./routes/pin-verification.js";

// في قسم الـ routes
app.use('/api/plans', plansRoutes);
app.use('/api/pin-verification', pinVerificationRoutes);
```

بعد إضافة هذه السطور، ستكون جميع endpoints الجديدة متاحة:
- `/api/plans/*` - خطط المستخدمين
- `/api/pin-verification/*` - التحقق من PIN
