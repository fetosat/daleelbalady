import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

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
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Customer Dashboard Overview
router.get('/customer/overview', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePic: true,
                role: true,
                isVerified: true,
                verifiedBadge: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get recent bookings (last 5)
        const recentBookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                service: {
                    include: {
                        translation: true
                    }
                },
                shop: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Get recent orders (last 5)
        const recentOrders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                price: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Get unread notifications count
        const unreadNotificationsCount = await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });

        // Get total stats
        const totalBookings = await prisma.booking.count({
            where: { userId }
        });

        const totalOrders = await prisma.order.count({
            where: { userId }
        });

        const totalSpent = await prisma.order.aggregate({
            where: {
                userId,
                status: { in: ["CONFIRMED", "DELIVERED"] }
            },
            _sum: {
                totalAmount: true
            }
        });

        // Get active subscriptions (using providerSubscription as fallback)
        let activeSubscriptions = [];
        try {
            // Try to get provider subscriptions if user is a provider
            if (user.role === 'PROVIDER' || user.role === 'SHOP_OWNER') {
                activeSubscriptions = await prisma.providerSubscription.findMany({
                    where: {
                        providerId: userId,
                        isActive: true
                    }
                });
            }
        } catch (error) {
            console.warn('Could not fetch subscriptions:', error.message);
            activeSubscriptions = [];
        }

        // Get recent reviews
        const recentReviews = await prisma.review.findMany({
            where: { authorId: userId },
            include: {
                service: {
                    select: { id: true }
                },
                product: {
                    select: { id: true }
                },
                shop: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        res.json({
            user,
            stats: {
                totalBookings,
                totalOrders,
                totalSpent: totalSpent._sum.totalAmount || 0,
                unreadNotifications: unreadNotificationsCount
            },
            recentBookings: recentBookings.map(booking => ({
                id: booking.id,
                bookingRef: booking.bookingRef,
                serviceName: booking.service.translation?.name_en || 'Service',
                shopName: booking.shop?.name || 'Direct Service',
                startAt: booking.startAt,
                endAt: booking.endAt,
                status: booking.status,
                price: booking.price,
                currency: booking.currency
            })),
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                currency: order.currency,
                status: order.status,
                createdAt: order.createdAt,
                itemsCount: order.items.length,
                items: order.items.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }))
            })),
            activeSubscriptions: activeSubscriptions.map(sub => ({
                id: sub.id,
                planName: sub.planType || 'Provider Plan',
                planDescription: `${sub.planType} subscription`,
                priceCents: sub.pricePerYear * 100 || 0,
                startedAt: sub.createdAt,
                expiresAt: sub.expiresAt,
                isActive: sub.isActive,
                canTakeBookings: sub.canTakeBookings,
                canListProducts: sub.canListProducts
            })),
            recentReviews: recentReviews.map(review => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                shopName: review.shop?.name,
                createdAt: review.createdAt,
                isVerified: review.isVerified
            }))
        });

    } catch (error) {
        console.error('Customer dashboard overview error:', error);
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
});

