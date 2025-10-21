import React from 'react';
import { Grid3x3, List, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list' | 'map';

interface ViewSwitcherProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

/**
 * View Switcher Component
 * Allows users to switch between Grid, List, and Map views
 */
export function ViewSwitcher({ view, onViewChange, className }: ViewSwitcherProps) {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'grid', icon: <Grid3x3 className="h-4 w-4" />, label: 'شبكة' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'قائمة' },
    { mode: 'map', icon: <MapPin className="h-4 w-4" />, label: 'خريطة' },
  ];

  return (
    <div className={cn('flex items-center gap-1 bg-muted rounded-lg p-1', className)}>
      {views.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          variant={view === mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(mode)}
          className={cn(
            'flex items-center gap-2 transition-all',
            view === mode && 'shadow-sm'
          )}
          title={label}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

/**
 * Compact View Switcher (Icon only)
 */
export function CompactViewSwitcher({ view, onViewChange, className }: ViewSwitcherProps) {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'grid', icon: <Grid3x3 className="h-4 w-4" />, label: 'عرض شبكي' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'عرض قائمة' },
    { mode: 'map', icon: <MapPin className="h-4 w-4" />, label: 'عرض خريطة' },
  ];

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {views.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          variant={view === mode ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewChange(mode)}
          title={label}
          className={cn(
            'transition-all',
            view === mode && 'ring-2 ring-primary/50'
          )}
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}

