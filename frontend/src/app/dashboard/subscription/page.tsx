'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Crown, 
  CreditCard, 
  Users, 
  QrCode, 
  Settings, 
  Calendar,
  Shield,
  CheckCircle,
  Gift,
  Plus,
  Edit,
  Download,
  Share2,
  AlertTriangle,
  Star,
  RefreshCw,
  XCircle,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/auth'
import { subscriptionsAPI } from '@/lib/subscriptions-api'
import { apiFetch } from '@/utils/apiClient'
import { toast } from 'sonner'

interface Subscription {
  id: string
  planType: 'USER' | 'PROVIDER'
  planName: string
  planNameAr: string
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  autoRenew?: boolean
  amount?: number
  currency?: string
  nextPaymentDate?: string
  features?: string[]
  featuresAr?: string[]
  cardNumber?: string
  qrCode?: string
  maxFamilyMembers?: number
  periodMonths?: number
  canTakeBookings?: boolean
  canListProducts?: boolean
  searchPriority?: number
}

interface FamilyMember {
  id: string
  name: string
  email: string
  phone: string
  relationship: string
  joinedAt: string
  isActive: boolean
}

export default function CustomerSubscriptionPage() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null)
  
  // Determine if Arabic language is active (you can replace this with your i18n logic)
  const isRTL = true // Set based on your language detection logic

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const [subsResponse, familyResponse] = await Promise.all([
        subscriptionsAPI.getUserSubscriptions(),
        fetchFamilyMembers()
      ])
      
      setSubscriptions(subsResponse)
      setFamilyMembers(familyResponse)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error(isRTL ? 'فشل في تحميل بيانات الاشتراك' : 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const fetchFamilyMembers = async (): Promise<FamilyMember[]> => {
    try {
      const response = await apiFetch('/subscriptions/family-members')
      const data = await response.json()
      return data.familyMembers || []
    } catch (error) {
      console.error('Error fetching family members:', error)
      return []
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await apiFetch(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ 
          reason: 'User requested cancellation',
          immediate: false 
        })
      })

      if (response.ok) {
        toast.success(isRTL ? 'تم إلغاء الاشتراك بنجاح' : 'Subscription cancelled successfully')
        fetchSubscriptionData()
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error(isRTL ? 'فشل في إلغاء الاشتراك' : 'Failed to cancel subscription')
    }
    setCancelModalOpen(false)
    setSelectedSubscription(null)
  }

  const handleToggleAutoRenew = async (subscriptionId: string, currentAutoRenew: boolean) => {
    try {
      const response = await apiFetch(`/subscriptions/${subscriptionId}/auto-renew`, {
        method: 'PATCH',
        body: JSON.stringify({ autoRenew: !currentAutoRenew })
      })

      if (response.ok) {
        toast.success(isRTL ? 'تم تحديث إعداد التجديد التلقائي' : 'Auto-renewal setting updated')
        fetchSubscriptionData()
      } else {
        throw new Error('Failed to update auto-renewal')
      }
    } catch (error) {
      console.error('Error updating auto-renewal:', error)
      toast.error(isRTL ? 'فشل في تحديث التجديد التلقائي' : 'Failed to update auto-renewal')
    }
  }

  const handleDownloadDigitalCard = async (subscriptionId: string) => {
    try {
      const response = await apiFetch(`/subscriptions/${subscriptionId}/digital-card`, {
        method: 'GET'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `digital-card-${subscriptionId}.png`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success(isRTL ? 'تم تحميل البطاقة الرقمية' : 'Digital card downloaded')
      } else {
        throw new Error('Failed to download digital card')
      }
    } catch (error) {
      console.error('Error downloading digital card:', error)
      toast.error(isRTL ? 'فشل في تحميل البطاقة' : 'Failed to download card')
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: isRTL ? 'نشط' : 'Active',
      EXPIRED: isRTL ? 'منتهي الصلاحية' : 'Expired',
      CANCELLED: isRTL ? 'ملغي' : 'Cancelled'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
           status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
           'bg-stone-100 text-stone-800'
  }

  const primarySubscription = subscriptions.find(s => s.planType === 'USER' && s.status === 'ACTIVE') || subscriptions[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-500" />
                {isRTL ? 'إدارة الاشتراك' : 'Subscription Management'}
              </h1>
              <p className="text-stone-600 mt-2">
                {isRTL ? 'إدارة اشتراكك وأفراد العائلة والبطاقة الرقمية' : 'Manage your subscription, family members, and digital card'}
              </p>
            </div>
            <Button asChild>
              <Link href="/subscription-plans">
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'ترقية الخطة' : 'Upgrade Plan'}
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* No Subscriptions State */}
        {subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="text-center py-12">
                <Crown className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {isRTL ? 'لا توجد اشتراكات نشطة' : 'No Active Subscriptions'}
                </h3>
                <p className="text-stone-600 mb-6">
                  {isRTL 
                    ? 'اشترك في إحدى باقاتنا للاستفادة من خصومات حصرية وميزات متقدمة'
                    : 'Subscribe to one of our plans to enjoy exclusive discounts and advanced features'
                  }
                </p>
                <Button asChild>
                  <Link href="/subscription-plans">
                    <Gift className="h-4 w-4 mr-2" />
                    {isRTL ? 'استعرض الباقات' : 'Browse Plans'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Subscriptions Management Interface */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full md:w-[500px] grid-cols-4">
              <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
              <TabsTrigger value="digital-card">{isRTL ? 'البطاقة الرقمية' : 'Digital Card'}</TabsTrigger>
              <TabsTrigger value="family">{isRTL ? 'العائلة' : 'Family'}</TabsTrigger>
              <TabsTrigger value="settings">{isRTL ? 'الإعدادات' : 'Settings'}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {primarySubscription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="h-6 w-6 text-yellow-500" />
                          <div>
                            <CardTitle className="text-xl">
                              {isRTL ? primarySubscription.planNameAr : primarySubscription.planName}
                            </CardTitle>
                            <p className="text-stone-600">
                              {isRTL ? 'اشتراكك الحالي' : 'Your Current Subscription'}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(primarySubscription.status)}>
                          {getStatusLabel(primarySubscription.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Subscription Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium text-stone-900 mb-3">{isRTL ? 'معلومات الخطة' : 'Plan Information'}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-stone-600">{isRTL ? 'السعر:' : 'Price:'}</span>
                              <span className="font-medium">{primarySubscription.amount.toLocaleString()} {primarySubscription.currency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">{isRTL ? 'المدة:' : 'Period:'}</span>
                              <span className="font-medium">
                                {primarySubscription.periodMonths ? `${primarySubscription.periodMonths} ${isRTL ? 'شهر' : 'months'}` : isRTL ? 'سنوي' : 'Annual'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">{isRTL ? 'بدء الاشتراك:' : 'Started:'}</span>
                              <span className="font-medium">{new Date(primarySubscription.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">{isRTL ? 'ينتهي في:' : 'Expires:'}</span>
                              <span className="font-medium">{new Date(primarySubscription.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-stone-900 mb-3">{isRTL ? 'الميزات المتاحة' : 'Available Features'}</h4>
                          <ul className="space-y-2">
                            {(isRTL ? primarySubscription.featuresAr : primarySubscription.features).slice(0, 4).map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-stone-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-stone-900 mb-3">{isRTL ? 'إحصائيات الاستخدام' : 'Usage Statistics'}</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{isRTL ? 'أفراد العائلة' : 'Family Members'}</span>
                                <span>{familyMembers.length} / {primarySubscription.maxFamilyMembers || 5}</span>
                              </div>
                              <div className="w-full bg-stone-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${((familyMembers.length) / (primarySubscription.maxFamilyMembers || 5)) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => setActiveTab('digital-card')}>
                          <QrCode className="h-4 w-4 mr-2" />
                          {isRTL ? 'البطاقة الرقمية' : 'Digital Card'}
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('family')}>
                          <Users className="h-4 w-4 mr-2" />
                          {isRTL ? 'إدارة العائلة' : 'Manage Family'}
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/subscription-plans">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {isRTL ? 'ترقية الخطة' : 'Upgrade Plan'}
                          </Link>
                        </Button>
                      </div>

                      {/* Next Payment Alert */}
                      {primarySubscription.nextPaymentDate && primarySubscription.status === 'ACTIVE' && (
                        <Alert>
                          <Calendar className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{isRTL ? 'التجديد التالي:' : 'Next Renewal:'}</strong> {new Date(primarySubscription.nextPaymentDate).toLocaleDateString()} 
                            {primarySubscription.autoRenew && (
                              <span className="text-green-600 ml-2">
                                ({isRTL ? 'تجديد تلقائي مُفعل' : 'Auto-renewal enabled'})
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Digital Card Tab */}
            <TabsContent value="digital-card" className="space-y-6">
              {primarySubscription?.cardNumber && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                        {isRTL ? 'بطاقتك الرقمية' : 'Your Digital Card'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Digital Card Preview */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-blue-100 text-sm">{isRTL ? 'رقم البطاقة' : 'Card Number'}</p>
                            <p className="text-xl font-mono font-bold">{primarySubscription.cardNumber}</p>
                          </div>
                          <Crown className="h-8 w-8 text-yellow-300" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-blue-100 text-sm">{isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}</p>
                            <p className="font-semibold">{user?.name}</p>
                          </div>
                          <div>
                            <p className="text-blue-100 text-sm">{isRTL ? 'نوع البطاقة' : 'Card Type'}</p>
                            <p className="font-semibold">{isRTL ? primarySubscription.planNameAr : primarySubscription.planName}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-blue-100 text-sm">{isRTL ? 'صالحة حتى' : 'Valid Until'}</p>
                            <p className="font-semibold">{new Date(primarySubscription.endDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <QrCode className="h-16 w-16 bg-white text-blue-600 p-2 rounded-lg" />
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button onClick={() => handleDownloadDigitalCard(primarySubscription.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          {isRTL ? 'تحميل البطاقة' : 'Download Card'}
                        </Button>
                        <Button variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          {isRTL ? 'مشاركة البطاقة' : 'Share Card'}
                        </Button>
                        <Button variant="outline">
                          <QrCode className="h-4 w-4 mr-2" />
                          {isRTL ? 'عرض QR كود' : 'View QR Code'}
                        </Button>
                      </div>

                      <Alert>
                        <Gift className="h-4 w-4" />
                        <AlertDescription>
                          {isRTL 
                            ? 'استخدم البطاقة الرقمية أو رمز QR للحصول على خصومات فورية في المتاجر المشاركة'
                            : 'Use your digital card or QR code to get instant discounts at participating stores'
                          }
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Family Members Tab */}
            <TabsContent value="family" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        {isRTL ? 'أفراد العائلة' : 'Family Members'}
                      </CardTitle>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {isRTL ? 'إضافة عضو' : 'Add Member'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {familyMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-stone-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {isRTL ? 'لا توجد أفراد عائلة مضافون' : 'No Family Members Added'}
                        </h3>
                        <p className="text-stone-600 mb-4">
                          {isRTL 
                            ? 'يمكنك إضافة حتى 5 أفراد من العائلة للاستفادة من البطاقة'
                            : 'You can add up to 5 family members to benefit from your card'
                          }
                        </p>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {isRTL ? 'إضافة أول عضو' : 'Add First Member'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {familyMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-stone-900">{member.name}</div>
                                <div className="text-sm text-stone-600">{member.relationship} • {member.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={member.isActive ? 'default' : 'secondary'}>
                                {member.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {primarySubscription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Auto-Renewal Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-stone-600" />
                        {isRTL ? 'إعدادات التجديد التلقائي' : 'Auto-Renewal Settings'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-stone-200 rounded-lg">
                        <div>
                          <div className="font-medium">{isRTL ? 'التجديد التلقائي' : 'Auto-Renewal'}</div>
                          <div className="text-sm text-stone-600">
                            {isRTL 
                              ? 'تجديد اشتراكك تلقائياً عند انتهاء المدة'
                              : 'Automatically renew your subscription when it expires'
                            }
                          </div>
                        </div>
                        <Button 
                          variant={primarySubscription.autoRenew ? 'default' : 'outline'}
                          onClick={() => handleToggleAutoRenew(primarySubscription.id, primarySubscription.autoRenew)}
                        >
                          {primarySubscription.autoRenew ? (isRTL ? 'إيقاف' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        {isRTL ? 'إجراءات الاشتراك' : 'Subscription Actions'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Button variant="outline" asChild className="w-full justify-start">
                          <Link href="/subscription-plans">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {isRTL ? 'ترقية أو تغيير الخطة' : 'Upgrade or Change Plan'}
                          </Link>
                        </Button>
                        
                        {primarySubscription.status === 'ACTIVE' && (
                          <Button 
                            variant="destructive" 
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedSubscription(primarySubscription.id)
                              setCancelModalOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                          </Button>
                        )}
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {isRTL 
                            ? 'عند إلغاء الاشتراك، ستستمر في الاستفادة من الخدمات حتى نهاية المدة المدفوعة'
                            : 'When you cancel your subscription, you\'ll continue to have access until the end of your paid period'
                          }
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Cancel Subscription Modal */}
        {cancelModalOpen && selectedSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold">
                  {isRTL ? 'تأكيد إلغاء الاشتراك' : 'Confirm Cancellation'}
                </h3>
              </div>
              
              <p className="text-stone-600 mb-6">
                {isRTL 
                  ? 'هل أنت متأكد من أنك تريد إلغاء اشتراكك؟ ستستمر في الاستفادة من الخدمات حتى نهاية المدة الحالية.'
                  : 'Are you sure you want to cancel your subscription? You\'ll continue to have access until the end of your current period.'
                }
              </p>

              <div className="flex gap-3">
                <Button 
                  variant="destructive" 
                  onClick={() => handleCancelSubscription(selectedSubscription)}
                >
                  {isRTL ? 'نعم، إلغاء الاشتراك' : 'Yes, Cancel Subscription'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCancelModalOpen(false)
                    setSelectedSubscription(null)
                  }}
                >
                  {isRTL ? 'تراجع' : 'Cancel'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
