'use client'

import React, { useState, useEffect, useContext, createContext } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Languages, CheckCircle, AlertCircle, Clock,
  Edit, Save, RefreshCw, Download, Upload, Settings,
  Search, Filter, Plus, Trash2, Copy, Eye,
  Flag, Map, Users, MessageSquare, FileText,
  Zap, Target, TrendingUp, BarChart3, Activity,
  ChevronDown, ChevronRight, MoreHorizontal, X
} from 'lucide-react'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
  isDefault?: boolean
  isEnabled: boolean
  completionPercentage: number
}

interface Translation {
  key: string
  category: string
  arabicText: string
  englishText: string
  context?: string
  lastUpdated: string
  status: 'complete' | 'incomplete' | 'needs_review' | 'approved'
  updatedBy: string
}

interface LanguageStats {
  totalKeys: number
  transtonedKeys: number
  missingKeys: number
  needsReview: number
  completionPercentage: number
}

const supportedLanguages: Language[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    isDefault: true,
    isEnabled: true,
    completionPercentage: 100
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    isEnabled: true,
    completionPercentage: 95
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    isEnabled: false,
    completionPercentage: 0
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    isEnabled: false,
    completionPercentage: 0
  }
]

const mockTranslations: Translation[] = [
  {
    key: 'common.welcome',
    category: 'common',
    arabicText: 'مرحباً بك',
    englishText: 'Welcome',
    context: 'General welcome message',
    lastUpdated: '2024-01-20T10:30:00Z',
    status: 'approved',
    updatedBy: 'أحمد محمد'
  },
  {
    key: 'navigation.dashboard',
    category: 'navigation',
    arabicText: 'لوحة التحكم',
    englishText: 'Dashboard',
    context: 'Main navigation item',
    lastUpdated: '2024-01-19T14:15:00Z',
    status: 'approved',
    updatedBy: 'فاطمة علي'
  },
  {
    key: 'navigation.products',
    category: 'navigation',
    arabicText: 'المنتجات',
    englishText: 'Products',
    context: 'Navigation menu item',
    lastUpdated: '2024-01-18T16:45:00Z',
    status: 'complete',
    updatedBy: 'محمد القاضي'
  },
  {
    key: 'orders.status.pending',
    category: 'orders',
    arabicText: 'في الانتظار',
    englishText: 'Pending',
    context: 'Order status indicator',
    lastUpdated: '2024-01-17T09:20:00Z',
    status: 'approved',
    updatedBy: 'سارة أحمد'
  },
  {
    key: 'orders.status.confirmed',
    category: 'orders',
    arabicText: 'مؤكد',
    englishText: 'Confirmed',
    context: 'Order status indicator',
    lastUpdated: '2024-01-16T11:00:00Z',
    status: 'complete',
    updatedBy: 'عمر حسن'
  },
  {
    key: 'products.price',
    category: 'products',
    arabicText: 'السعر',
    englishText: 'Price',
    context: 'Product price label',
    lastUpdated: '2024-01-15T08:45:00Z',
    status: 'needs_review',
    updatedBy: 'نور الدين'
  },
  {
    key: 'notifications.new_order',
    category: 'notifications',
    arabicText: 'طلب جديد',
    englishText: 'New Order',
    context: 'Notification message',
    lastUpdated: '2024-01-14T13:30:00Z',
    status: 'incomplete',
    updatedBy: 'ليلى محمود'
  }
]

