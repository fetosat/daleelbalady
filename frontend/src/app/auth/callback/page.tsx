'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { setAuthToken } from '@/lib/auth-sync';
import { auth } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        // Handle OAuth errors
        let errorMessage = 'Authentication failed';
        
        if (error === 'google_auth_failed') {
          errorMessage = 'Google authentication failed. Please try again.';
        } else if (error === 'facebook_auth_failed') {
          errorMessage = 'Facebook authentication failed. Please try again.';
        } else if (error === 'callback_failed') {
          errorMessage = 'Authentication callback failed. Please try again.';
        }

        toast({
          title: 'Authentication Error',
          description: errorMessage,
          variant: 'destructive',
        });

        // Redirect back to login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      if (token) {
        try {
          // Store the token using the correct key and sync utility
          setAuthToken(token);
          
          // Fetch user data from backend
          const userData = await auth.getCurrentUser();
          
          // Store user data
          if (typeof window !== 'undefined') {
            localStorage.setItem('daleel-user', JSON.stringify(userData));
          }
          
          toast({
            title: 'Success',
            description: 'Successfully logged in!',
            variant: 'default',
          });

          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 500);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          toast({
            title: 'Error',
            description: 'Failed to load user data. Please try logging in again.',
            variant: 'destructive',
          });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        // No token or error, redirect to login
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, updateUser, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-primary text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}

