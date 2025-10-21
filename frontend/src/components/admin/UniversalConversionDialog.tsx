'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ConversionDialogProps {
  isOpen: boolean
  onClose: () => void
  sourceType: 'user' | 'shop' | 'service' | 'product'
  sourceId: string
  sourceName: string
  targetType: 'user' | 'shop' | 'service' | 'product'
  onSuccess?: () => void
  additionalData?: any
}

const UniversalConversionDialog: React.FC<ConversionDialogProps> = ({
  isOpen,
  onClose,
  sourceType,
  sourceId,
  sourceName,
  targetType,
  onSuccess,
  additionalData = {}
}: ConversionDialogProps) => {
  const [converting, setConverting] = useState(false)
  const [formData, setFormData] = useState({
    // User fields
    userName: '',
    userEmail: '',
    userPassword: '',
    userRole: 'CUSTOMER',
    
    // Shop fields
    shopName: '',
    shopCity: '',
    shopDescription: '',
    
    // Service fields
    serviceText: '',
    servicePhone: '',
    serviceCity: '',
    servicePrice: '',
    
    // Product fields
    productName: '',
    productDescription: '',
    productPrice: '',
    productStock: '0',
    productShopId: '',
    
    // Common
    deleteOriginal: false
  })

  const getTargetLabel = () => {
    switch(targetType) {
      case 'user': return 'مستخدم'
      case 'shop': return 'متجر'
      case 'service': return 'خدمة'
      case 'product': return 'منتج'
    }
  }

  const handleConvert = async () => {
    setConverting(true)
    try {
      let targetData: any = { 
        deleteOriginal: formData.deleteOriginal,
        ...additionalData
      }
      
      // Prepare data based on target type
      if (targetType === 'user') {
        targetData = {
          ...targetData,
          name: formData.userName || sourceName,
          email: formData.userEmail,
          password: formData.userPassword || 'defaultPassword123',
          role: formData.userRole
        }
      } else if (targetType === 'shop') {
        targetData = {
          ...targetData,
          name: formData.shopName || sourceName,
          city: formData.shopCity || 'Cairo',
          description: formData.shopDescription
        }
      } else if (targetType === 'service') {
        targetData = {
          ...targetData,
          embeddingText: formData.serviceText || sourceName,
          phone: formData.servicePhone,
          city: formData.serviceCity || 'Cairo',
          price: formData.servicePrice
        }
      } else if (targetType === 'product') {
        targetData = {
          ...targetData,
          name: formData.productName || sourceName,
          description: formData.productDescription,
          price: formData.productPrice || '0',
          stock: formData.productStock,
          shopId: formData.productShopId
        }
      }
      
      const response = await fetch('/api/dashboard/admin/conversions/convert', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceType,
          sourceId,
          targetType,
          targetData
        })
      })
      
      if (response.ok) {
        toast.success(`تم التحويل إلى ${getTargetLabel()} بنجاح`)
        onClose()
        if (onSuccess) onSuccess()
      } else {
        const errorData = await response.json()
        toast.error((errorData as any).message || 'فشل في التحويل')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error('حدث خطأ أثناء التحويل')
    } finally {
      setConverting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:bg-stone-900 dark:border-stone-800">
        <DialogHeader>
          <DialogTitle className="dark:text-stone-100">
            <RefreshCw className="w-5 h-5 inline-block ml-2" />
            تحويل إلى {getTargetLabel()}
          </DialogTitle>
          <DialogDescription className="dark:text-stone-400">
            قم بإدخال البيانات المطلوبة للتحويل
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                سيتم تحويل "{sourceName}" من {sourceType} إلى {getTargetLabel()}
              </p>
            </div>
          </div>

          {/* Dynamic form based on target type */}
          {targetType === 'user' && (
            <>
              <div>
                <Label htmlFor="userName">اسم المستخدم</Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  placeholder={sourceName || 'أدخل اسم المستخدم'}
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">البريد الإلكتروني <span className="text-red-500">*</span></Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                  placeholder="user@example.com"
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="userPassword">كلمة المرور</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={formData.userPassword}
                  onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
                  placeholder="اتركها فارغة لكلمة مرور افتراضية"
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                />
              </div>
              <div>
                <Label htmlFor="userRole">الدور</Label>
                <select
                  id="userRole"
                  value={formData.userRole}
                  onChange={(e) => setFormData({...formData, userRole: e.target.value})}
                  className="mt-2 w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-md bg-white dark:bg-stone-800"
                >
                  <option value="CUSTOMER">عميل</option>
                  <option value="PROVIDER">مقدم خدمة</option>
                  <option value="DELIVERY">موصل</option>
                </select>
              </div>
            </>
          )}

          {targetType === 'shop' && (
            <>
              <div>
                <Label htmlFor="shopName">اسم المتجر <span className="text-red-500">*</span></Label>
                <Input
                  id="shopName"
                  value={formData.shopName}
                  onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  placeholder={sourceName || 'أدخل اسم المتجر'}
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="shopCity">المدينة <span className="text-red-500">*</span></Label>
                <Input
                  id="shopCity"
                  value={formData.shopCity}
                  onChange={(e) => setFormData({...formData, shopCity: e.target.value})}
                  placeholder="أدخل المدينة"
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="shopDescription">الوصف</Label>
                <Textarea
                  id="shopDescription"
                  value={formData.shopDescription}
                  onChange={(e) => setFormData({...formData, shopDescription: e.target.value})}
                  placeholder="وصف المتجر"
                  rows={3}
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                />
              </div>
            </>
          )}

          {targetType === 'service' && (
            <>
              <div>
                <Label htmlFor="serviceText">وصف الخدمة <span className="text-red-500">*</span></Label>
                <Input
                  id="serviceText"
                  value={formData.serviceText}
                  onChange={(e) => setFormData({...formData, serviceText: e.target.value})}
                  placeholder={sourceName || 'أدخل وصف الخدمة'}
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="servicePhone">رقم الهاتف</Label>
                <Input
                  id="servicePhone"
                  value={formData.servicePhone}
                  onChange={(e) => setFormData({...formData, servicePhone: e.target.value})}
                  placeholder="رقم الهاتف"
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceCity">المدينة</Label>
                  <Input
                    id="serviceCity"
                    value={formData.serviceCity}
                    onChange={(e) => setFormData({...formData, serviceCity: e.target.value})}
                    placeholder="المدينة"
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>
                <div>
                  <Label htmlFor="servicePrice">السعر</Label>
                  <Input
                    id="servicePrice"
                    type="number"
                    value={formData.servicePrice}
                    onChange={(e) => setFormData({...formData, servicePrice: e.target.value})}
                    placeholder="0"
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>
              </div>
            </>
          )}

          {targetType === 'product' && (
            <>
              <div>
                <Label htmlFor="productName">اسم المنتج <span className="text-red-500">*</span></Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder={sourceName || 'أدخل اسم المنتج'}
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="productDescription">الوصف</Label>
                <Textarea
                  id="productDescription"
                  value={formData.productDescription}
                  onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                  placeholder="وصف المنتج"
                  rows={3}
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productPrice">السعر</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    value={formData.productPrice}
                    onChange={(e) => setFormData({...formData, productPrice: e.target.value})}
                    placeholder="0"
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>
                <div>
                  <Label htmlFor="productStock">المخزون</Label>
                  <Input
                    id="productStock"
                    type="number"
                    value={formData.productStock}
                    onChange={(e) => setFormData({...formData, productStock: e.target.value})}
                    placeholder="0"
                    className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="productShopId">معرف المتجر <span className="text-red-500">*</span></Label>
                <Input
                  id="productShopId"
                  value={formData.productShopId}
                  onChange={(e) => setFormData({...formData, productShopId: e.target.value})}
                  placeholder="أدخل معرف المتجر"
                  className="mt-2 dark:bg-stone-800 dark:border-stone-700"
                  required
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="deleteOriginal"
              checked={formData.deleteOriginal}
              onChange={(e) => setFormData({...formData, deleteOriginal: e.target.checked})}
              className="w-4 h-4 rounded"
            />
            <Label htmlFor="deleteOriginal">حذف العنصر الأصلي بعد التحويل</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="dark:border-stone-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConvert}
              disabled={converting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {converting ? 'جاري التحويل...' : 'تأكيد التحويل'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UniversalConversionDialog
