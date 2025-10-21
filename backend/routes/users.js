import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/:id - Get user by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching user with ID: ${id}`);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true, // Will be shown only if profile is public
        phone: true, // Will be shown only if profile is public
        profilePic: true,
        coverImage: true,
        bio: true,
        isVerified: true,
        verifiedBadge: true,
        role: true,
        createdAt: true,
        // Design system
        design: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        // Provider subscription
        providerSubscription: {
          select: {
            id: true,
            planType: true,
            canTakeBookings: true,
            canListProducts: true,
            searchPriority: true,
            hasPriorityBadge: true,
            isActive: true,
            startedAt: true,
            expiresAt: true
          }
        },
        // Related data
        shops: {
          where: {
            isVerified: true,
            deletedAt: null
          },
          select: {
            id: true,
            vid: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            locationLat: true,
            locationLon: true,
            address: {
              select: {
                id: true,
                text_ar: true,
                text_en: true
              }
            },
            isVerified: true,
            createdAt: true,
            _count: {
              select: {
                services: true,
                products: true,
                reviews: true
              }
            }
          }
        },
        services: {
          where: {
            available: true,
            deletedAt: null
          },
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
            design: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true
              }
            },
            price: true,
            city: true,
            locationLat: true,
            locationLon: true,
            createdAt: true,
            _count: {
              select: {
                bookings: true,
                reviews: true
              }
            }
          }
        },
        products: {
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            vid: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            createdAt: true,
            shop: {
              select: {
                id: true,
                vid: true,
                name: true,
                slug: true
              }
            },
            _count: {
              select: {
                reviews: true
              }
            }
          },
          take: 10 // Latest 10 products
        },
        analytics: {
          select: {
            profileViews: true,
            serviceViews: true,
            shopViews: true,
            contactClicks: true,
            emailClicks: true,
            phoneClicks: true,
            messagesSent: true,
            messagesReceived: true,
            totalBookings: true,
            totalOrders: true,
            avgResponseTime: true,
            successRate: true,
            reviewsGiven: true,
            reviewsReceived: true,
            reactionsGiven: true,
            reactionsReceived: true,
            updatedAt: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            service: {
              select: {
                id: true,
                vid: true,
                translation: {
                  select: {
                    name_en: true,
                    name_ar: true
                  }
                }
              }
            },
            shop: {
              select: {
                id: true,
                vid: true,
                name: true,
                slug: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to 10 recent reviews
        },
        _count: {
          select: {
            shops: true,
            services: true,
            products: true,
            reviews: true,
            bookings: true,
            reviewReactions: true
          }
        }
      }
    });

    if (!user) {
      console.log(`User not found for ID: '${id}'`);
      return res.status(404).json({
        success: false,
        message: `User not found for ID: ${id}`
      });
    }
    
    console.log(`Found user: ${user.name} (id: ${user.id})`);

    // Calculate user statistics
    const stats = {
      totalShops: user._count.shops,
      totalServices: user._count.services,
      totalProducts: user._count.products,
      totalReviews: user._count.reviews,
      totalBookings: user._count.bookings,
      totalReactions: user._count.reviewReactions,
      isVerified: user.isVerified,
      verifiedBadge: user.verifiedBadge,
      memberSince: user.createdAt,
      avgRating: user.reviews.length > 0 
        ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length 
        : 0,
      // Analytics data
      analytics: user.analytics || {
        profileViews: 0,
        serviceViews: 0,
        shopViews: 0,
        contactClicks: 0,
        emailClicks: 0,
        phoneClicks: 0,
        messagesSent: 0,
        messagesReceived: 0,
        totalBookings: 0,
        totalOrders: 0,
        avgResponseTime: null,
        successRate: null,
        reviewsGiven: 0,
        reviewsReceived: 0,
        reactionsGiven: 0,
        reactionsReceived: 0
      }
    };

    // Remove sensitive information based on user privacy settings
    // For now, we'll keep email and phone visible for all users
    // In the future, this could be controlled by user privacy settings
    
    // Derive location from first service or shop (prioritize service)
    const firstService = user.services && user.services.length > 0 ? user.services[0] : null;
    const firstShop = user.shops && user.shops.length > 0 ? user.shops[0] : null;
    
    // Use service location if available, otherwise fall back to shop location
    const locationSource = firstService || firstShop;
    
    // Extract unique categories from user's services
    const categoriesMap = new Map();
    const subcategoriesMap = new Map();
    
    user.services?.forEach(service => {
      // Add all categories from service
      service.category?.forEach(cat => {
        if (cat && cat.id && !categoriesMap.has(cat.id)) {
          categoriesMap.set(cat.id, {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description
          });
        }
      });
      
      // Add subcategory if exists
      if (service.subCategory && !subcategoriesMap.has(service.subCategory.id)) {
        subcategoriesMap.set(service.subCategory.id, {
          id: service.subCategory.id,
          name: service.subCategory.name,
          slug: service.subCategory.slug
        });
      }
    });
    
    const uniqueCategories = Array.from(categoriesMap.values());
    const uniqueSubcategories = Array.from(subcategoriesMap.values());
    
    // Derive design slug from user's services
    const designSlug = user.services && user.services.length > 0 && user.services[0].design 
      ? user.services[0].design.slug 
      : null;
    
    const publicUserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      coverImage: user.coverImage,
      bio: user.bio,
      isVerified: user.isVerified,
      verifiedBadge: user.verifiedBadge,
      role: user.role,
      createdAt: user.createdAt,
      
      // Design system - derived from first service
      design: user.services && user.services.length > 0 && user.services[0].design 
        ? user.services[0].design 
        : null,
      designSlug: designSlug,
      
      // Provider subscription
      providerSubscription: user.providerSubscription,
      
      // Location data derived from first service or shop
      city: locationSource?.city || null,
      locationLat: locationSource?.locationLat || null,
      locationLon: locationSource?.locationLon || null,
      address: firstShop?.address || null, // Address is only available on shops
      
      // User's businesses and services
      shops: user.shops,
      services: user.services,
      products: user.products,
      
      // Categories derived from user's services
      categories: uniqueCategories,
      subcategories: uniqueSubcategories,
      
      // Recent reviews given by this user
      reviews: user.reviews,
      
      // User statistics
      stats
    };

    res.json({
      success: true,
      user: publicUserData
    });

  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/:id/shops - Get user's shops (public route)
router.get('/:id/shops', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const shops = await prisma.shop.findMany({
      where: {
        ownerId: id,
        isVerified: true,
        deletedAt: null
      },
      include: {
        address: true,
        design: true,
        _count: {
          select: {
            services: true,
            products: true,
            reviews: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalShops = await prisma.shop.count({
      where: {
        ownerId: id,
        isVerified: true,
        deletedAt: null
      }
    });

    res.json({
      success: true,
      shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalShops,
        pages: Math.ceil(totalShops / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching user shops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/:id/services - Get user's services (public route)
router.get('/:id/services', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, city, category } = req.query;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build where clause for services
    const whereClause = {
      ownerUserId: id,
      available: true,
      deletedAt: null
    };

    if (city) {
      whereClause.city = city;
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
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true
          }
        }
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
    console.error('Error fetching user services:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/users/:id/reviews - Get reviews written by user (public route)
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        authorId: id
      },
      include: {
        service: {
          select: {
            id: true,
            vid: true,
            translation: {
              select: {
                name_en: true,
                name_ar: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            vid: true,
            name: true,
            slug: true
          }
        },
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
        authorId: id
      }
    });

    // Calculate rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        authorId: id
      },
      _count: {
        rating: true
      }
    });

    const averageRating = totalReviews > 0 
      ? await prisma.review.aggregate({
          where: { authorId: id },
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
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
