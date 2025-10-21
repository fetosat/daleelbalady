import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import jwt from 'jsonwebtoken';

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

// GET /api/products/provider - Get all products for the authenticated provider
// IMPORTANT: This route must come BEFORE /:id to avoid matching "provider" as an ID
router.get('/provider', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 20, search, category, status } = req.query;

        console.log(`📦 Fetching products for provider ${userId}`);

        // Build where clause
        const whereClause = {
            listerId: userId,
            deletedAt: null
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { sku: { contains: search } }
            ];
        }

        if (category) {
            whereClause.tags = {
                some: {
                    name: { equals: category }
                }
            };
        }

        if (status === 'active') {
            whereClause.isActive = true;
        } else if (status === 'inactive') {
            whereClause.isActive = false;
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
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
                orderItems: {
                    select: {
                        id: true,
                        quantity: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        const totalProducts = await prisma.product.count({
            where: whereClause
        });

        console.log(`✅ Found ${totalProducts} products for provider ${userId}`);

        // If no products found, return empty array with success (not 404)
        if (totalProducts === 0) {
            return res.json({
                success: true,
                products: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    pages: 0
                }
            });
        }

        // Calculate stats for each product
        const productsWithStats = products.map(product => {
            const totalReviews = product.reviews.length;
            const avgRating = totalReviews > 0
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                : 0;
            const totalSales = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);

            // Parse images from JSON string
            let images = [];
            if (product.images) {
                try {
                    images = JSON.parse(product.images);
                } catch (e) {
                    console.error('Failed to parse product images:', e);
                }
            }

            return {
                id: product.id,
                vid: product.vid,
                sku: product.sku,
                name: product.name,
                description: product.description,
                price: product.price,
                currency: product.currency || 'EGP',
                stock: product.stock,
                isActive: product.isActive,
                shopId: product.shopId,
                shop: product.shop,
                tags: product.tags,
                images: images,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                stats: {
                    sales: totalSales,
                    views: 0, // This would come from analytics
                    avgRating: parseFloat(avgRating.toFixed(1)),
                    totalReviews
                }
            };
        });

        res.json({
            success: true,
            products: productsWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalProducts,
                pages: Math.ceil(totalProducts / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error fetching provider products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
});

// GET /api/products/:id - Get product by ID (public route)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching product with ID: ${id}`);

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                shop: {
                    select: {
                        id: true,
                        vid: true,
                        name: true,
                        slug: true,
                        city: true,
                        phone: true,
                        email: true,
                        website: true,
                        isVerified: true,
                        logoImage: true
                    }
                },
                lister: {
                    select: {
                        id: true,
                        name: true,
                        isVerified: true,
                        verifiedBadge: true,
                        profilePic: true
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
                tags: true,
                reviews: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                profilePic: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        reviews: true,
                        orderItems: true
                    }
                }
            }
        });

        if (!product || product.deletedAt) {
            console.log(`Product not found for ID: '${id}'`);
            return res.status(404).json({
                success: false,
                message: `Product not found for ID: ${id}`
            });
        }

        console.log(`Found product: ${product.name} (id: ${product.id})`);

        // Calculate average rating
        const avgRating = product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
            : 0;

        const productData = {
            ...product,
            avgRating: parseFloat(avgRating.toFixed(1)),
            totalReviews: product._count.reviews,
            totalSales: product._count.orderItems
        };

        res.json({
            success: true,
            product: productData
        });

    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/products - Create a new product
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, description, price, stock, sku, isActive, shopId, category, images } = req.body;

        console.log(`📦 Creating product for user ${userId}:`, { name, price, shopId });

        // Validate required fields (shopId is optional)
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                error: 'Name and price are required'
            });
        }

        let finalShopId = shopId;
        
        // If shopId is provided, verify it belongs to the user
        if (shopId) {
            const shop = await prisma.shop.findFirst({
                where: {
                    id: shopId,
                    ownerId: userId
                }
            });

            if (!shop) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have permission to add products to this shop'
                });
            }
        } else {
            // No shop provided - try to find user's first shop or create a default one
            console.log('ℹ️ No shop provided, looking for or creating default shop...');
            
            let defaultShop = await prisma.shop.findFirst({
                where: {
                    ownerId: userId,
                    deletedAt: null
                }
            });
            
            if (!defaultShop) {
                // Create a default shop for the user
                console.log('➡️ Creating default shop for user...');
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { name: true }
                });
                
                defaultShop = await prisma.shop.create({
                    data: {
                        name: `${user?.name || 'My'} Products`,
                        slug: `products-${userId}-${Date.now()}`,
                        ownerId: userId,
                        city: 'Cairo', // Default city
                        isVerified: false
                    }
                });
                console.log('✅ Default shop created:', defaultShop.id);
            }
            
            finalShopId = defaultShop.id;
        }

        // Create the product
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                sku: sku || `PROD-${Date.now()}`,
                isActive: isActive !== undefined ? isActive : true,
                currency: 'EGP',
                shop: {
                    connect: { id: finalShopId }
                },
                lister: {
                    connect: { id: userId }
                },
                embeddingText: `${name} ${description || ''}`,
                images: images && Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });
        
        console.log('✅ Product created successfully:', product.id);

        // Add category tag if provided
        if (category) {
            try {
                // Find or create the tag
                const tag = await prisma.tags.upsert({
                    where: { name: category },
                    update: {},
                    create: { name: category }
                });

                // Connect the tag to the product
                await prisma.product.update({
                    where: { id: product.id },
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

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.error('❌ Error creating product:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create product',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// PUT /api/products/:id - Update a product
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { name, description, price, stock, sku, isActive, category, images } = req.body;

        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                listerId: userId,
                deletedAt: null
            }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or you do not have permission to edit it'
            });
        }

        // Update the product
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(sku && { sku }),
                ...(isActive !== undefined && { isActive }),
                ...(images !== undefined && { images: images && Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null }),
                embeddingText: `${name || existingProduct.name} ${description || existingProduct.description || ''}`
            },
            include: {
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

        // Update category tag if provided
        if (category) {
            try {
                // Remove old category tags
                await prisma.product.update({
                    where: { id },
                    data: {
                        tags: {
                            set: []
                        }
                    }
                });

                // Find or create the new tag
                const tag = await prisma.tags.upsert({
                    where: { name: category },
                    update: {},
                    create: { name: category }
                });

                // Connect the new tag
                await prisma.product.update({
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

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
});

// DELETE /api/products/:id - Soft delete a product
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                listerId: userId,
                deletedAt: null
            }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or you do not have permission to delete it'
            });
        }

        // Soft delete the product
        await prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
});

// PATCH /api/products/:id/toggle-status - Toggle product active status
router.patch('/:id/toggle-status', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Check if product exists and belongs to user
        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                listerId: userId,
                deletedAt: null
            }
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or you do not have permission to edit it'
            });
        }

        // Toggle the status
        const product = await prisma.product.update({
            where: { id },
            data: {
                isActive: !existingProduct.isActive
            }
        });

        res.json({
            success: true,
            product,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Error toggling product status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle product status'
        });
    }
});

export default router;

