'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Store, 
  Package, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  FileText, 
  Tag, 
  Star, 
  BarChart, 
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Shield,
  Globe,
  LayoutDashboard,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, t, isRTL } = useTranslation();

  const languages = [
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
  ];

  const handleLanguageChange = (langCode: 'ar' | 'en') => {
    setLocale(langCode);
    // Update document direction
    if (typeof window !== 'undefined') {
      document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = langCode;
    }
  };

  // Update document direction on locale change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = locale;
    }
  }, [locale, isRTL]);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const navigationSections = [
    {
      title: locale === 'ar' ? 'عام' : 'General',
      items: [
        {
          name: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          current: pathname === '/admin'
        },
        {
          name: locale === 'ar' ? 'التحليلات والإحصائيات' : 'Analytics',
          href: '/admin/analytics',
          icon: TrendingUp,
          current: pathname.startsWith('/admin/analytics')
        }
      ]
    },
    {
      title: locale === 'ar' ? 'إدارة البيانات' : 'Management',
      items: [
        {
          name: locale === 'ar' ? 'المستخدمين' : 'Users',
          href: '/admin/users',
          icon: Users,
          current: pathname.startsWith('/admin/users')
        },
        {
          name: locale === 'ar' ? 'المحلات' : 'Shops',
          href: '/admin/shops',
          icon: Store,
          current: pathname.startsWith('/admin/shops')
        },
        {
          name: locale === 'ar' ? 'الخدمات' : 'Services',
          href: '/admin/services',
          icon: Briefcase,
          current: pathname.startsWith('/admin/services')
        },
        {
          name: locale === 'ar' ? 'المنتجات' : 'Products',
          href: '/admin/products',
          icon: Package,
          current: pathname.startsWith('/admin/products')
        }
      ]
    },
    {
      title: locale === 'ar' ? 'المعاملات' : 'Transactions',
      items: [
        {
          name: locale === 'ar' ? 'الحجوزات' : 'Bookings',
          href: '/admin/bookings',
          icon: Calendar,
          current: pathname.startsWith('/admin/bookings')
        },
        {
          name: locale === 'ar' ? 'الطلبات' : 'Orders',
          href: '/admin/orders',
          icon: ShoppingBag,
          current: pathname.startsWith('/admin/orders')
        },
        {
          name: locale === 'ar' ? 'طلبات الأعمال' : 'Applications',
          href: '/admin/applications',
          icon: FileText,
          current: pathname.startsWith('/admin/applications')
        }
      ]
    },
    {
      title: locale === 'ar' ? 'المالية' : 'Financial',
      items: [
        {
          name: locale === 'ar' ? 'الاشتراكات' : 'Subscriptions',
          href: '/admin/subscriptions',
          icon: Receipt,
          current: pathname.startsWith('/admin/subscriptions')
        },
        {
          name: locale === 'ar' ? 'المدفوعات' : 'Payments',
          href: '/admin/payments',
          icon: CreditCard,
          current: pathname.startsWith('/admin/payments')
        },
        {
          name: locale === 'ar' ? 'الكوبونات' : 'Coupons',
          href: '/admin/coupons',
          icon: Tag,
          current: pathname.startsWith('/admin/coupons')
        }
      ]
    },
    {
      title: locale === 'ar' ? 'إعدادات' : 'System',
      items: [
        {
          name: locale === 'ar' ? 'التصنيفات' : 'Categories',
          href: '/admin/categories',
          icon: Shield,
          current: pathname.startsWith('/admin/categories')
        },
        {
          name: locale === 'ar' ? 'التقييمات' : 'Reviews',
          href: '/admin/reviews',
          icon: Star,
          current: pathname.startsWith('/admin/reviews')
        },
        {
          name: locale === 'ar' ? 'الإعدادات' : 'Settings',
          href: '/admin/settings',
          icon: Settings,
          current: pathname.startsWith('/admin/settings')
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-stone-600 dark:bg-stone-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity duration-300 ease-linear"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-stone-800 transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'transtone-x-0' : '-transtone-x-full'
      }`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200 dark:border-stone-700">
            <div className="flex items-center space-x-2 space-x-reverse">
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">دليل بلدي</h1>
              <Badge variant="secondary" className="text-xs">{t('common.admin')}</Badge>
            </div>
            <button
              type="button"
              className="rounded-md p-2 text-stone-400 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-500 dark:hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-4">
              {navigationSections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="px-3 mb-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`${item.href}-${locale}`}
                          href={item.href}
                          className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            item.current
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-700 dark:border-indigo-400'
                              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon
                            className={`ml-3 h-5 w-5 flex-shrink-0 ${
                              item.current ? 'text-indigo-500 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
          
          {/* Language Switcher for Mobile */}
          <div className="border-t border-stone-200 dark:border-stone-700 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="flex-1 text-left">{currentLanguage.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'ar' | 'en')}
                    className={locale === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col ">
        <div className="flex flex-col border-r border-stone-200 h-screen dark:border-stone-700 bg-white dark:bg-stone-950">
          <div className="flex items-center px-4 py-4 border-b border-stone-200 dark:border-stone-700">
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">دليل بلدي</h1>
            <Badge variant="secondary" className="mr-2 text-xs">{t('common.admin')}</Badge>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-4">
              {navigationSections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="px-3 mb-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`${item.href}-${locale}`}
                          href={item.href}
                          className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            item.current
                              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-700 dark:border-indigo-400'
                              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        >
                          <Icon
                            className={`ml-3 h-5 w-5 flex-shrink-0 ${
                              item.current ? 'text-indigo-500 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
          
          {/* Language Switcher for Desktop */}
          <div className="border-t border-stone-200 dark:border-stone-700 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="flex-1 text-left">{currentLanguage.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as 'ar' | 'en')}
                    className={locale === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="bg-white dark:bg-stone-800 px-4 py-3 shadow-sm md:hidden border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-md p-2 text-stone-400 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-500 dark:hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs">{currentLanguage.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code as 'ar' | 'en')}
                      className={locale === lang.code ? 'bg-accent' : ''}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="mr-1 text-xs">3</Badge>
              </Button>
              
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-900">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
