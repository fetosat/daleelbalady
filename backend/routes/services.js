import express from 'express';
import { prisma } from '../lib/db.js';

const router = express.Router();


// Helper function to format duration from minutes to readable format
const formatDuration = (durationMins, isRTL = false) => {
  if (!durationMins) return null;
  
  const hours = Math.floor(durationMins / 60);
  const minutes = durationMins % 60;
  
  if (isRTL) {
    if (hours && minutes) return `${hours} ساعة و ${minutes} دقيقة`;
    if (hours) return `${hours} ساعة`;
    return `${minutes} دقيقة`;
  } else {
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
  }
};

// GET /api/services/provider - Get all services for authenticated provider
router.get('/provider', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const jwt = (await import('jsonwebtoken')).default;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId;
    const { page = 1, limit = 20, search, status } = req.query;

    console.log(`🛠️ Fetching services for provider ${userId}`);

    // Build where clause
    const whereClause = {
      ownerUserId: userId,
      deletedAt: null
    };

    if (search) {
      whereClause.OR = [
        { translation: { name_en: { contains: search } } },
        { translation: { name_ar: { contains: search } } },
        { translation: { description_en: { contains: search } } },
        { translation: { description_ar: { contains: search } } }
      ];
    }

    if (status === 'active') {
      whereClause.available = true;
    } else if (status === 'inactive') {
      whereClause.available = false;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        translation: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        category: true,
        reviews: {
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const totalServices = await prisma.service.count({
      where: whereClause
    });

    console.log(`✅ Found ${totalServices} services for provider ${userId}`);

    if (totalServices === 0) {
      return res.json({
        success: true,
        services: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    // Calculate stats for each service
    const servicesWithStats = services.map(service => {
      const totalReviews = service.reviews.length;
      const avgRating = totalReviews > 0
        ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      // Parse images
      let images = [];
      if (service.images) {
        try {
          images = typeof service.images === 'string' ? JSON.parse(service.images) : service.images;
        } catch (e) {
          console.error('Failed to parse service images:', e);
        }
      }

      return {
        id: service.id,
        vid: service.vid,
        name: service.translation?.name_en || service.translation?.name_ar || 'Untitled',
        translation: service.translation,
        description: service.translation?.description_en || service.translation?.description_ar || '',
        price: service.price,
        currency: service.currency || 'EGP',
        durationMins: service.durationMins,
        city: service.city,
        coverImage: service.coverImage || images[0],
        images: images,
        available: service.available,
        shopId: service.shopId,
        shop: service.shop,
        category: service.category,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        stats: {
          views: 0, // This would come from analytics
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews,
          totalBookings: service._count.bookings
        }
      };
    });

    res.json({
      success: true,
      services: servicesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalServices,
        pages: Math.ceil(totalServices / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching provider services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
});

// GET /api/services/:id - Get service by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.log(`Invalid UUID format: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }
    
    console.log(`Fetching service with ID: ${id}`);

    // Fetch the service with all required relations based on frontend needs
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        translation: true,
        design: {
          select: {
            id: true,
            name: true,
            description: true,
            slug: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        subCategory: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        ownerUser: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true,
            phone: true,
            email: true,
            bio: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            locationLat: true,
            locationLon: true,
            phone: true,
            isVerified: true,
            _count: {
              select: {
                services: true,
                products: true,
                reviews: true
              }
            }
          }
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profilePic: true,
                isVerified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      // Select scalar fields (including image fields if present in schema)
      select: undefined
    });

    if (!service) {
      console.log(`Service not found for ID: '${id}'`);
      return res.status(404).json({
        success: false,
        message: `Service not found for ID: ${id}`
      });
    }
    
    if (service.deletedAt) {
      console.log(`Service ${id} is deleted`);
      return res.status(410).json({
        success: false,
        message: 'Service is no longer available'
      });
    }
    
    console.log(`Found service: ${service.translation?.name_en || service.translation?.name_ar || 'Unknown'} (id: ${service.id})`);

    // Calculate service statistics
    const totalReviews = service._count.reviews;
    const avgRating = service.reviews.length > 0 
      ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
      : 0;

    // Format reviews to match frontend expectations (change 'author' to 'user' for frontend compatibility)
    const formattedReviews = service.reviews.map(review => ({
      ...review,
      user: review.author // Frontend expects 'user' field
    }));

    // Normalize images
    const gallery = Array.isArray(service.galleryImages) ? service.galleryImages : [];
    const images = Array.isArray(service.images) ? service.images : gallery;
    const coverImage = service.coverImage || images?.[0] || null;
    const logoImage = service.logoImage || null;

    // Prepare response data exactly matching frontend ServiceData interface
    const serviceData = {
      id: service.id,
      vid: service.vid,
      name: service.translation?.name_en || service.translation?.name_ar || 'Unknown Service',
      description: service.translation?.description_en || service.translation?.description_ar || '',
      translation: service.translation,
      price: service.price,
      currency: service.currency || 'EGP',
      duration: formatDuration(service.durationMins), // Format duration for display
      durationMins: service.durationMins,
      coverImage,
      logoImage,
      images,
      city: service.city,
      locationLat: service.locationLat,
      locationLon: service.locationLon,
      available: service.available,
      isVerified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
      verifiedBadge: service.ownerUser?.isVerified ? 'verified' : null,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
      reviews: formattedReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewsCount: totalReviews,
      
      // Design system - Critical for frontend rendering logic
      design: service.design,
      
      // Category information - return all categories for tags display
      categories: service.category || [],
      category: service.category?.length > 0 ? service.category[0] : null,
      subCategory: service.subCategory || null,
      
      // Provider information
      ownerUser: service.ownerUser,
      
      // Shop information
      shop: service.shop,
      
      // Enhanced metadata that matches frontend expectations
      priority: service.design?.slug === 'medical' ? 8 : 5, // Numeric priority for PriorityIndicator component
      filterTags: [],
      isRecommended: avgRating >= 4.5,
      metadata: {
        specialty: service.category?.length > 0 ? service.category[0].name : null,
        availability: service.available ? 'available' : 'unavailable',
        price: service.price ? `${service.price} ${service.currency || 'EGP'}` : null,
        isRecommended: avgRating >= 4.5,
        isVerified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
        categoryCode: service.category?.length > 0 ? service.category[0].slug : null,
        designSlug: service.design?.slug
      },
      
      // Statistics that frontend expects
      stats: {
        totalBookings: service._count.bookings,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: totalReviews,
        availability: service.available ? 'Available' : 'Unavailable',
        isVerified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
        memberSince: service.createdAt.toISOString()
      }
    };

    res.json({
      success: true,
      service: serviceData
    });

  } catch (error) {
    console.error('Error fetching service by ID:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/services/:id - Update a service (requires auth)
router.put('/:id', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const jwt = (await import('jsonwebtoken')).default;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId;
    const { id } = req.params;
    const { name, description, city, price, currency, durationMins, coverImage, shopId, available } = req.body;

    console.log(`🛠️ Updating service ${id} for user ${userId}`);

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        ownerUserId: userId,
        deletedAt: null
      },
      include: {
        translation: true
      }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found or you do not have permission to edit it'
      });
    }

    // Update translation if name or description changed
    if ((name || description) && existingService.translation) {
      await prisma.service_translation.update({
        where: { id: existingService.translation.id },
        data: {
          ...(name && { name_en: name, name_ar: name }), // For now, use same name for both languages
          ...(description && { description_en: description, description_ar: description })
        }
      });
    }

    // Update the service
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(city && { city }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(durationMins !== undefined && { durationMins: parseInt(durationMins) }),
        ...(coverImage !== undefined && { coverImage }),
        ...(shopId !== undefined && shopId ? { shopId } : {}),
        ...(available !== undefined && { available })
      },
      include: {
        translation: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        category: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });

    console.log(`✅ Service updated successfully: ${service.id}`);

    res.json({
      success: true,
      service
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service'
    });
  }
});

