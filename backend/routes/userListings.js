import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// ================== INDEPENDENT SERVICES ROUTES ==================

// GET /api/user-listings/services - Get current user's independent services
router.get('/services', auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const services = await prisma.service.findMany({
      where: {
        ownerUserId: userId,
        listingType: 'INDEPENDENT',
        deletedAt: null
      },
      include: {
        translation: true,
        category: true,
        subCategory: true,
        tags: true,
        design: true,
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                profilePic: true
              }
            }
          }
        },
        availability: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add statistics to each service
    const servicesWithStats = services.map(service => ({
      ...service,
      stats: {
        totalBookings: service._count.bookings,
        totalReviews: service._count.reviews,
        averageRating: service.reviews.length > 0 
          ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
          : 0
      }
    }));

    res.json({
      success: true,
      services: servicesWithStats
    });

  } catch (error) {
    console.error('Error fetching user services:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/user-listings/services - Create a new independent service
router.post('/services', auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      durationMins,
      currency = 'EGP',
      phone,
      city,
      locationLat,
      locationLon,
      categoryIds,
      tags,
      designId
    } = req.body;

    // Validate required fields
    if (!name_ar || !name_en) {
      return res.status(400).json({
        success: false,
        message: 'Service name in both Arabic and English is required'
      });
    }

    // Create service translation
    const translation = await prisma.service_translation.create({
      data: {
        name_ar,
        name_en,
        description_ar: description_ar || '',
        description_en: description_en || ''
      }
    });

    // Generate embedding text for search
    const embeddingText = `${name_ar} ${name_en} ${description_ar || ''} ${description_en || ''} ${tags ? tags.join(' ') : ''}`;

    // Create the service
    const service = await prisma.service.create({
      data: {
        listingType: 'INDEPENDENT',
        ownerUserId: userId,
        translationId: translation.id,
        embeddingText,
        price: price ? parseFloat(price) : null,
        durationMins: durationMins ? parseInt(durationMins) : null,
        currency,
        phone,
        city,
        locationLat: locationLat ? parseFloat(locationLat) : null,
        locationLon: locationLon ? parseFloat(locationLon) : null,
        designId,
        available: true,
        // Connect categories if provided
        ...(categoryIds && categoryIds.length > 0 && {
          category: {
            connect: categoryIds.map(id => ({ id }))
          }
        }),
        // Connect tags if provided
        ...(tags && tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        })
      },
      include: {
        translation: true,
        category: true,
        tags: true,
        design: true,
        ownerUser: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });

  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/user-listings/services/:serviceId - Update an independent service
router.put('/services/:serviceId', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { serviceId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        ownerUserId: userId,
        listingType: 'INDEPENDENT',
        deletedAt: null
      },
      include: {
        translation: true
      }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or access denied'
      });
    }

    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      durationMins,
      currency,
      phone,
      city,
      locationLat,
      locationLon,
      categoryIds,
      tags,
      designId,
      available
    } = req.body;

    // Update translation if provided
    if (name_ar || name_en || description_ar !== undefined || description_en !== undefined) {
      await prisma.service_translation.update({
        where: { id: existingService.translationId },
        data: {
          ...(name_ar && { name_ar }),
          ...(name_en && { name_en }),
          ...(description_ar !== undefined && { description_ar }),
          ...(description_en !== undefined && { description_en })
        }
      });
    }

    // Update embedding text if content changed
    const updatedTranslation = await prisma.service_translation.findUnique({
      where: { id: existingService.translationId }
    });

    const embeddingText = `${updatedTranslation.name_ar} ${updatedTranslation.name_en} ${updatedTranslation.description_ar} ${updatedTranslation.description_en} ${tags ? tags.join(' ') : ''}`;

    // Update the service
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        embeddingText,
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(durationMins !== undefined && { durationMins: durationMins ? parseInt(durationMins) : null }),
        ...(currency && { currency }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(locationLat !== undefined && { locationLat: locationLat ? parseFloat(locationLat) : null }),
        ...(locationLon !== undefined && { locationLon: locationLon ? parseFloat(locationLon) : null }),
        ...(designId !== undefined && { designId }),
        ...(available !== undefined && { available })
      },
      include: {
        translation: true,
        category: true,
        tags: true,
        design: true,
        ownerUser: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/user-listings/services/:serviceId - Soft delete an independent service
router.delete('/services/:serviceId', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { serviceId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if service exists and belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        ownerUserId: userId,
        listingType: 'INDEPENDENT',
        deletedAt: null
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or access denied'
      });
    }

    // Soft delete the service
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        deletedAt: new Date(),
        available: false
      }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ================== INDEPENDENT PRODUCTS ROUTES ==================

