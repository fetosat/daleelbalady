import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import axios from 'axios';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema for find page queries
const findPageQuerySchema = z.object({
  query: z.string().optional(),
  type: z.union([
    z.literal('all'),
    z.literal('shops'),
    z.literal('services'),
    z.literal('users'),
    z.literal('products')
  ]).default('all'),
  category: z.string().uuid().optional(),
  subcategory: z.string().uuid().optional(),
  city: z.string().optional(),
  lat: z.string().transform(val => parseFloat(val)).optional(),
  lon: z.string().transform(val => parseFloat(val)).optional(),
  radius: z.string().transform(val => parseFloat(val)).default('5'),
  verified: z.union([z.literal('true'), z.literal('false')]).optional(),
  hasReviews: z.union([z.literal('true'), z.literal('false')]).optional(),
  minRating: z.string().transform(val => parseFloat(val)).optional(),
  maxRating: z.string().transform(val => parseFloat(val)).optional(),
  minPrice: z.string().transform(val => parseFloat(val)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).optional(),
  sortBy: z.enum(['relevance', 'rating', 'price', 'distance', 'name', 'newest']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().transform(val => parseInt(val, 10)).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).default(20)
});

// Helper function to build Prisma text search conditions
function buildTextSearchConditions(query, type) {
  if (!query || query.trim() === '') return {};
  
  const searchText = query.trim();
  const conditions = [];
  
  // Common text search conditions for different entity types
  switch (type) {
    case 'shops':
      conditions.push(
        { name: { contains: searchText, mode: 'insensitive' } },
        { description: { contains: searchText, mode: 'insensitive' } },
        { address: { contains: searchText, mode: 'insensitive' } }
      );
      break;
    case 'services':
      conditions.push(
        { name: { contains: searchText, mode: 'insensitive' } },
        { description: { contains: searchText, mode: 'insensitive' } }
      );
      break;
    case 'users':
      conditions.push(
        { firstName: { contains: searchText, mode: 'insensitive' } },
        { lastName: { contains: searchText, mode: 'insensitive' } },
        { displayName: { contains: searchText, mode: 'insensitive' } }
      );
      break;
    case 'products':
      conditions.push(
        { name: { contains: searchText, mode: 'insensitive' } },
        { description: { contains: searchText, mode: 'insensitive' } }
      );
      break;
  }
  
  return conditions.length > 0 ? { OR: conditions } : {};
}

// Helper function to build base filters
function buildBaseFilters(params, entityType) {
  const filters = {};
  
  // Category filtering
  if (params.category) {
    if (entityType === 'services' || entityType === 'products') {
      filters.categoryId = params.category;
    } else if (entityType === 'shops') {
      filters.categories = { some: { categoryId: params.category } };
    }
  }
  
  if (params.subcategory) {
    if (entityType === 'services' || entityType === 'products') {
      filters.subcategoryId = params.subcategory;
    } else if (entityType === 'shops') {
      filters.subcategories = { some: { subcategoryId: params.subcategory } };
    }
  }
  
  // City filtering
  if (params.city) {
    filters.city = { contains: params.city, mode: 'insensitive' };
  }
  
  // Verification status
  if (params.verified !== undefined) {
    filters.verified = params.verified === 'true';
  }
  
  // Rating filtering (for entities with reviews)
  if (params.minRating !== undefined || params.maxRating !== undefined) {
    const ratingFilter = {};
    if (params.minRating !== undefined) ratingFilter.gte = params.minRating;
    if (params.maxRating !== undefined) ratingFilter.lte = params.maxRating;
    
    if (entityType === 'shops' || entityType === 'services') {
      filters.averageRating = ratingFilter;
    }
  }
  
  // Price filtering
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const priceFilter = {};
    if (params.minPrice !== undefined) priceFilter.gte = params.minPrice;
    if (params.maxPrice !== undefined) priceFilter.lte = params.maxPrice;
    
    if (entityType === 'services') {
      filters.price = priceFilter;
    } else if (entityType === 'products') {
      filters.price = priceFilter;
    }
  }
  
  // Has reviews filtering
  if (params.hasReviews === 'true') {
    if (entityType === 'shops' || entityType === 'services') {
      filters.reviews = { some: {} };
    }
  }
  
  return filters;
}

// Helper function to get sorting configuration
function getSortConfig(sortBy, sortOrder) {
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  
  switch (sortBy) {
    case 'rating':
      return { averageRating: order };
    case 'price':
      return { price: order };
    case 'name':
      return { name: order };
    case 'newest':
      return { createdAt: order };
    default: // 'relevance' or 'distance' - handled separately
      return { createdAt: 'desc' };
  }
}

// Helper function to query geo-filtered IDs from Qdrant
async function getGeoFilteredIds(params, enabledTypes) {
  try {
    console.log('🌍 Calling Qdrant for geo-only search...');
    
    const entities = {};
    enabledTypes.forEach(type => {
      entities[type] = { enabled: true, limit: 1000 }; // Get more IDs for filtering
    });
    
    const response = await axios.post('http://localhost:8001/geo_multi', {
      entities,
      location: {
        lat: params.lat,
        lon: params.lon,
        radius: params.radius
      }
    }, {
      timeout: 10000
    });
    
    console.log(`🌍 Qdrant geo search returned:`, 
      Object.entries(response.data.results).map(([type, results]) => 
        `${type}: ${results.length} items`
      ).join(', ')
    );
    
    return response.data.results;
  } catch (error) {
    console.error('❌ Qdrant geo search failed:', error.message);
    return {}; // Fall back to no geo filtering
  }
}

