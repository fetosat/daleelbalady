// Subscription Plan Views API
// Four subscription plan tiers with different data access levels
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { auth } from '../middleware/auth.js';
import { authWithSubscription } from '../middleware/payment.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Four Subscription Plan Views:
 * 1. FREE PLAN VIEW (FreeListingView) - Publicly visible basic listing
 * 2. VERIFICATION PLAN VIEW (VerifiedListingView) - Adds verified badge and chat access
 * 3. SERVICES PLAN VIEW (ServiceBookingView) - Advanced booking and scheduling features
 * 4. PRODUCTS PLAN VIEW (ProductListingView) - Product-focused with inventory and POS
 */

// ============================
// 1. FREE PLAN VIEW - FreeListingView
// ============================
/**
 * GET /api/plan-views/free-listing
 * Purpose: Publicly visible listing for all verified or basic users/services
 * Shows only essential business info with limited contact details
 * Data source: Service, User, Shop, Review, SubCategory, Category
 */
router.get('/free-listing', async (req, res) => {
  try {
    const { 
      city, 
      category, 
      subCategory,
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filters
    const filters = {
      available: true,
      deletedAt: null,
    };

    if (city) {
      filters.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
      filters.category = {
        some: {
          name: { contains: category, mode: 'insensitive' }
        }
      };
    }

    if (subCategory) {
      filters.subCategory = {
        name: { contains: subCategory, mode: 'insensitive' }
      };
    }

    // Get services with basic information
    const services = await prisma.service.findMany({
      where: filters,
      include: {
        translation: {
          select: {
            name_ar: true,
            name_en: true
          }
        },
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
        },
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
            address: {
              select: {
                text_ar: true,
                text_en: true
              }
            }
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true
          }
        },
        // Basic analytics if available
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.service.count({ where: filters });

    // Calculate analytics
    const servicesWithAnalytics = await Promise.all(
      services.map(async (service) => {
        // Calculate average rating
        const avgRating = service.reviews.length > 0 
          ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
          : 0;

        // Get view count from analytics if available
        const analytics = await prisma.userAnalytics.findUnique({
          where: { userId: service.ownerUserId || '' },
          select: { serviceViews: true }
        }).catch(() => null);

        return {
          // Basic service information
          serviceId: service.id,
          serviceName: {
            ar: service.translation?.name_ar || service.embeddingText || 'خدمة',
            en: service.translation?.name_en || service.embeddingText || 'Service'
          },
          ownerName: service.ownerUser?.name || service.shop?.name || 'Business Owner',
          
          // Category information
          mainCategory: service.category?.[0]?.name || 'General',
          subCategory: service.subCategory?.name || null,
          
          // Location (basic only)
          city: service.city,
          address: service.shop?.address ? {
            ar: service.shop.address.text_ar,
            en: service.shop.address.text_en
          } : service.city,
          
          // Map coordinates (approximate for free tier)
          mapLat: service.locationLat ? parseFloat(service.locationLat.toFixed(2)) : null,
          mapLon: service.locationLon ? parseFloat(service.locationLon.toFixed(2)) : null,
          
          // Limited contact info
          phone: service.phone ? service.phone.slice(0, -3) + 'XXX' : null, // Masked phone
          
          // Basic social info
          socialLinks: {
            hasWebsite: !!(service.shop?.website),
            hasPhone: !!service.phone,
            verified: service.ownerUser?.isVerified || false
          },
          
          // Reviews and ratings
          rating: parseFloat(avgRating.toFixed(1)),
          reviewsCount: service._count.reviews,
          
          // View count (limited precision for free)
          viewCount: analytics?.serviceViews ? Math.floor(analytics.serviceViews / 10) * 10 : 0,
          
          // No invitation points for free tier
          invitationPoints: 0,
          
          // Basic images
          coverImage: service.coverImage,
          logoImage: service.logoImage,
          
          // Timestamps
          createdAt: service.createdAt,
          
          // Plan indicator
          planType: 'FREE'
        };
      })
    );

    res.json({
      success: true,
      data: servicesWithAnalytics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      planType: 'FREE_PLAN',
      message: 'Basic listing view. Upgrade for enhanced features and full contact details.',
      upgradeOptions: [
        {
          plan: 'VERIFICATION_PLAN',
          features: ['Verified badge', 'Direct chat access', 'Full contact info']
        },
        {
          plan: 'SERVICES_PLAN', 
          features: ['Online booking', 'Schedule management', 'Client tracking']
        },
        {
          plan: 'PRODUCTS_PLAN',
          features: ['Product listings', 'Inventory management', 'POS system']
        }
      ]
    });

  } catch (error) {
    console.error('Free listing view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load basic listing data'
    });
  }
});

