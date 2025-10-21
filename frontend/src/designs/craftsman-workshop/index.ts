/**
 * Craftsman Workshop Design Export
 * 
 * Rustic and practical design with warm earth tones and hands-on aesthetic
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
  name: 'Craftsman Workshop',
  slug: 'craftsman-workshop',
  description: 'Rustic and practical design with warm earth tones and hands-on aesthetic',
  version: '1.0.0',
  author: 'Daleel Balady'
}
