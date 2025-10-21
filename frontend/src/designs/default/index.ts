/**
 * Default Design Export
 * 
 * This is the default design template for Daleel Balady
 * Contains all standard listing pages and card components
 */

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
  name: 'Default',
  slug: 'default',
  description: 'Clean and professional default design',
  version: '1.0.0',
  author: 'Daleel Balady'
}

