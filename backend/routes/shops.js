import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { getShopBySlug as getShopBySlugService } from '../services/shopService.js';
import { auth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Helper function to generate shop slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to get shop with related data
const getShopWithRelations = async (whereClause) => {
  return await prisma.shop.findFirst({
    where: {
      ...whereClause,
      deletedAt: null // Only get non-deleted shops
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePic: true,
          bio: true,
          isVerified: true,
          verifiedBadge: true,
          role: true
        }
      },
      services: {
        where: {
          available: true,
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
          availability: true
        }
      },
      products: {
        where: {
          isActive: true,
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
          }
        }
      },
      reviews: {
        include: {
          author: {
            select: {
              name: true,
              profilePic: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      address: true,
      design: true
    }
  });
};

// GET /api/shops/provider - Get all shops for authenticated provider
router.get('/provider', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search, status } = req.query;

    console.log(`🏪 Fetching shops for provider ${userId}`);

    // Build where clause
    const whereClause = {
      ownerId: userId,
      deletedAt: null
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const shops = await prisma.shop.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            services: true,
            products: true,
            reviews: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const totalShops = await prisma.shop.count({
      where: whereClause
    });

    console.log(`✅ Found ${totalShops} shops for provider ${userId}`);

    if (totalShops === 0) {
      return res.json({
        success: true,
        shops: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    // Calculate stats for each shop
    const shopsWithStats = shops.map(shop => {
      const totalReviews = shop.reviews.length;
      const avgRating = totalReviews > 0
        ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      return {
        id: shop.id,
        vid: shop.vid,
        name: shop.name,
        description: shop.description,
        slug: shop.slug,
        phone: shop.phone,
        email: shop.email,
        website: shop.website,
        city: shop.city,
        locationLat: shop.locationLat,
        locationLon: shop.locationLon,
        coverImage: shop.coverImage,
        logoImage: shop.logoImage,
        isActive: shop.isActive,
        isVerified: shop.isVerified,
        createdAt: shop.createdAt,
        updatedAt: shop.updatedAt,
        _count: shop._count,
        stats: {
          views: 0, // This would come from analytics
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalReviews
        }
      };
    });

    res.json({
      success: true,
      shops: shopsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalShops,
        pages: Math.ceil(totalShops / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching provider shops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shops'
    });
  }
});

// GET /api/shops/public/:slug - Get shop by slug (public route)
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`Fetching shop with slug: ${slug}`);

    const shop = await getShopBySlugService(slug);

    if (!shop) {
      console.log(`Shop not found for slug: '${slug}'`);
      return res.status(404).json({
        success: false,
        message: `Shop not found for slug: ${slug}`
      });
    }
    
    console.log(`Found shop: ${shop.name} (id: ${shop.id}) for slug: ${slug}`);

    // Calculate shop statistics
    const stats = {
      totalServices: shop.services.length,
      totalProducts: shop.products.length,
      totalReviews: shop.reviews.length,
      averageRating: shop.reviews.length > 0 
        ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length 
        : 0,
      isVerified: shop.isVerified
    };

    // Return shop data with public information only
    res.json({
      success: true,
      shop: {
        id: shop.id,
        vid: shop.vid,
        name: shop.name,
        description: shop.description,
        phone: shop.phone,
        email: shop.email,
        website: shop.website,
        city: shop.city,
        locationLat: shop.locationLat,
        locationLon: shop.locationLon,
        isVerified: shop.isVerified,
        createdAt: shop.createdAt,
        slug: shop.slug,
        
        // Owner information (limited)
        owner: {
          name: shop.owner.name,
          profilePic: shop.owner.profilePic,
          bio: shop.owner.bio,
          isVerified: shop.owner.isVerified,
          verifiedBadge: shop.owner.verifiedBadge
        },

        // Services with full details
        services: shop.services,
        
        // Products with full details
        products: shop.products,
        
        // Reviews
        reviews: shop.reviews.slice(0, 10), // Limit to 10 most recent reviews
        
        // Shop statistics
        stats,
        
        // Design and address
        design: shop.design,
        address: shop.address
      }
    });

  } catch (error) {
    console.error('Error fetching shop by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shops/public/:slug/services - Get shop services (public route)
router.get('/public/:slug/services', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, category, search } = req.query;

    const shop = await prisma.shop.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        deletedAt: null
      },
      select: { id: true }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Build where clause for services
    const whereClause = {
      shopId: shop.id,
      available: true,
      deletedAt: null
    };

    if (category) {
      whereClause.category = {
        some: {
          slug: category
        }
      };
    }

    if (search) {
      whereClause.OR = [
        { translation: { name_en: { contains: search } } },
        { translation: { name_ar: { contains: search } } },
        { translation: { description_en: { contains: search } } },
        { translation: { description_ar: { contains: search } } }
      ];
    }

    const services = await prisma.service.findMany({
      where: whereClause,
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
        availability: true
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalServices = await prisma.service.count({
      where: whereClause
    });

    res.json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalServices,
        pages: Math.ceil(totalServices / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching shop services:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shops/public/:slug/products - Get shop products (public route)
router.get('/public/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10, search, inStock } = req.query;

    const shop = await prisma.shop.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        deletedAt: null
      },
      select: { id: true }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Build where clause for products
    const whereClause = {
      shopId: shop.id,
      isActive: true,
      deletedAt: null
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
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
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                profilePic: true
              }
            }
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalProducts = await prisma.product.count({
      where: whereClause
    });

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shops/public/:slug/reviews - Get shop reviews (public route)
router.get('/public/:slug/reviews', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const shop = await prisma.shop.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        deletedAt: null
      },
      select: { id: true }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        shopId: shop.id
      },
      include: {
        author: {
          select: {
            name: true,
            profilePic: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalReviews = await prisma.review.count({
      where: {
        shopId: shop.id
      }
    });

    // Calculate rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        shopId: shop.id
      },
      _count: {
        rating: true
      }
    });

    const averageRating = totalReviews > 0 
      ? await prisma.review.aggregate({
          where: { shopId: shop.id },
          _avg: { rating: true }
        })
      : { _avg: { rating: 0 } };

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalReviews,
        pages: Math.ceil(totalReviews / parseInt(limit))
      },
      stats: {
        averageRating: averageRating._avg.rating || 0,
        totalReviews,
        ratingDistribution: ratingStats
      }
    });

  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/shops/search - Search shops publicly
router.get('/search', async (req, res) => {
  try {
    const { q, city, category, page = 1, limit = 10 } = req.query;

    if (!q && !city && !category) {
      return res.status(400).json({
        success: false,
        message: 'At least one search parameter is required'
      });
    }

    const whereClause = {
      deletedAt: null
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } }
      ];
    }

    if (city) {
      whereClause.city = { contains: city };
    }

    if (category) {
      whereClause.services = {
        some: {
          category: {
            some: {
              slug: category
            }
          }
        }
      };
    }

    const shops = await prisma.shop.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
            profilePic: true,
            isVerified: true,
            verifiedBadge: true
          }
        },
        services: {
          where: { available: true },
          select: {
            id: true,
            translation: true,
            price: true,
            category: true
          },
          take: 3 // Preview of services
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: [
        { isVerified: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Add statistics to each shop
    const shopsWithStats = shops.map(shop => ({
      ...shop,
      slug: shop.slug,
      stats: {
        totalServices: shop.services.length,
        totalReviews: shop.reviews.length,
        averageRating: shop.reviews.length > 0 
          ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length 
          : 0
      }
    }));

    const totalShops = await prisma.shop.count({ where: whereClause });

    res.json({
      success: true,
      shops: shopsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalShops,
        pages: Math.ceil(totalShops / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error searching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/shops/:shopId/reviews - Add a review to a shop (requires auth)
router.post('/:shopId/reviews', verifyToken, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id; // Assuming auth middleware sets req.user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if shop exists
    const shop = await prisma.shop.findFirst({
      where: { id: shopId, deletedAt: null }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check if user already reviewed this shop
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: userId,
        shopId: shopId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this shop'
      });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        authorId: userId,
        shopId: shopId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        author: {
          select: {
            name: true,
            profilePic: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Error creating shop review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/shops/:id - Update a shop (requires auth)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, city, phone, email, website, coverImage, logoImage, isActive } = req.body;

    console.log(`🏪 Updating shop ${id} for user ${userId}`);

    // Check if shop exists and belongs to user
    const existingShop = await prisma.shop.findFirst({
      where: {
        id,
        ownerId: userId,
        deletedAt: null
      }
    });

    if (!existingShop) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found or you do not have permission to edit it'
      });
    }

    // Generate new slug if name is changed
    let slug = existingShop.slug;
    if (name && name !== existingShop.name) {
      slug = generateSlug(name);
    }

    // Update the shop
    const shop = await prisma.shop.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(city && { city }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(coverImage !== undefined && { coverImage }),
        ...(logoImage !== undefined && { logoImage }),
        ...(isActive !== undefined && { isActive }),
        ...(slug !== existingShop.slug && { slug })
      },
      include: {
        _count: {
          select: {
            services: true,
            products: true,
            reviews: true
          }
        }
      }
    });

    console.log(`✅ Shop updated successfully: ${shop.id}`);

    res.json({
      success: true,
      shop
    });

  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shop'
    });
  }
});

// GET /api/shops/my-shops - Get current user's shops (requires auth)
router.get('/my-shops', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const shops = await prisma.shop.findMany({
      where: {
        ownerId: userId,
        deletedAt: null
      },
      include: {
        services: {
          where: { deletedAt: null }
        },
        products: {
          where: { deletedAt: null }
        },
        reviews: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add statistics and slugs
    const shopsWithStats = shops.map(shop => ({
      ...shop,
      slug: shop.slug,
      stats: {
        totalServices: shop.services.length,
        totalProducts: shop.products.length,
        totalReviews: shop.reviews.length,
        averageRating: shop.reviews.length > 0 
          ? shop.reviews.reduce((sum, review) => sum + review.rating, 0) / shop.reviews.length 
          : 0
      }
    }));

    res.json({
      success: true,
      shops: shopsWithStats
    });

  } catch (error) {
    console.error('Error fetching user shops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
