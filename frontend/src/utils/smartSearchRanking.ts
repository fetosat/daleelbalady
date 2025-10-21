import { Location } from 'react-leaflet'

// Types for search results and ranking
export interface SearchResult {
  id: string
  name: string
  type: 'service' | 'shop' | 'user' | 'product'
  description?: string
  category?: string
  subcategory?: string
  tags?: string[]
  
  // Quality metrics
  rating?: number
  reviewCount?: number
  verified?: boolean
  isPopular?: boolean
  isTrending?: boolean
  isRecommended?: boolean
  
  // Location data
  latitude?: number
  longitude?: number
  city?: string
  area?: string
  address?: string
  
  // Business metrics
  viewCount?: number
  bookingCount?: number
  clickCount?: number
  responseRate?: number
  responseTime?: number // in minutes
  
  // Temporal data
  createdAt?: string
  updatedAt?: string
  lastActiveAt?: string
  isOpen?: boolean
  businessHours?: BusinessHours[]
  
  // Additional data
  price?: number
  hasPhotos?: boolean
  hasWebsite?: boolean
  hasPhone?: boolean
  completenessScore?: number // Profile completeness 0-1
  
  // Search specific
  relevanceScore?: number
  distanceKm?: number
  matchedTerms?: string[]
  searchRank?: number
}

export interface BusinessHours {
  day: number // 0-6 (Sunday-Saturday)
  open: string // "09:00"
  close: string // "18:00"
  closed?: boolean
}

export interface SearchQuery {
  query?: string
  type?: 'all' | 'service' | 'shop' | 'user' | 'product'
  category?: string
  location?: {
    latitude?: number
    longitude?: number
    city?: string
    area?: string
    radius?: number // km
  }
  filters?: {
    verified?: boolean
    hasReviews?: boolean
    minRating?: number
    priceRange?: [number, number]
    openNow?: boolean
    hasOffers?: boolean
  }
  sortBy?: 'relevance' | 'rating' | 'distance' | 'popularity' | 'newest' | 'price'
  userLocation?: { latitude: number; longitude: number }
  userPreferences?: {
    preferredCategories?: string[]
    previousSearches?: string[]
    favoriteLocations?: string[]
  }
}

// Weights for different ranking factors
const RANKING_WEIGHTS = {
  // Text relevance
  exactMatch: 100,
  nameMatch: 80,
  categoryMatch: 60,
  descriptionMatch: 40,
  tagMatch: 30,
  
  // Quality factors
  rating: 70,
  reviewCount: 50,
  verified: 60,
  completeness: 40,
  
  // Popularity factors
  isRecommended: 80,
  isPopular: 60,
  isTrending: 50,
  viewCount: 30,
  bookingCount: 40,
  
  // Business factors
  responseRate: 50,
  responseTime: 30,
  isOpen: 40,
  
  // Recency
  recentlyUpdated: 20,
  recentlyActive: 30,
  
  // Location proximity
  distanceNear: 60,
  distanceModerate: 30,
  distanceFar: 10
}

/**
 * Calculate text relevance score based on query matching
 */
export function calculateTextRelevance(result: SearchResult, query: string): number {
  if (!query || query.trim() === '') return 0
  
  const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0)
  let relevanceScore = 0
  const matchedTerms: string[] = []
  
  const name = result.name?.toLowerCase() || ''
  const description = result.description?.toLowerCase() || ''
  const category = result.category?.toLowerCase() || ''
  const tags = result.tags?.map(tag => tag.toLowerCase()) || []
  
  for (const term of searchTerms) {
    // Exact name match
    if (name === term) {
      relevanceScore += RANKING_WEIGHTS.exactMatch
      matchedTerms.push(term)
      continue
    }
    
    // Name contains term
    if (name.includes(term)) {
      relevanceScore += RANKING_WEIGHTS.nameMatch
      matchedTerms.push(term)
      continue
    }
    
    // Category match
    if (category.includes(term)) {
      relevanceScore += RANKING_WEIGHTS.categoryMatch
      matchedTerms.push(term)
      continue
    }
    
    // Description match
    if (description.includes(term)) {
      relevanceScore += RANKING_WEIGHTS.descriptionMatch
      matchedTerms.push(term)
      continue
    }
    
    // Tag match
    if (tags.some(tag => tag.includes(term))) {
      relevanceScore += RANKING_WEIGHTS.tagMatch
      matchedTerms.push(term)
    }
  }
  
  // Bonus for matching multiple terms
  const matchRatio = matchedTerms.length / searchTerms.length
  relevanceScore *= (0.5 + 0.5 * matchRatio)
  
  result.matchedTerms = matchedTerms
  return relevanceScore
}

/**
 * Calculate quality score based on ratings, reviews, and verification
 */
