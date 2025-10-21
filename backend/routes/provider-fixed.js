import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Helper to handle file uploads without multer
async function handleFileUpload(req) {
    return new Promise((resolve, reject) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'services');
        
        // Ensure upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = formidable({
            uploadDir: uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            filename: (name, ext, part) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `images-${uniqueSuffix}${ext}`;
            }
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }

            // Process files array
            const uploadedFiles = [];
            const fileArray = Array.isArray(files.images) ? files.images : (files.images ? [files.images] : []);
            
            fileArray.forEach(file => {
                if (file && file.newFilename) {
                    uploadedFiles.push({
                        filename: file.newFilename,
                        originalname: file.originalFilename,
                        size: file.size,
                        mimetype: file.mimetype
                    });
                }
            });

            resolve({ fields, files: uploadedFiles });
        });
    });
}

// GET /api/provider/services - Get all services for the authenticated provider
router.get('/services', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20, search, category, isActive } = req.query;

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

        if (category) {
            whereClause.tags = {
                some: {
                    name: { equals: category }
                }
            };
        }

        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
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
                tags: true,
                reviews: {
                    select: {
                        rating: true
                    }
                },
                bookings: {
                    select: {
                        id: true,
                        status: true
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

        // Calculate stats for each service
        const servicesWithStats = services.map(service => {
            const totalReviews = service.reviews.length;
            const avgRating = totalReviews > 0
                ? service.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                : 0;
            const totalBookings = service.bookings.length;
            const completedBookings = service.bookings.filter(b => b.status === 'COMPLETED').length;

            // Handle images from correct schema fields
            const images = [];
            
            // Parse galleryImages JSON string
            if (service.galleryImages) {
                try {
                    const galleryArray = typeof service.galleryImages === 'string' 
                        ? JSON.parse(service.galleryImages) 
                        : service.galleryImages;
                    if (Array.isArray(galleryArray)) {
                        images.push(...galleryArray);
                    }
                } catch (e) {
                    // If not JSON, treat as single image URL
                    images.push(service.galleryImages);
                }
            }
            
            // Add cover and logo images
            if (service.coverImage) {
                images.unshift(service.coverImage); // Add cover image first
            }
            if (service.logoImage && !images.includes(service.logoImage)) {
                images.push(service.logoImage);
            }
            
            return {
                id: service.id,
                name: service.translation?.name_en || service.translation?.name_ar || 'Unnamed Service',
                description: service.translation?.description_en || service.translation?.description_ar || '',
                price: service.price,
                duration: service.durationMins,
                currency: service.currency || 'EGP',
                isActive: service.available,
                shopId: service.shopId,
                shop: service.shop,
                tags: service.tags,
                translation: service.translation,
                images: images,
                coverImage: service.coverImage,
                logoImage: service.logoImage,
                galleryImages: service.galleryImages,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
                rating: parseFloat(avgRating.toFixed(1)),
                totalBookings: totalBookings,
                stats: {
                    totalBookings,
                    completedBookings,
                    avgRating: parseFloat(avgRating.toFixed(1)),
                    totalReviews
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

// POST /api/provider/services - Create a new service (WITHOUT MULTER)
router.post('/services', verifyToken, async (req, res) => {
    try {
        console.log('Creating service - parsing form data...');
        
        // Handle file upload with formidable
        const { fields, files } = await handleFileUpload(req);
        
        const userId = req.userId;
        const { name, category, description, price, duration, isActive, availability, shopId } = fields;
        
        console.log('Fields received:', fields);
        console.log('Files received:', files.length);

        // Validate required fields
        if (!name || !price || !duration) {
            return res.status(400).json({
                success: false,
                error: 'Name, price, and duration are required'
            });
        }

        // Get or create shop for user if shopId not provided
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
                // Create a default shop for the user
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
                name_en: String(name),
                name_ar: String(name),
                description_en: String(description || ''),
                description_ar: String(description || '')
            }
        });

        // Create the service
        const service = await prisma.service.create({
            data: {
                price: parseFloat(String(price)),
                durationMins: parseInt(String(duration)),
                currency: 'EGP',
                available: isActive !== undefined ? String(isActive) === 'true' : true,
                shop: {
                    connect: { id: finalShopId }
                },
                embeddingText: String(name),
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

        // Handle uploaded images
        if (files && files.length > 0) {
            const imageUrls = files.map(file => `/uploads/services/${file.filename}`);
            console.log('Image URLs:', imageUrls);
            
            // Update service with image URLs
            await prisma.service.update({
                where: { id: service.id },
                data: {
                    coverImage: imageUrls[0] || null,
                    galleryImages: JSON.stringify(imageUrls)
                }
            });
        }

        // Add category tag if provided
        if (category) {
            try {
                const tag = await prisma.tags.upsert({
                    where: { name: String(category) },
                    update: {},
                    create: { name: String(category) }
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
                name: updatedService.translation.name_en || updatedService.translation.name_ar,
                description: updatedService.translation.description_en || updatedService.translation.description_ar,
                images: (() => {
                    const imgs = [];
                    if (updatedService.galleryImages) {
                        try {
                            const gallery = typeof updatedService.galleryImages === 'string' 
                                ? JSON.parse(updatedService.galleryImages) 
                                : updatedService.galleryImages;
                            if (Array.isArray(gallery)) imgs.push(...gallery);
                        } catch (e) {
                            imgs.push(updatedService.galleryImages);
                        }
                    }
                    if (updatedService.coverImage) imgs.unshift(updatedService.coverImage);
                    if (updatedService.logoImage && !imgs.includes(updatedService.logoImage)) imgs.push(updatedService.logoImage);
                    return imgs;
                })(),
                coverImage: updatedService.coverImage,
                logoImage: updatedService.logoImage,
                galleryImages: updatedService.galleryImages
            }
        });

    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create service',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Export remaining endpoints...
export default router;
