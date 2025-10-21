'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Store, 
  Package, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface DashboardStats {
  users: {
    total: number;
    providers: number;
    customers: number;
    recentSignups: number;
  };
  shops: {
    total: number;
  };
  services: {
    total: number;
  };
  products: {
    total: number;
  };
  bookings: {
    total: number;
    recent: number;
  };
  orders: {
    total: number;
  };
  revenue: {
    total: number;
  };
  subscriptions: {
    active: number;
  };
  applications: {
    pending: number;
  };
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  href?: string;
  badge?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  href,
  badge 
}) => {
  const cardElement = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
          {badge && (
            <Badge variant="destructive" className="mr-2 text-xs">
              {badge}
            </Badge>
          )}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className={`text-xs flex items-center ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3 ml-1" />
            ) : (
              <TrendingDown className="h-3 w-3 ml-1" />
            )}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href}>
      {cardElement}
    </Link>
  ) : (
    cardElement
  );
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://api.daleelbalady.com/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('daleel-token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(t('dashboard.failedToLoadStats'));
        // Mock data for development
        setStats({
          users: {
            total: 1250,
            providers: 180,
            customers: 1070,
            recentSignups: 25
          },
          shops: {
            total: 95
          },
          services: {
            total: 420
          },
          products: {
            total: 1850
          },
          bookings: {
            total: 340,
            recent: 12
          },
          orders: {
            total: 280
          },
          revenue: {
            total: 125000
          },
          subscriptions: {
            active: 85
          },
          applications: {
            pending: 8
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-stone-200 dark:bg-stone-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">{t('common.loading')}</h3>
          <p className="text-stone-600 dark:text-stone-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-stone-600 dark:text-stone-400">{t('dashboard.overview')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={t('dashboard.stats.totalUsers')}
            value={stats.users.total.toLocaleString()}
            change={`+${stats.users.recentSignups} ${locale === 'ar' ? 'هذا الأسبوع' : 'this week'}`}
            changeType="increase"
            icon={Users}
            href="/admin/users"
          />
          
          <StatsCard
            title={t('dashboard.stats.providers')}
            value={stats.users.providers.toLocaleString()}
            icon={Store}
            href="/admin/users?role=PROVIDER"
          />
          
          <StatsCard
            title={t('dashboard.stats.totalShops')}
            value={stats.shops.total.toLocaleString()}
            icon={Store}
            href="/admin/shops"
          />
          
          <StatsCard
            title={t('dashboard.stats.totalServices')}
            value={stats.services.total.toLocaleString()}
            icon={Package}
            href="/admin/services"
          />
          
          <StatsCard
            title={t('dashboard.stats.totalProducts')}
            value={stats.products.total.toLocaleString()}
            icon={Package}
            href="/admin/products"
          />
          
          <StatsCard
            title={t('dashboard.stats.totalBookings')}
            value={stats.bookings.total.toLocaleString()}
            change={`+${stats.bookings.recent} ${locale === 'ar' ? 'اليوم' : 'today'}`}
            changeType="increase"
            icon={Calendar}
            href="/admin/bookings"
          />
          
          <StatsCard
            title={t('dashboard.stats.totalOrders')}
            value={stats.orders.total.toLocaleString()}
            icon={ShoppingBag}
            href="/admin/orders"
          />
          
          <StatsCard
            title={t('dashboard.stats.totalRevenue')}
            value={`${stats.revenue.total.toLocaleString()} ${locale === 'ar' ? 'جنيه' : 'EGP'}`}
            icon={DollarSign}
            href="/admin/payments"
          />
          
          <StatsCard
            title={t('dashboard.stats.activeSubscriptions')}
            value={stats.subscriptions.active.toLocaleString()}
            icon={Receipt}
            href="/admin/subscriptions"
          />
          
          <StatsCard
            title={t('dashboard.stats.pendingApplications')}
            value={stats.applications.pending.toLocaleString()}
            icon={FileText}
            href="/admin/applications"
            badge={stats.applications.pending > 0 ? t('common.new') : undefined}
          />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 ml-2" />
                {t('users.title')}
              </Button>
            </Link>
            
            <Link href="/admin/applications">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 ml-2" />
                {locale === 'ar' ? 'مراجعة طلبات الأعمال' : 'Review Applications'}
                {stats.applications.pending > 0 && (
                  <Badge variant="destructive" className="mr-auto">
                    {stats.applications.pending}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link href="/admin/coupons">
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="h-4 w-4 ml-2" />
                {locale === 'ar' ? 'إنشاء كوبون خصم' : 'Create Coupon'}
              </Button>
            </Link>
            
            <Link href="/admin/categories">
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 ml-2" />
                {t('categories.title')}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('activity.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">مستخدم جديد انضم للمنصة</p>
                  <p className="text-xs text-stone-500">منذ 5 دقائق</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">طلب عمل جديد تم تقديمه</p>
                  <p className="text-xs text-stone-500">منذ 15 دقيقة</p>
                </div>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">حجز جديد تم إجراؤه</p>
                  <p className="text-xs text-stone-500">منذ 30 دقيقة</p>
                </div>
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">دفعة جديدة تمت بنجاح</p>
                  <p className="text-xs text-stone-500">منذ ساعة</p>
                </div>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 ml-2" />
              حالة المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">العملاء</span>
                <span className="font-medium">{stats.users.customers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">مقدمي الخدمات</span>
                <span className="font-medium">{stats.users.providers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">انضم هذا الأسبوع</span>
                <Badge variant="secondary">{stats.users.recentSignups}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 ml-2" />
              الإيرادات والمدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">إجمالي الإيرادات</span>
                <span className="font-medium">{stats.revenue.total.toLocaleString()} جنيه</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">الاشتراكات النشطة</span>
                <span className="font-medium">{stats.subscriptions.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">متوسط القيمة</span>
                <Badge variant="outline">
                  {Math.round(stats.revenue.total / (stats.bookings.total + stats.orders.total || 1))} جنيه
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 ml-2" />
              طلبات الأعمال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">في الانتظار</span>
                <Badge variant="destructive">{stats.applications.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-600 dark:text-stone-400">تحتاج لمراجعة</span>
                <Badge variant="secondary">2</Badge>
              </div>
              <Link href="/admin/applications">
                <Button size="sm" className="w-full mt-2">
                  مراجعة الطلبات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
