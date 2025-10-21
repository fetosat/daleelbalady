'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { apiFetch } from '@/utils/apiClient'
import { toast } from 'sonner'

interface FamilyMember {
  id: string
  name: string
  email: string
  phone: string
  relationship: string
  joinedAt: string
  isActive: boolean
}

interface FamilyMembersManagerProps {
  maxMembers: number
  isRTL?: boolean
}

const relationshipOptions = [
  { value: 'spouse', labelEn: 'Spouse', labelAr: 'الزوج/الزوجة' },
  { value: 'parent', labelEn: 'Parent', labelAr: 'الوالد/الوالدة' },
  { value: 'child', labelEn: 'Child', labelAr: 'الطفل' },
  { value: 'sibling', labelEn: 'Sibling', labelAr: 'الأخ/الأخت' },
  { value: 'grandparent', labelEn: 'Grandparent', labelAr: 'الجد/الجدة' },
  { value: 'other', labelEn: 'Other', labelAr: 'آخر' }
]

export default function FamilyMembersManager({ maxMembers, isRTL = false }: FamilyMembersManagerProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchFamilyMembers()
  }, [])

  const fetchFamilyMembers = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/subscriptions/family-members')
      const data = await response.json()
      
      if (data.success) {
        setFamilyMembers(data.familyMembers)
      }
    } catch (error) {
      console.error('Error fetching family members:', error)
      toast.error(isRTL ? 'فشل في تحميل أفراد العائلة' : 'Failed to load family members')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.relationship) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingMember 
        ? `/subscriptions/family-members/${editingMember.id}`
        : '/subscriptions/family-members'
      
      const method = editingMember ? 'PUT' : 'POST'
      
      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(editingMember 
          ? (isRTL ? 'تم تحديث بيانات العضو بنجاح' : 'Family member updated successfully')
          : (isRTL ? 'تم إضافة العضو بنجاح' : 'Family member added successfully')
        )
        
        fetchFamilyMembers()
        handleCloseModal()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('Error submitting family member:', error)
      toast.error(error.message || (isRTL ? 'حدث خطأ في العملية' : 'An error occurred'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا العضو؟' : 'Are you sure you want to remove this member?')) {
      return
    }

    try {
      const response = await apiFetch(`/subscriptions/family-members/${memberId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(isRTL ? 'تم حذف العضو بنجاح' : 'Family member removed successfully')
        fetchFamilyMembers()
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      console.error('Error deleting family member:', error)
      toast.error(error.message || (isRTL ? 'فشل في حذف العضو' : 'Failed to remove member'))
    }
  }

  const handleOpenAddModal = () => {
    setFormData({ name: '', email: '', phone: '', relationship: '' })
    setEditingMember(null)
    setIsAddModalOpen(true)
  }

  const handleEditMember = (member: FamilyMember) => {
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      relationship: member.relationship
    })
    setEditingMember(member)
    setIsAddModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingMember(null)
    setFormData({ name: '', email: '', phone: '', relationship: '' })
  }

  const getRelationshipLabel = (relationship: string) => {
    const option = relationshipOptions.find(opt => opt.value === relationship)
    return option ? (isRTL ? option.labelAr : option.labelEn) : relationship
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            {isRTL ? 'أفراد العائلة' : 'Family Members'}
            <Badge variant="outline" className="ml-2">
              {familyMembers.length} / {maxMembers}
            </Badge>
          </CardTitle>
          
          {familyMembers.length < maxMembers && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'إضافة عضو' : 'Add Member'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember 
                      ? (isRTL ? 'تعديل بيانات العضو' : 'Edit Family Member')
                      : (isRTL ? 'إضافة عضو جديد' : 'Add New Family Member')
                    }
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{isRTL ? 'الاسم *' : 'Name *'}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={isRTL ? 'أدخل اسم العضو' : 'Enter member name'}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{isRTL ? 'البريد الإلكتروني *' : 'Email *'}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="relationship">{isRTL ? 'العلاقة *' : 'Relationship *'}</Label>
                    <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'اختر العلاقة' : 'Select relationship'} />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {isRTL ? option.labelAr : option.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                        </div>
                      ) : editingMember ? (
                        isRTL ? 'حفظ التعديلات' : 'Save Changes'
                      ) : (
                        isRTL ? 'إضافة العضو' : 'Add Member'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCloseModal}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-stone-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isRTL ? 'لا توجد أفراد عائلة مضافون' : 'No Family Members Added'}
            </h3>
            <p className="text-stone-600 mb-6">
              {isRTL 
                ? `يمكنك إضافة حتى ${maxMembers} أفراد من العائلة للاستفادة من البطاقة`
                : `You can add up to ${maxMembers} family members to benefit from your card`
              }
            </p>
            {maxMembers > 0 && (
              <Button onClick={handleOpenAddModal}>
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? 'إضافة أول عضو' : 'Add First Member'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {familyMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-stone-900">{member.name}</div>
                      <div className="text-sm text-stone-600 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="text-sm text-stone-600 flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                      )}
                      <div className="text-xs text-stone-500 mt-1">
                        {getRelationshipLabel(member.relationship)} • {isRTL ? 'انضم في' : 'Joined'} {new Date(member.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={member.isActive ? 'default' : 'secondary'} className={
                      member.isActive ? 'bg-green-100 text-green-800' : ''
                    }>
                      {member.isActive 
                        ? (isRTL ? 'نشط' : 'Active') 
                        : (isRTL ? 'غير نشط' : 'Inactive')
                      }
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {familyMembers.length >= maxMembers && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                {isRTL 
                  ? `لقد وصلت إلى الحد الأقصى لعدد أفراد العائلة (${maxMembers})`
                  : `You've reached the maximum family members limit (${maxMembers})`
                }
              </p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              {isRTL 
                ? 'قم بترقية خطتك للحصول على مساحة أكثر لأفراد العائلة'
                : 'Upgrade your plan to add more family members'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
