import { Theme, ThemeColors } from '@/types/theme';

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Generate dark mode variant of a color
 */
export function generateDarkModeColor(lightColor: string, type: 'primary' | 'background' | 'text'): string {
  const rgb = hexToRgb(lightColor);
  if (!rgb) return lightColor;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  switch (type) {
    case 'primary': {
      // For primary colors, slightly desaturate and lighten
      const rgb = hslToRgb(
        hsl.h, 
        Math.max(hsl.s - 10, 0), 
        Math.min(hsl.l + 15, 85)
      );
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    }
      
    case 'background':
      // For backgrounds, create dark variants
      if (hsl.l > 50) {
        // Light background -> dark background
        const bgRgb = hslToRgb(
          hsl.h,
          Math.max(hsl.s - 20, 10),
          Math.max(hsl.l - 70, 10)
        );
        return rgbToHex(bgRgb.r, bgRgb.g, bgRgb.b);
      }
      return lightColor;
      
    case 'text': {
      // For text, invert lightness
      const textRgb = hslToRgb(
        hsl.h,
        Math.max(hsl.s - 10, 20),
        Math.min(100 - hsl.l + 20, 85)
      );
      return rgbToHex(textRgb.r, textRgb.g, textRgb.b);
    }
      
    default:
      return lightColor;
  }
}

/**
 * Generate complete dark mode colors for a theme
 */
export function generateDarkModeThemeColors(lightColors: ThemeColors): Partial<ThemeColors> {
  return {
    primaryDark: generateDarkModeColor(lightColors.primary, 'primary'),
    backgroundLight: generateDarkModeColor(lightColors.background, 'background'),
    textDark: generateDarkModeColor(lightColors.text, 'text'),
    textLightDark: generateDarkModeColor(lightColors.textLight, 'text'),
  };
}

/**
 * Create a theme with auto-generated dark mode colors
 */
export function createDarkModeTheme(lightTheme: Theme): Theme {
  const darkModeColors = generateDarkModeThemeColors(lightTheme.colors);
  
  return {
    ...lightTheme,
    colors: {
      ...lightTheme.colors,
      ...darkModeColors,
    },
  };
}

/**
 * Batch process themes to add dark mode support
 */
export function addDarkModeToThemes(themes: Record<string, Partial<Theme>>): Record<string, Partial<Theme>> {
  const processedThemes: Record<string, Partial<Theme>> = {};
  
  Object.entries(themes).forEach(([key, theme]) => {
    if (theme.colors) {
      const darkModeColors = generateDarkModeThemeColors(theme.colors as ThemeColors);
      processedThemes[key] = {
        ...theme,
        colors: {
          ...theme.colors,
          ...darkModeColors,
        },
      };
    } else {
      processedThemes[key] = theme;
    }
  });
  
  return processedThemes;
}
