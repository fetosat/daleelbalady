import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
// import '@/styles/globals.css'; // Uncomment and adjust if you have global styles

function MyApp({ Component, pageProps }: AppProps) {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Ensure i18n is initialized
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => {
        setI18nReady(true);
      });
      // If already initializing, just wait
      if (i18n.isInitializing) {
        return;
      }
    } else {
      setI18nReady(true);
    }
  }, []);

  // Show loading state while i18n initializes
  if (!i18nReady && !i18n.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Component {...pageProps} />
    </I18nextProvider>
  );
}

export default MyApp;
