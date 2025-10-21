'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Store, Search, Filter, Plus, MapPin } from 'lucide-react'

// Mock data for demonstration
const mockShops = [
  { id: 1, name: 'مطعم الأصالة', city: 'كوم حمادة', isVerified: true, createdAt: '2024-01-15' },
  { id: 2, name: 'صيدلية النور', city: 'دمنهور', isVerified: false, createdAt: '2024-01-14' },
  { id: 3, name: 'محطة وقود شل', city: 'كفر الدوار', isVerified: true, createdAt: '2024-01-13' },
  { id: 4, name: 'معرض الإلكترونيات', city: 'كوم حمادة', isVerified: true, createdAt: '2024-01-12' },
  { id: 5, name: 'مطعم البحر الأبيض', city: 'دمنهور', isVerified: false, createdAt: '2024-01-11' },
]

export default function AdminShopsPage() {
  return (
    <div className="p-6">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/admin">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للوحة التحكم
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <Store className="w-6 h-6 text-green-600" />
                إدارة المتاجر
              </h1>
              <p className="text-stone-600">عرض وإدارة جميع المتاجر المسجلة في المنصة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 ml-2" />
              فلتر
            </Button>
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 ml-2" />
              بحث
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 ml-2" />
              متجر جديد
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900">89</div>
              <div className="text-sm text-stone-600">إجمالي المتاجر</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">67</div>
              <div className="text-sm text-stone-600">محققة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">22</div>
              <div className="text-sm text-stone-600">في الانتظار</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-stone-600">جديدة هذا الشهر</div>
            </CardContent>
          </Card>
        </div>

        {/* Shops Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المتاجر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockShops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-stone-600" />
                    </div>
                    <div>
                      <div className="font-medium text-stone-900">{shop.name}</div>
                      <div className="text-sm text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shop.city}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={shop.isVerified ? 'default' : 'secondary'}>
                      {shop.isVerified ? 'محقق' : 'في الانتظار'}
                    </Badge>
                    <div className="text-sm text-stone-400">
                      {new Date(shop.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                    <div className="flex items-center gap-2">
                      {!shop.isVerified && (
                        <Button variant="outline" size="sm">
                          تحقق
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
