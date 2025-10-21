import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام - دليل بلدي',
  description: 'شروط وأحكام استخدام منصة دليل بلدي',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-primary">شروط الاستخدام</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">1. قبول الشروط</h2>
              <p className="text-text-secondary leading-relaxed">
                باستخدام منصة دليل بلدي، فإنك توافق على الالتزام بهذه الشروط والأحكام.
                إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">2. استخدام الخدمة</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                توافق على استخدام المنصة فقط للأغراض القانونية ووفقاً لهذه الشروط. يحظر عليك:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2">
                <li>استخدام المنصة بأي طريقة تنتهك القوانين المحلية أو الوطنية</li>
                <li>انتحال شخصية أي شخص أو كيان آخر</li>
                <li>نشر محتوى مسيء، تشهيري، أو غير قانوني</li>
                <li>محاولة الوصول غير المصرح به إلى أنظمة المنصة</li>
              </ul>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">3. الحسابات</h2>
              <p className="text-text-secondary leading-relaxed">
                أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور. توافق على قبول المسؤولية
                عن جميع الأنشطة التي تحدث تحت حسابك. يجب عليك إخطارنا فوراً بأي استخدام
                غير مصرح به لحسابك.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">4. الدفع والاسترداد</h2>
              <p className="text-text-secondary leading-relaxed">
                جميع الأسعار معروضة بالجنيه المصري وتشمل الضرائب المطبقة. يتم معالجة
                المدفوعات من خلال بوابات دفع آمنة. سياسة الاسترداد تختلف حسب نوع الخدمة
                ويتم توضيحها عند الحجز.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">5. الملكية الفكرية</h2>
              <p className="text-text-secondary leading-relaxed">
                جميع المحتويات على المنصة، بما في ذلك النصوص، الصور، الشعارات، والبرمجيات،
                محمية بموجب حقوق الطبع والنشر والعلامات التجارية. لا يجوز نسخ أو توزيع أي
                محتوى دون إذن كتابي مسبق.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">6. إخلاء المسؤولية</h2>
              <p className="text-text-secondary leading-relaxed">
                نبذل قصارى جهدنا لضمان دقة المعلومات المعروضة، لكننا لا نضمن أن الخدمة
                ستكون خالية من الأخطاء أو متاحة دائماً. نحن لسنا مسؤولين عن أي أضرار مباشرة
                أو غير مباشرة ناتجة عن استخدام المنصة.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">7. التعديلات</h2>
              <p className="text-text-secondary leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية
                عبر البريد الإلكتروني أو إشعار على الموقع.
              </p>
              <p className="text-text-muted mt-4">
                آخر تحديث: أكتوبر 2025
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">8. القانون الحاكم</h2>
              <p className="text-text-secondary leading-relaxed">
                تخضع هذه الشروط وتفسر وفقاً لقوانين جمهورية مصر العربية. أي نزاعات ستحل
                من خلال المحاكم المصرية المختصة.
              </p>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-soft);
        }
      `}</style>
    </div>
  );
}
