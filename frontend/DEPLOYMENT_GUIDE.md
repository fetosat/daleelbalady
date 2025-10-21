# 🚀 دليل نشر التحديثات - Categories & Subcategories Feature

## المشكلة الحالية
الـ API بيرجع البيانات صح (categories و subcategories) لكن الفئات مش ظاهرة على الموقع المباشر لأن السيرفر بيستخدم نسخة قديمة من الـ frontend.

## التحديثات المطبقة

### Backend ✅
- ✅ API endpoint `/api/users/:id` بيرجع `categories` و `subcategories`
- ✅ البيانات صحيحة ومتاحة على: https://api.daleelbalady.com

**مثال:**
```json
{
  "user": {
    "id": "bc6798d5-7f0f-4a0a-8b71-3df1b7f1321d",
    "name": "Dr. Ahmed Hassan",
    "categories": [
      {
        "id": "224482bb-dd32-4a4f-b88c-67138d8acff7",
        "name": "Medical Services",
        "slug": "medical-services"
      }
    ],
    "subcategories": [
      {
        "id": "9c777120-3334-4b1d-9cef-8d1121e7d446",
        "name": "Cardiology",
        "slug": "cardiology"
      }
    ]
  }
}
```

### Frontend ✅
الملفات التالية تم تحديثها:
- ✅ `src/components/listing/VerifiedListingView.tsx` (السطور 762-833)
- ✅ `src/components/listing/FreeListingView.tsx` (السطور 243-271)

**الميزات المضافة:**
- عرض الفئات الرئيسية (Categories) كـ Badges
- عرض الفئات الفرعية (Subcategories) كـ Outlined Badges
- دعم multiple categories
- Console logs للتحقق من البيانات

## 🔧 خطوات النشر على السيرفر المباشر

### الطريقة 1: استخدام Git + PM2 (الموصى بها)

```bash
# 1. اذهب إلى مجلد الـ frontend على السيرفر
cd /path/to/daleelbalady/frontend

# 2. احفظ أي تغييرات حالية (لو في)
git stash

# 3. جلب آخر التحديثات
git pull origin main
# أو إذا كنت تستخدم فرع آخر
git pull origin your-branch-name

# 4. تثبيت أي dependencies جديدة
npm install

# 5. بناء المشروع
npm run build

# 6. إعادة تشغيل التطبيق
pm2 restart daleelbalady-frontend
# أو
pm2 restart all

# 7. تحقق من الحالة
pm2 status
pm2 logs daleelbalady-frontend --lines 50
```

### الطريقة 2: رفع الملفات يدوياً

إذا لم يكن Git متاح:

```bash
# 1. على جهازك المحلي، احزم الملفات المحدثة
# الملفات المطلوبة:
# - src/components/listing/VerifiedListingView.tsx
# - src/components/listing/FreeListingView.tsx

# 2. ارفع الملفات إلى السيرفر (استخدم FTP/SCP/SFTP)
scp src/components/listing/*.tsx user@server:/path/to/frontend/src/components/listing/

# 3. على السيرفر، ابني المشروع
ssh user@server
cd /path/to/daleelbalady/frontend
npm run build
pm2 restart daleelbalady-frontend
```

### الطريقة 3: استخدام CI/CD (إذا كان متاح)

إذا كان لديك GitHub Actions أو أي CI/CD:

```bash
# 1. اعمل commit و push للتغييرات
git add .
git commit -m "feat: Add categories and subcategories display to listing views"
git push origin main

# 2. انتظر الـ CI/CD ينفذ automatically
# أو trigger manual deployment من لوحة التحكم
```

## 🧪 التحقق من النشر

بعد النشر، تحقق من:

### 1. افتح صفحة المستخدم
```
https://www.daleelbalady.com/listing/bc6798d5-7f0f-4a0a-8b71-3df1b7f1321d
```

### 2. افتح Developer Console (F12)
ابحث عن logs مثل:
```
🏷️ Categories data: [{ name: "Medical Services", ... }]
🏷️ Subcategories data: [{ name: "Cardiology", ... }]
```

### 3. تحقق من العرض
يجب أن ترى:
- قسم "Categories & Tags" في الصفحة
- Badge أزرق مكتوب فيه "Medical Services"
- Badge أبيض (outline) مكتوب فيه "Cardiology"

## 🐛 استكشاف الأخطاء

### المشكلة: الفئات لسه مش ظاهرة

**1. تحقق من Build**
```bash
# على السيرفر
cd /path/to/frontend
ls -la .next/
# يجب أن تشوف build ID حديث
cat .next/BUILD_ID
```

**2. مسح Cache**
```bash
# على السيرفر
rm -rf .next/
npm run build
pm2 restart daleelbalady-frontend
```

**3. تحقق من Browser Cache**
```
في المتصفح:
- Ctrl+Shift+R (Hard Reload)
- أو افتح Incognito Window
```

### المشكلة: Errors في Console

**تحقق من logs**
```bash
pm2 logs daleelbalady-frontend --lines 100
```

**تحقق من Network Tab**
في Developer Tools → Network:
- هل API request بيرجع categories?
- هل في errors في loading الصفحة?

## 📝 ملاحظات مهمة

1. **لا تنسى Backup**: احفظ نسخة من `.next/` قبل البناء الجديد
2. **Environment Variables**: تأكد إن `.env` فيه:
   ```
   NEXT_PUBLIC_API_URL=https://api.daleelbalady.com
   ```
3. **Port Configuration**: تأكد إن PM2 بيستخدم المنفذ الصحيح (3000)
4. **SSL/HTTPS**: تأكد إن الموقع بيشتغل على HTTPS عشان الـ API calls

## 🎯 الملفات المعدلة

```
frontend/
├── src/
│   └── components/
│       └── listing/
│           ├── VerifiedListingView.tsx  ← تم التحديث
│           └── FreeListingView.tsx      ← تم التحديث
└── DEPLOYMENT_GUIDE.md                  ← هذا الملف
```

## ✅ Checklist النشر

- [ ] تم عمل `git pull` أو رفع الملفات
- [ ] تم تشغيل `npm install`
- [ ] تم تشغيل `npm run build` بنجاح
- [ ] تم `pm2 restart` التطبيق
- [ ] تم التحقق من `pm2 logs` - لا يوجد errors
- [ ] تم فتح الصفحة في المتصفح
- [ ] تم عمل Hard Reload (Ctrl+Shift+R)
- [ ] الفئات ظاهرة بشكل صحيح ✅

## 📞 في حالة المساعدة

إذا واجهت أي مشاكل:
1. تحقق من الـ logs: `pm2 logs`
2. تحقق من Browser Console: F12 → Console
3. تحقق من Network Tab: F12 → Network
4. تأكد إن API بيرجع البيانات صح:
   ```bash
   curl https://api.daleelbalady.com/api/users/bc6798d5-7f0f-4a0a-8b71-3df1b7f1321d
   ```

