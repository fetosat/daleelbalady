import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { ChatboxProvider, useChatbox } from "@/contexts/ChatboxContext";
import { FloatingChatbox } from "@/components/shared/FloatingChatbox";
import Index from "@/components/Index";
import "./lib/i18n";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Clarity from '@microsoft/clarity';

const queryClient = new QueryClient();

const AppContent = () => {
  const { i18n } = useTranslation();
  const { isFocused } = useChatbox();

  // Set base document title
  useDocumentTitle();

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    // Make sure to add your actual project id instead of "yourProjectId".
    const projectId = "ti53gfc96r"

    Clarity.init(projectId);
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
        <Toaster />
        <Sonner />
        <motion.div
          animate={{
            filter: isFocused ? 'blur(2px)' : 'blur(0px)'
          }}
          transition={{ duration: 0.3 }}
        >
          <Index />
        </motion.div>
        <FloatingChatbox />
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatboxProvider>
        <AppContent />
      </ChatboxProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
