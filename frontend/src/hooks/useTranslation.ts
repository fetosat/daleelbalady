import { useState, useEffect } from 'react';
import { translations, Locale, Translations } from '@/lib/translations/admin';

export function useTranslation(defaultLocale: Locale = 'ar') {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('admin-locale') as Locale;
    if (savedLocale && (savedLocale === 'ar' || savedLocale === 'en')) {
      setLocale(savedLocale);
    }
  }, []);

  // Save locale to localStorage when it changes
  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('admin-locale', newLocale);
  };

  // Get translation by key path (e.g., 'products.title')
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return {
    locale,
    setLocale: changeLocale,
    t,
    translations: translations[locale],
    isRTL: locale === 'ar',
  };
}