export function calculateQualityScore(result: SearchResult): number {
  let qualityScore = 0
  
  // Rating score (0-5 rating mapped to 0-70 points)
  if (result.rating) {
    qualityScore += (result.rating / 5) * RANKING_WEIGHTS.rating
  }
  
  // Review count score (logarithmic scale)
  if (result.reviewCount) {
    const reviewScore = Math.min(Math.log10(result.reviewCount + 1) * 20, RANKING_WEIGHTS.reviewCount)
    qualityScore += reviewScore
  }
  
  // Verification bonus
  if (result.verified) {
    qualityScore += RANKING_WEIGHTS.verified
  }
  
  // Profile completeness bonus
  if (result.completenessScore) {
    qualityScore += result.completenessScore * RANKING_WEIGHTS.completeness
  }
  
  return qualityScore
}

/**
 * Calculate popularity score based on user engagement
 */
export function calculatePopularityScore(result: SearchResult): number {
  let popularityScore = 0
  
  // Special designations
  if (result.isRecommended) {
    popularityScore += RANKING_WEIGHTS.isRecommended
  }
  
  if (result.isPopular) {
    popularityScore += RANKING_WEIGHTS.isPopular
  }
  
  if (result.isTrending) {
    popularityScore += RANKING_WEIGHTS.isTrending
  }
  
  // Engagement metrics (logarithmic scale)
  if (result.viewCount) {
    const viewScore = Math.min(Math.log10(result.viewCount + 1) * 10, RANKING_WEIGHTS.viewCount)
    popularityScore += viewScore
  }
  
  if (result.bookingCount) {
    const bookingScore = Math.min(Math.log10(result.bookingCount + 1) * 15, RANKING_WEIGHTS.bookingCount)
    popularityScore += bookingScore
  }
  
  return popularityScore
}

/**
 * Calculate business responsiveness score
 */
export function calculateBusinessScore(result: SearchResult): number {
  let businessScore = 0
  
  // Response rate (0-100% mapped to points)
  if (result.responseRate !== undefined) {
    businessScore += (result.responseRate / 100) * RANKING_WEIGHTS.responseRate
  }
  
  // Response time (faster = better, max 24 hours)
  if (result.responseTime !== undefined) {
    const responseScore = Math.max(0, 1 - (result.responseTime / (24 * 60))) * RANKING_WEIGHTS.responseTime
    businessScore += responseScore
  }
  
  // Currently open bonus
  if (result.isOpen) {
    businessScore += RANKING_WEIGHTS.isOpen
  }
  
  return businessScore
}

/**
 * Calculate recency score based on last updates
 */
export function calculateRecencyScore(result: SearchResult): number {
  let recencyScore = 0
  const now = new Date()
  
  // Recently updated (within 30 days)
  if (result.updatedAt) {
    const updatedDate = new Date(result.updatedAt)
    const daysSinceUpdate = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate <= 30) {
      const updateScore = Math.max(0, 1 - (daysSinceUpdate / 30)) * RANKING_WEIGHTS.recentlyUpdated
      recencyScore += updateScore
    }
  }
  
  // Recently active (within 7 days)
  if (result.lastActiveAt) {
    const activeDate = new Date(result.lastActiveAt)
    const daysSinceActive = (now.getTime() - activeDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceActive <= 7) {
      const activeScore = Math.max(0, 1 - (daysSinceActive / 7)) * RANKING_WEIGHTS.recentlyActive
      recencyScore += activeScore
    }
  }
  
  return recencyScore
}

/**
 * Calculate distance score based on proximity to user
 */
