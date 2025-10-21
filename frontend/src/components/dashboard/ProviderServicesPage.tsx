import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Upload,
  Image as ImageIcon,
  Save,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Settings,
  Zap,
  BookOpen,
  Heart,
  MessageCircle,
  PhoneCall,
  Mail,
  ExternalLink,
  Share2,
  Bookmark,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/lib/auth';
import { provider, categories as categoriesApi } from '@/lib/api';
import { uploadMultipleImages } from '@/utils/apiClient';
import MapPickerLeaflet from '@/components/common/MapPickerLeaflet';
import ServiceViewPage from '@/components/dashboard/ServiceViewPage';
import { debugUserRole, canAccessProviderFeatures, getProviderFeatureErrorMessage } from '@/utils/roleUtils';
import RoleUpgradeCard from '@/components/ui/RoleUpgradeCard';

// Types
export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  rating?: number;
  totalBookings?: number;
  images?: string[];
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDTO {
  name: string;
  category: string;
  description?: string;
  price: number;
  duration: number;
  isActive?: boolean;
  shopId?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  images?: File[];
}

// Default fallback categories (used if backend categories are unavailable)
const defaultServiceCategoryKeys = [
  'cleaning',
  'maintenance',
  'plumbing',
  'electrical',
  'painting',
  'gardening',
  'moving',
  'repair',
  'pestControl',
  'other'
];

// Days of week will be transtoned dynamically
const daysOfWeekKeys = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

// Helper functions for safe calculations
const calculateTotalBookings = (services: ProviderService[]): number => {
  return services.reduce((sum, service) => sum + (service.totalBookings || 0), 0);
};

const calculateAverageRating = (services: ProviderService[]): string => {
  if (services.length === 0) return '0.0';
  
  const validRatings = services.filter(s => s.rating && s.rating > 0);
  if (validRatings.length === 0) return '0.0';
  
  const totalRating = validRatings.reduce((sum, service) => sum + (service.rating || 0), 0);
  return (totalRating / validRatings.length).toFixed(1);
};

const calculateTotalRevenue = (services: ProviderService[]): number => {
  return services.reduce((sum, service) => {
    const bookings = service.totalBookings || 0;
    const price = service.price || 0;
    return sum + (bookings * price);
  }, 0);
};

