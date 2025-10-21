'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Menu,
  User,
  LogOut,
  Settings,
  Shield,
  Tag,
  Users,
  CreditCard,
  Bell,
  BellRing,
  Search,
  Home,
  LayoutDashboard,
  Wrench,
  Heart,
  Calculator,
  Dumbbell,
  Apple,
  Sparkles,
  Store,
  Truck,
  Package
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { getProviderUnreadCount, getUnreadCount } from '@/api/notifications';

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string;
    plan?: {
      type: string;
      discountPercentage: number;
    };
  };
  onSidebarToggle?: () => void;
  showSidebarButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSidebarToggle, showSidebarButton }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const [isDashboard, setIsDashboard] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Check if we're in a dashboard route
  useEffect(() => {
    setIsDashboard(pathname.startsWith('/dashboard'));
  }, [pathname]);

  // Fetch unread notifications count
  useEffect(() => {
    let interval: any;
    const fetchCount = async () => {
      try {
        if (!authUser) return;
        let count = 0;
        if (authUser.role === 'PROVIDER') {
          count = await getProviderUnreadCount();
        } else {
          count = await getUnreadCount(authUser.id);
        }
        setUnreadNotifications(count || 0);
      } catch (e) {
        // silent fail
      }
    };
    fetchCount();
    interval = setInterval(fetchCount, 30000);
    return () => interval && clearInterval(interval);
  }, [authUser]);

  const navigationItems = [
    { href: '/', label: t('navbar.home'), icon: Home },
    { href: '/find', label: t('navbar.find'), icon: Search },
    { href: '/delivery/new', label: '🚚 طلب توصيل', icon: Package },
    { href: '/subscription-plans', label: t('navbar.plans'), icon: CreditCard },
    { href: '/offers', label: t('navbar.offers'), icon: Tag },
    { href: '/verify-pin', label: t('navbar.verifyPin'), icon: Shield },
  ];

  const toolsItems = [
    { 
      href: '/coach-diet', 
      label: t('tools.coachDiet') || 'كوتش & دايت', 
      icon: Heart,
      description: t('tools.coachDietDesc') || 'احسب سعراتك',
      active: true,
      gradient: 'from-green-400 to-green-600'
    },
    { 
      href: '/delivery/dashboard', 
      label: '🏍️ لوحة المندوب', 
      icon: Truck,
      description: 'اربح من التوصيل',
      active: true,
      gradient: 'from-orange-400 to-orange-600'
    },
    { 
      label: t('tools.medicaltitle') || 'السجل الطبي', 
      icon: Sparkles,
      href: 'https://medical.daleelbalady.com', 
      description: t('tools.medicalDesc') || 'احتفظ بسجلك الطبي',
      active: true,
      gradient: 'from-purple-400 to-purple-600'
    },
    { 
      label: t('tools.mealPlanner') || 'مخطط وجبات', 
      icon: Apple,
      description: t('tools.comingSoon') || 'قريباً',
      active: false,
      gradient: 'from-orange-400 to-orange-600'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    try {
      // Use the auth context logout function
      logout(false); // false means redirect to home page after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: manual cleanup and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('daleel-token');
        localStorage.removeItem('daleel-user');
        localStorage.removeItem('daleel-redirect');
        sessionStorage.clear();
        window.location.href = '/';
      }
    }
  };

  const getUserInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default to 'U' for User if name is missing
    }
    return name.split(' ').map(n => n[0]).filter(initial => initial).join('').substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 z-[90] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            {/* Dashboard Sidebar Button - Mobile Only */}
            {(showSidebarButton || isDashboard) && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => {
                  if (onSidebarToggle) {
                    onSidebarToggle();
                  } else if (typeof window !== 'undefined' && (window as any).toggleDashboardSidebar) {
                    (window as any).toggleDashboardSidebar();
                  }
                }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 dark:from-blue-500 dark:to-green-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">د</span>
              </div>
              <span className="text-xl font-bold text-foreground">دليل بلدي</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            
            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    pathname.startsWith('/coach-diet')
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  {t('tools.title') || 'أدوات مساعدة'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2" align="start">
                <div className="grid grid-cols-2 gap-2">
                  {toolsItems.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    const isToolActive = tool.href && pathname === tool.href;
                    
                    if (tool.active && tool.href) {
                      return (
                        <Link
                          key={index}
                          href={tool.href}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md ${
                            isToolActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                              : 'hover:border-primary/50 hover:bg-accent'
                          }`}
                        >
                          <div className={`p-3 rounded-full bg-gradient-to-br ${tool.gradient} shadow-lg`}>
                            <ToolIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-sm">{tool.label}</p>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                        </Link>
                      );
                    }
                    
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border border-dashed opacity-60 cursor-not-allowed"
                      >
                        <div className={`p-3 rounded-full bg-gradient-to-br ${tool.gradient} opacity-50`}>
                          <ToolIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm">{tool.label}</p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Always visible toggles */}
            <LanguageToggle />
            <ThemeToggle />
            
            {/* Desktop only - Notifications and User Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative" asChild>
                <Link href="/notifications">
                  {unreadNotifications > 0 ? (
                    <BellRing className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px] font-bold"
                    >
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </Badge>
                  )}
                </Link>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name || 'Local User'}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email || 'No email'}
                        </p>
                        {user.plan && (
                          <Badge variant="secondary" className="w-fit">
                            {user.plan.type} - {user.plan.discountPercentage}% خصم
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t('navbar.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mylistings" className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {t('navbar.myListings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/delivery/requests" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        📦 طلبات التوصيل
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t('navbar.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscription-plans" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {t('navbar.myPlan')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/family" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('navbar.family')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t('navbar.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('navbar.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">{t('navbar.login')}</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 dark:from-blue-500 dark:to-green-500">
                    <Link href="/signup">{t('navbar.signup')}</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-right">{t('navbar.menu')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4 pb-6">
                    {/* Navigation Links */}
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                    
                    {/* Tools Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-foreground">
                        <Wrench className="h-4 w-4" />
                        {t('tools.title') || 'أدوات مساعدة'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {toolsItems.map((tool, index) => {
                          const ToolIcon = tool.icon;
                          const isToolActive = tool.href && pathname === tool.href;
                          
                          if (tool.active && tool.href) {
                            return (
                              <Link
                                key={index}
                                href={tool.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                                  isToolActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                    : 'hover:border-primary/50 hover:bg-accent'
                                }`}
                              >
                                <div className={`p-2 rounded-full bg-gradient-to-br ${tool.gradient}`}>
                                  <ToolIcon className="h-5 w-5 text-white" />
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-xs">{tool.label}</p>
                                  <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                                </div>
                              </Link>
                            );
                          }
                          
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-dashed opacity-60 cursor-not-allowed"
                            >
                              <div className={`p-2 rounded-full bg-gradient-to-br ${tool.gradient} opacity-50`}>
                                <ToolIcon className="h-5 w-5 text-white" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-xs">{tool.label}</p>
                                <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Mobile-only Notifications */}
                    <div className="border-t pt-4 mt-4">
                      <Link
                        href="/notifications"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <div className="relative">
                          {unreadNotifications > 0 ? (
                            <BellRing className="h-5 w-5 text-orange-500" />
                          ) : (
                            <Bell className="h-5 w-5" />
                          )}
                          {unreadNotifications > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center p-0 text-[10px] font-bold"
                            >
                              {unreadNotifications > 99 ? '99+' : unreadNotifications}
                            </Badge>
                          )}
                        </div>
                        {t('navbar.notifications')}
                      </Link>
                    </div>
                    
                    {/* Mobile Login/Signup for non-authenticated users */}
                    {!user && (
                      <div className="border-t pt-4 mt-4 space-y-3">
                        <Link
                          href="/login"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <User className="h-5 w-5" />
                          {t('navbar.login')}
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700"
                        >
                          <Users className="h-5 w-5" />
                          {t('navbar.signup')}
                        </Link>
                      </div>
                    )}
                    
                    {user && (
                      <>
                      <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-3 px-3 py-2 mb-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{user.name}</span>
                              <span className="text-xs text-stone-500">{user.email}</span>
                              {user.plan && (
                                <Badge variant="secondary" className="w-fit mt-1 text-xs">
                                  {user.plan.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          {t('navbar.dashboard')}
                        </Link>
                        
                        <Link
                          href="/mylistings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Store className="h-5 w-5" />
                          {t('navbar.myListings')}
                        </Link>
                        
                        <Link
                          href="/delivery/requests"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Package className="h-5 w-5" />
                          📦 طلبات التوصيل
                        </Link>
                        
                        <Link
                          href="/profile"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <User className="h-5 w-5" />
                          {t('navbar.profile')}
                        </Link>
                        
                        <Link
                          href="/settings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Settings className="h-5 w-5" />
                          {t('navbar.settings')}
                        </Link>
                        
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full text-right"
                        >
                          <LogOut className="h-5 w-5" />
                          {t('navbar.logout')}
                        </button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