// Language Context
interface LanguageContextType {
  currentLanguage: string
  setLanguage: (lang: string) => void
  t: (key: string, fallback?: string) => string
  dir: 'ltr' | 'rtl'
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'ar',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  dir: 'rtl',
  isRTL: true
})

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Language Provider Component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('ar')
  const [translations, setTranslations] = useState<Translation[]>(mockTranslations)

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang)
    const selectedLang = supportedLanguages.find(l => l.code === lang)
    if (selectedLang) {
      document.dir = selectedLang.direction
      document.documentElement.lang = lang
      localStorage.setItem('preferred-language', lang)
    }
  }

  const t = (key: string, fallback?: string): string => {
    const translation = translations.find(t => t.key === key)
    if (!translation) return fallback || key

    return currentLanguage === 'ar' ? translation.arabicText : translation.englishText
  }

  const currentLangData = supportedLanguages.find(l => l.code === currentLanguage)
  const dir = currentLangData?.direction || 'rtl'
  const isRTL = dir === 'rtl'

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language')
    if (savedLang && supportedLanguages.find(l => l.code === savedLang)) {
      setLanguage(savedLang)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      dir,
      isRTL
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Language Switcher Component
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentLanguage, setLanguage } = useLanguage()

  return (
    <div className={`relative ${className}`}>
      <Select value={currentLanguage} onValueChange={setLanguage}>
        <SelectTrigger className="w-36">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {supportedLanguages.find(l => l.code === currentLanguage)?.flag}
            </span>
            <span className="text-sm">
              {supportedLanguages.find(l => l.code === currentLanguage)?.nativeName}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages
            .filter(lang => lang.isEnabled)
            .map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-stone-500">{lang.name}</div>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    lang.completionPercentage === 100 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }
                >
                  {lang.completionPercentage}%
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function MultiLanguageSupport() {
  const [translations, setTranslations] = useState<Translation[]>(mockTranslations)
  const [languages, setLanguages] = useState<Language[]>(supportedLanguages)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)

  const categories = Array.from(new Set(translations.map(t => t.category)))
  
  const filteredTranslations = translations.filter(translation => {
    const matchesSearch = searchTerm === '' || 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.arabicText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.englishText.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || translation.category === filterCategory
    const matchesStatus = filterStatus === 'all' || translation.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getLanguageStats = (): LanguageStats => {
    const totalKeys = translations.length
    const transtonedKeys = translations.filter(t => 
      t.status === 'complete' || t.status === 'approved'
    ).length
    const missingKeys = translations.filter(t => t.status === 'incomplete').length
    const needsReview = translations.filter(t => t.status === 'needs_review').length
    
    return {
      totalKeys,
      transtonedKeys,
      missingKeys,
      needsReview,
      completionPercentage: Math.round((transtonedKeys / totalKeys) * 100)
    }
  }

  const stats = getLanguageStats()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">موافق عليه</Badge>
      case 'complete':
        return <Badge className="bg-blue-100 text-blue-700">مكتمل</Badge>
      case 'needs_review':
        return <Badge className="bg-yellow-100 text-yellow-700">يحتاج مراجعة</Badge>
      case 'incomplete':
        return <Badge className="bg-red-100 text-red-700">غير مكتمل</Badge>
      default:
        return <Badge variant="outline">غير محدد</Badge>
    }
  }

  const toggleLanguage = (langCode: string) => {
    setLanguages(prev => prev.map(lang => 
      lang.code === langCode 
        ? { ...lang, isEnabled: !lang.isEnabled }
        : lang
    ))
  }

  const updateTranslation = (updatedTranslation: Translation) => {
    setTranslations(prev => prev.map(t => 
      t.key === updatedTranslation.key ? updatedTranslation : t
    ))
    setEditingTranslation(null)
  }

  const exportTranslations = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? JSON.stringify(translations, null, 2)
      : translations.map(t => `${t.key},${t.arabicText},${t.englishText},${t.status}`).join('\n')
    
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `translations.${format}`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <LanguageProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
              <Globe className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">إدارة اللغات والترجمة</h2>
              <p className="text-sm text-stone-600">
                {languages.filter(l => l.isEnabled).length} لغة مفعلة • {stats.completionPercentage}% مكتمل
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Languages className="w-3 h-3 mr-1" />
              متعدد اللغات
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" onClick={() => exportTranslations('json')}>
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{stats.totalKeys}</div>
                  <div className="text-sm text-stone-600">إجمالي المفاتيح</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.transtonedKeys}</div>
                  <div className="text-sm text-stone-600">مترجم</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
                  <div className="text-sm text-stone-600">يحتاج مراجعة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.missingKeys}</div>
                  <div className="text-sm text-stone-600">غير مكتمل</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="translations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translations">الترجمات</TabsTrigger>
            <TabsTrigger value="languages">اللغات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Translations Tab */}
          <TabsContent value="translations" className="space-y-4">
            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 text-stone-400 w-4 h-4" />
                    <Input
                      placeholder="البحث في الترجمات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-stone-500" />
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل التصنيفات</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الحالات</SelectItem>
                        <SelectItem value="approved">موافق عليه</SelectItem>
                        <SelectItem value="complete">مكتمل</SelectItem>
                        <SelectItem value="needs_review">يحتاج مراجعة</SelectItem>
                        <SelectItem value="incomplete">غير مكتمل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button size="sm" onClick={() => setShowBulkActions(!showBulkActions)}>
                    <Settings className="w-4 h-4 ml-2" />
                    إجراءات مجمعة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            <AnimatePresence>
              {showBulkActions && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      اعتماد الكل
                    </Button>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                      <Clock className="w-3 h-3 ml-1" />
                      تحديد للمراجعة
                    </Button>
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                      <Download className="w-3 h-3 ml-1" />
                      تصدير JSON
                    </Button>
                    <Button size="sm" variant="outline" className="text-purple-600 border-purple-300">
                      <Upload className="w-3 h-3 ml-1" />
                      استيراد
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Translations Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b">
                      <tr>
                        <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                          المفتاح
                        </th>
                        <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                          العربية
                        </th>
                        <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                          الإنجليزية
                        </th>
                        <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                          الحالة
                        </th>
                        <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                          آخر تحديث
                        </th>
                        <th className="text-right p-4 text-xs font-medium text-stone-500 uppercase">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredTranslations.map((translation) => (
                          <motion.tr
                            key={translation.key}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="border-b hover:bg-stone-50 cursor-pointer"
                            onClick={() => setSelectedTranslation(translation)}
                          >
                            <td className="p-4">
                              <div>
                                <div className="font-medium text-stone-900">{translation.key}</div>
                                <div className="text-xs text-stone-500">{translation.category}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-stone-900" dir="rtl">{translation.arabicText}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-stone-900" dir="ltr">{translation.englishText}</div>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(translation.status)}
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-stone-600">
                                {new Date(translation.lastUpdated).toLocaleDateString('ar-EG')}
                              </div>
                              <div className="text-xs text-stone-500">{translation.updatedBy}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTranslation(translation)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedTranslation(translation)
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(translation.key)
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {filteredTranslations.length === 0 && (
                  <div className="text-center py-12">
                    <Languages className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-600 mb-2">لا توجد ترجمات</h3>
                    <p className="text-stone-500">لم يتم العثور على ترجمات تطابق معايير البحث</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((language) => (
                <Card key={language.code} className={`
                  transition-all hover:shadow-lg
                  ${language.isEnabled ? 'border-green-200 bg-green-50/30' : 'border-stone-200'}
                `}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <h3 className="font-medium text-stone-900">{language.nativeName}</h3>
                          <p className="text-sm text-stone-500">{language.name}</p>
                        </div>
                      </div>
                      
                      <Switch
                        checked={language.isEnabled}
                        onCheckedChange={() => toggleLanguage(language.code)}
                      />
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">اكتمال الترجمة</span>
                        <span className="font-medium">{language.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${language.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {language.isDefault && (
                        <Badge className="bg-blue-100 text-blue-700">افتراضي</Badge>
                      )}
                      {language.direction === 'rtl' && (
                        <Badge variant="outline">RTL</Badge>
                      )}
                      <Badge variant="outline">{language.direction.toUpperCase()}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New Language */}
            <Card className="border-dashed border-2 border-stone-300 hover:border-stone-400 transition-colors">
              <CardContent className="p-6 text-center">
                <Plus className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <h3 className="font-medium text-stone-700 mb-1">إضافة لغة جديدة</h3>
                <p className="text-sm text-stone-500 mb-4">أضف دعم للغات إضافية</p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة لغة
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    الإعدادات العامة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">الكشف التلقائي للغة</div>
                        <div className="text-sm text-stone-500">كشف لغة المتصفح تلقائياً</div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">الترجمة المباشرة</div>
                        <div className="text-sm text-stone-500">ترجمة النصوص فوراً عند التبديل</div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">حفظ تفضيل اللغة</div>
                        <div className="text-sm text-stone-500">تذكر اللغة المختارة للزيارة القادمة</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Translation Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    أدوات الترجمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Upload className="w-4 h-4 ml-2" />
                      استيراد ملف ترجمة
                    </Button>

                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 ml-2" />
                      تصدير كل الترجمات
                    </Button>

                    <Button className="w-full" variant="outline">
                      <RefreshCw className="w-4 h-4 ml-2" />
                      مزامنة مع الخدمة الخارجية
                    </Button>

                    <Button className="w-full" variant="outline">
                      <Target className="w-4 h-4 ml-2" />
                      البحث عن مفاتيح مفقودة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Translation Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  إحصائيات الترجمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
                    <div className="text-sm text-stone-600">تصنيفات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{translations.length}</div>
                    <div className="text-sm text-stone-600">مفاتيح الترجمة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {languages.filter(l => l.isEnabled).length}
                    </div>
                    <div className="text-sm text-stone-600">لغات مفعلة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Translation Detail Modal */}
        <AnimatePresence>
          {selectedTranslation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedTranslation(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">تفاصيل الترجمة</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTranslation(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700">المفتاح</label>
                      <div className="mt-1 p-3 bg-stone-50 rounded-lg font-mono text-sm">
                        {selectedTranslation.key}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">التصنيف</label>
                      <div className="mt-1 p-3 bg-stone-50 rounded-lg">
                        {selectedTranslation.category}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">النص العربي</label>
                    <div className="mt-1 p-3 bg-stone-50 rounded-lg" dir="rtl">
                      {selectedTranslation.arabicText}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">النص الإنجليزي</label>
                    <div className="mt-1 p-3 bg-stone-50 rounded-lg" dir="ltr">
                      {selectedTranslation.englishText}
                    </div>
                  </div>

                  {selectedTranslation.context && (
                    <div>
                      <label className="text-sm font-medium text-stone-700">السياق</label>
                      <div className="mt-1 p-3 bg-blue-50 rounded-lg text-sm">
                        {selectedTranslation.context}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-stone-500">
                    <div>آخر تحديث: {new Date(selectedTranslation.lastUpdated).toLocaleDateString('ar-EG')}</div>
                    <div>بواسطة: {selectedTranslation.updatedBy}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setEditingTranslation(selectedTranslation)}>
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    <Button variant="outline">
                      <Copy className="w-4 h-4 ml-2" />
                      نسخ المفتاح
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Translation Modal */}
        <AnimatePresence>
          {editingTranslation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setEditingTranslation(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">تعديل الترجمة</h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTranslation(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-700">النص العربي</label>
                    <Input
                      dir="rtl"
                      value={editingTranslation.arabicText}
                      onChange={(e) => setEditingTranslation(prev => prev ? {
                        ...prev, 
                        arabicText: e.target.value
                      } : null)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">النص الإنجليزي</label>
                    <Input
                      dir="ltr"
                      value={editingTranslation.englishText}
                      onChange={(e) => setEditingTranslation(prev => prev ? {
                        ...prev,
                        englishText: e.target.value
                      } : null)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700">الحالة</label>
                    <Select 
                      value={editingTranslation.status} 
                      onValueChange={(value) => setEditingTranslation(prev => prev ? {
                        ...prev,
                        status: value as Translation['status']
                      } : null)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incomplete">غير مكتمل</SelectItem>
                        <SelectItem value="complete">مكتمل</SelectItem>
                        <SelectItem value="needs_review">يحتاج مراجعة</SelectItem>
                        <SelectItem value="approved">موافق عليه</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => editingTranslation && updateTranslation({
                        ...editingTranslation,
                        lastUpdated: new Date().toISOString(),
                        updatedBy: 'المستخدم الحالي'
                      })}
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </Button>
                    <Button variant="outline" onClick={() => setEditingTranslation(null)}>
                      إلغاء
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  )
}
