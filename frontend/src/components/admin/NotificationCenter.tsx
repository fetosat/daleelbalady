'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellRing, Volume2, VolumeX, Settings, Filter,
  Check, CheckCheck, Trash2, Star, Clock, User,
  ShoppingCart, AlertTriangle, Info, CheckCircle,
  X, Search, Calendar, Archive, Bookmark, Share,
  Eye, EyeOff, Loader2, Zap, MessageSquare, Mail
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info' | 'order' | 'user' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: string
  read: boolean
  starred: boolean
  archived: boolean
  category: string
  actionUrl?: string
  userId?: string
  metadata?: any
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  push: boolean
  categories: Record<string, boolean>
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'طلب جديد تم إنشاؤه',
    message: 'طلب جديد #12345 من أحمد محمد بقيمة 850 جنيه',
    type: 'order',
    priority: 'high',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    archived: false,
    category: 'orders',
    userId: 'user123'
  },
  {
    id: '2',
    title: 'مستخدم جديد انضم',
    message: 'المستخدم فاطمة علي انضم للمنصة الآن',
    type: 'user',
    priority: 'medium',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    starred: true,
    archived: false,
    category: 'users',
    userId: 'user456'
  },
  {
    id: '3',
    title: 'تحذير: انخفاض المخزون',
    message: 'المنتج "جهاز كمبيوتر محمول" وصل لأقل من 5 قطع',
    type: 'warning',
    priority: 'urgent',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: true,
    starred: false,
    archived: false,
    category: 'inventory'
  },
  {
    id: '4',
    title: 'دفعة تم استلامها',
    message: 'تم استلام دفعة 1,250 جنيه من العميل محمد القاضي',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    starred: false,
    archived: false,
    category: 'payments'
  },
  {
    id: '5',
    title: 'تحديث النظام متاح',
    message: 'إصدار جديد من النظام متوفر للتحديث',
    type: 'system',
    priority: 'low',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    starred: false,
    archived: false,
    category: 'system'
  }
]

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    push: true,
    categories: {
      orders: true,
      users: true,
      payments: true,
      inventory: true,
      system: false
    }
  })
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isListening, setIsListening] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  // Simulate real-time notifications
  useEffect(() => {
    if (!settings.enabled) return

    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.85
      if (!shouldAddNotification) return

      const newNotification: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title: getRandomNotificationTitle(),
        message: getRandomNotificationMessage(),
        type: getRandomNotificationType(),
        priority: getRandomPriority(),
        timestamp: new Date().toISOString(),
        read: false,
        starred: false,
        archived: false,
        category: getRandomCategory()
      }

      setNotifications(prev => [newNotification, ...prev.slice(0, 49)])
      
      // Play sound if enabled
      if (settings.sound) {
        playNotificationSound()
      }

      // Show desktop notification if enabled
      if (settings.desktop && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico'
          })
        }
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [settings])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && settings.desktop) {
      Notification.requestPermission()
    }
  }, [settings.desktop])

  const getRandomNotificationTitle = () => {
    const titles = [
      'طلب جديد تم إنشاؤه',
      'مستخدم جديد انضم',
      'دفعة تم استلامها',
      'تقييم جديد',
      'رسالة دعم جديدة',
      'تحديث المخزون'
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  const getRandomNotificationMessage = () => {
    const messages = [
      'طلب جديد بقيمة 750 جنيه',
      'انضم مستخدم جديد للمنصة',
      'تم استلام دفعة مالية',
      'تقييم 5 نجوم لمنتج',
      'رسالة دعم جديدة من العميل',
      'تم تحديث معلومات المنتج'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getRandomNotificationType = (): Notification['type'] => {
    const types: Notification['type'][] = ['success', 'info', 'order', 'user', 'warning']
    return types[Math.floor(Math.random() * types.length)]
  }

  const getRandomPriority = (): Notification['priority'] => {
    const priorities: Notification['priority'][] = ['low', 'medium', 'high']
    return priorities[Math.floor(Math.random() * priorities.length)]
  }

  const getRandomCategory = () => {
    const categories = ['orders', 'users', 'payments', 'inventory', 'system']
    return categories[Math.floor(Math.random() * categories.length)]
  }

  const playNotificationSound = () => {
    // Create audio context and play notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'warning': return AlertTriangle
      case 'error': return X
      case 'info': return Info
      case 'order': return ShoppingCart
      case 'user': return User
      case 'system': return Settings
      default: return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'info': return 'text-blue-500'
      case 'order': return 'text-purple-500'
      case 'user': return 'text-indigo-500'
      case 'system': return 'text-stone-500'
      default: return 'text-stone-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-stone-100 text-stone-800 border-stone-200'
      default: return 'bg-stone-100 text-stone-800 border-stone-200'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'starred' && notification.starred) ||
      (filter === 'archived' && notification.archived)
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter
    
    return matchesFilter && matchesCategory
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const toggleStar = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, starred: !n.starred } : n
    ))
  }

  const archiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, archived: true } : n
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const bulkAction = (action: 'read' | 'star' | 'archive' | 'delete') => {
    switch (action) {
      case 'read':
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, read: true } : n
        ))
        break
      case 'star':
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, starred: !n.starred } : n
        ))
        break
      case 'archive':
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n.id) ? { ...n, archived: true } : n
        ))
        break
      case 'delete':
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)))
        break
    }
    setSelectedNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">مركز الإشعارات</h2>
            <p className="text-sm text-stone-600">
              {unreadCount} إشعار غير مقروء من أصل {notifications.length}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            مباشر
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettings({ ...settings, sound: !settings.sound })}
          >
            {settings.sound ? (
              <Volume2 className="w-4 h-4 ml-1" />
            ) : (
              <VolumeX className="w-4 h-4 ml-1" />
            )}
            الصوت
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 ml-1" />
            قراءة الكل
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-4 w-96">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              الكل ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-1">
              <BellRing className="w-3 h-3" />
              غير مقروء ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              مميز ({notifications.filter(n => n.starred).length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-1">
              <Archive className="w-3 h-3" />
              المؤرشف ({notifications.filter(n => n.archived).length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                <SelectItem value="orders">الطلبات</SelectItem>
                <SelectItem value="users">المستخدمين</SelectItem>
                <SelectItem value="payments">المدفوعات</SelectItem>
                <SelectItem value="inventory">المخزون</SelectItem>
                <SelectItem value="system">النظام</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedNotifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedNotifications.length} إشعار محدد
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => bulkAction('read')}>
                    <Check className="w-3 h-3 ml-1" />
                    قراءة
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkAction('star')}>
                    <Star className="w-3 h-3 ml-1" />
                    تمييز
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkAction('archive')}>
                    <Archive className="w-3 h-3 ml-1" />
                    أرشفة
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => bulkAction('delete')}>
                    <Trash2 className="w-3 h-3 ml-1" />
                    حذف
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedNotifications([])}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <TabsContent value={filter} className="mt-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => {
                const IconComponent = getNotificationIcon(notification.type)
                const isSelected = selectedNotifications.includes(notification.id)
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-4 border rounded-lg transition-all cursor-pointer
                      ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-stone-200'}
                      ${isSelected ? 'ring-2 ring-blue-300' : ''}
                      hover:shadow-md
                    `}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id)
                      setSelectedNotifications(prev => 
                        prev.includes(notification.id) 
                          ? prev.filter(id => id !== notification.id)
                          : [...prev, notification.id]
                      )
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white ${getNotificationColor(notification.type)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium text-stone-900 truncate">
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-2" />
                            )}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority === 'urgent' ? 'عاجل' : 
                               notification.priority === 'high' ? 'عالي' : 
                               notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            <span className="text-xs text-stone-500">
                              {new Date(notification.timestamp).toLocaleString('ar-EG')}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-stone-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {notification.category === 'orders' ? 'الطلبات' :
                             notification.category === 'users' ? 'المستخدمين' :
                             notification.category === 'payments' ? 'المدفوعات' :
                             notification.category === 'inventory' ? 'المخزون' :
                             notification.category === 'system' ? 'النظام' : notification.category}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleStar(notification.id)
                              }}
                            >
                              <Star className={`w-3 h-3 ${notification.starred ? 'text-yellow-500 fill-current' : 'text-stone-400'}`} />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                archiveNotification(notification.id)
                              }}
                            >
                              <Archive className="w-3 h-3 text-stone-400" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-600 mb-2">
                  لا توجد إشعارات
                </h3>
                <p className="text-stone-500">
                  {filter === 'unread' ? 'جميع الإشعارات مقروءة' :
                   filter === 'starred' ? 'لا توجد إشعارات مميزة' :
                   filter === 'archived' ? 'لا توجد إشعارات مؤرشفة' :
                   'لا توجد إشعارات بعد'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-stone-600" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-stone-900">الإعدادات العامة</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">تفعيل الإشعارات</label>
                  <p className="text-xs text-stone-500">تشغيل/إيقاف جميع الإشعارات</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">الأصوات</label>
                  <p className="text-xs text-stone-500">تشغيل صوت عند وصول الإشعارات</p>
                </div>
                <Switch
                  checked={settings.sound}
                  onCheckedChange={(checked) => setSettings({ ...settings, sound: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">إشعارات سطح المكتب</label>
                  <p className="text-xs text-stone-500">إظهار إشعارات في نظام التشغيل</p>
                </div>
                <Switch
                  checked={settings.desktop}
                  onCheckedChange={(checked) => setSettings({ ...settings, desktop: checked })}
                />
              </div>
            </div>

            {/* Category Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-stone-900">فئات الإشعارات</h4>
              
              {Object.entries(settings.categories).map(([category, enabled]) => (
                <div key={category} className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {category === 'orders' ? 'الطلبات' :
                     category === 'users' ? 'المستخدمين' :
                     category === 'payments' ? 'المدفوعات' :
                     category === 'inventory' ? 'المخزون' :
                     category === 'system' ? 'النظام' : category}
                  </label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        categories: { ...settings.categories, [category]: checked }
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
