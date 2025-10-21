'use client'
import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, Clock } from 'lucide-react'

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.daleelbalady.com/api/admin/activity', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
    }).then(r => r.json()).then(d => { setActivities(d.activities || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-600 dark:text-green-500"/>النشاطات الأخيرة
        </h1>
        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-6">
            {loading ? <div className="text-center py-8">جاري التحميل...</div> : 
             activities.length === 0 ? <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد نشاطات</div> :
             activities.map((a, i) => (
               <div key={i} className="p-4 border-b dark:border-stone-800 flex items-start gap-3">
                 <Clock className="w-5 h-5 mt-1 text-stone-400"/>
                 <div className="flex-1">
                   <div className="font-medium dark:text-stone-100">{a.title}</div>
                   <div className="text-sm text-stone-600 dark:text-stone-400">{a.description}</div>
                   <div className="text-xs text-stone-500 dark:text-stone-500 mt-1">{new Date(a.timestamp).toLocaleString('ar-EG')}</div>
                 </div>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
