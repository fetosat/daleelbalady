import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AIExplosionTransition } from '@/components/AIExplosionTransition';
import { extractRedirectUrl } from '@/lib/redirect-utils';

const Login = () => {
  const { t } = useTranslation();
  const { login, isLoading, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [showAIExplosion, setShowAIExplosion] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // Set dynamic document title
  useDocumentTitle('titles.login');
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // User is already logged in, redirect to dashboard
      const targetUrl = redirectUrl || (user.role === 'ADMIN' ? '/dashboard/admin' : 
                                       user.role === 'PROVIDER' ? '/dashboard/provider' :
                                       user.role === 'SHOP_OWNER' ? '/dashboard/shop' :
                                       user.role === 'DELIVERY' ? '/dashboard/delivery' :
                                       '/dashboard');
      window.location.href = targetUrl;
    }
  }, [user, redirectUrl]);
  
  // Extract redirect URL from query parameters on mount
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email or phone format
    const inputIsEmail = isEmail(formData.emailOrPhone);
    if (inputIsEmail && !validateEmail(formData.emailOrPhone)) {
      toast({
        title: t('auth.validationError'),
        description: t('auth.invalidEmail'),
        variant: 'destructive',
      });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    } else if (!inputIsEmail && !validatePhone(formData.emailOrPhone)) {
      toast({
        title: t('auth.validationError'),
        description: 'Please provide a valid phone number',
        variant: 'destructive',
      });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast({
        title: t('auth.validationError'),
        description: t('auth.passwordTooShort'),
        variant: 'destructive',
      });
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    
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
        
        // Navigate after explosion animation to the redirect URL
        setTimeout(() => {
          // Use window.location.href for reliable redirect
          window.location.href = result.redirectUrl;
        }, 3000);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : t('auth.invalidCredentials');
      toast({
        title: t('auth.loginError'),
        description: errorMessage,
        variant: 'destructive',
      });
      setShake(true);
      setTimeout(() => setShake(false), 600);
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
        <Card 
          className={`border-background-tertiary/50 ${shake ? 'animate-shake' : ''}`} 
          style={{ boxShadow: 'var(--shadow-medium)' }}
        >
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
              {t('auth.welcomeBack')}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              {t('auth.loginDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone" className="text-text-primary">
                  {t('auth.email')} or Phone
                </Label>
                <div className="relative">
                  {isEmail(formData.emailOrPhone) ? (
                    <Mail className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-text-muted" />
                  )}
                  <Input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="text"
                    required
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    className="pl-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow"
                    placeholder="Email or phone number"
                  />
                </div>
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
                    className="pl-10 pr-10 bg-background-secondary border-background-tertiary focus:border-green-primary/50 focus:ring-green-glow"
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
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-green-primary hover:bg-green-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('auth.login')
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
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.daleelbalady.com';
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
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.daleelbalady.com';
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
                {t('auth.noAccount')}{' '}
                <Link href="/signup" className="text-green-primary hover:underline font-medium">
                  {t('auth.signup')}
                </Link>
              </div>

              <div className="text-sm text-text-secondary">
                {t('auth.wantToBusiness')}{' '}
                <Link href="/become-partner" className="text-green-primary hover:underline font-medium">
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
        message="Welcome back!"
        onComplete={() => setShowAIExplosion(false)}
      />
    </div>
  );
};

export default Login;