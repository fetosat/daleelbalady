'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Search, Filter, Plus } from 'lucide-react'

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', role: 'CUSTOMER', isVerified: true, createdAt: '2024-01-15' },
  { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', role: 'SHOP_OWNER', isVerified: true, createdAt: '2024-01-14' },
  { id: 3, name: 'محمد القاضي', email: 'mohamed@example.com', role: 'PROVIDER', isVerified: false, createdAt: '2024-01-13' },
  { id: 4, name: 'نور أحمد', email: 'nour@example.com', role: 'CUSTOMER', isVerified: true, createdAt: '2024-01-12' },
  { id: 5, name: 'علي حسن', email: 'ali@example.com', role: 'DELIVERY', isVerified: true, createdAt: '2024-01-11' },
]

export default function AdminUsersPage() {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'CUSTOMER': return 'bg-green-100 text-green-800'
      case 'SHOP_OWNER': return 'bg-blue-100 text-blue-800'
      case 'PROVIDER': return 'bg-purple-100 text-purple-800'
      case 'DELIVERY': return 'bg-orange-100 text-orange-800'
      case 'ADMIN': return 'bg-red-100 text-red-800'
      default: return 'bg-stone-100 text-stone-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CUSTOMER': return 'عميل'
      case 'SHOP_OWNER': return 'صاحب متجر'
      case 'PROVIDER': return 'مقدم خدمة'
      case 'DELIVERY': return 'مندوب توصيل'
      case 'ADMIN': return 'إدارة'
      default: return role
    }
  }

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
                <Users className="w-6 h-6 text-blue-600" />
                إدارة المستخدمين
              </h1>
              <p className="text-stone-600">عرض وإدارة جميع المستخدمين المسجلين في المنصة</p>
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
              مستخدم جديد
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900">1,247</div>
              <div className="text-sm text-stone-600">إجمالي المستخدمين</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">892</div>
              <div className="text-sm text-stone-600">عملاء</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">234</div>
              <div className="text-sm text-stone-600">أصحاب متاجر</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">121</div>
              <div className="text-sm text-stone-600">مقدمي خدمات</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <div className="font-medium text-stone-900">{user.name}</div>
                      <div className="text-sm text-stone-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                      {user.isVerified ? 'محقق' : 'غير محقق'}
                    </Badge>
                    <div className="text-sm text-stone-400">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                    <Button variant="ghost" size="sm">
                      عرض التفاصيل
                    </Button>
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
