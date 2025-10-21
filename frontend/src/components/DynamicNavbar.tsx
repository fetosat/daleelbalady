'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/navigation/Navbar';

export function DynamicNavbar() {
  const { user, isLoading } = useAuth();

  // Show loading navbar while auth is loading
  if (isLoading) {
    return (
      <div className="sticky top-0 z-50 bg-white dark:bg-stone-950 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">د</span>
          </div>
          <span className="text-xl font-bold text-stone-900 dark:text-white">دليل بلدي</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-stone-300 dark:bg-stone-700 rounded-full animate-pulse"></div>
        </div>
          </div>
        </div>
      </div>
    );
  }

  // Convert user data to format expected by Navbar
  const navbarUser = user ? {
    name: user.name,
    email: user.email,
    avatar: user.profilePic || '/avatar-placeholder.png',
    plan: {
      type: 'عائلية', // You might want to get this from user data
      discountPercentage: 15 // You might want to get this from user data
    }
  } : undefined;

  return <Navbar user={navbarUser} />;
}
