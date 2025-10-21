/**
 * Medical Design Template
 * 
 * Professional healthcare design system with medical-focused components,
 * blue/cyan color scheme, and specialized features for doctors and pharmacies
 */

// Import default pages for plans not yet customized
import { 
  ServiceBookingPage,
  ProductListingPage
} from '@/designs/default'

// Medical-specific page overrides
export { default as FreeListingPage } from './pages/FreeListingView'
export { default as VerifiedListingPage } from './pages/VerifiedListingView'

// Re-export default pages (will customize these next)
export { 
  ServiceBookingPage,
  ProductListingPage
}

// Medical-specific card components - fully customized!
export { default as ServiceCard } from './cards/ServiceCard'
export { default as ProductCard } from './cards/ProductCard'
export { default as ShopCard } from './cards/ShopCard'

// Medical-specific reusable components
export { default as SpecialtyBadge } from './components/SpecialtyBadge'
export { default as DoctorProfileCard } from './components/DoctorProfileCard'

// Export theme for use in custom components
export { medicalTheme } from './theme'

// Design metadata and configuration
export const designMetadata = {
  name: 'Medical & Healthcare',
  slug: 'medical',
  description: 'Professional healthcare design with doctor profiles, specialty badges, and medical-focused UI',
  version: '1.0.0',
  author: 'Daleel Balady',
  
  // Color scheme
  colors: {
    primary: '#3b82f6',    // blue-500 - Professional medical blue
    primaryDark: '#2563eb', // blue-600
    secondary: '#06b6d4',   // cyan-500 - Fresh healthcare cyan
    secondaryDark: '#0891b2', // cyan-600
    accent: '#ef4444',      // red-500 - Medical cross red
    success: '#10b981',     // green-500 - Available/healthy
    warning: '#f59e0b',     // amber-500 - Caution
    danger: '#ef4444',      // red-500 - Emergency
  },
  
  // Design features
  features: [
    'Doctor profile cards with verified badges',
    'Specialty recognition and color coding',
    'Consultation type indicators (clinic/home/video)',
    'Experience level badges',
    'Prescription requirement indicators',
    'Stock status for medications',
    'Pharmacy/clinic cards with opening hours',
    'Medical blue gradient backgrounds',
    'Professional healthcare imagery',
  ],
  
  // Categories this design works best with
  suitableFor: [
    'Medical Services',
    'Healthcare Providers',
    'Doctors',
    'Pharmacies',
    'Clinics',
    'Hospitals',
    'Medical Laboratories',
    'Dental Clinics',
  ],
}

