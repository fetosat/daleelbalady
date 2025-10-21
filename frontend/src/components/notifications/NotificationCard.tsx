import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Star,
  Package,
  Gift,
  DollarSign,
  Info,
  ShoppingCart,
  XCircle,
  Trash2,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import { Notification, getNotificationMeta } from '@/api/notifications';

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Star,
  Package,
  Gift,
  DollarSign,
  Info,
  ShoppingCart,
  XCircle,
};

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  isDeleting = false,
}) => {
  const meta = getNotificationMeta(notification.type);
  const IconComponent = iconMap[meta.icon] || Info;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`group relative p-4 hover:bg-accent/50 cursor-pointer transition-all rounded-lg border border-transparent hover:border-border ${
        !notification.isRead
          ? 'bg-gradient-to-r from-blue-50/80 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10 border-r-4 !border-r-blue-500'
          : 'bg-card'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex-shrink-0 p-3 rounded-xl ${meta.bgColor} ${meta.color} shadow-sm ring-1 ring-black/5`}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-sm font-semibold ${
                  !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {notification.title}
              </h4>
              {!notification.isRead && (
                <Badge variant="default" className="text-xs px-2 py-0.5 bg-blue-500">
                  جديد
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(notification.createdAt)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          {/* Shop reference if available */}
          {notification.metadata?.shopName && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Package className="h-3 w-3" />
              <span>{notification.metadata.shopName}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.isRead && (
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreVertical className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!notification.isRead && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead();
                  }}
                >
                  <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                  <span>تحديد كمقروء</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                <span>حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

