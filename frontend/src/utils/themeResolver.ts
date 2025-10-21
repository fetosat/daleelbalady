import designThemesData from '@/themes/design-themes.json';
import type { DesignThemesConfig, Theme, ResolvedTheme } from '@/types/theme';
import { addDarkModeToThemes, generateDarkModeThemeColors } from './darkModeThemeGenerator';

// Type the imported JSON data and enhance with auto-generated dark mode colors
const rawDesignThemes = designThemesData as any;
const designThemes: DesignThemesConfig = {
  ...rawDesignThemes,
  defaults: {
    ...rawDesignThemes.defaults,
    colors: {
      ...rawDesignThemes.defaults.colors,
      ...generateDarkModeThemeColors(rawDesignThemes.defaults.colors as any),
    },
  },
  themes: addDarkModeToThemes(rawDesignThemes.themes) as any,
};

/**
 * Deep merge utility for combining theme objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target } as any;
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge((result[key] || {}) as any, source[key] as any);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result as T;
}

/**
 * Resolve theme inheritance by following the "extends" chain
 */
function resolveInheritance(themeKey: string, visited = new Set<string>()): Partial<Theme> {
  // Prevent infinite loops
  if (visited.has(themeKey)) {
    console.warn(`Circular theme inheritance detected for: ${themeKey}`);
    return {};
  }
  
  const theme = designThemes.themes[themeKey];
  if (!theme) {
    return {};
  }
  
  visited.add(themeKey);
  
  // If theme extends another, resolve parent first
  if (theme.extends) {
    const parentTheme = resolveInheritance(theme.extends, visited);
    return deepMerge(parentTheme, theme);
  }
  
  return theme;
}

/**
 * Find theme key by design slug using mapping rules
 */
function findThemeKey(designSlug: string): string | null {
  const slug = designSlug.toLowerCase();
  
  // Try exact match first
  if (designThemes.mappings.exact[slug]) {
    return designThemes.mappings.exact[slug];
  }
  
  // Try contains match
  for (const [keyword, themeKey] of Object.entries(designThemes.mappings.contains)) {
    if (slug.includes(keyword.toLowerCase())) {
      return themeKey;
    }
  }
  
  return null;
}

/**
 * Resolve theme by design slug with full inheritance and fallback support
 */
export function resolveTheme(designSlug?: string): ResolvedTheme {
  // If no slug provided, return defaults
  if (!designSlug) {
    return designThemes.defaults;
  }
  
  // Find matching theme key
  const themeKey = findThemeKey(designSlug);
  
  if (!themeKey || !designThemes.themes[themeKey]) {
    // No matching theme found, return defaults
    return designThemes.defaults;
  }
  
  // Resolve theme with inheritance
  const resolvedTheme = resolveInheritance(themeKey);
  
  // Merge with defaults to ensure all required properties are present
  return deepMerge(designThemes.defaults, resolvedTheme);
}

/**
 * Get theme-specific CSS classes for Tailwind with dark mode support
 */
export function getThemeClasses(theme: ResolvedTheme) {
  const classes = {
    // Icon styling with dark mode variants
    iconWrapper: `${theme.iconBackground} dark:${theme.iconBackground.replace('bg-', 'bg-').replace('-100', '-800')} ${theme.iconColor} dark:${theme.iconColor.replace('text-', 'text-').replace('-600', '-300')}`,
    
    // Card container with border and shadow
    cardContainer: `hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 dark:border-opacity-20`,
    
    // Badge variant
    badge: theme.badgeVariant,
    
    // Special effects classes
    specialEffects: [] as string[],
    
    // Dark mode specific classes
    darkModeClasses: {
      cardBackground: 'dark:bg-opacity-10',
      textPrimary: 'dark:text-opacity-90',
      textSecondary: 'dark:text-opacity-70',
      borderColor: 'dark:border-opacity-20',
    },
  };
  
  // Add special effects classes
  if (theme.specialEffects) {
    if (theme.specialEffects.pulse) {
      classes.specialEffects.push('animate-pulse');
    }
    if (theme.specialEffects.glow) {
      classes.specialEffects.push(theme.specialEffects.glow);
      // Add dark mode glow variant
      classes.specialEffects.push('dark:shadow-lg');
    }
    if (theme.specialEffects.shimmer) {
      classes.specialEffects.push('bg-gradient-to-r animate-shimmer');
    }
  }
  
  return classes;
}

/**
 * Check if dark mode is currently active
 */
function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark') || 
         window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get color value based on current theme mode
 */
function getThemeColor(theme: ResolvedTheme, lightColor: string, darkColor?: string): string {
  if (!isDarkMode()) return lightColor;
  return darkColor || lightColor;
}

/**
 * Generate inline styles for theme colors and effects with dark mode support
 */
export function getThemeStyles(theme: ResolvedTheme) {
  const darkMode = isDarkMode();
  
  return {
    // Card background with subtle theme color
    cardBackground: {
      backgroundColor: getThemeColor(
        theme, 
        theme.colors.background, 
        theme.colors.backgroundLight || theme.colors.backgroundDark
      ),
      borderColor: theme.border.color,
      borderWidth: theme.border.width,
      borderRadius: theme.border.radius,
    },
    
    // Gradient background for special cards
    gradientBackground: {
      background: `linear-gradient(${theme.gradient.direction}, ${theme.gradient.from}, ${theme.gradient.to})`,
    },
    
    // Custom shadow
    cardShadow: {
      boxShadow: theme.shadow.default,
    },
    
    // Hover shadow
    cardShadowHover: {
      boxShadow: theme.shadow.hover,
    },
    
    // Text colors with dark mode support
    primaryText: {
      color: getThemeColor(
        theme,
        theme.colors.text,
        theme.colors.textDark
      ),
    },
    
    secondaryText: {
      color: getThemeColor(
        theme,
        theme.colors.textLight,
        theme.colors.textLightDark
      ),
    },
    
    // Icon and primary colors
    primaryColor: {
      color: getThemeColor(
        theme,
        theme.colors.primary,
        theme.colors.primaryDark
      ),
    },
  };
}

/**
 * Utility to get emoji for a design slug
 */
export function getThemeEmoji(designSlug?: string): string {
  const theme = resolveTheme(designSlug);
  return theme.emoji;
}

/**
 * Debug utility to inspect theme resolution
 */
export function debugTheme(designSlug: string) {
  console.group(`🎨 Theme Debug: "${designSlug}"`);
  console.log('Theme Key:', findThemeKey(designSlug));
  console.log('Resolved Theme:', resolveTheme(designSlug));
  console.groupEnd();
}

// Export the themes config for direct access if needed
export { designThemes };
