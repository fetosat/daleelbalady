import React from 'react';
import { Search, Package, FileQuestion, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  type?: 'search' | 'no-results' | 'error' | 'no-data' | 'default';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

/**
 * Beautiful Empty State Component
 * Shows helpful message when there's no data or results
 */
export function EmptyState({
  type = 'default',
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  // Default content based on type
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="h-16 w-16 text-stone-400" />,
          title: 'ابدأ البحث',
          description: 'استخدم شريط البحث أعلاه للعثور على ما تبحث عنه',
        };
      case 'no-results':
        return {
          icon: <FileQuestion className="h-16 w-16 text-stone-400" />,
          title: 'لا توجد نتائج',
          description: 'جرب تغيير معايير البحث أو الفلاتر للحصول على نتائج أفضل',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-500" />,
          title: 'حدث خطأ',
          description: 'عذراً، حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى',
        };
      case 'no-data':
        return {
          icon: <Inbox className="h-16 w-16 text-stone-400" />,
          title: 'لا توجد بيانات',
          description: 'لا يوجد محتوى لعرضه في الوقت الحالي',
        };
      default:
        return {
          icon: <Package className="h-16 w-16 text-stone-400" />,
          title: 'لا يوجد محتوى',
          description: 'لا يوجد محتوى لعرضه',
        };
    }
  };

  const defaultContent = getDefaultContent();
  const displayIcon = icon || defaultContent.icon;
  const displayTitle = title || defaultContent.title;
  const displayDescription = description || defaultContent.description;

  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
        {/* Icon with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative bg-white dark:bg-stone-800 p-6 rounded-full shadow-lg">
            {displayIcon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-stone-900 dark:text-white">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
          {displayDescription}
        </p>

        {/* Action Button */}
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-4"
            size="lg"
          >
            {action.label}
          </Button>
        )}

        {/* Suggestions (for no-results type) */}
        {type === 'no-results' && (
          <div className="mt-6 text-sm text-stone-500 dark:text-stone-400 space-y-2">
            <p className="font-semibold">اقتراحات:</p>
            <ul className="list-disc list-inside text-right space-y-1">
              <li>تأكد من كتابة الكلمات بشكل صحيح</li>
              <li>جرب كلمات مفتاحية مختلفة</li>
              <li>استخدم مصطلحات أكثر عمومية</li>
              <li>قلل عدد الفلاتر المستخدمة</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Compact Empty State
 * For smaller spaces
 */
export function CompactEmptyState({
  type = 'default',
  message,
}: {
  type?: EmptyStateProps['type'];
  message?: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'no-results':
        return <FileQuestion className="h-8 w-8 text-stone-400" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Inbox className="h-8 w-8 text-stone-400" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'no-results':
        return 'لا توجد نتائج';
      case 'error':
        return 'حدث خطأ';
      default:
        return 'لا يوجد محتوى';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {getIcon()}
      <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
        {message || getDefaultMessage()}
      </p>
    </div>
  );
}

