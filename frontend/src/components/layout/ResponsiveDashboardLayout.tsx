'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Bell, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveDashboardLayout({ children }: ResponsiveDashboardLayoutProps) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <div className="ml-3 text-lg text-stone-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800">
      {/* Desktop Layout */}
      {!isMobile ? (
        <div className="flex min-h-screen">
          {/* Desktop Sidebar - Always visible */}
          <div className="flex-shrink-0">
            <DashboardSidebar role={user.role} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 sticky top-0 z-30">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                    مرحباً، {user.name || 'المستخدم'}
                  </h1>
                  {user.subscription && (
                    <span className="text-sm px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-full font-medium">
                      {user.subscription.planNameAr || user.subscription.planName}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      3
                    </span>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilePic} alt={user.name} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name || 'المستخدم'}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email || user.phone || 'لا يوجد بريد إلكتروني'}
                          </p>
                          {user.role && (
                            <p className="text-xs leading-none text-green-600 dark:text-green-400 font-medium mt-1">
                              {user.role === 'ADMIN' ? 'مدير النظام' : 
                               user.role === 'PROVIDER' ? 'مزود خدمة' :
                               user.role === 'SHOP_OWNER' ? 'صاحب متجر' :
                               user.role === 'DELIVERY' ? 'سائق توصيل' : 'عميل'}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>الملف الشخصي</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>الإعدادات</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      ) : (
        // Mobile Layout
        <div className="flex flex-col min-h-screen">
          {/* Mobile Sidebar Component (handles its own overlay and positioning) */}
          <DashboardSidebar role={user.role} />

          {/* Mobile Top Bar */}
          <header className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border-b border-stone-200 dark:border-stone-700 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Left side - empty space for hamburger menu (rendered by sidebar) */}
              <div className="w-10"></div>

              {/* Center - Title */}
              <div className="flex-1 text-center">
                <h1 className="text-lg font-bold text-stone-900 dark:text-white truncate">
                  لوحة التحكم
                </h1>
              </div>

              {/* Right side - User actions */}
              <div className="flex items-center space-x-2 space-x-reverse">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePic} alt={user.name} />
                        <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'المستخدم'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email || user.phone || 'لا يوجد بريد إلكتروني'}
                        </p>
                        {user.role && (
                          <p className="text-xs leading-none text-green-600 dark:text-green-400 font-medium mt-1">
                            {user.role === 'ADMIN' ? 'مدير النظام' : 
                             user.role === 'PROVIDER' ? 'مزود خدمة' :
                             user.role === 'SHOP_OWNER' ? 'صاحب متجر' :
                             user.role === 'DELIVERY' ? 'سائق توصيل' : 'عميل'}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>الإعدادات</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Mobile Main Content */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </main>

          {/* Mobile Bottom Navigation - Optional */}
          <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 safe-area-bottom">
            <div className="flex items-center justify-around py-2 px-4">
              <Button variant="ghost" size="sm" className="flex flex-col items-center py-2 px-3">
                <div className="w-6 h-6 mb-1 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs text-stone-600">الرئيسية</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center py-2 px-3">
                <div className="w-6 h-6 mb-1 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs text-stone-600">الإشعارات</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center py-2 px-3">
                <div className="w-6 h-6 mb-1 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs text-stone-600">الإعدادات</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResponsiveDashboardLayout;