// GET /api/services/:id/reviews - Get service reviews (public route)
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, translation: true }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const reviews = await prisma.review.findMany({
      where: { serviceId: id },
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerified: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { serviceId: id }
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching service reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/services - Get all services with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      city, 
      category, 
      minPrice, 
      maxPrice, 
      verified, 
      available = true,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      available: available === 'true',
      deletedAt: null,
      ...(city && { city: { contains: city } }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      // Note: Service doesn't have isVerified, we filter by owner/shop verification in query
      ...(verified === 'true' && { 
        OR: [
          { ownerUser: { isVerified: true } },
          { shop: { isVerified: true } }
        ]
      })
    };

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = order;

    const services = await prisma.service.findMany({
      where,
      select: {
        id: true,
        vid: true,
        translation: {
          select: {
            name_en: true,
            name_ar: true,
            description_en: true,
            description_ar: true
          }
        },
        price: true,
        currency: true,
        city: true,
        available: true,
        createdAt: true,
        ownerUser: {
          select: {
            id: true,
            name: true,
            isVerified: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: parseInt(limit)
    });

    const totalServices = await prisma.service.count({ where });

    res.json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalServices,
        pages: Math.ceil(totalServices / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Debug endpoint to check if services exist and test database connection
router.get('/debug/count', async (req, res) => {
  try {
    const totalServices = await prisma.service.count();
    const availableServices = await prisma.service.count({
      where: { available: true, deletedAt: null }
    });
    
    // Get a few sample services
    const sampleServices = await prisma.service.findMany({
      take: 5,
      select: {
        id: true,
        translation: {
          select: {
            name_en: true,
            name_ar: true
          }
        },
        available: true,
        createdAt: true
      }
    });
    
    res.json({
      success: true,
      stats: {
        totalServices,
        availableServices,
        sampleServices
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
});

export default router;
