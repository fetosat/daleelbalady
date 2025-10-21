import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'عن الشركة - دليل بلدي',
  description: 'تعرف على شركة دليل بلدي ورؤيتنا في تقديم أفضل الخدمات المحلية',
};

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-primary to-green-light bg-clip-text text-transparent">
            عن دليل بلدي
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            منصة محلية رائدة تربط المستخدمين بأفضل الخدمات والمنتجات في مصر
          </p>
        </div>

        {/* Company Info Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-primary">رؤيتنا</h2>
            <p className="text-text-secondary leading-relaxed">
              نسعى لأن نكون المنصة الأولى التي يلجأ إليها المصريون للعثور على الخدمات المحلية
              الموثوقة، مع توفير تجربة مستخدم سلسة وآمنة تعتمد على الذكاء الاصطناعي.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-green-primary">مهمتنا</h2>
            <p className="text-text-secondary leading-relaxed">
              تمكين الأعمال المحلية من الوصول إلى عملاء جدد، وتوفير منصة موثوقة تجمع
              بين الجودة والسهولة في الاستخدام مع دعم كامل للغة العربية.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">قيمنا</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'الثقة', description: 'نبني الثقة من خلال التحقق من جميع مقدمي الخدمات' },
              { title: 'الابتكار', description: 'نستخدم أحدث التقنيات لتحسين تجربة المستخدم' },
              { title: 'الجودة', description: 'نضمن أعلى معايير الجودة في جميع خدماتنا' }
            ].map((value, idx) => (
              <div key={idx} className="glass-card p-6 rounded-xl text-center hover-lift">
                <h3 className="text-xl font-bold mb-3 text-green-primary">{value.title}</h3>
                <p className="text-text-secondary">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-green-subtle rounded-2xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'مستخدم نشط' },
              { number: '5,000+', label: 'مقدم خدمة' },
              { number: '50+', label: 'مدينة' },
              { number: '100,000+', label: 'حجز ناجح' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-green-primary mb-2">{stat.number}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </div>
            ))}
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
