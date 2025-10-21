import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'الدعم - دليل بلدي',
  description: 'مركز الدعم والمساعدة - نحن هنا لمساعدتك',
};

export default function SupportPage() {
  const faqs = [
    { q: 'كيف يمكنني التسجيل في المنصة؟', a: 'اضغط على زر "إنشاء حساب" وأدخل بياناتك' },
    { q: 'كيف أقوم بحجز خدمة؟', a: 'ابحث عن الخدمة المطلوبة، اختر التاريخ والوقت، ثم أكمل الدفع' },
    { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل جميع البطاقات الائتمانية والمحافظ الإلكترونية' },
    { q: 'كيف يمكنني إلغاء الحجز؟', a: 'من لوحة التحكم، اختر الحجز ثم اضغط إلغاء' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-primary to-green-light bg-clip-text text-transparent">
            كيف يمكننا مساعدتك؟
          </h1>
          <p className="text-xl text-text-secondary">
            نحن هنا للإجابة على جميع أسئلتك
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-16">
          <Link href="/help-center" className="glass-card p-8 rounded-xl text-center hover-lift">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">مركز المساعدة</h3>
            <p className="text-text-secondary">أدلة شاملة وإجابات سريعة</p>
          </Link>

          <div className="glass-card p-8 rounded-xl text-center hover-lift cursor-pointer">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">الدردشة المباشرة</h3>
            <p className="text-text-secondary">تحدث مع فريق الدعم الآن</p>
          </div>

          <div className="glass-card p-8 rounded-xl text-center hover-lift cursor-pointer">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">البريد الإلكتروني</h3>
            <p className="text-text-secondary">support@daleelbalady.com</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card p-6 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-green-primary">{faq.q}</h3>
                <p className="text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">لم تجد ما تبحث عنه؟</h2>
            <p className="text-text-secondary mb-6">
              فريقنا جاهز لمساعدتك على مدار الساعة
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-green-primary text-white rounded-xl font-bold hover-lift">
                تواصل معنا
              </button>
              <Link href="/help-center" className="px-8 py-3 border-2 border-green-primary text-green-primary rounded-xl font-bold hover-lift">
                مركز المساعدة
              </Link>
            </div>
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
        .hover-lift {
          transition: var(--transition-smooth);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-medium);
        }
      `}</style>
    </div>
  );
}
