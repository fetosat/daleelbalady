// handler/process_results.js
// AI-powered results processor with dynamic filtering using Gemini 2.0-flash

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const processResults = async (rawResults, originalQuery, searchType) => {
  console.log("🔄 processResults called with:", {
    resultCount: rawResults.length,
    query: originalQuery,
    searchType
  });

  const model = "gemini-2.5-flash-lite";  // Use latest Gemini 2.5-flash-lite
  
  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["processedResults", "dynamicFilters", "summary"],
      properties: {
        processedResults: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "type", "name", "description", "location", "contact", "rating", "filterTags", "priority", "category"],
            properties: {
              id: { type: Type.STRING },
              type: { 
                type: Type.STRING,
                enum: ["service", "user", "shop", "product"]
              },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              location: {
                type: Type.OBJECT,
                properties: {
                  city: { type: Type.STRING },
                  address: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lon: { type: Type.NUMBER }
                    }
                  }
                }
              },
              contact: {
                type: Type.OBJECT,
                properties: {
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  website: { type: Type.STRING }
                }
              },
              rating: {
                type: Type.OBJECT,
                properties: {
                  average: { type: Type.NUMBER },
                  count: { type: Type.INTEGER },
                  stars: { type: Type.INTEGER }
                }
              },
              filterTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of filter tags this result belongs to (e.g., ['all', 'services', 'medical', 'recommended'])"
              },
              priority: {
                type: Type.INTEGER,
                description: "Priority score 1-10 for sorting (10 = highest priority)"
              },
              category: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  ar: { type: Type.STRING }
                },
                required: ["en", "ar"],
                description: "Smart category classification with bilingual names (e.g., {en: 'Doctor', ar: 'طبيب'})"
              },
              metadata: {
                type: Type.OBJECT,
                properties: {
                  specialty: { type: Type.STRING },
                  categoryCode: { type: Type.STRING },
                  price: { type: Type.STRING },
                  availability: { type: Type.STRING },
                  isRecommended: { type: Type.BOOLEAN },
                  isVerified: { type: Type.BOOLEAN }
                }
              }
            }
          }
        },
        dynamicFilters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "name", "count", "icon"],
            properties: {
              id: { type: Type.STRING },
              name: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  ar: { type: Type.STRING }
                },
                required: ["en", "ar"]
              },
              count: { type: Type.INTEGER },
              icon: { type: Type.STRING },
              order: { type: Type.INTEGER }
            }
          }
        },
        summary: {
          type: Type.OBJECT,
          properties: {
            totalResults: { type: Type.INTEGER },
            primaryType: { type: Type.STRING },
            topCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hasRecommended: { type: Type.BOOLEAN },
            searchQuality: { type: Type.STRING }
          }
        }
      }
    },
    systemInstruction: [
      {
        text: `You are an intelligent results processor for Daleel Balady "دليل بلدي", a local search platform.

Your task is to analyze raw search results and transform them into a standardized, filterable format.

IMPORTANT: Always respond with valid, well-formed JSON. No extra text. Keep descriptions concise (under 100 chars).

PROCESSING RULES:

1. RESULT STANDARDIZATION:
   - Classify each result as: "service", "user", "shop", or "product"
   - Extract key information: name, description, location, contact, rating
   - Generate priority scores (1-10) based on relevance, rating, and quality
   - Create filter tags for each result
   - Keep all text fields short and clean

2. DYNAMIC FILTER GENERATION:
   - Always include "all" filter with total count
   - Create type-based filters: "services", "users", "shops", "products" 
   - Generate content-based filters: "medical", "restaurants", "electronics", etc.
   - Add quality filters: "recommended", "verified", "top_rated"
   - Provide Arabic and English names for all filters
   - Use simple emoji icons (single emoji only)

3. FILTER TAG ASSIGNMENT:
   Every result must have filterTags array containing:
   - "all" (always included)
   - Type tag: "services", "users", "shops", or "products"
   - Category tags: based on content (e.g., "medical", "dental", "pharmacy")
   - Quality tags: "recommended" (if rating > 4.0), "verified" (if verified)

4. SMART CATEGORIZATION:
   Each result must have a "category" object with {"en": "English Name", "ar": "Arabic Name"}.
   
   CATEGORY EXAMPLES:
   - Medical Doctor: {"en": "Doctor", "ar": "طبيب"}
   - Medical Clinic: {"en": "Clinic", "ar": "عيادة"}
   - Hospital: {"en": "Hospital", "ar": "مستشفى"}
   - Pharmacy: {"en": "Pharmacy", "ar": "صيدلية"}
   - Restaurant: {"en": "Restaurant", "ar": "مطعم"}
   - Cafe: {"en": "Cafe", "ar": "مقهى"}
   - Shop: {"en": "Shop", "ar": "محل"}
   - Store: {"en": "Store", "ar": "متجر"}
   - Mechanic: {"en": "Mechanic", "ar": "ميكانيكي"}
   - Auto Garage: {"en": "Auto Garage", "ar": "ورشة سيارات"}
   - Service Provider: {"en": "Service Provider", "ar": "مقدم خدمة"}
   - Barber Shop: {"en": "Barber Shop", "ar": "محل حلاقة"}
   - Beauty Salon: {"en": "Beauty Salon", "ar": "صالون تجميل"}
   - Electronics Shop: {"en": "Electronics Shop", "ar": "محل إلكترونيات"}
   - Clothing Store: {"en": "Clothing Store", "ar": "متجر ملابس"}
   - Bakery: {"en": "Bakery", "ar": "مخبز"}

5. PRIORITY SCORING (1-10):
   - 9-10: Verified + High rating + Perfect match
   - 7-8: Good rating + Good match
   - 5-6: Average rating or partial match
   - 3-4: Low rating or poor match
   - 1-2: Very poor or irrelevant

6. MULTILINGUAL SUPPORT:
   - Provide Arabic and English names for filters
   - Handle mixed Arabic/English content properly
   - Preserve original language in names/descriptions

EXAMPLE FILTERS STRUCTURE:
[
  {"id": "all", "name": {"en": "All", "ar": "الكل"}, "count": 25, "icon": "🔍", "order": 0},
  {"id": "services", "name": {"en": "Services", "ar": "الخدمات"}, "count": 15, "icon": "🏥", "order": 1},
  {"id": "medical", "name": {"en": "Medical", "ar": "طبي"}, "count": 12, "icon": "⚕️", "order": 2},
  {"id": "recommended", "name": {"en": "Recommended", "ar": "موصى به"}, "count": 8, "icon": "⭐", "order": 3}
]

FILTER TAG EXAMPLES:
- Medical service: ["all", "services", "medical", "recommended"]
- Pharmacy: ["all", "shops", "medical", "pharmacy", "verified"]
- Doctor: ["all", "users", "medical", "doctors", "recommended"]
- Restaurant: ["all", "shops", "food", "restaurants"]

Analyze the provided results and create intelligent, user-friendly filters that help users navigate the search results effectively.`
      }
    ]
  };

  try {
    // Prepare simplified results data for AI processing
    const resultsData = rawResults.map(result => ({
      id: result.id,
      name: (result.translation?.name_en || result.translation?.name_ar || result.shop?.name || result.name || 'Unknown').replace(/["\\]/g, ''),
      description: (result.translation?.description_en || result.translation?.description_ar || result.shop?.description || '').substring(0, 150).replace(/["\\]/g, ''),
      city: (result.city || result.shop?.city || '').replace(/["\\]/g, ''),
      phone: (result.phone || result.shop?.phone || '').replace(/["\\]/g, ''),
      avgRating: Math.round((result.avgRating || 0) * 10) / 10,
      reviewsCount: result.reviewsCount || 0,
      isRecommended: !!result.isRecommended,
      isVerified: !!result.isVerified,
      hasLocation: !!(result.locationLat && result.locationLon),
      originalType: determineOriginalType(result)
    }));

    const contents = [
      {
        role: "user",
        parts: [{
          text: `Analyze and process these search results for query: "${originalQuery}" (Search Type: ${searchType})

Raw Results (${resultsData.length} items):
${JSON.stringify(resultsData, null, 2)}

Please standardize these results and generate dynamic filters based on the content.`
        }]
      }
    ];

    console.log("🤖 Calling Gemini 2.0-flash to process results...");
    
    const response = await ai.models.generateContent({
      model,
      config,
      contents
    });

    const txt = response.candidates[0].content.parts[0].text;
    console.log("🔍 AI processing complete, response length:", txt?.length || 0);

    let processed;
    try {
      // Clean and sanitize the AI response
      let cleanedResponse = txt.trim();
      
      // Remove any markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```$/g, '').trim();
      }
      
      // Try to fix common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\n/g, ' ')     // Replace newlines with spaces
        .replace(/\t/g, ' ')     // Replace tabs with spaces
        .replace(/\s+/g, ' ');   // Replace multiple spaces with single space
      
      // Try to parse
      processed = JSON.parse(cleanedResponse);
      
      console.log("✅ Successfully parsed AI response");
      
      // Validate required structure
      if (!processed.processedResults || !processed.dynamicFilters || !Array.isArray(processed.processedResults) || !Array.isArray(processed.dynamicFilters)) {
        throw new Error('Invalid AI response structure: missing required arrays');
      }
      
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError);
      console.error("❌ Response preview:", txt?.substring(0, 500));
      console.error("❌ Response ending:", txt?.substring(txt.length - 500));
      
      // Fallback processing if AI fails
      return fallbackProcessing(rawResults, originalQuery, searchType);
    }

    // Validate and enhance the processed results
    const validatedResults = validateAndEnhanceResults(processed, rawResults);
    
    console.log("✅ Results processing complete:", {
      totalResults: validatedResults.processedResults.length,
      filtersGenerated: validatedResults.dynamicFilters.length,
      primaryType: validatedResults.summary.primaryType
    });

    return validatedResults;

  } catch (error) {
    console.error("❌ Error in processResults:", error);
    
    // Fallback processing if AI call fails
    return fallbackProcessing(rawResults, originalQuery, searchType);
  }
};

// Helper function to determine original result type
function determineOriginalType(result) {
  // Check if it's a user/person
  if (result.ownerUser && !result.shop) {
    return 'user';
  }
  
  // Check if it's a shop
  if (result.shop?.name) {
    return 'shop';
  }
  
  // Check if it's a product (has price, sku, stock-related fields)
  if (result.price && (result.sku || result.stock !== undefined)) {
    return 'product';
  }
  
  // Check if it's a service (medical keywords, has translation)
  if (result.translation?.name_en?.toLowerCase().includes('doctor') ||
      result.translation?.name_ar?.includes('طبيب') ||
      result.embeddingText?.includes('medical') ||
      result.design?.slug === 'medical') {
    return 'service';
  }
  
  // Default to service
  return 'service';
}

// Validate and enhance AI-processed results
function validateAndEnhanceResults(processed, originalResults) {
  const enhanced = { ...processed };
  
  // Ensure all filter has correct count
  const allFilter = enhanced.dynamicFilters.find(f => f.id === 'all');
  if (allFilter) {
    allFilter.count = enhanced.processedResults.length;
  }
  
  // Validate filter counts
  enhanced.dynamicFilters.forEach(filter => {
    if (filter.id !== 'all') {
      const actualCount = enhanced.processedResults.filter(result => 
        result.filterTags.includes(filter.id)
      ).length;
      filter.count = actualCount;
    }
  });
  
  // Sort filters by order
  enhanced.dynamicFilters.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Sort results by priority (highest first)
  enhanced.processedResults.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  return enhanced;
}

// Fallback processing if AI fails
function fallbackProcessing(rawResults, originalQuery, searchType) {
  console.log("🔧 Using fallback processing...");
  
  const processedResults = rawResults.map((result, index) => ({
    id: result.id,
    type: determineOriginalType(result),
    name: result.translation?.name_en || result.translation?.name_ar || result.shop?.name || result.name || 'Unknown',
    description: result.translation?.description_en || result.translation?.description_ar || result.shop?.description || '',
    location: {
      city: result.city || result.shop?.city || '',
      address: result.address || result.shop?.address || '',
      coordinates: result.locationLat && result.locationLon ? {
        lat: result.locationLat,
        lon: result.locationLon
      } : null
    },
    contact: {
      phone: result.phone || result.shop?.phone || '',
      email: '',
      website: ''
    },
    rating: {
      average: result.avgRating || 0,
      count: result.reviewsCount || 0,
      stars: Math.round(result.avgRating || 0)
    },
    filterTags: generateBasicFilterTags(result),
    priority: result.isRecommended ? 8 : (result.avgRating > 4 ? 7 : 5),
    category: determineFallbackCategory(result),
    metadata: {
      specialty: '',
      categoryCode: determineOriginalType(result),
      price: result.price?.toString() || '',
      availability: '',
      isRecommended: result.isRecommended || false,
      isVerified: result.isVerified || false
    }
  }));

  const dynamicFilters = generateBasicFilters(processedResults);
  
  const summary = {
    totalResults: processedResults.length,
    primaryType: searchType?.toLowerCase() || 'mixed',
    topCategories: [...new Set(processedResults.map(r => r.type))],
    hasRecommended: processedResults.some(r => r.metadata.isRecommended),
    searchQuality: 'basic'
  };

  return {
    processedResults,
    dynamicFilters,
    summary
  };
}

// Generate basic filter tags for fallback
function generateBasicFilterTags(result) {
  const tags = ['all'];
  const type = determineOriginalType(result);
  
  switch (type) {
    case 'service':
      tags.push('services');
      break;
    case 'user':
      tags.push('users');
      break;
    case 'shop':
      tags.push('shops');
      break;
    case 'product':
      tags.push('products');
      break;
  }
  
  if (result.isRecommended) tags.push('recommended');
  if (result.isVerified) tags.push('verified');
  if ((result.avgRating || 0) > 4) tags.push('top_rated');
  
  return tags;
}

// Determine fallback category with bilingual names
function determineFallbackCategory(result) {
  const type = determineOriginalType(result);
  const name = (result.translation?.name_en || result.translation?.name_ar || result.shop?.name || result.name || '').toLowerCase();
  const description = (result.translation?.description_en || result.translation?.description_ar || result.shop?.description || '').toLowerCase();
  const text = `${name} ${description}`;
  
  // Medical categories
  if (text.includes('doctor') || text.includes('طبيب') || text.includes('دكتور')) {
    return { en: 'Doctor', ar: 'طبيب' };
  }
  if (text.includes('clinic') || text.includes('عيادة')) {
    return { en: 'Clinic', ar: 'عيادة' };
  }
  if (text.includes('hospital') || text.includes('مستشفى')) {
    return { en: 'Hospital', ar: 'مستشفى' };
  }
  if (text.includes('pharmacy') || text.includes('صيدلية')) {
    return { en: 'Pharmacy', ar: 'صيدلية' };
  }
  
  // Food categories
  if (text.includes('restaurant') || text.includes('مطعم')) {
    return { en: 'Restaurant', ar: 'مطعم' };
  }
  if (text.includes('cafe') || text.includes('مقهى') || text.includes('كافيه')) {
    return { en: 'Cafe', ar: 'مقهى' };
  }
  if (text.includes('bakery') || text.includes('مخبز')) {
    return { en: 'Bakery', ar: 'مخبز' };
  }
  
  // Auto categories
  if (text.includes('mechanic') || text.includes('ميكانيكي')) {
    return { en: 'Mechanic', ar: 'ميكانيكي' };
  }
  if (text.includes('garage') || text.includes('ورشة')) {
    return { en: 'Auto Garage', ar: 'ورشة سيارات' };
  }
  
  // Beauty categories
  if (text.includes('barber') || text.includes('حلاق') || text.includes('حلاقة')) {
    return { en: 'Barber Shop', ar: 'محل حلاقة' };
  }
  if (text.includes('salon') || text.includes('صالون')) {
    return { en: 'Beauty Salon', ar: 'صالون تجميل' };
  }
  
  // Generic categories based on type
  switch (type) {
    case 'user':
      return { en: 'Service Provider', ar: 'مقدم خدمة' };
    case 'shop':
      return { en: 'Shop', ar: 'محل' };
    case 'product':
      return { en: 'Product', ar: 'منتج' };
    case 'service':
    default:
      return { en: 'Service', ar: 'خدمة' };
  }
}

// Generate basic filters for fallback
function generateBasicFilters(results) {
  const filters = [
    {
      id: 'all',
      name: { en: 'All', ar: 'الكل' },
      count: results.length,
      icon: '🔍',
      order: 0
    }
  ];
  
  // Type-based filters
  const types = ['services', 'users', 'shops', 'products'];
  const typeNames = {
    services: { en: 'Services', ar: 'الخدمات' },
    users: { en: 'People', ar: 'الأشخاص' },
    shops: { en: 'Shops', ar: 'المتاجر' },
    products: { en: 'Products', ar: 'المنتجات' }
  };
  const typeIcons = {
    services: '🏥',
    users: '👤',
    shops: '🏪',
    products: '📦'
  };
  
  types.forEach((type, index) => {
    const count = results.filter(r => r.filterTags.includes(type)).length;
    if (count > 0) {
      filters.push({
        id: type,
        name: typeNames[type],
        count,
        icon: typeIcons[type],
        order: index + 1
      });
    }
  });
  
  // Quality filters
  const recommendedCount = results.filter(r => r.filterTags.includes('recommended')).length;
  if (recommendedCount > 0) {
    filters.push({
      id: 'recommended',
      name: { en: 'Recommended', ar: 'موصى به' },
      count: recommendedCount,
      icon: '⭐',
      order: 10
    });
  }
  
  return filters;
}
