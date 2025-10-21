// routes/advancedSearch.js
import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { z } from "zod";
import fetch from "node-fetch";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema for advanced search
const AdvancedSearchSchema = z.object({
  q: z.string().max(500).optional(), // General search query - can be empty for browsing
  type: z.enum(['all', 'shops', 'services', 'users', 'products']).default('all'),
  location: z.union([
    // Legacy city-based location
    z.object({
      city: z.string().optional(),
      lat: z.number().optional(),
      lon: z.number().optional(),
      radius: z.number().min(0.1).max(50).optional(), // radius in km (min 100m)
    }),
    // New coordinate-based location
    z.object({
      type: z.literal('coordinates'),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      radius: z.number().min(0.1).max(50), // radius in km (min 100m)
    }),
    // New text-based location search
    z.object({
      type: z.literal('query'),
      query: z.string().min(1).max(200),
    }),
  ]).optional(),
  category: z.object({
    categoryId: z.string().uuid().optional(),
    subCategoryId: z.string().uuid().optional(),
  }).optional(),
  sortBy: z.enum(['reviews', 'recommendation', 'location', 'customers', 'rating', 'recent']).default('recommendation'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(48), // Updated max limit to 100, default to 48
  filters: z.object({
    verified: z.boolean().optional(),
    hasReviews: z.boolean().optional(),
    openNow: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    minRating: z.number().min(0).max(5).optional(),
    minReviews: z.number().min(0).optional(),
    priceRange: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    }).optional(),
  }).optional(),
});

