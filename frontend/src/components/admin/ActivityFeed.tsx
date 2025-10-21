'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Clock, User, ShoppingCart, Package, Star,
  MessageSquare, AlertCircle, CheckCircle, XCircle,
  Settings, Shield, CreditCard, Truck, Eye,
  Search, Filter, Calendar, MapPin, TrendingUp,
  Bell, Mail, Phone, Globe, Edit, Trash2,
  MoreHorizontal, ChevronDown, ChevronRight,
  UserPlus, LogIn, LogOut, Upload, Download,
  Zap, Target, Award, Bookmark, Share,
  FileText, Image, Video, Music, Archive,
  Heart, ThumbsUp, MessageCircle, Repeat, RefreshCw
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'user' | 'order' | 'product' | 'system' | 'notification' | 'payment' | 'review' | 'message'
  action: string
  description: string
  user: {
    name: string
    avatar?: string
    role: string
  }
  timestamp: string
  metadata: {
    target?: string
    location?: string
    amount?: number
    rating?: number
    status?: string
    category?: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    tags?: string[]
  }
  relatedItems?: {
    type: string
    name: string
    id: string
  }[]
  reactions?: {
    type: 'like' | 'love' | 'important' | 'follow'
    count: number
    users: string[]
  }[]
  isRead?: boolean
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'order',
    action: 'new_order',
    description: 'تم إنشاء طلب جديد بقيمة 250 ريال',
    user: {
      name: 'أحمد محمد',
      avatar: '/avatars/ahmed.jpg',
      role: 'عميل'
    },
    timestamp: '2024-01-20T14:30:00Z',
    metadata: {
      target: 'طلب رقم #12345',
      amount: 250,
      status: 'pending',
      location: 'الرياض، المملكة العربية السعودية',
      priority: 'medium',
      tags: ['طلب جديد', 'دفع نقدي']
    },
    relatedItems: [
      { type: 'product', name: 'هاتف ذكي', id: 'prod_123' },
      { type: 'shop', name: 'متجر التقنية', id: 'shop_456' }
    ],
    reactions: [
      { type: 'like', count: 3, users: ['محمد أحمد', 'فاطمة علي'] },
      { type: 'important', count: 1, users: ['المدير العام'] }
    ],
    isRead: false
  },
  {
    id: '2',
    type: 'user',
    action: 'registration',
    description: 'مستخدم جديد قام بالتسجيل في المنصة',
    user: {
      name: 'سارة أحمد',
      avatar: '/avatars/sara.jpg',
      role: 'عميل جديد'
    },
    timestamp: '2024-01-20T13:45:00Z',
    metadata: {
      location: 'جدة، المملكة العربية السعودية',
      status: 'active',
      priority: 'low',
      tags: ['مستخدم جديد', 'تسجيل']
    },
    reactions: [
      { type: 'like', count: 5, users: ['فريق الدعم'] }
    ],
    isRead: true
  },
  {
    id: '3',
    type: 'product',
    action: 'review',
    description: 'تقييم جديد بـ 5 نجوم على منتج',
    user: {
      name: 'محمد القاضي',
      avatar: '/avatars/mohammed.jpg',
      role: 'عميل'
    },
    timestamp: '2024-01-20T12:15:00Z',
    metadata: {
      target: 'ساعة ذكية',
      rating: 5,
      status: 'approved',
      priority: 'low',
      tags: ['تقييم', '5 نجوم']
    },
    relatedItems: [
      { type: 'product', name: 'ساعة ذكية', id: 'prod_789' },
      { type: 'order', name: 'طلب #12340', id: 'order_990' }
    ],
    reactions: [
      { type: 'love', count: 8, users: ['المتجر', 'العملاء'] }
    ],
    isRead: true
  },
  {
    id: '4',
    type: 'payment',
    action: 'payment_completed',
    description: 'تم إكمال عملية دفع بنجاح',
    user: {
      name: 'فاطمة علي',
      avatar: '/avatars/fatima.jpg',
      role: 'عميل'
    },
    timestamp: '2024-01-20T11:30:00Z',
    metadata: {
      amount: 450,
      status: 'completed',
      priority: 'medium',
      tags: ['دفع مكتمل', 'بطاقة ائتمان']
    },
    isRead: true
  },
  {
    id: '5',
    type: 'system',
    action: 'maintenance',
    description: 'تم إجراء صيانة للنظام بنجاح',
    user: {
      name: 'النظام',
      role: 'system'
    },
    timestamp: '2024-01-20T10:00:00Z',
    metadata: {
      status: 'completed',
      priority: 'high',
      tags: ['صيانة', 'نظام']
    },
    isRead: true
  },
  {
    id: '6',
    type: 'notification',
    action: 'promotion_sent',
    description: 'تم إرسال حملة ترويجية إلى 1000 مستخدم',
    user: {
      name: 'فريق التسويق',
      role: 'marketing'
    },
    timestamp: '2024-01-20T09:15:00Z',
    metadata: {
      target: '1000 مستخدم',
      status: 'sent',
      priority: 'medium',
      category: 'marketing',
      tags: ['ترويج', 'حملة إعلانية']
    },
    reactions: [
      { type: 'important', count: 2, users: ['مدير التسويق'] }
    ],
    isRead: true
  },
  {
    id: '7',
    type: 'message',
    action: 'support_ticket',
    description: 'تذكرة دعم فني جديدة',
    user: {
      name: 'عمر حسن',
      avatar: '/avatars/omar.jpg',
      role: 'عميل'
    },
    timestamp: '2024-01-20T08:45:00Z',
    metadata: {
      target: 'مشكلة في الدفع',
      status: 'open',
      priority: 'high',
      tags: ['دعم فني', 'عاجل']
    },
    isRead: false
  }
]

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities)
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>(mockActivities)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: ['user', 'order', 'product', 'system', 'notification'][Math.floor(Math.random() * 5)] as any,
        action: 'live_update',
        description: 'نشاط جديد تم إضافته تلقائياً',
        user: {
          name: 'نظام المراقبة',
          role: 'system'
        },
        timestamp: new Date().toISOString(),
        metadata: {
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'active',
          tags: ['تحديث مباشر']
        },
        isRead: false
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 49)]) // Keep last 50 activities
    }, 30000) // Add new activity every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = activities

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(activity => activity.metadata.priority === filterPriority)
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filterDate) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= cutoffDate
      )
    }

    setFilteredActivities(filtered)
  }, [activities, searchTerm, filterType, filterPriority, filterDate])

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'user':
        return action === 'registration' ? UserPlus : User
      case 'order':
        return ShoppingCart
      case 'product':
        return Package
      case 'payment':
        return CreditCard
      case 'system':
        return Settings
      case 'notification':
        return Bell
      case 'message':
        return MessageSquare
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string, priority?: string) => {
    if (priority === 'critical') return 'text-red-600 bg-red-100'
    if (priority === 'high') return 'text-orange-600 bg-orange-100'
    if (priority === 'medium') return 'text-blue-600 bg-blue-100'
    
    switch (type) {
      case 'user': return 'text-green-600 bg-green-100'
      case 'order': return 'text-purple-600 bg-purple-100'
      case 'product': return 'text-indigo-600 bg-indigo-100'
      case 'payment': return 'text-emerald-600 bg-emerald-100'
      case 'system': return 'text-stone-600 bg-stone-100'
      case 'notification': return 'text-yellow-600 bg-yellow-100'
      case 'message': return 'text-pink-600 bg-pink-100'
      default: return 'text-stone-600 bg-stone-100'
    }
  }

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-500 text-white">عاجل جداً</Badge>
      case 'high':
        return <Badge className="bg-orange-500 text-white">عاجل</Badge>
      case 'medium':
        return <Badge className="bg-blue-500 text-white">متوسط</Badge>
      case 'low':
        return <Badge variant="outline" className="text-stone-600">منخفض</Badge>
      default:
        return null
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`
    
    return time.toLocaleDateString('ar-EG')
  }

  const toggleExpanded = (activityId: string) => {
    setExpandedItems(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const markAsRead = (activityId: string) => {
    setActivities(prev =>
      prev.map(activity =>
        activity.id === activityId ? { ...activity, isRead: true } : activity
      )
    )
  }

  const addReaction = (activityId: string, reactionType: 'like' | 'love' | 'important' | 'follow') => {
    setActivities(prev =>
      prev.map(activity => {
        if (activity.id !== activityId) return activity

        const existingReactionIndex = activity.reactions?.findIndex(r => r.type === reactionType)
        const updatedReactions = [...(activity.reactions || [])]

        if (existingReactionIndex !== -1 && existingReactionIndex !== undefined) {
          updatedReactions[existingReactionIndex].count += 1
        } else {
          updatedReactions.push({
            type: reactionType,
            count: 1,
            users: ['أنت']
          })
        }

        return { ...activity, reactions: updatedReactions }
      })
    )
  }

  const unreadCount = activities.filter(activity => !activity.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">سجل النشاطات</h2>
            <p className="text-sm text-stone-600">
              {filteredActivities.length.toLocaleString()} نشاط
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {unreadCount} غير مقروء
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="البحث في النشاطات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-500" />
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأنواع</SelectItem>
                  <SelectItem value="user">المستخدمين</SelectItem>
                  <SelectItem value="order">الطلبات</SelectItem>
                  <SelectItem value="product">المنتجات</SelectItem>
                  <SelectItem value="payment">المدفوعات</SelectItem>
                  <SelectItem value="system">النظام</SelectItem>
                  <SelectItem value="notification">الإشعارات</SelectItem>
                  <SelectItem value="message">الرسائل</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأولويات</SelectItem>
                  <SelectItem value="critical">عاجل جداً</SelectItem>
                  <SelectItem value="high">عاجل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الأوقات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Activity className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-600 mb-2">لا توجد نشاطات</h3>
              <p className="text-stone-500">لم يتم العثور على نشاطات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-stone-200" />

            <AnimatePresence>
              {filteredActivities.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type, activity.action)
                const isExpanded = expandedItems.includes(activity.id)
                const colorClass = getActivityColor(activity.type, activity.metadata.priority)

                return (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className={`
                      absolute right-2 w-6 h-6 rounded-full flex items-center justify-center z-10
                      ${colorClass} border-2 border-white
                    `}>
                      <IconComponent className="w-3 h-3" />
                    </div>

                    {/* Activity Card */}
                    <Card className={`
                      mr-12 mb-4 transition-all hover:shadow-lg
                      ${!activity.isRead ? 'border-blue-200 bg-blue-50/30' : ''}
                    `}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* User Avatar */}
                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                              {activity.user.avatar ? (
                                <img 
                                  src={activity.user.avatar} 
                                  alt={activity.user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-stone-500" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-stone-900">
                                  {activity.user.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {activity.user.role}
                                </Badge>
                                {getPriorityBadge(activity.metadata.priority)}
                                {!activity.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                              
                              <p className="text-stone-700 mb-2">{activity.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-stone-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(activity.timestamp)}
                                </div>
                                
                                {activity.metadata.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {activity.metadata.location}
                                  </div>
                                )}

                                {activity.metadata.amount && (
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    {activity.metadata.amount.toLocaleString()} ريال
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {activity.metadata.tags && activity.metadata.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {activity.metadata.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 pt-4 border-t border-stone-200"
                                  >
                                    {/* Related Items */}
                                    {activity.relatedItems && activity.relatedItems.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="text-sm font-medium text-stone-700 mb-2">العناصر المرتبطة:</h4>
                                        <div className="space-y-1">
                                          {activity.relatedItems.map(item => (
                                            <div key={item.id} className="flex items-center gap-2 text-sm">
                                              <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                              <span>{item.name}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Additional Metadata */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      {activity.metadata.status && (
                                        <div>
                                          <span className="text-stone-500">الحالة: </span>
                                          <span className="font-medium">{activity.metadata.status}</span>
                                        </div>
                                      )}
                                      {activity.metadata.category && (
                                        <div>
                                          <span className="text-stone-500">التصنيف: </span>
                                          <span className="font-medium">{activity.metadata.category}</span>
                                        </div>
                                      )}
                                      {activity.metadata.rating && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-stone-500">التقييم: </span>
                                          <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={`w-4 h-4 ${
                                                  i < activity.metadata.rating! 
                                                    ? 'text-yellow-400 fill-current' 
                                                    : 'text-stone-300'
                                                }`} 
                                              />
                                            ))}
                                            <span className="ml-1">{activity.metadata.rating}/5</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Reactions */}
                              {activity.reactions && activity.reactions.length > 0 && (
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
                                  {activity.reactions.map(reaction => (
                                    <div key={reaction.type} className="flex items-center gap-1 text-sm text-stone-600">
                                      {reaction.type === 'like' && <ThumbsUp className="w-4 h-4" />}
                                      {reaction.type === 'love' && <Heart className="w-4 h-4 text-red-500" />}
                                      {reaction.type === 'important' && <Star className="w-4 h-4 text-yellow-500" />}
                                      {reaction.type === 'follow' && <Bookmark className="w-4 h-4 text-blue-500" />}
                                      <span>{reaction.count}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {!activity.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(activity.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpanded(activity.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? 
                                <ChevronDown className="w-3 h-3" /> : 
                                <ChevronRight className="w-3 h-3" />
                              }
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => addReaction(activity.id, 'like')}
                          >
                            <ThumbsUp className="w-3 h-3 ml-1" />
                            إعجاب
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => addReaction(activity.id, 'important')}
                          >
                            <Star className="w-3 h-3 ml-1" />
                            مهم
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                          >
                            <Share className="w-3 h-3 ml-1" />
                            مشاركة
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                          >
                            <MessageCircle className="w-3 h-3 ml-1" />
                            تعليق
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {filteredActivities.length > 0 && (
          <div className="text-center">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحميل المزيد
            </Button>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">تفاصيل النشاط</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Main Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                    {selectedActivity.user.avatar ? (
                      <img 
                        src={selectedActivity.user.avatar} 
                        alt={selectedActivity.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-stone-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-medium">{selectedActivity.user.name}</h4>
                      <Badge variant="outline">{selectedActivity.user.role}</Badge>
                      {getPriorityBadge(selectedActivity.metadata.priority)}
                    </div>
                    <p className="text-stone-700 mb-2">{selectedActivity.description}</p>
                    <div className="text-sm text-stone-500">
                      {new Date(selectedActivity.timestamp).toLocaleString('ar-EG')}
                    </div>
                  </div>
                </div>

                {/* Detailed Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-lg">
                  <div>
                    <span className="text-sm text-stone-500 block">النوع</span>
                    <span className="font-medium">{selectedActivity.type}</span>
                  </div>
                  <div>
                    <span className="text-sm text-stone-500 block">الإجراء</span>
                    <span className="font-medium">{selectedActivity.action}</span>
                  </div>
                  {selectedActivity.metadata.target && (
                    <div>
                      <span className="text-sm text-stone-500 block">الهدف</span>
                      <span className="font-medium">{selectedActivity.metadata.target}</span>
                    </div>
                  )}
                  {selectedActivity.metadata.status && (
                    <div>
                      <span className="text-sm text-stone-500 block">الحالة</span>
                      <span className="font-medium">{selectedActivity.metadata.status}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button variant="outline">
                    <Share className="w-4 h-4 ml-2" />
                    مشاركة
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    تصدير
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
