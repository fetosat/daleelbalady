'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bookmark,
  Clock,
  X,
  Edit3,
  Trash2,
  MapPin,
  Filter,
  Star,
  DollarSign,
  Calendar,
  ChevronRight,
  Plus,
  Heart,
  ExternalLink,
  Copy,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'

interface SavedSearch {
  id: string
  slug: string
  query: string
  description?: string
  metadata?: {
    location?: string
    priceRange?: [number, number]
    category?: string
    verified?: boolean
    hasReviews?: boolean
    createdAt?: string
    filters?: any
  }
  viewCount: number
  createdAt: string
  updatedAt: string
  services: any[]
}

interface SavedSearchesProps {
  isOpen?: boolean
  onClose?: () => void
  onSelectSearch?: (search: SavedSearch) => void
  currentSearchParams?: any
}

export default function SavedSearches({ 
  isOpen = false, 
  onClose, 
  onSelectSearch,
  currentSearchParams 
}: SavedSearchesProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  // State
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  
  // Save search form
  const [saveForm, setSaveForm] = useState({
    query: '',
    description: '',
    slug: ''
  })
  
  // Load saved searches and history
  useEffect(() => {
    loadSavedSearches()
    loadSearchHistory()
  }, [])
  
  // Populate form when editing
  useEffect(() => {
    if (editingSearch) {
      setSaveForm({
        query: editingSearch.query,
        description: editingSearch.description || '',
        slug: editingSearch.slug
      })
      setShowSaveDialog(true)
    }
  }, [editingSearch])
  
  // Auto-populate from current search params
  useEffect(() => {
    if (currentSearchParams && showSaveDialog && !editingSearch) {
      setSaveForm(prev => ({
        ...prev,
        query: currentSearchParams.q || '',
        slug: generateSlugFromQuery(currentSearchParams.q || '')
      }))
    }
  }, [currentSearchParams, showSaveDialog, editingSearch])
  
  const loadSavedSearches = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/search-cache')
      const data = await response.json()
      
      if (data.success) {
        setSavedSearches(data.searches || [])
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل البحثات المحفوظة' : 'Failed to load saved searches',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadSearchHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
      setSearchHistory(history.slice(0, 10)) // Last 10 searches
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }
  
  const saveSearch = async () => {
    try {
      if (!saveForm.query.trim()) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: isRTL ? 'يرجى إدخال استعلام البحث' : 'Please enter a search query',
          variant: 'destructive'
        })
        return
      }
      
      const payload = {
        query: saveForm.query.trim(),
        description: saveForm.description.trim() || undefined,
        slug: saveForm.slug.trim() || generateSlugFromQuery(saveForm.query),
        serviceIds: currentSearchParams?.results?.services?.map((s: any) => s.id) || [],
        metadata: {
          ...currentSearchParams?.filters,
          location: currentSearchParams?.location,
          createdAt: new Date().toISOString()
        }
      }
      
      const url = editingSearch 
        ? `/api/search-cache/${editingSearch.id}`
        : '/api/search-cache'
      
      const method = editingSearch ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: isRTL ? 'تم الحفظ' : 'Saved',
          description: isRTL ? 'تم حفظ البحث بنجاح' : 'Search saved successfully'
        })
        
        await loadSavedSearches()
        setShowSaveDialog(false)
        setEditingSearch(null)
        setSaveForm({ query: '', description: '', slug: '' })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Error saving search:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل في حفظ البحث' : 'Failed to save search'),
        variant: 'destructive'
      })
    }
  }
  
  const deleteSearch = async (searchId: string) => {
    try {
      const response = await fetch(`/api/search-cache/${searchId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: isRTL ? 'تم الحذف' : 'Deleted',
          description: isRTL ? 'تم حذف البحث' : 'Search deleted'
        })
        await loadSavedSearches()
      }
    } catch (error) {
      console.error('Error deleting search:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في حذف البحث' : 'Failed to delete search',
        variant: 'destructive'
      })
    }
  }
  
  const generateSlugFromQuery = (query: string): string => {
    return query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50)
  }
  
  const copySearchLink = async (search: SavedSearch) => {
    try {
      const url = `${window.location.origin}/search/${search.slug}`
      await navigator.clipboard.writeText(url)
      toast({
        title: isRTL ? 'تم النسخ' : 'Copied',
        description: isRTL ? 'تم نسخ رابط البحث' : 'Search link copied to clipboard'
      })
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }
  
  const addToSearchHistory = (searchParams: any) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
      const newEntry = {
        query: searchParams.q || '',
        filters: searchParams.filters || {},
        location: searchParams.location || '',
        timestamp: Date.now()
      }
      
      // Remove duplicates and add to beginning
      const filteredHistory = history.filter((h: any) => 
        h.query !== newEntry.query || JSON.stringify(h.filters) !== JSON.stringify(newEntry.filters)
      )
      
      const updatedHistory = [newEntry, ...filteredHistory].slice(0, 20) // Keep last 20
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory))
      setSearchHistory(updatedHistory.slice(0, 10))
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen py-8 px-4">
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bookmark className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {isRTL ? 'البحثات المحفوظة' : 'Saved Searches'}
                  </h2>
                  <p className="text-blue-100">
                    {isRTL ? 'إدارة وتنظيم بحثاتك المفضلة' : 'Manage and organize your favorite searches'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {currentSearchParams && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSaveDialog(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'حفظ البحث الحالي' : 'Save Current Search'}
                  </Button>
                )}
                
                <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-stone-500" />
                  {isRTL ? 'البحثات الأخيرة' : 'Recent Searches'}
                </h3>
                
                <div className="grid gap-2">
                  {searchHistory.slice(0, 5).map((historyItem, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                      onClick={() => onSelectSearch && onSelectSearch(historyItem)}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-stone-400" />
                        <span className="font-medium">{historyItem.query}</span>
                        {historyItem.location && (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            {historyItem.location}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </motion.div>
                  ))}
                </div>
                
                <Separator className="my-6" />
              </div>
            )}
            
            {/* Saved Searches */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  {isRTL ? 'البحثات المحفوظة' : 'Saved Searches'}
                  {savedSearches.length > 0 && (
                    <Badge variant="secondary">{savedSearches.length}</Badge>
                  )}
                </h3>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-8 h-8 text-stone-400" />
                  </motion.div>
                </div>
              ) : savedSearches.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-stone-600 mb-2">
                    {isRTL ? 'لا توجد بحثات محفوظة' : 'No saved searches'}
                  </h4>
                  <p className="text-stone-500 mb-4">
                    {isRTL ? 'ابدأ بحفظ بحثاتك المفضلة لسهولة الوصول إليها لاحقاً' : 'Start saving your favorite searches for quick access later'}
                  </p>
                  <Button onClick={() => setShowSaveDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'احفظ بحث جديد' : 'Save New Search'}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedSearches.map((search, index) => (
                    <motion.div
                      key={search.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => onSelectSearch && onSelectSearch(search)}
                            >
                              <h4 className="font-semibold text-lg mb-1">{search.query}</h4>
                              {search.description && (
                                <p className="text-stone-600 mb-3 text-sm">{search.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-3">
                                {search.metadata?.location && (
                                  <Badge variant="outline">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {search.metadata.location}
                                  </Badge>
                                )}
                                {search.metadata?.priceRange && (
                                  <Badge variant="outline">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {search.metadata.priceRange[0]}-{search.metadata.priceRange[1]}
                                  </Badge>
                                )}
                                {search.metadata?.verified && (
                                  <Badge variant="outline">
                                    <Star className="w-3 h-3 mr-1" />
                                    {isRTL ? 'متحقق منه' : 'Verified'}
                                  </Badge>
                                )}
                                {search.services.length > 0 && (
                                  <Badge variant="secondary">
                                    {search.services.length} {isRTL ? 'نتيجة' : 'results'}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-stone-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(search.createdAt).toLocaleDateString()}
                                </span>
                                <span>{search.viewCount} {isRTL ? 'مشاهدة' : 'views'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copySearchLink(search)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSearch(search)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSearch(search.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Save/Edit Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSearch 
                ? (isRTL ? 'تعديل البحث المحفوظ' : 'Edit Saved Search')
                : (isRTL ? 'حفظ البحث الحالي' : 'Save Current Search')
              }
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'أضف عنواناً ووصفاً لبحثك لسهولة العثور عليه لاحقاً'
                : 'Add a title and description to your search for easy access later'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="query">{isRTL ? 'استعلام البحث' : 'Search Query'}</Label>
              <Input
                id="query"
                value={saveForm.query}
                onChange={(e) => setSaveForm(prev => ({ 
                  ...prev, 
                  query: e.target.value,
                  slug: generateSlugFromQuery(e.target.value)
                }))}
                placeholder={isRTL ? 'ما تبحث عنه...' : 'What you\'re searching for...'}
              />
            </div>
            
            <div>
              <Label htmlFor="description">{isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}</Label>
              <Textarea
                id="description"
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isRTL ? 'وصف مختصر للبحث...' : 'A brief description of your search...'}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="slug">{isRTL ? 'الرابط المخصص' : 'Custom URL'}</Label>
              <Input
                id="slug"
                value={saveForm.slug}
                onChange={(e) => setSaveForm(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="search-url-slug"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={saveSearch}>
              <Bookmark className="w-4 h-4 mr-2" />
              {editingSearch 
                ? (isRTL ? 'تحديث' : 'Update')
                : (isRTL ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
