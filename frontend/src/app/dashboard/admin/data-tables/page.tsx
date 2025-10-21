import AdvancedDataTable from '@/components/admin/AdvancedDataTable'

export default function DataTablesPage() {
  return (
    <div className="container mx-auto p-6">
      <AdvancedDataTable />
    </div>
  )
}

export const metadata = {
  title: 'الجداول المتقدمة - دليل بلدي',
  description: 'جداول بيانات قابلة للتخصيص مع إمكانيات التصدير والتعديل المباشر'
}
