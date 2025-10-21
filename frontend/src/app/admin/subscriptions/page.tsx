'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Search, Eye, CheckCircle, XCircle, TrendingUp, TrendingDown, Edit, X, Settings, Plus } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ProviderSubscription {
  id: string
  planType: string
  pricePerYear: number
  currency: string
  isActive: boolean
  startedAt: string
  expiresAt?: string
  provider: {
    id: string
    name: string
    email: string
  }
}

interface UserSubscription {
  id: string
  planType: string
  pricePerPeriod: number
  periodMonths: number
  currency: string
  isActive: boolean
  isTrial: boolean
  startedAt: string
  expiresAt?: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminSubscriptionsPage() {
  const [providerSubs, setProviderSubs] = useState<ProviderSubscription[]>([])
  const [userSubs, setUserSubs] = useState<UserSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('providers')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedSubscription, setSelectedSubscription] = useState<ProviderSubscription | UserSubscription | null>(null)
  const [dialogMode, setDialogMode] = useState<'upgrade' | 'downgrade' | 'edit' | 'cancel' | 'create' | null>(null)
  const [newPlan, setNewPlan] = useState('')
  const [reason, setReason] = useState('')
  const [immediateCancel, setImmediateCancel] = useState(false)
  const [createType, setCreateType] = useState('provider') // 'provider' or 'user'
  const [selectedUserId, setSelectedUserId] = useState('')
  const [availableUsers, setAvailableUsers] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === 'providers') {
      fetchProviderSubscriptions()
    } else {
      fetchUserSubscriptions()
    }
  }, [activeTab, page, searchTerm])

  const fetchProviderSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/subscriptions/providers?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProviderSubs(data.subscriptions || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch provider subscriptions:', error)
      toast.error('فشل في تحميل اشتراكات مقدمي الخدمات')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSubscriptions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      const response = await fetch(`https://api.daleelbalady.com/api/admin/subscriptions/users?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserSubs(data.subscriptions || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch user subscriptions:', error)
      toast.error('فشل في تحميل اشتراكات المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://api.daleelbalady.com/api/admin/users?limit=100', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateSubscription = async () => {
    if (!selectedUserId || !newPlan) return
    
    try {
      const endpoint = createType === 'provider' 
        ? 'https://api.daleelbalady.com/api/admin/subscriptions/providers'
        : 'https://api.daleelbalady.com/api/admin/subscriptions/users'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: selectedUserId, 
          planType: newPlan,
          isActive: true
        })
      })
      
      if (response.ok) {
        setDialogMode(null)
        if (activeTab === 'providers') {
          fetchProviderSubscriptions()
        } else {
          fetchUserSubscriptions()
        }
        toast.success('تم إنشاء الاشتراك بنجاح')
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في إنشاء الاشتراك')
      }
    } catch (error) {
      toast.error('فشل في إنشاء الاشتراك')
    }
  }

  const handleUpgradeSubscription = async () => {
    if (!selectedSubscription || !newPlan) return
    
    try {
      const isProvider = 'provider' in selectedSubscription
      const endpoint = isProvider 
        ? `https://api.daleelbalady.com/api/admin/subscriptions/providers/${selectedSubscription.id}/upgrade`
        : `https://api.daleelbalady.com/api/admin/subscriptions/users/${selectedSubscription.id}/upgrade`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPlanType: newPlan })
      })
      
      if (response.ok) {
        setDialogMode(null)
        if (activeTab === 'providers') {
          fetchProviderSubscriptions()
        } else {
          fetchUserSubscriptions()
        }
        toast.success('تم ترقية الاشتراك بنجاح')
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في ترقية الاشتراك')
      }
    } catch (error) {
      toast.error('فشل في ترقية الاشتراك')
    }
  }

  const handleDowngradeSubscription = async () => {
    if (!selectedSubscription || !newPlan) return
    
    try {
      const isProvider = 'provider' in selectedSubscription
      const endpoint = isProvider 
        ? `https://api.daleelbalady.com/api/admin/subscriptions/providers/${selectedSubscription.id}/downgrade`
        : `https://api.daleelbalady.com/api/admin/subscriptions/users/${selectedSubscription.id}/downgrade`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPlanType: newPlan })
      })
      
      if (response.ok) {
        setDialogMode(null)
        if (activeTab === 'providers') {
          fetchProviderSubscriptions()
        } else {
          fetchUserSubscriptions()
        }
        toast.success('تم تخفيض الاشتراك بنجاح')
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في تخفيض الاشتراك')
      }
    } catch (error) {
      toast.error('فشل في تخفيض الاشتراك')
    }
  }

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return
    
    try {
      const isProvider = 'provider' in selectedSubscription
      const endpoint = isProvider 
        ? `https://api.daleelbalady.com/api/admin/subscriptions/providers/${selectedSubscription.id}/cancel`
        : `https://api.daleelbalady.com/api/admin/subscriptions/users/${selectedSubscription.id}/cancel`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ immediate: immediateCancel, reason })
      })
      
      if (response.ok) {
        setDialogMode(null)
        if (activeTab === 'providers') {
          fetchProviderSubscriptions()
        } else {
          fetchUserSubscriptions()
        }
        toast.success('تم إلغاء الاشتراك بنجاح')
      } else {
        const data = await response.json()
        toast.error(data.message || 'فشل في إلغاء الاشتراك')
      }
    } catch (error) {
      toast.error('فشل في إلغاء الاشتراك')
    }
  }

  const openDialog = (mode: 'upgrade' | 'downgrade' | 'edit' | 'cancel' | 'create', subscription?: ProviderSubscription | UserSubscription) => {
    setSelectedSubscription(subscription || null)
    setDialogMode(mode)
    setNewPlan('')
    setReason('')
    setImmediateCancel(false)
    setSelectedUserId('')
    setCreateType('provider')
    
    if (mode === 'create') {
      fetchUsers()
    }
  }

  const getAvailablePlans = () => {
    const isProvider = selectedSubscription && 'provider' in selectedSubscription
    
    if (isProvider) {
      return [
        { value: 'BASIC_FREE', label: 'الأساسي (مجاني)' },
        { value: 'BOOKING_BASIC', label: 'باقة الحجز' },
        { value: 'PRODUCTS_PREMIUM', label: 'باقة المنتجات' },
        { value: 'TOP_BRONZE', label: 'المركز 10 البرونزي' },
        { value: 'TOP_SILVER', label: 'المركز 5 الفضي' },
        { value: 'TOP_GOLD', label: 'المركز 3 الذهبي' }
      ]
    } else {
      return [
        { value: 'FREE', label: 'مجاني' },
        { value: 'MEDICAL_CARD', label: 'بطاقة الدليل الطبي' },
        { value: 'ALL_INCLUSIVE', label: 'البطاقة الشاملة' }
      ]
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                إدارة الاشتراكات
              </h1>
              <p className="text-stone-600 dark:text-stone-400">عرض وإدارة اشتراكات المقدمين والمستخدمين</p>
            </div>
            <Button 
              onClick={() => openDialog('create', {} as any)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء اشتراك جديد
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="space-y-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="providers">اشتراكات المقدمين</TabsTrigger>
            <TabsTrigger value="users">اشتراكات المستخدمين</TabsTrigger>
          </TabsList>

          <Card className="mb-6 dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="البحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="providers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{providerSubs.length}</div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الاشتراكات</div>
                </CardContent>
              </Card>
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {providerSubs.filter(s => s.isActive).length}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">نشطة</div>
                </CardContent>
              </Card>
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                    {providerSubs.reduce((sum, s) => sum + s.pricePerYear, 0).toFixed(2)} EGP
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي القيمة</div>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-stone-900 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="dark:text-stone-100">اشتراكات مقدمي الخدمات</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : providerSubs.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد اشتراكات</div>
                ) : (
                  <div className="space-y-3">
                    {providerSubs.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <div className="flex-1">
                          <div className="font-medium text-stone-900 dark:text-stone-100">{sub.provider.name}</div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">{sub.provider.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <Badge variant="outline">{sub.planType}</Badge>
                            <div className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                              {sub.pricePerYear} {sub.currency}/سنة
                            </div>
                          </div>
                          <Badge variant={sub.isActive ? 'default' : 'secondary'}
                            className={sub.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                            {sub.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('upgrade', sub)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="ترقية الباقة"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('downgrade', sub)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            title="تخفيض الباقة"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('edit', sub)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="تعديل"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('cancel', sub)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="إلغاء الاشتراك"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="dark:text-stone-400 dark:hover:bg-stone-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{userSubs.length}</div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الاشتراكات</div>
                </CardContent>
              </Card>
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {userSubs.filter(s => s.isActive).length}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">نشطة</div>
                </CardContent>
              </Card>
              <Card className="dark:bg-stone-900 dark:border-stone-800">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                    {userSubs.filter(s => s.isTrial).length}
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">تجريبية</div>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-stone-900 dark:border-stone-800">
              <CardHeader>
                <CardTitle className="dark:text-stone-100">اشتراكات المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : userSubs.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد اشتراكات</div>
                ) : (
                  <div className="space-y-3">
                    {userSubs.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <div className="flex-1">
                          <div className="font-medium text-stone-900 dark:text-stone-100">{sub.user.name}</div>
                          <div className="text-sm text-stone-500 dark:text-stone-400">{sub.user.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <Badge variant="outline">{sub.planType}</Badge>
                            <div className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                              {sub.pricePerPeriod} {sub.currency}/{sub.periodMonths} شهر
                            </div>
                          </div>
                          {sub.isTrial && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              تجريبي
                            </Badge>
                          )}
                          <Badge variant={sub.isActive ? 'default' : 'secondary'}
                            className={sub.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}>
                            {sub.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('upgrade', sub)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="ترقية الباقة"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('downgrade', sub)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            title="تخفيض الباقة"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('edit', sub)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="تعديل"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDialog('cancel', sub)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="إلغاء الاشتراك"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="dark:text-stone-400 dark:hover:bg-stone-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="dark:border-stone-700 dark:text-stone-300">السابق</Button>
            <span className="text-sm text-stone-600 dark:text-stone-400">صفحة {page} من {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="dark:border-stone-700 dark:text-stone-300">التالي</Button>
          </div>
        )}
        
        {/* Dialogs */}
        <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
          <DialogContent className="sm:max-w-2xl dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'upgrade' && 'ترقية الاشتراك'}
                {dialogMode === 'downgrade' && 'تخفيض الاشتراك'}
                {dialogMode === 'edit' && 'تعديل الاشتراك'}
                {dialogMode === 'cancel' && 'إلغاء الاشتراك'}
                {dialogMode === 'create' && 'إنشاء اشتراك جديد'}
              </DialogTitle>
            </DialogHeader>
            
            {(dialogMode === 'upgrade' || dialogMode === 'downgrade') && (
              <div className="space-y-4">
                <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
                  <div className="text-sm text-stone-600 dark:text-stone-400">المستخدم</div>
                  <div className="font-medium text-stone-900 dark:text-stone-100">
                    {selectedSubscription && 'provider' in selectedSubscription
                      ? selectedSubscription.provider.name       
                      : (selectedSubscription as UserSubscription)?.user?.name}
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    الباقة الحالية: {selectedSubscription?.planType}
                  </div>
                </div>
                
                <div>
                  <Label>الباقة الجديدة</Label>
                  <Select value={newPlan} onValueChange={setNewPlan}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر الباقة الجديدة" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePlans().map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button 
                    onClick={dialogMode === 'upgrade' ? handleUpgradeSubscription : handleDowngradeSubscription}
                    className={dialogMode === 'upgrade' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                    disabled={!newPlan}
                  >
                    {dialogMode === 'upgrade' ? 'ترقية الاشتراك' : 'تخفيض الاشتراك'}
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogMode === 'cancel' && (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-sm text-red-600 dark:text-red-400">تحذير</div>
                  <div className="font-medium text-red-900 dark:text-red-300">
                    هذه العملية لا يمكن التراجع عنها
                  </div>
                </div>
                
                <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
                  <div className="text-sm text-stone-600 dark:text-stone-400">المستخدم</div>
                  <div className="font-medium text-stone-900 dark:text-stone-100">
                    {selectedSubscription && 'provider' in selectedSubscription 
                      ? selectedSubscription.provider.name 
                      : (selectedSubscription as UserSubscription)?.user?.name}
                  </div>
                </div>
                
                <div>
                  <Label>سبب الإلغاء (اختياري)</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="أدخل سبب إلغاء الاشتراك..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="immediate"
                    checked={immediateCancel}
                    onChange={(e) => setImmediateCancel(e.target.checked)}
                    className="rounded border-stone-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="immediate" className="text-sm">
                    إلغاء فوري (بدلاً من إنهاء الاشتراك في نهاية الفترة)
                  </Label>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button 
                    onClick={handleCancelSubscription}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    إلغاء الاشتراك
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogMode === 'edit' && (
              <div className="space-y-4">
                <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
                  <div className="text-sm text-stone-600 dark:text-stone-400">تعديل بيانات الاشتراك</div>
                  <div className="font-medium text-stone-900 dark:text-stone-100">
                    {selectedSubscription && 'provider' in selectedSubscription 
                      ? selectedSubscription.provider.name 
                      : (selectedSubscription as UserSubscription)?.user?.name}
                  </div>
                </div>
                
                <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                  ميزة التعديل قيد التطوير
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إغلاق</Button>
                </DialogFooter>
              </div>
            )}
            
            {dialogMode === 'create' && (
              <div className="space-y-4">
                <div>
                  <Label>نوع الاشتراك</Label>
                  <Select value={createType} onValueChange={setCreateType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provider">مقدم خدمات</SelectItem>
                      <SelectItem value="user">مستخدم عادي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>اختر المستخدم</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر مستخدم" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>نوع الباقة</Label>
                  <Select value={newPlan} onValueChange={setNewPlan}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر نوع الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {createType === 'provider' ? [
                        <SelectItem key="BASIC_FREE" value="BASIC_FREE">الأساسي (مجاني)</SelectItem>,
                        <SelectItem key="BOOKING_BASIC" value="BOOKING_BASIC">باقة الحجز</SelectItem>,
                        <SelectItem key="PRODUCTS_PREMIUM" value="PRODUCTS_PREMIUM">باقة المنتجات</SelectItem>,
                        <SelectItem key="TOP_BRONZE" value="TOP_BRONZE">المركز 10 البرونزي</SelectItem>,
                        <SelectItem key="TOP_SILVER" value="TOP_SILVER">المركز 5 الفضي</SelectItem>,
                        <SelectItem key="TOP_GOLD" value="TOP_GOLD">المركز 3 الذهبي</SelectItem>
                      ] : [
                        <SelectItem key="FREE" value="FREE">مجاني</SelectItem>,
                        <SelectItem key="MEDICAL_CARD" value="MEDICAL_CARD">بطاقة الدليل الطبي</SelectItem>,
                        <SelectItem key="ALL_INCLUSIVE" value="ALL_INCLUSIVE">البطاقة الشاملة</SelectItem>
                      ]}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button 
                    onClick={handleCreateSubscription}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!selectedUserId || !newPlan}
                  >
                    إنشاء الاشتراك
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

