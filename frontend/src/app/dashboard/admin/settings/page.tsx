'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Settings, Save, Globe, Shield, Bell, 
  Palette, Database, Mail, Phone
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'دليل بلدي',
    siteDescription: 'منصة متكاملة للخصومات والعروض الحصرية',
    supportEmail: 'support@daleelbalady.com',
    supportPhone: '01234567890',
    
    // Features
    allowUserRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    enableReviews: true,
    enableChat: true,
    
    // Business
    defaultCommission: 5,
    minOrderAmount: 50,
    maxOrderAmount: 50000,
    deliveryFee: 25,
    
    // Appearance
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    darkMode: false,
    
    // Email
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: ''
  })

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings)
    // Here you would save settings to the backend
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
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
                <Settings className="w-6 h-6 text-stone-600" />
                إعدادات المنصة
              </h1>
              <p className="text-stone-600">إدارة الإعدادات العامة والتخصيص</p>
            </div>
          </div>
          <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ التغييرات
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              عام
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              المميزات
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              الأعمال
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              المظهر
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">اسم الموقع</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supportEmail">البريد الإلكتروني للدعم</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">وصف الموقع</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="supportPhone">رقم هاتف الدعم</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) => handleSettingChange('supportPhone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المميزات والخصائص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>السماح بتسجيل المستخدمين</Label>
                    <p className="text-sm text-stone-500">السماح للمستخدمين الجدد بإنشاء حسابات</p>
                  </div>
                  <Switch
                    checked={settings.allowUserRegistration}
                    onCheckedChange={(checked) => handleSettingChange('allowUserRegistration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>التحقق من البريد الإلكتروني</Label>
                    <p className="text-sm text-stone-500">طلب تأكيد البريد الإلكتروني عند التسجيل</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل الإشعارات</Label>
                    <p className="text-sm text-stone-500">إرسال إشعارات للمستخدمين</p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل التقييمات</Label>
                    <p className="text-sm text-stone-500">السماح للمستخدمين بتقييم المنتجات والخدمات</p>
                  </div>
                  <Switch
                    checked={settings.enableReviews}
                    onCheckedChange={(checked) => handleSettingChange('enableReviews', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>تفعيل الدردشة</Label>
                    <p className="text-sm text-stone-500">إتاحة المحادثة بين المستخدمين والمتاجر</p>
                  </div>
                  <Switch
                    checked={settings.enableChat}
                    onCheckedChange={(checked) => handleSettingChange('enableChat', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأعمال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultCommission">العمولة الافتراضية (%)</Label>
                    <Input
                      id="defaultCommission"
                      type="number"
                      value={settings.defaultCommission}
                      onChange={(e) => handleSettingChange('defaultCommission', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryFee">رسوم التوصيل (جنيه)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={settings.deliveryFee}
                      onChange={(e) => handleSettingChange('deliveryFee', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrderAmount">الحد الأدنى للطلب (جنيه)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={(e) => handleSettingChange('minOrderAmount', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxOrderAmount">الحد الأقصى للطلب (جنيه)</Label>
                    <Input
                      id="maxOrderAmount"
                      type="number"
                      value={settings.maxOrderAmount}
                      onChange={(e) => handleSettingChange('maxOrderAmount', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المظهر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">اللون الأساسي</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>الوضع الليلي</Label>
                    <p className="text-sm text-stone-500">تفعيل الوضع الليلي كافتراضي</p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات البريد الإلكتروني</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">خادم SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPort">منفذ SMTP</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUser">اسم المستخدم</Label>
                    <Input
                      id="smtpUser"
                      type="email"
                      value={settings.smtpUser}
                      onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPassword">كلمة المرور</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.smtpPassword}
                      onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>ملاحظة:</strong> يُرجى التأكد من صحة إعدادات SMTP لضمان وصول الإشعارات البريدية للمستخدمين.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
