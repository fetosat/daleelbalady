'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { DashboardTransition } from '@/components/DashboardTransition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Loader2,
  CheckCheck,
  RefreshCcw,
} from 'lucide-react';
import {
  getProviderNotifications,
  getProviderNotificationStats,
  markProviderNotificationAsRead,
  markAllProviderNotificationsAsRead,
  deleteProviderNotification,
  type Notification,
  type NotificationStats as StatsType,
} from '@/api/notifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationFilter } from '@/components/notifications/NotificationFilter';
import { NotificationStats } from '@/components/notifications/NotificationStats';


export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.role === 'PROVIDER') {
      fetchNotifications();
      fetchStats();
    }
  }, [user, statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    if (user?.role !== 'PROVIDER') return;

    try {
      setLoading(true);
      const response = await getProviderNotifications(
        1,
        50,
        statusFilter,
        typeFilter || undefined
      );
      setNotifications(response.notifications);
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
    if (user?.role !== 'PROVIDER') return;

    try {
      const statsData = await getProviderNotificationStats();
      setStats(statsData);
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markProviderNotificationAsRead(notificationId);
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
    if (user?.role !== 'PROVIDER' || markingAllRead) return;

    try {
      setMarkingAllRead(true);
      await markAllProviderNotificationsAsRead();
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
      await deleteProviderNotification(notificationId);
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
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  // Redirect if not a provider
  if (user && user.role !== 'PROVIDER') {
    router.push('/dashboard');
    return null;
  }

  return (
    <DashboardTransition>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-8 w-8 text-blue-500" />
              {t('notifications.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('notifications.description')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('notifications.refresh')}
            </Button>
            <NotificationFilter
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onStatusChange={setStatusFilter}
              onTypeChange={setTypeFilter}
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead || stats?.unread === 0}
              className="gap-2"
            >
              {markingAllRead ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{t('notifications.markAllRead')}</span>
              <span className="sm:hidden">{t('notifications.markAllRead')}</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <NotificationStats stats={stats} loading={loading} />

        {/* Notifications List */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-full animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
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
                  {statusFilter !== 'all' || typeFilter
                    ? t('notifications.noMatchingFilters')
                    : t('notifications.noNotificationsYet')}
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
          </CardContent>
        </Card>
      </div>
    </DashboardTransition>
  );
}