// Get customer notifications
router.get('/customer/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });

        const totalCount = await prisma.notification.count({
            where: { userId }
        });

        res.json({
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Customer notifications error:', error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark notification as read
router.patch('/customer/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const notification = await prisma.notification.updateMany({
            where: {
                id,
                userId
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        if (notification.count === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });

    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Get customer bookings with pagination and filters
router.get('/customer/bookings', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const whereClause = { userId };
        if (status) {
            whereClause.status = status;
        }
        if (startDate || endDate) {
            whereClause.startAt = {};
            if (startDate) whereClause.startAt.gte = new Date(startDate);
            if (endDate) whereClause.startAt.lte = new Date(endDate);
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                service: {
                    include: {
                        translation: true,
                        shop: {
                            select: {
                                name: true,
                                phone: true,
                                city: true
                            }
                        }
                    }
                },
                shop: {
                    select: {
                        name: true,
                        phone: true,
                        city: true,
                        address: {
                            select: {
                                text_en: true,
                                text_ar: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });

        const totalCount = await prisma.booking.count({
            where: whereClause
        });

        res.json({
            bookings: bookings.map(booking => ({
                id: booking.id,
                bookingRef: booking.bookingRef,
                serviceName: booking.service.translation?.name_en || 'Service',
                serviceDescription: booking.service.translation?.description_en,
                shopName: booking.shop?.name || booking.service.shop?.name || 'Direct Service',
                shopPhone: booking.shop?.phone || booking.service.shop?.phone,
                shopCity: booking.shop?.city || booking.service.shop?.city,
                shopAddress: booking.shop?.address?.text_en || booking.service.shop?.address?.text_en,
                startAt: booking.startAt,
                endAt: booking.endAt,
                durationMins: booking.durationMins,
                status: booking.status,
                price: booking.price,
                currency: booking.currency,
                notes: booking.notes,
                createdAt: booking.createdAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Customer bookings error:', error);
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

// Cancel booking
router.patch('/customer/bookings/:id/cancel', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const booking = await prisma.booking.updateMany({
            where: {
                id,
                userId,
                status: { in: ['PENDING', 'CONFIRMED'] }
            },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        });

        if (booking.count === 0) {
            return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
        }

        res.json({ message: 'Booking cancelled successfully' });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Error cancelling booking' });
    }
});

// Get customer orders with pagination and filters
router.get('/customer/orders', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const whereClause = { userId };
        if (status) {
            whereClause.status = status;
        }
        if (startDate || endDate) {
            whereClause.createdAt = {};
            if (startDate) whereClause.createdAt.gte = new Date(startDate);
            if (endDate) whereClause.createdAt.lte = new Date(endDate);
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                description: true,
                                price: true,
                                shop: {
                                    select: {
                                        name: true,
                                        phone: true,
                                        city: true
                                    }
                                }
                            }
                        }
                    }
                },
                delivery: true,
                coupon: {
                    select: {
                        code: true,
                        discountPercent: true,
                        discountAmount: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });

        const totalCount = await prisma.order.count({
            where: whereClause
        });

        res.json({
            orders: orders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                currency: order.currency,
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                shippedAt: order.shippedAt,
                deliveredAt: order.deliveredAt,
                cancelledAt: order.cancelledAt,
                items: order.items.map(item => ({
                    productName: item.product.name,
                    productDescription: item.product.description,
                    shopName: item.product.shop?.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                })),
                delivery: order.delivery ? {
                    status: order.delivery.status,
                    carrier: order.delivery.carrier,
                    trackingCode: order.delivery.trackingCode,
                    eta: order.delivery.eta,
                    lastLocation: order.delivery.lastLocation
                } : null,
                coupon: order.coupon ? {
                    code: order.coupon.code,
                    discountPercent: order.coupon.discountPercent,
                    discountAmount: order.coupon.discountAmount
                } : null
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Customer orders error:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Get single order details
router.get('/customer/orders/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                description: true,
                                price: true,
                                shop: {
                                    select: {
                                        name: true,
                                        phone: true,
                                        city: true,
                                        address: {
                                            select: {
                                                text_en: true,
                                                text_ar: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                delivery: true,
                coupon: {
                    select: {
                        code: true,
                        title: true,
                        discountPercent: true,
                        discountAmount: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            currency: order.currency,
            status: order.status,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
            metadata: order.metadata,
            items: order.items.map(item => ({
                productName: item.product.name,
                productDescription: item.product.description,
                shopName: item.product.shop?.name,
                shopPhone: item.product.shop?.phone,
                shopCity: item.product.shop?.city,
                shopAddress: item.product.shop?.address?.text_en,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })),
            delivery: order.delivery ? {
                status: order.delivery.status,
                carrier: order.delivery.carrier,
                trackingCode: order.delivery.trackingCode,
                eta: order.delivery.eta,
                lastLocation: order.delivery.lastLocation,
                updatedAt: order.delivery.updatedAt
            } : null,
            coupon: order.coupon ? {
                code: order.coupon.code,
                title: order.coupon.title,
                discountPercent: order.coupon.discountPercent,
                discountAmount: order.coupon.discountAmount
            } : null
        });

    } catch (error) {
        console.error('Customer order details error:', error);
        res.status(500).json({ error: 'Error fetching order details' });
    }
});

// Get customer profile settings
router.get('/customer/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePic: true,
                role: true,
                bio: true,
                isVerified: true,
                verifiedBadge: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);

    } catch (error) {
        console.error('Customer profile error:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Update customer profile
router.put('/customer/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, phone, bio, profilePic } = req.body;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Check if phone is already taken by another user
        if (phone) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone,
                    id: { not: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Phone number already in use' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(bio !== undefined && { bio }),
                ...(profilePic && { profilePic })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profilePic: true,
                role: true,
                bio: true,
                isVerified: true,
                verifiedBadge: true,
                updatedAt: true
            }
        });

        res.json(updatedUser);

    } catch (error) {
        console.error('Update customer profile error:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Get all notifications with pagination
router.get('/customer/all-notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20, type, isRead } = req.query;

        const whereClause = { userId };
        if (type) {
            whereClause.type = type;
        }
        if (isRead !== undefined) {
            whereClause.isRead = isRead === 'true';
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });

        const totalCount = await prisma.notification.count({
            where: whereClause
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });

        res.json({
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Customer all notifications error:', error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Mark all notifications as read
router.patch('/customer/notifications/read-all', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        res.json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ error: 'Error updating notifications' });
    }
});

// ============= ADMIN ROUTES =============

// Admin middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Admin Overview Dashboard
router.get('/admin/overview', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Get total counts
        const totalUsers = await prisma.user.count();
        const totalShops = await prisma.shop.count();
        const totalServices = await prisma.service.count();
        const totalProducts = await prisma.product.count();
        const totalOrders = await prisma.order.count();
        const totalBookings = await prisma.booking.count();
        
        // Get counts by status
        const activeUsers = await prisma.user.count({ where: { deletedAt: null } });
        const verifiedShops = await prisma.shop.count({ where: { isVerified: true } });
        const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
        const unreadNotifications = await prisma.notification.count({ where: { isRead: false } });
        
        // Get recent activities (last 10)
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        
        const recentShops = await prisma.shop.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, isVerified: true, createdAt: true }
        });
        
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { 
                id: true, 
                orderNumber: true, 
                status: true, 
                totalAmount: true, 
                currency: true, 
                createdAt: true,
                user: { select: { name: true } }
            }
        });
        
        // Calculate growth percentages (mock for now)
        const stats = {
            totalUsers,
            totalShops,
            totalServices,
            totalProducts,
            totalOrders,
            totalBookings,
            activeUsers,
            verifiedShops,
            pendingOrders,
            unreadNotifications,
            // Mock growth data - can be calculated with historical data
            userGrowth: '+12.3%',
            shopGrowth: '+8.1%',
            serviceGrowth: '+15.4%',
            productGrowth: '+10.2%',
            orderGrowth: '+18.7%',
            bookingGrowth: '+22.1%'
        };
        
        res.json({
            stats,
            recentActivities: {
                users: recentUsers,
                shops: recentShops,
                orders: recentOrders
            }
        });
        
    } catch (error) {
        console.error('Admin overview error:', error);
        res.status(500).json({ error: 'Error fetching admin overview' });
    }
});

// User Management
router.get('/admin/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        
        const whereClause = {
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } }
                ]
            }),
            ...(role && { role }),
            ...(status === 'active' && { deletedAt: null }),
            ...(status === 'inactive' && { deletedAt: { not: null } }),
            ...(status === 'verified' && { isVerified: true }),
            ...(status === 'unverified' && { isVerified: false })
        };
        
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                verifiedBadge: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.user.count({ where: whereClause });
        
        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Update user role/status
router.patch('/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, isVerified, action } = req.body;
        
        const updateData = {};
        if (role) updateData.role = role;
        if (isVerified !== undefined) updateData.isVerified = isVerified;
        
        if (action === 'delete') {
            updateData.deletedAt = new Date();
        } else if (action === 'restore') {
            updateData.deletedAt = null;
        }
        
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                updatedAt: true
            }
        });
        
        res.json(user);
        
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
});

