import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Filter, CheckCircle, Circle } from 'lucide-react';

interface NotificationFilterProps {
  statusFilter: 'all' | 'read' | 'unread';
  typeFilter: string | null;
  onStatusChange: (status: 'all' | 'read' | 'unread') => void;
  onTypeChange: (type: string | null) => void;
}

const notificationTypes = [
  { value: 'BOOKING', label: 'الحجوزات', icon: '📅' },
  { value: 'ORDER', label: 'الطلبات', icon: '🛒' },
  { value: 'REVIEW', label: 'التقييمات', icon: '⭐' },
  { value: 'CHAT', label: 'الرسائل', icon: '💬' },
  { value: 'PRODUCT', label: 'المنتجات', icon: '📦' },
  { value: 'SYSTEM', label: 'النظام', icon: '🔔' },
];

export const NotificationFilter: React.FC<NotificationFilterProps> = ({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}) => {
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-blue-500' : ''}`} />
          <span>تصفية</span>
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          حالة القراءة
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={statusFilter === 'all'}
          onCheckedChange={() => onStatusChange('all')}
        >
          <Circle className="h-3 w-3 ml-2" />
          جميع الإشعارات
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={statusFilter === 'unread'}
          onCheckedChange={() => onStatusChange('unread')}
        >
          <Circle className="h-3 w-3 ml-2 text-blue-500 fill-blue-500" />
          غير المقروءة
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={statusFilter === 'read'}
          onCheckedChange={() => onStatusChange('read')}
        >
          <CheckCircle className="h-3 w-3 ml-2 text-green-500" />
          المقروءة
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          نوع الإشعار
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={typeFilter === null}
          onCheckedChange={() => onTypeChange(null)}
        >
          جميع الأنواع
        </DropdownMenuCheckboxItem>
        {notificationTypes.map((type) => (
          <DropdownMenuCheckboxItem
            key={type.value}
            checked={typeFilter === type.value}
            onCheckedChange={() => onTypeChange(type.value)}
          >
            <span className="ml-2">{type.icon}</span>
            {type.label}
          </DropdownMenuCheckboxItem>
        ))}

        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onStatusChange('all');
                onTypeChange(null);
              }}
              className="text-sm text-muted-foreground"
            >
              إعادة تعيين الفلاتر
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

