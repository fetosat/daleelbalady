'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Navigation,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target,
  Route,
  Filter,
  Eye,
  EyeOff,
  Settings,
  Maximize,
  Minimize,
  RefreshCw,
  Circle,
  Square,
  Crosshair,
  Compass
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)
const Rectangle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Rectangle),
  { ssr: false }
)
const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
)

interface Location {
  id: string
  name: string
  type: 'service' | 'shop' | 'user' | 'product'
  latitude: number
  longitude: number
  rating?: number
  verified?: boolean
  category?: string
  address?: string
  phone?: string
  description?: string
  image?: string
  price?: number
  isOpen?: boolean
}

interface SearchArea {
  type: 'circle' | 'rectangle' | 'polygon'
  center?: [number, number]
  radius?: number
  bounds?: [[number, number], [number, number]]
  polygon?: [number, number][]
}

interface MapLayer {
  id: string
  name: string
  nameAr: string
  url: string
  attribution: string
  maxZoom: number
  visible: boolean
  opacity: number
}

interface InteractiveMapSearchProps {
  initialCenter?: [number, number]
  initialZoom?: number
  locations: Location[]
  onLocationSelect?: (location: Location) => void
  onAreaSelect?: (area: SearchArea) => void
  onBoundsChange?: (bounds: [[number, number], [number, number]]) => void
  userLocation?: { latitude: number; longitude: number } | null
  isLoading?: boolean
  showControls?: boolean
  className?: string
}

// Map layers configuration
const MAP_LAYERS: MapLayer[] = [
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    nameAr: 'خريطة الشوارع',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    visible: true,
    opacity: 1
  },
  {
    id: 'satellite',
    name: 'Satellite',
    nameAr: 'القمر الصناعي',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    maxZoom: 18,
    visible: false,
    opacity: 1
  },
  {
    id: 'terrain',
    name: 'Terrain',
    nameAr: 'التضاريس',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: '© Stamen Design, © OpenStreetMap',
    maxZoom: 18,
    visible: false,
    opacity: 1
  }
]

// Cairo coordinates as default
const DEFAULT_CENTER: [number, number] = [30.0444, 31.2357]
const DEFAULT_ZOOM = 10

