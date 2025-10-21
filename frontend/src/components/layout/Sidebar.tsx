'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  MessageSquare,
  Bell,
  Settings,
  Store,
  Truck,
  Users,
  FileText,
  BarChart3,
  Package,
  Wrench,
  MessageCircle,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  role: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const roleMenus: Record<string, MenuItem[]> = {
  CUSTOMER: [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard/customer" },
    { icon: CalendarCheck, label: "myBookings", path: "/dashboard/bookings" },
    { icon: ShoppingBag, label: "myOrders", path: "/dashboard/orders" },
    { icon: MessageSquare, label: "chat", path: "/dashboard/chat" },
    { icon: Bell, label: "notifications", path: "/dashboard/notifications" },
    { icon: Settings, label: "settings", path: "/dashboard/settings" },
  ],
  SHOP_OWNER: [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard" },
    { icon: Store, label: "myShops", path: "/dashboard/shops" },
    { icon: Package, label: "products", path: "/dashboard/products" },
    { icon: Wrench, label: "services", path: "/dashboard/services" },
    { icon: CalendarCheck, label: "bookings", path: "/dashboard/bookings" },
    { icon: ShoppingBag, label: "orders", path: "/dashboard/orders" },
    { icon: MessageSquare, label: "chat", path: "/dashboard/chat" },
    { icon: Bell, label: "notifications", path: "/dashboard/notifications" },
    { icon: BarChart3, label: "analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "settings", path: "/dashboard/settings" },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard" },
    { icon: Users, label: "userManagement", path: "/dashboard/users" },
    { icon: Store, label: "shopManagement", path: "/dashboard/shops" },
    { icon: Package, label: "productManagement", path: "/dashboard/products" },
    { icon: Wrench, label: "serviceManagement", path: "/dashboard/services" },
    { icon: Truck, label: "deliveries", path: "/dashboard/deliveries" },
    { icon: MessageCircle, label: "reviews", path: "/dashboard/reviews" },
    { icon: Bell, label: "notifications", path: "/dashboard/notifications" },
    { icon: Settings, label: "settings", path: "/dashboard/settings" },
  ],
  PROVIDER: [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard/provider" },
    { icon: Store, label: "myShops", path: "/dashboard/shops" },
    { icon: Wrench, label: "myServices", path: "/dashboard/services" },
    { icon: Package, label: "products", path: "/dashboard/products" },
    { icon: CalendarCheck, label: "bookings", path: "/dashboard/bookings" },
    { icon: MessageSquare, label: "chat", path: "/dashboard/chat" },
    { icon: Bell, label: "notifications", path: "/dashboard/notifications" },
    { icon: BarChart3, label: "analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "settings", path: "/dashboard/settings" },
  ],
  DELIVERY: [
    { icon: LayoutDashboard, label: "dashboard", path: "/dashboard" },
    { icon: ShoppingBag, label: "activeDeliveries", path: "/dashboard/deliveries" },
    { icon: MessageSquare, label: "chat", path: "/dashboard/chat" },
    { icon: Bell, label: "notifications", path: "/dashboard/notifications" },
    { icon: BarChart3, label: "earnings", path: "/dashboard/earnings" },
    { icon: Settings, label: "settings", path: "/dashboard/settings" },
  ],
};

export function Sidebar({ role, isOpen: externalIsOpen, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const menuItems = roleMenus[role] || [];
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use external state if provided, otherwise use internal
  const sidebarOpen = externalIsOpen !== undefined ? externalIsOpen : internalSidebarOpen;
  const setSidebarOpen = onToggle || setInternalSidebarOpen;

  // Fallback labels for CUSTOMER menu if translations are missing
  const labelMap: Record<string, string> = {
    dashboard: t('dashboard.dashboard', { defaultValue: 'Dashboard' }) as unknown as string,
    listings: t('dashboard.listings', { defaultValue: 'Unified Listings' }) as unknown as string,
    myShops: t('dashboard.myShops', { defaultValue: 'My Shops' }) as unknown as string,
    myServices: t('dashboard.myServices', { defaultValue: 'My Services' }) as unknown as string,
    products: t('dashboard.products', { defaultValue: 'Products' }) as unknown as string,
    myBookings: t('dashboard.myBookings', { defaultValue: 'My Bookings' }) as unknown as string,
    bookings: t('dashboard.bookings', { defaultValue: 'Bookings' }) as unknown as string,
    myOrders: t('dashboard.myOrders', { defaultValue: 'My Orders' }) as unknown as string,
    chat: t('dashboard.chat', { defaultValue: 'Chat' }) as unknown as string,
    notifications: t('dashboard.notifications', { defaultValue: 'Notifications' }) as unknown as string,
    analytics: t('dashboard.analytics', { defaultValue: 'Analytics' }) as unknown as string,
    settings: t('dashboard.settings', { defaultValue: 'Settings' }) as unknown as string,
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint is 1024px
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 shrink-0 bg-card rounded-2xl shadow-sm border border-border"
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {labelMap[item.label] ?? t(`dashboard.${item.label}`)}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    );
  }

  // Mobile Layout
  return (
    <>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[105] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-stone-900 shadow-2xl z-[110] lg:hidden overflow-y-auto"
        >
          <div className="p-6 pt-20">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">دليل بلدي</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent hover:border-stone-200 dark:hover:border-stone-700",
                      "hover:bg-stone-50 dark:hover:bg-stone-800",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <div className="flex-1 text-right">
                      <span className="font-medium text-stone-900 dark:text-white">
                        {labelMap[item.label] ?? t(`dashboard.${item.label}`)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.aside>
      )}
    </>
  );
}
