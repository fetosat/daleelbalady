/**
 * Design Loader Utility
 * 
 * Dynamically loads design components based on design slug
 * Provides fallback to default design if specific design not found
 */

import { ComponentType } from 'react'

export interface DesignComponents {
  // Page layouts
  FreeListingPage?: ComponentType<any>
  VerifiedListingPage?: ComponentType<any>
  ServiceBookingPage?: ComponentType<any>
  ProductListingPage?: ComponentType<any>
  
  // Card components
  ServiceCard?: ComponentType<any>
  ProductCard?: ComponentType<any>
  ShopCard?: ComponentType<any>
  
  // Layout components
  ListingLayout?: ComponentType<any>
  HeroSection?: ComponentType<any>
  ContactSection?: ComponentType<any>
}

/**
 * Load design components for a given slug
 * Falls back to default design if not found
 */
export async function loadDesign(slug: string | null | undefined): Promise<DesignComponents> {
  const designSlug = slug || 'default'
  
  console.log(`🎨 loadDesign: Loading design "${designSlug}"`)
  
  try {
    // Try to load the specific design
    const design = await import(`@/designs/${designSlug}`)
    console.log(`✅ loadDesign: Successfully imported design "${designSlug}"`, Object.keys(design))
    const result = design.default || design
    console.log(`📦 loadDesign: Returning design components:`, Object.keys(result))
    return result
  } catch (error) {
    console.warn(`⚠️ loadDesign: Design "${designSlug}" not found, falling back to default`, error)
    
    try {
      // Fall back to default design
      const defaultDesign = await import(`@/designs/default`)
      console.log(`✅ loadDesign: Loaded fallback default design`, Object.keys(defaultDesign))
      return defaultDesign.default || defaultDesign
    } catch (fallbackError) {
      console.error('❌ loadDesign: Failed to load default design:', fallbackError)
      throw new Error('No design templates available')
    }
  }
}

/**
 * Load a specific card component
 */
export async function loadCard(
  type: 'service' | 'product' | 'shop',
  designSlug: string | null | undefined
): Promise<ComponentType<any>> {
  const design = await loadDesign(designSlug)
  
  switch (type) {
    case 'service':
      return design.ServiceCard || (() => null)
    case 'product':
      return design.ProductCard || (() => null)
    case 'shop':
      return design.ShopCard || (() => null)
    default:
      throw new Error(`Unknown card type: ${type}`)
  }
}

/**
 * Load a page layout component
 */
export async function loadPageLayout(
  planType: 'FREE' | 'VERIFICATION' | 'SERVICES' | 'PRODUCTS',
  designSlug: string | null | undefined
): Promise<ComponentType<any>> {
  const design = await loadDesign(designSlug)
  
  switch (planType) {
    case 'FREE':
      return design.FreeListingPage || (() => null)
    case 'VERIFICATION':
      return design.VerifiedListingPage || (() => null)
    case 'SERVICES':
      return design.ServiceBookingPage || (() => null)
    case 'PRODUCTS':
      return design.ProductListingPage || (() => null)
    default:
      throw new Error(`Unknown plan type: ${planType}`)
  }
}

/**
 * Check if a design exists
 */
export async function designExists(slug: string): Promise<boolean> {
  try {
    await import(`@/designs/${slug}`)
    return true
  } catch {
    return false
  }
}

/**
 * Get list of available designs
 * (This would need to be generated at build time or maintained manually)
 */
export const availableDesigns = [
  'default',
  'medical',
  'restaurant',
  'retail',
  'professional'
] as const

export type DesignSlug = typeof availableDesigns[number]

