'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  Calendar, 
  ShoppingCart, 
  Star, 
  Package, 
  MessageSquare, 
  Settings, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  CheckCheck,
  Filter,
  Loader2,
  Eye,
  ArrowLeft
} from 'lucide-react';
import {
  getUserNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getProviderNotifications,
  getProviderNotificationStats,
  markProviderNotificationAsRead,
  markAllProviderNotificationsAsRead,
  deleteProviderNotification,
  getNotificationMeta,
  type Notification,
  type NotificationStats as StatsType,
} from '@/api/notifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationStats } from '@/components/notifications/NotificationStats';


export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchNotifications();
      fetchStats();
    }
  }, [user, authLoading, router]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let response;

      if (user.role === 'PROVIDER') {
        const statusFilter = activeTab === 'all' ? 'all' : activeTab === 'unread' ? 'unread' : 'read';
        response = await getProviderNotifications(1, 50, statusFilter);
        setNotifications(response.notifications);
      } else {
        const unreadOnly = activeTab === 'unread';
        response = await getUserNotifications(user.id, 1, 50, unreadOnly);
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: t('common.error'),
        description: t('notifications.errorLoading'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      if (user.role === 'PROVIDER') {
        const statsData = await getProviderNotificationStats();
        setStats(statsData);
      } else {
        const statsData = await getNotificationStats(user.id);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchStats()]);
    setRefreshing(false);
    toast({
      title: t('notifications.updated'),
      description: t('notifications.updatedSuccess'),
    });
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [activeTab]);

  const getIcon = (type: string) => {
    const iconClass = 'h-4 w-4';
    switch (type) {
      case 'BOOKING':
        return <Calendar className={iconClass} />;
      case 'ORDER':
        return <ShoppingCart className={iconClass} />;
      case 'SYSTEM':
        return <Settings className={iconClass} />;
      case 'REVIEW':
        return <Star className={iconClass} />;
      case 'SHOP':
        return <Store className={iconClass} />;
      case 'MESSAGE':
        return <MessageSquare className={iconClass} />;
      case 'PAYMENT':
        return <Package className={iconClass} />;
      case 'DELIVERY':
        return <Package className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ORDER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'SYSTEM':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-900/20 dark:text-stone-400';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'SHOP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'MESSAGE':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'PAYMENT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'DELIVERY':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-900/20 dark:text-stone-400';
    }
  };


  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (user?.role === 'PROVIDER') {
        await markProviderNotificationAsRead(notificationId);
      } else {
        await markNotificationAsRead(notificationId);
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      fetchStats();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: t('common.error'),
        description: t('notifications.errorUpdating'),
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllRead) return;

    try {
      setMarkingAllRead(true);
      if (user?.role === 'PROVIDER') {
        await markAllProviderNotificationsAsRead();
      } else if (user) {
        await markAllNotificationsAsRead();
      }
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      fetchStats();
      toast({
        title: t('common.success'),
        description: t('notifications.allMarkedAsRead'),
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: t('common.error'),
        description: t('notifications.errorUpdating'),
        variant: 'destructive',
      });
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      setDeletingIds((prev) => new Set(prev).add(notificationId));
      if (user?.role === 'PROVIDER') {
        await deleteProviderNotification(notificationId);
      } else {
        await deleteNotification(notificationId);
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      fetchStats();
      toast({
        title: t('common.success'),
        description: t('notifications.deleted'),
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: t('common.error'),
        description: t('notifications.errorDeleting'),
        variant: 'destructive',
      });
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.metadata?.actionUrl || notification.actionUrl) {
      router.push(notification.metadata?.actionUrl || notification.actionUrl);
    }
  };

  const unreadCount = stats?.unread || 0;

  // Show loading or redirect if not authenticated
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحويلك لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                  <Bell className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                  {t('notifications.title')}
                </h1>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-1 mr-12">
                {unreadCount > 0 
                  ? t('notifications.unreadCount', { count: unreadCount })
                  : t('notifications.allRead')
                }
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh} 
                disabled={refreshing}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {t('notifications.refresh')}
              </Button>
              {unreadCount > 0 && (
                <Button 
                  size="sm"
                  onClick={handleMarkAllAsRead} 
                  disabled={markingAllRead}
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                >
                  {markingAllRead ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="ml-2 h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{t('notifications.markAllRead')}</span>
                  <span className="sm:hidden">{t('notifications.markAllRead')}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <NotificationStats stats={stats} loading={loading} />

          {/* Notifications List */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{t('notifications.title')}</CardTitle>
                  <CardDescription className="mt-1">
                    {t('notifications.description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread' | 'read')}>
                <div className="border-b">
                  <TabsList className="w-full grid grid-cols-3 bg-transparent h-auto p-0 rounded-none">
                    <TabsTrigger 
                      value="all" 
                      className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('notifications.tabs.all')}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stats?.total || 0}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="unread" 
                      className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    >
                      <BellRing className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('notifications.tabs.unread')}</span>
                      <Badge variant="destructive" className="text-xs">
                        {unreadCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="read" 
                      className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('notifications.tabs.read')}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(stats?.total || 0) - unreadCount}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="m-0">
                  {loading ? (
                    <div className="space-y-2 p-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-950/30 mb-4">
                        <Bell className="h-12 w-12 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{t('notifications.noNotifications')}</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {activeTab === 'unread' 
                          ? t('notifications.noUnread') 
                          : activeTab === 'read' 
                          ? t('notifications.noRead')
                          : t('notifications.noNotificationsYet')
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      <AnimatePresence mode="popLayout">
                        {notifications.map((notification) => (
                          <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onClick={() => handleNotificationClick(notification)}
                            onMarkAsRead={() => handleMarkAsRead(notification.id)}
                            onDelete={() => handleDelete(notification.id)}
                            isDeleting={deletingIds.has(notification.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
