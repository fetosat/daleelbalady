/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Enhanced breakpoints for better mobile control
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom mobile-first breakpoints
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        // Orientation-based breakpoints
        'landscape': {'raw': '(orientation: landscape)'},
        'portrait': {'raw': '(orientation: portrait)'},
      },
      
      // Mobile-optimized spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Touch-friendly sizing
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '52px',
      },
      
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '52px',
      },
      
      // Enhanced shadows for depth perception on mobile
      boxShadow: {
        'mobile': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mobile-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'mobile-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'mobile-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-lg': '0 0 30px rgba(16, 185, 129, 0.4)',
      },
      
      // Mobile-optimized border radius
      borderRadius: {
        'mobile': '12px',
        'mobile-lg': '16px',
        'mobile-xl': '20px',
        'mobile-2xl': '24px',
      },
      
      // Enhanced color palette for mobile
      colors: {
        // Primary greens (maintaining brand consistency)
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        
        // Mobile-specific stones
        'mobile-stone': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Success states
        'success': {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        
        // Warning states
        'warning': {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        
        // Error states
        'error': {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        
        // Info states
        'info': {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      
      // Mobile typography
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1.5' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.5' }],
        'base-mobile': ['1rem', { lineHeight: '1.6' }],
        'lg-mobile': ['1.125rem', { lineHeight: '1.6' }],
        'xl-mobile': ['1.25rem', { lineHeight: '1.6' }],
        '2xl-mobile': ['1.5rem', { lineHeight: '1.5' }],
        '3xl-mobile': ['1.875rem', { lineHeight: '1.4' }],
        '4xl-mobile': ['2.25rem', { lineHeight: '1.3' }],
      },
      
      // Animation improvements for mobile
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'transtoneX(100%)', opacity: '0' },
          '100%': { transform: 'transtoneX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'transtoneX(-100%)', opacity: '0' },
          '100%': { transform: 'transtoneX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'transtoneY(100%)', opacity: '0' },
          '100%': { transform: 'transtoneY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'transtoneY(-100%)', opacity: '0' },
          '100%': { transform: 'transtoneY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'transtone3d(0,0,0)' },
          '40%, 43%': { transform: 'transtone3d(0, -8px, 0)' },
          '70%': { transform: 'transtone3d(0, -4px, 0)' },
          '90%': { transform: 'transtone3d(0, -2px, 0)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      
      // Mobile-specific transitions
      transitionDuration: {
        '350': '350ms',
        '400': '400ms',
      },
      
      // Grid template columns for mobile layouts
      gridTemplateColumns: {
        'mobile': 'repeat(1, minmax(0, 1fr))',
        'mobile-2': 'repeat(2, minmax(0, 1fr))',
        'mobile-fit': 'repeat(auto-fit, minmax(300px, 1fr))',
        'mobile-fill': 'repeat(auto-fill, minmax(280px, 1fr))',
      },
      
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  plugins: [
    // Custom utilities for mobile
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Touch manipulation utilities
        '.touch-manipulation': {
          'touch-action': 'manipulation',
          '-webkit-tap-highlight-color': 'transparent',
        },
        
        // Safe area utilities
        '.pt-safe': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.pl-safe': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.pr-safe': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        
        // Scrollbar utilities
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        
        // Mobile card utilities
        '.mobile-card': {
          '@apply rounded-mobile-lg shadow-mobile bg-white border border-stone-100 transition-all duration-300': {},
        },
        
        '.mobile-card-hover': {
          '@apply hover:shadow-mobile-lg hover:-transtone-y-1': {},
        },
        
        // Focus ring for mobile
        '.mobile-focus': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.green.500')}`,
            'outline-offset': '2px',
            'border-radius': theme('borderRadius.lg'),
          },
        },
        
        // Text utilities for mobile
        '.text-mobile-readable': {
          'font-size': '16px',
          'line-height': '1.6',
          '-webkit-text-size-adjust': '100%',
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'stonescale',
        },
        
        // Button utilities
        '.btn-mobile': {
          '@apply min-h-touch px-6 py-3 rounded-mobile text-base font-medium transition-all duration-200 touch-manipulation': {},
        },
        
        '.btn-mobile-lg': {
          '@apply min-h-touch-lg px-8 py-4 rounded-mobile-lg text-lg font-semibold': {},
        },
        
        // Grid utilities
        '.grid-mobile': {
          '@apply grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': {},
        },
        
        '.grid-mobile-fill': {
          'display': 'grid',
          'gap': theme('spacing.3'),
          'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
        },
      };
      
      addUtilities(newUtilities);
    },
    
    // Custom components plugin
    function({ addComponents, theme }) {
      const components = {
        '.container-mobile': {
          'max-width': '100%',
          'padding-left': theme('spacing.4'),
          'padding-right': theme('spacing.4'),
          '@screen sm': {
            'padding-left': theme('spacing.6'),
            'padding-right': theme('spacing.6'),
          },
          '@screen lg': {
            'max-width': theme('screens.lg'),
            'margin-left': 'auto',
            'margin-right': 'auto',
            'padding-left': theme('spacing.8'),
            'padding-right': theme('spacing.8'),
          },
        },
      };
      
      addComponents(components);
    },
  ],
};
