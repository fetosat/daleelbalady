import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token (optional for some endpoints)
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { id: decoded.userId, role: decoded.role };
        } catch (error) {
            // Token invalid, but we continue without user (optional auth)
            req.user = null;
        }
    }
    next();
};

// Required auth middleware
const requireAuth = (req, res, next) => {
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

// GET /api/offers - Get all offers with filtering
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            categoryId,
            subCategoryId,
            search,
            featured,
            isActive = 'true',
            page = 1,
            limit = 10,
            level,
            targetType,
            sortBy = 'discount'
        } = req.query;

        // Build where conditions
        const where = {};

        // Filter by active status
        if (isActive === 'true') {
            where.isActive = true;
            where.validFrom = { lte: new Date() };
            where.OR = [
                { validUntil: null },
                { validUntil: { gte: new Date() } }
            ];
        }

        // Filter by featured
        if (featured === 'true') {
            where.level = { in: ['PREMIUM', 'EXCLUSIVE'] };
        }

        // Filter by level
        if (level) {
            where.level = level.toUpperCase();
        }

        // Filter by target type
        if (targetType) {
            where.targetType = targetType.toUpperCase();
        }

        // Filter by category ID
        if (categoryId) {
            where.categories = {
                some: {
                    id: categoryId
                }
            };
        }

        // Filter by subcategory ID
        if (subCategoryId) {
            where.categories = {
                some: {
                    subCategories: {
                        some: {
                            id: subCategoryId
                        }
                    }
                }
            };
        }

        // Search functionality
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { shortDescription: { contains: search } }
            ];
        }

        // Sorting
        let orderBy = {};
        switch (sortBy) {
            case 'discount':
                orderBy = { discountValue: 'desc' };
                break;
            case 'date':
                orderBy = { createdAt: 'desc' };
                break;
            case 'popularity':
                orderBy = [{ viewCount: 'desc' }, { clickCount: 'desc' }];
                break;
            default:
                orderBy = { discountValue: 'desc' };
                break;
        }

        // Get total count
        const total = await prisma.offer.count({ where });

        // Get offers
        const offers = await prisma.offer.findMany({
            where,
            include: {
                provider: {
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
                        logoImage: true,
                        coverImage: true,
                        city: true,
                        isVerified: true
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                services: {
                    select: {
                        id: true,
                        coverImage: true,
                        translation: {
                            select: {
                                name_ar: true,
                                name_en: true
                            }
                        }
                    },
                    take: 3
                },
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    },
                    take: 3
                }
            },
            orderBy,
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        res.json({
            success: true,
            offers: offers,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/offers/:id - Get single offer by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await prisma.offer.findFirst({
            where: {
                id,
                isActive: true
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        profilePic: true,
                        isVerified: true,
                        phone: true,
                        email: true
                    }
                },
                shop: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        phone: true,
                        email: true,
                        website: true,
                        isVerified: true
                    }
                },
                categories: true,
                services: {
                    include: {
                        translation: true
                    }
                },
                products: true
            }
        });

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Check if offer is still valid
        const now = new Date();
        const isValid = offer.validFrom <= now && 
                       (!offer.validUntil || offer.validUntil >= now);

        if (!isValid) {
            return res.status(404).json({
                success: false,
                message: 'Offer is no longer valid'
            });
        }

        // Increment view count
        await prisma.offer.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        });

        // Transform to match frontend interface
        const transformedOffer = {
            id: offer.id,
            title: offer.title,
            description: offer.description,
            offerType: offer.discountType,
            discountValue: offer.discountValue,
            startDate: offer.validFrom?.toISOString(),
            endDate: offer.validUntil?.toISOString(),
            category: offer.categories[0]?.name || 'عام',
            usageLimit: offer.maxTotalUsage,
            terms: offer.shortDescription,
            featured: ['PREMIUM', 'EXCLUSIVE'].includes(offer.level),
            isActive: true,
            provider: {
                id: offer.provider.id,
                name: offer.provider.name,
                website: offer.shop?.website
            }
        };

        res.json({
            success: true,
            offer: transformedOffer
        });

    } catch (error) {
        console.error('Error fetching offer:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/offers - Create new offer (requires authentication and provider role)
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Verify user is a provider
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { providerSubscription: true }
        });

        if (!user || user.role !== 'PROVIDER') {
            return res.status(403).json({
                success: false,
                error: 'Only providers can create offers'
            });
        }

        const {
            title,
            description,
            shortDescription,
            level = 'BASIC',
            targetType = 'SERVICE',
            discountType = 'PERCENTAGE',
            discountValue,
            maxDiscountAmount,
            minPurchaseAmount,
            validFrom,
            validUntil,
            maxTotalUsage,
            maxUsagePerUser,
            categoryIds = [],
            serviceIds = [],
            productIds = [],
            shopId
        } = req.body;

        // Validation
        if (!title || !description || !discountValue) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, and discount value are required'
            });
        }

        if (discountType === 'PERCENTAGE' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({
                success: false,
                error: 'Percentage discount must be between 1 and 100'
            });
        }

        // Create the offer
        const offer = await prisma.offer.create({
            data: {
                title,
                description,
                shortDescription,
                level,
                targetType,
                discountType,
                discountValue,
                maxDiscountAmount,
                minPurchaseAmount,
                validFrom: validFrom ? new Date(validFrom) : new Date(),
                validUntil: validUntil ? new Date(validUntil) : null,
                maxTotalUsage,
                maxUsagePerUser,
                providerId: userId,
                shopId,
                categories: categoryIds.length > 0 ? {
                    connect: categoryIds.map(id => ({ id }))
                } : undefined,
                services: serviceIds.length > 0 ? {
                    connect: serviceIds.map(id => ({ id }))
                } : undefined,
                products: productIds.length > 0 ? {
                    connect: productIds.map(id => ({ id }))
                } : undefined
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        isVerified: true
                    }
                },
                categories: true
            }
        });

        res.status(201).json({
            success: true,
            offer
        });

    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/offers/:id/view - Increment offer view count
router.post('/:id/view', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if offer exists and is active
        const offer = await prisma.offer.findFirst({
            where: {
                id,
                isActive: true
            }
        });

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Increment view count
        await prisma.offer.update({
            where: { id },
            data: { 
                viewCount: { increment: 1 }
            }
        });

        res.json({
            success: true,
            message: 'View count updated successfully'
        });

    } catch (error) {
        console.error('Error updating offer view count:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
