import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface UseDocumentTitleOptions {
  suffix?: string;
  template?: string;
  fallback?: string;
}

/**
 * Custom hook to manage dynamic document titles with internationalization support
 * @param title - The main title or translation key
 * @param options - Configuration options
 */
export function useDocumentTitle(
  title?: string | null,
  options: UseDocumentTitleOptions = {}
) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const {
    suffix = isRTL ? 'دليلك بلدي' : 'DaleelBalady',
    template = isRTL ? '{title} | {suffix}' : '{title} | {suffix}',
    fallback = isRTL ? 'دليلك بلدي - دليلك المحلي بالذكاء الاصطناعي' : 'DaleelBalady - Your Local AI Guide'
  } = options;

  useEffect(() => {
    let finalTitle: string;

    if (!title) {
      finalTitle = fallback;
    } else {
      // Check if title is a translation key (contains dots or starts with specific prefixes)
      const transtonedTitle = title.includes('.') || 
                             title.startsWith('nav.') || 
                             title.startsWith('dashboard.') ||
                             title.startsWith('pages.') ||
                             title.startsWith('titles.')
                             ? t(title)
                             : title;
      
      finalTitle = template
        .replace('{title}', transtonedTitle)
        .replace('{suffix}', suffix);
    }

    document.title = finalTitle;

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = fallback;
    };
  }, [title, suffix, template, fallback, t, i18n.language]);
}

/**
 * Utility function to create dynamic titles for user profiles
 */
export function useUserProfileTitle(userName?: string | null) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const title = userName 
    ? (isRTL ? `ملف ${userName} الشخصي` : `${userName}'s Profile`)
    : (isRTL ? 'الملف الشخصي' : 'User Profile');
    
  useDocumentTitle(title);
}

/**
 * Utility function to create dynamic titles for service pages
 */
export function useServiceTitle(serviceName?: string | null) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const title = serviceName 
    ? (isRTL ? `خدمة ${serviceName}` : `${serviceName} Service`)
    : (isRTL ? 'الخدمة' : 'Service');
    
  useDocumentTitle(title);
}

/**
 * Utility function to create dynamic titles for product pages
 */
export function useProductTitle(productName?: string | null) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const title = productName 
    ? (isRTL ? `منتج ${productName}` : `${productName} Product`)
    : (isRTL ? 'المنتج' : 'Product');
    
  useDocumentTitle(title);
}

/**
 * Utility function to create dynamic titles for shop pages
 */
export function useShopTitle(shopName?: string | null) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const title = shopName 
    ? (isRTL ? `متجر ${shopName}` : `${shopName} Shop`)
    : (isRTL ? 'المتجر' : 'Shop');
    
  useDocumentTitle(title);
}

/**
 * Utility function to create dynamic titles for search pages
 */
export function useSearchTitle(query?: string | null, type?: string) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  let title: string;
  
  if (query) {
    if (type) {
      title = isRTL 
        ? `البحث في ${t(`search.types.${type}`)} - ${query}`
        : `Search ${t(`search.types.${type}`)} - ${query}`;
    } else {
      title = isRTL 
        ? `البحث - ${query}`
        : `Search - ${query}`;
    }
  } else {
    title = isRTL ? 'البحث' : 'Search';
  }
    
  useDocumentTitle(title);
}

export default useDocumentTitle;
