/**
 * Medical Design Theme
 * Professional healthcare colors, spacing, and constants
 */

export const medicalTheme = {
  colors: {
    // Primary medical blues
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main blue
      600: '#2563eb',  // Dark blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Medical cyan/teal accents
    accent: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',  // Main cyan
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    
    // Health status colors
    status: {
      available: '#10b981',    // Green
      busy: '#f59e0b',         // Amber
      unavailable: '#ef4444',  // Red
      emergency: '#dc2626',    // Dark red
    },
    
    // Backgrounds
    background: {
      main: '#f8fafc',
      card: '#ffffff',
      hover: '#f1f5f9',
      section: '#eff6ff',
    },
    
    // Text colors
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  
  // Medical specialties with icons and colors
  specialties: {
    cardiology: { icon: '❤️', color: '#ef4444', label: 'Cardiology' },
    neurology: { icon: '🧠', color: '#8b5cf6', label: 'Neurology' },
    pediatrics: { icon: '👶', color: '#f59e0b', label: 'Pediatrics' },
    orthopedics: { icon: '🦴', color: '#0891b2', label: 'Orthopedics' },
    dermatology: { icon: '✨', color: '#ec4899', label: 'Dermatology' },
    general: { icon: '🏥', color: '#3b82f6', label: 'General Practice' },
    dentistry: { icon: '🦷', color: '#06b6d4', label: 'Dentistry' },
    ophthalmology: { icon: '👁️', color: '#6366f1', label: 'Ophthalmology' },
    gynecology: { icon: '🌸', color: '#ec4899', label: 'Gynecology' },
    psychiatry: { icon: '💭', color: '#8b5cf6', label: 'Psychiatry' },
  },
  
  // Consultation types
  consultationTypes: {
    clinic: { icon: '🏥', label: 'Clinic Visit', color: '#3b82f6' },
    home: { icon: '🏠', label: 'Home Visit', color: '#10b981' },
    video: { icon: '📹', label: 'Video Call', color: '#8b5cf6' },
    emergency: { icon: '🚨', label: 'Emergency', color: '#ef4444' },
  },
  
  // Experience levels
  experienceLevels: {
    junior: { label: 'Junior Doctor', years: '0-3 years', badge: '👨‍⚕️' },
    mid: { label: 'Specialist', years: '3-7 years', badge: '⭐' },
    senior: { label: 'Consultant', years: '7-15 years', badge: '🏆' },
    expert: { label: 'Professor', years: '15+ years', badge: '👨‍🏫' },
  },
}

export type MedicalTheme = typeof medicalTheme