// Get categories with subcategories for tree view
router.get("/categories", async (req, res) => {
  console.log('📁 Categories endpoint called');
  try {
    console.log('📁 Fetching categories from database...');
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' }
        },
        design: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add service/product counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const serviceCount = await prisma.service.count({
          where: {
            category: {
              some: { id: category.id }
            },
            deletedAt: null
          }
        });

        const subCategoriesWithCounts = await Promise.all(
          category.subCategories.map(async (subCategory) => {
            const subServiceCount = await prisma.service.count({
              where: {
                subCategoryId: subCategory.id,
                deletedAt: null
              }
            });

            return {
              ...subCategory,
              serviceCount: subServiceCount
            };
          })
        );

        return {
          ...category,
          serviceCount,
          subCategories: subCategoriesWithCounts
        };
      })
    );

    console.log('📁 Categories processed successfully:', categoriesWithCounts.length, 'categories');
    res.json({
      success: true,
      categories: categoriesWithCounts
    });

  } catch (error) {
    console.error('📁 Error fetching categories:', error);
    console.error('📁 Error stack:', error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper: Qdrant API base
const SEARCH_API_URL = process.env.SEARCH_API_URL || 'http://localhost:8000/search';
const SEARCH_API_BASE = SEARCH_API_URL.replace(/\/?search$/, "");

// Cap how many rows we fetch when a post-processing sort is required
// to avoid scanning the entire tables (can be overridden via env)
const ADV_SCAN_LIMIT = parseInt(process.env.ADV_SEARCH_SCAN_LIMIT || '2000', 10);
console.log('🚀 Advanced search scan limit set to:', ADV_SCAN_LIMIT);

// Candidate set limits for ID preselection (to avoid heavy relational ORs)
const SHOP_ID_CANDIDATE_LIMIT = parseInt(process.env.ADV_SHOP_ID_CANDIDATE_LIMIT || '5000', 10);
const USER_ID_CANDIDATE_LIMIT = parseInt(process.env.ADV_USER_ID_CANDIDATE_LIMIT || '5000', 10);

async function getVectorIds({ q, type, distanceFilter, tags, categoryId }) {
  if (!q) return null;
  try {
    console.log('🔍 Calling vector search API for query:', q.substring(0, 50));
    const vectorLimit = 3 * 100; // generous pool for re-ranking/filters
    const entities = {
      services: { enabled: type === 'services' || type === 'all', query: q, limit: vectorLimit },
      shops: { enabled: type === 'shops' || type === 'all', query: q, limit: vectorLimit },
      users: { enabled: type === 'users' || type === 'all', query: q, limit: vectorLimit },
      products: { enabled: type === 'products' || type === 'all', query: q, limit: vectorLimit },
    };
    const body = {
      entities,
      ...(distanceFilter && distanceFilter.latitude != null && distanceFilter.longitude != null && distanceFilter.radius != null
        ? { location: { lat: distanceFilter.latitude, lon: distanceFilter.longitude, radius: distanceFilter.radius } }
        : {}),
      ...(tags || categoryId ? { filters: {
        ...(tags ? { tags } : {}),
        ...(categoryId ? { category_ids: [categoryId] } : {})
      }} : {})
    };

    const resp = await fetch(`${SEARCH_API_BASE}/multi_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    console.log('🔍 Vector search API response status:', resp.status);
    if (!resp.ok) {
      console.warn('Vector search API returned non-OK status:', resp.status);
      return null;
    }
    const data = await resp.json();
    const results = data?.results || {};
    const vectorIds = {
      services: (results.services || []).map(r => r.id),
      shops: (results.shops || []).map(r => r.id),
      users: (results.users || []).map(r => r.id),
      products: (results.products || []).map(r => r.id),
    };
    
    console.log('🔍 Vector search returned IDs:', {
      services: vectorIds.services.length,
      shops: vectorIds.shops.length,
      users: vectorIds.users.length,
      products: vectorIds.products.length
    });
    
    return vectorIds;
  } catch (e) {
    console.error('Vector search error:', e);
    return null;
  }
}

// Utility helpers
function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function getCairoNow() {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const weekday = (map.weekday || '').toUpperCase();
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const minutesOfDay = hour * 60 + minute;
  return { weekday, minutesOfDay };
}

function isServiceOpenNow(service) {
  if (!service?.availability || !Array.isArray(service.availability)) return false;
  const now = getCairoNow();
  return service.availability.some(a => {
    try {
      if (!a) return false;
      // One-off window
      if (!a.isRecurring && a.startDate && a.endDate) {
        const nowDate = new Date();
        const start = new Date(a.startDate);
        const end = new Date(a.endDate);
        return nowDate >= start && nowDate <= end;
      }
      // Recurring schedule
      if (a.dayOfWeek && typeof a.dayOfWeek === 'string') {
        if (a.dayOfWeek.toUpperCase() !== now.weekday) return false;
      }
      const startMin = toMinutes(a.startTime);
      const endMin = toMinutes(a.endTime);
      if (startMin == null || endMin == null) return false;
      if (endMin >= startMin) {
        return now.minutesOfDay >= startMin && now.minutesOfDay <= endMin;
      } else {
        // Overnight window (e.g., 18:00 - 06:00)
        return now.minutesOfDay >= startMin || now.minutesOfDay <= endMin;
      }
    } catch { return false; }
  });
}

function reRankByVector(arr, vectorIds, idKey = 'id') {
  if (!Array.isArray(vectorIds) || vectorIds.length === 0) return arr;
  const pos = new Map();
  vectorIds.forEach((id, i) => pos.set(id, i));
  return [...arr].sort((a, b) => {
    const ai = pos.has(a[idKey]) ? pos.get(a[idKey]) : Number.MAX_SAFE_INTEGER;
    const bi = pos.has(b[idKey]) ? pos.get(b[idKey]) : Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    // tie-breakers: verified first, then recent
    const aVerified = (a.isVerified || a.owner?.isVerified || a.ownerUser?.isVerified) ? 1 : 0;
    const bVerified = (b.isVerified || b.owner?.isVerified || b.ownerUser?.isVerified) ? 1 : 0;
    if (aVerified !== bVerified) return bVerified - aVerified;
    const aCreated = new Date(a.createdAt || 0).getTime();
    const bCreated = new Date(b.createdAt || 0).getTime();
    return bCreated - aCreated;
  });
}

// Advanced search endpoint - supports both GET and POST
const handleSearch = async (req, res) => {
  console.log('🔍 Advanced search request received');
  
  // For GET requests, parse query parameters
  // For POST requests, use body
  let requestData = req.method === 'GET' ? {} : req.body;
  
  if (req.method === 'GET') {
    // Parse query parameters for GET requests
    const { q, type, sortBy, page, limit, categoryId, subCategoryId, verified, city, lat, lon, radius } = req.query;
    
    requestData = {
      q: q || undefined,
      type: type || 'all',
      sortBy: sortBy || 'recommendation',
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    };
    
    // Add location if provided
    if (city || (lat && lon)) {
      requestData.location = {};
      if (city) requestData.location.city = city;
      if (lat) requestData.location.lat = parseFloat(lat);
      if (lon) requestData.location.lon = parseFloat(lon);
      if (radius) requestData.location.radius = parseFloat(radius);
    }
    
    // Add category if provided
    if (categoryId || subCategoryId) {
      requestData.category = {};
      if (categoryId) requestData.category.categoryId = categoryId;
      if (subCategoryId) requestData.category.subCategoryId = subCategoryId;
    }
    
    // Add filters if provided
    if (verified) {
      requestData.filters = { verified: verified === 'true' };
    }
  }
  
  console.log('🔍 Request data:', JSON.stringify(requestData, null, 2));

  try {
    const validatedData = AdvancedSearchSchema.parse(requestData);
    console.log('🔍 Validation successful, parsed data:', JSON.stringify(validatedData, null, 2));
    const { q, type, location, category, sortBy, page, limit, filters } = validatedData;

    let results = {
      shops: [],
      services: [],
      users: [],
      products: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build search conditions for SHOPS ONLY (no embeddingText)
    const buildShopSearchConditions = (searchQuery) => {
      if (!searchQuery) return {}; // Return empty object for browsing mode

      return {
        OR: [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } }
          // NO embeddingText for shops - this field doesn't exist in Shop model
        ]
      };
    };

    // Haversine distance calculation (in km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Build location conditions and prepare distance filtering
    const buildLocationConditions = (locationData) => {
      if (!locationData) return { conditions: {}, distanceFilter: null };

      console.log('🗺️ Processing location data:', JSON.stringify(locationData, null, 2));
      const conditions = {};
      let distanceFilter = null;

      // Handle different location types
      if (locationData.type === 'coordinates') {
        // GPS coordinates with radius
        console.log(`🗺️ Using GPS coordinates: ${locationData.latitude}, ${locationData.longitude} within ${locationData.radius}km`);
        distanceFilter = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          radius: locationData.radius
        };
        // No Prisma conditions - we'll filter by distance post-query
      } else if (locationData.type === 'query') {
        // Text-based location search
        console.log(`🗺️ Using location query: "${locationData.query}"`);
        conditions.city = { contains: locationData.query };
      } else if (locationData.city) {
        // Legacy city-based search
        console.log(`🗺️ Using legacy city search: "${locationData.city}"`);
        conditions.city = { contains: locationData.city };
      } else if (locationData.lat && locationData.lon) {
        // Legacy lat/lon with radius
        console.log(`🗺️ Using legacy coordinates: ${locationData.lat}, ${locationData.lon} within ${locationData.radius || 10}km`);
        distanceFilter = {
          latitude: locationData.lat,
          longitude: locationData.lon,
          radius: locationData.radius || 10
        };
      }

      return { conditions, distanceFilter };
    };

    // Filter results by distance if needed (Enhanced for Egyptian cities)
    const filterByDistance = (results, distanceFilter, userCity = null) => {
      if (!distanceFilter) return results;

      // قاعدة بيانات المدن المصرية الأساسية
      const EGYPT_CITIES = {
        "كوم حمادة": { lat: 30.7392, lon: 30.7628 },
        "كوم حماده": { lat: 30.7392, lon: 30.7628 }, // تهجئة بديلة
        "دمنهور": { lat: 31.0364, lon: 30.4692 },
        "كفر الدوار": { lat: 31.1347, lon: 30.1290 },
        "الإسكندرية": { lat: 31.2001, lon: 29.9187 },
        "إسكندرية": { lat: 31.2001, lon: 29.9187 }, // بدون أل
        "القاهرة": { lat: 30.0444, lon: 31.2357 },
        "قاهرة": { lat: 30.0444, lon: 31.2357 }, // بدون أل
        "الجيزة": { lat: 30.0131, lon: 31.2089 },
        "جيزة": { lat: 30.0131, lon: 31.2089 }, // بدون أل
        "طنطا": { lat: 30.7865, lon: 31.0004 },
        "المنصورة": { lat: 31.0364, lon: 31.3785 },
        "منصورة": { lat: 31.0364, lon: 31.3785 }, // بدون أل
        "أسوان": { lat: 24.0889, lon: 32.8998 },
        "الأقصر": { lat: 25.6872, lon: 32.6396 },
        "أقصر": { lat: 25.6872, lon: 32.6396 }, // بدون أل
        "الزقازيق": { lat: 30.5877, lon: 31.5022 },
        "بنها": { lat: 30.4618, lon: 31.1837 },
        "شبين الكوم": { lat: 30.5582, lon: 31.0118 },
        "المحلة الكبرى": { lat: 30.9718, lon: 31.1669 },
        "بور سعيد": { lat: 31.2653, lon: 32.3019 },
        "السويس": { lat: 29.9668, lon: 32.5498 },
        "الإسماعيلية": { lat: 30.5965, lon: 32.2715 },
        "قنا": { lat: 26.1551, lon: 32.7160 },
        "سوهاج": { lat: 26.5569, lon: 31.6948 },
        "أسيوط": { lat: 27.1783, lon: 31.1859 },
        "المنيا": { lat: 28.1099, lon: 30.7503 },
        "بني سويف": { lat: 29.0661, lon: 31.0994 },
        "الفيوم": { lat: 29.3084, lon: 30.8428 },
        "دمياط": { lat: 31.4165, lon: 31.8133 },
        "كفر الشيخ": { lat: 31.1107, lon: 30.9388 },
        "البحيرة": { lat: 30.8481, lon: 30.3436 },
        "مطروح": { lat: 31.3529, lon: 27.2373 },
        "العريش": { lat: 31.1342, lon: 33.7973 },
        "الغردقة": { lat: 27.2574, lon: 33.8129 },
        "شرم الشيخ": { lat: 27.9158, lon: 34.3300 }
      };

      console.log(`🗺️ فلترة ${results.length} نتائج حسب المسافة`);
      console.log(`🗺️ نقطة المرجع: lat=${distanceFilter.latitude}, lon=${distanceFilter.longitude}`);
      console.log(`🗺️ المدينة: ${userCity || 'غير محددة'}`);

      let userLat = distanceFilter.latitude;
      let userLon = distanceFilter.longitude;

      // إذا لم تكن الإحداثيات متوفرة، ابحث في قاعدة المدن
      if ((!userLat || !userLon) && userCity) {
        const normalizedCity = userCity.trim().replace(/ال/g, '').trim(); // إزالة "ال" التعريف
        let cityData = EGYPT_CITIES[userCity.trim()] || EGYPT_CITIES[normalizedCity];
        
        if (cityData) {
          userLat = cityData.lat;
          userLon = cityData.lon;
          console.log(`🗺️ تم العثور على إحداثيات ${userCity}: ${userLat}, ${userLon}`);
        } else {
          console.warn(`🗺️ لم يتم العثور على إحداثيات المدينة: ${userCity}`);
        }
      }

      if (!userLat || !userLon) {
        console.warn('🗺️ تعذر تحديد موقع المستخدم - إرجاع النتائج بدون ترتيب');
        return results;
      }

      const resultsWithDistance = results.map(item => {
        let itemLat = item.locationLat;
        let itemLon = item.locationLon;
        let locationSource = 'gps';

        // إذا لم تكن إحداثيات العنصر متوفرة، ابحث بالمدينة
        if ((!itemLat || !itemLon) && item.city) {
          const normalizedItemCity = item.city.trim().replace(/ال/g, '').trim();
          let itemCityData = EGYPT_CITIES[item.city.trim()] || EGYPT_CITIES[normalizedItemCity];
          
          if (itemCityData) {
            itemLat = itemCityData.lat;
            itemLon = itemCityData.lon;
            locationSource = 'city';
            console.log(`🗺️ استخدام إحداثيات مدينة ${item.city} للعنصر ${item.name}`);
          }
        }

        if (!itemLat || !itemLon) {
          console.log(`🗺️ العنصر "${item.name}" لا يحتوي على إحداثيات صالحة`);
          return {
            ...item,
            distance: null,
            hasValidLocation: false,
            locationSource: 'none'
          };
        }

        const distance = calculateDistance(userLat, userLon, itemLat, itemLon);
        
        return {
          ...item,
          distance: Math.round(distance * 100) / 100,
          hasValidLocation: true,
          locationSource
        };
      });

      // ترتيب النتائج: الأقرب أولاً، ثم الأعلى تقييماً
      resultsWithDistance.sort((a, b) => {
        // العناصر التي لها موقع صحيح أولاً
        if (a.hasValidLocation && !b.hasValidLocation) return -1;
        if (!a.hasValidLocation && b.hasValidLocation) return 1;
        if (!a.hasValidLocation && !b.hasValidLocation) return 0;

        // ترتيب حسب المسافة
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }

        // في حالة المسافة المتساوية، الأعلى تقييماً أولاً
        const aRating = a.stats?.averageRating || 0;
        const bRating = b.stats?.averageRating || 0;
        if (aRating !== bRating) {
          return bRating - aRating;
        }

        // ثم المُتحقق منه أولاً
        const aVerified = a.isVerified || a.owner?.isVerified || false;
        const bVerified = b.isVerified || b.owner?.isVerified || false;
        if (aVerified !== bVerified) {
          return bVerified - aVerified;
        }

        return 0;
      });

      // تطبيق فلتر المسافة
      const withinRadius = resultsWithDistance.filter(item => {
        if (!item.hasValidLocation) return false;
        return item.distance <= distanceFilter.radius;
      });

      // طباعة إحصائيات مفيدة
      const totalWithLocation = resultsWithDistance.filter(item => item.hasValidLocation).length;
      const gpsBasedCount = resultsWithDistance.filter(item => item.locationSource === 'gps').length;
      const cityBasedCount = resultsWithDistance.filter(item => item.locationSource === 'city').length;

      console.log(`🗺️ إحصائيات الموقع:`);
      console.log(`   📍 إجمالي العناصر: ${results.length}`);
      console.log(`   📍 بإحداثيات صحيحة: ${totalWithLocation}`);
      console.log(`   📍 بإحداثيات GPS: ${gpsBasedCount}`);
      console.log(`   📍 بإحداثيات المدينة: ${cityBasedCount}`);
      console.log(`   📍 ضمن النطاق (${distanceFilter.radius}كم): ${withinRadius.length}`);

      if (withinRadius.length > 0) {
        console.log(`🗺️ أقرب 3 نتائج:`);
        withinRadius.slice(0, 3).forEach((item, i) => {
          console.log(`   ${i + 1}. ${item.name} - ${item.distance}كم (${item.locationSource})`);
        });
      }

      return withinRadius;
    };


    // Build category conditions
    const buildCategoryConditions = (categoryData) => {
      if (!categoryData) return {};

      const conditions = {};

      if (categoryData.categoryId) {
        conditions.category = {
          some: { id: categoryData.categoryId }
        };
      }

      if (categoryData.subCategoryId) {
        conditions.subCategoryId = categoryData.subCategoryId;
      }

      return conditions;
    };

// Get location conditions and distance filter
    const { conditions: locationConditions, distanceFilter } = buildLocationConditions(location);

    // If q is present, attempt vector search to preselect IDs
    const vectorIds = await getVectorIds({ q, type, distanceFilter, tags: filters?.tags, categoryId: category?.categoryId });

    // Search shops
    if (type === 'all' || type === 'shops') {
      console.log('🏢 Searching shops...');
      const shopConditions = {
        ...buildShopSearchConditions(q),
        ...locationConditions,
        deletedAt: null,
        ...(vectorIds?.shops?.length ? { id: { in: vectorIds.shops } } : {})
      };

      // Optimize category filter by preselecting candidate shop IDs from Services
      let preselectedShopIds = null;
      if (category?.categoryId || category?.subCategoryId) {
        console.log('⚡ Preselecting shop IDs via Services for category filter...');
        const serviceWhere = {
          deletedAt: null,
          ...(category?.categoryId ? { category: { some: { id: category.categoryId } } } : {}),
          ...(category?.subCategoryId ? { subCategoryId: category.subCategoryId } : {}),
          shopId: { not: null }
        };
        const serviceShops = await prisma.service.findMany({
          where: serviceWhere,
          select: { shopId: true },
          distinct: ['shopId'],
          take: SHOP_ID_CANDIDATE_LIMIT
        });
        preselectedShopIds = Array.from(new Set(serviceShops.map(s => s.shopId).filter(Boolean)));
        console.log(`⚡ Candidate shops from services: ${preselectedShopIds.length}`);
        if (preselectedShopIds.length === 0) {
          // Nothing matches, short-circuit shops branch
          results.shops = [];
          if (type === 'shops') {
            results.pagination.total = 0;
            results.pagination.pages = 0;
          } else if (type === 'all') {
            results.pagination.totalShops = 0;
          }
          // Skip the rest of shop processing
        } else {
          shopConditions.id = { in: preselectedShopIds };
          console.log('🏷️ Shop category filter applied (preselected IDs).');
        }
      }
      
      // Only process shops if we haven't short-circuited
      const shouldProcessShops = (preselectedShopIds === null || preselectedShopIds.length > 0);
      
      if (shouldProcessShops) {
      console.log('🏢 Shop conditions:', JSON.stringify(shopConditions, null, 2));

      if (filters?.verified) {
        shopConditions.isVerified = true;
      }
      if (filters?.hasReviews) {
        shopConditions.reviews = { some: {} };
      }

      // For shops, we need to fetch ALL results first if sorting by reviews/rating/customers
      // because these require post-processing. Otherwise, we can use pagination.
      const needsPostProcessingSorting = ['reviews', 'rating', 'customers'].includes(sortBy) || (sortBy === 'recommendation');
const shopSkip = needsPostProcessingSorting ? 0 : offset;
const shopTake = needsPostProcessingSorting ? ADV_SCAN_LIMIT : limit;

      let shopOrderBy = {};
      switch (sortBy) {
        case 'reviews':
        case 'rating':
        case 'customers':
          // We'll sort by review count, rating, or customers in post-processing
          // Fetch all results, no pagination yet
          shopOrderBy = { createdAt: 'desc' };
          break;
        case 'recent':
          shopOrderBy = { createdAt: 'desc' };
          break;
        case 'location':
          // Will be sorted by distance if coordinates provided, otherwise by city
          shopOrderBy = distanceFilter ? { createdAt: 'desc' } : { city: 'asc' };
          break;
        case 'recommendation':
        default:
          // For browsing mode, show verified shops first, then by creation date
          shopOrderBy = [
            { isVerified: 'desc' },
            { createdAt: 'desc' }
          ];
      }

      // Get total count for pagination
      let totalShopCount = 0;
      if (preselectedShopIds) {
        totalShopCount = preselectedShopIds.length;
        console.log('🏢 Total shops (from preselected IDs):', totalShopCount);
      } else {
        totalShopCount = await prisma.shop.count({ where: shopConditions });
        console.log('🏢 Total shops in database matching conditions:', totalShopCount);
      }

      const shops = await prisma.shop.findMany({
        where: shopConditions,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          phone: true,
          email: true,
          website: true,
          city: true,
          locationLat: true,
          locationLon: true,
          coverImage: true,
          logoImage: true,
          galleryImages: true,
          isVerified: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              profilePic: true,
              isVerified: true
            }
          },
          design: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          },
          reviews: {
            select: {
              rating: true,
              authorId: true  // To count unique customers (review authors)
            }
          },
          services: {
            select: {
              id: true
            }
          },
          products: {
            select: {
              id: true
            }
          },
          bookings: {
            select: {
              userId: true  // To count unique customers
            }
          }
        },
        orderBy: shopOrderBy,
        skip: shopSkip,
        take: shopTake
      });

      console.log('🏢 Found shops:', shops.length);

      // Calculate stats and sort if needed
      let shopsWithStats = shops.map(shop => {
        const reviews = shop.reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Count unique customers from reviews and bookings
        // Note: Shop doesn't have direct orders relation, orders are through products
        const uniqueCustomers = new Set();
        reviews.forEach(r => r.authorId && uniqueCustomers.add(r.authorId));
        (shop.bookings || []).forEach(b => b.userId && uniqueCustomers.add(b.userId));

        return {
          ...shop,
          stats: {
            totalReviews: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,
            totalServices: shop.services?.length || 0,
            totalProducts: shop.products?.length || 0,
            totalCustomers: uniqueCustomers.size
          }
        };
      });

      // Apply rating/reviews filters if requested
      if (filters?.minRating !== undefined) {
        shopsWithStats = shopsWithStats.filter(s => (s.stats?.averageRating || 0) >= filters.minRating);
      }
      if (filters?.minReviews !== undefined) {
        shopsWithStats = shopsWithStats.filter(s => (s.stats?.totalReviews || 0) >= filters.minReviews);
      }

      // Sort by reviews, rating, or customers if requested
      if (sortBy === 'reviews') {
        shopsWithStats.sort((a, b) => b.stats.totalReviews - a.stats.totalReviews);
      } else if (sortBy === 'rating') {
        shopsWithStats.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
      } else if (sortBy === 'customers') {
        shopsWithStats.sort((a, b) => b.stats.totalCustomers - a.stats.totalCustomers);
      }

      // Apply vector ranking if recommendation sort and no distance sort is active
      let filteredShops;
      if (sortBy === 'recommendation' && !distanceFilter && vectorIds?.shops?.length) {
        shopsWithStats = reRankByVector(shopsWithStats, vectorIds.shops);
        filteredShops = shopsWithStats;
      } else {
        // Apply distance filtering if needed - pass user city for enhanced filtering
        const userCityFromLocation = location?.city || (location?.type === 'query' ? location.query : null);
        filteredShops = filterByDistance(shopsWithStats, distanceFilter, userCityFromLocation);
      }
      
      // If we did post-processing sorting, apply pagination now
      const totalShopsAfterFilters = shopsWithStats.length;
      if (needsPostProcessingSorting || (filters?.minRating !== undefined || filters?.minReviews !== undefined)) {
        const startIndex = offset;
        const endIndex = offset + limit;
        filteredShops = shopsWithStats.slice(startIndex, endIndex);
      }
      
      results.shops = filteredShops;
      
      // Store total count for pagination (prefer post-filter totals if applicable)
      if (type === 'shops') {
        const total = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalShopsAfterFilters : totalShopCount;
        results.pagination.total = total;
        results.pagination.pages = Math.ceil(total / limit);
      } else if (type === 'all') {
        // Store for later aggregation
        results.pagination.totalShops = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalShopsAfterFilters : totalShopCount;
      }
      } // End shouldProcessShops
    }

    // Search services
    if (type === 'all' || type === 'services') {
      console.log('🔧 Searching services...');
      const serviceConditions = {
        ...locationConditions,
        ...buildCategoryConditions(category),
        deletedAt: null,
        available: true,
        ...(vectorIds?.services?.length ? { id: { in: vectorIds.services } } : {})
      };

      if (q) {
        serviceConditions.OR = [
          {
            translation: {
              OR: [
                { name_en: { contains: q } },
                { name_ar: { contains: q } },
                { description_en: { contains: q } },
                { description_ar: { contains: q } }
              ]
            }
          },
          { embeddingText: { contains: q } } // Services DO have embeddingText
        ];
      }

      if (filters?.verified) {
        serviceConditions.ownerUser = {
          isVerified: true
        };
      }
      if (filters?.hasReviews) {
        serviceConditions.reviews = { some: {} };
      }
      if (filters?.tags?.length) {
        serviceConditions.tags = {
          some: { name: { in: filters.tags } }
        };
      }

      if (filters?.priceRange) {
        const priceCondition = {};
        if (filters.priceRange.min !== undefined) {
          priceCondition.gte = filters.priceRange.min;
        }
        if (filters.priceRange.max !== undefined) {
          priceCondition.lte = filters.priceRange.max;
        }
        if (Object.keys(priceCondition).length > 0) {
          serviceConditions.price = priceCondition;
        }
      }


      // Similar to shops, check if we need post-processing sorting
      const serviceNeedsPostProcessing = ['reviews', 'rating', 'customers'].includes(sortBy) || (sortBy === 'recommendation') || (filters?.openNow === true);
const serviceSkip = serviceNeedsPostProcessing ? 0 : offset;
const serviceTake = serviceNeedsPostProcessing ? ADV_SCAN_LIMIT : limit;

      let serviceOrderBy = {};
      switch (sortBy) {
        case 'reviews':
        case 'rating':
        case 'customers':
          serviceOrderBy = { createdAt: 'desc' };
          break;
        case 'recent':
          serviceOrderBy = { createdAt: 'desc' };
          break;
        case 'location':
          serviceOrderBy = distanceFilter ? { createdAt: 'desc' } : { city: 'asc' };
          break;
        case 'recommendation':
        default:
          serviceOrderBy = [
            { available: 'desc' },
            { createdAt: 'desc' }
          ];
      }

      // Get total count for pagination
      const totalServiceCount = await prisma.service.count({
        where: serviceConditions
      });
      console.log('🔧 Total services in database matching conditions:', totalServiceCount);

      if (totalServiceCount > 50000) {
        console.warn('⚠️ Large service count detected, may cause performance issues');
      }

      const services = await prisma.service.findMany({
        where: serviceConditions,
        include: {
          translation: true,
          design: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          },
          ownerUser: {
            select: {
              id: true,
              name: true,
              profilePic: true,
              isVerified: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              ownerId: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  isVerified: true
                }
              }
            }
          },
          reviews: {
            select: {
              rating: true,
              authorId: true
            }
          },
          bookings: {
            select: {
              userId: true
            }
          },
          availability: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          subCategory: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: serviceOrderBy,
        skip: serviceSkip,
        take: serviceTake
      });

      console.log('🔧 Found services:', services.length);

      // Calculate stats for services
      let servicesWithStats = services.map(service => {
        const reviews = service.reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Count unique customers
        const uniqueCustomers = new Set();
        reviews.forEach(r => r.authorId && uniqueCustomers.add(r.authorId));
        (service.bookings || []).forEach(b => b.userId && uniqueCustomers.add(b.userId));

        return {
          ...service,
          stats: {
            totalReviews: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,
            totalCustomers: uniqueCustomers.size
          }
        };
      });

      // Apply open-now filter and rating/reviews filters if requested
      if (filters?.openNow) {
        servicesWithStats = servicesWithStats.filter(s => isServiceOpenNow(s));
      }
      if (filters?.minRating !== undefined) {
        servicesWithStats = servicesWithStats.filter(s => (s.stats?.averageRating || 0) >= filters.minRating);
      }
      if (filters?.minReviews !== undefined) {
        servicesWithStats = servicesWithStats.filter(s => (s.stats?.totalReviews || 0) >= filters.minReviews);
      }

      // Sort by reviews, rating, or customers if requested
      if (sortBy === 'reviews') {
        servicesWithStats.sort((a, b) => b.stats.totalReviews - a.stats.totalReviews);
      } else if (sortBy === 'rating') {
        servicesWithStats.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
      } else if (sortBy === 'customers') {
        servicesWithStats.sort((a, b) => b.stats.totalCustomers - a.stats.totalCustomers);
      }

      // Apply vector ranking if recommendation sort and no distance sort is active
      let filteredServices;
      if (sortBy === 'recommendation' && !distanceFilter && vectorIds?.services?.length) {
        servicesWithStats = reRankByVector(servicesWithStats, vectorIds.services);
        filteredServices = servicesWithStats;
      } else {
        // Apply distance filtering if needed - pass user city for enhanced filtering
        const userCityFromLocation = location?.city || (location?.type === 'query' ? location.query : null);
        filteredServices = filterByDistance(servicesWithStats, distanceFilter, userCityFromLocation);
      }
      
      // If we did post-processing sorting, apply pagination now
      const totalServicesAfterFilters = servicesWithStats.length;
      if (serviceNeedsPostProcessing || (filters?.minRating !== undefined || filters?.minReviews !== undefined) || filters?.openNow) {
        const startIndex = offset;
        const endIndex = offset + limit;
        filteredServices = servicesWithStats.slice(startIndex, endIndex);
      }
      
      results.services = filteredServices;
      
      // Store total count for pagination (prefer post-filter totals if applicable)
      if (type === 'services') {
        const total = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalServicesAfterFilters : totalServiceCount;
        results.pagination.total = total;
        results.pagination.pages = Math.ceil(total / limit);
      } else if (type === 'all') {
        // Store for later aggregation
        results.pagination.totalServices = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalServicesAfterFilters : totalServiceCount;
      }
    }

    // Search users (providers/people)
    if (type === 'all' || type === 'users') {
      console.log('👥 Searching users...');
      const userConditions = {
        role: { in: ['PROVIDER', 'CUSTOMER'] },
        deletedAt: null,
        ...(vectorIds?.users?.length ? { id: { in: vectorIds.users } } : {})
      };

      // Optimize user category filter by preselecting candidate user IDs from Services and Shop owners
      let preselectedUserIds = null;
      if (category?.categoryId || category?.subCategoryId) {
        console.log('⚡ Preselecting user IDs via Services/Shop owners for category filter...');
        const svcWhere = {
          deletedAt: null,
          ...(category?.categoryId ? { category: { some: { id: category.categoryId } } } : {}),
          ...(category?.subCategoryId ? { subCategoryId: category.subCategoryId } : {}),
        };
        const [svcUsers, svcShops] = await Promise.all([
          prisma.service.findMany({
            where: { ...svcWhere, ownerUserId: { not: null } },
            select: { ownerUserId: true },
            distinct: ['ownerUserId'],
            take: USER_ID_CANDIDATE_LIMIT
          }),
          prisma.service.findMany({
            where: { ...svcWhere, shopId: { not: null } },
            select: { shop: { select: { ownerId: true } } },
            take: USER_ID_CANDIDATE_LIMIT
          })
        ]);
        const ownerIdsFromServices = svcUsers.map(x => x.ownerUserId).filter(Boolean);
        const ownerIdsFromShops = svcShops.map(x => x.shop?.ownerId).filter(Boolean);
        preselectedUserIds = Array.from(new Set([...ownerIdsFromServices, ...ownerIdsFromShops]));
        console.log(`⚡ Candidate users from services/shops: ${preselectedUserIds.length}`);
        if (preselectedUserIds.length === 0) {
          // Nothing matches, short-circuit users branch
          results.users = [];
          if (type === 'users') {
            results.pagination.total = 0;
            results.pagination.pages = 0;
          } else if (type === 'all') {
            results.pagination.totalUsers = 0;
          }
        } else {
          userConditions.id = { in: preselectedUserIds };
          console.log('🏷️ User category filter applied (preselected IDs).');
        }
      }
      
      // Only process users if we haven't short-circuited
      const shouldProcessUsers = (preselectedUserIds === null || preselectedUserIds.length > 0);
      
      if (shouldProcessUsers) {

      if (q) {
        userConditions.OR = [
          { name: { contains: q } },
          { bio: { contains: q } }
        ];
      }

      if (filters?.verified) {
        userConditions.isVerified = true;
      }
      if (filters?.hasReviews) {
        userConditions.reviewsReceived = { some: {} };
      }

      const userNeedsPostProcessing = ['reviews', 'rating', 'customers'].includes(sortBy) || (sortBy === 'recommendation');
const userSkip = userNeedsPostProcessing ? 0 : offset;
const userTake = userNeedsPostProcessing ? ADV_SCAN_LIMIT : limit;

      let userOrderBy = {};
      switch (sortBy) {
        case 'reviews':
        case 'rating':
        case 'customers':
          userOrderBy = { createdAt: 'desc' };
          break;
        case 'recent':
          userOrderBy = { createdAt: 'desc' };
          break;
        case 'recommendation':
        default:
          userOrderBy = [
            { isVerified: 'desc' },
            { createdAt: 'desc' }
          ];
      }

      // Get total count for pagination
      let totalUserCount = 0;
      if (preselectedUserIds) {
        totalUserCount = preselectedUserIds.length;
        console.log('👥 Total users (from preselected IDs):', totalUserCount);
      } else {
        totalUserCount = await prisma.user.count({ where: userConditions });
        console.log('👥 Total users in database matching conditions:', totalUserCount);
      }

      if (totalUserCount > 50000) {
        console.warn('⚠️ Large user count detected, may cause performance issues');
      }

      const users = await prisma.user.findMany({
        where: userConditions,
        select: {
          id: true,
          name: true,
          profilePic: true,
          bio: true,
          role: true,
          isVerified: true,
          createdAt: true,
          services: {
            select: {
              id: true
            }
          },
          shops: {
            select: {
              id: true
            }
          },
          reviewsReceived: {
            select: {
              rating: true
            }
          }
        },
        orderBy: userOrderBy,
        skip: userSkip,
        take: userTake
      });

      console.log('👥 Found users:', users.length);

      // Calculate stats for users
      let usersWithStats = users.map(user => {
        const receivedReviews = user.reviewsReceived || [];
        const avgRating = receivedReviews.length > 0
          ? receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length
          : 0;

        return {
          ...user,
          stats: {
            totalServices: user.services?.length || 0,
            totalShops: user.shops?.length || 0,
            totalReviews: receivedReviews.length,
            averageRating: Math.round(avgRating * 10) / 10
          }
        };
      });

      // Apply rating/reviews filters if requested
      if (filters?.minRating !== undefined) {
        usersWithStats = usersWithStats.filter(u => (u.stats?.averageRating || 0) >= filters.minRating);
      }
      if (filters?.minReviews !== undefined) {
        usersWithStats = usersWithStats.filter(u => (u.stats?.totalReviews || 0) >= filters.minReviews);
      }

      // Sort by reviews, rating, or customers if requested
      if (sortBy === 'reviews') {
        usersWithStats.sort((a, b) => b.stats.totalReviews - a.stats.totalReviews);
      } else if (sortBy === 'rating') {
        usersWithStats.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
      } else if (sortBy === 'customers') {
        // For users, customers = total services + shops
        usersWithStats.sort((a, b) => {
          const aTotal = (a.stats.totalServices || 0) + (a.stats.totalShops || 0);
          const bTotal = (b.stats.totalServices || 0) + (b.stats.totalShops || 0);
          return bTotal - aTotal;
        });
      }

      // Apply vector ranking if recommendation sort
      if (sortBy === 'recommendation' && vectorIds?.users?.length) {
        usersWithStats = reRankByVector(usersWithStats, vectorIds.users);
      }

      // If we did post-processing sorting or applied rating/review filters, apply pagination now
      const totalUsersAfterFilters = usersWithStats.length;
      let finalUsers = usersWithStats;
      if (userNeedsPostProcessing || (filters?.minRating !== undefined || filters?.minReviews !== undefined)) {
        const startIndex = offset;
        const endIndex = offset + limit;
        finalUsers = usersWithStats.slice(startIndex, endIndex);
      }

      results.users = finalUsers;
      
      // Store total count for pagination (prefer post-filter totals if applicable)
      if (type === 'users') {
        const total = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalUsersAfterFilters : totalUserCount;
        results.pagination.total = total;
        results.pagination.pages = Math.ceil(total / limit);
      } else if (type === 'all') {
        // Store for later aggregation
        results.pagination.totalUsers = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalUsersAfterFilters : totalUserCount;
      }
      } // End shouldProcessUsers
    }

    // Search products
    if (type === 'all' || type === 'products') {
      console.log('📦 Searching products...');
      const productConditions = {
        isActive: true,
        deletedAt: null,
        stock: { gt: 0 }, // Only show products in stock by default
        ...(vectorIds?.products?.length ? { id: { in: vectorIds.products } } : {})
      };

      if (q) {
        productConditions.OR = [
          { name: { contains: q } },
          { description: { contains: q } },
          { embeddingText: { contains: q } } // Products DO have embeddingText
        ];
      }

      if (filters?.priceRange) {
        const priceCondition = {};
        if (filters.priceRange.min !== undefined) {
          priceCondition.gte = filters.priceRange.min;
        }
        if (filters.priceRange.max !== undefined) {
          priceCondition.lte = filters.priceRange.max;
        }
        if (Object.keys(priceCondition).length > 0) {
          productConditions.price = priceCondition;
        }
      }

      if (filters?.verified) {
        productConditions.shop = {
          isVerified: true
        };
      }
      if (filters?.hasReviews) {
        productConditions.reviews = { some: {} };
      }
      if (filters?.tags?.length) {
        productConditions.tags = {
          some: { name: { in: filters.tags } }
        };
      }

      const productNeedsPostProcessing = ['reviews', 'rating', 'customers'].includes(sortBy) || (sortBy === 'recommendation');
const productSkip = productNeedsPostProcessing ? 0 : offset;
const productTake = productNeedsPostProcessing ? ADV_SCAN_LIMIT : limit;

      let productOrderBy = {};
      switch (sortBy) {
        case 'reviews':
        case 'rating':
        case 'customers':
          productOrderBy = { createdAt: 'desc' };
          break;
        case 'recent':
          productOrderBy = { createdAt: 'desc' };
          break;
        case 'recommendation':
        default:
          productOrderBy = [
            { isActive: 'desc' },
            { createdAt: 'desc' }
          ];
      }

      // Get total count for pagination
      const totalProductCount = await prisma.product.count({
        where: productConditions
      });
      console.log('📦 Total products in database matching conditions:', totalProductCount);

      const products = await prisma.product.findMany({
        where: productConditions,
        include: {
          design: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              city: true,
              isVerified: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  isVerified: true
                }
              }
            }
          },
          lister: {
            select: {
              id: true,
              name: true,
              profilePic: true,
              isVerified: true
            }
          },
          reviews: {
            select: {
              rating: true,
              authorId: true
            }
          },
          orderItems: {
            select: {
              order: {
                select: {
                  userId: true  // Customer who placed the order
                }
              }
            }
          }
        },
        orderBy: productOrderBy,
        skip: productSkip,
        take: productTake
      });

      console.log('📦 Found products:', products.length);

      // Calculate stats for products
      let productsWithStats = products.map(product => {
        const reviews = product.reviews || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Count unique customers
        const uniqueCustomers = new Set();
        reviews.forEach(r => r.authorId && uniqueCustomers.add(r.authorId));
        (product.orderItems || []).forEach(item => {
          if (item.order?.userId) {
            uniqueCustomers.add(item.order.userId);
          }
        });

        return {
          ...product,
          // Promote shop coordinates to top-level for distance filtering
          locationLat: product.shop?.locationLat ?? null,
          locationLon: product.shop?.locationLon ?? null,
          stats: {
            totalReviews: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,
            totalCustomers: uniqueCustomers.size
          }
        };
      });

      // Apply rating/reviews filters if requested
      if (filters?.minRating !== undefined) {
        productsWithStats = productsWithStats.filter(p => (p.stats?.averageRating || 0) >= filters.minRating);
      }
      if (filters?.minReviews !== undefined) {
        productsWithStats = productsWithStats.filter(p => (p.stats?.totalReviews || 0) >= filters.minReviews);
      }

      // Apply vector ranking if recommendation sort and no distance sort is active
      if (sortBy === 'recommendation' && !distanceFilter && vectorIds?.products?.length) {
        productsWithStats = reRankByVector(productsWithStats, vectorIds.products);
      }

      // Apply distance filtering if needed - pass user city for enhanced filtering
      const userCityFromLocation = location?.city || (location?.type === 'query' ? location.query : null);
      productsWithStats = filterByDistance(productsWithStats, distanceFilter, userCityFromLocation);

      // Sort by reviews, rating, or customers if requested
      if (sortBy === 'reviews') {
        productsWithStats.sort((a, b) => b.stats.totalReviews - a.stats.totalReviews);
      } else if (sortBy === 'rating') {
        productsWithStats.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
      } else if (sortBy === 'customers') {
        productsWithStats.sort((a, b) => b.stats.totalCustomers - a.stats.totalCustomers);
      }

      // If we did post-processing sorting or applied rating/review filters, apply pagination now
      const totalProductsAfterFilters = productsWithStats.length;
      let finalProducts = productsWithStats;
      if (productNeedsPostProcessing || (filters?.minRating !== undefined || filters?.minReviews !== undefined)) {
        const startIndex = offset;
        const endIndex = offset + limit;
        finalProducts = productsWithStats.slice(startIndex, endIndex);
      }

      results.products = finalProducts;
      
      // Store total count for pagination (prefer post-filter totals if applicable)
      if (type === 'products') {
        const total = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalProductsAfterFilters : totalProductCount;
        results.pagination.total = total;
        results.pagination.pages = Math.ceil(total / limit);
      } else if (type === 'all') {
        // Store for later aggregation
        results.pagination.totalProducts = (filters?.minRating !== undefined || filters?.minReviews !== undefined) ? totalProductsAfterFilters : totalProductCount;
      }
    }

    // Calculate total results and pagination
    if (type === 'all') {
      // For 'all' type, sum up all database counts (not just fetched results)
      const totalDbCount = 
        (results.pagination.totalShops || 0) +
        (results.pagination.totalServices || 0) +
        (results.pagination.totalUsers || 0) +
        (results.pagination.totalProducts || 0);
      
      results.pagination = {
        page,
        limit,
        total: totalDbCount,
        pages: Math.ceil(totalDbCount / limit),
        // Include breakdown for debugging
        breakdown: {
          shops: results.pagination.totalShops || 0,
          services: results.pagination.totalServices || 0,
          users: results.pagination.totalUsers || 0,
          products: results.pagination.totalProducts || 0
        }
      };
    }

    console.log('🔍 Final results summary:', {
      shops: results.shops.length,
      services: results.services.length,
      users: results.users.length,
      products: results.products.length,
      pagination: results.pagination
    });

    res.json({
      success: true,
      ...results
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('🔍 Validation error in advanced search:');
      console.error(JSON.stringify(error.errors, null, 2));
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }

    console.error('🔍 Error in advanced search:', error);
    console.error('🔍 Error stack:', error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register both GET and POST for the search endpoint
router.get("/", handleSearch);
router.post("/", handleSearch);

export default router;
