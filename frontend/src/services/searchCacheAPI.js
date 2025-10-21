// services/searchCacheAPI.js
const API_BASE_URL = 'https://api.daleelbalady.com/api';

class SearchCacheAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/search-cache`;
  }

  // Get search cache by ID or slug
  async getSearchCache(identifier, incrementView = true) {
    try {
      const params = new URLSearchParams({
        incrementView: incrementView.toString()
      });

      const response = await fetch(`${this.baseURL}/${identifier}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch search cache');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching search cache:', error);
      throw error;
    }
  }

  // Create a new search cache
  async createSearchCache({ query, description, slug, serviceIds, metadata, expiresAt }) {
    try {
      const cacheData = {
        query,
        slug,
        serviceIds
      };

      if (description) cacheData.description = description;
      if (metadata) cacheData.metadata = metadata;
      if (expiresAt) cacheData.expiresAt = expiresAt;

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cacheData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create search cache');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating search cache:', error);
      throw error;
    }
  }

  // List search caches with pagination and filtering
  async listSearchCaches({ page = 1, limit = 20, query, includeExpired = false } = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeExpired: includeExpired.toString()
      });

      if (query) params.append('query', query);

      const response = await fetch(`${this.baseURL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to list search caches');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing search caches:', error);
      throw error;
    }
  }

  // Update search cache
  async updateSearchCache(identifier, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/${identifier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update search cache');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating search cache:', error);
      throw error;
    }
  }

  // Delete search cache
  async deleteSearchCache(identifier) {
    try {
      const response = await fetch(`${this.baseURL}/${identifier}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete search cache');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting search cache:', error);
      throw error;
    }
  }

  // Clean up expired caches
  async cleanupExpiredCaches() {
    try {
      const response = await fetch(`${this.baseURL}/cleanup/expired`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cleanup expired caches');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cleaning up expired caches:', error);
      throw error;
    }
  }

  // Generate shareable URL for search cache
  generateShareUrl(cacheId, baseUrl = window.location.origin) {
    return `${baseUrl}/search?id=${cacheId}`;
  }

  // Extract cache ID from URL
  extractCacheIdFromUrl(url = window.location.href) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id');
    } catch (error) {
      console.error('Error extracting cache ID from URL:', error);
      return null;
    }
  }

  // Check if current page is a cached search
  isCurrentPageCachedSearch() {
    return Boolean(this.extractCacheIdFromUrl());
  }

  // Transform search cache data to match SearchResults component format
  transformCacheToSearchResults(searchCache) {
    console.log('🔄 SearchCacheAPI: Transforming cache to search results');
    console.log('🔍 Cache structure:', {
      hasResults: !!searchCache?.results,
      hasServices: !!searchCache?.services,
      hasEnhancedResults: !!searchCache?.enhanced_results, 
      hasMetadataEnhanced: !!searchCache?.metadata?.enhanced_results,
      cacheKeys: searchCache ? Object.keys(searchCache) : []
    });
    
    // Priority 1: Check for processed_results (AI-processed with filter tags)
    if (searchCache?.metadata?.processed_results) {
      console.log('🔄 Transforming metadata.processed_results (AI-processed cache structure)');
      const processedResults = searchCache.metadata.processed_results;
      
      console.log('📊 Processed results found:', {
        type: typeof processedResults,
        isArray: Array.isArray(processedResults),
        count: processedResults?.length || 0,
        sampleItem: processedResults?.[0] || null
      });
      
      return this.transformProcessedResults(processedResults, searchCache);
    }
    
    // Priority 2: Check for metadata.enhanced_results (fallback)
    if (searchCache?.metadata?.enhanced_results) {
      console.log('🔄 Transforming metadata.enhanced_results (enhanced cache structure)');
      const results = searchCache.metadata.enhanced_results;
      
      console.log('📊 Enhanced results found:', {
        type: typeof results,
        hasUsers: !!(results?.users),
        usersCount: results?.users?.length || 0,
        hasServices: !!(results?.services),
        servicesCount: results?.services?.length || 0,
        hasShops: !!(results?.shops),
        shopsCount: results?.shops?.length || 0,
        hasProducts: !!(results?.products),
        productsCount: results?.products?.length || 0
      });
      
      return this.transformEnhancedResults(results, searchCache);
    }
    
    // Priority 2: Check for services array (legacy structure)
    if (searchCache?.services && Array.isArray(searchCache.services)) {
      console.log('🔄 Transforming services array (legacy cache structure)');
      return this.transformServicesArray(searchCache.services);
    }
    
    // Priority 3: Other enhanced results locations
    if (searchCache?.enhanced_results || searchCache?.results) {
      console.log('🔄 Transforming other enhanced results formats');
      const results = searchCache.enhanced_results || searchCache.results;
      return this.transformEnhancedResults(results, searchCache);
    }
    
    console.warn('⚠️ No compatible data structure found in cache');
    return [];
  }
  
  // Helper method to transform enhanced results (multi-entity format)
  transformEnhancedResults(results, searchCache) {
    if (!results) {
      console.warn('⚠️ No enhanced results provided');
      return [];
    }
      
    
    // Flatten all entity types into a single array with proper typing
    console.log('🔄 Flattening enhanced results:', {
      servicesInput: results.services?.length || 0,
      usersInput: results.users?.length || 0,
      shopsInput: results.shops?.length || 0,
      productsInput: results.products?.length || 0
    });
    
    const allResults = [
      ...(results.services || []).map(item => ({ ...item, entityType: 'service' })),
      ...(results.users || []).map(item => ({ ...item, entityType: 'user' })),
      ...(results.shops || []).map(item => ({ ...item, entityType: 'shop' })),
      ...(results.products || []).map(item => ({ ...item, entityType: 'product' }))
    ];
    
    console.log('✨ Flattened enhanced results:', {
      totalItems: allResults.length,
      sampleItem: allResults[0] || null,
      itemTypes: allResults.map(r => r.entityType)
    });
    
    // Check if we have processed_results with metadata
    let processedResults = null;
    if (searchCache.processedResults) {
      processedResults = searchCache.processedResults;
      console.log('✅ Found processedResults with metadata:', processedResults.length);
    } else if (searchCache.metadata?.processed_results) {
      processedResults = searchCache.metadata.processed_results;
      console.log('✅ Found metadata.processed_results:', processedResults.length);
    }
    
    return allResults.map((item, index) => {
      // Calculate average rating
      const reviews = Array.isArray(item.reviews) ? item.reviews : [];
      const avgRating = reviews.length > 0
        ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
        : item.avgRating || 0;

      // Find corresponding processed result with metadata
      let metadata = item.metadata || {};
      if (processedResults) {
        const processedItem = processedResults.find(pr => 
          pr.id === item.id || 
          pr.name === item.name || 
          pr.name === this.getEntityName(item)
        );
        if (processedItem?.metadata) {
          metadata = { ...metadata, ...processedItem.metadata };
          console.log('📋 Found metadata for item:', item.name, metadata);
        }
      }

      return {
        id: item.id,
        entityType: item.entityType,
        name: this.getEntityName(item),
        translation: item.translation,
        shop: item.shop,
        city: item.city || item.shop?.city,
        phone: item.phone || item.shop?.phone || '',
        address: item.shop?.city || item.city || '',
        reviews: item.reviews,
        reviewsCount: reviews.length || item.reviewsCount || 0,
        avgRating,
        locationLat: item.locationLat,
        locationLon: item.locationLon,
        design: item.design,
        price: item.price,
        currency: item.currency,
        stock: item.stock, // for products
        sku: item.sku, // for products  
        bio: item.bio, // for users
        role: item.role, // for users
        isVerified: item.isVerified,
        verifiedBadge: item.verifiedBadge,
        isRecommended: item.isRecommended || item.relevanceScore >= 1.0 || avgRating >= 4.5,
        position: item.position || index,
        relevanceScore: item.relevanceScore,
        metadata: metadata, // Preserve AI metadata with category names
        duration: item.duration, // for services
        category: item.category, // for products
        services: item.services, // for users
        _count: item._count // for inventory counts
      };
    });
  }
  
  // Helper method to transform services array (legacy format)
  transformServicesArray(services) {
    console.log('🔄 Transforming legacy services array:', services.length);
    
    return services.map((serviceWrapper) => {
      // Handle the service wrapper structure from your example
      const service = serviceWrapper.service || serviceWrapper;
      
      // Calculate average rating
      const reviews = Array.isArray(service.reviews) ? service.reviews : [];
      const avgRating = reviews.length > 0
        ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
        : serviceWrapper.avgRating || 0;

      return {
        id: service.id,
        entityType: 'service',
        name: this.getEntityName({ ...service, entityType: 'service' }),
        translation: service.translation,
        shop: service.shop,
        city: service.city,
        phone: service.phone || service.shop?.phone || '',
        address: service.shop?.city || service.city || '',
        reviews: service.reviews,
        reviewsCount: reviews.length || serviceWrapper.reviewsCount || 0,
        avgRating,
        locationLat: service.locationLat,
        locationLon: service.locationLon,
        design: service.design,
        price: service.price,
        currency: service.currency,
        isRecommended: serviceWrapper.isRecommended || serviceWrapper.relevanceScore >= 1.0 || avgRating >= 4.5,
        position: serviceWrapper.position,
        relevanceScore: serviceWrapper.relevanceScore
      };
    });
  }
  
  // Helper method to transform AI-processed results (with filterTags and priority)
  transformProcessedResults(processedResults, searchCache) {
    console.log('🔄 Transforming AI-processed results:', processedResults.length);
    
    // Create a lookup map of all original data by ID for efficient joining
    const originalDataMap = new Map();
    
    // Add enhanced_results to the map
    if (searchCache.metadata?.enhanced_results) {
      const enhanced = searchCache.metadata.enhanced_results;
      ['users', 'services', 'shops', 'products'].forEach(entityType => {
        if (enhanced[entityType]) {
          enhanced[entityType].forEach(item => {
            originalDataMap.set(item.id, { ...item, sourceType: 'enhanced_results', entityType: entityType.slice(0, -1) });
          });
        }
      });
    }
    
    // Add services array to the map
    if (searchCache.services) {
      searchCache.services.forEach(serviceWrapper => {
        const service = serviceWrapper.service || serviceWrapper;
        if (service.id) {
          originalDataMap.set(service.id, { 
            ...service, 
            sourceType: 'services_array', 
            entityType: 'service',
            // Include wrapper-level metadata
            relevanceScore: serviceWrapper.relevanceScore,
            position: serviceWrapper.position,
            isRecommended: serviceWrapper.isRecommended
          });
        }
      });
    }
    
    console.log('🗺️ Original data map created:', {
      totalItems: originalDataMap.size,
      sampleIds: Array.from(originalDataMap.keys()).slice(0, 3)
    });
    
    // Sort by priority (lower number = higher priority)
    const sortedResults = [...processedResults].sort((a, b) => (a.priority || 99) - (b.priority || 99));
    
    return sortedResults.map((processedItem, index) => {
      // Find the original data by ID
      const originalData = originalDataMap.get(processedItem.id);
      
      if (!originalData) {
        console.warn(`⚠️ No original data found for processed item:`, processedItem.id, processedItem.name);
      }
      
      // Use the entity type from processed results or derive from original data
      let entityType = processedItem.type;
      if (originalData?.entityType) {
        entityType = originalData.entityType;
      }
      
      // Build the result object combining processed metadata with original data
      return {
        id: processedItem.id,
        entityType: entityType,
        
        // Use original name and translation if available, otherwise use processed name
        name: originalData ? this.getEntityName({ ...originalData, entityType }) : processedItem.name,
        translation: originalData?.translation || {
          name_en: processedItem.name,
          name_ar: processedItem.name,
          description_en: processedItem.description || '',
          description_ar: processedItem.description || ''
        },
        
        // Contact information - prefer original data, fallback to processed
        phone: originalData?.phone || originalData?.shop?.phone || processedItem.contact?.phone || '',
        city: originalData?.city || originalData?.shop?.city || processedItem.location?.city || '',
        address: originalData?.shop?.city || originalData?.city || processedItem.location?.city || processedItem.location?.address || '',
        
        // Shop data from original
        shop: originalData?.shop || null,
        
        // Reviews and ratings - prefer original data, fallback to processed
        reviews: originalData?.reviews || [],
        reviewsCount: (originalData?.reviews?.length || 0) > 0 ? originalData.reviews.length : (processedItem.rating?.count || 0),
        avgRating: originalData?.reviews?.length > 0 ? this.calculateAverageRating(originalData.reviews) : (processedItem.rating?.average || 0),
        
        // Location coordinates from original data
        locationLat: originalData?.locationLat || null,
        locationLon: originalData?.locationLon || null,
        
        // Design and other metadata from original
        design: originalData?.design || { slug: 'medical' },
        price: originalData?.price || null,
        currency: originalData?.currency || null,
        
        // Entity-specific fields from original data
        stock: originalData?.stock,
        sku: originalData?.sku,
        bio: originalData?.bio,
        role: originalData?.role,
        duration: originalData?.duration,
        category: originalData?.category,
        services: originalData?.services,
        _count: originalData?._count,
        
        // Verification status from original data
        isVerified: originalData?.isVerified || false,
        verifiedBadge: originalData?.verifiedBadge || null,
        
        // Recommendation status from processed data (AI determines this)
        isRecommended: originalData?.isRecommended || processedItem.priority <= 5 || processedItem.rating?.average >= 4.5,
        
        // AI processing metadata from processed results
        position: index,
        priority: processedItem.priority,
        filterTags: processedItem.filterTags || [],
        description: processedItem.description || originalData?.shop?.description || '',
        relevanceScore: originalData?.relevanceScore || (10 - (processedItem.priority || 5)) / 10,
        
        // Combined metadata
        metadata: {
          ...originalData?.metadata,
          priority: processedItem.priority,
          filterTags: processedItem.filterTags,
          aiProcessed: true,
          sourceType: originalData?.sourceType || 'processed_only'
        }
      };
    });
  }
  
  // Helper method to calculate average rating
  calculateAverageRating(reviews) {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }
  
  // Helper method to get entity name based on type
  getEntityName(item) {
    console.log('🏷️ Getting entity name:', {
      entityType: item.entityType,
      name: item.name,
      translationNameAr: item.translation?.name_ar,
      translationNameEn: item.translation?.name_en
    });
    
    switch (item.entityType) {
      case 'service':
        return item.translation?.name_en || item.translation?.name_ar || item.name || 'Unknown Service';
      case 'user':
        return item.name || 'Unknown User';
      case 'shop':
        return item.name || 'Unknown Shop';
      case 'product':
        return item.name || 'Unknown Product';
      default:
        return item.name || 'Unknown';
    }
  }
}

// Create and export a singleton instance
const searchCacheAPI = new SearchCacheAPI();
export default searchCacheAPI;
