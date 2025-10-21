'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Users, ShoppingCart, DollarSign, TrendingUp,
  Clock, Wifi, Bell, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react'

interface RealTimeData {
  onlineUsers: number
  activeOrders: number
  todayRevenue: number
  newRegistrations: number
  serverStatus: 'online' | 'warning' | 'offline'
  lastUpdate: string
  activities: Activity[]
}

interface Activity {
  id: string
  type: 'order' | 'user' | 'payment' | 'system'
  message: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
  amount?: number
}

export default function RealTimeDashboard() {
  const [realtimeData, setRealtimeData] = useState<RealTimeData>({
    onlineUsers: 234,
    activeOrders: 45,
    todayRevenue: 28750,
    newRegistrations: 12,
    serverStatus: 'online',
    lastUpdate: new Date().toLocaleTimeString('ar-EG'),
    activities: []
  })

  const [isConnected, setIsConnected] = useState(true)
  const [newActivitiesCount, setNewActivitiesCount] = useState(0)

  // Simulate WebSocket connection
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random data changes
      const newActivity: Activity = generateRandomActivity()
      
      setRealtimeData(prev => ({
        ...prev,
        onlineUsers: Math.max(100, prev.onlineUsers + Math.floor(Math.random() * 20) - 10),
        activeOrders: Math.max(0, prev.activeOrders + Math.floor(Math.random() * 6) - 3),
        todayRevenue: prev.todayRevenue + Math.floor(Math.random() * 500),
        newRegistrations: prev.newRegistrations + (Math.random() > 0.7 ? 1 : 0),
        serverStatus: Math.random() > 0.95 ? 'warning' : 'online',
        lastUpdate: new Date().toLocaleTimeString('ar-EG'),
        activities: [newActivity, ...prev.activities.slice(0, 9)] // Keep only last 10 activities
      }))

      setNewActivitiesCount(count => count + 1)
      
      // Simulate connection issues occasionally
      if (Math.random() > 0.98) {
        setIsConnected(false)
        setTimeout(() => setIsConnected(true), 3000)
      }
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const generateRandomActivity = (): Activity => {
    const activities = [
      { type: 'order' as const, message: 'طلب جديد من أحمد محمد', status: 'success' as const, amount: Math.floor(Math.random() * 500) + 50 },
      { type: 'user' as const, message: 'مستخدم جديد انضم للمنصة', status: 'success' as const },
      { type: 'payment' as const, message: 'دفعة تم تأكيدها', status: 'success' as const, amount: Math.floor(Math.random() * 1000) + 100 },
      { type: 'order' as const, message: 'طلب تم إلغاؤه', status: 'warning' as const },
      { type: 'system' as const, message: 'تحديث النظام مكتمل', status: 'success' as const },
      { type: 'payment' as const, message: 'فشل في الدفع', status: 'error' as const }
    ]
    
    const activity = activities[Math.floor(Math.random() * activities.length)]
    return {
      id: Math.random().toString(36).substring(2, 15),
      ...activity,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'offline': return 'text-red-500'
      default: return 'text-stone-500'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart
      case 'user': return Users
      case 'payment': return DollarSign
      case 'system': return Activity
      default: return Bell
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-stone-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Wifi className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
            <span className="font-medium">
              {isConnected ? 'متصل مباشرة' : 'انقطع الاتصال'}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-stone-600">
          <span>آخر تحديث: {realtimeData.lastUpdate}</span>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span className={getStatusColor(realtimeData.serverStatus)}>
              {realtimeData.serverStatus === 'online' ? 'الخادم يعمل' : 'تحذير في الخادم'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          key={realtimeData.onlineUsers}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">المستخدمون الآن</p>
                  <motion.p 
                    className="text-3xl font-bold text-green-600"
                    key={realtimeData.onlineUsers}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {realtimeData.onlineUsers.toLocaleString()}
                  </motion.p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+5.2%</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-100">
                <motion.div 
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(realtimeData.onlineUsers / 300) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          key={realtimeData.activeOrders}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">طلبات نشطة</p>
                  <motion.p 
                    className="text-3xl font-bold text-blue-600"
                    key={realtimeData.activeOrders}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {realtimeData.activeOrders}
                  </motion.p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-500">جاري التنفيذ</span>
                  </div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-100">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (realtimeData.activeOrders / 50) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          key={realtimeData.todayRevenue}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">إيرادات اليوم</p>
                  <motion.p 
                    className="text-2xl font-bold text-purple-600"
                    key={realtimeData.todayRevenue}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {realtimeData.todayRevenue.toLocaleString()} ج
                  </motion.p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-purple-500">+12.8%</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-100">
                <motion.div 
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(realtimeData.todayRevenue / 50000) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          key={realtimeData.newRegistrations}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">تسجيلات جديدة</p>
                  <motion.p 
                    className="text-3xl font-bold text-orange-600"
                    key={realtimeData.newRegistrations}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {realtimeData.newRegistrations}
                  </motion.p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-500">اليوم</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-100">
                <motion.div 
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (realtimeData.newRegistrations / 20) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              الأنشطة المباشرة
              {newActivitiesCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {newActivitiesCount} جديد
                </Badge>
              )}
            </CardTitle>
            <button 
              onClick={() => setNewActivitiesCount(0)}
              className="text-sm text-blue-600 hover:underline"
            >
              تم القراءة
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {realtimeData.activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type)
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-white ${getActivityColor(activity.status)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-900">
                        {activity.message}
                        {activity.amount && (
                          <span className="text-green-600 font-bold ml-2">
                            {activity.amount.toLocaleString()} ج
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500">{activity.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {activity.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {activity.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                      {activity.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {realtimeData.activities.length === 0 && (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto mb-2" />
                <p className="text-stone-500">في انتظار الأنشطة الجديدة...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
