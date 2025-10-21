import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المدونة - دليل بلدي',
  description: 'آخر الأخبار والنصائح من فريق دليل بلدي',
};

export default function BlogPage() {
  const posts = [
    {
      title: 'كيف تختار مقدم الخدمة المناسب',
      excerpt: 'نصائح مهمة لاختيار أفضل مقدمي الخدمات المحلية',
      date: '15 أكتوبر 2025',
      category: 'نصائح',
      image: '📝'
    },
    {
      title: '10 طرق لتحسين تجربتك على دليل بلدي',
      excerpt: 'اكتشف ميزات خفية واحصل على أقصى استفادة من المنصة',
      date: '10 أكتوبر 2025',
      category: 'إرشادات',
      image: '💡'
    },
    {
      title: 'قصص نجاح مقدمي الخدمات',
      excerpt: 'تعرف على كيف ساعدت منصتنا الأعمال المحلية على النمو',
      date: '5 أكتوبر 2025',
      category: 'قصص نجاح',
      image: '🎯'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-primary to-green-light bg-clip-text text-transparent">
            مدونة دليل بلدي
          </h1>
          <p className="text-xl text-text-secondary">
            آخر الأخبار، النصائح، وقصص النجاح
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          {posts.map((post, idx) => (
            <article key={idx} className="glass-card rounded-2xl overflow-hidden hover-lift cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-green-subtle to-green-glow flex items-center justify-center text-6xl">
                {post.image}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-3 py-1 bg-green-subtle text-green-dark rounded-full font-medium">
                    {post.category}
                  </span>
                  <span className="text-sm text-text-muted">{post.date}</span>
                </div>
                <h2 className="text-2xl font-bold mb-3 hover:text-green-primary transition">
                  {post.title}
                </h2>
                <p className="text-text-secondary mb-4">
                  {post.excerpt}
                </p>
                <div className="text-green-primary font-medium hover:underline">
                  قراءة المزيد ←
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-green-primary to-green-light text-white rounded-xl font-bold hover-lift">
            عرض جميع المقالات
          </button>
        </div>

        <div className="mt-16 glass-card p-12 rounded-2xl max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">اشترك في النشرة الإخبارية</h2>
          <p className="text-text-secondary mb-6">
            احصل على آخر التحديثات والنصائح مباشرة في بريدك الإلكتروني
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-primary"
            />
            <button className="px-6 py-3 bg-green-primary text-white rounded-xl font-bold hover-lift">
              اشترك
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
          transform: translateY(-4px);
          box-shadow: var(--shadow-medium);
        }
      `}</style>
    </div>
  );
}
