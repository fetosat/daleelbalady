'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  Package, 
  Calendar, 
  Users,
  TrendingUp,
  Search,
  UserPlus,
  LogIn,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function GuestDashboardPage() {
  const router = useRouter()

  const features = [
    {
      title: 'تصفح الخدمات',
      description: 'اكتشف آلاف الخدمات المحلية',
      icon: Package,
      color: 'bg-blue-500',
      link: '/services'
    },
    {
      title: 'المتاجر المحلية',
      description: 'تسوق من متاجر محلية موثوقة',
      icon: Store,
      color: 'bg-purple-500',
      link: '/shops'
    },
    {
      title: 'مقدمو الخدمات',
      description: 'ابحث عن أفضل مقدمي الخدمات',
      icon: Users,
      color: 'bg-green-500',
      link: '/providers'
    },
    {
      title: 'تقييمات موثوقة',
      description: 'اطلع على تقييمات العملاء',
      icon: Star,
      color: 'bg-yellow-500',
      link: '/reviews'
    }
  ]

  const stats = [
    { label: 'مقدم خدمة', value: '500+', icon: Users, color: 'bg-blue-500' },
    { label: 'متجر', value: '200+', icon: Store, color: 'bg-purple-500' },
    { label: 'خدمة متاحة', value: '1000+', icon: Package, color: 'bg-green-500' },
    { label: 'عميل راضٍ', value: '5000+', icon: TrendingUp, color: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6 bg-stone-950 min-h-screen p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-stone-100 mb-2">
          مرحباً بك في دليل بلدي 👋
        </h1>
        <p className="text-stone-400 text-lg">
          دليلك الشامل للخدمات والمتاجر المحلية
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
        <Link href="/register" className="flex-1">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
            <UserPlus className="h-5 w-5 ml-2" />
            إنشاء حساب جديد
          </Button>
        </Link>
        <Link href="/login" className="flex-1">
          <Button variant="outline" className="w-full border-stone-700 text-stone-300 hover:bg-stone-800 h-12">
            <LogIn className="h-5 w-5 ml-2" />
            تسجيل الدخول
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-stone-900 border-stone-800 hover:border-stone-700 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-stone-400 mb-2">{stat.label}</h3>
                <div className="text-3xl font-bold text-stone-100">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Features Grid */}
      <Card className="bg-stone-900 border-stone-800">
        <CardHeader className="border-b border-stone-800">
          <CardTitle className="text-stone-100 text-center">استكشف منصتنا</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index} 
                  className="bg-stone-800 border border-stone-700 rounded-lg p-6 cursor-pointer hover:bg-stone-750 transition-colors"
                  onClick={() => router.push(feature.link)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-stone-100">{feature.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-stone-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search Card */}
      <Card className="bg-stone-900 border-stone-800">
        <CardContent className="p-8">
          <div className="text-center">
            <Search className="h-16 w-16 mx-auto text-stone-600 mb-4" />
            <h3 className="text-2xl font-bold text-stone-100 mb-2">
              ابدأ البحث الآن
            </h3>
            <p className="text-stone-400 mb-6">
              ابحث عن الخدمات والمتاجر القريبة منك
            </p>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Search className="h-4 w-4 ml-2" />
                ابحث الآن
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Join CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  هل أنت مقدم خدمة؟
                </h3>
                <p className="text-stone-300 mb-4">
                  انضم إلينا وابدأ بعرض خدماتك الآن
                </p>
                <Link href="/register?role=provider">
                  <Button className="bg-green-600 hover:bg-green-700">
                    سجل كمقدم خدمة
                  </Button>
                </Link>
              </div>
              <Package className="h-24 w-24 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">
                  هل لديك متجر؟
                </h3>
                <p className="text-stone-300 mb-4">
                  اعرض منتجاتك وزد مبيعاتك معنا
                </p>
                <Link href="/register?role=shop_owner">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    سجل كصاحب متجر
                  </Button>
                </Link>
              </div>
              <Store className="h-24 w-24 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Badge */}
      <div className="text-center">
        <Badge variant="secondary" className="text-stone-400 bg-stone-800 border-stone-700">
          💡 قم بإنشاء حساب للاستفادة من جميع المميزات
        </Badge>
      </div>
    </div>
  )
}