// ============================
// 2. VERIFICATION PLAN VIEW - VerifiedListingView  
// ============================
/**
 * GET /api/plan-views/verified-listing
 * Purpose: Adds verified badge and chat access for verified users/services
 * Extends FreeListingView with verification and chat data
 * Data source: Extends FreeListingView + verification and chat data
 */
router.get('/verified-listing', auth, authWithSubscription, async (req, res) => {
  try {
    // Check if user has verification plan or higher
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        userSubscription: true,
        providerSubscription: true
      }
    });

    const hasVerificationAccess = user?.isVerified || 
      user?.userSubscription?.planType !== 'FREE' ||
      user?.providerSubscription?.planType !== 'BASIC_FREE';

    if (!hasVerificationAccess) {
      return res.status(403).json({
        success: false,
        message: 'Verification plan or account verification required',
        currentStatus: {
          isVerified: user?.isVerified || false,
          userPlan: user?.userSubscription?.planType || 'FREE',
          providerPlan: user?.providerSubscription?.planType || 'BASIC_FREE'
        }
      });
    }

    const { 
      city, 
      category, 
      subCategory,
      limit = 20, 
      page = 1,
      sortBy = 'verified',
      sortOrder = 'desc',
      verifiedOnly = false
    } = req.query;

    // Build filters (same as free + verification filters)
    const filters = {
      available: true,
      deletedAt: null,
    };

    if (city) {
      filters.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
      filters.category = {
        some: {
          name: { contains: category, mode: 'insensitive' }
        }
      };
    }

    if (verifiedOnly === 'true') {
      filters.OR = [
        { ownerUser: { isVerified: true } },
        { shop: { isVerified: true } }
      ];
    }

    const services = await prisma.service.findMany({
      where: filters,
      include: {
        translation: true,
        category: true,
        subCategory: true,
        ownerUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            isVerified: true,
            verifiedBadge: true,
            verifiedAt: true,
            profilePic: true
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            isVerified: true,
            address: true,
            website: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                isVerified: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      orderBy: sortBy === 'verified' ? 
        { ownerUser: { isVerified: 'desc' } } : 
        { [sortBy]: sortOrder },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.service.count({ where: filters });

    // Enhanced data with verification features
    const verifiedServices = await Promise.all(
      services.map(async (service) => {
        const avgRating = service.reviews.length > 0 
          ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
          : 0;

        // Check if user can chat with this provider
        const canChat = hasVerificationAccess && (service.ownerUser?.isVerified || service.shop?.isVerified);

        // Get verification expiry from subscription
        const providerSubscription = await prisma.providerSubscription.findUnique({
          where: { providerId: service.ownerUserId || '' },
          select: { expiresAt: true }
        }).catch(() => null);

        return {
          // All data from FREE tier
          serviceId: service.id,
          serviceName: {
            ar: service.translation?.name_ar || service.embeddingText || 'خدمة',
            en: service.translation?.name_en || service.embeddingText || 'Service'
          },
          ownerName: service.ownerUser?.name || service.shop?.name || 'Business Owner',
          mainCategory: service.category?.[0]?.name || 'General',
          subCategory: service.subCategory?.name || null,
          city: service.city,
          address: service.shop?.address ? {
            ar: service.shop.address.text_ar,
            en: service.shop.address.text_en
          } : service.city,
          mapLat: service.locationLat,
          mapLon: service.locationLon,
          
          // FULL contact information for verified users
          phone: service.phone || service.ownerUser?.phone || service.shop?.phone,
          email: service.ownerUser?.email || service.shop?.email,
          website: service.shop?.website,
          
          // Enhanced social links
          socialLinks: {
            website: service.shop?.website,
            phone: service.phone || service.ownerUser?.phone || service.shop?.phone,
            email: service.ownerUser?.email || service.shop?.email,
            verified: service.ownerUser?.isVerified || service.shop?.isVerified || false
          },
          
          rating: parseFloat(avgRating.toFixed(1)),
          reviewsCount: service._count.reviews,
          viewCount: 0, // Would be calculated from analytics
          invitationPoints: 0, // Would be calculated from referrals
          
          coverImage: service.coverImage,
          logoImage: service.logoImage,
          
          // VERIFICATION FEATURES
          verified: service.ownerUser?.isVerified || service.shop?.isVerified || false,
          verifiedBadge: service.ownerUser?.verifiedBadge || (service.shop?.isVerified ? 'business_verified' : null),
          verificationExpiry: providerSubscription?.expiresAt,
          
          // CHAT FEATURES
          chatEnabled: canChat,
          canMessage: canChat,
          
          // Enhanced reviews for verified users
          recentReviews: service.reviews.slice(0, 3).map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment?.substring(0, 200) + (review.comment?.length > 200 ? '...' : ''),
            author: {
              name: review.author.name,
              verified: review.author.isVerified
            },
            createdAt: review.createdAt
          })),
          
          createdAt: service.createdAt,
          planType: 'VERIFICATION'
        };
      })
    );

    res.json({
      success: true,
      data: verifiedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      planType: 'VERIFICATION_PLAN',
      userBenefits: {
        verified: user?.isVerified,
        canChat: true,
        fullContactAccess: true,
        verifiedBadge: user?.verifiedBadge
      },
      message: 'Verified listing view with chat access and full contact details.',
      additionalFeatures: [
        'Direct messaging with providers',
        'Full contact information',
        'Verified badge display',
        'Enhanced review access'
      ]
    });

  } catch (error) {
    console.error('Verified listing view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load verified listing data'
    });
  }
});

