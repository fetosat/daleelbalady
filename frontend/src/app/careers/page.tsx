import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الوظائف - دليل بلدي',
  description: 'انضم إلى فريق دليل بلدي واصنع فرقاً في عالم الخدمات المحلية',
};

export default function CareersPage() {
  const openPositions = [
    { title: 'مطور Full Stack', type: 'دوام كامل', location: 'القاهرة' },
    { title: 'مصمم UI/UX', type: 'دوام كامل', location: 'القاهرة/عن بعد' },
    { title: 'مدير تسويق رقمي', type: 'دوام كامل', location: 'القاهرة' },
    { title: 'مدير خدمة العملاء', type: 'دوام كامل', location: 'القاهرة' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-primary to-green-light bg-clip-text text-transparent">
            انضم إلى فريقنا
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            نبحث عن أشخاص موهوبين ومتحمسين للانضمام إلى رحلتنا في تحسين الخدمات المحلية
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">الوظائف المتاحة</h2>
          <div className="space-y-4">
            {openPositions.map((job, idx) => (
              <div key={idx} className="glass-card p-6 rounded-xl hover-lift cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                    <div className="flex gap-4 text-sm text-text-secondary">
                      <span>📍 {job.location}</span>
                      <span>⏰ {job.type}</span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-green-primary text-white rounded-lg hover:bg-green-dark transition">
                    تقدم الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-subtle rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">لم تجد الوظيفة المناسبة؟</h2>
          <p className="text-xl text-text-secondary mb-6">
            أرسل سيرتك الذاتية وسنتواصل معك عند توفر فرص مناسبة
          </p>
          <button className="px-8 py-4 bg-white text-green-primary rounded-xl font-bold hover-lift">
            أرسل سيرتك الذاتية
          </button>
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
