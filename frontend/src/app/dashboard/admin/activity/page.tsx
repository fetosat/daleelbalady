import ActivityFeed from '@/components/admin/ActivityFeed'

export default function ActivityPage() {
  return (
    <div className="container mx-auto p-6">
      <ActivityFeed />
    </div>
  )
}

export const metadata = {
  title: 'سجل النشاطات - دليل بلدي',
  description: 'سجل شامل للنشاطات مع timeline تفاعلي وفلاتر متقدمة'
}
