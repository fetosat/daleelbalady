import ThemeSwitcher from '@/components/admin/ThemeSwitcher'

export default function ThemesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">إعدادات الثيمات والمظهر</h1>
          <p className="text-stone-600">تخصيص مظهر لوحة التحكم مع معاينة مباشرة</p>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'إعدادات الثيمات - دليل بلدي',
  description: 'تخصيص مظهر لوحة التحكم مع دعم الوضع الليلي والنهاري'
}