// Safe number formatter
const safeNumber = (value: any, fallback = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

// Safe percentage formatter
const safePercentage = (value: any): string => {
  const num = safeNumber(value, 0);
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
};

export default function ProviderServicesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [services, setServices] = useState<ProviderService[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>(defaultServiceCategoryKeys);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [viewServiceId, setViewServiceId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('services');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Enhanced analytics state
  const [serviceStats, setServiceStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    topPerformingService: null as any,
    categoryDistribution: [] as any[],
    performanceMetrics: {
      thisMonth: { bookings: 0, revenue: 0 },
      lastMonth: { bookings: 0, revenue: 0 },
      growth: { bookings: 0, revenue: 0 }
    }
  });
  
  // Chart data for analytics
  const [chartData, setChartData] = useState({
    servicePerformance: [] as any[],
    monthlyBookings: [] as any[],
    categoryAnalytics: [] as any[],
    ratingDistribution: [] as any[],
    revenueByService: [] as any[]
  });
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    duration: '60',
    durationMins: '60',
    available: true,
    isdefault: false,
    currency: 'EGP',
    shopId: '', // Shop ID for the service (empty = independent)
    city: '',
    area: '',
    address: '',
    phone: '',
    locationLat: '',
    locationLon: '',
    coverImage: '',
    logoImage: '',
    galleryImages: [] as string[],
    tags: [] as string[],
    isActive: true,
    availability: {
      days: [] as string[],
      startTime: '09:00',
      endTime: '18:00'
    },
    images: [] as File[]
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch shops and categories on mount
  useEffect(() => {
    const fetchShopsAndCategories = async () => {
      // Skip if user doesn't have provider access
      if (!user || !canAccessProviderFeatures(user.role)) {
        console.log('⚠️ Skipping shops fetch - user not eligible');
        return;
      }

      try {
        console.log('🔄 Fetching shops & service categories for provider dashboard...');
        debugUserRole(user);
        
        // Fetch shops
        const response = await provider.getShops();
        if (response.shops && Array.isArray(response.shops)) {
          setShops(response.shops);
          console.log('✅ Successfully fetched', response.shops.length, 'shops');
        } else {
          console.log('⚠️ No shops found or invalid response:', response);
          setShops([]);
        }

        // Fetch service categories (provider endpoint preferred, fallback to global categories)
        let cats: any[] = [];
        try {
          const catsRes = await provider.getServiceCategories();
          cats = Array.isArray(catsRes?.categories)
            ? catsRes.categories
            : Array.isArray(catsRes)
              ? catsRes
              : [];
        } catch (_) {
          // ignore
        }
        
        if (cats.length === 0) {
          try {
            const globalCats = await categoriesApi.getAll();
            cats = Array.isArray(globalCats?.categories)
              ? globalCats.categories
              : Array.isArray(globalCats)
                ? globalCats
                : [];
          } catch (_) {}
        }

        if (cats.length > 0) {
          const normalizedCats = cats
            .map((c: any) => (typeof c === 'string' ? c : (c?.slug || c?.key || c?.name || c?.id)))
            .filter(Boolean);
          setServiceCategories(normalizedCats);
          console.log('✅ Service categories loaded:', normalizedCats);
        } else {
          console.log('ℹ️ Using default categories');
          setServiceCategories(defaultServiceCategoryKeys);
        }
      } catch (error: any) {
        console.error('❌ Error fetching shops:', error);
        
        // Handle role-based errors
        if (error.message?.includes('Only providers can access')) {
          const errorMessage = getProviderFeatureErrorMessage(user?.role || 'GUEST');
          toast({
            title: 'Access Denied',
            description: errorMessage,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load shops. Please try again or contact support.',
            variant: 'destructive'
          });
        }
      }
    };
    
    // Only fetch if user has appropriate role
    if (user && canAccessProviderFeatures(user.role)) {
      fetchShopsAndCategories();
    } else if (user) {
      console.log('⚠️ User role', user.role, 'not eligible for provider features');
      setIsLoading(false);
    }
  }, [user, toast]);

  // Helper functions
  const formatCurrency = (amount: any) => {
    const safeAmount = safeNumber(amount, 0);
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(safeAmount);
  };
  
  const formatPercentage = (value: any) => {
    return safePercentage(value);
  };
  
  const getGrowthIcon = (value: number) => {
    return value > 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />;
  };
  
  const getGrowthColor = (value: number) => {
    return value > 0 ? 'text-green-500' : 'text-red-500';
  };
  
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-stone-300'
        }`} 
      />
    ));
  };
  
  // Calculate analytics from real service data
  const calculateAnalyticsFromServices = (servicesData: ProviderService[]) => {
    if (servicesData.length === 0) {
      // Set empty state
      setServiceStats({
        totalServices: 0,
        activeServices: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        topPerformingService: null,
        categoryDistribution: [],
        performanceMetrics: {
          thisMonth: { bookings: 0, revenue: 0 },
          lastMonth: { bookings: 0, revenue: 0 },
          growth: { bookings: 0, revenue: 0 }
        }
      });
      
      setChartData({
        servicePerformance: [],
        monthlyBookings: [],
        categoryAnalytics: [],
        ratingDistribution: [],
        revenueByService: []
      });
      return;
    }

    // Calculate real stats from services
    const totalBookings = calculateTotalBookings(servicesData);
    const totalRevenue = calculateTotalRevenue(servicesData);
    const avgRating = parseFloat(calculateAverageRating(servicesData));
    const activeServices = servicesData.filter(s => s.isActive).length;
    
    // Find top performing service
    const topService = servicesData.reduce((top, service) => {
      const serviceRevenue = (service.totalBookings || 0) * (service.price || 0);
      const topRevenue = (top.totalBookings || 0) * (top.price || 0);
      return serviceRevenue > topRevenue ? service : top;
    }, servicesData[0]);
    
    setServiceStats({
      totalServices: servicesData.length,
      activeServices,
      totalBookings,
      totalRevenue,
      averageRating: avgRating,
      topPerformingService: topService ? {
        name: topService.name,
        bookings: topService.totalBookings || 0,
        revenue: (topService.totalBookings || 0) * (topService.price || 0),
        rating: topService.rating || 0
      } : null,
      categoryDistribution: [],
      performanceMetrics: {
        thisMonth: { bookings: 0, revenue: 0 },
        lastMonth: { bookings: 0, revenue: 0 },
        growth: { bookings: 0, revenue: 0 }
      }
    });
    
    // Service performance data from real services
    const servicePerformance = servicesData.map(service => ({
      name: service.name,
      bookings: service.totalBookings || 0,
      revenue: (service.totalBookings || 0) * (service.price || 0),
      rating: service.rating || 0
    }));
    
    setChartData({
      servicePerformance,
      monthlyBookings: [],
      categoryAnalytics: [],
      ratingDistribution: [],
      revenueByService: servicePerformance
    });
  };
  
  // Fetch services from backend
  const fetchServices = async () => {
    // Only fetch services if user has provider access
    if (!user || !canAccessProviderFeatures(user.role)) {
      console.log('⚠️ Skipping services fetch - user not eligible');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await provider.getServices({
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: activeFilter !== 'all' ? activeFilter : undefined,
      });
      
      // Handle response - it might be paginated or just an array
      const servicesData = response.services || response.data || response;
      const servicesArray = Array.isArray(servicesData) ? servicesData : [];
      
      // Process each service to extract images properly
      const processedServices = servicesArray.map(service => {
        const images = [];
        
        // Try to get images from galleryImages field
        if (service.galleryImages) {
          try {
            const gallery = typeof service.galleryImages === 'string' 
              ? JSON.parse(service.galleryImages) 
              : service.galleryImages;
            if (Array.isArray(gallery)) {
              images.push(...gallery);
            }
          } catch (e) {
            // If parsing fails, treat as single image
            if (typeof service.galleryImages === 'string') {
              images.push(service.galleryImages);
            }
          }
        }
        
        // Add coverImage if not already in array
        if (service.coverImage && !images.includes(service.coverImage)) {
          images.unshift(service.coverImage);
        }
        
        // Add logoImage if exists
        if (service.logoImage && !images.includes(service.logoImage)) {
          images.push(service.logoImage);
        }
        
        return {
          ...service,
          images: images
        };
      });
      
      // Debug: Log raw API response
      console.log('🔍 Raw API Response:', {
        response: response,
        servicesData: servicesData,
        servicesArray: servicesArray,
        processedServices: processedServices,
        firstService: processedServices[0] || null
      });
      
      console.log('✅ Fetched', processedServices.length, 'services from backend');
      
      // Debug: Log all services structure to understand the data
      console.log('📝 All services data structure:', processedServices.map((service, index) => ({
        index: index + 1,
        id: service.id,
        name: service.name,
        hasImages: !!service.images && service.images.length > 0,
        imagesCount: service.images?.length || 0,
        coverImage: service.coverImage,
        galleryImages: service.galleryImages
      })));
      
      // Debug: Log services with images
      const servicesWithImages = processedServices.filter(s => s.images && s.images.length > 0);
      console.log('📷 Services with images:', servicesWithImages.length);
      servicesWithImages.forEach((service, index) => {
        console.log(`📷 Service ${index + 1} (${service.name}):`, {
          id: service.id,
          name: service.name,
          images: service.images,
          imageCount: service.images?.length || 0,
          // Test image URL construction
          firstImageUrl: service.images?.[0] ? (
            service.images[0].startsWith('http') 
              ? service.images[0] 
              : `${process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com/api'}${service.images[0].startsWith('/') ? service.images[0] : '/' + service.images[0]}`
          ) : null
        });
      });
      
      console.log('🌍 API Configuration for images:', {
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
        fallback: 'https://api.daleelbalady.com/api'
      });
      
      setServices(processedServices);
      
      // Calculate analytics from real data
      calculateAnalyticsFromServices(processedServices);
      
    } catch (error: any) {
      console.error('❌ Error fetching services:', error);
      
      // Set empty array for no services found
      if (error?.response?.status === 404) {
        console.log('ℹ️ No services found (404), showing empty state');
        setServices([]);
        calculateAnalyticsFromServices([]);
      } else {
        toast({
          title: 'خطأ',
          description: error?.response?.data?.message || error?.message || 'فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى.',
          variant: 'destructive'
        });
        setServices([]);
        calculateAnalyticsFromServices([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && canAccessProviderFeatures(user.role)) {
      fetchServices();
    } else {
      setIsLoading(false);
    }
  }, [user, searchQuery, selectedCategory, activeFilter]);

  const handleAddService = async () => {
    try {
      // Reset previous validation errors
      setValidationErrors([]);
      
      // Validate form using the enhanced validation from API
      const errors = provider.validateService(formData);
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        
        // Show validation errors as a toast
        toast({
          title: 'خطأ في البيانات',
          description: `يجب تعبئة الحقول التالية: ${errors.join('، ')}`,
          variant: 'destructive'
        });
        return;
      }

      // Upload images first if any (like products do)
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        console.log('📷 Uploading images first...');
        try {
          imageUrls = await uploadMultipleImages(formData.images);
          console.log('✅ Images uploaded successfully:', imageUrls);
        } catch (error) {
          console.error('❌ Error uploading images:', error);
          toast({
            title: 'تحذير',
            description: 'فشل رفع بعض الصور. سيتم إنشاء الخدمة بدون صور.',
            variant: 'destructive'
          });
        }
      }

      const serviceData: any = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: formData.price ? parseFloat(formData.price) : 0,
        duration: formData.duration ? parseInt(formData.duration) : 60,
        isActive: formData.isActive || true,
        shopId: formData.shopId || undefined,
        availability: formData.availability,
        images: imageUrls.length > 0 ? imageUrls : undefined // Use uploaded URLs instead of files
      };

      if (!formData.shopId) {
        serviceData.city = formData.city?.trim() || undefined;
        serviceData.area = formData.area?.trim() || undefined;
        serviceData.address = formData.address?.trim() || undefined;
        serviceData.phone = formData.phone?.trim() || undefined;
        serviceData.locationLat = formData.locationLat?.trim() || undefined;
        serviceData.locationLon = formData.locationLon?.trim() || undefined;
      }

      console.log('📤 Creating service with data:', serviceData);
      console.log('📷 Images to upload:', {
        count: formData.images.length,
        files: formData.images.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      const response = await provider.createService(serviceData);
      console.log('✅ Service created successfully:', response);
      
      // Debug: Check if created service has images
      if (response?.service) {
        console.log('📷 Created service images:', {
          serviceId: response.service.id,
          serviceName: response.service.name,
          images: response.service.images,
          imageCount: response.service.images?.length || 0,
          coverImage: response.service.coverImage,
          galleryImages: response.service.galleryImages,
          logoImage: response.service.logoImage
        });
        
        // Manually refresh to get the updated data with images
        setTimeout(() => {
          fetchServices();
        }, 1000);
      }
      
      // Refresh services list
      await fetchServices();
      
      setIsAddDialogOpen(false);
      resetForm();
      setValidationErrors([]);

      toast({
        title: 'نجح العملية',
        description: 'تم إضافة الخدمة بنجاح!',
      });
    } catch (error: any) {
      console.error('❌ Error adding service:', error);
      toast({
        title: 'خطأ',
        description: error?.response?.data?.message || error?.message || 'فشل في إضافة الخدمة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      });
    }
  };

  const handleEditService = async () => {
    if (!selectedService) return;

    try {
      // Validate required fields
      const validationErrors = provider.validateService(formData);
      if (validationErrors.length > 0) {
        setValidationErrors(validationErrors);
        toast({
          title: 'خطأ في التحقق',
          description: 'بعض الحقول مطلوبة. يرجى ملء جميع الحقول المطلوبة.',
          variant: 'destructive'
        });
        return;
      }

      // Upload new images if any
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        try {
          imageUrls = await uploadMultipleImages(formData.images);
          console.log('✅ Images uploaded:', imageUrls);
        } catch (error) {
          console.error('Error uploading images:', error);
        }
      }

      console.log('📤 Updating service with data:', {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        durationMins: parseInt(formData.duration),
        isActive: formData.isActive,
        available: formData.isActive,
        shopId: formData.shopId,
        city: formData.city,
        area: formData.area,
        address: formData.address,
        phone: formData.phone,
        locationLat: formData.locationLat ? parseFloat(formData.locationLat) : null,
        locationLon: formData.locationLon ? parseFloat(formData.locationLon) : null,
        currency: formData.currency || 'EGP',
        availability: formData.availability
      });

      const updateData: any = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        isActive: formData.isActive,
        shopId: formData.shopId,
        availability: formData.availability,
        ...(imageUrls.length > 0 && { images: imageUrls }) // Only add images if new ones were uploaded
      };

      const result = await provider.updateService(selectedService.id, updateData);
      console.log('✅ Service updated successfully:', result);
      
      // Refresh services list
      await fetchServices();
      
      setIsEditDialogOpen(false);
      setSelectedService(null);
      resetForm();
      setValidationErrors([]);

      toast({
        title: 'نجح العملية',
        description: 'تم تحديث الخدمة بنجاح!',
      });
    } catch (error: any) {
      console.error('❌ Error updating service:', error);
      toast({
        title: 'خطأ',
        description: error?.response?.data?.message || error?.message || 'فشل في تحديث الخدمة. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this service?')) {
        return;
      }

      await provider.deleteService(serviceId);
      
      // Refresh services list
      await fetchServices();
      
      toast({
        title: 'Success',
        description: 'Service deleted successfully!',
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete service. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    console.log('🔄 Toggle service status called for ID:', serviceId);
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        console.log('❌ Service not found with ID:', serviceId);
        return;
      }
      
      console.log('📋 Service found:', service.name, 'Current status:', service.isActive);
      console.log('🌐 Calling API to toggle service status...');
      
      await provider.toggleServiceStatus(serviceId);
      
      console.log('✅ API call successful, refreshing services...');
      
      // Refresh services list
      await fetchServices();
      
      console.log('🔄 Services refreshed');
      
      toast({
        title: 'Success',
        description: `Service ${service.isActive ? 'deactivated' : 'activated'} successfully!`,
      });
    } catch (error: any) {
      console.error('❌ Error toggling service status:', error);
      console.error('❌ Error details:', error?.response?.data);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update service status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (service: ProviderService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      isActive: service.isActive,
      shopId: '',
      city: '',
      area: '',
      address: '',
      phone: '',
      locationLat: '',
      locationLon: '',
      coverImage: '',
      logoImage: '',
      galleryImages: [] as string[],
      tags: [] as string[],
      availability: service.availability || {
        days: [],
        startTime: '09:00',
        endTime: '18:00'
      },
      images: []
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (serviceId: string) => {
    setViewServiceId(serviceId);
    setIsViewDialogOpen(true);
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewServiceId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      duration: '60',
      durationMins: '60',
      available: true,
      isdefault: false,
      currency: 'EGP',
      shopId: '',
      city: '',
      area: '',
      address: '',
      phone: '',
      locationLat: '',
      locationLon: '',
      coverImage: '',
      logoImage: '',
      galleryImages: [] as string[],
      tags: [] as string[],
      isActive: true,
      availability: {
        days: [] as string[],
        startTime: '09:00',
        endTime: '18:00'
      },
      images: [] as File[]
    });
    setValidationErrors([]);
  };

  const handleDayToggle = (day: string) => {
    const days = formData.availability.days.includes(day)
      ? formData.availability.days.filter(d => d !== day)
      : [...formData.availability.days, day];
    
    setFormData({
      ...formData,
      availability: { ...formData.availability, days }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('📷 Image files selected:', {
        count: files.length,
        files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
      
      setFormData({
        ...formData,
        images: Array.from(files)
      });
    }
  };

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesStatus = activeFilter === 'all' ||
                          (activeFilter === 'active' && service.isActive) ||
                          (activeFilter === 'inactive' && !service.isActive);
    
    // Shop filter logic - shopId not available in ProviderService
    const matchesShop = selectedShop === 'all' || selectedShop === 'independent';
    
    return matchesSearch && matchesCategory && matchesStatus && matchesShop;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  // Check if user has permission to access provider features
  if (user && !canAccessProviderFeatures(user.role)) {
    return (
      <div className="bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <RoleUpgradeCard 
            currentRole={user.role} 
            onUpgradeComplete={() => {
              // Reload the page to fetch services with new role
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading services...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  const chartColors = {
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#f59e0b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            إدارة الخدمات 🛠️
          </h1>
          <p className="text-muted-foreground">إدارة وتتبع جميع خدماتك وأدائها</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث البيانات
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="services" className="data-[state=active]:bg-background">
            <Settings className="h-4 w-4 mr-2" />
            الخدمات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4 mr-2" />
            التحليلات
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4 mr-2" />
            الأداء
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6 mt-6">
          {/* Service Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="bg-primary/10 text-primary">إجمالي</Badge>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">إجمالي الخدمات</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{serviceStats.totalServices}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {serviceStats.activeServices} نشطة
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-blue-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(serviceStats.performanceMetrics.growth.bookings)}
                      <span className={`text-xs font-medium ${getGrowthColor(serviceStats.performanceMetrics.growth.bookings)}`}>
                        {formatPercentage(serviceStats.performanceMetrics.growth.bookings)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">إجمالي الحجوزات</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{serviceStats.totalBookings}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    هذا الشهر: {serviceStats.performanceMetrics.thisMonth.bookings}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-green-200 hover:border-green-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(serviceStats.performanceMetrics.growth.revenue)}
                      <span className={`text-xs font-medium ${getGrowthColor(serviceStats.performanceMetrics.growth.revenue)}`}>
                        {formatPercentage(serviceStats.performanceMetrics.growth.revenue)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">إجمالي الإيرادات</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{formatCurrency(serviceStats.totalRevenue)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    هذا الشهر: {formatCurrency(serviceStats.performanceMetrics.thisMonth.revenue)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-yellow-200 hover:border-yellow-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">ممتاز</Badge>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">متوسط التقييم</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{serviceStats.averageRating}</span>
                    <span className="text-sm text-muted-foreground">من 5</span>
                  </div>
                  <div className="flex items-center mt-2">
                    {getRatingStars(Math.floor(serviceStats.averageRating))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Add Service Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة خدمة جديدة
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('dashboard.provider.servicesPage.addNewService')}</DialogTitle>
              <DialogDescription>
                {t('dashboard.provider.servicesPage.createNewService')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">يجب تعبئة الحقول التالية:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Service Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className={validationErrors.some(e => e.includes('اسم الخدمة')) ? 'text-red-600' : ''}>
                  {t('dashboard.provider.servicesPage.serviceName')} *
                </Label>
                <Input
                  id="name"
                  placeholder={t('dashboard.provider.servicesPage.serviceNamePlaceholder')}
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    // Clear validation errors when user starts typing
                    if (validationErrors.length > 0) {
                      setValidationErrors([]);
                    }
                  }}
                  className={validationErrors.some(e => e.includes('اسم الخدمة')) ? 'border-red-500 focus:border-red-500' : ''}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className={validationErrors.some(e => e.includes('فئة الخدمة')) ? 'text-red-600' : ''}>
                  {t('dashboard.provider.servicesPage.category')} *
                </Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value });
                    // Clear validation errors when user selects
                    if (validationErrors.length > 0) {
                      setValidationErrors([]);
                    }
                  }}
                >
                  <SelectTrigger className={validationErrors.some(e => e.includes('فئة الخدمة')) ? 'border-red-500 focus:border-red-500' : ''}>
                    <SelectValue placeholder={t('dashboard.provider.servicesPage.selectCategory')} />
                  </SelectTrigger>
                <SelectContent>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`dashboard.provider.servicesPage.categories.${cat}`, { defaultValue: cat })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Shop Selection */}
              <div className="space-y-2">
                <Label htmlFor="shop">{t('dashboard.provider.servicesPage.shop')}</Label>
                <Select
                  value={formData.shopId || 'independent'}
                  onValueChange={(value) => setFormData({ ...formData, shopId: value === 'independent' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('dashboard.provider.servicesPage.selectShop')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">{t('dashboard.provider.servicesPage.independentService')}</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('dashboard.provider.servicesPage.description')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('dashboard.provider.servicesPage.descriptionPlaceholder')}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Location and Contact (only for independent services) */}
              {(!formData.shopId || formData.shopId === 'independent') && (
                <div className="border rounded-lg p-4 bg-stone-50">
                  <h4 className="font-medium mb-3 text-stone-800">معلومات الموقع والتواصل</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className={validationErrors.some(e => e.includes('المدينة')) ? 'text-red-600' : ''}>
                        المدينة *
                      </Label>
                      <Input
                        id="city"
                        placeholder="اختر المدينة"
                        value={formData.city || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value });
                          if (validationErrors.length > 0) setValidationErrors([]);
                        }}
                        className={validationErrors.some(e => e.includes('المدينة')) ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className={validationErrors.some(e => e.includes('رقم الهاتف')) ? 'text-red-600' : ''}>
                        رقم الهاتف *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (validationErrors.length > 0) setValidationErrors([]);
                        }}
                        className={validationErrors.some(e => e.includes('رقم الهاتف')) ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">المنطقة</Label>
                      <Input
                        id="area"
                        placeholder="اسم المنطقة أو الحي"
                        value={formData.area || ''}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        placeholder="عنوان تفصيلي (اختياري)"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <MapPickerLeaflet
                    latitude={formData.locationLat ? parseFloat(formData.locationLat) : undefined}
                    longitude={formData.locationLon ? parseFloat(formData.locationLon) : undefined}
                    onLocationSelect={(lat, lng) => {
                      setFormData({
                        ...formData,
                        locationLat: lat.toString(),
                        locationLon: lng.toString()
                      });
                    }}
                    className="mt-4"
                  />
                </div>
              )}

              {/* Price and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className={validationErrors.some(e => e.includes('السعر')) ? 'text-red-600' : ''}>
                    {t('dashboard.provider.servicesPage.priceEGP')} *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      if (validationErrors.length > 0) {
                        setValidationErrors([]);
                      }
                    }}
                    className={validationErrors.some(e => e.includes('السعر')) ? 'border-red-500 focus:border-red-500' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className={validationErrors.some(e => e.includes('مدة الخدمة')) ? 'text-red-600' : ''}>
                    {t('dashboard.provider.servicesPage.duration')} * (دقيقة)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="60"
                    value={formData.duration || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, duration: e.target.value });
                      if (validationErrors.length > 0) {
                        setValidationErrors([]);
                      }
                    }}
                    className={validationErrors.some(e => e.includes('مدة الخدمة')) ? 'border-red-500 focus:border-red-500' : ''}
                  />
                </div>
              </div>

              {/* Availability Days */}
              <div className="space-y-2">
                <Label>{t('dashboard.provider.servicesPage.availableDays')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {daysOfWeekKeys.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={day}
                        checked={formData.availability?.days?.includes(day) || false}
                        onChange={() => handleDayToggle(day)}
                        className="rounded border-stone-300"
                      />
                      <Label htmlFor={day} className="text-sm font-normal">
                        {t(`dashboard.provider.servicesPage.days.${day}`)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t('dashboard.provider.servicesPage.startTime')}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.availability?.startTime || '09:00'}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: { ...formData.availability, startTime: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">{t('dashboard.provider.servicesPage.endTime')}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.availability?.endTime || '18:00'}
                    onChange={(e) => setFormData({
                      ...formData,
                      availability: { ...formData.availability, endTime: e.target.value }
                    })}
                  />
                </div>
              </div>

              {/* Service Images */}
              <div className="space-y-2">
                <Label htmlFor="images" className="text-base font-medium">صور الخدمة 📷</Label>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => document.getElementById('images')?.click()}>
                  <ImageIcon className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                  <p className="text-sm font-medium text-blue-600 mb-1">اضغط هنا لاختيار الصور</p>
                  <p className="text-xs text-blue-400">يمكنك اختيار عدة صور في نفس الوقت</p>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700 font-medium">
                        ✅ {formData.images.length} صورة مختارة
                      </p>
                      {formData.images.map((file, index) => (
                        <p key={index} className="text-xs text-green-600 mt-1">
                          • {file.name} ({Math.round(file.size / 1024)} KB)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">{t('dashboard.provider.servicesPage.serviceIsActive')}</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('dashboard.provider.servicesPage.cancel')}
              </Button>
              <Button onClick={handleAddService} className="bg-green-primary hover:bg-green-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {t('dashboard.provider.servicesPage.addNewService')}
              </Button>
            </DialogFooter>
          </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في الخدمات..."
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                  >
                    الكل
                  </Button>
                  <Button
                    variant={activeFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('active')}
                  >
                    نشط
                  </Button>
                  <Button
                    variant={activeFilter === 'inactive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('inactive')}
                  >
                    غير نشط
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid/List */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full overflow-hidden">
                  <CardContent className="p-0">
                    {/* Service Image */}
                    {service.images && service.images.length > 0 ? (
                      <div className="aspect-video w-full bg-stone-100 overflow-hidden relative">
                        <img
                          src={(() => {
                            const image = service.images[0];
                            if (typeof image === 'string') {
                              return image.startsWith('http') 
                                ? image 
                                : `${process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com/api'}${image.startsWith('/') ? image : '/' + image}`;
                            }
                            return `https://via.placeholder.com/400x250/e2e8f0/64748b?text=${encodeURIComponent('صورة الخدمة')}`;
                          })()
                          }
                          alt={service.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/400x250/e2e8f0/64748b?text=${encodeURIComponent('صورة غير متاحة')}`;
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          {service.images.length > 1 && `+${service.images.length - 1} صورة`}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden flex items-center justify-center relative">
                        <div className="text-center text-blue-400">
                          <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-60" />
                          <p className="text-sm font-medium">لا توجد صورة</p>
                          <p className="text-xs mt-1 opacity-75">اضغط تعديل لإضافة صورة</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 bg-white/80 hover:bg-white border-blue-200 text-blue-600 hover:text-blue-700"
                            onClick={() => openEditDialog(service)}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            إضافة صورة
                          </Button>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}>
                          {service.isActive ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> نشط</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> غير نشط</>
                          )}
                        </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openViewDialog(service.id)}
                          title="عرض تفاصيل الخدمة"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            console.log('👁️ Toggle status button clicked for service:', service.id, service.name);
                            toggleServiceStatus(service.id);
                          }}
                          title={service.isActive ? 'إخفاء الخدمة' : 'إظهار الخدمة'}
                        >
                          {service.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(service)} title="تعديل الخدمة">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)} className="text-destructive hover:text-destructive" title="حذف الخدمة">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 text-foreground">{service.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>السعر</span>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(service.price)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>المدة</span>
                        </div>
                        <span className="font-medium text-foreground">{service.duration} دقيقة</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          <span>الحجوزات</span>
                        </div>
                        <span className="font-medium text-foreground">{service.totalBookings || 0}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-4 w-4 mr-1" />
                          <span>التقييم</span>
                        </div>
                        <div className="flex items-center">
                          {getRatingStars(Math.floor(service.rating || 0))}
                          <span className="font-medium ml-1 text-foreground">{service.rating || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground capitalize">
                          {service.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(service.updatedAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">لا توجد خدمات</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' || activeFilter !== 'all'
                    ? 'جرب تعديل الفلاتر لعرض المزيد من الخدمات'
                    : 'ابدأ بإضافة أول خدمة لك'}
                </p>
                {!searchQuery && selectedCategory === 'all' && activeFilter === 'all' && (
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة خدمة جديدة
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dashboard.provider.servicesPage.editService')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.provider.servicesPage.updateServiceDetails')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">يجب تعبئة الحقول التالية:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-name" className={validationErrors.some(e => e.includes('اسم الخدمة')) ? 'text-red-600' : ''}>
                {t('dashboard.provider.servicesPage.serviceName')} *
              </Label>
              <Input
                id="edit-name"
                placeholder={t('dashboard.provider.servicesPage.serviceNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">{t('dashboard.provider.servicesPage.category')} *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.provider.servicesPage.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`dashboard.provider.servicesPage.categories.${cat}`, { defaultValue: cat })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shop Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-shop">{t('dashboard.provider.servicesPage.shop')}</Label>
              <Select
                value={formData.shopId || 'independent'}
                onValueChange={(value) => setFormData({ ...formData, shopId: value === 'independent' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.provider.servicesPage.selectShop')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">{t('dashboard.provider.servicesPage.independentService')}</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('dashboard.provider.servicesPage.description')}</Label>
              <Textarea
                id="edit-description"
                placeholder={t('dashboard.provider.servicesPage.descriptionPlaceholder')}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Location and Contact (only for independent services) */}
            {(!formData.shopId || formData.shopId === 'independent') && (
              <div className="border rounded-lg p-4 bg-stone-50">
                <h4 className="font-medium mb-3 text-stone-800">معلومات الموقع والتواصل</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">المدينة *</Label>
                    <Input
                      id="edit-city"
                      placeholder="اختر المدينة"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">رقم الهاتف *</Label>
                    <Input
                      id="edit-phone"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-area">المنطقة</Label>
                    <Input
                      id="edit-area"
                      placeholder="اسم المنطقة أو الحي"
                      value={formData.area || ''}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">العنوان</Label>
                    <Input
                      id="edit-address"
                      placeholder="عنوان تفصيلي (اختياري)"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <MapPickerLeaflet
                  latitude={formData.locationLat ? parseFloat(formData.locationLat) : undefined}
                  longitude={formData.locationLon ? parseFloat(formData.locationLon) : undefined}
                  onLocationSelect={(lat, lng) => {
                    setFormData({
                      ...formData,
                      locationLat: lat.toString(),
                      locationLon: lng.toString()
                    });
                  }}
                  className="mt-4"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">{t('dashboard.provider.servicesPage.priceEGP')} *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">{t('dashboard.provider.servicesPage.duration')} * (دقيقة)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  placeholder="60"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            {/* Availability Days */}
            <div className="space-y-2">
              <Label>{t('dashboard.provider.servicesPage.availableDays')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {daysOfWeekKeys.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-${day}`}
                      checked={formData.availability?.days?.includes(day) || false}
                      onChange={() => handleDayToggle(day)}
                      className="rounded border-stone-300"
                    />
                    <Label htmlFor={`edit-${day}`} className="text-sm font-normal">
                      {t(`dashboard.provider.servicesPage.days.${day}`)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">{t('dashboard.provider.servicesPage.startTime')}</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.availability?.startTime || '09:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, startTime: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endTime">{t('dashboard.provider.servicesPage.endTime')}</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.availability?.endTime || '18:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    availability: { ...formData.availability, endTime: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Service Images */}
            <div className="space-y-2">
              <Label htmlFor="edit-images" className="text-base font-medium">تحديث صور الخدمة 📷</Label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => document.getElementById('edit-images')?.click()}>
                <ImageIcon className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                <p className="text-sm font-medium text-blue-600 mb-1">اضغط هنا لتغيير الصور</p>
                <p className="text-xs text-blue-400">سيتم استبدال الصور الحالية</p>
                <Input
                  id="edit-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                  {formData.images.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700 font-medium">
                        ✅ {formData.images.length} صورة مختارة
                      </p>
                      {formData.images.map((file, index) => (
                        <p key={index} className="text-xs text-green-600 mt-1">
                          • {file.name} ({Math.round(file.size / 1024)} KB)
                        </p>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive || false}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">{t('dashboard.provider.servicesPage.serviceIsActive')}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('dashboard.provider.servicesPage.cancel')}
            </Button>
            <Button onClick={handleEditService} className="bg-green-primary hover:bg-green-primary/90">
              <Save className="h-4 w-4 mr-2" />
              {t('dashboard.provider.servicesPage.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  أداء الخدمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.servicePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="bookings" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  الإيرادات الشهرية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={chartColors.success} 
                      fill={chartColors.success}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  توزيع الفئات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.categoryAnalytics.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{category.category}</span>
                        <span className="text-muted-foreground">{category.percentage}%</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{category.services} خدمة</span>
                        <span>{category.bookings} حجز</span>
                        <span>{formatCurrency(category.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  توزيع التقييمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.ratingDistribution.map((rating, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{rating.rating}</span>
                        </div>
                        <span className="text-muted-foreground">{rating.count} تقييم</span>
                      </div>
                      <Progress value={rating.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          {/* Top Performing Service */}
          {serviceStats.topPerformingService && (
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    أفضل خدمة أداء
                  </CardTitle>
                  <Badge className="bg-primary/10 text-primary">الأول</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary mb-1">{serviceStats.topPerformingService.bookings}</h3>
                    <p className="text-sm text-muted-foreground">حجز</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(serviceStats.topPerformingService.revenue)}</h3>
                    <p className="text-sm text-muted-foreground">إيرادات</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getRatingStars(Math.floor(serviceStats.topPerformingService.rating))}
                      <span className="text-lg font-bold text-foreground">{serviceStats.topPerformingService.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">تقييم</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">{serviceStats.topPerformingService.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    هذه الخدمة حققت أعلى عدد حجوزات وإيرادات هذا الشهر
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  نصائح للتحسين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      قم بتحديث وصف خدماتم بانتظام لجذب المزيد من العملاء
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      فكر في إضافة خدمات جديدة في الفئات الأقل تمثيلاً
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      اعتبر تقديم عروض خاصة للخدمات الأكثر طلباً
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  النمو الشهري
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">نمو الحجوزات</p>
                      <p className="text-xs text-muted-foreground">مقارنة بالشهر الماضي</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(serviceStats.performanceMetrics.growth.bookings)}
                      <span className={`text-lg font-bold ${getGrowthColor(serviceStats.performanceMetrics.growth.bookings)}`}>
                        {formatPercentage(serviceStats.performanceMetrics.growth.bookings)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">نمو الإيرادات</p>
                      <p className="text-xs text-muted-foreground">مقارنة بالشهر الماضي</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(serviceStats.performanceMetrics.growth.revenue)}
                      <span className={`text-lg font-bold ${getGrowthColor(serviceStats.performanceMetrics.growth.revenue)}`}>
                        {formatPercentage(serviceStats.performanceMetrics.growth.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Service View Dialog */}
      {isViewDialogOpen && viewServiceId && (
        <div className="fixed inset-0 z-50 bg-background">
          <ServiceViewPage 
            serviceId={viewServiceId}
            onClose={closeViewDialog}
            onEdit={() => {
              const service = services.find(s => s.id === viewServiceId);
              if (service) {
                closeViewDialog();
                openEditDialog(service);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
