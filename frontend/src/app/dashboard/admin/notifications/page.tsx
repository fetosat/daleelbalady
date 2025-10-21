'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, Bell, Send, Users, MessageSquare, 
  AlertTriangle, CheckCircle, Clock, Eye, Plus, Filter, Search, 
  Calendar, UserCheck, Store, Settings, Trash2, Edit
} from 'lucide-react'

export default function AdminNotificationsPage() {
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    audience: 'all',
    scheduledAt: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [realtimeStats, setRealtimeStats] = useState({
    totalSent: 3014,
    readRate: 80.5,
    clicks: 765,
    scheduled: 12
  })

  // Simulate real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        totalSent: prev.totalSent + Math.floor(Math.random() * 3),
        readRate: Math.min(100, prev.readRate + (Math.random() - 0.5) * 2),
        clicks: prev.clicks + Math.floor(Math.random() * 2),
        scheduled: prev.scheduled + (Math.random() > 0.8 ? 1 : 0)
      }))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const mockNotifications = [
    {
      id: 1,
      title: 'عرض جديد على المنتجات الإلكترونية',
      message: 'خصم 20% على جميع المنتجات الإلكترونية لفترة محدودة',
      type: 'promotion',
      targetAudience: 'customers',
      sentAt: '2024-01-15T14:30:00',
      status: 'sent',
      readCount: 234,
      totalSent: 892
    },
    {
      id: 2,
      title: 'تحديث في سياسة المتاجر',
      message: 'تم تحديث سياسة التسجيل للمتاجر الجديدة',
      type: 'update',
      targetAudience: 'shop_owners',
      sentAt: '2024-01-14T10:15:00',
      status: 'sent',
      readCount: 45,
      totalSent: 89
    },
    {
      id: 3,
      title: 'صيانة مجدولة للنظام',
      message: 'سيتم إجراء صيانة للنظام يوم الجمعة من الساعة 2-4 صباحاً',
      type: 'maintenance',
      targetAudience: 'all',
      sentAt: '2024-01-13T16:45:00',
      status: 'sent',
      readCount: 1150,
      totalSent: 1247
    }
  ]

  const getTypeColor = (type: string) => {
    const colors = {
      'info': 'bg-blue-100 text-blue-800',
      'promotion': 'bg-green-100 text-green-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'warning': 'bg-red-100 text-red-800'
    }
    return colors[type] || colors['info']
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'info': 'معلومات',
      'promotion': 'عرض',
      'update': 'تحديث',
      'maintenance': 'صيانة',
      'warning': 'تحذير'
    }
    return labels[type] || 'معلومات'
  }

  const getAudienceLabel = (audience: string) => {
    const labels = {
      'all': 'جميع المستخدمين',
      'customers': 'العملاء',
      'shop_owners': 'أصحاب المتاجر',
      'providers': 'مقدمي الخدمات',
      'delivery': 'مندوبي التوصيل'
    }
    return labels[audience] || 'جميع المستخدمين'
  }

  const handleSendNotification = async () => {
    setIsLoading(true)
    try {
      console.log('Sending notification:', newNotification)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset form
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        audience: 'all',
        scheduledAt: ''
      })
      
      // Show success message (you can replace with toast)
      console.log('تم إرسال الإشعار بنجاح!')
    } catch (error) {
      console.error('Error sending notification:', error)
    } finally {
      setIsLoading(false)
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
                <Bell className="w-6 h-6 text-indigo-600" />
                إدارة الإشعارات
              </h1>
              <p className="text-stone-600">إرسال وإدارة الإشعارات والتواصل مع المستخدمين</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 ml-2" />
              إعدادات الإشعارات
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">إجمالي المرسلة</p>
                    <motion.p 
                      className="text-2xl font-bold text-blue-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      key={realtimeStats.totalSent}
                    >
                      {realtimeStats.totalSent.toLocaleString()}
                    </motion.p>
                  </div>
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">معدل القراءة</p>
                    <motion.p 
                      className="text-2xl font-bold text-green-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      key={realtimeStats.readRate}
                    >
                      {realtimeStats.readRate.toFixed(1)}%
                    </motion.p>
                  </div>
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">النقرات</p>
                  <p className="text-2xl font-bold text-purple-700">765</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">مجدولة</p>
                  <p className="text-2xl font-bold text-orange-700">12</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              إرسال جديد
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              سجل الإشعارات
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              المجدولة
            </TabsTrigger>
          </TabsList>

          {/* Send New Notification Tab */}
          <TabsContent value="send" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send New Notification */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  إشعار جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    عنوان الإشعار
                  </label>
                  <Input
                    placeholder="عنوان الإشعار"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    نص الإشعار
                  </label>
                  <Textarea
                    placeholder="محتوى الإشعار..."
                    rows={4}
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    نوع الإشعار
                  </label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">معلومات</SelectItem>
                      <SelectItem value="promotion">عرض</SelectItem>
                      <SelectItem value="update">تحديث</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="warning">تحذير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    الجمهور المستهدف
                  </label>
                  <Select
                    value={newNotification.audience}
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, audience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="customers">العملاء</SelectItem>
                      <SelectItem value="shop_owners">أصحاب المتاجر</SelectItem>
                      <SelectItem value="providers">مقدمي الخدمات</SelectItem>
                      <SelectItem value="delivery">مندوبي التوصيل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSendNotification}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                  disabled={!newNotification.title || !newNotification.message || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الإرسال...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-2" />
                      إرسال الإشعار
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notifications History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>الإشعارات المرسلة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-stone-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-stone-600 text-sm mb-2">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(notification.type)}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-3 h-3 ml-1" />
                            عرض
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-stone-500">
                        <div className="flex items-center gap-4">
                          <span>الجمهور: {getAudienceLabel(notification.targetAudience)}</span>
                          <span>تم الإرسال: {new Date(notification.sentAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{notification.readCount} / {notification.totalSent} قرأوا</span>
                        </div>
                      </div>
                      
                      {/* Progress bar for read rate */}
                      <div className="mt-2">
                        <div className="w-full bg-stone-200 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full" 
                            style={{ width: `${(notification.readCount / notification.totalSent) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    سجل الإشعارات المرسلة
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                      <Input 
                        placeholder="بحث في الإشعارات..." 
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع</SelectItem>
                        <SelectItem value="success">ناجح</SelectItem>
                        <SelectItem value="info">معلومات</SelectItem>
                        <SelectItem value="warning">تحذير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.filter(n => n.sentAt && n.status !== 'scheduled').map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-stone-900">
                              {notification.title}
                            </h3>
                            <Badge className={getTypeColor(notification.type)}>
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                          <p className="text-stone-600 text-sm mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-stone-500">
                            <span>الجمهور: {getAudienceLabel(notification.targetAudience)}</span>
                            <span>تاريخ الإرسال: {new Date(notification.sentAt).toLocaleDateString('ar-EG')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="text-blue-600">
                            <Eye className="w-3 h-3 ml-1" />
                            عرض
                          </Button>
                          <Button size="sm" variant="ghost" className="text-stone-600">
                            <Edit className="w-3 h-3 ml-1" />
                            تعديل
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">{notification.totalSent}</div>
                          <div className="text-xs text-blue-600">مرسلة</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{notification.readCount}</div>
                          <div className="text-xs text-green-600">مقروءة</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-purple-600">{Math.round((notification.readCount / notification.totalSent) * 100)}%</div>
                          <div className="text-xs text-purple-600">معدل فتح</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Progress value={(notification.readCount / notification.totalSent) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Tab */}
          <TabsContent value="scheduled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  الإشعارات المجدولة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.filter(n => n.status === 'scheduled').map((notification) => (
                    <div key={notification.id} className="border-2 border-dashed border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-stone-900">
                              {notification.title}
                            </h3>
                            <Badge className="bg-orange-100 text-orange-800">
                              مجدولة
                            </Badge>
                          </div>
                          <p className="text-stone-600 text-sm mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-stone-500">
                            <span>تاريخ الإرسال: {notification.sentAt ? new Date(notification.sentAt).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                            <span>الجمهور: {getAudienceLabel(notification.targetAudience)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                            <Send className="w-3 h-3 ml-1" />
                            إرسال فوري
                          </Button>
                          <Button size="sm" variant="ghost" className="text-stone-600">
                            <Edit className="w-3 h-3 ml-1" />
                            تعديل
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-3 h-3 ml-1" />
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {mockNotifications.filter(n => n.status === 'scheduled').length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-stone-600 mb-2">لا توجد إشعارات مجدولة</h3>
                      <p className="text-stone-500">قم بجدولة إشعاراتك لإرسالها في وقت لاحق</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
