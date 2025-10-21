import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - دليل بلدي',
  description: 'سياسة الخصوصية وحماية البيانات في دليل بلدي',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-primary">سياسة الخصوصية</h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">1. جمع المعلومات</h2>
              <p className="text-text-secondary leading-relaxed">
                نقوم بجمع المعلومات التي تقدمها لنا عند التسجيل في المنصة، بما في ذلك الاسم،
                البريد الإلكتروني، رقم الهاتف، ومعلومات الدفع. نستخدم هذه المعلومات لتقديم
                خدماتنا وتحسين تجربتك.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">2. استخدام المعلومات</h2>
              <p className="text-text-secondary leading-relaxed">
                نستخدم معلوماتك الشخصية لـ:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                <li>تقديم وتحسين خدماتنا</li>
                <li>معالجة المعاملات والحجوزات</li>
                <li>التواصل معك بشأن حسابك وخدماتنا</li>
                <li>إرسال تحديثات وعروض ترويجية (يمكنك إلغاء الاشتراك في أي وقت)</li>
              </ul>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">3. حماية البيانات</h2>
              <p className="text-text-secondary leading-relaxed">
                نستخدم تدابير أمنية متقدمة لحماية معلوماتك الشخصية، بما في ذلك التشفير SSL،
                جدران الحماية، والتخزين الآمن. لا نشارك معلوماتك مع أطراف ثالثة دون موافقتك
                الصريحة، باستثناء ما هو مطلوب قانوناً.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">4. حقوقك</h2>
              <p className="text-text-secondary leading-relaxed">
                لديك الحق في الوصول إلى بياناتك الشخصية، تصحيحها، أو حذفها. يمكنك أيضاً
                الاعتراض على معالجة بياناتك أو طلب نقلها. للاستفادة من هذه الحقوق، يرجى
                التواصل معنا عبر support@daleelbalady.com
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">5. ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-text-secondary leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في
                استخدام ملفات تعريف الارتباط من خلال إعدادات متصفحك.
              </p>
            </section>

            <section className="glass-card p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">6. التحديثات</h2>
              <p className="text-text-secondary leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر
                البريد الإلكتروني أو إشعار على الموقع.
              </p>
              <p className="text-text-muted mt-4">
                آخر تحديث: أكتوبر 2025
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
