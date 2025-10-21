import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Home, BookOpen, ShoppingCart, Store, Users, Settings, BarChart, MessageCircle, User, Menu, X } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  icon: LucideIcon | null;
  label: string;
  path?: string;
}

const roleMenus: Record<string, MenuItem[]> = {
  CUSTOMER: [
    { icon: BookOpen, label: "sidebar.bookings" },
    { icon: ShoppingCart, label: "sidebar.orders" },
    { icon: null, label: "sidebar.subscriptions" },
    { icon: null, label: "sidebar.reviews" },
    { icon: MessageCircle, label: "sidebar.notifications" },
    { icon: Settings, label: "sidebar.settings" },
  ],
  SHOP_OWNER: [
    { icon: Store, label: "sidebar.shopManagement" },
    { icon: BookOpen, label: "sidebar.servicesManagement" },
    { icon: ShoppingCart, label: "sidebar.productsManagement" },
    { icon: BookOpen, label: "sidebar.bookings" },
    { icon: ShoppingCart, label: "sidebar.orders" },
    { icon: MessageCircle, label: "sidebar.chat" },
    { icon: BarChart, label: "sidebar.analytics" },
    { icon: Settings, label: "sidebar.settings" },
  ],
  PROVIDER: [
    { icon: BookOpen, label: "sidebar.servicesManagement" },
    { icon: BookOpen, label: "sidebar.bookings" },
    { icon: null, label: "sidebar.reviews" },
    { icon: Settings, label: "sidebar.settings" },
  ],
  DELIVERY: [
    { icon: ShoppingCart, label: "sidebar.assignedOrders" },
    { icon: BarChart, label: "sidebar.deliveryStatus" },
    { icon: BarChart, label: "sidebar.earnings" },
    { icon: Settings, label: "sidebar.settings" },
  ],
  ADMIN: [
    { icon: Users, label: "sidebar.userManagement", path: "/dashboard/admin/users" },
    { icon: Store, label: "sidebar.shopsManagement", path: "/dashboard/admin/shops" },
    { icon: BookOpen, label: "sidebar.servicesManagement", path: "/dashboard/admin/services" },
    { icon: ShoppingCart, label: "sidebar.productsManagement", path: "/dashboard/admin/products" },
    { icon: ShoppingCart, label: "sidebar.deliveries", path: "/dashboard/admin/deliveries" },
    { icon: MessageCircle, label: "sidebar.reviews", path: "/dashboard/admin/reviews" },
    { icon: MessageCircle, label: "sidebar.notifications", path: "/dashboard/admin/notifications" },
    { icon: BarChart, label: "sidebar.plansCoupons", path: "/dashboard/admin/plans" },
    { icon: Settings, label: "sidebar.settings", path: "/dashboard/admin/settings" },
  ],
};

export default function DashboardSidebar({ role }: { role: keyof typeof roleMenus }) {
  const { t } = useTranslation("dashboard");
  const menu = roleMenus[role] || [];
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Close sidebar on mobile when screen becomes desktop
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('menu-button');
      
      if (isOpen && sidebar && !sidebar.contains(target) && !menuButton?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <aside className="w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-4 flex flex-col gap-2 h-fit sticky top-6">
        <NavigationMenu>
          {menu.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon ? <Icon className="w-5 h-5 flex-shrink-0" /> : null}
                <span className="font-medium">{t(item.label)}</span>
              </>
            );

            return item.path ? (
              <Link
                key={i}
                to={item.path}
                className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white group"
              >
                {content}
              </Link>
            ) : (
              <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-200 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer">
                {content}
              </div>
            );
          })}
        </NavigationMenu>
      </aside>
    );
  }

  // Mobile Layout
  return (
    <>
      {/* Mobile Header with Hamburger Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-stone-900 shadow-sm border-b border-stone-200 dark:border-stone-700 z-40 p-3">
        <div className="flex items-center justify-between">
          <Button
            id="menu-button"
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-white">دليل بلدي</h1>
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-45 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-stone-900 shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            <div className="p-6 pt-16">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">القائمة الرئيسية</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              </div>
              
              <NavigationMenu className="w-full">
                <div className="space-y-2">
                  {menu.map((item, i) => {
                    const Icon = item.icon;
                    const content = (
                      <div className="flex items-center gap-4 w-full">
                        {Icon ? (
                          <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                          </div>
                        )}
                        <div className="flex-1 text-right">
                          <span className="font-medium text-stone-900 dark:text-white">{t(item.label)}</span>
                        </div>
                      </div>
                    );

                    return item.path ? (
                      <Link
                        key={i}
                        to={item.path}
                        className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-200 border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                        onClick={() => setIsOpen(false)}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={i} className="flex items-center w-full py-4 px-4 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all duration-200 cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-700">
                        {content}
                      </div>
                    );
                  })}
                </div>
              </NavigationMenu>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
