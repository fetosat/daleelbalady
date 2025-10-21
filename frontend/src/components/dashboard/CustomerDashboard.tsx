'use client';

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Package, Bell, Star, CreditCard, TrendingUp, Eye, ArrowRight, ShoppingBag, Store } from "lucide-react";
import { getCustomerOverview, type CustomerOverview } from "@/api/dashboard";
import { useAuth } from "@/lib/auth";
// import { TouchButton, SwipeableCard, MobileCardGrid, PullToRefresh, LazyImage } from "@/components/ui/mobile-optimized";
// import { ResponsiveDashboardLayout } from "@/components/layout/ResponsiveDashboardLayout";

export default function CustomerDashboard() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const data = await getCustomerOverview();
        setOverview(data);
      } catch (err) {
        console.error('Failed to fetch dashboard overview:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOverview();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">No data available</p>
      </div>
    );
  }

  // const handleRefresh = async () => {
  //   const data = await getCustomerOverview();
  //   setOverview(data);
  // };

  return (
    <div className="space-y-6 bg-stone-950 min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-100">
          أهلاً وسهلاً، {overview.user.name}!
        </h1>
        <p className="text-stone-400 mt-1">إليك ما يحدث في حسابك اليوم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-stone-900 border-stone-800 hover:border-stone-700 transition-all hover:scale-105 cursor-pointer" onClick={() => router.push('/dashboard/bookings')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-stone-400 mb-2">إجمالي الحجوزات</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-100">{overview.stats.totalBookings}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800 hover:border-stone-700 transition-all hover:scale-105 cursor-pointer" onClick={() => router.push('/dashboard/orders')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-stone-400 mb-2">إجمالي الطلبات</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-100">{overview.stats.totalOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800 hover:border-stone-700 transition-all hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-stone-400 mb-2">إجمالي المبلغ المنفق</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-100">{overview.stats.totalSpent.toLocaleString()}</span>
              <span className="text-sm text-stone-400">{overview.recentOrders[0]?.currency || 'ج.م'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-stone-900 border-stone-800 hover:border-stone-700 transition-all hover:scale-105 cursor-pointer" onClick={() => router.push('/dashboard/notifications')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-stone-400 mb-2">الإشعارات</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-100">{overview.stats.unreadNotifications}</span>
              {overview.stats.unreadNotifications > 0 && (
                <Badge variant="destructive" className="text-xs">جديد</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="border-b border-stone-800">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-stone-100">
                <Calendar className="h-5 w-5" />
                الحجوزات الأخيرة
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/bookings')} className="text-stone-300 hover:text-stone-100 hover:bg-stone-800">
                <Eye className="h-4 w-4 ml-1" />
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {overview.recentBookings.length > 0 ? (
              <div className="space-y-3">
                {overview.recentBookings.map((booking) => (
                  <div key={booking.id} className="bg-stone-800 border border-stone-700 rounded-lg p-4 hover:bg-stone-750 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-stone-100">{booking.serviceName}</p>
                        <p className="text-sm text-stone-400 flex items-center justify-end gap-1 mt-1">
                          <Store className="w-3 h-3" />
                          {booking.shopName}
                        </p>
                        <p className="text-xs text-stone-500 flex items-center justify-end gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.startAt).toLocaleDateString('ar-EG', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant={
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'PENDING' ? 'secondary' :
                        booking.status === 'COMPLETED' ? 'outline' : 'destructive'
                      } className="text-xs">
                        {booking.status === 'CONFIRMED' ? 'مؤكد' :
                         booking.status === 'PENDING' ? 'في الانتظار' :
                         booking.status === 'COMPLETED' ? 'مكتمل' : 'ملغى'}
                      </Badge>
                      {booking.price && (
                        <span className="text-sm font-semibold text-green-500">{booking.price} {booking.currency}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                <p className="text-stone-400 text-sm mb-2">لا توجد حجوزات حديثة</p>
                <Button variant="outline" size="sm" onClick={() => router.push('/search')} className="mt-2 border-stone-700 text-stone-300 hover:bg-stone-800">
                  ابحث عن خدمات
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-stone-900 border-stone-800">
          <CardHeader className="border-b border-stone-800">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-stone-100">
                <Package className="h-5 w-5" />
                الطلبات الأخيرة
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/orders')} className="text-stone-300 hover:text-stone-100 hover:bg-stone-800">
                <Eye className="h-4 w-4 ml-1" />
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {overview.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {overview.recentOrders.map((order) => (
                  <div key={order.id} className="bg-stone-800 border border-stone-700 rounded-lg p-4 hover:bg-stone-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <p className="font-medium text-stone-100">#{order.orderNumber}</p>
                        <p className="text-sm text-stone-400 mt-1">{order.itemsCount} عنصر</p>
                        <p className="text-xs text-stone-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={
                          order.status === 'DELIVERED' ? 'default' :
                          order.status === 'SHIPPED' ? 'secondary' :
                          order.status === 'PENDING' ? 'outline' : 'destructive'
                        } className="text-xs">
                          {order.status}
                        </Badge>
                        <span className="text-sm font-medium text-green-500">
                          {order.totalAmount} {order.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 text-center py-8 text-sm">لا توجد طلبات حديثة</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
