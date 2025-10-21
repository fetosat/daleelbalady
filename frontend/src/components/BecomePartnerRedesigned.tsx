'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Building2, Store,
  MapPin, CheckCircle, ArrowRight, Truck, Loader2, Tag,
  Package, ChevronRight, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Import i18n configuration
import dynamic from 'next/dynamic';

// Dynamically import map component
const LocationSelector = dynamic(
  () => import('@/components/LocationSelectorMap'),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-xl"><Loader2 className="h-8 w-8 animate-spin text-stone-400" /></div> }
);

interface FormData {
  // Step 1: User
  name: string;
  emailOrPhone: string;
  password: string;
  
  // Step 2: Shop
  shopName: string;
  shopDescription: string;
  shopPhone: string;
  shopEmail: string;
  categoryId: string;
  city: string;
  
  // Step 3: Service
  serviceName: string;
  serviceDescription: string;
  servicePrice: string;
  serviceDuration: string; // in minutes
  
  // Step 4: Location
  location: {
    lat: number;
    lon: number;
    address?: string;
  } | null;
}

const BecomePartnerRedesigned = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  // Debug: Check i18n state
  useEffect(() => {
    console.log('i18n initialized:', i18n.isInitialized);
    console.log('i18n language:', i18n.language);
    console.log('Test translation:', t('auth.becomePartnerRedesigned.title'));
    console.log('Available languages:', i18n.languages);
  }, [i18n, t]);
  
  // Wait for i18n to be ready
  if (!i18n.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }
  
  // Partner type selection
  const [partnerType, setPartnerType] = useState<'PROVIDER' | 'DELIVERY' | null>(null);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    emailOrPhone: '',
    password: '',
    shopName: '',
    shopDescription: '',
    shopPhone: '',
    shopEmail: '',
    categoryId: '',
    city: '',
    serviceName: '',
    serviceDescription: '',
    servicePrice: '',
    serviceDuration: '60', // default 60 minutes
    location: null
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);
  
  // Validation helpers
  const isEmail = (input: string) => input.includes('@');
  const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePhone = (phone: string) => /^\+?[\d\s-]{8,}$/.test(phone);
  
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      // User validation
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (!formData.emailOrPhone) {
        newErrors.emailOrPhone = 'Email or phone is required';
      } else if (isEmail(formData.emailOrPhone)) {
        if (!validateEmail(formData.emailOrPhone)) {
          newErrors.emailOrPhone = 'Please provide a valid email';
        }
      } else if (!validatePhone(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Please provide a valid phone number';
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (step === 1) {
      // Shop validation
      if (!formData.shopName || formData.shopName.trim().length < 2) {
        newErrors.shopName = 'Shop name is required';
      }
      if (!formData.shopDescription || formData.shopDescription.length < 10) {
        newErrors.shopDescription = 'Description must be at least 10 characters';
      }
      // Phone and email are inherited from user, so not required
      // City is also optional as it can be derived from location
    }
    
    if (step === 2) {
      // Service validation
      if (!formData.serviceName || formData.serviceName.trim().length < 2) {
        newErrors.serviceName = 'Service name is required';
      }
      if (!formData.serviceDescription || formData.serviceDescription.length < 10) {
        newErrors.serviceDescription = 'Description must be at least 10 characters';
      }
    }
    
    if (step === 3) {
      // Location validation
      if (!formData.location) {
        newErrors.location = 'Please select a location on the map';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before continuing',
        variant: 'destructive'
      });
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };
  
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = 'https://api.daleelbalady.com/api';
      
      // Step 1: Create user account
      const inputIsEmail = isEmail(formData.emailOrPhone);
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: inputIsEmail ? formData.emailOrPhone : '',
          phone: inputIsEmail ? '' : formData.emailOrPhone,
          password: formData.password,
          role: 'PROVIDER'
        })
      });
      
      if (!signupResponse.ok) {
        const errorData = await signupResponse.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to create user account';
        
        // Check if user already exists
        if (errorMessage.toLowerCase().includes('already exists') || 
            errorMessage.toLowerCase().includes('already registered')) {
          
          // Show error with option to go to login
          toast({
            title: t('auth.becomePartnerRedesigned.userExists'),
            description: t('auth.becomePartnerRedesigned.userExistsDesc'),
            variant: 'destructive',
            duration: 8000, // Show for 8 seconds
            action: (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 text-sm font-semibold bg-white text-red-600 rounded-md hover:bg-stone-100 transition-colors shadow-sm border border-red-200"
              >
                {t('auth.becomePartnerRedesigned.goToLogin')}
              </button>
            )
          });
          
          setIsSubmitting(false);
          return; // Exit early, don't throw
        }
        
        throw new Error(errorMessage);
      }
      
      const { token, user } = await signupResponse.json();
      
      // Step 2: Create shop
      const shopSlug = formData.shopName.toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now();
      
      const shopData = {
        name: formData.shopName,
        slug: shopSlug,
        description: formData.shopDescription,
        phone: user.phone || formData.emailOrPhone,
        email: user.email || formData.emailOrPhone,
        city: formData.city || null,
        locationLat: formData.location?.lat || null,
        locationLon: formData.location?.lon || null,
        ownerId: user.id
      };
      
      const shopResponse = await fetch(`${API_BASE_URL}/shops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopData)
      });
      
      if (!shopResponse.ok) {
        const errorData = await shopResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create shop');
      }
      
      const { shop } = await shopResponse.json();
      
      // Step 3: Create service with translations
      const serviceData = {
        name: formData.serviceName,
        description: formData.serviceDescription,
        price: formData.servicePrice ? parseFloat(formData.servicePrice) : 0,
        duration: formData.serviceDuration ? parseInt(formData.serviceDuration) : 60,
        shopId: shop.id,
        isActive: true
      };
      
      const serviceResponse = await fetch(`${API_BASE_URL}/provider/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });
      
      if (!serviceResponse.ok) {
        const errorData = await serviceResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create service');
      }
      
      // Store token
      localStorage.setItem('daleel-token', token);
      
      toast({
        title: '🎉 Success!',
        description: t('auth.becomePartnerRedesigned.success'),
        duration: 5000
      });
      
      // Redirect to dashboard or success page
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: t('auth.becomePartnerRedesigned.error'),
        description: error instanceof Error ? error.message : t('auth.becomePartnerRedesigned.error'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLocationSelect = useCallback((lat: number, lon: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      location: { lat, lon, address }
    }));
  }, []);
  
  // Partner type selection screen
  if (!partnerType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl mb-6"
            >
              <span className="text-white font-bold text-3xl">دب</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t('auth.becomePartnerRedesigned.title')}
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              {t('auth.becomePartnerRedesigned.subtitle')}
            </p>
          </div>
          
          {/* Partner Type Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Provider Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => setPartnerType('PROVIDER')}
                className="p-8 cursor-pointer border-2 hover:border-green-500 transition-all h-full shadow-lg hover:shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Store className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                    {t('auth.becomePartnerRedesigned.provider')}
                    <span className="text-2xl">{t('auth.becomePartnerRedesigned.providerIcon')}</span>
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 mb-6">
                    Offer services to customers. List your business, showcase your services, and connect with clients in your area.
                  </p>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    {t('auth.becomePartnerRedesigned.continue')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
            
            {/* Delivery Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <Card className="p-8 relative h-full shadow-lg opacity-60 cursor-not-allowed">
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-pink-500">
                  {t('auth.becomePartnerRedesigned.comingSoon')}
                </Badge>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
                    {t('auth.becomePartnerRedesigned.deliveryMan')}
                    <span className="text-2xl">{t('auth.becomePartnerRedesigned.deliveryManIcon')}</span>
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 mb-6">
                    Deliver products and earn money. Perfect for flexible work schedules and earning extra income.
                  </p>
                  <Button disabled className="w-full">
                    {t('auth.becomePartnerRedesigned.comingSoon')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
          
          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Why partner with us?
            </p>
            <div className="flex justify-center gap-8 flex-wrap">
              {[
                { icon: <User className="w-5 h-5" />, text: 'Easy Setup' },
                { icon: <MapPin className="w-5 h-5" />, text: 'Local Reach' },
                { icon: <Package className="w-5 h-5" />, text: 'Manage Services' },
                { icon: <ChevronRight className="w-5 h-5" />, text: 'Grow Business' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                  {feature.icon}
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  // Main stepper flow
  const steps = [
    { title: t('auth.becomePartnerRedesigned.step1Title'), icon: <User className="w-5 h-5" />, description: t('auth.becomePartnerRedesigned.step1Description') },
    { title: t('auth.becomePartnerRedesigned.step2Title'), icon: <Store className="w-5 h-5" />, description: t('auth.becomePartnerRedesigned.step2Description') },
    { title: t('auth.becomePartnerRedesigned.step3Title'), icon: <Package className="w-5 h-5" />, description: t('auth.becomePartnerRedesigned.step3Description') },
    { title: t('auth.becomePartnerRedesigned.step4Title'), icon: <MapPin className="w-5 h-5" />, description: t('auth.becomePartnerRedesigned.step4Description') }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <button
              onClick={() => setPartnerType(null)}
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
            >
              <Home className="w-5 h-5" />
            </button>
            <ChevronRight className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Provider Signup</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {steps[currentStep].title}
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-2">
            {steps[currentStep].description}
          </p>
        </div>
        
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-700 -z-10" />
            <motion.div
              className="absolute top-5 left-0 h-0.5 bg-green-500 -z-10"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center relative">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-green-500 text-white ring-4 ring-green-100 dark:ring-green-900'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </motion.div>
                  <div className="absolute -bottom-6 text-xs font-medium text-center whitespace-nowrap">
                    <span className={isActive || isCompleted ? 'text-green-600 dark:text-green-400' : 'text-stone-500'}>
                      Step {index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Form Card */}
        <Card className="p-8 shadow-2xl border-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: User Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold">{t('auth.becomePartnerRedesigned.name')} *</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10 h-12 text-lg"
                        placeholder={t('auth.becomePartnerRedesigned.namePlaceholder')}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="emailOrPhone" className="text-base font-semibold">{t('auth.becomePartnerRedesigned.emailLabel')} / {t('auth.becomePartnerRedesigned.phoneLabel')} *</Label>
                    <div className="relative mt-2">
                      {isEmail(formData.emailOrPhone) ? (
                        <Mail className="absolute left-3 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400" />
                      ) : (
                        <Phone className="absolute left-3 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400" />
                      )}
                      <Input
                        id="emailOrPhone"
                        value={formData.emailOrPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emailOrPhone: e.target.value }))}
                        className="pl-10 h-12 text-lg"
                        placeholder={`${t('auth.becomePartnerRedesigned.emailPlaceholder')} ${t('common.or', 'or')} ${t('auth.becomePartnerRedesigned.phonePlaceholder')}`}
                      />
                    </div>
                    {errors.emailOrPhone && <p className="text-sm text-red-500 mt-1">{errors.emailOrPhone}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-base font-semibold">{t('auth.password')} *</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 h-12 text-lg"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -transtone-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                  </div>
                </div>
              )}
              
              {/* Step 2: Shop Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="shopName" className="text-base font-semibold">{t('auth.becomePartnerRedesigned.shopName')} *</Label>
                    <div className="relative mt-2">
                      <Building2 className="absolute left-3 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400" />
                      <Input
                        id="shopName"
                        value={formData.shopName}
                        onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                        className="pl-10 h-12 text-lg"
                        placeholder={t('auth.becomePartnerRedesigned.shopNamePlaceholder')}
                      />
                    </div>
                    {errors.shopName && <p className="text-sm text-red-500 mt-1">{errors.shopName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="categoryId" className="text-base font-semibold">{t('auth.becomePartnerRedesigned.shopCategory')} *</Label>
                    <div className="relative mt-2">
                      <Tag className="absolute left-3 top-4 h-5 w-5 text-stone-400 z-10" />
                      <select
                        id="categoryId"
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full pl-10 pr-4 h-12 text-lg border rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-stone-800"
                      >
                        <option value="">{t('auth.becomePartnerRedesigned.selectCategory')}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="shopDescription" className="text-base font-semibold">{t('dashboard.services.description')} *</Label>
                    <Textarea
                      id="shopDescription"
                      value={formData.shopDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shopDescription: e.target.value }))}
                      className="mt-2 min-h-[120px] text-lg"
                      placeholder="Tell customers what makes your business special..."
                    />
                    {errors.shopDescription && <p className="text-sm text-red-500 mt-1">{errors.shopDescription}</p>}
                  </div>
                </div>
              )}
              
              {/* Step 3: Service Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tip:</strong> This is your first service. You can add more services later from your dashboard.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="serviceName" className="text-base font-semibold">{t('auth.becomePartnerRedesigned.serviceName')} *</Label>
                    <div className="relative mt-2">
                      <Package className="absolute left-3 top-1/2 -transtone-y-1/2 h-5 w-5 text-stone-400" />
                      <Input
                        id="serviceName"
                        value={formData.serviceName}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                        className="pl-10 h-12 text-lg"
                        placeholder={t('auth.becomePartnerRedesigned.serviceNamePlaceholder')}
                      />
                    </div>
                    {errors.serviceName && <p className="text-sm text-red-500 mt-1">{errors.serviceName}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="serviceDescription" className="text-base font-semibold">{t('auth.becomePartnerRedesigned.serviceDescription')} *</Label>
                    <Textarea
                      id="serviceDescription"
                      value={formData.serviceDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                      className="mt-2 min-h-[120px] text-lg"
                      placeholder={t('auth.becomePartnerRedesigned.serviceDescriptionPlaceholder')}
                    />
                    {errors.serviceDescription && <p className="text-sm text-red-500 mt-1">{errors.serviceDescription}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="servicePrice" className="text-base font-semibold">Price (Optional)</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        value={formData.servicePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, servicePrice: e.target.value }))}
                        className="mt-2 h-12 text-lg"
                        placeholder="0.00 EGP"
                        min="0"
                        step="0.01"
                      />
                      <p className="text-sm text-stone-500 mt-1">Leave empty if you prefer to quote on request</p>
                    </div>
                    <div>
                      <Label htmlFor="serviceDuration" className="text-base font-semibold">Duration (minutes)</Label>
                      <Input
                        id="serviceDuration"
                        type="number"
                        value={formData.serviceDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceDuration: e.target.value }))}
                        className="mt-2 h-12 text-lg"
                        placeholder="60"
                        min="1"
                        step="1"
                      />
                      <p className="text-sm text-stone-500 mt-1">Typical session duration</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 4: Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">{t('auth.becomePartnerRedesigned.dropPin')}</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Click on the map to select your business location. This helps customers find you easily!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Map Component */}
                  <div className="h-96 rounded-xl overflow-hidden border-2 border-stone-200 dark:border-stone-700">
                    <LocationSelector
                      onLocationSelect={handleLocationSelect}
                      initialLocation={formData.location}
                    />
                  </div>
                  
                  {formData.location && (
                    <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Location Selected</span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lon.toFixed(6)}
                      </p>
                      {formData.location.address && (
                        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                          Address: {formData.location.address}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6"
            >
              {t('auth.becomePartnerRedesigned.back')}
            </Button>
            
            {currentStep < totalSteps - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600 text-white px-8"
              >
                {t('auth.becomePartnerRedesigned.continue')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white px-8 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.becomePartnerRedesigned.submitting')}
                  </>
                ) : (
                  <>
                    {t('auth.becomePartnerRedesigned.finish')}
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
        
        {/* Progress Indicator */}
        <div className="text-center mt-6">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomePartnerRedesigned;
