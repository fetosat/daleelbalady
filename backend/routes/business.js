import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
// Health check endpoint for debugging
router.get('/health', (req, res) => {
    res.json({
        message: 'Business routes are working',
        timestamp: new Date().toISOString(),
        availableRoutes: [
            'GET /health',
            'POST /application',
            'GET /applications',
            'GET /applications/:id'
        ]
    });
});

// Test POST endpoint
router.post('/test', (req, res) => {
    res.json({
        message: 'POST requests are working',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

// Simplified business application endpoint (no file upload)
router.post('/application-simple', authenticateUser, async (req, res) => {
    try {
        console.log('📋 Simple business application request:', req.body);
        
        const {
            businessName,
            businessEmail,
            businessPhone,
            description,
            businessAddress,
            businessCity,
            businessType,
            locationLat,
            locationLon
        } = req.body;

        // Validate required fields
        if (!businessName || !businessEmail || !businessPhone) {
            return res.status(400).json({
                error: 'Business name, email, and phone are required'
            });
        }

        // For now, just return success without database operations
        res.status(201).json({
            message: 'Business application received successfully',
            data: {
                businessName,
                businessEmail,
                businessPhone,
                description,
                businessAddress,
                businessCity,
                businessType: businessType || 'PROVIDER',
                userId: req.user.id,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Simple business application error:', error);
        res.status(500).json({ error: 'Error processing business application' });
    }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'business-documents');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    
    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, PDF, and document files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});



// Submit business application
router.post('/application', authenticateUser, upload.array('documents', 10), async (req, res) => {
    console.log('📋 Business application request received');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body keys:', req.body ? Object.keys(req.body) : 'Body is undefined');
    console.log('Files:', req.files ? req.files.length : 0);
    try {
        console.log('📋 Processing business application...');
        console.log('User:', req.user?.id);
        const {
            businessName,
            businessEmail,
            businessPhone,
            description,
            businessAddress,
            businessCity,
            businessType,
            locationLat,
            locationLon
        } = req.body;

        // Validate required fields
        if (!businessName || !businessEmail || !businessPhone) {
            return res.status(400).json({
                error: 'Business name, email, and phone are required'
            });
        }

        // Check if business email or phone already exists
        const existingApplication = await prisma.businessApplication.findFirst({
            where: {
                OR: [
                    { businessEmail },
                    { businessPhone }
                ]
            }
        });

        if (existingApplication) {
            return res.status(400).json({
                error: 'A business application with this email or phone already exists'
            });
        }

        // Parse coordinates if provided
        const lat = locationLat ? parseFloat(locationLat) : null;
        const lon = locationLon ? parseFloat(locationLon) : null;

        // Create business application
        const application = await prisma.businessApplication.create({
            data: {
                applicantId: req.user.id,
                businessName,
                businessEmail,
                businessPhone,
                description: description || null,
                businessAddress: businessAddress || null,
                businessCity: businessCity || null,
                locationLat: lat,
                locationLon: lon,
                businessType: businessType || 'PROVIDER',
                status: 'PENDING'
            }
        });

        // Process uploaded documents
        const documents = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const document = await prisma.businessDocument.create({
                    data: {
                        applicationId: application.id,
                        documentType: file.fieldname,
                        originalName: file.originalname,
                        filename: file.filename,
                        filePath: file.path,
                        fileSize: file.size,
                        mimeType: file.mimetype
                    }
                });
                documents.push(document);
            }
        }

        // Update user role to the requested business type
        await prisma.user.update({
            where: { id: req.user.id },
            data: { role: businessType || 'PROVIDER' }
        });

        // Create default free subscription for new providers
        if ((businessType || 'PROVIDER') === 'PROVIDER') {
            await prisma.providerSubscription.create({
                data: {
                    providerId: req.user.id,
                    planType: 'BASIC_FREE',
                    pricePerYear: 0,
                    canTakeBookings: false,
                    canListProducts: false,
                    searchPriority: 0,
                    hasPriorityBadge: false,
                    hasPromotionalVideo: false,
                    totalDiscount: 0,
                    isActive: true,
                    autoRenew: false
                }
            });
        }

        res.status(201).json({
            message: 'Business application submitted successfully',
            application: {
                ...application,
                documents
            }
        });

    } catch (error) {
        console.error('Business application error:', error);
        
        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        
        res.status(500).json({ error: 'Error submitting business application' });
    }
});

// Get user's business applications
router.get('/applications', authenticateUser, async (req, res) => {
    try {
        const applications = await prisma.businessApplication.findMany({
            where: {
                applicantId: req.user.id
            },
            include: {
                documents: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(applications);

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Error fetching applications' });
    }
});

// Get single business application
router.get('/applications/:id', authenticateUser, async (req, res) => {
    try {
        const application = await prisma.businessApplication.findFirst({
            where: {
                id: req.params.id,
                applicantId: req.user.id
            },
            include: {
                documents: true,
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(application);

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ error: 'Error fetching application' });
    }
});

// Admin routes - Review and manage business applications

// Get all business applications (admin only)
router.get('/admin/applications', authenticateUser, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const where = status ? { status } : {};

        const applications = await prisma.businessApplication.findMany({
            where,
            include: {
                documents: true,
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                submittedAt: 'desc'
            },
            skip,
            take: parseInt(limit)
        });

        const total = await prisma.businessApplication.count({ where });

        res.json({
            applications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Admin get applications error:', error);
        res.status(500).json({ error: 'Error fetching applications' });
    }
});

// Update application status (admin only)
router.patch('/admin/applications/:id/status', authenticateUser, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        const { status, statusNotes } = req.body;

        if (!['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_DOCUMENTS'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = {
            status,
            statusNotes: statusNotes || null,
            reviewedBy: req.user.id,
            reviewedAt: new Date()
        };

        if (status === 'APPROVED') {
            updateData.approvedAt = new Date();
        } else if (status === 'REJECTED') {
            updateData.rejectedAt = new Date();
        }

        const application = await prisma.businessApplication.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                documents: true
            }
        });

        res.json({
            message: `Application ${status.toLowerCase()} successfully`,
            application
        });

    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ error: 'Error updating application status' });
    }
});

// Download document (admin and applicant only)
router.get('/documents/:id/download', authenticateUser, async (req, res) => {
    try {
        const document = await prisma.businessDocument.findUnique({
            where: { id: req.params.id },
            include: {
                application: true
            }
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check if user has permission (admin or application owner)
        if (req.user.role !== 'ADMIN' && document.application.applicantId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if file exists
        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Send file
        res.download(document.filePath, document.originalName);

    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({ error: 'Error downloading document' });
    }
});

export default router;
