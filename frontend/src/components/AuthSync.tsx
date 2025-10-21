'use client';

import { useEffect } from 'react';
import { setAuthToken } from '@/lib/auth-sync';

/**
 * Component to sync authentication token between localStorage and cookies
 * This ensures middleware has access to user role for server-side validation
 */
export default function AuthSync() {
  useEffect(() => {
    console.log('🔄 AuthSync: Starting token sync...');
    
    // Immediately sync token from localStorage to cookie on mount
    const token = localStorage.getItem('daleel-token');
    if (token) {
      console.log('✅ AuthSync: Token found in localStorage, syncing to cookie...');
      setAuthToken(token);
    } else {
      console.log('❌ AuthSync: No token found in localStorage');
    }
    
    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'daleel-token') {
        if (e.newValue) {
          setAuthToken(e.newValue);
        } else {
          // Token was removed - clear cookie
          document.cookie = 'daleel-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return null;
}

