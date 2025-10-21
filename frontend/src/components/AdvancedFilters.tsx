'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Shield,
  TrendingUp,
  Heart,
  Calendar,
  Users,
  Package,
  Building2,
  Zap,
  Award,
  Target,
  Navigation,
  Route
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'

export interface AdvancedFilters {
  // Basic filters
  verified?: boolean
  hasReviews?: boolean
  priceRange?: [number, number]
  
  // Quality filters
  minRating?: number
  minReviews?: number
  onlyRecommended?: boolean
  onlyTrending?: boolean
  onlyPopular?: boolean
  
  // Location filters
  useGeolocation?: boolean
  radius?: number
  city?: string
  area?: string
  
  // Service specific
  openNow?: boolean
  hasOffers?: boolean
  fastService?: boolean
  homeService?: boolean
  onlineService?: boolean
  
  // Time filters
  createdAfter?: string
  updatedAfter?: string
  
  // Advanced filters
  hasPhotos?: boolean
  hasWebsite?: boolean
  hasPhone?: boolean
  acceptsCards?: boolean
  hasParking?: boolean
  isAccessible?: boolean
  
  // Sorting and display
  sortBy?: 'relevance' | 'rating' | 'distance' | 'price' | 'popularity' | 'newest'
  resultsPerPage?: number
  
  // Entity specific
  entityTypes?: string[]
  categories?: string[]
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  onClearFilters: () => void
  isLoading?: boolean
  userLocation?: { latitude: number; longitude: number } | null
  availableCategories?: Array<{ id: string; name: string; count: number }>
  className?: string
}

const CITIES = [
  'Cairo', 'Alexandria', 'Giza', 'Shubra El Khema', 'Port Said',
  'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia', 'Fayyum',
  'Zagazig', 'Damanhur', 'Minya', 'Asyut', 'Qena', 'Sohag', 'Beni Suef',
  'Red Sea', 'Matrouh', 'New Valley', 'North Sinai', 'South Sinai'
]

