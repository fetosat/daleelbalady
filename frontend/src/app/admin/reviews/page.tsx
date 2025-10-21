'use client'
import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Trash2, Eye } from 'lucide-react'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use API proxy instead of direct backend call
    fetch('/api/admin/reviews', {
      headers: { 
        'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('daleel-token') : ''}` 
      }
    }).then(r => r.json()).then(d => { 
      setReviews(d.reviews || []); 
      setLoading(false) 
    }).catch(() => {
      setLoading(false)
      // Set mock data for build
      setReviews([])
    })
  }, [])

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-6">إدارة التقييمات</h1>
        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardContent className="p-6">
            {loading ? <div className="text-center py-8">جاري التحميل...</div> : 
             reviews.length === 0 ? <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد تقييمات</div> :
             reviews.map(r => (
               <div key={r.id} className="p-4 border-b dark:border-stone-800 flex items-center justify-between">
                 <div><div className="font-medium dark:text-stone-100">{r.author?.name}</div>
                 <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>{r.rating}</div></div>
                 <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400"><Trash2 className="w-4 h-4"/></Button>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
