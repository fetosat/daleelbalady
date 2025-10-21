import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'مركز المساعدة - دليل بلدي',
  description: 'أدلة ومقالات شاملة لمساعدتك في استخدام دليل بلدي',
};

export default function HelpCenterPage() {
  const categories = [
    {
      title: 'البدء',
      icon: '🚀',
      articles: [
        'إنشاء حساب جديد',
        'إعداد ملفك الشخصي',
        'استكشاف الخدمات'
      ]
    },
    {
      title: 'الحجز والدفع',
      icon: '💳',
      articles: [
        'كيفية حجز خدمة',
        'طرق الدفع المتاحة',
        'إلغاء واسترداد الأموال'
      ]
    },
    {
      title: 'لمقدمي الخدمات',
      icon: '💼',
      articles: [
        'إضافة خدماتك',
        'إدارة الحجوزات',
        'استلام المدفوعات'
      ]
    },
    {
      title: 'الحساب والأمان',
      icon: '🔒',
      articles: [
        'إعدادات الخصوصية',
        'تأمين حسابك',
        'تغيير كلمة المرور'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-primary to-green-light bg-clip-text text-transparent">
            مركز المساعدة
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            كل ما تحتاج معرفته لاستخدام دليل بلدي بنجاح
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="ابحث عن مساعدة..."
              className="w-full px-6 py-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {categories.map((category, idx) => (
            <div key={idx} className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">{category.icon}</div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
              </div>
              <div className="space-y-3">
                {category.articles.map((article, articleIdx) => (
                  <div
                    key={articleIdx}
                    className="flex items-center gap-2 text-text-secondary hover:text-green-primary cursor-pointer transition"
                  >
                    <span className="text-green-primary">→</span>
                    <span>{article}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="#" className="text-green-primary font-medium hover:underline">
                  عرض المزيد ←
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-12 rounded-2xl text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">لا تزال بحاجة إلى مساعدة؟</h2>
          <p className="text-xl text-text-secondary mb-8">
            فريق الدعم لدينا جاهز لمساعدتك
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/support" className="px-8 py-4 bg-green-primary text-white rounded-xl font-bold hover-lift">
              تواصل مع الدعم
            </Link>
            <button className="px-8 py-4 border-2 border-green-primary text-green-primary rounded-xl font-bold hover-lift">
              الدردشة المباشرة
            </button>
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
          transform: translateY(-2px);
          box-shadow: var(--shadow-green);
        }
      `}</style>
    </div>
  );
}
