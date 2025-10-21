'use client'
import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings as SettingsIcon, Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ siteName: '', siteUrl: '', maintenanceMode: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.daleelbalady.com/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
    }).then(r => r.json()).then(d => { setSettings(d.settings || {}); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await fetch('https://api.daleelbalady.com/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    alert('تم الحفظ بنجاح')
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-stone-600 dark:text-stone-400"/>الإعدادات
        </h1>
        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-6 space-y-4">
            {loading ? <div className="text-center py-8">جاري التحميل...</div> : <>
              <div><label className="block text-sm font-medium mb-2 dark:text-stone-200">اسم الموقع</label>
              <Input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"/></div>
              <div><label className="block text-sm font-medium mb-2 dark:text-stone-200">رابط الموقع</label>
              <Input value={settings.siteUrl} onChange={e => setSettings({...settings, siteUrl: e.target.value})} className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"/></div>
              <Button onClick={handleSave} className="w-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600">
                <Save className="w-4 h-4 ml-2"/>حفظ التغييرات
              </Button>
            </>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
