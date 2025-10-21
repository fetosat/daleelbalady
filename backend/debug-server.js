import express from "express";
import cors from "cors";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from './generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const uploadDir = path.resolve(process.cwd(), 'uploads', 'services');
            console.log('Upload directory:', uploadDir);
            fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            console.error('Failed to prepare upload directory:', err);
            cb(err, undefined);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log('File filter:', file.originalname, file.mimetype);
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// JWT middleware
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || 'daleelAiSecret';
        console.log('JWT Secret available:', jwtSecret ? 'Yes' : 'No');
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Token decoded:', decoded);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// Test route
app.post('/api/provider/services', verifyToken, upload.array('images', 5), async (req, res) => {
    console.log('=== SERVICE CREATION REQUEST ===');
    console.log('User ID:', req.userId);
    console.log('Request body:', req.body);
    console.log('Files:', req.files?.length || 0);
    
    try {
        const userId = req.userId;
        const { name, category, description, price, duration, isActive, availability, shopId } = req.body;

        console.log('Extracted data:', { name, price, duration, userId });

        // Validate required fields
        if (!name || !price || !duration) {
            console.error('Missing required fields:', { name: !!name, price: !!price, duration: !!duration });
            return res.status(400).json({
                success: false,
                error: 'Name, price, and duration are required'
            });
        }

        // Test database connection first
        console.log('Testing database connection...');
        const userCount = await prisma.user.count();
        console.log('Database connected. User count:', userCount);

        // Check for existing shop
        console.log('Looking for shop...');
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
                console.log('Using existing shop:', finalShopId);
            } else {
                console.log('Creating new shop...');
                const defaultShop = await prisma.shop.create({
                    data: {
                        name: `Services ${userId}`,
                        slug: `services-${userId}-${Date.now()}`,
                        ownerId: userId,
                        city: 'Cairo'
                    }
                });
                finalShopId = defaultShop.id;
                console.log('Created shop:', finalShopId);
            }
        }

        // Create translation
        console.log('Creating translation...');
        const translation = await prisma.service_translation.create({
            data: {
                name_en: name,
                name_ar: name,
                description_en: description || '',
                description_ar: description || ''
            }
        });
        console.log('Translation created:', translation.id);

        // Create service
        console.log('Creating service...');
        const serviceData = {
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
        };
        console.log('Service data:', serviceData);

        const service = await prisma.service.create({
            data: serviceData,
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

        // Handle images if any
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => `/uploads/services/${file.filename}`);
            console.log('Updating with images:', imageUrls);
            
            await prisma.service.update({
                where: { id: service.id },
                data: {
                    coverImage: imageUrls[0] || null,
                    galleryImages: JSON.stringify(imageUrls)
                }
            });
        }

        res.status(201).json({
            success: true,
            service: {
                id: service.id,
                name: service.translation.name_en,
                price: service.price,
                duration: service.durationMins
            }
        });

    } catch (error) {
        console.error('=== SERVICE CREATION ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        console.error('Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to create service',
            details: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
});
