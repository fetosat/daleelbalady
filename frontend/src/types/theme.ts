// Theme configuration types for dynamic card styling

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  backgroundDark: string;
  text: string;
  textLight: string;
  // Dark mode variants
  primaryDark?: string;
  backgroundLight?: string; // Light background for dark mode
  textDark?: string; // Light text for dark mode
  textLightDark?: string; // Secondary light text for dark mode
}

export interface ThemeGradient {
  from: string;
  to: string;
  direction: string;
}

export interface ThemeBorder {
  color: string;
  width: string;
  radius: string;
}

export interface ThemeShadow {
  default: string;
  hover: string;
}

export interface ThemeSpecialEffects {
  pulse?: boolean;
  glow?: string;
  shimmer?: boolean;
  sparkle?: boolean;
  metallic?: boolean;
  industrial?: boolean;
  speed?: boolean;
  energy?: boolean;
  cozy?: boolean;
  digital?: boolean;
  appetizing?: boolean;
  theatrical?: boolean;
}

export interface Theme {
  emoji: string;
  colors: ThemeColors;
  gradient: ThemeGradient;
  border: ThemeBorder;
  shadow: ThemeShadow;
  iconBackground: string;
  iconColor: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  specialEffects?: ThemeSpecialEffects;
  extends?: string; // For theme inheritance
}

export interface ThemeMappings {
  description: string;
  rules: string[];
  exact: Record<string, string>;
  contains: Record<string, string>;
}

export interface DesignThemesConfig {
  $schema: {
    description: string;
    version: string;
  };
  defaults: Theme;
  themes: Record<string, Partial<Theme>>;
  mappings: ThemeMappings;
}

// Helper type for resolved themes (after inheritance and defaults are applied)
export type ResolvedTheme = Theme;