// GET /api/user-listings/products - Get current user's independent products
router.get('/products', auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const products = await prisma.product.findMany({
      where: {
        ownerUserId: userId,
        listingType: 'INDEPENDENT',
        deletedAt: null
      },
      include: {
        tags: true,
        design: true,
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                profilePic: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add statistics to each product
    const productsWithStats = products.map(product => ({
      ...product,
      stats: {
        totalOrders: product._count.orderItems,
        totalReviews: product._count.reviews,
        averageRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
          : 0
      }
    }));

    res.json({
      success: true,
      products: productsWithStats
    });

  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/user-listings/products - Create a new independent product
router.post('/products', auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      name,
      description,
      price,
      currency = 'EGP',
      stock = 0,
      sku,
      tags,
      designId
    } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required'
      });
    }

    // Generate embedding text for search
    const embeddingText = `${name} ${description || ''} ${tags ? tags.join(' ') : ''}`;

    // Create the product
    const product = await prisma.product.create({
      data: {
        listingType: 'INDEPENDENT',
        ownerUserId: userId,
        name,
        description: description || null,
        price: parseFloat(price),
        currency,
        stock: parseInt(stock),
        sku: sku || null,
        embeddingText,
        designId: designId || null,
        isActive: true,
        // Connect tags if provided
        ...(tags && tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        })
      },
      include: {
        tags: true,
        design: true,
        ownerUser: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/user-listings/products/:productId - Update an independent product
router.put('/products/:productId', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        ownerUserId: userId,
        listingType: 'INDEPENDENT',
        deletedAt: null
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    const {
      name,
      description,
      price,
      currency,
      stock,
      sku,
      tags,
      designId,
      isActive
    } = req.body;

    // Generate embedding text for search if content changed
    const embeddingText = `${name || existingProduct.name} ${description !== undefined ? description : existingProduct.description} ${tags ? tags.join(' ') : ''}`;

    // Update the product
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(sku !== undefined && { sku }),
        ...(designId !== undefined && { designId }),
        ...(isActive !== undefined && { isActive }),
        embeddingText
      },
      include: {
        tags: true,
        design: true,
        ownerUser: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/user-listings/products/:productId - Soft delete an independent product
router.delete('/products/:productId', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        ownerUserId: userId,
        listingType: 'INDEPENDENT',
        deletedAt: null
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Soft delete the product
    await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ================== COMBINED LISTINGS ROUTES ==================

// GET /api/user-listings/all - Get all user's independent services and products
router.get('/all', auth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [services, products] = await Promise.all([
      // Get independent services
      prisma.service.findMany({
        where: {
          ownerUserId: userId,
          listingType: 'INDEPENDENT',
          deletedAt: null
        },
        include: {
          translation: true,
          category: true,
          tags: true,
          design: true,
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          }
        }
      }),
      // Get independent products
      prisma.product.findMany({
        where: {
          ownerUserId: userId,
          listingType: 'INDEPENDENT',
          deletedAt: null
        },
        include: {
          tags: true,
          design: true,
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        services: services.length,
        products: products.length,
        totalListings: services.length + products.length
      },
      services,
      products
    });

  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ================== PUBLIC SEARCH ROUTES ==================

// GET /api/user-listings/search/services - Search independent services
router.get('/search/services', async (req, res) => {
  try {
    const { q, city, category, page = 1, limit = 10 } = req.query;

    const whereClause = {
      listingType: 'INDEPENDENT',
      available: true,
      deletedAt: null
    };

    if (q) {
      whereClause.OR = [
        { translation: { name_en: { contains: q } } },
        { translation: { name_ar: { contains: q } } },
        { translation: { description_en: { contains: q } } },
        { translation: { description_ar: { contains: q } } }
      ];
    }

    if (city) {
      whereClause.city = { contains: city };
    }

    if (category) {
      whereClause.category = {
        some: {
          slug: category
        }
      };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        translation: true,
        category: true,
        tags: true,
        design: true,
        ownerUser: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalServices = await prisma.service.count({ where: whereClause });

    // Add statistics to each service
    const servicesWithStats = services.map(service => ({
      ...service,
      stats: {
        totalReviews: service.reviews.length,
        averageRating: service.reviews.length > 0 
          ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
          : 0
      }
    }));

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
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/user-listings/search/products - Search independent products
router.get('/search/products', async (req, res) => {
  try {
    const { q, page = 1, limit = 10, inStock } = req.query;

    const whereClause = {
      listingType: 'INDEPENDENT',
      isActive: true,
      deletedAt: null
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } }
      ];
    }

    if (inStock === 'true') {
      whereClause.stock = {
        gt: 0
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        tags: true,
        design: true,
        ownerUser: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalProducts = await prisma.product.count({ where: whereClause });

    // Add statistics to each product
    const productsWithStats = products.map(product => ({
      ...product,
      stats: {
        totalReviews: product.reviews.length,
        averageRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
          : 0
      }
    }));

    res.json({
      success: true,
      products: productsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
