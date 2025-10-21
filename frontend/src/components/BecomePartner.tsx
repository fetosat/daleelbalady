import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Stethoscope, Eye, EyeOff, Mail, Lock, User, Phone, Upload, X, FileText, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, UserRole } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/utils/apiClient';

const BecomePartner = () => {
  const { t } = useTranslation();
  const { user, signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isLoggedIn = !!user;
  const [currentStep, setCurrentStep] = useState(isLoggedIn ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
    businessType: 'PROVIDER' as UserRole,
    businessName: '',
    businessEmail: user?.email || '',
    businessPhone: user?.phone || '',
    businessDescription: '',
    businessAddress: '',
    businessCity: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  
  const totalSteps = isLoggedIn ? 3 : 4;

  const partnerTypes = [
    {
      id: 'PROVIDER',
      icon: Stethoscope,
      title: t('auth.serviceProvider'),
      description: 'Provide services to customers. Can upgrade to sell products via subscription plans.',
    },
    {
      id: 'DELIVERY',
      icon: Truck,
      title: t('auth.deliveryPartner'),
      description: t('auth.deliveryPartnerDescription'),
    },
  ];

  const validateEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePhone = (phone: string) => /^\+?[\d\s-]{8,}$/.test(phone);
  const isEmail = (input: string) => input.includes('@');
  
  const validateCurrentStep = () => {
    const errors = [];
    
    if (!isLoggedIn && currentStep === 1) {
      if (!formData.name || formData.name.trim().length < 2) errors.push('Name must be at least 2 characters long');
      if (!formData.emailOrPhone) {
        errors.push('Please provide either email or phone');
      } else {
        const inputIsEmail = isEmail(formData.emailOrPhone);
        if (inputIsEmail && !validateEmail(formData.emailOrPhone)) errors.push('Please provide a valid email address');
        else if (!inputIsEmail && !validatePhone(formData.emailOrPhone)) errors.push('Please provide a valid phone number');
      }
    }
    
    if (!isLoggedIn && currentStep === 2) {
      if (formData.password.length < 6) errors.push('Password must be at least 6 characters long');
      if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    }
    
    if (currentStep === (isLoggedIn ? 2 : 3)) {
      if (!formData.businessName) errors.push('Business name is required');
      if (!formData.businessEmail || !validateEmail(formData.businessEmail)) errors.push('Valid business email is required');
      if (!formData.businessPhone || !validatePhone(formData.businessPhone)) errors.push('Valid business phone is required');
      if (!formData.businessDescription || formData.businessDescription.length < 10) errors.push('Business description must be at least 10 characters');
    }
    
    return errors;
  };
  
  const handleNext = () => {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      toast({ title: 'Validation Error', description: errors[0], variant: 'destructive' });
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  
  const handlePrev = () => {
    if (currentStep > (isLoggedIn ? 2 : 1)) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let userToken = localStorage.getItem('daleel-token');
      
      if (!isLoggedIn) {
        const inputIsEmail = isEmail(formData.emailOrPhone);
        const userResult = await signup(
          formData.name,
          inputIsEmail ? formData.emailOrPhone : '',
          formData.password,
          'CUSTOMER',
          inputIsEmail ? '' : formData.emailOrPhone
        );
        
        if (!userResult?.token) throw new Error('Failed to create user account');
        userToken = userResult.token;
      }

      const businessData = new FormData();
      businessData.append('businessName', formData.businessName);
      businessData.append('businessEmail', formData.businessEmail);
      businessData.append('businessPhone', formData.businessPhone);
      businessData.append('businessType', formData.businessType);
      businessData.append('description', formData.businessDescription);
      
      if (formData.businessAddress) businessData.append('businessAddress', formData.businessAddress);
      if (formData.businessCity) businessData.append('businessCity', formData.businessCity);
      selectedDocuments.forEach((file) => businessData.append('documents', file));

      const response = await apiFetch('/business/application', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` },
        body: businessData
      });

      toast({
        title: t('auth.partnerApplicationSuccess'),
        description: t('auth.partnerApplicationDescription'),
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: t('auth.signupError'),
        description: error instanceof Error ? error.message : t('auth.signupErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, businessType: value as UserRole }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      toast({ title: 'Invalid File Type', description: 'Please upload only images, PDF, or document files.', variant: 'destructive' });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = validFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({ title: 'File Too Large', description: 'Each file must be smaller than 10MB.', variant: 'destructive' });
      return;
    }

    setSelectedDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  
  const getStepTitle = () => {
    if (isLoggedIn) {
      return currentStep === 2 ? 'Business Information' : currentStep === 3 ? 'Document Upload' : 'Become a Partner';
    }
    switch (currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Create Password';
      case 3: return 'Business Information';
      case 4: return 'Document Upload';
      default: return 'Become a Partner';
    }
  };
  
  const getStepDescription = () => {
    if (isLoggedIn) {
      return currentStep === 2 ? 'Tell us about your business' : 
             currentStep === 3 ? 'Upload verification documents (optional)' : 
             t('auth.partnerDescription');
    }
    switch (currentStep) {
      case 1: return 'Create your account to get started';
      case 2: return 'Secure your account with a password';
      case 3: return 'Tell us about your business';
      case 4: return 'Upload verification documents (optional)';
      default: return t('auth.partnerDescription');
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + (isLoggedIn ? 2 : 1);
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isCompleted ? 'bg-green-primary text-white' : 
              isActive ? 'bg-green-primary text-white' :
              'bg-background-tertiary text-text-muted'
            }`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
            </div>
            {index < totalSteps - 1 && (
              <div className={`w-12 h-1 mx-2 ${
                stepNumber < currentStep ? 'bg-green-primary' : 'bg-background-tertiary'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-background-tertiary/50" style={{ boxShadow: 'var(--shadow-medium)' }}>
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-green-primary flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">دب</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-text-primary">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              {getStepDescription()}
            </CardDescription>
            {renderProgressBar()}
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!isLoggedIn && currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-text-primary">{t('auth.fullName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                          <Input
                            id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                            className="pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50"
                            placeholder={t('auth.fullNamePlaceholder')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emailOrPhone" className="text-text-primary">Email or Phone Number</Label>
                        <div className="relative">
                          {isEmail(formData.emailOrPhone) ? (
                            <Mail className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                          ) : (
                            <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                          )}
                          <Input
                            id="emailOrPhone" name="emailOrPhone" type="text" required value={formData.emailOrPhone} onChange={handleChange}
                            className="pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50"
                            placeholder="Enter email or phone number"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isLoggedIn && currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-text-primary">{t('auth.password')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                          <Input
                            id="password" name="password" type={showPassword ? 'text' : 'password'} required
                            value={formData.password} onChange={handleChange}
                            className="pl-10 pr-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50"
                            placeholder={t('auth.passwordPlaceholder')}
                          />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4 text-text-muted" /> : <Eye className="h-4 w-4 text-text-muted" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-text-primary">{t('auth.confirmPassword')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                          <Input
                            id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                            value={formData.confirmPassword} onChange={handleChange}
                            className="pl-10 pr-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50"
                            placeholder={t('auth.confirmPasswordPlaceholder')}
                          />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <EyeOff className="h-4 w-4 text-text-muted" /> : <Eye className="h-4 w-4 text-text-muted" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {currentStep === (isLoggedIn ? 2 : 3) && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-text-primary font-medium">{t('auth.selectPartnerType')}</Label>
                        <RadioGroup value={formData.businessType} onValueChange={handleRoleChange} className="grid grid-cols-1 gap-4">
                          {partnerTypes.map((type) => (
                            <Label key={type.id} htmlFor={type.id} className="cursor-pointer">
                              <div className="flex items-center space-x-3 space-x-reverse p-4 border border-background-tertiary rounded-xl hover:border-green-primary/50 transition-colors">
                                <RadioGroupItem value={type.id} id={type.id} />
                                <type.icon className="h-5 w-5 text-green-primary" />
                                <div className="flex-1">
                                  <div className="font-medium text-text-primary">{type.title}</div>
                                  <div className="text-sm text-text-secondary">{type.description}</div>
                                </div>
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-text-primary">{t('auth.businessName')}</Label>
                        <Input id="businessName" name="businessName" type="text" required value={formData.businessName} onChange={handleChange} className="bg-background-secondary border-background-tertiary focus:border-green-primary/50" placeholder={t('auth.businessNamePlaceholder')} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessEmail" className="text-text-primary">Business Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                            <Input id="businessEmail" name="businessEmail" type="email" required value={formData.businessEmail} onChange={handleChange} className="pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50" placeholder="business@example.com" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessPhone" className="text-text-primary">Business Phone *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                            <Input id="businessPhone" name="businessPhone" type="tel" required value={formData.businessPhone} onChange={handleChange} className="pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50" placeholder="+20 10 1234 5678" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessAddress" className="text-text-primary">Business Address</Label>
                          <Input id="businessAddress" name="businessAddress" type="text" value={formData.businessAddress} onChange={handleChange} className="bg-background-secondary border-background-tertiary focus:border-green-primary/50" placeholder="Street address, building number" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessCity" className="text-text-primary">City</Label>
                          <Input id="businessCity" name="businessCity" type="text" value={formData.businessCity} onChange={handleChange} className="bg-background-secondary border-background-tertiary focus:border-green-primary/50" placeholder="City name" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessDescription" className="text-text-primary">{t('auth.businessDescription')}</Label>
                        <Textarea id="businessDescription" name="businessDescription" required value={formData.businessDescription} onChange={handleChange} className="bg-background-secondary border-background-tertiary focus:border-green-primary/50" placeholder={t('auth.businessDescriptionPlaceholder')} rows={3} />
                      </div>
                    </div>
                  )}
                  
                  {currentStep === totalSteps && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-text-primary font-medium">Business Documents (Optional)</Label>
                        <p className="text-sm text-text-secondary">Upload business verification documents to speed up the approval process. Accepted formats: PDF, JPG, PNG, DOC, DOCX (max 10MB each)</p>
                      </div>
                      <div className="border-2 border-dashed border-background-tertiary rounded-lg p-6 hover:border-green-primary/50 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-text-muted" />
                          <div className="mt-4">
                            <Label htmlFor="documents" className="cursor-pointer">
                              <span className="text-green-primary hover:underline font-medium">Click to upload files</span>
                              <span className="text-text-secondary"> or drag and drop</span>
                            </Label>
                            <Input id="documents" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                          </div>
                        </div>
                      </div>
                      {selectedDocuments.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-text-primary text-sm font-medium">Uploaded Documents ({selectedDocuments.length})</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedDocuments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-background-tertiary">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-green-primary" />
                                  <div>
                                    <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeDocument(index)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800"><strong>Note:</strong> Document verification is optional but helps speed up your application approval process.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              <div className="flex items-center justify-between pt-6">
                <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === (isLoggedIn ? 2 : 1)} className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" /><span>Previous</span>
                </Button>
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext} className="bg-green-primary hover:bg-green-primary/90 text-white flex items-center space-x-2">
                    <span>Next</span><ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-green-primary hover:bg-green-primary/90 text-white">
                    {isSubmitting ? <div className="flex items-center space-x-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Submitting...</span></div> : t('auth.submitApplication')}
                  </Button>
                )}
              </div>
            </div>
            {!isLoggedIn && (
              <div className="mt-6 text-center space-y-4">
                <div className="text-sm text-text-secondary">
                  {t('auth.haveAccount')}{' '}<Link to="/login" className="text-green-primary hover:underline font-medium">{t('auth.login')}</Link>
                </div>
                <div className="text-sm text-text-secondary">
                  {t('auth.customerAccount')}{' '}<Link to="/signup" className="text-green-primary hover:underline font-medium">{t('auth.signupAsCustomer')}</Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BecomePartner;