export default function InteractiveMapSearch({
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  locations = [],
  onLocationSelect,
  onAreaSelect,
  onBoundsChange,
  userLocation,
  isLoading = false,
  showControls = true,
  className = ''
}: InteractiveMapSearchProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const mapRef = useRef<any>(null)
  
  // Map state
  const [center, setCenter] = useState<[number, number]>(initialCenter)
  const [zoom, setZoom] = useState(initialZoom)
  const [layers, setLayers] = useState(MAP_LAYERS)
  const [activeLayer, setActiveLayer] = useState('openstreetmap')
  
  // Drawing state
  const [drawingMode, setDrawingMode] = useState<'none' | 'circle' | 'rectangle'>('none')
  const [searchArea, setSearchArea] = useState<SearchArea | null>(null)
  const [searchRadius, setSearchRadius] = useState<number>(1) // km
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showSearchArea, setShowSearchArea] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // Filter state
  const [locationFilters, setLocationFilters] = useState({
    types: ['service', 'shop', 'user', 'product'],
    verified: false,
    hasRating: false,
    minRating: 0,
    isOpen: false
  })
  
  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })
      
      const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude]
      setCenter(newCenter)
      
      if (mapRef.current) {
        mapRef.current.flyTo(newCenter, 15)
      }
      
      toast({
        title: isRTL ? 'تم العثور على موقعك' : 'Location Found',
        description: isRTL ? 'تم تحديث الخريطة لموقعك الحالي' : 'Map updated to your current location'
      })
      
    } catch (error) {
      console.error('Error getting location:', error)
      toast({
        title: isRTL ? 'خطأ في الموقع' : 'Location Error',
        description: isRTL ? 'لا يمكن الحصول على موقعك الحالي' : 'Cannot get your current location',
        variant: 'destructive'
      })
    }
  }, [isRTL])
  
  // Filter locations based on current filters
  const filteredLocations = locations.filter(location => {
    if (!locationFilters.types.includes(location.type)) return false
    if (locationFilters.verified && !location.verified) return false
    if (locationFilters.hasRating && !location.rating) return false
    if (locationFilters.minRating > 0 && (location.rating || 0) < locationFilters.minRating) return false
    if (locationFilters.isOpen && location.isOpen === false) return false
    return true
  })
  
  // Get marker color based on location type
  const getMarkerColor = (location: Location): string => {
    const colors = {
      service: '#3B82F6', // blue
      shop: '#10B981',    // green
      user: '#8B5CF6',    // purple
      product: '#F59E0B'  // amber
    }
    return colors[location.type] || colors.service
  }
  
  // Handle map click for drawing search areas
  const handleMapClick = useCallback((e: any) => {
    if (drawingMode === 'none') return
    
    const { lat, lng } = e.latlng
    
    if (drawingMode === 'circle') {
      const newSearchArea: SearchArea = {
        type: 'circle',
        center: [lat, lng],
        radius: searchRadius
      }
      setSearchArea(newSearchArea)
      onAreaSelect?.(newSearchArea)
      
      toast({
        title: isRTL ? 'تم تحديد منطقة البحث' : 'Search Area Selected',
        description: isRTL ? `نطاق ${searchRadius} كم` : `${searchRadius} km radius`
      })
    } else if (drawingMode === 'rectangle') {
      // For rectangle, we'll need to handle differently
      // This is a simplified version
      const offset = 0.01 // roughly 1km
      const newSearchArea: SearchArea = {
        type: 'rectangle',
        bounds: [
          [lat - offset, lng - offset],
          [lat + offset, lng + offset]
        ]
      }
      setSearchArea(newSearchArea)
      onAreaSelect?.(newSearchArea)
    }
    
    setDrawingMode('none')
  }, [drawingMode, searchRadius, onAreaSelect, isRTL])
  
  // Handle location marker click
  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location)
    onLocationSelect?.(location)
  }, [onLocationSelect])
  
  // Reset map to initial state
  const resetMap = useCallback(() => {
    setCenter(initialCenter)
    setZoom(initialZoom)
    setSearchArea(null)
    setDrawingMode('none')
    setSelectedLocation(null)
    
    if (mapRef.current) {
      mapRef.current.setView(initialCenter, initialZoom)
    }
  }, [initialCenter, initialZoom])
  
  // Update layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => ({
      ...layer,
      visible: layer.id === layerId ? !layer.visible : layer.visible
    })))
  }, [])
  
  // Change active base layer
  const changeBaseLayer = useCallback((layerId: string) => {
    setActiveLayer(layerId)
  }, [])
  
  // MapController component to handle map events
  const MapController = () => {
    const map = useMap()
    
    useEffect(() => {
      mapRef.current = map
      setMapLoaded(true)
      
      // Handle map events
      map.on('click', handleMapClick)
      map.on('moveend', () => {
        const newCenter = map.getCenter()
        setCenter([newCenter.lat, newCenter.lng])
      })
      map.on('zoomend', () => {
        setZoom(map.getZoom())
      })
      
      return () => {
        map.off('click', handleMapClick)
      }
    }, [map])
    
    return null
  }
  
  if (typeof window === 'undefined') {
    return (
      <div className={cn('h-96 bg-muted rounded-lg flex items-center justify-center', className)}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? 'جارٍ تحميل الخريطة...' : 'Loading map...'}
          </p>
        </div>
      </div>
    )
  }
  
  const activeLayerConfig = layers.find(l => l.id === activeLayer)
  
  return (
    <div className={cn('relative bg-background rounded-lg overflow-hidden', className)}>
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          {/* Layer Control */}
          <Card className="p-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                title={isRTL ? 'طبقات الخريطة' : 'Map Layers'}
              >
                <Layers className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={getCurrentLocation}
                title={isRTL ? 'موقعي الحالي' : 'My Location'}
              >
                <Navigation className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetMap}
                title={isRTL ? 'إعادة تعيين' : 'Reset Map'}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isRTL ? 'ملء الشاشة' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
          
          {/* Layer Panel */}
          <AnimatePresence>
            {showLayerPanel && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="w-64 p-4">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm">
                      {isRTL ? 'طبقات الخريطة' : 'Map Layers'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    {layers.map(layer => (
                      <div key={layer.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">
                            {isRTL ? layer.nameAr : layer.name}
                          </Label>
                          <Switch
                            checked={activeLayer === layer.id}
                            onCheckedChange={() => changeBaseLayer(layer.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Drawing Tools */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000]">
          <Card className="p-2">
            <div className="flex items-center gap-2">
              <Button
                variant={drawingMode === 'circle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDrawingMode(drawingMode === 'circle' ? 'none' : 'circle')}
                title={isRTL ? 'رسم دائرة بحث' : 'Draw Search Circle'}
              >
                <Circle className="h-4 w-4" />
              </Button>
              
              <Button
                variant={drawingMode === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDrawingMode(drawingMode === 'rectangle' ? 'none' : 'rectangle')}
                title={isRTL ? 'رسم مستطيل بحث' : 'Draw Search Rectangle'}
              >
                <Square className="h-4 w-4" />
              </Button>
              
              {searchArea && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchArea(null)}
                  title={isRTL ? 'مسح منطقة البحث' : 'Clear Search Area'}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
      
      {/* Search Radius Control */}
      {drawingMode === 'circle' && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Card className="p-4 w-64">
            <div className="space-y-2">
              <Label className="text-sm">
                {isRTL ? 'نطاق البحث' : 'Search Radius'}: {searchRadius} km
              </Label>
              <Slider
                value={[searchRadius]}
                onValueChange={(value) => setSearchRadius(value[0])}
                min={0.5}
                max={50}
                step={0.5}
                className="w-full"
              />
            </div>
          </Card>
        </div>
      )}
      
      {/* Location Filters */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {isRTL ? 'فلاتر' : 'Filters'}
                <Badge variant="secondary" className="ml-1">
                  {filteredLocations.length}
                </Badge>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isRTL ? 'فلاتر المواقع' : 'Location Filters'}
                </DialogTitle>
                <DialogDescription>
                  {isRTL ? 'تخصيص عرض المواقع على الخريطة' : 'Customize which locations to show on the map'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Location Types */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'أنواع المواقع' : 'Location Types'}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'service', labelEn: 'Services', labelAr: 'خدمات' },
                      { value: 'shop', labelEn: 'Shops', labelAr: 'متاجر' },
                      { value: 'user', labelEn: 'People', labelAr: 'أشخاص' },
                      { value: 'product', labelEn: 'Products', labelAr: 'منتجات' }
                    ].map(type => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type.value}
                          checked={locationFilters.types.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocationFilters(prev => ({
                                ...prev,
                                types: [...prev.types, type.value]
                              }))
                            } else {
                              setLocationFilters(prev => ({
                                ...prev,
                                types: prev.types.filter(t => t !== type.value)
                              }))
                            }
                          }}
                          className="rounded border-stone-300"
                        />
                        <Label htmlFor={type.value} className="text-sm">
                          {isRTL ? type.labelAr : type.labelEn}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quality Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      {isRTL ? 'موثق فقط' : 'Verified Only'}
                    </Label>
                    <Switch
                      checked={locationFilters.verified}
                      onCheckedChange={(checked) => 
                        setLocationFilters(prev => ({ ...prev, verified: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      {isRTL ? 'له تقييمات' : 'Has Reviews'}
                    </Label>
                    <Switch
                      checked={locationFilters.hasRating}
                      onCheckedChange={(checked) => 
                        setLocationFilters(prev => ({ ...prev, hasRating: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      {isRTL ? 'مفتوح الآن' : 'Open Now'}
                    </Label>
                    <Switch
                      checked={locationFilters.isOpen}
                      onCheckedChange={(checked) => 
                        setLocationFilters(prev => ({ ...prev, isOpen: checked }))
                      }
                    />
                  </div>
                </div>
                
                {/* Minimum Rating */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {isRTL ? 'التقييم الأدنى' : 'Minimum Rating'}: {locationFilters.minRating}
                  </Label>
                  <Slider
                    value={[locationFilters.minRating]}
                    onValueChange={(value) => 
                      setLocationFilters(prev => ({ ...prev, minRating: value[0] }))
                    }
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {/* Map */}
      <div className={cn(
        'h-96 w-full',
        isFullscreen && 'fixed inset-0 z-[9999] h-screen'
      )}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapController />
          
          {/* Base Layer */}
          {activeLayerConfig && (
            <TileLayer
              url={activeLayerConfig.url}
              attribution={activeLayerConfig.attribution}
              maxZoom={activeLayerConfig.maxZoom}
              opacity={activeLayerConfig.opacity}
            />
          )}
          
          {/* User Location */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
            >
              <Popup>
                <div className="text-center">
                  <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">
                    {isRTL ? 'موقعك الحالي' : 'Your Location'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Location Markers */}
          {filteredLocations.map(location => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              eventHandlers={{
                click: () => handleLocationClick(location)
              }}
            >
              <Popup>
                <div className="max-w-sm">
                  <div className="flex items-start gap-3">
                    {location.image && (
                      <img 
                        src={location.image} 
                        alt={location.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                      {location.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={cn(
                                  'text-xs',
                                  i < Math.floor(location.rating!) ? 'text-yellow-400' : 'text-stone-300'
                                )}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {location.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {location.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {location.description}
                        </p>
                      )}
                      {location.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location.address}
                        </p>
                      )}
                      {location.price && (
                        <p className="text-xs font-semibold text-green-600 mt-1">
                          ${location.price}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Search Area Overlay */}
          {searchArea && showSearchArea && (
            <>
              {searchArea.type === 'circle' && searchArea.center && (
                <Circle
                  center={searchArea.center}
                  radius={searchArea.radius! * 1000} // Convert km to meters
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />
              )}
              
              {searchArea.type === 'rectangle' && searchArea.bounds && (
                <Rectangle
                  bounds={searchArea.bounds}
                  pathOptions={{
                    color: '#10B981',
                    fillColor: '#10B981',
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />
              )}
            </>
          )}
        </MapContainer>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">
              {isRTL ? 'جارٍ البحث...' : 'Searching...'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
