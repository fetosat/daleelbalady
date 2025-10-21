'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, Shield, Edit, Save, Store, Plus, Briefcase, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import UniversalConversionDialog from '@/components/admin/UniversalConversionDialog'

export default function AdminUserDetailPage() {
  const params = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [converting, setConverting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  })
  const [shopForm, setShopForm] = useState({
    shopName: '',
    city: '',
    description: ''
  })

  // State for universal conversion dialog
  const [conversionDialog, setConversionDialog] = useState<{
    isOpen: boolean;
    sourceType: 'user' | 'shop' | 'service' | 'product';
    sourceId: string;
    sourceName: string;
    targetType: 'user' | 'shop' | 'service' | 'product';
  }>({
    isOpen: false,
    sourceType: 'user',
    sourceId: '',
    sourceName: '',
    targetType: 'shop'
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        body: JSON.stringify(editForm)
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditing(false)
        toast.success('تم حفظ التغييرات بنجاح')
      } else {
        const errorData = await response.text()
        console.error('Save failed:', response.status, errorData)
        toast.error('فشل في حفظ التغييرات')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('حدث خطأ أثناء حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  const handleConvertToShop = async () => {
    if (!shopForm.shopName || !shopForm.city) {
      toast.error('الرجاء إدخال اسم المتجر والمدينة')
      return
    }

    setConverting(true)
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/users/${params.id}/convert-to-shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`
        },
        body: JSON.stringify(shopForm)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`تم تحويل المستخدم إلى صاحب متجر بنجاح! متجر: ${data.shop.name}`)
        setShowConvertDialog(false)
        // Refresh user data
        const userResponse = await fetch(`https://api.daleelbalady.com/api/admin/users/${params.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }
      } else {
        const errorData = await response.json()
        toast.error((errorData as any).message || 'فشل في تحويل المستخدم إلى متجر')
      }
    } catch (error) {
      console.error('Error converting to shop:', error)
      toast.error('حدث خطأ أثناء التحويل')
    } finally {
      setConverting(false)
    }
  }

  useEffect(() => {
    fetch(`https://api.daleelbalady.com/api/admin/users/${params.id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
    }).then(r => r.json()).then(d => {
      setUser(d.user)
      setEditForm({
        name: d.user?.name || '',
        email: d.user?.email || '',
        phone: d.user?.phone || '',
        role: d.user?.role || ''
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <AdminLayout><div className="p-6 text-center">جاري التحميل...</div></AdminLayout>
  if (!user) return <AdminLayout><div className="p-6 text-center">المستخدم غير موجود</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-500"/>تفاصيل المستخدم
          </h1>
          <div className="flex items-center gap-2">
            {/* Convert to Shop Button - Only show if user is CUSTOMER and doesn't have shops */}
            {user?.role === 'CUSTOMER' && (
              <>
                <Button 
                  onClick={() => setConversionDialog({
                    isOpen: true,
                    sourceType: 'user',
                    sourceId: user.id,
                    sourceName: user.name,
                    targetType: 'shop'
                  })}
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 dark:border-green-800"
                  title="تحويل إلى متجر"
                >
                  <Store className="w-4 h-4 ml-2" />تحويل إلى متجر
                </Button>
                <Button 
                  onClick={() => setConversionDialog({
                    isOpen: true,
                    sourceType: 'user',
                    sourceId: user.id,
                    sourceName: user.name,
                    targetType: 'service'
                  })}
                  variant="outline"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 dark:border-purple-800"
                  title="تحويل إلى خدمة"
                >
                  <Briefcase className="w-4 h-4 ml-2" />تحويل إلى خدمة
                </Button>
                <Button 
                  onClick={() => setConversionDialog({
                    isOpen: true,
                    sourceType: 'user',
                    sourceId: user.id,
                    sourceName: user.name,
                    targetType: 'product'
                  })}
                  variant="outline"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:border-orange-800"
                  title="تحويل إلى منتج"
                >
                  <Package className="w-4 h-4 ml-2" />تحويل إلى منتج
                </Button>
              </>
            )}
            
            <Button 
              onClick={editing ? handleSave : () => setEditing(true)} 
              variant={editing ? 'default' : 'outline'} 
              className="dark:border-stone-700"
              disabled={saving}
            >
              {saving ? (
                <>جاري الحفظ...</>
              ) : editing ? (
                <><Save className="w-4 h-4 ml-2"/>حفظ</>
              ) : (
                <><Edit className="w-4 h-4 ml-2"/>تعديل</>
              )}
            </Button>
            {editing && (
              <Button 
                onClick={() => {
                  setEditing(false)
                  setEditForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    role: user?.role || ''
                  })
                }}
                variant="outline"
                className="dark:border-stone-700"
              >
                إلغاء
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardHeader><CardTitle className="dark:text-stone-100">المعلومات الأساسية</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-stone-400"/>
                {editing ? (
                  <Input 
                    value={editForm.name} 
                    onChange={(e) => setEditForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="اسم المستخدم"
                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  />
                ) : (
                  <span className="dark:text-stone-200">{user.name}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-stone-400"/>
                {editing ? (
                  <Input 
                    value={editForm.email} 
                    onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))}
                    placeholder="البريد الإلكتروني"
                    type="email"
                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  />
                ) : (
                  <span className="dark:text-stone-200">{user.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-stone-400"/>
                {editing ? (
                  <Input 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                    placeholder="رقم الهاتف"
                    type="tel"
                    className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  />
                ) : (
                  <span className="dark:text-stone-200">{user.phone || 'غير متوفر'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-stone-400"/>
                {editing ? (
                  <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({...prev, role: value}))}>
                    <SelectTrigger className="dark:bg-stone-800 dark:border-stone-700">
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">عميل</SelectItem>
                      <SelectItem value="PROVIDER">مقدم خدمة</SelectItem>
                      <SelectItem value="ADMIN">مدير</SelectItem>
                      <SelectItem value="DELIVERY">موزع</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{user.role}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-stone-400"/>
                <span className="text-sm text-stone-600 dark:text-stone-400">انضم {new Date(user.createdAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardHeader><CardTitle className="dark:text-stone-100">الإحصائيات</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">المتاجر</span><span className="font-bold dark:text-stone-100">{user._count?.shops || 0}</span></div>
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">الخدمات</span><span className="font-bold dark:text-stone-100">{user._count?.services || 0}</span></div>
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">الطلبات</span><span className="font-bold dark:text-stone-100">{user._count?.orders || 0}</span></div>
              <div className="flex justify-between"><span className="text-stone-600 dark:text-stone-400">الحجوزات</span><span className="font-bold dark:text-stone-100">{user._count?.bookings || 0}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Universal Conversion Dialog */}
        <UniversalConversionDialog
          isOpen={conversionDialog.isOpen}
          onClose={() => setConversionDialog({
            isOpen: false,
            sourceType: 'user',
            sourceId: '',
            sourceName: '',
            targetType: 'shop'
          })}
          sourceType={conversionDialog.sourceType}
          sourceId={conversionDialog.sourceId}
          sourceName={conversionDialog.sourceName}
          targetType={conversionDialog.targetType}
          onSuccess={async () => {
            // Refresh user data
            const userResponse = await fetch(`https://api.daleelbalady.com/api/admin/users/${params.id}`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
            })
            if (userResponse.ok) {
              const userData = await userResponse.json()
              setUser(userData.user)
            }
            setConversionDialog({
              isOpen: false,
              sourceType: 'user',
              sourceId: '',
              sourceName: '',
              targetType: 'shop'
            })
          }}
        />
      </div>
    </AdminLayout>
  )
}

