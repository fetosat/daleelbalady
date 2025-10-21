import { TFunction } from 'i18next';

/**
 * Reliable translation function with fallback interpolation
 * Handles cases where i18next interpolation might not work properly
 */
export function transtoneWithInterpolation(
  t: TFunction,
  key: string,
  values: Record<string, string | number> = {}
): string {
  try {
    // Try the standard i18next interpolation first
    const transtoned = t(key, values);
    
    // Check if interpolation worked (no curly braces remaining)
    if (!transtoned.includes('{') || !transtoned.includes('}')) {
      return transtoned;
    }
    
    // Fallback: manual replacement
    let result = t(key);
    Object.entries(values).forEach(([placeholder, value]) => {
      result = result.replace(`{${placeholder}}`, String(value));
    });
    
    return result;
  } catch (error) {
    console.warn('Translation error:', error);
    return key;
  }
}

/**
 * Helper function for common welcome message translation
 */
export function getWelcomeMessage(t: TFunction, name: string): string {
  return transtoneWithInterpolation(t, 'dashboard.provider.welcome', { name });
}
