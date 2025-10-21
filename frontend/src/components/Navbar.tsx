'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe, User, Settings, LogOut, LayoutDashboard, Building2, CreditCard, Crown, Search, Users, Store, Package, Menu, X, Heart, Wrench, Calculator, Apple, Dumbbell, Activity, Clock, Trophy, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  chatboxInNavbar?: boolean;
  onChatboxFocus?: () => void;
  chatQuery?: string;
  onChatQueryChange?: (value: string) => void;
  onChatSubmit?: () => void;
  isDashboard?: boolean;
}

export function Navbar({ 
  chatboxInNavbar = false, 
  onChatboxFocus,
  chatQuery = '',
  onChatQueryChange,
  onChatSubmit,
  isDashboard = false
}: NavbarProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  const changeLanguage = (newLang: string) => {
    const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
    
    // Change language
    i18n.changeLanguage(newLang);
    
    // Update document direction and language
    document.documentElement.dir = newDir;
    document.documentElement.lang = newLang;
    
    // Persist to localStorage
    localStorage.setItem('language', newLang);
    localStorage.setItem('direction', newDir);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChatSubmit?.();
    }
  };

  const handleLogout = () => {
    // Stay on current page after logout (default behavior)
    logout(true);
    // No navigation - user stays on current page
  };

  const handleSwitchToBusiness = () => {
    navigate('/become-partner');
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-4 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-b border-white/20 dark:border-zinc-700/20"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-text-primary flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-green-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">دب</span>
          </div>
          {t('nav.logo')}
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full hover:bg-background-secondary"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Right Controls */}
        <motion.div
          key="nav-menu"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex items-center space-x-1"
        >
          <Link to="/find">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-text-primary hover:text-green-primary transition-colors"
            >
              <Search className="h-4 w-4" />
              {t('nav.find')}
            </Button>
          </Link>
          <Link to="/find?type=users">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-text-primary hover:text-green-primary transition-colors"
            >
              <Users className="h-4 w-4" />
              {t('nav.people')}
            </Button>
          </Link>
          <Link to="/find?type=services">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-text-primary hover:text-green-primary transition-colors"
            >
              <User className="h-4 w-4" />
              {t('nav.services')}
            </Button>
          </Link>
          <Link to="/find?type=shops">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-text-primary hover:text-green-primary transition-colors"
            >
              <Store className="h-4 w-4" />
              {t('nav.places')}
            </Button>
          </Link>
          <Link to="/find?type=products">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-text-primary hover:text-green-primary transition-colors"
            >
              <Package className="h-4 w-4" />
              {t('nav.products')}
            </Button>
          </Link>
          
          {/* Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-text-primary hover:text-green-primary transition-colors"
              >
                <Wrench className="h-4 w-4" />
                {isRTL ? 'أدوات مساعدة' : 'Tools'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="center"
              className="w-72 bg-background/95 backdrop-blur-sm border-background-tertiary/50"
              style={{ boxShadow: 'var(--shadow-medium)' }}
            >
              <div className="p-2 grid grid-cols-2 gap-2">
                {/* Coach & Diet - Active */}
                <Link to="/coach-diet" className="block">
                  <div className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer border-2 border-transparent hover:border-green-500/50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-green-600">
                        {isRTL ? 'كوتش & دايت' : 'Coach & Diet'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {isRTL ? 'احسب سعراتك' : 'Track Calories'}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* BMI Calculator - Coming Soon */}
                <div className="relative group flex flex-col items-center gap-2 p-4 rounded-lg bg-stone-50 dark:bg-stone-900/20 transition-all opacity-60 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-text-primary">
                      {isRTL ? 'حاسبة BMI' : 'BMI Calculator'}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {isRTL ? 'قريباً' : 'Coming Soon'}
                    </p>
                  </div>
                  <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-500" />
                </div>

                {/* Workout Plans - Coming Soon */}
                <div className="relative group flex flex-col items-center gap-2 p-4 rounded-lg bg-stone-50 dark:bg-stone-900/20 transition-all opacity-60 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-text-primary">
                      {isRTL ? 'خطط تمارين' : 'Workout Plans'}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {isRTL ? 'قريباً' : 'Coming Soon'}
                    </p>
                  </div>
                  <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-500" />
                </div>

                {/* Meal Planner - Coming Soon */}
                <div className="relative group flex flex-col items-center gap-2 p-4 rounded-lg bg-stone-50 dark:bg-stone-900/20 transition-all opacity-60 cursor-not-allowed">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Apple className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-text-primary">
                      {isRTL ? 'مخطط وجبات' : 'Meal Planner'}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {isRTL ? 'قريباً' : 'Coming Soon'}
                    </p>
                  </div>
                  <Sparkles className="absolute top-2 right-2 h-4 w-4 text-yellow-500" />
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-2 text-center text-xs text-text-muted">
                {isRTL ? 'المزيد من الأدوات قريباً!' : 'More tools coming soon!'}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Center Chatbox
        {chatboxInNavbar && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-md mx-8"
          >
            <div className="relative">
              <input
                type="text"
                placeholder={t('nav.chatPlaceholder')}
                value={chatQuery}
                onChange={(e) => onChatQueryChange?.(e.target.value)}
                onFocus={onChatboxFocus}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-3 rounded-full bg-background-secondary/90 backdrop-blur-sm border border-green-subtle focus:border-green-primary/50 focus:outline-none focus:ring-2 focus:ring-green-glow transition-all duration-300 focus:scale-105 text-text-primary placeholder:text-text-muted"
                style={{ 
                  boxShadow: 'var(--shadow-soft)',
                  textAlign: isRTL ? 'right' : 'left'
                }}
              />
            </div>
          </motion.div>
        )} */}

        {/* Right Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 md:gap-4"
        >
          {/* Language Toggle - Desktop Only */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full hover:bg-background-secondary"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{i18n.language === 'ar' ? 'العربية' : 'English'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="bg-background/95 backdrop-blur-sm border-background-tertiary/50"
                style={{ boxShadow: 'var(--shadow-medium)' }}
              >
                <DropdownMenuItem 
                  onClick={() => changeLanguage('ar')}
                  className={i18n.language === 'ar' ? 'bg-accent' : ''}
                >
                  العربية
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => changeLanguage('en')}
                  className={i18n.language === 'en' ? 'bg-accent' : ''}
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle - Desktop Only */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-background-secondary"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="bg-background/95 backdrop-blur-sm border-background-tertiary/50"
                style={{ boxShadow: 'var(--shadow-medium)' }}
              >
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile Avatar */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarFallback className="bg-green-primary text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="w-56 bg-background/95 backdrop-blur-sm border-background-tertiary/50"
                style={{ boxShadow: 'var(--shadow-medium)' }}
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-primary text-white text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-text-primary">{user?.name || 'User'}</p>
                    <p className="text-xs text-text-muted">{user?.email || ''}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard.viewDashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/subscription-plans" className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/payment-history" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {isRTL ? 'تاريخ المدفوعات' : 'Payment History'}
                  </Link>
                </DropdownMenuItem>
                {user.role === 'CUSTOMER' && (
                  <DropdownMenuItem onClick={handleSwitchToBusiness} className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t('dashboard.changeToBusinessAccount')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t('dashboard.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="sm" asChild className="text-xs md:text-sm px-2 md:px-3">
                <Link to="/login">{t('auth.login')}</Link>
              </Button>
              <Button size="sm" asChild className="bg-green-primary hover:bg-green-primary/90 text-xs md:text-sm px-2 md:px-3">
                <Link to="/signup">{t('auth.signup')}</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-white/20 dark:border-zinc-700/20 max-h-[calc(100vh-80px)] overflow-y-auto"
        >
          <div className="px-6 py-4 space-y-2">
            <Link 
              to="/find" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="font-medium">{t('nav.find')}</span>
            </Link>
            <Link 
              to="/find?type=users" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">{t('nav.people')}</span>
            </Link>
            <Link 
              to="/find?type=services" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">{t('nav.services')}</span>
            </Link>
            <Link 
              to="/find?type=shops" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <Store className="h-4 w-4" />
              <span className="font-medium">{t('nav.places')}</span>
            </Link>
            <Link 
              to="/find?type=products" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <Package className="h-4 w-4" />
              <span className="font-medium">{t('nav.products')}</span>
            </Link>
            <Link 
              to="/coach-diet" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span className="font-medium">{t('nav.coachDiet')}</span>
            </Link>
            
            {/* Mobile Settings Divider */}
            <div className="border-t border-stone-200 dark:border-stone-700 my-3"></div>
            
            {/* Language Toggle - Mobile */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">Language</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={i18n.language === 'en' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      changeLanguage('en');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    EN
                  </Button>
                  <Button
                    variant={i18n.language === 'ar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      changeLanguage('ar');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    AR
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Theme Toggle - Mobile */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 ml-3" />
                  <span className="font-medium">Theme</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={theme === 'light' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setTheme('light');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    ☀️
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setTheme('dark');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    🌙
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setTheme('system');
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    💻
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
