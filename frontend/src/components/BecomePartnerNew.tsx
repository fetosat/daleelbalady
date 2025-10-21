'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, Building2, FileText,  
  MapPin, Upload, X, CheckCircle, ArrowLeft, ArrowRight, 
  AlertCircle, Sparkles, Crown, Shield, Video, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBecomePartnerStore } from '@/stores/becomePartnerStore';
import { SUBSCRIPTION_PLANS, getPlanById, isPremiumFeature } from '@/lib/subscription-plans';
import { ProviderPlanType } from '@/lib/subscription';
import { useToast } from '@/hooks/use-toast';
import { setAuthToken } from '@/lib/auth-sync';

const BecomePartnerNew = () => {
  const {
    formData,
    setFormData,
    currentStep,
    nextStep,
    prevStep,
    totalSteps,
    isLoggedIn,
    setIsLoggedIn,
    resetForm
  } = useBecomePartnerStore();
  
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check if user is already logged in
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('daleel-token') : null;
    setIsLoggedIn(!!token);
  }, [setIsLoggedIn]);

  // Fetch categories for category selection step
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

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.categoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const response = await fetch(`/api/categories/${formData.categoryId}/subcategories`);
        if (response.ok) {
          const data = await response.json();
          setSubCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch subcategories:', error);
      }
    };
    fetchSubCategories();
  }, [formData.categoryId]);

  const handleChange = (field: string, value: any) => {
    setFormData({ [field]: value });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} - Only PDF, JPG, PNG, DOC, DOCX files are allowed`,
          variant: 'destructive'
        });
        return false;
      }
      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: `${file.name} - Maximum file size is 10MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    setFormData({ documents: [...formData.documents, ...validFiles] });
  };

  const removeDocument = (index: number) => {
    setFormData({ 
      documents: formData.documents.filter((_, i) => i !== index) 
    });
  };

  const handlePremiumFeatureClick = (featureName: string) => {
    if (isPremiumFeature(featureName, formData.selectedPlan)) {
      setLockedFeature(featureName);
      setShowUpgradeModal(true);
    }
  };

  const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePhone = (phone: string) => /^\+?[\d\s-]{8,}$/.test(phone);
  const isEmail = (input: string) => input.includes('@');

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];

    if (!isLoggedIn && currentStep === 1) {
      if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (!formData.emailOrPhone) {
        errors.push('Please provide either email or phone');
      } else {
        const inputIsEmail = isEmail(formData.emailOrPhone);
        if (inputIsEmail && !validateEmail(formData.emailOrPhone)) {
          errors.push('Please provide a valid email address');
        } else if (!inputIsEmail && !validatePhone(formData.emailOrPhone)) {
          errors.push('Please provide a valid phone number');
        }
      }
      if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }
    }

    const businessStep = isLoggedIn ? 2 : 3;
    if (currentStep === businessStep) {
      if (!formData.businessName) errors.push('Business name is required');
      if (!formData.businessEmail || !validateEmail(formData.businessEmail)) {
        errors.push('Valid business email is required');
      }
      if (!formData.businessPhone || !validatePhone(formData.businessPhone)) {
        errors.push('Valid business phone is required');
      }
      if (!formData.businessDescription || formData.businessDescription.length < 10) {
        errors.push('Business description must be at least 10 characters');
      }
    }

    const categoryStep = isLoggedIn ? 3 : 4;
    if (currentStep === categoryStep) {
      if (!formData.categoryId) errors.push('Please select a category');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      let userToken = localStorage.getItem('daleel-token');

      // Step 1: Create user account if not logged in
      const API_BASE_URL = 'https://api.daleelbalady.com/api';
      
      if (!isLoggedIn) {
        const inputIsEmail = isEmail(formData.emailOrPhone);
        const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: inputIsEmail ? formData.emailOrPhone : '',
            phone: inputIsEmail ? '' : formData.emailOrPhone,
            password: formData.password,
            role: 'CUSTOMER'
          })
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.message || 'Failed to create user account');
        }

        const signupData = await signupResponse.json();
        userToken = signupData.token;
        // Store token in both localStorage and cookie
        setAuthToken(userToken);
      }

      // Step 2: Submit business application
      const businessData = new FormData();
      businessData.append('businessName', formData.businessName);
      businessData.append('businessEmail', formData.businessEmail);
      businessData.append('businessPhone', formData.businessPhone);
      businessData.append('businessType', formData.businessType);
      businessData.append('description', formData.businessDescription);
      
      if (formData.businessAddress) businessData.append('businessAddress', formData.businessAddress);
      if (formData.businessCity) businessData.append('businessCity', formData.businessCity);
      if (formData.categoryId) businessData.append('categoryId', formData.categoryId);
      if (formData.subCategoryId) businessData.append('subCategoryId', formData.subCategoryId);
      if (formData.location.lat) businessData.append('locationLat', formData.location.lat.toString());
      if (formData.location.lon) businessData.append('locationLon', formData.location.lon.toString());
      
      // Append documents if any
      formData.documents.forEach((file) => businessData.append('documents', file));

      // Make direct API call to backend (not through Next.js API routes)
      const appResponse = await fetch(`${API_BASE_URL}/business/application`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${userToken}`
          // IMPORTANT: Don't set Content-Type - browser will set it with multipart boundary
        },
        body: businessData
      });

      if (!appResponse.ok) {
        const errorData = await appResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to submit business application');
      }

      // Success!
      const result = await appResponse.json();
      console.log('Application submitted successfully:', result);
      
      toast({
        title: '✅ Application Submitted Successfully!',
        description: 'Your request is under review. You will receive an email once your application is approved.',
        duration: 5000,
      });
      
      resetForm();
      
      // Redirect to success page
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/become-partner/success';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit application. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    if (isLoggedIn) {
      switch (currentStep) {
        case 2: return 'Business Information';
        case 3: return 'Category & Location';
        case 4: return 'Upload Documents';
        case 5: return 'Choose Your Plan';
        default: return 'Review & Submit';
      }
    } else {
      switch (currentStep) {
        case 1: return 'Create Your Account';
        case 2: return 'Password Setup';
        case 3: return 'Business Information';
        case 4: return 'Category & Location';
        case 5: return 'Upload Documents';
        default: return 'Choose Your Plan';
      }
    }
  };

  const renderProgressBar = () => {
    const progress = (currentStep / totalSteps) * 100;
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-4">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={stepNumber} className="flex-1 flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#10b981' : isActive ? '#3b82f6' : '#e5e7eb'
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${isCompleted || isActive ? 'text-white' : 'text-stone-600'}`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </motion.div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-1 transition-colors ${
                    stepNumber < currentStep ? 'bg-green-500' : 'bg-stone-200 dark:bg-stone-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    // Step 1: Personal Info (only if not logged in)
    if (!isLoggedIn && (currentStep === 1 || currentStep === 2)) {
      return (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {currentStep === 1 && (
            <>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emailOrPhone">Email or Phone *</Label>
                <div className="relative mt-2">
                  {isEmail(formData.emailOrPhone) ? (
                    <Mail className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                  )}
                  <Input
                    id="emailOrPhone"
                    type="text"
                    value={formData.emailOrPhone}
                    onChange={(e) => handleChange('emailOrPhone', e.target.value)}
                    className="pl-10"
                    placeholder="Enter email or phone number"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -transtone-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-stone-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -transtone-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-stone-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      );
    }

    // Business Info Step
    const businessStep = isLoggedIn ? 2 : 3;
    if (currentStep === businessStep) {
      return (
        <motion.div
          key="business"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div>
            <Label className="text-base font-semibold mb-4 block">Business Type *</Label>
            <RadioGroup 
              value={formData.businessType} 
              onValueChange={(value) => handleChange('businessType', value)}
              className="grid gap-4"
            >
              <Label
                htmlFor="PROVIDER"
                className="flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer hover:border-green-500 transition-all"
              >
                <RadioGroupItem value="PROVIDER" id="PROVIDER" />
                <Building2 className="h-6 w-6 text-green-500" />
                <div className="flex-1">
                  <div className="font-semibold">Service Provider</div>
                  <div className="text-sm text-stone-500">
                    Provide services, can upgrade to sell products via subscription
                  </div>
                </div>
              </Label>
              
              <Label
                htmlFor="DELIVERY"
                className="flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer hover:border-green-500 transition-all"
              >
                <RadioGroupItem value="DELIVERY" id="DELIVERY" />
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <div className="font-semibold">Delivery Partner</div>
                  <div className="text-sm text-stone-500">
                    Provide delivery services to customers
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              type="text"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="mt-2"
              placeholder="Enter your business name"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessEmail">Business Email *</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  id="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => handleChange('businessEmail', e.target.value)}
                  className="pl-10"
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessPhone">Business Phone *</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  id="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={(e) => handleChange('businessPhone', e.target.value)}
                  className="pl-10"
                  placeholder="+20 10 1234 5678"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input
                id="businessAddress"
                type="text"
                value={formData.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                className="mt-2"
                placeholder="Street address, building number"
              />
            </div>

            <div>
              <Label htmlFor="businessCity">City</Label>
              <Input
                id="businessCity"
                type="text"
                value={formData.businessCity}
                onChange={(e) => handleChange('businessCity', e.target.value)}
                className="mt-2"
                placeholder="City name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessDescription">Business Description *</Label>
            <Textarea
              id="businessDescription"
              value={formData.businessDescription}
              onChange={(e) => handleChange('businessDescription', e.target.value)}
              className="mt-2"
              placeholder="Tell us about your business, services, and what makes you unique..."
              rows={4}
            />
          </div>
        </motion.div>
      );
    }

    // Category Selection Step
    const categoryStep = isLoggedIn ? 3 : 4;
    if (currentStep === categoryStep) {
      return (
        <motion.div
          key="category"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div>
            <Label htmlFor="categoryId">Business Category *</Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-stone-800 dark:border-stone-700"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {formData.categoryId && subCategories.length > 0 && (
            <div>
              <Label htmlFor="subCategoryId">Sub-Category (Optional)</Label>
              <select
                id="subCategoryId"
                value={formData.subCategoryId}
                onChange={(e) => handleChange('subCategoryId', e.target.value)}
                className="mt-2 w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-stone-800 dark:border-stone-700"
              >
                <option value="">Select a sub-category</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Location Services</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Add precise location for better customer discovery. You can pin your exact location on the map after approval.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Documents Upload Step
    const documentsStep = isLoggedIn ? 4 : 5;
    if (currentStep === documentsStep) {
      return (
        <motion.div
          key="documents"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div>
            <Label className="text-base font-semibold">Business Documents (Optional)</Label>
            <p className="text-sm text-stone-500 mt-1">
              Upload verification documents to speed up approval. Accepted: PDF, JPG, PNG, DOC (max 10MB each)
            </p>
          </div>

          <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl p-8 hover:border-green-500 transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-stone-400" />
              <div className="mt-4">
                <Label htmlFor="documents" className="cursor-pointer">
                  <span className="text-green-500 hover:text-green-600 font-semibold">
                    Click to upload files
                  </span>
                  <span className="text-stone-500"> or drag and drop</span>
                </Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {formData.documents.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Uploaded Documents ({formData.documents.length})
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {formData.documents.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Document Verification
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Optional but highly recommended! Documents help speed up approval and build trust with customers.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Subscription Plan Step
    const planStep = isLoggedIn ? 5 : 6;
    if (currentStep === planStep) {
      return (
        <motion.div
          key="plan"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
            <p className="text-stone-600 dark:text-stone-400">
              Start with our free plan, upgrade anytime to unlock premium features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = formData.selectedPlan === plan.id;
              const isFree = plan.price === 0;
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange('selectedPlan', plan.id)}
                  className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-500 shadow-xl shadow-green-500/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -transtone-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500">
                      {plan.badge}
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{plan.icon}</div>
                    <h4 className="font-bold text-lg">{plan.name}</h4>
                    <p className="text-sm text-stone-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold">
                      {plan.price.toLocaleString()} {plan.currency}
                    </div>
                    <div className="text-sm text-stone-500">
                      {isFree ? 'Forever free' : `${plan.priceMonthly} EGP/month`}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature.id} className="flex items-start space-x-2 text-sm">
                        {feature.included ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-stone-300 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-stone-700 dark:text-stone-300' : 'text-stone-400'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    className={`w-full ${
                      isSelected
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : isFree ? 'Start Free' : 'Select Plan'}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
            <div className="flex items-start space-x-4">
              <Sparkles className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h4 className="font-bold text-lg mb-2">Special Launch Offer!</h4>
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  Get 20% off on all paid plans when referred by our field representative. 
                  Discounts can stack up to 50% off!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-2xl">دب</span>
            </motion.div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {getStepTitle()}
            </CardTitle>
            
            <CardDescription className="text-base">
              Join Daleel Balady and grow your business with us
            </CardDescription>

            {renderProgressBar()}
          </CardHeader>

          <CardContent className="space-y-6">
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      Please fix the following errors:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === (isLoggedIn ? 2 : 1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-green-500 hover:bg-green-600 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center space-x-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <span>Upgrade to Unlock This Feature</span>
              </DialogTitle>
              <DialogDescription>
                This feature requires a premium subscription plan
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {SUBSCRIPTION_PLANS.filter(p => p.price > 0).map((plan) => {
                const hasFeature = plan.features.some(
                  f => f.id === lockedFeature && f.included
                );

                return (
                  <Card 
                    key={plan.id}
                    className={`${hasFeature ? 'border-2 border-green-500 shadow-lg' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {plan.priceMonthly} EGP/month
                          </CardDescription>
                        </div>
                        {hasFeature && (
                          <Badge className="bg-green-500">Includes Feature</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature.id} className="flex items-start space-x-2 text-sm">
                            {feature.included ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-4 w-4 text-stone-300 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={feature.included ? '' : 'text-stone-400'}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {hasFeature && (
                        <Button
                          onClick={() => {
                            handleChange('selectedPlan', plan.id);
                            setShowUpgradeModal(false);
                          }}
                          className="w-full mt-4 bg-green-500 hover:bg-green-600"
                        >
                          Select This Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default BecomePartnerNew;

