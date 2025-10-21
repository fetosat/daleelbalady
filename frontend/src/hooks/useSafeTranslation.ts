import { useTranslation as useOriginalTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export const useSafeTranslation = () => {
  const [isReady, setIsReady] = useState(false);
  const translation = useOriginalTranslation();

  useEffect(() => {
    // Only set ready on client side
    if (typeof window !== 'undefined') {
      setIsReady(true);
    }
  }, []);

  // Return safe defaults during SSR
  if (!isReady) {
    return {
      t: (key: string, options?: any) => key, // Return the key itself as fallback
      i18n: {
        language: 'ar',
        changeLanguage: () => Promise.resolve(),
        dir: () => 'rtl',
        exists: () => false,
        getFixedT: () => (key: string) => key,
        hasResourceBundle: () => false,
        loadNamespaces: () => Promise.resolve(),
        loadLanguages: () => Promise.resolve(),
        reloadResources: () => Promise.resolve(),
        setDefaultNamespace: () => {},
        addResourceBundle: () => {},
        removeResourceBundle: () => {},
        getResourceBundle: () => ({}),
        getDataByLanguage: () => ({}),
        store: {},
        services: {},
        isInitialized: false,
      },
      ready: false,
    };
  }

  return translation;
};
