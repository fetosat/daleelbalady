'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, RefreshCw, Server, Wifi } from 'lucide-react'
import api from '@/lib/api'

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'loading' | 'error'
  message: string
  responseTime?: number
  lastChecked?: Date
}

export default function ApiConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'loading',
    message: 'جاري اختبار الاتصال...'
  })

  const testConnection = async () => {
    setConnectionStatus({
      status: 'loading',
      message: 'جاري اختبار الاتصال...'
    })

    const startTime = Date.now()

    try {
      // Test basic connection
      const response = await fetch(`${ 'https://api.daleelbalady.com/api'}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        setConnectionStatus({
          status: 'connected',
          message: 'متصل بالخادم بنجاح',
          responseTime,
          lastChecked: new Date()
        })
      } else {
        setConnectionStatus({
          status: 'error',
          message: `خطأ في الاتصال: ${response.status} ${response.statusText}`,
          responseTime,
          lastChecked: new Date()
        })
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      setConnectionStatus({
        status: 'disconnected',
        message: `فشل في الاتصال: ${error.message || 'خطأ غير معروف'}`,
        responseTime,
        lastChecked: new Date()
      })
    }
  }

  useEffect(() => {
    testConnection()
    
    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'disconnected':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <Server className="w-5 h-5 text-stone-500" />
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700">متصل</Badge>
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-700">منقطع</Badge>
      case 'error':
        return <Badge className="bg-orange-100 text-orange-700">خطأ</Badge>
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-700">جاري الاتصال</Badge>
      default:
        return <Badge variant="outline">غير معروف</Badge>
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-600" />
          حالة الاتصال بالخادم
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="font-medium text-stone-900">
                {connectionStatus.message}
              </div>
              {connectionStatus.lastChecked && (
                <div className="text-sm text-stone-500">
                  آخر فحص: {connectionStatus.lastChecked.toLocaleTimeString('ar-EG')}
                </div>
              )}
              {connectionStatus.responseTime && (
                <div className="text-sm text-stone-500">
                  وقت الاستجابة: {connectionStatus.responseTime}مس
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <Button
              size="sm"
              variant="outline"
              onClick={testConnection}
              disabled={connectionStatus.status === 'loading'}
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${connectionStatus.status === 'loading' ? 'animate-spin' : ''}`} />
              إعادة اختبار
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-stone-50 rounded-lg">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-600">رابط الخادم:</span>
              <span className="font-mono text-stone-800">
                { 'https://api.daleelbalady.com/api'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">بيئة العمل:</span>
              <span className="font-medium">
                {process.env.NODE_ENV === 'development' ? 'تطوير' : 'إنتاج'}
              </span>
            </div>
          </div>
        </div>

        {connectionStatus.status === 'disconnected' || connectionStatus.status === 'error' ? (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700">
              <strong>نصائح لحل المشكلة:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>تأكد من أن الخادم يعمل على المنفذ 5000</li>
                <li>تحقق من إعدادات CORS في الخادم</li>
                <li>تأكد من صحة متغيرات البيئة</li>
                <li>تحقق من الاتصال بالإنترنت</li>
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
