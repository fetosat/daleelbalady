// routes/searchCache.js
import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { z } from "zod";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const CreateSearchCacheSchema = z.object({
  query: z.string().min(1).max(500),
  description: z.string().max(1000).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-_]+$/, "Slug can only contain letters, numbers, hyphens, and underscores"),
  serviceIds: z.array(z.string().uuid()).min(1).max(100),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
});

const UpdateSearchCacheSchema = z.object({
  query: z.string().min(1).max(500).optional(),
  description: z.string().max(1000).optional(),
  serviceIds: z.array(z.string().uuid()).min(1).max(100).optional(),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Utility function to generate unique slug
const generateUniqueSlug = async (baseSlug, query) => {
  let slug = baseSlug || query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);

  let counter = 0;
  let uniqueSlug = slug;

  while (true) {
    const existing = await prisma.searchCache.findUnique({
      where: { slug: uniqueSlug }
    });

    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
};

// Create a new search cache
router.post("/", async (req, res) => {
  try {
    const validatedData = CreateSearchCacheSchema.parse(req.body);

    // Generate unique slug if not provided or if provided slug exists
    const slug = await generateUniqueSlug(validatedData.slug, validatedData.query);

    // Verify all services exist
    const services = await prisma.service.findMany({
      where: {
        id: { in: validatedData.serviceIds },
        deletedAt: null
      },
      select: { id: true }
    });

    if (services.length !== validatedData.serviceIds.length) {
      return res.status(400).json({
        error: "Some services not found or are deleted"
      });
    }

    // Create search cache with services
    const searchCache = await prisma.searchCache.create({
      data: {
        slug,
        query: validatedData.query,
        description: validatedData.description,
        metadata: validatedData.metadata,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        services: {
          create: validatedData.serviceIds.map((serviceId, index) => ({
            serviceId,
            position: index,
            relevanceScore: 1.0 - (index * 0.01) // Slightly decrease relevance with position
          }))
        }
      },
      include: {
        services: {
          include: {
            service: {
              include: {
                translation: true,
                shop: true,
                reviews: {
                  select: {
                    rating: true
                  }
                }
              }
            }
          },
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      searchCache: {
        id: searchCache.id,
        slug: searchCache.slug,
        query: searchCache.query,
        description: searchCache.description,
        metadata: searchCache.metadata,
        viewCount: searchCache.viewCount,
        createdAt: searchCache.createdAt,
        expiresAt: searchCache.expiresAt,
        services: searchCache.services.map(sc => ({
          ...sc.service,
          relevanceScore: sc.relevanceScore,
          position: sc.position
        }))
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }

    console.error("Error creating search cache:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get search cache by ID or slug
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { incrementView = 'true' } = req.query;

    // Determine if identifier is UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const whereClause = isUuid ? { id: identifier } : { slug: identifier };

    // Check if cache exists and is not expired
    var searchCache = await prisma.searchCache.findUnique({
      where: whereClause,
      include: {
        services: {
          select: {
            service: {
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
            }, createdAt: true, relevanceScore: true, position: true, searchCacheId: true, serviceId: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });






    const services = searchCache ? searchCache.services : [];

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








    if (!searchCache) {
      return res.status(404).json({
        error: "Search cache not found"
      });
    }

    // Check expiration
    if (searchCache.expiresAt && new Date() > searchCache.expiresAt) {
      return res.status(410).json({
        error: "Search cache has expired"
      });
    }

    // Increment view count if requested
    if (incrementView === 'true') {
      await prisma.searchCache.update({
        where: { id: searchCache.id },
        data: { viewCount: { increment: 1 } }
      });
    }

    // Check if this is a multi-entity search cache (has enhanced results in metadata)
    const isMultiEntityCache = searchCache.metadata && 
      (searchCache.metadata.search_type || searchCache.metadata.entities_searched || searchCache.metadata.ai_processed);
    
    if (isMultiEntityCache && searchCache.metadata.enhanced_results) {
      // Return enhanced multi-entity results from metadata
      console.log('📊 Returning multi-entity search cache results');
      
      res.json({
        success: true,
        searchCache: {
          id: searchCache.id,
          slug: searchCache.slug,
          query: searchCache.query,
          description: searchCache.description,
          metadata: searchCache.metadata,
          viewCount: incrementView === 'true' ? searchCache.viewCount + 1 : searchCache.viewCount,
          createdAt: searchCache.createdAt,
          expiresAt: searchCache.expiresAt,
          // Multi-entity results from metadata
          results: searchCache.metadata.enhanced_results,
          // Enhanced data if available
          processedResults: searchCache.metadata.processed_results,
          dynamicFilters: searchCache.metadata.dynamic_filters,
          aiSummary: searchCache.metadata.ai_summary,
          searchType: searchCache.metadata.search_type,
          summary: searchCache.metadata.result_summary
        }
      });
    } else {
      // Legacy: Return services-only results
      console.log('📊 Returning legacy services-only search cache results');
      
      res.json({
        success: true,
        searchCache: {
          id: searchCache.id,
          slug: searchCache.slug,
          query: searchCache.query,
          description: searchCache.description,
          metadata: searchCache.metadata,
          viewCount: incrementView === 'true' ? searchCache.viewCount + 1 : searchCache.viewCount,
          createdAt: searchCache.createdAt,
          expiresAt: searchCache.expiresAt,
          services: mergedResults.map(sc => ({
            ...sc,
            relevanceScore: sc.relevanceScore,
            position: sc.position
          }))
        }
      });
    }

  } catch (error) {
    console.error("Error fetching search cache:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update search cache (only if not expired)
router.put("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const validatedData = UpdateSearchCacheSchema.parse(req.body);

    // Determine if identifier is UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const whereClause = isUuid ? { id: identifier } : { slug: identifier };

    // Check if cache exists and is not expired
    const existingCache = await prisma.searchCache.findUnique({
      where: whereClause
    });

    if (!existingCache) {
      return res.status(404).json({
        error: "Search cache not found"
      });
    }

    if (existingCache.expiresAt && new Date() > existingCache.expiresAt) {
      return res.status(410).json({
        error: "Cannot update expired search cache"
      });
    }

    // Update data
    const updateData = {
      ...(validatedData.query && { query: validatedData.query }),
      ...(validatedData.description !== undefined && { description: validatedData.description }),
      ...(validatedData.metadata !== undefined && { metadata: validatedData.metadata }),
      ...(validatedData.expiresAt && { expiresAt: new Date(validatedData.expiresAt) }),
      updatedAt: new Date()
    };

    // Handle service updates if provided
    if (validatedData.serviceIds) {
      // Verify all services exist
      const services = await prisma.service.findMany({
        where: {
          id: { in: validatedData.serviceIds },
          deletedAt: null
        },
        select: { id: true }
      });

      if (services.length !== validatedData.serviceIds.length) {
        return res.status(400).json({
          error: "Some services not found or are deleted"
        });
      }

      // Update services in transaction
      const searchCache = await prisma.$transaction(async (tx) => {
        // Delete existing service relations
        await tx.searchCacheService.deleteMany({
          where: { searchCacheId: existingCache.id }
        });

        // Update search cache
        const updated = await tx.searchCache.update({
          where: { id: existingCache.id },
          data: updateData
        });

        // Create new service relations
        await tx.searchCacheService.createMany({
          data: validatedData.serviceIds.map((serviceId, index) => ({
            searchCacheId: existingCache.id,
            serviceId,
            position: index,
            relevanceScore: 1.0 - (index * 0.01)
          }))
        });

        return updated;
      });

      // Fetch updated cache with services
      const updatedCache = await prisma.searchCache.findUnique({
        where: { id: searchCache.id },
        include: {
          services: {
            include: {
              service: {
                include: {
                  translation: true,
                  shop: true,
                  reviews: {
                    select: {
                      rating: true
                    }
                  }
                }
              }
            },
            orderBy: { position: 'asc' }
          }
        }
      });

      res.json({
        success: true,
        searchCache: {
          ...updatedCache,
          services: updatedCache.services.map(sc => ({
            ...sc.service,
            relevanceScore: sc.relevanceScore,
            position: sc.position
          }))
        }
      });
    } else {
      // Update without changing services
      const searchCache = await prisma.searchCache.update({
        where: { id: existingCache.id },
        data: updateData,
        include: {
          services: {
            include: {
              service: {
                include: {
                  translation: true,
                  shop: true,
                  reviews: {
                    select: {
                      rating: true
                    }
                  }
                }
              }
            },
            orderBy: { position: 'asc' }
          }
        }
      });

      res.json({
        success: true,
        searchCache: {
          ...searchCache,
          services: searchCache.services.map(sc => ({
            ...sc.service,
            relevanceScore: sc.relevanceScore,
            position: sc.position
          }))
        }
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors
      });
    }

    console.error("Error updating search cache:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete search cache
router.delete("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    // Determine if identifier is UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const whereClause = isUuid ? { id: identifier } : { slug: identifier };

    const searchCache = await prisma.searchCache.findUnique({
      where: whereClause
    });

    if (!searchCache) {
      return res.status(404).json({
        error: "Search cache not found"
      });
    }

    await prisma.searchCache.delete({
      where: { id: searchCache.id }
    });

    res.json({
      success: true,
      message: "Search cache deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting search cache:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List search caches (with pagination)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      query,
      includeExpired = 'false'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      ...(query && {
        OR: [
          { query: { contains: query } },
          { description: { contains: query } },
          { slug: { contains: query } }
        ]
      }),
      ...(includeExpired !== 'true' && {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      })
    };

    const [searchCaches, totalCount] = await Promise.all([
      prisma.searchCache.findMany({
        where: whereClause,
        include: {
          services: {
            select: {
              service: {
                select: {
                  id: true,
                  translation: {
                    select: {
                      name_en: true,
                      name_ar: true
                    }
                  }
                }
              }
            },
            take: 3 // Only include first 3 services for list view
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              services: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.searchCache.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      searchCaches: searchCaches.map(cache => ({
        id: cache.id,
        slug: cache.slug,
        query: cache.query,
        description: cache.description,
        viewCount: cache.viewCount,
        serviceCount: cache._count.services,
        sampleServices: cache.services.map(s => s.service),
        createdBy: cache.createdBy,
        createdAt: cache.createdAt,
        expiresAt: cache.expiresAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error listing search caches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cleanup expired caches (utility endpoint)
router.delete("/cleanup/expired", async (req, res) => {
  try {
    const result = await prisma.searchCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: `Deleted ${result.count} expired search caches`
    });

  } catch (error) {
    console.error("Error cleaning up expired caches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
