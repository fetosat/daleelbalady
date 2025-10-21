import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || 'daleelAiSecret';
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// POST /api/provider/services - Create WITHOUT file upload temporarily
router.post('/services', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, category, description, price, duration, isActive, shopId } = req.body;
        
        console.log('Creating service without images for now...');
        console.log('Request body:', req.body);

        // Validate required fields
        if (!name || !price || !duration) {
            return res.status(400).json({
                success: false,
                error: 'Name, price, and duration are required'
            });
        }

        // Get or create shop
        let finalShopId = shopId;
        if (!finalShopId) {
            const userShops = await prisma.shop.findFirst({
                where: {
                    ownerId: userId,
                    deletedAt: null
                }
            });

            if (userShops) {
                finalShopId = userShops.id;
            } else {
                const defaultShop = await prisma.shop.create({
                    data: {
                        name: `${req.userName || 'My'} Services`,
                        slug: `services-${userId}-${Date.now()}`,
                        ownerId: userId,
                        city: 'Cairo'
                    }
                });
                finalShopId = defaultShop.id;
            }
        }

        // Create service translation
        const translation = await prisma.service_translation.create({
            data: {
                name_en: name,
                name_ar: name,
                description_en: description || '',
                description_ar: description || ''
            }
        });

        // Create the service WITHOUT IMAGES
        const service = await prisma.service.create({
            data: {
                price: parseFloat(price),
                durationMins: parseInt(duration),
                currency: 'EGP',
                available: isActive !== undefined ? isActive === 'true' : true,
                shop: {
                    connect: { id: finalShopId }
                },
                embeddingText: name,
                ownerUserId: userId,
                translationId: translation.id
            },
            include: {
                translation: true,
                shop: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });

        // Add category tag if provided
        if (category) {
            try {
                const tag = await prisma.tags.upsert({
                    where: { name: category },
                    update: {},
                    create: { name: category }
                });

                await prisma.service.update({
                    where: { id: service.id },
                    data: {
                        tags: {
                            connect: { id: tag.id }
                        }
                    }
                });
            } catch (tagError) {
                console.error('Error adding tag:', tagError);
            }
        }

        // Fetch the updated service
        const updatedService = await prisma.service.findUnique({
            where: { id: service.id },
            include: {
                translation: true,
                shop: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                tags: true
            }
        });
        
        res.status(201).json({
            success: true,
            service: {
                ...updatedService,
                name: updatedService.translation.name_en,
                description: updatedService.translation.description_en,
                images: [],
                coverImage: null,
                logoImage: null,
                galleryImages: null
            }
        });

    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create service',
            details: error.message
        });
    }
});

// Export other routes from original provider
export { default as originalRouter } from './provider.js';
export default router;
