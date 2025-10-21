'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Folder, Plus, Trash2, Edit, ChevronDown, ChevronRight, FolderOpen, ArrowUp, ArrowDown, Move } from 'lucide-react'
import { toast } from '@/components/ui/sonner'

interface SubCategory {
  id: string
  name: string
  slug: string
  _count?: { services: number }
}

interface Category {
  id: string
  name: string
  slug?: string
  description?: string
  subCategories?: SubCategory[]
  _count?: { services: number; subCategories: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create' | 'createSub' | 'editSub' | 'moveSub' | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', categoryId: '' })
  const [moveSubcategoryData, setMoveSubcategoryData] = useState({ targetCategoryId: '' })

  useEffect(() => { fetchCategories() }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.daleelbalady.com/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      let url = ''
      let method = 'POST'
      let payload: any = {}

      if (dialogMode === 'create') {
        url = 'https://api.daleelbalady.com/api/admin/categories'
        payload = { name: formData.name, description: formData.description }
      } else if (dialogMode === 'edit') {
        url = `https://api.daleelbalady.com/api/admin/categories/${selectedCategory?.id}`
        method = 'PATCH'
        payload = { name: formData.name, description: formData.description }
      } else if (dialogMode === 'createSub') {
        url = 'https://api.daleelbalady.com/api/admin/subcategories'
        payload = { name: formData.name, categoryId: formData.categoryId }
      } else if (dialogMode === 'editSub') {
        url = `https://api.daleelbalady.com/api/admin/subcategories/${selectedSubCategory?.id}`
        method = 'PATCH'
        payload = { name: formData.name }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        setDialogMode(null)
        await fetchCategories()
        toast.success(data.message || 'تم الحفظ بنجاح')
      } else {
        toast.error(data.message || 'فشل في الحفظ')
      }
    } catch (error) {
      toast.error('فشل في الحفظ')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟ لن يتم الحذف إذا كانت هناك فئات فرعية أو خدمات مرتبطة بها.')) return
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      const data = await response.json()
      if (response.ok) {
        await fetchCategories()
        toast.success(data.message || 'تم حذف الفئة بنجاح')
      } else {
        toast.error(data.message || 'فشل في حذف الفئة')
      }
    } catch (error) {
      toast.error('فشل في حذف الفئة')
    }
  }

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة الفرعية؟ لن يتم الحذف إذا كانت هناك خدمات مرتبطة بها.')) return
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/subcategories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      const data = await response.json()
      if (response.ok) {
        await fetchCategories()
        toast.success(data.message || 'تم حذف الفئة الفرعية بنجاح')
      } else {
        toast.error(data.message || 'فشل في حذف الفئة الفرعية')
      }
    } catch (error) {
      toast.error('فشل في حذف الفئة الفرعية')
    }
  }

  const handleMoveCategoryUp = async (id: string) => {
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/categories/${id}/move-up`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      const data = await response.json()
      if (response.ok) {
        await fetchCategories()
        toast.success(data.message || 'تم تحريك الفئة لأعلى بنجاح')
      } else {
        toast.error(data.message || 'فشل في تحريك الفئة')
      }
    } catch (error) {
      toast.error('فشل في تحريك الفئة')
    }
  }

  const handleMoveCategoryDown = async (id: string) => {
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/categories/${id}/move-down`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('daleel-token')}` }
      })
      const data = await response.json()
      if (response.ok) {
        await fetchCategories()
        toast.success(data.message || 'تم تحريك الفئة لأسفل بنجاح')
      } else {
        toast.error(data.message || 'فشل في تحريك الفئة')
      }
    } catch (error) {
      toast.error('فشل في تحريك الفئة')
    }
  }

  const handleMoveSubcategory = async () => {
    if (!selectedSubCategory || !moveSubcategoryData.targetCategoryId) return
    
    try {
      const response = await fetch(`https://api.daleelbalady.com/api/admin/subcategories/${selectedSubCategory.id}/move-to-category`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryId: moveSubcategoryData.targetCategoryId })
      })
      const data = await response.json()
      if (response.ok) {
        setDialogMode(null)
        await fetchCategories()
        toast.success(data.message || 'تم نقل الفئة الفرعية بنجاح')
      } else {
        toast.error(data.message || 'فشل في نقل الفئة الفرعية')
      }
    } catch (error) {
      toast.error('فشل في نقل الفئة الفرعية')
    }
  }

  const openDialog = (mode: 'view' | 'edit' | 'create' | 'createSub' | 'editSub' | 'moveSub', category?: Category, subCategory?: SubCategory) => {
    setDialogMode(mode)
    setSelectedCategory(category || null)
    setSelectedSubCategory(subCategory || null)
    
    if (mode === 'createSub' && category) {
      setFormData({ name: '', description: '', categoryId: category.id })
    } else if (mode === 'editSub' && subCategory) {
      setFormData({ name: subCategory.name, description: '', categoryId: '' })
    } else if (mode === 'moveSub' && subCategory) {
      setMoveSubcategoryData({ targetCategoryId: '' })
    } else if (category) {
      setFormData({ name: category.name, description: category.description || '', categoryId: '' })
    } else {
      setFormData({ name: '', description: '', categoryId: '' })
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-stone-50 dark:bg-stone-950 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Folder className="w-6 h-6 text-teal-600 dark:text-teal-500" />
              إدارة الفئات
            </h1>
            <p className="text-stone-600 dark:text-stone-400">إدارة فئات الخدمات والمنتجات</p>
          </div>
          <Button onClick={() => openDialog('create')} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 ml-2" />فئة جديدة
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{categories.length}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">إجمالي الفئات</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {categories.reduce((sum, c) => sum + (c._count?.subCategories || 0), 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">الفئات الفرعية</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-stone-900 dark:border-stone-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                {categories.reduce((sum, c) => sum + (c._count?.services || 0), 0)}
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400">الخدمات</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-stone-900 dark:border-stone-800">
          <CardHeader>
            <CardTitle className="dark:text-stone-100">قائمة الفئات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">لا توجد فئات</div>
) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="border border-stone-200 dark:border-stone-700 rounded-lg">
                    {/* Category Row */}
                    <div className="flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category.id)}
                          className="p-0 h-auto hover:bg-transparent"
                        >
                          {expandedCategories.has(category.id) ? (
                            <ChevronDown className="w-4 h-4 text-stone-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-stone-500" />
                          )}
                        </Button>
                        {expandedCategories.has(category.id) ? (
                          <FolderOpen className="w-5 h-5 text-teal-600" />
                        ) : (
                          <Folder className="w-5 h-5 text-teal-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-stone-900 dark:text-stone-100">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                              {category.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            {category._count && (
                              <>
                                <Badge variant="secondary" className="text-xs">
                                  {category._count.subCategories} فئة فرعية
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {category._count.services} خدمة
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveCategoryUp(category.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveCategoryDown(category.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog('createSub', category)}
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                          title="إضافة فئة فرعية"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog('edit', category)}
                          className="dark:text-stone-400"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subcategories (Expanded) */}
                    {expandedCategories.has(category.id) && category.subCategories && category.subCategories.length > 0 && (
                      <div className="border-t border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30">
                        {category.subCategories.map((subCategory) => (
                          <div
                            key={subCategory.id}
                            className="flex items-center justify-between p-3 pl-12 hover:bg-stone-100 dark:hover:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800 last:border-b-0"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-px h-6 bg-stone-300 dark:bg-stone-600 mr-2"></div>
                              <Folder className="w-4 h-4 text-blue-500" />
                              <div className="flex-1">
                                <div className="font-medium text-stone-800 dark:text-stone-200 text-sm">
                                  {subCategory.name}
                                </div>
                                {subCategory._count && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {subCategory._count.services} خدمة
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDialog('moveSub', category, subCategory)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                title="نقل إلى فئة أخرى"
                              >
                                <Move className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDialog('editSub', category, subCategory)}
                                className="dark:text-stone-400"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSubCategory(subCategory.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty State for Subcategories */}
                    {expandedCategories.has(category.id) && (!category.subCategories || category.subCategories.length === 0) && (
                      <div className="border-t border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30 p-4 pl-12">
                        <div className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-2">
                          <div className="w-px h-6 bg-stone-300 dark:bg-stone-600"></div>
                          لا توجد فئات فرعية
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogMode !== null} onOpenChange={() => setDialogMode(null)}>
          <DialogContent className="sm:max-w-2xl dark:bg-stone-900 dark:border-stone-800">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'view' && 'تفاصيل الفئة'}
                {dialogMode === 'edit' && 'تعديل الفئة'}
                {dialogMode === 'create' && 'إنشاء فئة جديدة'}
                {dialogMode === 'createSub' && 'إنشاء فئة فرعية جديدة'}
                {dialogMode === 'editSub' && 'تعديل الفئة الفرعية'}
                {dialogMode === 'moveSub' && 'نقل الفئة الفرعية'}
              </DialogTitle>
            </DialogHeader>

            {(dialogMode === 'edit' || dialogMode === 'create') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم الفئة</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="أدخل اسم الفئة"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="أدخل وصف الفئة"
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                    {dialogMode === 'edit' ? 'حفظ التغييرات' : 'إنشاء الفئة'}
                  </Button>
                </div>
              </div>
            )}

            {(dialogMode === 'createSub' || dialogMode === 'editSub') && (
              <div className="space-y-4">
                {dialogMode === 'createSub' && selectedCategory && (
                  <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
                    <div className="text-sm text-stone-600 dark:text-stone-400">الفئة الرئيسية</div>
                    <div className="font-medium text-stone-900 dark:text-stone-100">{selectedCategory.name}</div>
                  </div>
                )}
                <div>
                  <Label htmlFor="subName">اسم الفئة الفرعية</Label>
                  <Input
                    id="subName"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="أدخل اسم الفئة الفرعية"
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                    {dialogMode === 'editSub' ? 'حفظ التغييرات' : 'إنشاء الفئة الفرعية'}
                  </Button>
                </div>
              </div>
            )}

            {dialogMode === 'moveSub' && selectedSubCategory && (
              <div className="space-y-4">
                <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
                  <div className="text-sm text-stone-600 dark:text-stone-400">الفئة الفرعية</div>
                  <div className="font-medium text-stone-900 dark:text-stone-100">{selectedSubCategory.name}</div>
                </div>
                <div>
                  <Label>الفئة الرئيسية الجديدة</Label>
                  <Select 
                    value={moveSubcategoryData.targetCategoryId} 
                    onValueChange={(value) => setMoveSubcategoryData({targetCategoryId: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر الفئة الرئيسية" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat.id !== selectedCategory?.id) // Don't show current category
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogMode(null)}>إلغاء</Button>
                  <Button 
                    onClick={handleMoveSubcategory} 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!moveSubcategoryData.targetCategoryId}
                  >
                    نقل الفئة الفرعية
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

