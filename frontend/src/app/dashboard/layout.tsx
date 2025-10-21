'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { redirect, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  
  // Check if we're in admin routes - they have their own layout
  const isAdminRoute = pathname?.startsWith('/dashboard/admin');

  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Admin routes use their own layout, so don't wrap them
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