// Shop Management
router.get('/admin/shops', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, verified, city } = req.query;
        
        const whereClause = {
            ...(search && { name: { contains: search } }),
            ...(verified !== undefined && { isVerified: verified === 'true' }),
            ...(city && { city })
        };
        
        const shops = await prisma.shop.findMany({
            where: whereClause,
            include: {
                owner: {
                    select: { name: true, email: true, phone: true }
                },
                _count: {
                    select: { services: true, products: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.shop.count({ where: whereClause });
        
        res.json({
            shops,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin shops error:', error);
        res.status(500).json({ error: 'Error fetching shops' });
    }
});

// Verify/Unverify shop
router.patch('/admin/shops/:id/verify', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;
        
        const shop = await prisma.shop.update({
            where: { id },
            data: { isVerified },
            include: {
                owner: { select: { name: true, email: true } }
            }
        });
        
        // Create notification for shop owner
        await prisma.notification.create({
            data: {
                type: 'SYSTEM',
                title: isVerified ? 'Shop Verified' : 'Shop Verification Revoked',
                message: isVerified 
                    ? 'Your shop has been verified and is now visible to customers'
                    : 'Your shop verification has been revoked. Please contact support.',
                userId: shop.ownerId
            }
        });
        
        res.json({ message: `Shop ${isVerified ? 'verified' : 'unverified'} successfully` });
        
    } catch (error) {
        console.error('Admin verify shop error:', error);
        res.status(500).json({ error: 'Error updating shop verification' });
    }
});

// Service Management
router.get('/admin/services', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, city, available } = req.query;
        
        const whereClause = {
            ...(search && {
                OR: [
                    { translation: { name_en: { contains: search } } },
                    { translation: { name_ar: { contains: search } } }
                ]
            }),
            ...(city && { city }),
            ...(available !== undefined && { available: available === 'true' })
        };
        
        const services = await prisma.service.findMany({
            where: whereClause,
            include: {
                translation: true,
                ownerUser: { select: { name: true, email: true } },
                shop: { select: { name: true, isVerified: true } },
                _count: { select: { bookings: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.service.count({ where: whereClause });
        
        res.json({
            services,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin services error:', error);
        res.status(500).json({ error: 'Error fetching services' });
    }
});

// Product Management  
router.get('/admin/products', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, active, shopId } = req.query;
        
        const whereClause = {
            ...(search && { name: { contains: search } }),
            ...(active !== undefined && { isActive: active === 'true' }),
            ...(shopId && { shopId })
        };
        
        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                shop: { select: { name: true, isVerified: true } },
                lister: { select: { name: true, email: true } },
                _count: { select: { orderItems: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.product.count({ where: whereClause });
        
        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin products error:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// Delivery Management
router.get('/admin/deliveries', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, date } = req.query;
        
        const whereClause = {
            ...(status && { status }),
            ...(date && {
                createdAt: {
                    gte: new Date(date + 'T00:00:00.000Z'),
                    lte: new Date(date + 'T23:59:59.999Z')
                }
            })
        };
        
        const deliveries = await prisma.deliveryTracking.findMany({
            where: whereClause,
            include: {
                order: {
                    include: {
                        user: { select: { name: true, phone: true } },
                        items: {
                            include: {
                                product: {
                                    select: {
                                        name: true,
                                        shop: { select: { name: true, city: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.deliveryTracking.count({ where: whereClause });
        
        res.json({
            deliveries,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin deliveries error:', error);
        res.status(500).json({ error: 'Error fetching deliveries' });
    }
});

// Update delivery status
router.patch('/admin/deliveries/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, carrier, trackingCode, eta } = req.body;
        
        const delivery = await prisma.deliveryTracking.update({
            where: { id },
            data: {
                status,
                ...(carrier && { carrier }),
                ...(trackingCode && { trackingCode }),
                ...(eta && { eta: new Date(eta) }),
                updatedAt: new Date()
            },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true } }
                    }
                }
            }
        });
        
        // Create notification for customer
        await prisma.notification.create({
            data: {
                type: 'ORDER',
                title: 'Delivery Status Updated',
                message: `Your order #${delivery.order.orderNumber} is now ${status}`,
                userId: delivery.order.user.id
            }
        });
        
        res.json(delivery);
        
    } catch (error) {
        console.error('Admin update delivery error:', error);
        res.status(500).json({ error: 'Error updating delivery' });
    }
});

// Reports and Analytics
router.get('/admin/analytics', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        if (period === '7d') {
            startDate.setDate(endDate.getDate() - 7);
        } else if (period === '30d') {
            startDate.setDate(endDate.getDate() - 30);
        } else if (period === '90d') {
            startDate.setDate(endDate.getDate() - 90);
        } else if (period === '1y') {
            startDate.setFullYear(endDate.getFullYear() - 1);
        }
        
        // Revenue analytics
        const revenueData = await prisma.order.aggregate({
            where: {
                status: { in: ['DELIVERED', 'COMPLETED'] },
                createdAt: { gte: startDate, lte: endDate }
            },
            _sum: { totalAmount: true },
            _count: true
        });
        
        // User growth
        const userGrowth = await prisma.user.groupBy({
            by: ['role'],
            where: {
                createdAt: { gte: startDate, lte: endDate }
            },
            _count: true
        });
        
        // Popular services
        const popularServices = await prisma.booking.groupBy({
            by: ['serviceId'],
            where: {
                createdAt: { gte: startDate, lte: endDate }
            },
            _count: true,
            orderBy: { _count: { serviceId: 'desc' } },
            take: 10
        });
        
        // Popular products
        const popularProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10
        });
        
        res.json({
            revenue: {
                total: revenueData._sum.totalAmount || 0,
                orders: revenueData._count
            },
            userGrowth,
            popularServices,
            popularProducts,
            period
        });
        
    } catch (error) {
        console.error('Admin analytics error:', error);
        res.status(500).json({ error: 'Error fetching analytics' });
    }
});

// Provider/Shop Owner Shop Management

// Get provider's shops
router.get('/provider/shops', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        
        console.log(`🔍 Provider shops access attempt - User ID: ${userId}, Role: ${userRole}`);
        
        // Verify user has provider role or related role
        if (!['PROVIDER', 'SHOP_OWNER', 'ADMIN'].includes(userRole)) {
            console.log(`❌ Access denied for role: ${userRole}`);
            return res.status(403).json({ 
                error: 'Only providers can access this endpoint',
                debug: {
                    currentRole: userRole,
                    requiredRoles: ['PROVIDER', 'SHOP_OWNER', 'ADMIN'],
                    userId: userId
                }
            });
        }
        
        console.log(`✅ Access granted for role: ${userRole}`);
        
        // Get user info for debugging
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true
            }
        });
        
        console.log(`👤 User details:`, user);
        
        const shops = await prisma.shop.findMany({
            where: {
                ownerId: userId
            },
            include: {
                address: {
                    select: {
                        text_en: true,
                        text_ar: true
                    }
                },
                design: {
                    select: {
                        name: true,
                        slug: true
                    }
                },
                _count: {
                    select: {
                        services: true,
                        products: true,
                        reviews: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        res.json({ shops });
        
    } catch (error) {
        console.error('Provider shops error:', error);
        res.status(500).json({ error: 'Error fetching shops' });
    }
});

// Create new shop
router.post('/provider/shops', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        
        // Verify user has provider role  
        if (req.userRole !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only providers can create shops' });
        }
        
        const {
            name,
            description,
            phone,
            email,
            city,
            address_en,
            address_ar,
            designSlug = 'medical',
            locationLat,
            locationLon
        } = req.body;
        
        // Validate required fields
        if (!name || !city) {
            return res.status(400).json({ error: 'Shop name and city are required' });
        }
        
        // Check if user already has a shop with this name
        const existingShop = await prisma.shop.findFirst({
            where: {
                name,
                ownerId: userId
            }
        });
        
        if (existingShop) {
            return res.status(400).json({ error: 'You already have a shop with this name' });
        }
        
        // Check user's subscription to ensure they can create shop
        const subscription = await prisma.providerSubscription.findFirst({
            where: {
                providerId: userId,
                isActive: true
            }
        });
        
        if (!subscription) {
            return res.status(403).json({ 
                error: 'Active subscription required to create a shop',
                requiresSubscription: true
            });
        }
        
        // For basic free plans, limit shop creation
        if (subscription.planType === 'BASIC_FREE') {
            const existingShopsCount = await prisma.shop.count({
                where: { ownerId: userId }
            });
            
            if (existingShopsCount >= 1) {
                return res.status(403).json({
                    error: 'Basic plan allows only one shop. Upgrade for more shops.',
                    requiresUpgrade: true
                });
            }
        }
        
        // Get or create design
        let design = await prisma.design.findFirst({
            where: { slug: designSlug }
        });
        
        if (!design) {
            // Create default medical design if not found
            design = await prisma.design.create({
                data: {
                    name: 'Medical',
                    description: 'Medical services design theme',
                    slug: 'medical',
                    categoryId: 'temp' // Will be updated
                }
            });
        }
        
        // Create address translation
        const addressTranslation = await prisma.shop_translation.create({
            data: {
                text_en: address_en || `${name} - ${city}`,
                text_ar: address_ar || `${name} - ${city}`
            }
        });
        
        // Generate unique slug for shop
        const baseSlug = name.toLowerCase()
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50);
            
        let uniqueSlug = baseSlug;
        let counter = 0;
        
        while (true) {
            const existingSlugShop = await prisma.shop.findFirst({
                where: { slug: uniqueSlug }
            });
            
            if (!existingSlugShop) break;
            
            counter++;
            uniqueSlug = `${baseSlug}-${counter}`;
        }
        
        // Create the shop
        const shop = await prisma.shop.create({
            data: {
                name,
                slug: uniqueSlug,
                description: description || null,
                phone: phone || null,
                email: email || null,
                city,
                ownerId: userId,
                designId: design.id,
                adressId: addressTranslation.id,
                locationLat: locationLat ? parseFloat(locationLat) : null,
                locationLon: locationLon ? parseFloat(locationLon) : null,
                isVerified: false // New shops start unverified
            },
            include: {
                address: true,
                design: true,
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        // Create notification for successful shop creation
        await prisma.notification.create({
            data: {
                type: 'SYSTEM',
                title: 'Shop Created Successfully',
                message: `Your shop "${name}" has been created and is pending verification.`,
                userId: userId
            }
        });
        
        res.status(201).json({
            message: 'Shop created successfully',
            shop
        });
        
    } catch (error) {
        console.error('Create shop error:', error);
        res.status(500).json({ error: 'Error creating shop' });
    }
});

// Update shop
router.put('/provider/shops/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        
        // Verify user has provider role
        if (req.userRole !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only providers can update shops' });
        }
        
        const {
            name,
            description,
            phone,
            email,
            city,
            address_en,
            address_ar,
            locationLat,
            locationLon
        } = req.body;
        
        // Verify shop ownership
        const existingShop = await prisma.shop.findFirst({
            where: {
                id,
                ownerId: userId
            },
            include: {
                address: true
            }
        });
        
        if (!existingShop) {
            return res.status(404).json({ error: 'Shop not found or access denied' });
        }
        
        // Update address translation if provided
        if (address_en || address_ar) {
            await prisma.shop_translation.update({
                where: { id: existingShop.adressId },
                data: {
                    ...(address_en && { text_en: address_en }),
                    ...(address_ar && { text_ar: address_ar })
                }
            });
        }
        
        // Update shop
        const updatedShop = await prisma.shop.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(phone !== undefined && { phone }),
                ...(email !== undefined && { email }),
                ...(city && { city }),
                ...(locationLat && { locationLat: parseFloat(locationLat) }),
                ...(locationLon && { locationLon: parseFloat(locationLon) })
            },
            include: {
                address: true,
                design: true,
                owner: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        
        res.json({
            message: 'Shop updated successfully',
            shop: updatedShop
        });
        
    } catch (error) {
        console.error('Update shop error:', error);
        res.status(500).json({ error: 'Error updating shop' });
    }
});

// Get single shop details for provider
router.get('/provider/shops/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        
        // Verify user has provider role
        if (req.userRole !== 'PROVIDER') {
            return res.status(403).json({ error: 'Only providers can access this endpoint' });
        }
        
        const shop = await prisma.shop.findFirst({
            where: {
                id,
                ownerId: userId
            },
            include: {
                address: true,
                design: true,
                services: {
                    include: {
                        translation: true
                    }
                },
                products: {
                    where: { isActive: true }
                },
                reviews: {
                    include: {
                        author: {
                            select: {
                                name: true,
                                isVerified: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        services: true,
                        products: true,
                        reviews: true
                    }
                }
            }
        });
        
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        
        res.json({ shop });
        
    } catch (error) {
        console.error('Get shop details error:', error);
        res.status(500).json({ error: 'Error fetching shop details' });
    }
});

// Admin Reviews Management
router.get('/admin/reviews', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type, rating } = req.query;
        
        const whereClause = {};
        if (type === 'service') whereClause.serviceId = { not: null };
        if (type === 'product') whereClause.productId = { not: null };
        if (type === 'shop') whereClause.shopId = { not: null };
        if (rating) whereClause.rating = parseInt(rating);
        
        const reviews = await prisma.review.findMany({
            where: whereClause,
            include: {
                author: { select: { name: true, email: true, isVerified: true } },
                service: { 
                    select: { 
                        id: true,
                        translation: { select: { name_en: true, name_ar: true } }
                    } 
                },
                product: { select: { name: true, id: true } },
                shop: { select: { name: true, id: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.review.count({ where: whereClause });
        
        res.json({
            reviews: reviews.map(review => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                isVerified: review.isVerified,
                createdAt: review.createdAt,
                author: {
                    name: review.author.name,
                    email: review.author.email,
                    isVerified: review.author.isVerified
                },
                target: {
                    type: review.serviceId ? 'service' : review.productId ? 'product' : 'shop',
                    name: review.service?.translation?.name_en || review.product?.name || review.shop?.name,
                    id: review.serviceId || review.productId || review.shopId
                }
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin reviews error:', error);
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Approve/Reject review
router.patch('/admin/reviews/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'approve' or 'reject'
        
        if (action === 'approve') {
            await prisma.review.update({
                where: { id },
                data: { isVerified: true }
            });
            res.json({ message: 'Review approved successfully' });
        } else if (action === 'reject') {
            await prisma.review.delete({
                where: { id }
            });
            res.json({ message: 'Review rejected and removed successfully' });
        } else {
            res.status(400).json({ error: 'Invalid action. Use approve or reject.' });
        }
        
    } catch (error) {
        console.error('Admin review action error:', error);
        res.status(500).json({ error: 'Error processing review action' });
    }
});

// Admin Notifications Management
router.get('/admin/notifications', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, isRead, userId } = req.query;
        
        const whereClause = {};
        if (type) whereClause.type = type;
        if (isRead !== undefined) whereClause.isRead = isRead === 'true';
        if (userId) whereClause.userId = userId;
        
        const notifications = await prisma.notification.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true, role: true } },
                shop: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.notification.count({ where: whereClause });
        const unreadCount = await prisma.notification.count({ 
            where: { ...whereClause, isRead: false } 
        });
        
        res.json({
            notifications: notifications.map(notif => ({
                id: notif.id,
                type: notif.type,
                title: notif.title,
                message: notif.message,
                isRead: notif.isRead,
                createdAt: notif.createdAt,
                readAt: notif.readAt,
                user: notif.user ? {
                    name: notif.user.name,
                    email: notif.user.email,
                    role: notif.user.role
                } : null,
                shop: notif.shop ? {
                    name: notif.shop.name
                } : null,
                metadata: notif.metadata
            })),
            stats: {
                total: totalCount,
                unread: unreadCount
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin notifications error:', error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Create system notification
router.post('/admin/notifications', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { title, message, type = 'SYSTEM', userIds, userRole, metadata } = req.body;
        
        // If targeting specific users
        if (userIds && userIds.length > 0) {
            const notifications = userIds.map(userId => ({
                type,
                title,
                message,
                userId,
                metadata: metadata || {}
            }));
            
            await prisma.notification.createMany({
                data: notifications
            });
        }
        // If targeting users by role
        else if (userRole) {
            const users = await prisma.user.findMany({
                where: { role: userRole },
                select: { id: true }
            });
            
            const notifications = users.map(user => ({
                type,
                title,
                message,
                userId: user.id,
                metadata: metadata || {}
            }));
            
            await prisma.notification.createMany({
                data: notifications
            });
        }
        // If targeting all users
        else {
            const users = await prisma.user.findMany({
                select: { id: true }
            });
            
            const notifications = users.map(user => ({
                type,
                title,
                message,
                userId: user.id,
                metadata: metadata || {}
            }));
            
            await prisma.notification.createMany({
                data: notifications
            });
        }
        
        res.json({ message: 'Notifications created successfully' });
        
    } catch (error) {
        console.error('Admin create notification error:', error);
        res.status(500).json({ error: 'Error creating notifications' });
    }
});

// Update product status (enable/disable)
router.patch('/admin/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, action } = req.body;
        
        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (action === 'delete') updateData.deletedAt = new Date();
        
        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                shop: { select: { name: true } },
                lister: { select: { name: true } }
            }
        });
        
        res.json(product);
        
    } catch (error) {
        console.error('Admin update product error:', error);
        res.status(500).json({ error: 'Error updating product' });
    }
});

// Get admin orders (similar to deliveries but all orders)
router.get('/admin/orders', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, date, userId } = req.query;
        
        const whereClause = {};
        if (status) whereClause.status = status;
        if (userId) whereClause.userId = userId;
        if (date) {
            whereClause.createdAt = {
                gte: new Date(date + 'T00:00:00.000Z'),
                lte: new Date(date + 'T23:59:59.999Z')
            };
        }
        
        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                shop: { select: { name: true } }
                            }
                        }
                    }
                },
                delivery: true,
                coupon: { select: { code: true, discountPercent: true, discountAmount: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });
        
        const totalCount = await prisma.order.count({ where: whereClause });
        
        res.json({
            orders: orders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                currency: order.currency,
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                user: {
                    name: order.user.name,
                    email: order.user.email,
                    phone: order.user.phone
                },
                itemsCount: order.items.length,
                items: order.items.map(item => ({
                    productName: item.product.name,
                    shopName: item.product.shop.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                })),
                delivery: order.delivery ? {
                    status: order.delivery.status,
                    carrier: order.delivery.carrier,
                    trackingCode: order.delivery.trackingCode
                } : null,
                coupon: order.coupon
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            }
        });
        
    } catch (error) {
        console.error('Admin orders error:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

export default router;