// ============================
// 3. SERVICES PLAN VIEW - ServiceBookingView
// ============================
/**
 * GET /api/plan-views/service-booking
 * Purpose: Enables advanced features for premium users - bookings, availability, scheduling, client tracking
 * Data source: Service, ServiceAvailability, Booking, User, Customer, etc.
 */
router.get('/service-booking', auth, authWithSubscription, async (req, res) => {
  try {
    // Check if user has services plan access
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        providerSubscription: true,
        userSubscription: true
      }
    });

    const hasBookingAccess = user?.providerSubscription?.canTakeBookings || 
      ['BOOKING_BASIC', 'PRODUCTS_PREMIUM', 'TOP_BRONZE', 'TOP_SILVER', 'TOP_GOLD'].includes(
        user?.providerSubscription?.planType
      );

    if (!hasBookingAccess) {
      return res.status(403).json({
        success: false,
        message: 'Services plan with booking features required',
        currentPlan: user?.providerSubscription?.planType || 'BASIC_FREE'
      });
    }

    const { 
      city, 
      category,
      availability = 'all',
      bookingType,
      limit = 20, 
      page = 1,
      sortBy = 'bookingsCount',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      available: true,
      deletedAt: null,
    };

    if (city) {
      filters.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
      filters.category = {
        some: {
          name: { contains: category, mode: 'insensitive' }
        }
      };
    }

    // Filter by availability
    if (availability === 'available_now') {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      const currentTime = now.toTimeString().substring(0, 5);
      
      filters.availability = {
        some: {
          OR: [
            {
              dayOfWeek: currentDay,
              startTime: { lte: currentTime },
              endTime: { gte: currentTime }
            },
            {
              isRecurring: false,
              startDate: { lte: now },
              endDate: { gte: now }
            }
          ]
        }
      };
    }

    const services = await prisma.service.findMany({
      where: filters,
      include: {
        translation: true,
        category: true,
        subCategory: true,
        ownerUser: {
          include: {
            providerSubscription: true
          }
        },
        shop: {
          include: {
            address: true
          }
        },
        // Service availability schedule
        availability: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        // Recent bookings for analytics
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePic: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        // Reviews
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                isVerified: true,
                profilePic: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: sortBy === 'bookingsCount' ? 
        { bookings: { _count: 'desc' } } :
        { [sortBy]: sortOrder },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.service.count({ where: filters });

    // Enhanced service booking data
    const bookingServices = await Promise.all(
      services.map(async (service) => {
        const avgRating = service.reviews.length > 0 
          ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / service.reviews.length 
          : 0;

        // Calculate unique clients
        const uniqueClients = new Set(service.bookings.map(b => b.userId)).size;

        // Calculate messages count (if chat system is implemented)
        const messagesCount = await prisma.message.count({
          where: {
            chat: {
              OR: [
                { initiatorId: service.ownerUserId },
                { recipientId: service.ownerUserId }
              ]
            }
          }
        }).catch(() => 0);

        // Calculate follow-ups
        const followupsCount = service.bookings.filter(b => 
          b.status === 'COMPLETED' && b.notes?.includes('follow')
        ).length;

        // Determine booking types based on service data
        const bookingTypes = [];
        if (service.locationLat && service.locationLon) {
          bookingTypes.push('On-site Visit');
        }
        if (service.ownerUser?.phone) {
          bookingTypes.push('Phone Consultation');
        }
        if (service.shop) {
          bookingTypes.push('Shop Visit');
        }
        if (bookingTypes.length === 0) {
          bookingTypes.push('General Booking');
        }

        return {
          serviceId: service.id,
          serviceName: {
            ar: service.translation?.name_ar || service.embeddingText || 'خدمة',
            en: service.translation?.name_en || service.embeddingText || 'Service'
          },
          ownerName: service.ownerUser?.name || 'Business Owner',
          
          // BOOKING FEATURES
          bookingsEnabled: service.ownerUser?.providerSubscription?.canTakeBookings || false,
          
          // Available booking types
          bookingTypes,
          
          // Work hours and availability
          availabilitySchedule: service.availability.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            timezone: slot.timezone || 'Africa/Cairo',
            isRecurring: slot.isRecurring,
            startDate: slot.startDate,
            endDate: slot.endDate
          })),
          
          workHours: service.availability
            .filter(slot => slot.isRecurring)
            .reduce((acc, slot) => {
              acc[slot.dayOfWeek] = {
                open: slot.startTime,
                close: slot.endTime
              };
              return acc;
            }, {}),
          
          // CLIENT ANALYTICS
          clientsCount: uniqueClients,
          messagesCount,
          followupsCount,
          totalBookings: service._count.bookings,
          
          // Service details
          category: service.category?.[0]?.name || 'General',
          city: service.city,
          location: {
            lat: service.locationLat,
            lon: service.locationLon,
            address: service.shop?.address ? {
              ar: service.shop.address.text_ar,
              en: service.shop.address.text_en
            } : null
          },
          
          // Pricing and duration
          basePrice: service.price,
          currency: service.currency || 'EGP',
          duration: service.durationMins,
          
          // Contact information
          phone: service.phone || service.ownerUser?.phone,
          email: service.ownerUser?.email,
          
          // Recent activity
          recentBookings: service.bookings.slice(0, 5).map(booking => ({
            id: booking.id,
            clientName: booking.user.name,
            clientAvatar: booking.user.profilePic,
            startAt: booking.startAt,
            status: booking.status,
            duration: booking.durationMins
          })),
          
          // Reviews
          rating: parseFloat(avgRating.toFixed(1)),
          reviewsCount: service._count.reviews,
          recentReviews: service.reviews.slice(0, 3).map(review => ({
            rating: review.rating,
            comment: review.comment?.substring(0, 150),
            author: review.author.name,
            createdAt: review.createdAt
          })),
          
          // Media
          coverImage: service.coverImage,
          logoImage: service.logoImage,
          
          createdAt: service.createdAt,
          planType: 'SERVICES'
        };
      })
    );

    res.json({
      success: true,
      data: bookingServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      planType: 'SERVICES_PLAN',
      userBenefits: {
        canTakeBookings: user?.providerSubscription?.canTakeBookings,
        planType: user?.providerSubscription?.planType,
        searchPriority: user?.providerSubscription?.searchPriority || 0
      },
      bookingFeatures: [
        'Online appointment booking',
        'Schedule management',
        'Client tracking and analytics',
        'Automated reminders',
        'Follow-up management',
        'Revenue tracking'
      ],
      availabilityFilters: [
        'available_now',
        'today',
        'this_week',
        'custom_date'
      ]
    });

  } catch (error) {
    console.error('Service booking view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load service booking data'
    });
  }
});

