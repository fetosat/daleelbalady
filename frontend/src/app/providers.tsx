'use client';

import React from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/lib/auth";
import { ChatboxProvider, useChatbox } from "@/contexts/ChatboxContext";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import "../lib/i18n"; // Import the main i18n configuration

// Error Boundary for chunk loading errors
class ChunkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if it's a chunk loading error
    if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      console.warn('Chunk loading error detected, attempting recovery:', error);
      // Trigger a reload to recover from chunk loading errors
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold mb-4">Loading Error</h1>
            <p className="mb-4">An error occurred while loading the application.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render FloatingChatbox only on the client to avoid hydration mismatches from i18n
const FloatingChatbox = dynamic(
  () => import("@/components/shared/FloatingChatbox")
    .then(m => m.FloatingChatbox)
    .catch(err => {
      console.warn('Failed to load FloatingChatbox:', err);
      return () => null; // Return empty component on error
    }),
  {
    ssr: false,
    loading: () => null, // No loading component to avoid flash
  }
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const { isFocused } = useChatbox();
  
  // Set base document title
  useDocumentTitle();
  
  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    // Clean up any existing service workers in development to prevent chunk caching issues
    if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          console.log('Unregistering service worker for development:', registration);
          registration.unregister();
        });
      }).catch(error => {
        console.warn('Failed to unregister service workers:', error);
      });
    }
  }, []);
  
  return (
        <ThemeProvider 
          attribute="class"
          defaultTheme="system" 
          enableSystem
          storageKey="daleel-theme"
          disableTransitionOnChange
        >
      <TooltipProvider>
        <Sonner 
          position="top-center"
          richColors
          closeButton
          duration={4000}
        />
        <motion.div
          animate={{
            filter: isFocused ? 'blur(2px)' : 'blur(0px)'
          }}
          transition={{ duration: 0.3 }}
          style={{ position: 'relative' }}
        >
          {children}
        </motion.div>
        <FloatingChatbox />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ChunkErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChatboxProvider>
            <AppContent>
              {children}
            </AppContent>
          </ChatboxProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ChunkErrorBoundary>
  );
}
