/**
 * Corporate Professional Design Export
 * 
 * Modern corporate design with sleek layouts and professional blue palette
 */

// Import colors
export { colors, default as designColors } from './colors'

// Page Layouts
export { default as FreeListingPage } from './pages/FreeListingView'
export { default as VerifiedListingPage } from './pages/VerifiedListingView'
export { default as ServiceBookingPage } from './pages/ServiceBookingView'
export { default as ProductListingPage } from './pages/ProductListingView'

// Card Components
export { default as ServiceCard } from './cards/ServiceCard'
export { default as ProductCard } from './cards/ProductCard'
export { default as ShopCard } from './cards/ShopCard'

// Design metadata
export const designMetadata = {
  name: 'Corporate Professional',
  slug: 'corporate-professional',
  description: 'Modern corporate design with sleek layouts and professional blue palette',
  version: '1.0.0',
  author: 'Daleel Balady'
}
