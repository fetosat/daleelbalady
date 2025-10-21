import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Heart,
  Stethoscope,
  UserCheck,
  Search,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  User,
  LogOut,
  Globe,
  Sun,
  Moon,
  Plus,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '@/lib/auth';

interface MedicalNavbarProps {
  className?: string;
}

const MedicalNavbar: React.FC<MedicalNavbarProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const changeLanguage = (newLang: string) => {
    const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newDir;
    document.documentElement.lang = newLang;
    localStorage.setItem('language', newLang);
    localStorage.setItem('direction', newDir);
  };

  const medicalNavItems = [
    {
      icon: UserCheck,
      label: 'Independent Listings',
      labelAr: 'القوائم المستقلة',
      path: '/dashboard/independent-listings',
      description: 'Manage your medical services & products',
      descriptionAr: 'إدارة خدماتك ومنتجاتك الطبية'
    },
    {
      icon: Search,
      label: 'Search Listings',
      labelAr: 'البحث في القوائم',
      path: '/search/independent-listings',
      description: 'Find medical services & products',
      descriptionAr: 'العثور على الخدمات والمنتجات الطبية'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      labelAr: 'التحليلات',
      path: '/dashboard/independent-listings/analytics',
      description: 'View performance metrics',
      descriptionAr: 'عرض مؤشرات الأداء'
    },
    {
      icon: Calendar,
      label: 'Appointments',
      labelAr: 'المواعيد',
      path: '/dashboard/bookings',
      description: 'Manage appointments',
      descriptionAr: 'إدارة المواعيد'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout(true);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-white/95 dark:bg-stone-900/95 border-b border-blue-200/50 dark:border-stone-700/50 shadow-lg ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.05))',
      }}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Medical Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Plus className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Medical Hub
            </h1>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              {isRTL ? 'منصة الخدمات الطبية' : 'Healthcare Platform'}
            </p>
          </div>
        </motion.div>

        {/* Medical Navigation Items */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex items-center gap-1"
        >
          {medicalNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isRTL ? item.labelAr : item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="medicalNavActiveTab"
                    className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg -z-10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </motion.div>

        {/* Right Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {/* Quick Actions for Medical */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/independent-listings')}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isRTL ? 'إضافة خدمة' : 'Add Service'}
            </Button>
          </div>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm hidden sm:block">
                  {i18n.language === 'ar' ? 'العربية' : 'EN'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50"
            >
              <DropdownMenuItem 
                onClick={() => changeLanguage('ar')}
                className={i18n.language === 'ar' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
              >
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
              >
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50"
            >
              <DropdownMenuItem onClick={() => setTheme('light')}>
                {isRTL ? 'فاتح' : 'Light'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                {isRTL ? 'داكن' : 'Dark'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                {isRTL ? 'تلقائي' : 'System'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Avatar */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-9 w-9 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {isRTL ? 'مقدم خدمات طبية' : 'Medical Provider'}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="w-56 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50"
              >
                <div className="flex items-center gap-2 p-3 border-b border-blue-100 dark:border-blue-800">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {user.name}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/independent-listings" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    {isRTL ? 'القوائم المستقلة' : 'Independent Listings'}
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {isRTL ? 'الإعدادات' : 'Settings'}
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {isRTL ? 'تسجيل الخروج' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">{isRTL ? 'تسجيل الدخول' : 'Login'}</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Link to="/signup">{isRTL ? 'إنشاء حساب' : 'Sign Up'}</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default MedicalNavbar;
