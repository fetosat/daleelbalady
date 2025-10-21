'use client'
import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Trash2 } from 'lucide-react'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.daleelbalady.com/api/admin/notifications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
    }).then(r => r.json()).then(d => { setNotifications(d.notifications || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600 dark:text-blue-500"/>إدارة الإشعارات
        </h1>
        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-6">
            {loading ? <div className="text-center py-8">جاري التحميل...</div> : 
             notifications.length === 0 ? <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد إشعارات</div> :
             notifications.map(n => (
               <div key={n.id} className="p-4 border-b dark:border-stone-800 flex items-start justify-between">
                 <div className="flex-1">
                   <div className="font-medium dark:text-stone-100">{n.title}</div>
                   <div className="text-sm text-stone-600 dark:text-stone-400">{n.message}</div>
                   <Badge className="mt-2" variant={n.isRead ? 'secondary' : 'default'}>{n.isRead ? 'مقروء' : 'جديد'}</Badge>
                 </div>
                 <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400"><Trash2 className="w-4 h-4"/></Button>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
