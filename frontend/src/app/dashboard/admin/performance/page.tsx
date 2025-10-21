import PerformanceMonitoring from '@/components/admin/PerformanceMonitoring'

export default function PerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <PerformanceMonitoring />
    </div>
  )
}

export const metadata = {
  title: 'مراقبة الأداء - دليل بلدي',
  description: 'مراقبة شاملة لأداء النظام مع مقاييس متقدمة ومؤشرات في الوقت الفعلي'
}