export function calculateDistanceScore(result: SearchResult, userLocation?: { latitude: number; longitude: number }): number {
  if (!userLocation || !result.latitude || !result.longitude) {
    return 0
  }
  
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    result.latitude,
    result.longitude
  )
  
  result.distanceKm = distance
  
  // Distance-based scoring
  if (distance <= 1) {
    return RANKING_WEIGHTS.distanceNear
  } else if (distance <= 5) {
    return RANKING_WEIGHTS.distanceModerate
  } else if (distance <= 20) {
    return RANKING_WEIGHTS.distanceFar
  } else {
    return 0
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Apply user preference bonuses
 */
export function calculatePreferenceScore(result: SearchResult, userPreferences?: SearchQuery['userPreferences']): number {
  if (!userPreferences) return 0
  
  let preferenceScore = 0
  
  // Preferred categories bonus
  if (userPreferences.preferredCategories && result.category) {
    if (userPreferences.preferredCategories.includes(result.category)) {
      preferenceScore += 30
    }
  }
  
  // Previous searches bonus
  if (userPreferences.previousSearches && result.name) {
    const hasSearchedSimilar = userPreferences.previousSearches.some(search => 
      result.name.toLowerCase().includes(search.toLowerCase()) ||
      search.toLowerCase().includes(result.name.toLowerCase())
    )
    if (hasSearchedSimilar) {
      preferenceScore += 20
    }
  }
  
  return preferenceScore
}

/**
 * Main ranking function that combines all scores
 */
export function calculateOverallRank(result: SearchResult, searchQuery: SearchQuery): number {
  const textRelevance = searchQuery.query ? calculateTextRelevance(result, searchQuery.query) : 0
  const qualityScore = calculateQualityScore(result)
  const popularityScore = calculatePopularityScore(result)
  const businessScore = calculateBusinessScore(result)
  const recencyScore = calculateRecencyScore(result)
  const distanceScore = calculateDistanceScore(result, searchQuery.userLocation)
  const preferenceScore = calculatePreferenceScore(result, searchQuery.userPreferences)
  
  // Combine all scores with different emphasis based on search type
  let totalScore = textRelevance + qualityScore + popularityScore + businessScore + recencyScore + distanceScore + preferenceScore
  
  // Apply sort-specific bonuses
  switch (searchQuery.sortBy) {
    case 'rating':
      totalScore += qualityScore * 0.5 // 50% bonus for quality
      break
    case 'distance':
      totalScore += distanceScore * 1.0 // 100% bonus for distance
      break
    case 'popularity':
      totalScore += popularityScore * 0.5 // 50% bonus for popularity
      break
    case 'newest':
      totalScore += recencyScore * 1.0 // 100% bonus for recency
      break
    case 'relevance':
    default:
      totalScore += textRelevance * 0.3 // 30% bonus for text relevance
  }
  
  result.relevanceScore = Math.round(totalScore)
  return result.relevanceScore
}

/**
 * Smart search and ranking function
 */
export function rankSearchResults(results: SearchResult[], searchQuery: SearchQuery): SearchResult[] {
  // Calculate rank for each result
  const rankedResults = results.map(result => {
    calculateOverallRank(result, searchQuery)
    return result
  })
  
  // Sort by relevance score (highest first)
  rankedResults.sort((a, b) => {
    const scoreA = a.relevanceScore || 0
    const scoreB = b.relevanceScore || 0
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }
    
    // Secondary sort by rating if scores are equal
    const ratingA = a.rating || 0
    const ratingB = b.rating || 0
    
    if (ratingB !== ratingA) {
      return ratingB - ratingA
    }
    
    // Tertiary sort by review count
    const reviewsA = a.reviewCount || 0
    const reviewsB = b.reviewCount || 0
    
    return reviewsB - reviewsA
  })
  
  // Assign search ranks
  rankedResults.forEach((result, index) => {
    result.searchRank = index + 1
  })
  
  return rankedResults
}

/**
 * Filter results based on search criteria
 */
export function filterSearchResults(results: SearchResult[], searchQuery: SearchQuery): SearchResult[] {
  return results.filter(result => {
    // Type filter
    if (searchQuery.type && searchQuery.type !== 'all' && result.type !== searchQuery.type) {
      return false
    }
    
    // Category filter
    if (searchQuery.category && result.category !== searchQuery.category) {
      return false
    }
    
    // Location filter
    if (searchQuery.location?.radius && searchQuery.userLocation && result.latitude && result.longitude) {
      const distance = calculateDistance(
        searchQuery.userLocation.latitude,
        searchQuery.userLocation.longitude,
        result.latitude,
        result.longitude
      )
      if (distance > searchQuery.location.radius) {
        return false
      }
    }
    
    // Quality filters
    if (searchQuery.filters) {
      if (searchQuery.filters.verified && !result.verified) {
        return false
      }
      
      if (searchQuery.filters.hasReviews && (!result.reviewCount || result.reviewCount === 0)) {
        return false
      }
      
      if (searchQuery.filters.minRating && (!result.rating || result.rating < searchQuery.filters.minRating)) {
        return false
      }
      
      if (searchQuery.filters.priceRange && result.price) {
        const [minPrice, maxPrice] = searchQuery.filters.priceRange
        if (result.price < minPrice || result.price > maxPrice) {
          return false
        }
      }
      
      if (searchQuery.filters.openNow && !result.isOpen) {
        return false
      }
    }
    
    return true
  })
}

/**
 * Complete search function that filters and ranks results
 */
export function performSmartSearch(results: SearchResult[], searchQuery: SearchQuery): SearchResult[] {
  // First filter results
  const filteredResults = filterSearchResults(results, searchQuery)
  
  // Then rank filtered results
  const rankedResults = rankSearchResults(filteredResults, searchQuery)
  
  return rankedResults
}

/**
 * Search analytics helper to track search performance
 */
export function generateSearchAnalytics(results: SearchResult[], searchQuery: SearchQuery) {
  const analytics = {
    query: searchQuery.query || '',
    totalResults: results.length,
    avgRelevanceScore: results.reduce((sum, result) => sum + (result.relevanceScore || 0), 0) / results.length,
    topCategories: {} as Record<string, number>,
    qualityDistribution: {
      verified: results.filter(r => r.verified).length,
      withRating: results.filter(r => r.rating && r.rating > 0).length,
      highRated: results.filter(r => r.rating && r.rating >= 4).length
    },
    locationDistribution: {} as Record<string, number>,
    searchTime: Date.now()
  }
  
  // Count categories
  results.forEach(result => {
    if (result.category) {
      analytics.topCategories[result.category] = (analytics.topCategories[result.category] || 0) + 1
    }
  })
  
  // Count cities
  results.forEach(result => {
    if (result.city) {
      analytics.locationDistribution[result.city] = (analytics.locationDistribution[result.city] || 0) + 1
    }
  })
  
  return analytics
}
