# 🚀 أكواد البناء والتشغيل - دليل بلدي

## 📋 **متطلبات التشغيل:**
- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn أو pnpm أو bun

---

## 🏗️ **أكواد البناء (Build Commands):**

### **باستخدام npm:**
```bash
# تثبيت المكتبات
npm install

# بناء المشروع للإنتاج
npm run build

# معاينة البناء
npm run start
```

### **باستخدام yarn:**
```bash
# تثبيت المكتبات  
yarn install

# بناء المشروع للإنتاج
yarn build

# معاينة البناء
yarn start
```

### **باستخدام pnpm:**
```bash
# تثبيت المكتبات
pnpm install

# بناء المشروع للإنتاج  
pnpm build

# معاينة البناء
pnpm start
```

### **باستخدام bun:**
```bash
# تثبيت المكتبات
bun install

# بناء المشروع للإنتاج
bun run build

# معاينة البناء
bun run start
```

---

## 🛠️ **أكواد التطوير (Development Commands):**

### **تشغيل خادم التطوير:**
```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm  
pnpm dev

# bun
bun dev
```

### **فحص الكود والأخطاء:**
```bash
# فحص ESLint
npm run lint

# إصلاح مشاكل ESLint تلقائياً
npm run lint -- --fix

# فحص TypeScript
npm run type-check
```

---

## 📁 **هيكل ملفات البناء:**

بعد البناء ستجد:
```
frontend/
├── .next/          # ملفات Next.js المبنية
├── dist/           # ملفات البناء النهائية
├── out/            # ملفات التصدير الثابت (إذا استخدمت)
└── package.json    # معلومات المشروع
```

---

## 🔧 **أكواد إضافية مفيدة:**

### **تنظيف التخزين المؤقت:**
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install

# تنظيف تخزين Next.js المؤقت
rm -rf .next
npm run build
```

### **فحص الأمان:**
```bash
# فحص الثغرات الأمنية
npm audit

# إصلاح الثغرات الأمنية
npm audit fix
```

### **تحديث المكتبات:**
```bash
# عرض المكتبات القديمة
npm outdated

# تحديث جميع المكتبات
npm update

# تحديث مكتبة محددة
npm install package-name@latest
```

---

## 🌐 **نشر المشروع (Deployment):**

### **Vercel:**
```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel

# نشر للإنتاج
vercel --prod
```

### **Netlify:**
```bash
# تثبيت Netlify CLI
npm i -g netlify-cli

# نشر المشروع
netlify deploy

# نشر للإنتاج
netlify deploy --prod
```

### **Manual Build للخادم:**
```bash
# بناء المشروع
npm run build

# تشغيل الخادم
npm start

# أو باستخدام PM2
pm2 start npm --name "daleelbalady" -- start
```

---

## ⚙️ **متغيرات البيئة (Environment Variables):**

إنشاء ملف `.env.local`:
```bash
# API URLs
NEXT_PUBLIC_API_URL=https://api.daleelbalady.com
NEXT_PUBLIC_SOCKET_URL=https://api.daleelbalady.com

# Database (if needed)
DATABASE_URL=your_database_url

# Authentication (if needed)  
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🎯 **نصائح لتحسين الأداء:**

### **قبل البناء:**
```bash
# تنظيف الملفات المؤقتة
npm run clean

# فحص حجم الحزمة
npx next build --debug

# تحليل حجم الحزمة
npx @next/bundle-analyzer
```

### **بعد البناء:**
```bash
# فحص سرعة التحميل
npx lighthouse https://www.daleelbalady.com

# فحص SEO
npx next-sitemap
```

---

## 🚀 **الأكواد النهائية للاستخدام:**

### **للتطوير:**
```bash
npm install && npm run dev
```

### **للإنتاج:**
```bash
npm install && npm run build && npm start
```

### **للنشر السريع:**
```bash
git add . && git commit -m "Deploy updates" && git push && vercel --prod
```

---

## 📞 **في حالة المشاكل:**

```bash
# حذف كل شيء وإعادة البناء
rm -rf node_modules .next package-lock.json
npm install
npm run build
npm start
```

**جاهز للتشغيل!** 🎉
