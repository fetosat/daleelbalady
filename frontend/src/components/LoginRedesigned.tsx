'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Eye, EyeOff, Mail, Lock, Phone, ArrowRight, 
  Loader2, AlertCircle, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AIExplosionTransition } from '@/components/AIExplosionTransition';
import '@/lib/i18n';

const LoginRedesigned = () => {
  const { t } = useTranslation();
  const { login, isLoading, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [showAIExplosion, setShowAIExplosion] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // Set dynamic document title
  useDocumentTitle('titles.login');
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const targetUrl = redirectUrl || (user.role === 'ADMIN' ? '/dashboard/admin' : 
                                       user.role === 'PROVIDER' ? '/dashboard/provider' :
                                       user.role === 'SHOP_OWNER' ? '/dashboard/shop' :
                                       user.role === 'DELIVERY' ? '/dashboard/delivery' :
                                       '/dashboard');
      window.location.href = targetUrl;
    }
  }, [user, redirectUrl]);
  
  // Extract redirect URL from query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        setRedirectUrl(redirect);
      }
    }
  }, []);
  
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };
  
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    return phoneRegex.test(phone);
  };
  
  const isEmail = (input: string) => {
    return input.includes('@');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = t('auth.provideEmailOrPhone');
    } else {
      const inputIsEmail = isEmail(formData.emailOrPhone);
      if (inputIsEmail && !validateEmail(formData.emailOrPhone)) {
        newErrors.emailOrPhone = t('auth.invalidEmail');
      } else if (!inputIsEmail && !validatePhone(formData.emailOrPhone)) {
        newErrors.emailOrPhone = t('auth.invalidPhone');
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const inputIsEmail = isEmail(formData.emailOrPhone);
    
    try {
      const result = await login(
        inputIsEmail ? formData.emailOrPhone : '', 
        inputIsEmail ? '' : formData.emailOrPhone, 
        formData.password,
        redirectUrl
      );
      
      if (result?.user) {
        // Show AI explosion animation
        setShowAIExplosion(true);
        
        toast({
          title: '🎉 ' + t('auth.loginSuccess'),
          description: `Welcome back, ${result.user.name}!`,
          duration: 3000
        });
        
        // Navigate after animation
        setTimeout(() => {
          window.location.href = result.redirectUrl;
        }, 2500);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : t('auth.invalidCredentials');
      
      toast({
        title: t('auth.loginError'),
        description: errorMessage,
        variant: 'destructive',
      });
      
      setErrors({ general: errorMessage });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-green-50/30 to-blue-50/30 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back to Home Button */}
      <Link 
        href="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-stone-200/50 dark:border-stone-700/50 p-8 md:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 mb-6"
            >
              <span className="text-white font-bold text-3xl">دب</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2"
            >
              {t('auth.welcomeBack')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-stone-600 dark:text-stone-400 text-sm"
            >
              Welcome back to Daleel Balady
            </motion.p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Phone Input */}
            <div>
              <Label 
                htmlFor="emailOrPhone" 
                className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block"
              >
                {t('auth.email')} / {t('auth.phone')}
              </Label>
              <div className="relative group">
                <div className={`absolute left-3 top-1/2 -transtone-y-1/2 transition-colors ${
                  isFocused === 'emailOrPhone' ? 'text-green-500' : 'text-stone-400'
                }`}>
                  {isEmail(formData.emailOrPhone) ? (
                    <Mail className="w-5 h-5" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )}
                </div>
                <Input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  type="text"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  onFocus={() => setIsFocused('emailOrPhone')}
                  onBlur={() => setIsFocused(null)}
                  className={`pl-11 h-12 text-base bg-stone-50 dark:bg-stone-900/50 border-2 transition-all duration-300 ${
                    errors.emailOrPhone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : isFocused === 'emailOrPhone'
                      ? 'border-green-500 shadow-lg shadow-green-500/10'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                  placeholder={t('auth.emailPlaceholder')}
                />
                {isFocused === 'emailOrPhone' && !errors.emailOrPhone && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -inset-1 bg-green-500/20 rounded-lg -z-10 blur-md"
                  />
                )}
              </div>
              <AnimatePresence>
                {errors.emailOrPhone && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 mt-2 text-sm text-red-500"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.emailOrPhone}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div>
              <Label 
                htmlFor="password" 
                className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block"
              >
                {t('auth.password')}
              </Label>
              <div className="relative group">
                <div className={`absolute left-3 top-1/2 -transtone-y-1/2 transition-colors ${
                  isFocused === 'password' ? 'text-green-500' : 'text-stone-400'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  className={`pl-11 pr-11 h-12 text-base bg-stone-50 dark:bg-stone-900/50 border-2 transition-all duration-300 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                      : isFocused === 'password'
                      ? 'border-green-500 shadow-lg shadow-green-500/10'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -transtone-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                {isFocused === 'password' && !errors.password && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -inset-1 bg-green-500/20 rounded-lg -z-10 blur-md"
                  />
                )}
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 mt-2 text-sm text-red-500"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link 
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{t('auth.login')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:transtone-x-1 transition-transform" />
                </div>
              )}
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transtone-x-[-200%] group-hover:transtone-x-[200%] transition-transform duration-1000" />
            </Button>

            {/* OAuth Placeholders */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled
                className="h-11 border-2 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all relative group"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
                <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-bl rounded-tr font-bold">
                  Soon
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled
                className="h-11 border-2 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all relative group"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
                <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-bl rounded-tr font-bold">
                  Soon
                </span>
              </Button>
            </div>
          </form>

          {/* Sign Up Links */}
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t('auth.noAccount')}{' '}
              <Link 
                href="/signup" 
                className="text-green-600 dark:text-green-400 font-semibold hover:underline"
              >
                {t('auth.signup')}
              </Link>
            </p>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white/80 dark:bg-stone-800/80 text-stone-400">
                  or
                </span>
              </div>
            </div>

            <Link
              href="/become-partner"
              className="block w-full py-3 px-4 text-center text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border-2 border-green-200 dark:border-green-800"
            >
              {t('auth.becomePartner')} →
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* AI Explosion Transition */}
      <AIExplosionTransition
        isVisible={showAIExplosion}
        message="Welcome back!"
        onComplete={() => setShowAIExplosion(false)}
      />
    </div>
  );
};

export default LoginRedesigned;

