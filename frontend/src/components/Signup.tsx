import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AIExplosionTransition } from '@/components/AIExplosionTransition';

const Signup = () => {
  const { t } = useTranslation();
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAIExplosion, setShowAIExplosion] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string; password?: string }>({});

  // Set dynamic document title
  useDocumentTitle('titles.signup');

  const validateForm = () => {
    const errors = [];

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (formData.email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{8,}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.push('Please provide a valid phone number');
      }
    }

    // Either email or phone is required
    if (!formData.email && !formData.phone) {
      errors.push('Please provide either email or phone');
    }

    // Password validation
    if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage(null);
    setFieldErrors({});
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setErrorMessage(errors[0]);
      toast({
        title: t('auth.validationError') || 'Validation Error',
        description: errors[0],
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await signup(formData.name, formData.email, formData.password, 'CUSTOMER', formData.phone);
      
      if (result?.user) {
        // Show AI explosion animation
        setShowAIExplosion(true);
        
        // Navigate after explosion animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Parse error message
      let displayMessage = t('auth.signupError') || 'Signup failed';
      const newFieldErrors: { email?: string; phone?: string; password?: string } = {};
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // Handle duplicate user errors
        if (errorMsg.includes('email') && (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorMsg.includes('taken'))) {
          displayMessage = t('auth.errors.emailTaken') || 'This email is already registered. Please use a different email or try logging in.';
          newFieldErrors.email = displayMessage;
        } else if (errorMsg.includes('phone') && (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || errorMsg.includes('taken'))) {
          displayMessage = t('auth.errors.phoneTaken') || 'This phone number is already registered. Please use a different number or try logging in.';
          newFieldErrors.phone = displayMessage;
        } else if (errorMsg.includes('user') && (errorMsg.includes('already exists') || errorMsg.includes('duplicate'))) {
          displayMessage = t('auth.errors.userExists') || 'An account with this information already exists. Please try logging in instead.';
        } else if (errorMsg.includes('invalid email')) {
          displayMessage = t('auth.errors.invalidEmail') || 'Please provide a valid email address.';
          newFieldErrors.email = displayMessage;
        } else if (errorMsg.includes('invalid phone')) {
          displayMessage = t('auth.errors.invalidPhone') || 'Please provide a valid phone number.';
          newFieldErrors.phone = displayMessage;
        } else if (errorMsg.includes('password')) {
          if (errorMsg.includes('weak') || errorMsg.includes('short') || errorMsg.includes('length')) {
            displayMessage = t('auth.errors.weakPassword') || 'Password is too weak. Please use at least 6 characters.';
            newFieldErrors.password = displayMessage;
          } else {
            displayMessage = error.message;
          }
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          displayMessage = t('auth.errors.networkError') || 'Network error. Please check your connection and try again.';
        } else {
          displayMessage = error.message;
        }
      }
      
      setErrorMessage(displayMessage);
      setFieldErrors(newFieldErrors);
      
      toast({
        title: t('auth.signupError') || 'Signup Failed',
        description: displayMessage,
        variant: 'destructive',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
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
              {t('auth.createAccount')}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              {t('auth.signupDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                  {/* Show login link if user already exists */}
                  {(errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exists')) && (
                    <span className="block mt-2">
                      <Link to="/login" className="underline font-medium hover:text-red-700">
                        {t('auth.goToLogin') || 'Go to login page'}
                      </Link>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-text-primary">
                  {t('auth.fullName')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow"
                    placeholder={t('auth.fullNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-primary">
                  {t('auth.email')} <span className="text-text-muted">(optional)</span>
                </Label>
                <p className="text-xs text-text-muted">Either email or phone is required</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow ${
                      fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-text-primary">
                  {t('auth.phone')} <span className="text-text-muted">(optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow ${
                      fieldErrors.phone ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder="+20 10 1234 5678"
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-text-primary">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow ${
                      fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-text-muted" />
                    ) : (
                      <Eye className="h-4 w-4 text-text-muted" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-text-primary">
                  {t('auth.confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow"
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-text-muted" />
                    ) : (
                      <Eye className="h-4 w-4 text-text-muted" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-primary hover:bg-green-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.createAccount')
                )}
              </Button>
            </form>

            {/* Social Login Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-background-tertiary" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-text-muted">
                  {t('auth.orContinueWith') || 'Or continue with'}
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const backendUrl = process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com';
                  window.location.href = `${backendUrl}/api/auth/google`;
                }}
                className="w-full border-background-tertiary hover:bg-background-secondary"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const backendUrl = process.env.REACT_APP_API_URL || 'https://api.daleelbalady.com';
                  window.location.href = `${backendUrl}/api/auth/facebook`;
                }}
                className="w-full border-background-tertiary hover:bg-background-secondary"
              >
                <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="mt-6 text-center space-y-4">
              <div className="text-sm text-text-secondary">
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="text-green-primary hover:underline font-medium">
                  {t('auth.login')}
                </Link>
              </div>

              <div className="text-sm text-text-secondary">
                {t('auth.wantToBusiness')}{' '}
                <Link to="/become-partner" className="text-green-primary hover:underline font-medium">
                  {t('auth.becomePartner')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* AI Explosion Transition */}
      <AIExplosionTransition
        isVisible={showAIExplosion}
        message="Account created successfully!"
        onComplete={() => setShowAIExplosion(false)}
      />
    </div>
  );
};

export default Signup;