// Query function for individual entity types
async function queryEntityType(entityType, params, geoFilteredIds = null) {
  const filters = { ...buildBaseFilters(params, entityType) };
  const textConditions = buildTextSearchConditions(params.query, entityType);
  
  if (Object.keys(textConditions).length > 0) {
    filters.AND = [textConditions];
  }
  
  // Apply geo-filtered IDs if available
  if (geoFilteredIds && geoFilteredIds[entityType] && geoFilteredIds[entityType].length > 0) {
    const ids = geoFilteredIds[entityType].map(item => item.id).filter(Boolean);
    if (ids.length > 0) {
      filters.id = { in: ids };
    } else {
      return []; // No matching geo results
    }
  }
  
  const sortConfig = getSortConfig(params.sortBy, params.sortOrder);
  const skip = (params.page - 1) * params.limit;
  
  let include = {};
  switch (entityType) {
    case 'shops':
      include = {
        categories: { include: { category: true } },
        subcategories: { include: { subcategory: true } },
        reviews: { select: { rating: true } },
        services: { select: { id: true } },
        products: { select: { id: true } }
      };
      break;
    case 'services':
      include = {
        shop: { select: { id: true, name: true, verified: true } },
        category: true,
        subcategory: true,
        reviews: { select: { rating: true } }
      };
      break;
    case 'users':
      include = {
        reviews: { select: { rating: true } },
        bookings: { select: { id: true } }
      };
      break;
    case 'products':
      include = {
        shop: { select: { id: true, name: true, verified: true } },
        category: true,
        subcategory: true,
        reviews: { select: { rating: true } }
      };
      break;
  }
  
  try {
    const results = await prisma[entityType].findMany({
      where: filters,
      include,
      orderBy: sortConfig,
      skip,
      take: params.limit
    });
    
    // Calculate additional stats for each result
    const enhancedResults = results.map(item => {
      const enhanced = { ...item, type: entityType };
      
      if (item.reviews && Array.isArray(item.reviews)) {
        const ratings = item.reviews.map(r => r.rating).filter(r => r != null);
        enhanced.totalReviews = ratings.length;
        enhanced.averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
      }
      
      if (entityType === 'shops') {
        enhanced.totalServices = item.services?.length || 0;
        enhanced.totalProducts = item.products?.length || 0;
      }
      
      if (entityType === 'users') {
        enhanced.totalBookings = item.bookings?.length || 0;
      }
      
      return enhanced;
    });
    
    console.log(`📊 ${entityType}: Found ${enhancedResults.length} results`);
    return enhancedResults;
  } catch (error) {
    console.error(`❌ Error querying ${entityType}:`, error.message);
    return [];
  }
}

// Main find page route
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Find page search request:', req.query);
    
    const params = findPageQuerySchema.parse(req.query);
    
    // Determine which entity types to search
    const entityTypes = params.type === 'all' 
      ? ['shops', 'services', 'users', 'products']
      : [params.type];
    
    let geoFilteredIds = null;
    
    // Check if location filtering is needed
    if (params.lat !== undefined && params.lon !== undefined) {
      geoFilteredIds = await getGeoFilteredIds(params, entityTypes);
    }
    
    // Query each entity type
    const results = {};
    const searchPromises = entityTypes.map(async entityType => {
      const entityResults = await queryEntityType(entityType, params, geoFilteredIds);
      results[entityType] = entityResults;
    });
    
    await Promise.all(searchPromises);
    
    // Merge results if type is 'all'
    let finalResults;
    if (params.type === 'all') {
      finalResults = [];
      entityTypes.forEach(entityType => {
        finalResults.push(...results[entityType]);
      });
      
      // Sort merged results if needed
      if (params.sortBy === 'relevance' || params.sortBy === 'newest') {
        finalResults.sort((a, b) => {
          const aDate = new Date(a.createdAt || a.updatedAt);
          const bDate = new Date(b.createdAt || b.updatedAt);
          return params.sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        });
      } else if (params.sortBy === 'rating') {
        finalResults.sort((a, b) => {
          const aRating = a.averageRating || 0;
          const bRating = b.averageRating || 0;
          return params.sortOrder === 'asc' ? aRating - bRating : bRating - aRating;
        });
      }
      
      // Apply pagination to merged results
      const skip = (params.page - 1) * params.limit;
      finalResults = finalResults.slice(skip, skip + params.limit);
    } else {
      finalResults = results[params.type];
    }
    
    // Calculate totals
    const totals = {};
    let totalCount = 0;
    entityTypes.forEach(entityType => {
      const count = results[entityType]?.length || 0;
      totals[entityType] = count;
      totalCount += count;
    });
    
    console.log('✅ Find page search completed:', {
      totals,
      finalResultsCount: finalResults.length,
      page: params.page,
      limit: params.limit
    });
    
    res.json({
      success: true,
      results: finalResults,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / params.limit)
      },
      totals,
      searchType: 'prisma-only', // Indicate this is not using vector search
      hasLocationFilter: geoFilteredIds !== null,
      query: params.query
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Find page validation error:', error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      });
    }
    
    console.error('❌ Find page search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
