import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// For SSR consistency, always start with Arabic and let client-side update if needed
const getInitialLanguage = () => {
  // Always return 'ar' for SSR consistency
  // Client-side will update after hydration if user has different preference
  return 'ar';
};

const getInitialDirection = () => {
  // Always return 'rtl' for SSR consistency
  return 'rtl';
};

// Get client-side language preference (only used after hydration)
const getClientLanguage = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('language') || 'ar';
  }
  return 'ar';
};

const getClientDirection = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('direction') || 'rtl';
  }
  return 'rtl';
};

const savedLanguage = getInitialLanguage();
const savedDirection = getInitialDirection();

// Set initial document direction (client-side only)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.documentElement.dir = savedDirection;
  document.documentElement.lang = savedLanguage;
}

// Initialize i18n synchronously for SSR
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: enTranslations,
        },
        ar: {
          translation: arTranslations,
        },
      },
      lng: savedLanguage,
      fallbackLng: 'en',
      debug: false,
      // Use dot notation for nested keys
      keySeparator: '.',
      nsSeparator: false,
      interpolation: {
        escapeValue: false,
        format: (value, format, lng) => {
          if (format === 'uppercase') return value.toUpperCase();
          return value;
        },
      },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged',
        bindI18nStore: '',
        transEmptyNodeValue: '',
        transSupportBasicHtmlNodes: true,
        transWrapTextNodes: '',
      },
      // Initialize immediately for SSR compatibility
      initImmediate: true,
    });
}

// Update language on client-side after hydration
if (typeof window !== 'undefined') {
  // Wait for hydration to complete
  window.addEventListener('DOMContentLoaded', () => {
    const clientLanguage = getClientLanguage();
    const clientDirection = getClientDirection();
    
    // Only change if different from initial
    if (clientLanguage !== savedLanguage && i18n.isInitialized) {
      i18n.changeLanguage(clientLanguage);
    }
    
    // Update document direction if different
    if (clientDirection !== savedDirection) {
      document.documentElement.dir = clientDirection;
    }
  });
}

export default i18n;
