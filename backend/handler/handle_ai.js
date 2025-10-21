// handler/handle_ai.js
import { AI_Magic } from "./ai-magic.js";
import { generate_function_reply } from "./ai-helpers.js"; // not using generate_model_reply directly
import { prisma } from "../lib/db.js";
import { processResults } from "./process_results.js";

export const handle_ai = async (socket, ai, msg) => {
    console.log("🔥 handle_ai received msg:", typeof msg);

    // Extract the actual message text
    let messageText;
    if (typeof msg === 'string') {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(msg);
            messageText = parsed.message || msg;
        } catch (e) {
            // If not JSON, use as-is
            messageText = msg;
        }
    } else if (msg && typeof msg === 'object') {
        if (msg.message) {
            messageText = msg.message;
        } else {
            messageText = JSON.stringify(msg);
        }
    } else {
        messageText = String(msg);
    }

    console.log("📝 Extracted message text:", messageText?.substring?.(0, 100));

    let contents = [
        {
            role: "user",
            parts: [{ text: messageText }],
        },
    ];

    try {
        let continueLoop = true;
        let loopCount = 0;
        const maxLoops = 3; // Prevent infinite loops

        while (continueLoop && loopCount < maxLoops) {
            loopCount++;
            console.log(`🔄 AI Processing loop ${loopCount}/${maxLoops}`);

            console.log("📤 Calling AI_Magic with contents:", contents.length, "messages");
            let functionCall;
            try {
                // Add timeout to AI call
                functionCall = await Promise.race([
                    AI_Magic(contents),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('AI_Magic timeout')), 30000)
                    )
                ]);
            } catch (aiError) {
                console.error("❌ AI_Magic error:", aiError.message);
                socket.emit("ai_message", {
                    function: "reply_to_user",
                    parameters: { message: "⚠️ AI processing error. Please try again." },
                });
                break;
            }

            console.log("📥 AI_Magic response:");
            console.log(JSON.stringify(functionCall, null, 2));

            if (!functionCall?.function) {
                console.log("⚠️ No valid function response from AI");
                socket.emit("ai_message", {
                    function: "reply_to_user",
                    parameters: { message: "⚠️ No valid function response. Please try rephrasing your question." },
                });
                continueLoop = false;
                break;
            }

            if (functionCall.function === "reply_to_user") {
                console.log("💬 Processing reply_to_user function");
                const replyMsg = functionCall?.message || "⚠️ Empty reply.";
                console.log("💬 Sending reply:", replyMsg?.substring(0, 100));

                socket.emit("ai_message", {
                    function: "reply_to_user",
                    parameters: { message: replyMsg },
                });

                contents.push({
                    role: "model",
                    parts: [{ text: JSON.stringify({ message: replyMsg }) }],
                });

                continueLoop = false; // stop recursion
                console.log("✅ Conversation completed with reply_to_user");
                break; // Explicitly break out of the loop
            }

            else if (functionCall.function === "multi_entity_search") {
                console.log("🔍 Processing multi-entity search:", functionCall.search_type);

                // Use the corrected flat structure from ai-magic.js
                const search_type = functionCall.search_type || "SERVICE";
                const entities = functionCall.entities || {};
                const location_required = functionCall.location_required !== false;
                const search_radius = functionCall.search_radius || 5000;
                const city = functionCall.city;
                const search_text = functionCall.search_text || messageText;

                console.log("🔍 Raw entities from AI:", entities);

                // Convert flat format to nested format for compatibility
                const convertedEntities = {
                    users: {
                        enabled: entities?.users_enabled === true || entities?.users_enabled === "true",
                        query: entities?.users_query || search_text || "",
                        role_filter: "PROVIDER"
                    },
                    services: {
                        enabled: entities?.services_enabled === true || entities?.services_enabled === "true",
                        query: entities?.services_query || search_text || ""
                    },
                    shops: {
                        enabled: entities?.shops_enabled === true || entities?.shops_enabled === "true",
                        query: entities?.shops_query || search_text || ""
                    },
                    products: {
                        enabled: entities?.products_enabled === true || entities?.products_enabled === "true",
                        query: entities?.products_query || search_text || ""
                    }
                };

                // If no entities are enabled, enable services by default
                const hasEnabledEntities = Object.values(convertedEntities).some(e => e.enabled);
                if (!hasEnabledEntities) {
                    console.log("⚠️ No entities enabled, defaulting to services");
                    convertedEntities.services.enabled = true;
                }

                console.log("🔍 Converted entities:", Object.keys(convertedEntities).filter(k => convertedEntities[k]?.enabled));

                // Use converted entities for the rest of the processing
                const entities_to_use = convertedEntities;

                // Use location if available or required
                let lat = null, lon = null;
                if (socket.data?.userLocation?.lat && socket.data.userLocation?.lon) {
                    lat = socket.data.userLocation.lat;
                    lon = socket.data.userLocation.lon;
                }

                // If location missing and required, request from frontend
                if (location_required && (lat === null || lon === null)) {
                    socket.emit("request_location");
                    const locStr = await waitForLocationFromSocket(socket);
                    if (locStr) {
                        const [latStr, lonStr] = locStr.split(",");
                        lat = parseFloat(latStr);
                        lon = parseFloat(lonStr);
                    }
                }

                // Process each enabled entity type
                const allResults = {
                    users: [],
                    services: [],
                    shops: [],
                    products: [],
                    metadata: {
                        search_type,
                        location: lat !== null && lon !== null ? { lat, lon } : null,
                        radius: search_radius,
                        query_time: new Date().toISOString()
                    }
                };

                // Use Multi-Collection Vector Search for enabled entities
                const vectorSearchEntities = {};
                let hasVectorSearch = false;

                // Build vector search request for enabled entities
                if (entities_to_use?.services?.enabled) {
                    vectorSearchEntities.services = {
                        enabled: true,
                        query: entities_to_use.services.query,
                        limit: 10
                    };
                    hasVectorSearch = true;
                }

                if (entities_to_use?.users?.enabled) {
                    vectorSearchEntities.users = {
                        enabled: true,
                        query: entities_to_use.users.query,
                        limit: 10
                    };
                    hasVectorSearch = true;
                }

                if (entities_to_use?.shops?.enabled) {
                    vectorSearchEntities.shops = {
                        enabled: true,
                        query: entities_to_use.shops.query,
                        limit: 10
                    };
                    hasVectorSearch = true;
                }

                if (entities_to_use?.products?.enabled) {
                    vectorSearchEntities.products = {
                        enabled: true,
                        query: entities_to_use.products.query,
                        limit: 10
                    };
                    hasVectorSearch = true;
                }

                // Perform vector search if any entities are enabled
                if (hasVectorSearch) {
                    console.log("🔍 Using multi-collection vector search for:", Object.keys(vectorSearchEntities));

                    try {
                        const vectorSearchResponse = await fetch('http://72.60.44.41:8000/multi_search', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                entities: vectorSearchEntities,
                                location: lat !== null && lon !== null ? { lat, lon } : null
                            })
                        });
                        
                        if (!vectorSearchResponse.ok) {
                            throw new Error(`Vector search API returned ${vectorSearchResponse.status}`);
                        }
                        
                        const vectorSearchRes = await vectorSearchResponse.json();
                        console.log("Vector search results:", vectorSearchRes?.summary || vectorSearchRes);

                        // Process Services results
                        if (vectorSearchRes.results?.services?.length > 0) {
                            const serviceIds = vectorSearchRes.results.services.map(r => r.id);
                            const services = await prisma.service.findMany({
                                where: { id: { in: serviceIds } },
                                select: {
                                    id: true, ownerUser: true, city: true, price: true,
                                    shop: true, phone: true, translation: true,
                                    reviews: true, locationLat: true, locationLon: true,
                                    design: { select: { slug: true } }
                                }
                            });

                            const servicesWithRatings = services.map(service => {
                                const reviews = Array.isArray(service.reviews) ? service.reviews : [];
                                const avgRating = reviews.length > 0
                                    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
                                    : 0;
                                return { ...service, avgRating, reviewsCount: reviews.length };
                            });

                            allResults.services = servicesWithRatings;
                            console.log(`✅ Services: ${servicesWithRatings.length} found`);
                        }

                        // Process Users results
                        if (vectorSearchRes.results?.users?.length > 0) {
                            const userIds = vectorSearchRes.results.users.map(r => r.id);
                            const users = await prisma.user.findMany({
                                where: {
                                    AND: [
                                        { id: { in: userIds } },
                                        { role: entities_to_use.users.role_filter || "PROVIDER" },
                                        { deletedAt: null }
                                    ]
                                },
                                select: {
                                    id: true, name: true, bio: true, phone: true,
                                    profilePic: true, role: true, isVerified: true,
                                    verifiedBadge: true,
                                    services: {
                                        select: {
                                            id: true,
                                            translation: { select: { name_ar: true, name_en: true } }
                                        },
                                        take: 3
                                    },
                                    _count: { select: { services: true, reviews: true } }
                                }
                            });

                            allResults.users = users;
                            console.log(`✅ Users: ${users.length} found`);
                        }

                        // Process Shops results
                        if (vectorSearchRes.results?.shops?.length > 0) {
                            const shopIds = vectorSearchRes.results.shops.map(r => r.id);
                            const shops = await prisma.shop.findMany({
                                where: {
                                    AND: [
                                        { id: { in: shopIds } },
                                        { deletedAt: null }
                                    ]
                                },
                                select: {
                                    id: true, name: true, description: true, phone: true,
                                    city: true, website: true, locationLat: true, locationLon: true,
                                    isVerified: true,
                                    owner: { select: { name: true } },
                                    services: {
                                        select: {
                                            id: true,
                                            translation: { select: { name_ar: true } }
                                        },
                                        take: 3
                                    },
                                    _count: { select: { services: true, products: true, reviews: true } }
                                }
                            });

                            allResults.shops = shops;
                            console.log(`✅ Shops: ${shops.length} found`);
                        }

                        // Process Products results
                        if (vectorSearchRes.results?.products?.length > 0) {
                            const productIds = vectorSearchRes.results.products.map(r => r.id);
                            const products = await prisma.product.findMany({
                                where: {
                                    AND: [
                                        { id: { in: productIds } },
                                        { isActive: true },
                                        { deletedAt: null }
                                    ]
                                },
                                select: {
                                    id: true, name: true, description: true, price: true,
                                    currency: true, stock: true, sku: true,
                                    shop: {
                                        select: {
                                            id: true, name: true, city: true, phone: true,
                                            locationLat: true, locationLon: true
                                        }
                                    },
                                    reviews: { select: { rating: true } },
                                    _count: { select: { reviews: true } }
                                }
                            });

                            const productsWithRatings = products.map(product => {
                                const reviews = Array.isArray(product.reviews) ? product.reviews : [];
                                const avgRating = reviews.length > 0
                                    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
                                    : 0;
                                return { ...product, avgRating, reviewsCount: reviews.length };
                            });

                            allResults.products = productsWithRatings;
                            console.log(`✅ Products: ${productsWithRatings.length} found`);
                        }

                    } catch (vectorSearchError) {
                        console.error("Multi-collection vector search error:", vectorSearchError);
                        
                        // Fallback: Try individual search calls if multi_search endpoint fails
                        if (vectorSearchError.message.includes('404')) {
                            console.log("🔄 Falling back to individual search calls...");
                            
                            for (const [entityType, config] of Object.entries(vectorSearchEntities)) {
                                if (!config.enabled) continue;
                                
                                try {
                                    const singleSearchUrl = `http://72.60.44.41:8000/search?query=${encodeURIComponent(config.query)}&limit=${config.limit}&collection=${entityType}`;
                                    const singleResponse = await fetch(singleSearchUrl);
                                    
                                    if (singleResponse.ok) {
                                        const singleResult = await singleResponse.json();
                                        console.log(`🔍 Individual ${entityType} search: ${singleResult.results?.length || 0} results`);
                                        
                                        // Process results based on entity type
                                        if (entityType === 'services' && singleResult.results?.length > 0) {
                                            const serviceIds = singleResult.results.map(r => r.id).filter(id => id);
                                            if (serviceIds.length > 0) {
                                                const services = await prisma.service.findMany({
                                                    where: { id: { in: serviceIds } },
                                                    select: {
                                                        id: true, ownerUser: true, city: true, price: true,
                                                        shop: true, phone: true, translation: true,
                                                        reviews: true, locationLat: true, locationLon: true,
                                                        design: { select: { slug: true } }
                                                    }
                                                });
                                                
                                                const servicesWithRatings = services.map(service => {
                                                    const reviews = Array.isArray(service.reviews) ? service.reviews : [];
                                                    const avgRating = reviews.length > 0
                                                        ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
                                                        : 0;
                                                    return { ...service, avgRating, reviewsCount: reviews.length };
                                                });
                                                
                                                allResults.services = servicesWithRatings;
                                                console.log(`✅ Services from fallback: ${servicesWithRatings.length} found`);
                                            }
                                        }
                                        
                                        // Add similar processing for users, shops, products if needed
                                        
                                    }
                                } catch (singleSearchError) {
                                    console.error(`Error in individual ${entityType} search:`, singleSearchError.message);
                                }
                            }
                        }
                    }
                }

                // Fallback: Database text search for entities not found via vector search
                // This handles cases where vector search fails or returns no results

                if (entities_to_use?.users?.enabled && allResults.users.length === 0) {
                    console.log("👤 Fallback: Database text search for users:", entities_to_use.users.query);

                    try {
                        const users = await prisma.user.findMany({
                            where: {
                                AND: [
                                    { role: entities_to_use.users.role_filter || "PROVIDER" },
                                    {
                                        OR: [
                                            { name: { contains: entities_to_use.users.query } },
                                            { bio: { contains: entities_to_use.users.query } }
                                        ]
                                    },
                                    { deletedAt: null }
                                ]
                            },
                            select: {
                                id: true, name: true, bio: true, phone: true,
                                profilePic: true, role: true, isVerified: true,
                                verifiedBadge: true,
                                services: {
                                    select: {
                                        id: true,
                                        translation: { select: { name_ar: true, name_en: true } }
                                    },
                                    take: 3
                                },
                                _count: { select: { services: true, reviews: true } }
                            },
                            take: 10
                        });

                        allResults.users = users;
                        console.log(`🔄 Fallback users: ${users.length} found`);
                    } catch (err) {
                        console.error("Fallback users search error:", err);
                    }
                }

                if (entities_to_use?.shops?.enabled && allResults.shops.length === 0) {
                    console.log("🏪 Fallback: Database text search for shops:", entities_to_use.shops.query);

                    try {
                        const shops = await prisma.shop.findMany({
                            where: {
                                AND: [
                                    {
                                        OR: [
                                            { name: { contains: entities_to_use.shops.query } },
                                            { description: { contains: entities_to_use.shops.query } },
                                            { city: { contains: entities_to_use.shops.query } }
                                        ]
                                    },
                                    { deletedAt: null }
                                ]
                            },
                            select: {
                                id: true, name: true, description: true, phone: true,
                                city: true, website: true, locationLat: true, locationLon: true,
                                isVerified: true,
                                owner: { select: { name: true } },
                                services: {
                                    select: {
                                        id: true,
                                        translation: { select: { name_ar: true } }
                                    },
                                    take: 3
                                },
                                _count: { select: { services: true, products: true, reviews: true } }
                            },
                            take: 10
                        });

                        allResults.shops = shops;
                        console.log(`🔄 Fallback shops: ${shops.length} found`);
                    } catch (err) {
                        console.error("Fallback shops search error:", err);
                    }
                }

                if (entities_to_use?.products?.enabled && allResults.products.length === 0) {
                    console.log("📦 Fallback: Database text search for products:", entities_to_use.products.query);

                    try {
                        const products = await prisma.product.findMany({
                            where: {
                                AND: [
                                    {
                                        OR: [
                                            { name: { contains: entities_to_use.products.query } },
                                            { description: { contains: entities_to_use.products.query } },
                                            { embeddingText: { contains: entities_to_use.products.query } }
                                        ]
                                    },
                                    { isActive: true },
                                    { deletedAt: null }
                                ]
                            },
                            select: {
                                id: true, name: true, description: true, price: true,
                                currency: true, stock: true, sku: true,
                                shop: {
                                    select: {
                                        id: true, name: true, city: true, phone: true,
                                        locationLat: true, locationLon: true
                                    }
                                },
                                reviews: { select: { rating: true } },
                                _count: { select: { reviews: true } }
                            },
                            take: 10
                        });

                        const productsWithRatings = products.map(product => {
                            const reviews = Array.isArray(product.reviews) ? product.reviews : [];
                            const avgRating = reviews.length > 0
                                ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
                                : 0;
                            return { ...product, avgRating, reviewsCount: reviews.length };
                        });

                        allResults.products = productsWithRatings;
                        console.log(`🔄 Fallback products: ${products.length} found`);
                    } catch (err) {
                        console.error("Fallback products search error:", err);
                    }
                }

                // Calculate totals
                const totalResults = allResults.users.length + allResults.services.length +
                    allResults.shops.length + allResults.products.length;

                console.log(`Total results found: ${totalResults}`);

                if (totalResults > 0) {
                    // Flatten all results for AI processing
                    const flattenedResults = [
                        ...allResults.services.map(r => ({ ...r, entityType: 'service' })),
                        ...allResults.users.map(r => ({ ...r, entityType: 'user' })),
                        ...allResults.shops.map(r => ({ ...r, entityType: 'shop' })),
                        ...allResults.products.map(r => ({ ...r, entityType: 'product' }))
                    ];

                    console.log(`🔄 Processing ${flattenedResults.length} results with AI...`);

                    // Process results with AI
                    let processedData;
                    try {
                        processedData = await processResults(flattenedResults, search_text, search_type);
                        console.log(`✅ AI processing complete: ${processedData.processedResults.length} processed, ${processedData.dynamicFilters.length} filters generated`);
                    } catch (processError) {
                        console.error("❌ Error processing results with AI:", processError);
                        // Continue without processed data if AI processing fails
                        processedData = null;
                    }

                    // Create search cache for multi-entity results
                    let searchCacheId = null;
                    try {
                        const uniqueSlug = await generateSearchSlug(search_text);
                        const searchCache = await prisma.searchCache.create({
                            data: {
                                query: search_text,
                                slug: uniqueSlug,
                                description: `${search_type} search: "${search_text}"`,
                                metadata: {
                                    search_type,
                                    entities_searched: Object.keys(entities_to_use || {}).filter(k => entities_to_use[k]?.enabled),
                                    location: lat !== null && lon !== null ? { lat, lon } : null,
                                    timestamp: new Date().toISOString(),
                                    total_results: totalResults,
                                    ai_processed: processedData ? true : false,
                                    // Store enhanced multi-entity results in metadata
                                    enhanced_results: allResults,
                                    result_summary: {
                                        users: allResults.users.length,
                                        services: allResults.services.length,
                                        shops: allResults.shops.length,
                                        products: allResults.products.length,
                                        total: totalResults
                                    },
                                    // Store processed data if available
                                    ...(processedData && {
                                        processed_results: processedData.processedResults,
                                        dynamic_filters: processedData.dynamicFilters,
                                        ai_summary: processedData.summary
                                    })
                                },
                                // For legacy compatibility, still store service results in the relation
                                services: allResults.services.length > 0 ? {
                                    create: allResults.services.map((service, index) => ({
                                        serviceId: service.id,
                                        position: index,
                                        relevanceScore: 1.0 - (index * 0.01)
                                    }))
                                } : undefined
                            }
                        });
                        searchCacheId = searchCache.id;
                        console.log(`Created multi-entity search cache: ${searchCache.slug}`);
                    } catch (cacheError) {
                        console.error("Error creating search cache:", cacheError);
                    }

                    // Emit multi-entity results to frontend with processed data
                    const responsePayload = {
                        search_type,
                        results: allResults, // Keep original results for backwards compatibility
                        cache: searchCacheId ? {
                            id: searchCacheId,
                            shareUrl: `${process.env.FRONTEND_URL || 'https://www.daleelbalady.com'}/search?id=${searchCacheId}`
                        } : null,
                        summary: {
                            users: allResults.users.length,
                            services: allResults.services.length,
                            shops: allResults.shops.length,
                            products: allResults.products.length,
                            total: totalResults
                        }
                    };

                    // Add processed data if available
                    if (processedData) {
                        responsePayload.processedResults = processedData.processedResults;
                        responsePayload.dynamicFilters = processedData.dynamicFilters;
                        responsePayload.aiSummary = processedData.summary;
                    }

                    socket.emit("multi_search_results", responsePayload);
                    
                    // Send AI response to complete the conversation
                    const aiSummaryMessage = totalResults > 0 
                        ? `تم العثور على ${totalResults} نتيجة${processedData ? ' مع فلاتر ذكية' : ''}. يمكنك استخدام الفلاتر لتصفية النتائج حسب نوع الخدمة والجودة.`
                        : "لم أعثر على نتائج مطابقة لبحثك. حاول استخدام كلمات مفتاحية مختلفة.";
                    
                    socket.emit("ai_message", {
                        function: "reply_to_user",
                        parameters: { message: aiSummaryMessage }
                    });
                } else {
                    // No results found - send empty results
                    socket.emit("multi_search_results", {
                        search_type,
                        results: allResults,
                        cache: null,
                        summary: {
                            users: 0, services: 0, shops: 0, products: 0, total: 0
                        }
                    });
                    
                    // Send AI response for no results
                    socket.emit("ai_message", {
                        function: "reply_to_user",
                        parameters: { message: "لم أعثر على نتائج مطابقة لبحثك. حاول استخدام كلمات مفتاحية مختلفة أو توسيع نطاق البحث." }
                    });
                }

                // Push function response for AI context (simplified)
                contents.push(generate_function_reply({
                    total_results: totalResults,
                    entities_found: Object.keys(allResults).filter(k => k !== 'metadata' && allResults[k].length > 0)
                }, "multi_entity_search"));

                continueLoop = false; // Stop after multi-entity search
                console.log("✅ Multi-entity search completed");
                break; // Explicitly break out of the loop
            }

            // Legacy support for old query_category format
            else if (functionCall.function === "query_category") {
                console.log("🔍 Processing legacy query_category function");
                const { query, city, limit } = functionCall.parameters || {};

                // Use location if available
                let lat = null, lon = null;
                if (socket.data?.userLocation?.lat && socket.data.userLocation?.lon) {
                    lat = socket.data.userLocation.lat;
                    lon = socket.data.userLocation.lon;
                }

                // If location missing, request from frontend
                if (lat === null || lon === null) {
                    socket.emit("request_location");
                    const locStr = await waitForLocationFromSocket(socket);
                    if (locStr) {
                        const [latStr, lonStr] = locStr.split(",");
                        lat = parseFloat(latStr);
                        lon = parseFloat(lonStr);
                    }
                }

                // Build search URL safely
                const params = new URLSearchParams();
                if (query) params.append("query", query);
                if (limit) params.append("limit", limit);
                if (lat !== null && lon !== null) {
                    params.append("lat", lat);
                    params.append("lon", lon);
                }

                const searchUrl = `http://72.60.44.41:8000/search?${params.toString()}`;
                console.log("Calling search API:", searchUrl);

                let searchRes;
                try {
                    searchRes = await fetch(searchUrl).then((res) => res.json());
                } catch (err) {
                    console.error("Search API error:", err);
                    searchRes = { results: [] };
                }

                // console.log("searchRes:", searchRes);

                const results = Array.isArray(searchRes?.results) ? searchRes.results : [];
                if (results.length > 0) {
                    const prisma = new PrismaClient();
                    const services = await prisma.service.findMany({
                        where: {
                            id: { in: results.map(r => r.id) }
                        },
                        select: {
                            id: true,
                            ownerUser: true,
                            city: true,
                            price: true,
                            shop: true,
                            phone: true,
                            translation: true,
                            reviews: true,
                            locationLat: true,
                            locationLon: true,
                            design: { select: { slug: true } }
                        }
                    });

                    // Calculate average ratings for all services
                    const servicesWithRatings = services.map(service => {
                        const reviews = Array.isArray(service.reviews) ? service.reviews : [];
                        const avgRating = reviews.length > 0
                            ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
                            : 0;

                        return {
                            ...service,
                            avgRating,
                            reviewsCount: reviews.length
                        };
                    });

                    // Sort by average rating first, then by reviews count, then pick top 3
                    const topServices = [...servicesWithRatings]
                        .sort((a, b) => {
                            // First sort by average rating (descending)
                            if (b.avgRating !== a.avgRating) {
                                return b.avgRating - a.avgRating;
                            }
                            // Then by reviews count (descending)
                            return b.reviewsCount - a.reviewsCount;
                        })
                        .slice(0, 3);

                    // console.log("Top recommended services:", topServices);

                    // Merge top recommended services and the rest, avoiding duplicates
                    const topServiceIds = topServices.map(service => service.id);
                    const nonTopServices = servicesWithRatings.filter(service => !topServiceIds.includes(service.id));
                    const mergedResults = [
                        ...topServices.map(service => ({ ...service, isRecommended: true })),
                        ...nonTopServices
                    ];

                    // Create search cache for this query
                    let searchCacheId = null;
                    try {
                        // Generate unique slug with retry logic
                        let uniqueSlug;
                        let attempts = 0;
                        const maxAttempts = 5;

                        do {
                            const baseSlug = await generateSearchSlug(query || msg);
                            uniqueSlug = attempts > 0 ? `${baseSlug}-${attempts}` : baseSlug;
                            attempts++;

                            // Check if slug exists
                            const existingCache = await prisma.searchCache.findUnique({
                                where: { slug: uniqueSlug }
                            });

                            if (!existingCache) {
                                break; // Slug is unique, proceed
                            }
                        } while (attempts < maxAttempts);

                        // If we couldn't find a unique slug after max attempts, use timestamp
                        if (attempts >= maxAttempts) {
                            uniqueSlug = `search-${Date.now()}`;
                        }

                        const searchCache = await prisma.searchCache.create({
                            data: {
                                query: query || msg,
                                slug: uniqueSlug,
                                description: `Search results for "${query || msg}"${city ? ` in ${city}` : ''}`,
                                metadata: {
                                    originalQuery: query,
                                    city: city,
                                    location: lat !== null && lon !== null ? { lat, lon } : null,
                                    timestamp: new Date().toISOString(),
                                    resultCount: mergedResults.length
                                },
                                services: {
                                    create: mergedResults.map((service, index) => ({
                                        serviceId: service.id,
                                        position: index,
                                        relevanceScore: service.isRecommended ? 1.0 : 0.8 - (index * 0.01)
                                    }))
                                }
                            },
                            select: {
                                id: true,
                                slug: true
                            }
                        });
                        searchCacheId = searchCache.id;
                        console.log(`Created search cache: ${searchCache.slug} (${searchCacheId})`);
                    } catch (cacheError) {
                        console.error("Error creating search cache:", cacheError);
                        // If it's still a uniqueness error, try with timestamp
                        if (cacheError.code === 'P2002') {
                            try {
                                const fallbackSlug = `search-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                                const searchCache = await prisma.searchCache.create({
                                    data: {
                                        query: query || msg,
                                        slug: fallbackSlug,
                                        description: `Search results for "${query || msg}"${city ? ` in ${city}` : ''}`,
                                        metadata: {
                                            originalQuery: query,
                                            city: city,
                                            location: lat !== null && lon !== null ? { lat, lon } : null,
                                            timestamp: new Date().toISOString(),
                                            resultCount: mergedResults.length
                                        },
                                        services: {
                                            create: mergedResults.map((service, index) => ({
                                                serviceId: service.id,
                                                position: index,
                                                relevanceScore: service.isRecommended ? 1.0 : 0.8 - (index * 0.01)
                                            }))
                                        }
                                    },
                                    select: {
                                        id: true,
                                        slug: true
                                    }
                                });
                                searchCacheId = searchCache.id;
                                console.log(`Created search cache with fallback slug: ${searchCache.slug} (${searchCacheId})`);
                            } catch (fallbackError) {
                                console.error("Failed to create search cache even with fallback:", fallbackError);
                                // Continue without cache
                            }
                        }
                        // Continue without cache - don't fail the search
                    }

                    // Emit results with cache info
                    socket.emit("search_results", {
                        results: mergedResults,
                        cache: searchCacheId ? {
                            id: searchCacheId,
                            shareUrl: `${process.env.FRONTEND_URL || 'https://www.daleelbalady.com'}/search?id=${searchCacheId}`
                        } : null
                    });
                } else {
                    socket.emit("ai_message", {
                        function: "reply_to_user",
                        parameters: { message: summarizeSearchFallback(searchRes) },
                    });
                }

                // push function response so Gemini can summarize
                contents.push(generate_function_reply(searchRes, "query_category"));
                console.log("✅ Legacy query_category completed");
            }

            // Handle unknown functions
            else {
                console.log("⚠️ Unknown function:", functionCall.function);
                socket.emit("ai_message", {
                    function: "reply_to_user",
                    parameters: { message: `⚠️ Unknown function: ${functionCall.function}` },
                });
                continueLoop = false;
                break;
            }

            console.log("🔄 End of processing loop", loopCount);
        }

        if (loopCount >= maxLoops) {
            console.log("⚠️ Max loops reached, terminating");
            socket.emit("ai_message", {
                function: "reply_to_user",
                parameters: { message: "⚠️ Processing limit reached. Please try again." },
            });
        }

    } catch (err) {
        console.error("handle_ai loop error:", err);
        socket.emit("ai_message", {
            function: "reply_to_user",
            parameters: { message: "⚠️ Internal AI error." },
        });
    }
};

// wait for location
function waitForLocationFromSocket(socket, timeoutMs = 15000) {
    return new Promise((resolve) => {
        let resolved = false;

        if (socket.data?.userLocation?.lat && socket.data?.userLocation?.lon) {
            resolved = true;
            return resolve(`${socket.data.userLocation.lat},${socket.data.userLocation.lon}`);
        }

        function onLoc() {
            const newLoc = socket.data?.userLocation;
            if (newLoc?.lat && newLoc?.lon) {
                cleanup();
                resolved = true;
                return resolve(`${newLoc.lat},${newLoc.lon}`);
            }
        }

        function cleanup() {
            socket.off("location_response", onLoc);
        }

        socket.on("location_response", onLoc);

        setTimeout(() => {
            if (!resolved) {
                cleanup();
                resolve(null);
            }
        }, timeoutMs);
    });
}

function summarizeSearchFallback(searchRes) {
    try {
        const hits = Array.isArray(searchRes?.results) ? searchRes.results.slice(0, 3) : [];
        if (!hits || hits.length === 0) {
            return "لم أجد نتائج مناسبة الآن. تحب أبحث في منطقة أُخرى؟";
        }
        const lines = hits.map((h, i) => {
            const name = h.name || h.title || "غير معروف";
            const phone = h.phone ? `📞 ${h.phone}` : "";
            return `${i + 1}. ${name} ${phone}`;
        });
        return `لقيت لك بعض النتائج: \n${lines.join("\n")}\nتحب أعرضلك تفاصيل أكتر؟`;
    } catch {
        return "وجدت نتائج، لكن حصلت مشكلة في عرضها. تحب أعيد المحاولة؟";
    }
}

// Helper function to generate unique search slug
async function generateSearchSlug(query) {
    const { PrismaClient } = await import("../generated/prisma/client.js");
    const prisma = new PrismaClient();

    try {
        // Create base slug from query
        let baseSlug = query
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '') // Allow Arabic characters
            .replace(/\s+/g, '-')
            .slice(0, 50);

        if (!baseSlug) {
            baseSlug = 'search';
        }

        let counter = 0;
        let uniqueSlug = baseSlug;

        // Check for uniqueness
        while (true) {
            const existing = await prisma.searchCache.findUnique({
                where: { slug: uniqueSlug }
            });

            if (!existing) {
                break;
            }

            counter++;
            uniqueSlug = `${baseSlug}-${counter}`;
        }

        return uniqueSlug;
    } catch (error) {
        console.error("Error generating search slug:", error);
        // Fallback to timestamp-based slug
        return `search-${Date.now()}`;
    } finally {
        await prisma.$disconnect();
    }
}
