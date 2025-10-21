import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const prisma = new PrismaClient();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directory - use absolute path from project root
const uploadDir = path.resolve(process.cwd(), 'uploads', 'services');
console.log('Upload directory configured at:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    console.log('Creating upload directory:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer with MEMORY storage first, then save manually
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage to avoid file path issues
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Helper to save files from memory to disk
function saveFilesToDisk(files) {
    const savedFiles = [];
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
        console.log('Creating upload directory:', uploadDir);
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    for (const file of files) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'images-' + uniqueSuffix + path.extname(file.originalname);
        const filepath = path.join(uploadDir, filename);
        
        console.log('Saving file to:', filepath);
        console.log('File buffer size:', file.buffer ? file.buffer.length : 'No buffer');
        
        // Write file from buffer to disk
        try {
            fs.writeFileSync(filepath, file.buffer);
            console.log('File saved successfully');
        } catch (err) {
            console.error('Error saving file:', err);
            throw err;
        }
        
        savedFiles.push({
            filename: filename,
            url: `/uploads/services/${filename}`
        });
    }
    
    return savedFiles;
}

// Test endpoint for debugging file upload
router.post('/test-upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/services/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Test upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
                images: images, // Add images array
                coverImage: service.coverImage,
                logoImage: service.logoImage,
                galleryImages: service.galleryImages,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt,
                // Keep backward compatibility
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

// POST /api/provider/services - Create a new service
router.post('/services', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, category, description, price, duration, isActive, availability, shopId, images } = req.body;
        
        console.log('🎯 Full request body:', JSON.stringify(req.body, null, 2));
        console.log('📷 Images from body:', images);
        
        console.log('Creating service with userId:', userId);
        console.log('Request body:', req.body);
        console.log('Files:', req.files ? req.files.length : 0);

        // Validate required fields
        if (!name || !price || !duration) {
            console.error('Missing required fields:', { name: !!name, price: !!price, duration: !!duration });
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
                        city: 'Cairo' // Default city
                    }
                });
                finalShopId = defaultShop.id;
            }
        }

        // Create service translation
        console.log('Creating translation with:', { name, description });
        const translation = await prisma.service_translation.create({
            data: {
                name_en: name,
                name_ar: name, // Use same name for both languages by default
                description_en: description || '',
                description_ar: description || ''
            }
        });
        console.log('Translation created:', translation.id);

        // Create the service
        console.log('Creating service with data:', {
            price: parseFloat(price),
            durationMins: parseInt(duration),
            currency: 'EGP',
            available: isActive !== undefined ? isActive === 'true' : true,
            finalShopId,
            userId,
            translationId: translation.id
        });
        const service = await prisma.service.create({
            data: {
                price: parseFloat(price),
                durationMins: parseInt(duration),
                currency: 'EGP',
                available: isActive !== undefined ? isActive === 'true' : true,
                shop: {
                    connect: { id: finalShopId }
                },
                embeddingText: `${translation.name_en || translation.name_ar}`,
                ownerUser: {
                    connect: { id: userId }
                },
                translation: {
                    connect: { id: translation.id }
                }
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
        console.log('Service created:', service.id);

        // Add availability records if provided
        if (availability) {
            const availData = typeof availability === 'string' ? JSON.parse(availability) : availability;
            
            if (availData.days && Array.isArray(availData.days)) {
                // Create availability records for each day
                for (const day of availData.days) {
                    await prisma.serviceAvailability.create({
                        data: {
                            serviceId: service.id,
                            dayOfWeek: day.toUpperCase(),
                            startTime: availData.startTime || '09:00',
                            endTime: availData.endTime || '18:00',
                            isRecurring: true
                        }
                    });
                }
            }
        }

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

        // Handle images from request body (already uploaded URLs)
        let imageUrls = [];
        if (images && Array.isArray(images)) {
            imageUrls = images;
            console.log('Received image URLs from client:', imageUrls);
            
            // Update service with image URLs using correct schema fields
            console.log('🎨 Updating service with images:', {
                serviceId: service.id,
                coverImage: imageUrls[0] || null,
                galleryImages: JSON.stringify(imageUrls)
            });
            
            const updatedWithImages = await prisma.service.update({
                where: { id: service.id },
                data: {
                    coverImage: imageUrls[0] || null, // Set first image as cover
                    galleryImages: JSON.stringify(imageUrls) // Store all images as JSON string
                }
            });
            console.log('✅ Service updated with images:', {
                id: updatedWithImages.id,
                coverImage: updatedWithImages.coverImage,
                galleryImages: updatedWithImages.galleryImages
            });
        }

        // Fetch the updated service with images
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
        
        // Fetch the updated service to ensure we have the latest data with images
        const finalService = await prisma.service.findUnique({
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
        
        // Build images array from the database
        const serviceImages = [];
        if (finalService.galleryImages) {
            try {
                const gallery = typeof finalService.galleryImages === 'string' 
                    ? JSON.parse(finalService.galleryImages) 
                    : finalService.galleryImages;
                if (Array.isArray(gallery)) {
                    serviceImages.push(...gallery);
                }
            } catch (e) {
                console.error('Error parsing galleryImages:', e);
                if (typeof finalService.galleryImages === 'string') {
                    serviceImages.push(finalService.galleryImages);
                }
            }
        }
        if (finalService.coverImage && !serviceImages.includes(finalService.coverImage)) {
            serviceImages.unshift(finalService.coverImage);
        }
        if (finalService.logoImage && !serviceImages.includes(finalService.logoImage)) {
            serviceImages.push(finalService.logoImage);
        }
        
        console.log('✅ Final service images array:', serviceImages);
        
        res.status(201).json({
            success: true,
            service: {
                ...finalService,
                name: finalService.translation.name_en || finalService.translation.name_ar,
                description: finalService.translation.description_en || finalService.translation.description_ar,
                images: serviceImages, // Return the processed images array
                category: finalService.tags?.[0]?.name || '',
                duration: finalService.durationMins,
                isActive: finalService.available
            }
        });

    } catch (error) {
        console.error('Error creating service:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        res.status(500).json({
            success: false,
            error: 'Failed to create service',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT /api/provider/services/:id - Update a service
router.put('/services/:id', verifyToken, upload.array('images', 5), async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { name, category, description, price, duration, isActive, availability } = req.body;

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
        if (name || description) {
            await prisma.service_translation.update({
                where: { id: existingService.translationId },
                data: {
                    ...(name && { name_en: name, name_ar: name }),
                    ...(description && { description_en: description, description_ar: description })
                }
            });
        }

        // Update the service
        const service = await prisma.service.update({
            where: { id },
            data: {
                ...(price && { price: parseFloat(price) }),
                ...(duration && { durationMins: parseInt(duration) }),
                ...(isActive !== undefined && { 
                    available: isActive === 'true'
                })
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
                tags: true
            }
        });

        // Update availability records if provided
        if (availability) {
            const availData = typeof availability === 'string' ? JSON.parse(availability) : availability;
            
            // Delete existing availability records
            await prisma.serviceAvailability.deleteMany({
                where: { serviceId: id }
            });
            
            // Create new availability records
            if (availData.days && Array.isArray(availData.days)) {
                for (const day of availData.days) {
                    await prisma.serviceAvailability.create({
                        data: {
                            serviceId: id,
                            dayOfWeek: day.toUpperCase(),
                            startTime: availData.startTime || '09:00',
                            endTime: availData.endTime || '18:00',
                            isRecurring: true
                        }
                    });
                }
            }
        }

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            try {
                const savedFiles = saveFilesToDisk(req.files);
                const imageUrls = savedFiles.map(f => f.url);
                console.log('Updating service images:', imageUrls);
            
            // Update service with new image URLs using correct schema fields
            await prisma.service.update({
                where: { id },
                data: {
                    coverImage: imageUrls[0] || null, // Set first image as cover
                    galleryImages: JSON.stringify(imageUrls) // Store all images as JSON string
                }
            });
            } catch (err) {
                console.error('Error saving files:', err);
            }
        }
        
        // Update category tag if provided
        if (category) {
            try {
                // Remove old tags
                await prisma.service.update({
                    where: { id },
                    data: {
                        tags: {
                            set: []
                        }
                    }
                });

                // Add new tag
                const tag = await prisma.tags.upsert({
                    where: { name: category },
                    update: {},
                    create: { name: category }
                });

                await prisma.service.update({
                    where: { id },
                    data: {
                        tags: {
                            connect: { id: tag.id }
                        }
                    }
                });
            } catch (tagError) {
                console.error('Error updating tag:', tagError);
            }
        }

        // Fetch the updated service with images
        const updatedService = await prisma.service.findUnique({
            where: { id },
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
        
        res.json({
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
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update service'
        });
    }
});

// DELETE /api/provider/services/:id - Soft delete a service
router.delete('/services/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Check if service exists and belongs to user
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                ownerUserId: userId,
                deletedAt: null
            }
        });

        if (!existingService) {
            return res.status(404).json({
                success: false,
                error: 'Service not found or you do not have permission to delete it'
            });
        }

        // Soft delete the service
        await prisma.service.update({
            where: { id },
            data: {
                deletedAt: new Date()
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
            error: 'Failed to delete service'
        });
    }
});

// PATCH /api/provider/services/:id/toggle-status - Toggle service active status
router.patch('/services/:id/toggle-status', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Check if service exists and belongs to user
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                ownerUserId: userId,
                deletedAt: null
            }
        });

        if (!existingService) {
            return res.status(404).json({
                success: false,
                error: 'Service not found or you do not have permission to edit it'
            });
        }

        // Toggle the status
        const service = await prisma.service.update({
            where: { id },
            data: {
                available: !existingService.available
            },
            include: {
                translation: true
            }
        });

        res.json({
            success: true,
            service: {
                ...service,
                name: service.translation.name_en
            },
            message: `Service ${service.available ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle service status'
        });
    }
});

// GET /api/provider/bookings - Get all bookings for provider's services
router.get('/bookings', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { status, page = 1, limit = 50, sortBy = 'startAt', sortOrder = 'desc' } = req.query;

        // Build where clause
        const whereClause = {
            service: {
                ownerUserId: userId
            }
        };

        if (status) {
            whereClause.status = status;
        }

        // Get bookings
        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                service: {
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
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        const totalBookings = await prisma.booking.count({
            where: whereClause
        });

        // Format bookings for response
        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            serviceId: booking.serviceId,
            serviceName: booking.service.translation?.name_en || booking.service.translation?.name_ar || 'Unnamed Service',
            shopName: booking.service.shop?.name || '',
            customer: {
                id: booking.user.id,
                name: booking.user.name,
                email: booking.user.email,
                phone: booking.user.phone
            },
            startAt: booking.startAt,
            endAt: booking.endAt,
            status: booking.status,
            price: booking.price,
            currency: booking.service.currency || 'EGP',
            duration: booking.durationMins,
            notes: booking.notes || '',
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
        }));

        res.json({
            success: true,
            bookings: formattedBookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalBookings,
                pages: Math.ceil(totalBookings / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching provider bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings'
        });
    }
});

// PATCH /api/provider/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Check if booking exists and belongs to provider's service
        const existingBooking = await prisma.booking.findFirst({
            where: {
                id,
                service: {
                    ownerUserId: userId
                }
            },
            include: {
                service: {
                    include: {
                        translation: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!existingBooking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found or you do not have permission to update it'
            });
        }

        // Update the booking status
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status },
            include: {
                service: {
                    include: {
                        translation: true,
                        shop: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        // Format response
        const formattedBooking = {
            id: updatedBooking.id,
            serviceId: updatedBooking.serviceId,
            serviceName: updatedBooking.service.translation?.name_en || updatedBooking.service.translation?.name_ar || 'Unnamed Service',
            shopName: updatedBooking.service.shop?.name || '',
            customer: {
                id: updatedBooking.user.id,
                name: updatedBooking.user.name,
                email: updatedBooking.user.email,
                phone: updatedBooking.user.phone
            },
            scheduledFor: updatedBooking.scheduledFor,
            status: updatedBooking.status,
            price: updatedBooking.price,
            currency: updatedBooking.service.currency || 'EGP',
            duration: updatedBooking.service.durationMins,
            notes: updatedBooking.notes || '',
            createdAt: updatedBooking.createdAt,
            updatedAt: updatedBooking.updatedAt
        };

        res.json({
            success: true,
            booking: formattedBooking,
            message: `Booking status updated to ${status}`
        });

    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update booking status'
        });
    }
});

// GET /api/provider/stats - Get provider dashboard stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get services count
        const totalServices = await prisma.service.count({
            where: {
                ownerUserId: userId,
                deletedAt: null
            }
        });

        const activeServices = await prisma.service.count({
            where: {
                ownerUserId: userId,
                available: true,
                deletedAt: null
            }
        });

        // Get bookings stats
        const totalBookings = await prisma.booking.count({
            where: {
                service: {
                    ownerUserId: userId
                }
            }
        });

        const completedBookings = await prisma.booking.count({
            where: {
                service: {
                    ownerUserId: userId
                },
                status: 'COMPLETED'
            }
        });

        // Get revenue
        const bookings = await prisma.booking.findMany({
            where: {
                service: {
                    ownerUserId: userId
                },
                status: { in: ['COMPLETED', 'CONFIRMED'] }
            },
            select: {
                price: true
            }
        });

        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.price, 0);

        // Get average rating
        const services = await prisma.service.findMany({
            where: {
                ownerUserId: userId,
                deletedAt: null
            },
            include: {
                reviews: {
                    select: {
                        rating: true
                    }
                }
            }
        });

        let totalRating = 0;
        let totalReviews = 0;
        services.forEach(service => {
            service.reviews.forEach(review => {
                totalRating += review.rating;
                totalReviews++;
            });
        });

        const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        res.json({
            success: true,
            stats: {
                totalServices,
                activeServices,
                totalBookings,
                completedBookings,
                totalRevenue,
                avgRating: parseFloat(avgRating.toFixed(1)),
                totalReviews
            }
        });

    } catch (error) {
        console.error('Error fetching provider stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stats'
        });
    }
});

// Test endpoint for debugging multer configuration
router.post('/test-upload', upload.array('images', 5), async (req, res) => {
    console.log('=== TEST UPLOAD ENDPOINT ===');
    console.log('Files received:', req.files?.length || 0);
    if (req.files) {
        req.files.forEach((file, index) => {
            console.log(`Test File ${index}:`, {
                originalname: file.originalname,
                filename: file.filename,
                path: file.path,
                destination: file.destination,
                size: file.size
            });
        });
    }
    res.json({ 
        success: true, 
        message: 'Test upload successful',
        files: req.files?.map(f => ({ 
            filename: f.filename, 
            path: f.path,
            destination: f.destination 
        })) || [] 
    });
});

export default router;