const RADIUS_OPTIONS = [
  { value: 0.5, label: '500m' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' }
]

const SORT_OPTIONS = [
  { value: 'relevance', labelEn: 'Relevance', labelAr: 'الصلة' },
  { value: 'rating', labelEn: 'Highest Rated', labelAr: 'الأعلى تقييماً' },
  { value: 'distance', labelEn: 'Nearest', labelAr: 'الأقرب' },
  { value: 'price', labelEn: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
  { value: 'popularity', labelEn: 'Most Popular', labelAr: 'الأكثر شعبية' },
  { value: 'newest', labelEn: 'Newest First', labelAr: 'الأحدث أولاً' }
]

const ENTITY_TYPES = [
  { value: 'services', labelEn: 'Services', labelAr: 'الخدمات', icon: Building2 },
  { value: 'shops', labelEn: 'Shops', labelAr: 'المتاجر', icon: Building2 },
  { value: 'products', labelEn: 'Products', labelAr: 'المنتجات', icon: Package },
  { value: 'users', labelEn: 'People', labelAr: 'الأشخاص', icon: Users }
]

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
  userLocation,
  availableCategories = [],
  className = ''
}: AdvancedFiltersProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    'quality', 'location', 'sorting'
  ]))
  
  // Helper functions
  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }
  
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }
  
  const getActiveFiltersCount = () => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (key === 'priceRange' && Array.isArray(value)) {
        return value[0] > 0 || value[1] < 1000
      }
      if (key === 'entityTypes' && Array.isArray(value)) {
        return value.length > 0
      }
      if (key === 'categories' && Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null && value !== '' && value !== false
    })
    return activeFilters.length
  }
  
  const activeCount = getActiveFiltersCount()
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with clear filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            {isRTL ? 'فلاتر متقدمة' : 'Advanced Filters'}
          </h3>
          {activeCount > 0 && (
            <Badge variant="secondary">{activeCount}</Badge>
          )}
        </div>
        
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            {isRTL ? 'مسح الكل' : 'Clear All'}
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6 pr-4">
          
          {/* Entity Types Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {isRTL ? 'نوع النتائج' : 'Result Types'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {ENTITY_TYPES.map((type) => {
                  const IconComponent = type.icon
                  const isSelected = filters.entityTypes?.includes(type.value) ?? false
                  
                  return (
                    <Button
                      key={type.value}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start h-auto p-3"
                      onClick={() => {
                        const currentTypes = filters.entityTypes || []
                        const newTypes = isSelected
                          ? currentTypes.filter(t => t !== type.value)
                          : [...currentTypes, type.value]
                        updateFilter('entityTypes', newTypes)
                      }}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      <span className="text-xs">
                        {isRTL ? type.labelAr : type.labelEn}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Quality Filters */}
          <Collapsible
            open={expandedSections.has('quality')}
            onOpenChange={() => toggleSection('quality')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {isRTL ? 'فلاتر الجودة' : 'Quality Filters'}
                    </div>
                    {expandedSections.has('quality') ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  
                  {/* Rating Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'التقييم الأدنى' : 'Minimum Rating'}
                      {filters.minRating && (
                        <span className="text-muted-foreground ml-2">
                          {filters.minRating} {isRTL ? 'نجوم' : 'stars'}
                        </span>
                      )}
                    </Label>
                    <Slider
                      value={[filters.minRating || 0]}
                      onValueChange={(value) => updateFilter('minRating', value[0])}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span>5</span>
                    </div>
                  </div>
                  
                  {/* Quality toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <Label className="text-sm">
                          {isRTL ? 'موثق فقط' : 'Verified Only'}
                        </Label>
                      </div>
                      <Switch
                        checked={filters.verified || false}
                        onCheckedChange={(checked) => updateFilter('verified', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Label className="text-sm">
                          {isRTL ? 'له تقييمات' : 'Has Reviews'}
                        </Label>
                      </div>
                      <Switch
                        checked={filters.hasReviews || false}
                        onCheckedChange={(checked) => updateFilter('hasReviews', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <Label className="text-sm">
                          {isRTL ? 'موصى به فقط' : 'Recommended Only'}
                        </Label>
                      </div>
                      <Switch
                        checked={filters.onlyRecommended || false}
                        onCheckedChange={(checked) => updateFilter('onlyRecommended', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <Label className="text-sm">
                          {isRTL ? 'رائج' : 'Trending'}
                        </Label>
                      </div>
                      <Switch
                        checked={filters.onlyTrending || false}
                        onCheckedChange={(checked) => updateFilter('onlyTrending', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-600" />
                        <Label className="text-sm">
                          {isRTL ? 'شائع' : 'Popular'}
                        </Label>
                      </div>
                      <Switch
                        checked={filters.onlyPopular || false}
                        onCheckedChange={(checked) => updateFilter('onlyPopular', checked)}
                      />
                    </div>
                  </div>
                  
                  {/* Minimum Reviews */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'عدد التقييمات الأدنى' : 'Minimum Reviews'}
                      {filters.minReviews && (
                        <span className="text-muted-foreground ml-2">
                          {filters.minReviews}+
                        </span>
                      )}
                    </Label>
                    <Select
                      value={filters.minReviews?.toString() || ''}
                      onValueChange={(value) => updateFilter('minReviews', value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? 'اختر العدد الأدنى' : 'Select minimum count'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{isRTL ? 'أي عدد' : 'Any amount'}</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                        <SelectItem value="25">25+</SelectItem>
                        <SelectItem value="50">50+</SelectItem>
                        <SelectItem value="100">100+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Location Filters */}
          <Collapsible
            open={expandedSections.has('location')}
            onOpenChange={() => toggleSection('location')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isRTL ? 'فلاتر الموقع' : 'Location Filters'}
                    </div>
                    {expandedSections.has('location') ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  
                  {/* Use current location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm">
                        {isRTL ? 'استخدام موقعي الحالي' : 'Use My Current Location'}
                      </Label>
                    </div>
                    <Switch
                      checked={filters.useGeolocation || false}
                      onCheckedChange={(checked) => updateFilter('useGeolocation', checked)}
                      disabled={!userLocation}
                    />
                  </div>
                  
                  {/* Radius selection */}
                  {filters.useGeolocation && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {isRTL ? 'نطاق البحث' : 'Search Radius'}
                      </Label>
                      <Select
                        value={filters.radius?.toString() || '5'}
                        onValueChange={(value) => updateFilter('radius', parseFloat(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RADIUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* City selection */}
                  {!filters.useGeolocation && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        {isRTL ? 'المدينة' : 'City'}
                      </Label>
                      <Select
                        value={filters.city || ''}
                        onValueChange={(value) => updateFilter('city', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر المدينة' : 'Select city'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{isRTL ? 'جميع المدن' : 'All Cities'}</SelectItem>
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Area input */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'المنطقة' : 'Area'}
                    </Label>
                    <Input
                      placeholder={isRTL ? 'اكتب اسم المنطقة' : 'Enter area name'}
                      value={filters.area || ''}
                      onChange={(e) => updateFilter('area', e.target.value || undefined)}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Price Range */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {isRTL ? 'نطاق الأسعار' : 'Price Range'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  ${filters.priceRange?.[0] || 0} - ${filters.priceRange?.[1] || 1000}
                </Label>
                <Slider
                  value={filters.priceRange || [0, 1000]}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Service Features */}
          <Collapsible
            open={expandedSections.has('features')}
            onOpenChange={() => toggleSection('features')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      {isRTL ? 'ميزات الخدمة' : 'Service Features'}
                    </div>
                    {expandedSections.has('features') ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <Label className="text-sm">
                        {isRTL ? 'مفتوح الآن' : 'Open Now'}
                      </Label>
                    </div>
                    <Switch
                      checked={filters.openNow || false}
                      onCheckedChange={(checked) => updateFilter('openNow', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-600" />
                      <Label className="text-sm">
                        {isRTL ? 'له عروض' : 'Has Offers'}
                      </Label>
                    </div>
                    <Switch
                      checked={filters.hasOffers || false}
                      onCheckedChange={(checked) => updateFilter('hasOffers', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm">
                        {isRTL ? 'خدمة سريعة' : 'Fast Service'}
                      </Label>
                    </div>
                    <Switch
                      checked={filters.fastService || false}
                      onCheckedChange={(checked) => updateFilter('fastService', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm">
                        {isRTL ? 'خدمة منزلية' : 'Home Service'}
                      </Label>
                    </div>
                    <Switch
                      checked={filters.homeService || false}
                      onCheckedChange={(checked) => updateFilter('homeService', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-indigo-600" />
                      <Label className="text-sm">
                        {isRTL ? 'خدمة اونلاين' : 'Online Service'}
                      </Label>
                    </div>
                    <Switch
                      checked={filters.onlineService || false}
                      onCheckedChange={(checked) => updateFilter('onlineService', checked)}
                    />
                  </div>
                  
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {/* Sorting */}
          <Collapsible
            open={expandedSections.has('sorting')}
            onOpenChange={() => toggleSection('sorting')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {isRTL ? 'الترتيب والعرض' : 'Sorting & Display'}
                    </div>
                    {expandedSections.has('sorting') ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  
                  {/* Sort by */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'ترتيب حسب' : 'Sort by'}
                    </Label>
                    <Select
                      value={filters.sortBy || 'relevance'}
                      onValueChange={(value) => updateFilter('sortBy', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {isRTL ? option.labelAr : option.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Results per page */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {isRTL ? 'النتائج في الصفحة' : 'Results per page'}
                    </Label>
                    <Select
                      value={filters.resultsPerPage?.toString() || '12'}
                      onValueChange={(value) => updateFilter('resultsPerPage', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
        </div>
      </ScrollArea>
    </div>
  )
}
