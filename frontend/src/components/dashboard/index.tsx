'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardTransition } from "@/components/DashboardTransition";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Combine both redirects into a single useEffect to ensure consistent hook order
  const handleRedirect = useCallback(() => {
    if (isLoading) return; // Wait for loading to complete
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (user.role) {
      const roleRoute = user.role.toLowerCase().replace('_', '-');
      router.push(`/dashboard/${roleRoute}`);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <DashboardTransition>
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Redirecting to your dashboard...</div>
        </div>
      </DashboardLayout>
    </DashboardTransition>
  );
}
