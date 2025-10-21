import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Calendar,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
} from 'lucide-react';
import { NotificationStats as StatsType } from '@/api/notifications';

interface NotificationStatsProps {
  stats: StatsType | null;
  loading: boolean;
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({ stats, loading }) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: t('notifications.stats.new'),
      value: stats.unread,
      icon: Bell,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      trend: stats.unread > 0 ? '+' + stats.unread : '0',
    },
    {
      title: t('notifications.stats.bookings'),
      value: stats.byType['BOOKING'] || 0,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: t('notifications.stats.messages'),
      value: stats.byType['CHAT'] || 0,
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      title: t('notifications.stats.total'),
      value: stats.total,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="overflow-hidden border-l-4 border-l-transparent hover:border-l-current hover:shadow-md transition-all"
            style={{ borderLeftColor: stat.color.replace('text-', '') }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <span className="text-xs font-medium text-green-500">{stat.trend}</span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

