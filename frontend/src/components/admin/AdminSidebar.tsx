'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Store, Package, Wrench, 
  ShoppingCart, Truck, Star, Bell, BarChart3,
  Settings, FileText, Calendar, Activity, Grid3X3
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'لوحة التحكم',
    href: '/dashboard/admin',
    icon: LayoutDashboard
  },
  {
    title: 'إدارة المستخدمين',
    href: '/dashboard/admin/users',
    icon: Users
  },
  {
    title: 'إدارة المتاجر',
    href: '/dashboard/admin/shops',
    icon: Store
  },
  {
    title: 'إدارة المنتجات',
    href: '/dashboard/admin/products',
    icon: Package
  },
  {
    title: 'إدارة الخدمات',
    href: '/dashboard/admin/services',
    icon: Wrench
  },
  {
    title: 'إدارة الطلبات',
    href: '/dashboard/admin/orders',
    icon: ShoppingCart
  },
  {
    title: 'التوصيلات',
    href: '/dashboard/admin/deliveries',
    icon: Truck
  },
  {
    title: 'التقييمات',
    href: '/dashboard/admin/reviews',
    icon: Star
  },
  {
    title: 'الإشعارات',
    href: '/dashboard/admin/notifications',
    icon: Bell
  },
  {
    title: 'التقارير والتحليلات',
    href: '/dashboard/admin/analytics',
    icon: BarChart3
  },
  {
    title: 'الجداول المتقدمة',
    href: '/dashboard/admin/data-tables',
    icon: Grid3X3
  },
  {
    title: 'النشاطات',
    href: '/dashboard/admin/activity',
    icon: Activity
  },
  {
    title: 'الإعدادات',
    href: '/dashboard/admin/settings',
    icon: Settings
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-stone-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900">دليل بلدي</h1>
            <p className="text-xs text-stone-500">لوحة الإدارة</p>
          </div>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-blue-600" : "text-stone-400"
                )} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h3 className="text-sm font-semibold text-stone-700 mb-3">إحصائيات سريعة</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600">المستخدمون</span>
              <span className="font-semibold text-blue-600">1,247</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600">المتاجر</span>
              <span className="font-semibold text-green-600">89</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600">الطلبات اليوم</span>
              <span className="font-semibold text-orange-600">24</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-700 font-medium">النظام يعمل بشكل طبيعي</span>
          </div>
        </div>
      </div>
    </div>
  )
}
