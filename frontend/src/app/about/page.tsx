import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'من نحن - دليل بلدي',
  description: 'تعرف على فريق دليل بلدي وقصتنا في تحسين الخدمات المحلية',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-green-primary to-green-light bg-clip-text text-transparent">
            من نحن
          </h1>

          <div className="glass-card p-8 rounded-2xl mb-8">
            <h2 className="text-3xl font-bold mb-6 text-green-primary">قصتنا</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              بدأت دليل بلدي كفكرة بسيطة: كيف يمكننا تسهيل العثور على الخدمات المحلية الموثوقة
              في مصر؟ من خلال الجمع بين التكنولوجيا الحديثة والفهم العميق للسوق المصري، قمنا
              ببناء منصة تخدم الملايين.
            </p>
            <p className="text-text-secondary leading-relaxed">
              اليوم، نحن نفخر بأن نكون الجسر الذي يربط بين مقدمي الخدمات والعملاء، مع التركيز
              على الجودة والثقة والابتكار.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl mb-8">
            <h2 className="text-3xl font-bold mb-6 text-green-primary">ما يميزنا</h2>
            <div className="space-y-4">
              {[
                { title: 'تحقق شامل', desc: 'جميع مقدمي الخدمات يخضعون لعملية تحقق دقيقة' },
                { title: 'دعم محلي', desc: 'فريق دعم عربي متاح على مدار الساعة' },
                { title: 'تقنية متطورة', desc: 'نستخدم الذكاء الاصطناعي لتحسين تجربتك' },
                { title: 'أمان البيانات', desc: 'حماية قصوى لبياناتك الشخصية' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-green-primary mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/company"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-primary to-green-light text-white rounded-xl font-bold hover-lift"
            >
              تعرف على المزيد عن شركتنا
            </Link>
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