// ============================
// 4. PRODUCTS PLAN VIEW - ProductListingView
// ============================
/**
 * GET /api/plan-views/product-listing
 * Purpose: Product-focused view for Products Plan (same price tier as services, but product-focused)
 * Data source: Product, Shop, User, Review
 */
router.get('/product-listing', auth, authWithSubscription, async (req, res) => {
  try {
    // Check if user has products plan access
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        providerSubscription: true
      }
    });

    const hasProductAccess = user?.providerSubscription?.canListProducts || 
      ['PRODUCTS_PREMIUM', 'TOP_BRONZE', 'TOP_SILVER', 'TOP_GOLD'].includes(
        user?.providerSubscription?.planType
      );

    if (!hasProductAccess) {
      return res.status(403).json({
        success: false,
        message: 'Products plan required for product listings',
        currentPlan: user?.providerSubscription?.planType || 'BASIC_FREE'
      });
    }

    const { 
      city, 
      category,
      priceMin,
      priceMax,
      inStock = 'all',
      shopId,
      limit = 20, 
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      isActive: true,
      deletedAt: null,
    };

    // Filter by shop location/city
    if (city) {
      filters.shop = {
        city: { contains: city, mode: 'insensitive' }
      };
    }

    // Filter by specific shop
    if (shopId) {
      filters.shopId = shopId;
    }

    // Price range filter
    if (priceMin || priceMax) {
      filters.price = {};
      if (priceMin) filters.price.gte = parseFloat(priceMin);
      if (priceMax) filters.price.lte = parseFloat(priceMax);
    }

    // Stock filter
    if (inStock === 'available') {
      filters.stock = { gt: 0 };
    } else if (inStock === 'out_of_stock') {
      filters.stock = { lte: 0 };
    }

    // Category filter (through tags or product categorization)
    if (category) {
      filters.tags = {
        some: {
          name: { contains: category, mode: 'insensitive' }
        }
      };
    }

    const products = await prisma.product.findMany({
      where: filters,
      include: {
        shop: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                isVerified: true,
                providerSubscription: true
              }
            },
            address: true
          }
        },
        lister: {
          select: {
            id: true,
            name: true,
            isVerified: true
          }
        },
        tags: true,
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                isVerified: true,
                profilePic: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        orderItems: {
          include: {
            order: {
              select: {
                status: true,
                createdAt: true
              }
            }
          },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.product.count({ where: filters });

    // Format products data
    const productListings = products.map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0;

      // Calculate sales analytics
      const totalSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = product.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

      return {
        // PRODUCT BASICS
        productId: product.id,
        productName: product.name,
        description: product.description,
        
        // PRICING AND INVENTORY
        price: product.price,
        currency: product.currency || 'EGP',
        stock: product.stock,
        sku: product.sku,
        isActive: product.isActive,
        
        // SHOP INFORMATION
        shop: {
          id: product.shop?.id,
          name: product.shop?.name,
          verified: product.shop?.owner?.isVerified || false,
          location: {
            city: product.shop?.city,
            address: product.shop?.address ? {
              ar: product.shop.address.text_ar,
              en: product.shop.address.text_en
            } : null
          },
          contact: {
            phone: product.shop?.phone || product.shop?.owner?.phone,
            email: product.shop?.email || product.shop?.owner?.email
          },
          owner: {
            name: product.shop?.owner?.name,
            verified: product.shop?.owner?.isVerified,
            subscription: product.shop?.owner?.providerSubscription?.planType
          }
        },
        
        // MEDIA
        coverImage: product.design?.name || null, // Assuming design contains image info
        images: [], // Would be populated from product images if available
        
        // CATEGORIZATION
        tags: product.tags.map(tag => ({
          id: tag.id,
          name: tag.name
        })),
        
        // REVIEWS AND RATINGS
        rating: parseFloat(avgRating.toFixed(1)),
        reviewsCount: product._count.reviews,
        recentReviews: product.reviews.slice(0, 3).map(review => ({
          rating: review.rating,
          comment: review.comment?.substring(0, 150),
          author: {
            name: review.author.name,
            verified: review.author.isVerified,
            avatar: review.author.profilePic
          },
          createdAt: review.createdAt
        })),
        
        // SALES ANALYTICS
        salesData: {
          totalSold: totalSales,
          totalRevenue: revenue,
          averageOrderValue: totalSales > 0 ? revenue / totalSales : 0,
          recentOrders: product.orderItems.slice(0, 5).length
        },
        
        // POS SYSTEM FEATURES
        cashierEnabled: user?.providerSubscription?.planType === 'PRODUCTS_PREMIUM',
        inventoryTracking: true,
        barcodeScanning: product.sku ? true : false,
        
        // BUSINESS FEATURES
        canManageInventory: true,
        canSetDiscounts: true,
        canCreateOffers: true,
        posSystemAccess: user?.providerSubscription?.planType === 'PRODUCTS_PREMIUM',
        
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        planType: 'PRODUCTS'
      };
    });

    res.json({
      success: true,
      data: productListings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      planType: 'PRODUCTS_PLAN',
      userBenefits: {
        canListProducts: user?.providerSubscription?.canListProducts,
        planType: user?.providerSubscription?.planType,
        hasInventoryManagement: true,
        hasPOSAccess: user?.providerSubscription?.planType === 'PRODUCTS_PREMIUM'
      },
      productFeatures: [
        'Product catalog management',
        'Inventory tracking',
        'Sales analytics',
        'Order management',
        'Barcode scanning',
        'POS system integration',
        'Discount and offer creation'
      ],
      filterOptions: {
        priceRanges: [
          { label: 'Under 100 EGP', min: 0, max: 100 },
          { label: '100 - 500 EGP', min: 100, max: 500 },
          { label: '500 - 1000 EGP', min: 500, max: 1000 },
          { label: 'Above 1000 EGP', min: 1000, max: null }
        ],
        stockStatus: ['all', 'available', 'out_of_stock'],
        sortOptions: ['createdAt', 'price', 'name', 'rating', 'sales']
      }
    });

  } catch (error) {
    console.error('Product listing view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load product listing data'
    });
  }
});

export default router;
