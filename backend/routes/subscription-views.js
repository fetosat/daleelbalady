// Subscription-based Plan Views API
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
 * GET /api/subscription-views/free-listing
 * Purpose: Publicly visible listing for all verified or basic users/services
 * Shows only essential business info with limited contact details
 */
router.get('/free', auth, async (req, res) => {
  try {
    const { city, category, limit = 20, page = 1 } = req.query;
    
    // Build filters
    const filters = {};
    if (city) filters.city = { contains: city, mode: 'insensitive' };
    
    // For free users, return basic service information only
    const services = await prisma.service.findMany({
      where: {
        available: true,
        deletedAt: null,
        ...filters,
        ...(category && {
          category: {
            some: {
              name: { contains: category, mode: 'insensitive' }
            }
          }
        })
      },
      include: {
        translation: {
          select: {
            name_ar: true,
            name_en: true,
            description_ar: true,
            description_en: true
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
        // Limit owner information for free tier
        ownerUser: {
          select: {
            id: true,
            name: true,
            isVerified: true
          }
        }
      },
      orderBy: [
        { isdefault: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    // Count total for pagination
    const total = await prisma.service.count({
      where: {
        available: true,
        deletedAt: null,
        ...filters,
        ...(category && {
          category: {
            some: {
              name: { contains: category, mode: 'insensitive' }
            }
          }
        })
      }
    });

    // Format data for FREE tier - basic information only
    const formattedServices = services.map(service => ({
      id: service.id,
      name: {
        ar: service.translation?.name_ar || service.embeddingText,
        en: service.translation?.name_en || service.embeddingText
      },
      description: {
        ar: service.translation?.description_ar?.substring(0, 100) + '...' || '',
        en: service.translation?.description_en?.substring(0, 100) + '...' || ''
      },
      category: service.category?.[0]?.name || 'Unknown',
      city: service.city,
      // Limited location info for free users
      location: {
        available: !!(service.locationLat && service.locationLon),
        approximate: true // Indicate this is approximate for free users
      },
      // Basic owner info only
      provider: {
        name: service.ownerUser?.name || 'Business Owner',
        verified: service.ownerUser?.isVerified || false
      },
      // No contact information for free tier
      features: {
        hasImages: !!(service.galleryImages || service.logoImage),
        hasLocation: !!(service.locationLat && service.locationLon)
      },
      createdAt: service.createdAt,
      // Limited to basic fields
      subscriptionLevel: 'FREE'
    }));

    res.json({
      success: true,
      data: formattedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      subscriptionTier: 'FREE',
      message: 'Basic service data. Upgrade to MEDICAL_CARD for enhanced features.',
      upgradeInfo: {
        availablePlans: ['MEDICAL_CARD', 'ALL_INCLUSIVE'],
        features: {
          MEDICAL_CARD: ['Medical discounts', 'Full contact info', 'Direct booking'],
          ALL_INCLUSIVE: ['All discounts', 'Premium features', 'Advanced search']
        }
      }
    });

  } catch (error) {
    console.error('Free tier view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load service data'
    });
  }
});

// ============================
// MEDICAL_CARD TIER VIEW
// ============================
// GET /api/subscription-views/medical-card - Get enhanced medical data
router.get('/medical-card', auth, authWithSubscription, async (req, res) => {
  try {
    // Check user has MEDICAL_CARD or higher subscription
    const userSub = req.user.userSubscription;
    if (!userSub || !['MEDICAL_CARD', 'ALL_INCLUSIVE'].includes(userSub.planType)) {
      return res.status(403).json({
        success: false,
        message: 'MEDICAL_CARD or higher subscription required',
        currentPlan: userSub?.planType || 'FREE'
      });
    }

    const { city, category, limit = 20, page = 1 } = req.query;
    
    // Build filters - prioritize medical categories for MEDICAL_CARD users
    const filters = {};
    if (city) filters.city = { contains: city, mode: 'insensitive' };

    const services = await prisma.service.findMany({
      where: {
        available: true,
        deletedAt: null,
        ...filters,
        ...(category && {
          category: {
            some: {
              name: { contains: category, mode: 'insensitive' }
            }
          }
        })
      },
      include: {
        translation: {
          select: {
            name_ar: true,
            name_en: true,
            description_ar: true,
            description_en: true
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
        // Full owner information for medical card users
        ownerUser: {
          select: {
            id: true,
            name: true,
            phone: true,
            isVerified: true,
            verifiedBadge: true
          }
        },
        // Include offers for medical card users
        offers: {
          where: {
            isActive: true,
            validUntil: {
              gte: new Date()
            },
            OR: [
              { requiresPlan: false },
              { 
                AND: [
                  { requiresPlan: true },
                  { level: { in: ['BASIC', 'STANDARD'] } }
                ]
              }
            ]
          },
          select: {
            id: true,
            title: true,
            discountValue: true,
            discountType: true,
            validUntil: true
          }
        }
      },
      orderBy: [
        { isdefault: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.service.count({
      where: {
        available: true,
        deletedAt: null,
        ...filters,
        ...(category && {
          category: {
            some: {
              name: { contains: category, mode: 'insensitive' }
            }
          }
        })
      }
    });

    // Format data for MEDICAL_CARD tier - enhanced information
    const formattedServices = services.map(service => ({
      id: service.id,
      name: {
        ar: service.translation?.name_ar || service.embeddingText,
        en: service.translation?.name_en || service.embeddingText
      },
      description: {
        ar: service.translation?.description_ar || '',
        en: service.translation?.description_en || ''
      },
      category: service.category?.[0]?.name || 'Unknown',
      subCategory: service.subCategory?.name,
      city: service.city,
      // Full location info for medical card users
      location: {
        lat: service.locationLat,
        lon: service.locationLon,
        available: !!(service.locationLat && service.locationLon),
        precise: true
      },
      // Enhanced provider info
      provider: {
        id: service.ownerUser?.id,
        name: service.ownerUser?.name || 'Business Owner',
        phone: service.ownerUser?.phone,
        verified: service.ownerUser?.isVerified || false,
        verifiedBadge: service.ownerUser?.verifiedBadge
      },
      // Contact information available for medical card
      contact: {
        phone: service.phone || service.ownerUser?.phone,
        available: !!(service.phone || service.ownerUser?.phone)
      },
      // Images and media
      media: {
        logo: service.logoImage,
        cover: service.coverImage,
        gallery: service.galleryImages ? JSON.parse(service.galleryImages) : []
      },
      // Pricing info
      pricing: {
        basePrice: service.price,
        currency: service.currency,
        duration: service.durationMins
      },
      // Available offers for medical card users
      offers: service.offers.map(offer => ({
        id: offer.id,
        title: offer.title,
        discount: {
          value: offer.discountValue,
          type: offer.discountType
        },
        validUntil: offer.validUntil,
        eligibleForPlan: true
      })),
      // Medical discount indicator
      medicalDiscount: {
        available: userSub.hasMedicalDiscounts,
        category: service.category?.some(cat => 
          cat.name.includes('طب') || cat.name.toLowerCase().includes('medical')
        )
      },
      features: {
        hasImages: !!(service.galleryImages || service.logoImage),
        hasLocation: !!(service.locationLat && service.locationLon),
        hasOffers: service.offers.length > 0,
        canBook: true // Medical card users can book
      },
      createdAt: service.createdAt,
      subscriptionLevel: 'MEDICAL_CARD'
    }));

    res.json({
      success: true,
      data: formattedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      subscriptionTier: 'MEDICAL_CARD',
      userBenefits: {
        medicalDiscounts: userSub.hasMedicalDiscounts,
        familyMembers: userSub.maxFamilyMembers,
        cardNumber: userSub.cardNumber
      },
      message: 'Enhanced medical data with discounts available.'
    });

  } catch (error) {
    console.error('Medical card tier view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load enhanced service data'
    });
  }
});

// ============================
// ALL_INCLUSIVE TIER VIEW
// ============================
// GET /api/subscription-views/all-inclusive - Get full premium data
router.get('/all-inclusive', auth, authWithSubscription, async (req, res) => {
  try {
    // Check user has ALL_INCLUSIVE subscription
    const userSub = req.user.userSubscription;
    if (!userSub || userSub.planType !== 'ALL_INCLUSIVE') {
      return res.status(403).json({
        success: false,
        message: 'ALL_INCLUSIVE subscription required',
        currentPlan: userSub?.planType || 'FREE'
      });
    }

    const { 
      city, 
      category, 
      limit = 20, 
      page = 1,
      sortBy = 'priority',
      priceRange,
      hasOffers,
      verified
    } = req.query;
    
    // Build advanced filters for all-inclusive users
    const filters = {};
    if (city) filters.city = { contains: city, mode: 'insensitive' };
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filters.price = { gte: min, lte: max };
    }
    if (hasOffers === 'true') {
      filters.offers = { some: { isActive: true } };
    }
    if (verified === 'true') {
      filters.ownerUser = { isVerified: true };
    }

    // Advanced sorting for premium users
    let orderBy = [{ isdefault: 'desc' }];
    switch (sortBy) {
      case 'price_low':
        orderBy.push({ price: 'asc' });
        break;
      case 'price_high':
        orderBy.push({ price: 'desc' });
        break;
      case 'newest':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'verified':
        orderBy.push({ ownerUser: { isVerified: 'desc' } });
        break;
      default:
        orderBy.push({ createdAt: 'desc' });
    }

    const services = await prisma.service.findMany({
      where: {
        available: true,
        deletedAt: null,
        ...filters,
        ...(category && {
          category: {
            some: {
              name: { contains: category, mode: 'insensitive' }
            }
          }
        })
      },
      include: {
        translation: {
          select: {
            name_ar: true,
            name_en: true,
            description_ar: true,
            description_en: true
          }
        },
        category: true, // Full category info for premium
        subCategory: true,
        // Full owner and shop information
        ownerUser: {
          include: {
            providerSubscription: {
              select: {
                planType: true,
                searchPriority: true,
                hasPriorityBadge: true
              }
            }
          }
        },
        shop: {
          include: {
            address: true
          }
        },
        // All offers for premium users
        offers: {
          where: {
            isActive: true,
            validUntil: {
              gte: new Date()
            }
          }
        },
        // Reviews and ratings
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                isVerified: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        // Service availability
        availability: true,
        // Tags for enhanced search
        tags: true
      },
      orderBy,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await prisma.service.count({
      where: {
        available: true,
        deletedAt: null,
        ...filters,
        ...(category && {
          category: {
            some: {
              name: { contains: category, mode: 'insensitive' }
            }
          }
        })
      }
    });

    // Format data for ALL_INCLUSIVE tier - complete information
    const formattedServices = services.map(service => ({
      id: service.id,
      name: {
        ar: service.translation?.name_ar || service.embeddingText,
        en: service.translation?.name_en || service.embeddingText
      },
      description: {
        ar: service.translation?.description_ar || '',
        en: service.translation?.description_en || ''
      },
      categories: service.category.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })),
      subCategory: service.subCategory ? {
        id: service.subCategory.id,
        name: service.subCategory.name,
        slug: service.subCategory.slug
      } : null,
      city: service.city,
      // Precise location for premium users
      location: {
        lat: service.locationLat,
        lon: service.locationLon,
        available: !!(service.locationLat && service.locationLon),
        precise: true,
        address: service.shop?.address ? {
          ar: service.shop.address.text_ar,
          en: service.shop.address.text_en
        } : null
      },
      // Complete provider information
      provider: {
        id: service.ownerUser?.id,
        name: service.ownerUser?.name || 'Business Owner',
        phone: service.ownerUser?.phone,
        email: service.ownerUser?.email,
        verified: service.ownerUser?.isVerified || false,
        verifiedBadge: service.ownerUser?.verifiedBadge,
        bio: service.ownerUser?.bio,
        profilePic: service.ownerUser?.profilePic,
        subscription: {
          type: service.ownerUser?.providerSubscription?.planType,
          priority: service.ownerUser?.providerSubscription?.searchPriority,
          hasBadge: service.ownerUser?.providerSubscription?.hasPriorityBadge
        }
      },
      // Full contact information
      contact: {
        phone: service.phone || service.ownerUser?.phone,
        email: service.ownerUser?.email,
        website: service.shop?.website,
        available: true
      },
      // Complete media gallery
      media: {
        logo: service.logoImage,
        cover: service.coverImage,
        gallery: service.galleryImages ? JSON.parse(service.galleryImages) : [],
        shopImages: service.shop ? {
          logo: service.shop.logoImage,
          cover: service.shop.coverImage,
          gallery: service.shop.galleryImages ? JSON.parse(service.shop.galleryImages) : []
        } : null
      },
      // Detailed pricing
      pricing: {
        basePrice: service.price,
        currency: service.currency,
        duration: service.durationMins,
        flexible: true // Premium users see flexible pricing
      },
      // All available offers
      offers: service.offers.map(offer => ({
        id: offer.id,
        title: offer.title,
        description: offer.description,
        discount: {
          value: offer.discountValue,
          type: offer.discountType,
          maxAmount: offer.maxDiscountAmount
        },
        validFrom: offer.validFrom,
        validUntil: offer.validUntil,
        level: offer.level,
        eligibleForPlan: true,
        canUse: true // All-inclusive users can use all offers
      })),
      // Service availability schedule
      availability: service.availability.map(slot => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring
      })),
      // Reviews and ratings
      reviews: {
        summary: {
          total: service.reviews.length,
          average: service.reviews.length > 0 ? 
            service.reviews.reduce((sum, rev) => sum + rev.rating, 0) / service.reviews.length : 0
        },
        recent: service.reviews.slice(0, 3).map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          author: {
            name: review.author.name,
            verified: review.author.isVerified
          },
          createdAt: review.createdAt
        }))
      },
      // Tags for enhanced discovery
      tags: service.tags.map(tag => ({
        id: tag.id,
        name: tag.name
      })),
      // Premium discounts
      premiumDiscounts: {
        allCategories: userSub.hasAllCategoryDiscounts,
        available: true,
        percentage: 10 // Example premium discount
      },
      // Advanced features for all-inclusive
      features: {
        hasImages: !!(service.galleryImages || service.logoImage),
        hasLocation: !!(service.locationLat && service.locationLon),
        hasOffers: service.offers.length > 0,
        canBook: true,
        canMessage: true,
        canReview: true,
        prioritySupport: true,
        advancedFilters: true
      },
      // Quality indicators
      quality: {
        verified: service.ownerUser?.isVerified,
        hasReviews: service.reviews.length > 0,
        averageRating: service.reviews.length > 0 ? 
          service.reviews.reduce((sum, rev) => sum + rev.rating, 0) / service.reviews.length : 0,
        responseRate: 95, // Example metric
        completionRate: 98 // Example metric
      },
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      subscriptionLevel: 'ALL_INCLUSIVE'
    }));

    res.json({
      success: true,
      data: formattedServices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      subscriptionTier: 'ALL_INCLUSIVE',
      userBenefits: {
        allCategoryDiscounts: userSub.hasAllCategoryDiscounts,
        medicalDiscounts: userSub.hasMedicalDiscounts,
        familyMembers: userSub.maxFamilyMembers,
        cardNumber: userSub.cardNumber,
        premiumFeatures: [
          'Advanced search filters',
          'Priority booking',
          'Exclusive offers',
          'Direct messaging',
          'Premium support'
        ]
      },
      advancedFeatures: {
        sortingOptions: ['priority', 'price_low', 'price_high', 'newest', 'verified'],
        filterOptions: ['priceRange', 'hasOffers', 'verified', 'availability'],
        exportOptions: ['PDF', 'CSV', 'favorites']
      },
      message: 'Complete premium service data with all features unlocked.'
    });

  } catch (error) {
    console.error('All-inclusive tier view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load premium service data'
    });
  }
});

// ============================
// DYNAMIC VIEW ENDPOINT
// ============================
// GET /api/subscription-views/services - Auto-detect user's subscription and serve appropriate view
router.get('/services', auth, async (req, res) => {
  try {
    // Get user's subscription level
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        userSubscription: true
      }
    });

    const subscriptionLevel = user?.userSubscription?.planType || 'FREE';

    // Redirect to appropriate endpoint based on subscription
    switch (subscriptionLevel) {
      case 'FREE':
        req.url = '/free' + (req.url.includes('?') ? '&' + req.url.split('?')[1] : '');
        return router.handle(req, res);
        
      case 'MEDICAL_CARD':
        req.url = '/medical-card' + (req.url.includes('?') ? '&' + req.url.split('?')[1] : '');
        return router.handle(req, res);
        
      case 'ALL_INCLUSIVE':
        req.url = '/all-inclusive' + (req.url.includes('?') ? '&' + req.url.split('?')[1] : '');
        return router.handle(req, res);
        
      default:
        // Default to free tier
        req.url = '/free' + (req.url.includes('?') ? '&' + req.url.split('?')[1] : '');
        return router.handle(req, res);
    }

  } catch (error) {
    console.error('Dynamic view routing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to determine subscription level'
    });
  }
});

export default router;
