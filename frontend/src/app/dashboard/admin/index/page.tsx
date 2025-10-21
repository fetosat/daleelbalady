'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, BarChart3, Brain, Table, Bell, 
  Upload, Clock, Globe, Gauge, Palette,
  ExternalLink, ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'

const adminComponents = [
  {
    title: 'لوحة التحكم المباشرة',
    description: 'مراقبة مباشرة للطلبات والمبيعات مع تحديثات فورية',
    icon: Activity,
    href: '/dashboard/admin',
    color: 'bg-blue-500',
    features: ['تحديثات مباشرة', 'WebSocket', 'مقاييس شاملة']
  },
  {
    title: 'الرسوم البيانية المتطورة',
    description: 'رسوم بيانية تفاعلية مع تحليلات ذكية ومؤشرات KPI',
    icon: BarChart3,
    href: '/dashboard/admin/charts',
    color: 'bg-green-500',
    features: ['Heatmaps', 'Funnel Charts', 'KPI متقدمة']
  },
  {
    title: 'التحليلات الذكية',
    description: 'تحليلات مدعومة بالذكاء الاصطناعي مع توقعات واقتراحات',
    icon: Brain,
    href: '/dashboard/admin/ai-analytics',
    color: 'bg-purple-500',
    features: ['AI توقعات', 'اكتشاف الشذوذ', 'توصيات ذكية']
  },
  {
    title: 'الجداول المتقدمة',
    description: 'جداول بيانات قابلة للتخصيص مع إمكانيات التصدير والتعديل',
    icon: Table,
    href: '/dashboard/admin/data-tables',
    color: 'bg-indigo-500',
    features: ['تعديل مباشر', 'Drag & Drop', 'تصدير متعدد']
  },
  {
    title: 'مركز الإشعارات',
    description: 'نظام إشعارات شامل مع تنبيهات مباشرة وفلاتر ذكية',
    icon: Bell,
    href: '/dashboard/admin/notifications',
    color: 'bg-yellow-500',
    features: ['إشعارات صوتية', 'فلاتر ذكية', 'سجل شامل']
  },
  {
    title: 'إدارة الملفات والوسائط',
    description: 'معرض متطور لرفع وإدارة الملفات مع drag & drop',
    icon: Upload,
    href: '/dashboard/admin/files',
    color: 'bg-cyan-500',
    features: ['Drag & Drop', 'معاينة متقدمة', 'إدارة شاملة']
  },
  {
    title: 'سجل النشاطات',
    description: 'سجل شامل للنشاطات مع timeline تفاعلي وفلاتر',
    icon: Clock,
    href: '/dashboard/admin/activity',
    color: 'bg-pink-500',
    features: ['Timeline تفاعلي', 'فلاتر متقدمة', 'تتبع شامل']
  },
  {
    title: 'دعم متعدد اللغات',
    description: 'نظام شامل لإدارة اللغات والترجمات مع دعم RTL/LTR',
    icon: Globe,
    href: '/dashboard/admin/languages',
    color: 'bg-emerald-500',
    features: ['RTL/LTR', 'إدارة ترجمات', 'تصدير/استيراد']
  },
  {
    title: 'مراقبة الأداء',
    description: 'مراقبة شاملة لأداء النظام مع مقاييس متقدمة',
    icon: Gauge,
    href: '/dashboard/admin/performance',
    color: 'bg-orange-500',
    features: ['Core Web Vitals', 'موارد النظام', 'جلسات المستخدمين']
  },
  {
    title: 'إعدادات الثيمات',
    description: 'تخصيص مظهر لوحة التحكم مع دعم الوضع الليلي والنهاري',
    icon: Palette,
    href: '/dashboard/admin/themes',
    color: 'bg-red-500',
    features: ['وضع ليلي/نهاري', 'معاينة مباشرة', 'ألوان مخصصة']
  }
]

export default function AdminIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-stone-900 mb-4">
              🎉 لوحة التحكم الإدارية المتطورة
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              نظام إداري شامل ومتطور مع أحدث التقنيات والمميزات لإدارة فعالة وذكية
            </p>
          </motion.div>
          
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm">
              ✨ 10 مكونات متطورة
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 text-sm">
              🚀 Next.js 15 + TypeScript
            </Badge>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm">
              🎨 Framer Motion + Tailwind
            </Badge>
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {adminComponents.map((component, index) => {
            const IconComponent = component.icon
            
            return (
              <motion.div
                key={component.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={component.href}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-xl ${component.color} group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-stone-900 group-hover:text-blue-600 transition-colors">
                            {component.title}
                          </CardTitle>
                        </div>
                        <ExternalLink className="w-5 h-5 text-stone-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        {component.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {component.features.map(feature => (
                          <Badge 
                            key={feature} 
                            variant="secondary" 
                            className="text-xs px-2 py-1 bg-stone-100 text-stone-700"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                        <span>استكشف المكون</span>
                        <ArrowRight className="w-4 h-4 mr-2 group-hover:transtone-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-stone-900 mb-6 text-center">
            🔗 روابط سريعة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {adminComponents.slice(0, 5).map(component => (
              <Link 
                key={component.href}
                href={component.href}
                className="p-4 rounded-lg border border-stone-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
              >
                <component.icon className="w-8 h-8 mx-auto mb-2 text-stone-600 group-hover:text-blue-600" />
                <div className="text-sm font-medium text-stone-700 group-hover:text-blue-700">
                  {component.title.split(' ')[0]}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
        
        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12 text-stone-500"
        >
          <p className="mb-2">🌟 تم بناؤها بأحدث التقنيات لتجربة إدارية متطورة</p>
          <p className="text-sm">React 18 • Next.js 15 • TypeScript • Tailwind CSS • Framer Motion • Recharts</p>
        </motion.div>
      </div>
    </div>
  )
}
