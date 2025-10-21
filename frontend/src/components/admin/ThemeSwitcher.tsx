'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Sun, Moon, Monitor, Palette, Settings, CheckCircle, 
  Sparkles, Eye, Contrast, Zap, RefreshCw
} from 'lucide-react'

interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  animations: boolean
  fontSize: 'sm' | 'base' | 'lg'
  density: 'compact' | 'comfortable' | 'spacious'
}

const colorPresets = [
  { name: 'الأزرق الكلاسيكي', primary: '#3B82F6', accent: '#1E40AF' },
  { name: 'الأخضر الطبيعي', primary: '#10B981', accent: '#047857' },
  { name: 'البنفسجي الحديث', primary: '#8B5CF6', accent: '#5B21B6' },
  { name: 'الوردي الناعم', primary: '#EC4899', accent: '#BE185D' },
  { name: 'البرتقالي النشط', primary: '#F59E0B', accent: '#D97706' },
  { name: 'الأحمر القوي', primary: '#EF4444', accent: '#DC2626' },
  { name: 'الفيروزي المميز', primary: '#06B6D4', accent: '#0891B2' },
  { name: 'النيلي العميق', primary: '#6366F1', accent: '#4F46E5' }
]

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeConfig>({
    mode: 'light',
    primaryColor: '#3B82F6',
    accentColor: '#1E40AF',
    borderRadius: 'md',
    animations: true,
    fontSize: 'base',
    density: 'comfortable'
  })

  const [previewMode, setPreviewMode] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme')
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme))
    }
  }, [])

  // Apply theme to document
  const applyTheme = async (themeConfig: ThemeConfig, preview = false) => {
    setIsApplying(true)

    // Apply CSS variables
    const root = document.documentElement
    
    // Mode
    if (themeConfig.mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Colors
    root.style.setProperty('--primary', themeConfig.primaryColor)
    root.style.setProperty('--accent', themeConfig.accentColor)

    // Border radius
    const radiusMap = { none: '0px', sm: '4px', md: '8px', lg: '12px' }
    root.style.setProperty('--radius', radiusMap[themeConfig.borderRadius])

    // Font size
    const fontSizeMap = { sm: '14px', base: '16px', lg: '18px' }
    root.style.setProperty('--base-font-size', fontSizeMap[themeConfig.fontSize])

    // Density (spacing)
    const densityMap = { compact: '0.75', comfortable: '1', spacious: '1.25' }
    root.style.setProperty('--spacing-scale', densityMap[themeConfig.density])

    // Animations
    if (!themeConfig.animations) {
      root.style.setProperty('--animation-duration', '0ms')
    } else {
      root.style.setProperty('--animation-duration', '200ms')
    }

    // Simulate application delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (!preview) {
      localStorage.setItem('admin-theme', JSON.stringify(themeConfig))
    }

    setIsApplying(false)
  }

  const handleThemeChange = (key: keyof ThemeConfig, value: any) => {
    const newTheme = { ...theme, [key]: value }
    setTheme(newTheme)
    
    if (previewMode) {
      applyTheme(newTheme, true)
    }
  }

  const applyCurrentTheme = () => {
    applyTheme(theme, false)
  }

  const resetToDefaults = () => {
    const defaultTheme: ThemeConfig = {
      mode: 'light',
      primaryColor: '#3B82F6',
      accentColor: '#1E40AF',
      borderRadius: 'md',
      animations: true,
      fontSize: 'base',
      density: 'comfortable'
    }
    setTheme(defaultTheme)
    applyTheme(defaultTheme, false)
  }

  const ThemeModeButton = ({ mode, icon: Icon, label }: { 
    mode: 'light' | 'dark' | 'system', 
    icon: any, 
    label: string 
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleThemeChange('mode', mode)}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${theme.mode === mode 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-stone-200 bg-white hover:border-stone-300'
        }
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon className={`w-6 h-6 ${theme.mode === mode ? 'text-blue-600' : 'text-stone-600'}`} />
        <span className={`text-sm font-medium ${theme.mode === mode ? 'text-blue-700' : 'text-stone-700'}`}>
          {label}
        </span>
      </div>
      {theme.mode === mode && (
        <motion.div
          layoutId="theme-mode-indicator"
          className="absolute top-2 right-2"
        >
          <CheckCircle className="w-4 h-4 text-blue-500" />
        </motion.div>
      )}
    </motion.button>
  )

  const ColorPreset = ({ preset }: { preset: { name: string, primary: string, accent: string } }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        handleThemeChange('primaryColor', preset.primary)
        handleThemeChange('accentColor', preset.accent)
      }}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-200
        ${theme.primaryColor === preset.primary 
          ? 'border-stone-400 bg-stone-50' 
          : 'border-stone-200 bg-white hover:border-stone-300'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: preset.primary }}
          />
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: preset.accent }}
          />
        </div>
        <span className="text-sm font-medium text-stone-700">{preset.name}</span>
      </div>
      {theme.primaryColor === preset.primary && (
        <motion.div
          layoutId="color-preset-indicator"
          className="absolute top-2 right-2"
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
        </motion.div>
      )}
    </motion.button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">تخصيص المظهر</h2>
            <p className="text-sm text-stone-600">شخصن مظهر لوحة التحكم حسب تفضيلاتك</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-stone-500" />
            <span className="text-sm text-stone-600">معاينة مباشرة</span>
            <Switch
              checked={previewMode}
              onCheckedChange={setPreviewMode}
            />
          </div>
          <Button 
            onClick={applyCurrentTheme} 
            disabled={isApplying}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isApplying ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري التطبيق...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                تطبيق الإعدادات
              </div>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              وضع المظهر
              <Badge variant="outline" className="text-xs">
                {theme.mode === 'light' ? 'فاتح' : theme.mode === 'dark' ? 'داكن' : 'تلقائي'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <ThemeModeButton mode="light" icon={Sun} label="فاتح" />
              <ThemeModeButton mode="dark" icon={Moon} label="داكن" />
              <ThemeModeButton mode="system" icon={Monitor} label="تلقائي" />
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                الوضع التلقائي يتبع إعدادات النظام الخاص بك
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contrast className="w-5 h-5 text-purple-600" />
              إعدادات المظهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">انحناء الحواف</label>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'sm', 'md', 'lg'] as const).map((radius) => (
                  <button
                    key={radius}
                    onClick={() => handleThemeChange('borderRadius', radius)}
                    className={`
                      p-2 border-2 text-xs font-medium transition-all
                      ${theme.borderRadius === radius 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }
                    `}
                    style={{ borderRadius: radius === 'none' ? '0' : radius === 'sm' ? '4px' : radius === 'md' ? '8px' : '12px' }}
                  >
                    {radius === 'none' ? 'بدون' : radius === 'sm' ? 'صغير' : radius === 'md' ? 'متوسط' : 'كبير'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">حجم الخط</label>
              <div className="grid grid-cols-3 gap-2">
                {(['sm', 'base', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleThemeChange('fontSize', size)}
                    className={`
                      p-2 border-2 text-xs font-medium transition-all rounded-md
                      ${theme.fontSize === size 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }
                    `}
                  >
                    {size === 'sm' ? 'صغير' : size === 'base' ? 'عادي' : 'كبير'}
                  </button>
                ))}
              </div>
            </div>

            {/* Density */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">كثافة العرض</label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => handleThemeChange('density', density)}
                    className={`
                      p-2 border-2 text-xs font-medium transition-all rounded-md
                      ${theme.density === density 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }
                    `}
                  >
                    {density === 'compact' ? 'مضغوط' : density === 'comfortable' ? 'مريح' : 'واسع'}
                  </button>
                ))}
              </div>
            </div>

            {/* Animations Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-stone-700">تفعيل الحركات</span>
              </div>
              <Switch
                checked={theme.animations}
                onCheckedChange={(checked) => handleThemeChange('animations', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            الألوان المحفوظة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {colorPresets.map((preset, index) => (
              <motion.div
                key={preset.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ColorPreset preset={preset} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-600" />
            ألوان مخصصة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">اللون الأساسي</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-stone-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">اللون الثانوي</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                  className="w-12 h-10 border border-stone-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.accentColor}
                  onChange={(e) => handleThemeChange('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-md text-sm"
                  placeholder="#1E40AF"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
        <div className="text-sm text-stone-600">
          آخر حفظ: {new Date().toLocaleString('ar-EG')}
        </div>
        <Button 
          onClick={resetToDefaults} 
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          إعادة تعيين الافتراضي
        </Button>
      </div>

      {/* Preview Mode Indicator */}
      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">وضع المعاينة مفعل</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Success */}
      <AnimatePresence>
        {isApplying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-stone-900">جاري تطبيق الإعدادات</h3>
                <p className="text-sm text-stone-600">يرجى الانتظار...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
