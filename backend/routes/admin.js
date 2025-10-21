// Admin routes for platform management
import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { auth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/adminAuth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication and admin check to all routes
router.use(auth);
router.use(isAdmin);

/**
 * DASHBOARD STATS
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalShops,
      totalServices,
      totalProducts,
      totalBookings,
      totalOrders,
      totalRevenue,
      activeSubscriptions,
      pendingApplications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.shop.count(),
      prisma.service.count(),
      prisma.product.count(),
      prisma.booking.count(),
      prisma.order.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.providerSubscription.count({ where: { isActive: true } }),
      prisma.businessApplication.count({ where: { status: 'PENDING' } })
    ]);

    // Recent activity
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          providers: totalProviders,
          customers: totalUsers - totalProviders,
          recentSignups: recentUsers
        },
        shops: {
          total: totalShops
        },
        services: {
          total: totalServices
        },
        products: {
          total: totalProducts
        },
        bookings: {
          total: totalBookings,
          recent: recentBookings
        },
        orders: {
          total: totalOrders
        },
        revenue: {
          total: totalRevenue._sum.amount || 0
        },
        subscriptions: {
          active: activeSubscriptions
        },
        applications: {
          pending: pendingApplications
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * USERS MANAGEMENT
 */

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      role = '',
      isVerified = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ]
      }),
      ...(role && { role }),
      ...(isVerified !== '' && { isVerified: isVerified === 'true' })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          profilePic: true,
          coverImage: true,
          createdAt: true,
          _count: {
            select: {
              shops: true,
              services: true,
              bookings: true,
              orders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get single user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        shops: true,
        services: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        providerSubscription: true,
        userSubscription: true,
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            shops: true,
            services: true,
            products: true,
            bookings: true,
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, password, role, isVerified, verifiedBadge, profilePic, coverImage, bio } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('➕ Creating new user:', { name, email, role });

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'CUSTOMER',
        isVerified: isVerified || false,
        verifiedBadge: verifiedBadge || null,
        profilePic: profilePic || null,
        coverImage: coverImage || null,
        bio: bio || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        verifiedBadge: true,
        profilePic: true,
        coverImage: true,
        bio: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  }
});

// Update user
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isVerified, verifiedBadge, profilePic, coverImage, bio, password } = req.body;

    // Build update data object
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(role && { role }),
      ...(isVerified !== undefined && { isVerified }),
      ...(verifiedBadge !== undefined && { verifiedBadge: verifiedBadge || null }),
      ...(profilePic !== undefined && { profilePic }),
      ...(coverImage !== undefined && { coverImage }),
      ...(bio !== undefined && { bio })
    };

    // Handle password update separately (needs hashing)
    if (password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    console.log('✏️ Updating user:', id, 'Data:', updateData);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        verifiedBadge: true,
        profilePic: true,
        coverImage: true,
        bio: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
});

// Convert user to shop owner
router.post('/users/:id/convert-to-shop', async (req, res) => {
  try {
    const { id } = req.params;
    const { shopName, city, description } = req.body;

    // Validate required fields
    if (!shopName || !city) {
      return res.status(400).json({
        success: false,
        message: 'Shop name and city are required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        shops: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has shops
    if (user.shops && user.shops.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has shops'
      });
    }

    console.log('🏪 Converting user to shop owner:', { userId: id, userName: user.name, shopName, city });

    // Generate unique slug for shop
    const baseSlug = shopName.toLowerCase()
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

    // Get or create a default design
    let design = await prisma.design.findFirst({
      where: { slug: 'default' }
    });
    
    if (!design) {
      design = await prisma.design.create({
        data: {
          name: 'Default',
          description: 'Default shop design',
          slug: 'default',
          categoryId: ''
        }
      });
    }

    // Start transaction to update user and create shop
    const result = await prisma.$transaction(async (tx) => {
      // Update user role to PROVIDER if they're just a CUSTOMER
      let updatedUser = user;
      if (user.role === 'CUSTOMER') {
        updatedUser = await tx.user.update({
          where: { id },
          data: {
            role: 'PROVIDER'
          }
        });
      }

      // Create the shop
      const shop = await tx.shop.create({
        data: {
          name: shopName,
          slug: uniqueSlug,
          description: description || `متجر ${shopName}`,
          city,
          ownerId: id,
          designId: design.id,
          isVerified: false,
          phone: user.phone || null,
          email: user.email || null
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      // Create notification for user
      await tx.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'تم إنشاء متجرك بنجاح',
          message: `تم إنشاء متجر "${shopName}" وتحويل حسابك إلى مقدم خدمة. يمكنك الآن إضافة خدماتك ومنتجاتك.`,
          userId: id
        }
      });

      return { user: updatedUser, shop };
    });

    console.log('✅ Successfully converted user to shop owner:', { 
      userId: id, 
      shopId: result.shop.id, 
      shopSlug: result.shop.slug 
    });

    res.status(201).json({
      success: true,
      message: 'User converted to shop owner successfully',
      user: result.user,
      shop: result.shop
    });
    
  } catch (error) {
    console.error('Convert user to shop error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to convert user to shop'
    });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

/**
 * SHOPS MANAGEMENT
 */

// Get all shops
router.get('/shops', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      isVerified = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { city: { contains: search } }
        ]
      }),
      ...(isVerified !== '' && { isVerified: isVerified === 'true' })
    };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          _count: {
            select: {
              services: true,
              products: true,
              reviews: true
            }
          }
        }
      }),
      prisma.shop.count({ where })
    ]);

    res.json({
      success: true,
      shops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops'
    });
  }
});

// Create shop
router.post('/shops', async (req, res) => {
  try {
    const { name, description, phone, email, city, ownerId, isVerified, coverImage, logoImage, galleryImages, locationLat, locationLon, website } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Name and ownerId are required'
      });
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        phone,
        email,
        city,
        website,
        ownerId,
        isVerified: isVerified || false,
        coverImage: coverImage || null,
        logoImage: logoImage || null,
        galleryImages: galleryImages ? JSON.stringify(galleryImages) : null,
        locationLat: locationLat !== undefined ? parseFloat(locationLat) : null,
        locationLon: locationLon !== undefined ? parseFloat(locationLon) : null,
        slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      }
    });

    res.json({
      success: true,
      shop,
      message: 'Shop created successfully'
    });
  } catch (error) {
    console.error('Create shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shop'
    });
  }
});

// Update shop
router.patch('/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, phone, email, city, isVerified, coverImage, logoImage, galleryImages, locationLat, locationLon, website, ownerId } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(city !== undefined && { city }),
      ...(website !== undefined && { website }),
      ...(isVerified !== undefined && { isVerified }),
      ...(coverImage !== undefined && { coverImage }),
      ...(logoImage !== undefined && { logoImage }),
      ...(galleryImages !== undefined && { galleryImages: Array.isArray(galleryImages) ? JSON.stringify(galleryImages) : galleryImages }),
      ...(locationLat !== undefined && { locationLat: parseFloat(locationLat) }),
      ...(locationLon !== undefined && { locationLon: parseFloat(locationLon) }),
      ...(ownerId && { ownerId })
    };
    
    // Update slug if name is changing
    if (name) {
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    }
    
    console.log('📍 Updating shop location:', { id, locationLat, locationLon, updateData });

    const shop = await prisma.shop.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      shop,
      message: 'Shop updated successfully'
    });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop'
    });
  }
});

// Convert shop to regular user (remove shop)
router.post('/shops/:id/convert-to-user', async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteShopData = false } = req.body; // Option to soft delete or hard delete shop data

    // Get shop with owner details
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        owner: true,
        services: { select: { id: true } },
        products: { select: { id: true } }
      }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    console.log('🔄 Converting shop to regular user:', { 
      shopId: id, 
      shopName: shop.name,
      ownerId: shop.ownerId,
      ownerName: shop.owner.name 
    });

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check if owner has other shops
      const otherShops = await tx.shop.findMany({
        where: {
          ownerId: shop.ownerId,
          id: { not: id }
        },
        select: { id: true }
      });

      let updatedUser = shop.owner;
      
      // If no other shops, change role back to CUSTOMER
      if (otherShops.length === 0) {
        updatedUser = await tx.user.update({
          where: { id: shop.ownerId },
          data: {
            role: 'CUSTOMER'
          }
        });
      }

      // Handle shop deletion
      if (deleteShopData) {
        // Hard delete - remove shop completely
        // First, remove related data
        await tx.service.deleteMany({
          where: { shopId: id }
        });
        
        await tx.product.deleteMany({
          where: { shopId: id }
        });

        await tx.review.deleteMany({
          where: { shopId: id }
        });

        // Finally delete the shop
        await tx.shop.delete({
          where: { id }
        });
      } else {
        // Soft delete - mark as deleted
        await tx.shop.update({
          where: { id },
          data: {
            deletedAt: new Date()
          }
        });
      }

      // Create notification for user
      await tx.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'تم تحويل حسابك',
          message: `تم إلغاء متجر "${shop.name}" وتحويل حسابك إلى مستخدم عادي${otherShops.length > 0 ? '. لا زلت تملك متاجر أخرى.' : '.'}`,
          userId: shop.ownerId
        }
      });

      return { user: updatedUser, deletedShop: shop };
    });

    console.log('✅ Successfully converted shop to user:', { 
      userId: shop.ownerId, 
      deletedShopId: id,
      newRole: result.user.role
    });

    res.json({
      success: true,
      message: 'Shop converted to regular user successfully',
      user: result.user,
      deletedShop: result.deletedShop
    });

  } catch (error) {
    console.error('Convert shop to user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to convert shop to user'
    });
  }
});

// Delete shop
router.delete('/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.shop.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    console.error('Delete shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop'
    });
  }
});

/**
 * SERVICES MANAGEMENT
 */

// Get all services
router.get('/services', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      })
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          ownerUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true
            }
          },
          category: true,
          subCategory: true,
          _count: {
            select: {
              bookings: true,
              reviews: true
            }
          }
        }
      }),
      prisma.service.count({ where })
    ]);

    res.json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
});

// Create service
router.post('/services', async (req, res) => {
  try {
    const { embeddingText, phone, city, price, currency, available, ownerUserId, shopId, coverImage, logoImage, galleryImages } = req.body;

    if (!embeddingText) {
      return res.status(400).json({
        success: false,
        message: 'embeddingText is required'
      });
    }

    const service = await prisma.service.create({
      data: {
        embeddingText,
        phone,
        city,
        price: price ? parseFloat(price) : null,
        currency: currency || 'EGP',
        available: available !== undefined ? available : true,
        ownerUserId,
        shopId,
        coverImage: coverImage || null,
        logoImage: logoImage || null,
        galleryImages: galleryImages ? JSON.stringify(galleryImages) : null
      }
    });

    res.json({
      success: true,
      service,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
});

// Update service
router.patch('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { embeddingText, phone, city, price, currency, available, coverImage, logoImage, galleryImages } = req.body;

    const updateData = {
      ...(embeddingText && { embeddingText }),
      ...(phone !== undefined && { phone }),
      ...(city && { city }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(currency && { currency }),
      ...(available !== undefined && { available }),
      ...(coverImage !== undefined && { coverImage }),
      ...(logoImage !== undefined && { logoImage }),
      ...(galleryImages !== undefined && { galleryImages: Array.isArray(galleryImages) ? JSON.stringify(galleryImages) : galleryImages })
    };

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
});

// Delete service
router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
});

/**
 * PRODUCTS MANAGEMENT
 */

// Get all products
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          lister: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, currency, stock, isActive, shopId, listerId } = req.body;

    if (!name || !price || !shopId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and shopId are required'
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        currency: currency || 'EGP',
        stock: stock ? parseInt(stock) : 0,
        isActive: isActive !== undefined ? isActive : true,
        shopId,
        listerId,
        sku: `SKU-${Date.now()}`
      }
    });

    res.json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product
router.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, currency, stock, isActive } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

/**
 * BOOKINGS MANAGEMENT
 */

// Get all bookings
router.get('/bookings', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status })
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          service: {
            select: {
              id: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

/**
 * ORDERS MANAGEMENT
 */

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          delivery: true
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * PAYMENTS MANAGEMENT
 */

// Get all payments
router.get('/payments', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status })
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

/**
 * SUBSCRIPTIONS MANAGEMENT
 */

// Get all provider subscriptions
router.get('/subscriptions/providers', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(isActive !== '' && { isActive: isActive === 'true' })
    };

    const [subscriptions, total] = await Promise.all([
      prisma.providerSubscription.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.providerSubscription.count({ where })
    ]);

    res.json({
      success: true,
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get provider subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

// Get all user subscriptions
router.get('/subscriptions/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(isActive !== '' && { isActive: isActive === 'true' })
    };

    const [subscriptions, total] = await Promise.all([
      prisma.userSubscription.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.userSubscription.count({ where })
    ]);

    res.json({
      success: true,
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

// Update provider subscription
router.patch('/subscriptions/providers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { planType, pricePerYear, isActive, expiresAt, fieldRepDiscount, matchingDiscount } = req.body;

    const updateData = {};
    
    if (planType) {
      // Update plan capabilities based on plan type
      const planCapabilities = {
        BASIC_FREE: { canTakeBookings: false, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false },
        BOOKING_BASIC: { canTakeBookings: true, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false },
        PRODUCTS_PREMIUM: { canTakeBookings: true, canListProducts: true, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false },
        TOP_BRONZE: { canTakeBookings: true, canListProducts: true, searchPriority: 10, hasPriorityBadge: true, hasPromotionalVideo: false },
        TOP_SILVER: { canTakeBookings: true, canListProducts: true, searchPriority: 5, hasPriorityBadge: true, hasPromotionalVideo: false },
        TOP_GOLD: { canTakeBookings: true, canListProducts: true, searchPriority: 3, hasPriorityBadge: true, hasPromotionalVideo: true }
      };
      
      updateData.planType = planType;
      Object.assign(updateData, planCapabilities[planType] || {});
    }
    
    if (pricePerYear !== undefined) updateData.pricePerYear = parseFloat(pricePerYear);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (fieldRepDiscount !== undefined) updateData.fieldRepDiscount = parseFloat(fieldRepDiscount) || null;
    if (matchingDiscount !== undefined) updateData.matchingDiscount = parseFloat(matchingDiscount) || null;
    
    // Calculate total discount
    if (fieldRepDiscount !== undefined || matchingDiscount !== undefined) {
      const currentSub = await prisma.providerSubscription.findUnique({ where: { id } });
      const newFieldDiscount = fieldRepDiscount !== undefined ? parseFloat(fieldRepDiscount) || 0 : (currentSub?.fieldRepDiscount || 0);
      const newMatchingDiscount = matchingDiscount !== undefined ? parseFloat(matchingDiscount) || 0 : (currentSub?.matchingDiscount || 0);
      updateData.totalDiscount = Math.min(newFieldDiscount + newMatchingDiscount, 50);
    }

    const subscription = await prisma.providerSubscription.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      subscription,
      message: 'Provider subscription updated successfully'
    });
  } catch (error) {
    console.error('Update provider subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update provider subscription'
    });
  }
});

// Update user subscription  
router.patch('/subscriptions/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { planType, pricePerPeriod, periodMonths, isActive, isTrial, expiresAt, maxFamilyMembers } = req.body;

    const updateData = {};
    
    if (planType) {
      // Update plan capabilities based on plan type
      const planCapabilities = {
        FREE: { hasMedicalDiscounts: false, hasAllCategoryDiscounts: false, maxFamilyMembers: 0 },
        MEDICAL_CARD: { hasMedicalDiscounts: true, hasAllCategoryDiscounts: false, maxFamilyMembers: 4 },
        ALL_INCLUSIVE: { hasMedicalDiscounts: true, hasAllCategoryDiscounts: true, maxFamilyMembers: 4 }
      };
      
      updateData.planType = planType;
      Object.assign(updateData, planCapabilities[planType] || {});
    }
    
    if (pricePerPeriod !== undefined) updateData.pricePerPeriod = parseFloat(pricePerPeriod);
    if (periodMonths !== undefined) updateData.periodMonths = parseInt(periodMonths);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isTrial !== undefined) updateData.isTrial = isTrial;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (maxFamilyMembers !== undefined) updateData.maxFamilyMembers = parseInt(maxFamilyMembers);

    const subscription = await prisma.userSubscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      subscription,
      message: 'User subscription updated successfully'
    });
  } catch (error) {
    console.error('Update user subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user subscription'
    });
  }
});

// Cancel provider subscription
router.post('/subscriptions/providers/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { immediate = false, reason } = req.body;

    const subscription = await prisma.providerSubscription.update({
      where: { id },
      data: {
        isActive: immediate ? false : true,
        ...(immediate && { expiresAt: new Date() })
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for the provider
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: immediate ? 'تم إلغاء اشتراكك فوراً' : 'سيتم إلغاء اشتراكك في نهاية الفترة',
        message: reason || 'تم إلغاء اشتراكك من قِبل الإدارة',
        userId: subscription.providerId
      }
    });

    res.json({
      success: true,
      subscription,
      message: immediate ? 'Provider subscription cancelled immediately' : 'Provider subscription will not renew'
    });
  } catch (error) {
    console.error('Cancel provider subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel provider subscription'
    });
  }
});

// Cancel user subscription
router.post('/subscriptions/users/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { immediate = false, reason } = req.body;

    const subscription = await prisma.userSubscription.update({
      where: { id },
      data: {
        isActive: immediate ? false : true,
        ...(immediate && { expiresAt: new Date() })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: immediate ? 'تم إلغاء اشتراكك فوراً' : 'سيتم إلغاء اشتراكك في نهاية الفترة',
        message: reason || 'تم إلغاء اشتراكك من قِبل الإدارة',
        userId: subscription.userId
      }
    });

    res.json({
      success: true,
      subscription,
      message: immediate ? 'User subscription cancelled immediately' : 'User subscription will not renew'
    });
  } catch (error) {
    console.error('Cancel user subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel user subscription'
    });
  }
});

// Upgrade provider subscription
router.post('/subscriptions/providers/:id/upgrade', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPlanType, newPrice } = req.body;

    if (!newPlanType) {
      return res.status(400).json({
        success: false,
        message: 'New plan type is required'
      });
    }

    const planCapabilities = {
      BASIC_FREE: { canTakeBookings: false, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 0 },
      BOOKING_BASIC: { canTakeBookings: true, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 1000 },
      PRODUCTS_PREMIUM: { canTakeBookings: true, canListProducts: true, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 2000 },
      TOP_BRONZE: { canTakeBookings: true, canListProducts: true, searchPriority: 10, hasPriorityBadge: true, hasPromotionalVideo: false, pricePerYear: 10000 },
      TOP_SILVER: { canTakeBookings: true, canListProducts: true, searchPriority: 5, hasPriorityBadge: true, hasPromotionalVideo: false, pricePerYear: 20000 },
      TOP_GOLD: { canTakeBookings: true, canListProducts: true, searchPriority: 3, hasPriorityBadge: true, hasPromotionalVideo: true, pricePerYear: 30000 }
    };

    if (!planCapabilities[newPlanType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const subscription = await prisma.providerSubscription.update({
      where: { id },
      data: {
        planType: newPlanType,
        pricePerYear: newPrice || planCapabilities[newPlanType].pricePerYear,
        ...planCapabilities[newPlanType],
        isActive: true,
        // Extend expiry by 1 year from today
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'تم ترقية اشتراكك',
        message: `تم ترقية اشتراكك إلى ${newPlanType}`,
        userId: subscription.providerId
      }
    });

    res.json({
      success: true,
      subscription,
      message: 'Provider subscription upgraded successfully'
    });
  } catch (error) {
    console.error('Upgrade provider subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade provider subscription'
    });
  }
});

// Downgrade provider subscription
router.post('/subscriptions/providers/:id/downgrade', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPlanType, newPrice } = req.body;

    if (!newPlanType) {
      return res.status(400).json({
        success: false,
        message: 'New plan type is required'
      });
    }

    const planCapabilities = {
      BASIC_FREE: { canTakeBookings: false, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 0 },
      BOOKING_BASIC: { canTakeBookings: true, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 1000 },
      PRODUCTS_PREMIUM: { canTakeBookings: true, canListProducts: true, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 2000 },
      TOP_BRONZE: { canTakeBookings: true, canListProducts: true, searchPriority: 10, hasPriorityBadge: true, hasPromotionalVideo: false, pricePerYear: 10000 },
      TOP_SILVER: { canTakeBookings: true, canListProducts: true, searchPriority: 5, hasPriorityBadge: true, hasPromotionalVideo: false, pricePerYear: 20000 },
      TOP_GOLD: { canTakeBookings: true, canListProducts: true, searchPriority: 3, hasPriorityBadge: true, hasPromotionalVideo: true, pricePerYear: 30000 }
    };

    if (!planCapabilities[newPlanType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const subscription = await prisma.providerSubscription.update({
      where: { id },
      data: {
        planType: newPlanType,
        pricePerYear: newPrice || planCapabilities[newPlanType].pricePerYear,
        ...planCapabilities[newPlanType]
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'تم تخفيض اشتراكك',
        message: `تم تخفيض اشتراكك إلى ${newPlanType}`,
        userId: subscription.providerId
      }
    });

    res.json({
      success: true,
      subscription,
      message: 'Provider subscription downgraded successfully'
    });
  } catch (error) {
    console.error('Downgrade provider subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to downgrade provider subscription'
    });
  }
});

// Create new provider subscription
router.post('/subscriptions/providers', async (req, res) => {
  try {
    const { userId, planType, pricePerYear, isActive = true } = req.body;

    if (!userId || !planType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and plan type are required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has provider subscription
    const existingSubscription = await prisma.providerSubscription.findUnique({
      where: { providerId: userId }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has a provider subscription'
      });
    }

    const planCapabilities = {
      BASIC_FREE: { canTakeBookings: false, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 0 },
      BOOKING_BASIC: { canTakeBookings: true, canListProducts: false, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 1000 },
      PRODUCTS_PREMIUM: { canTakeBookings: true, canListProducts: true, searchPriority: 0, hasPriorityBadge: false, hasPromotionalVideo: false, pricePerYear: 2000 },
      TOP_BRONZE: { canTakeBookings: true, canListProducts: true, searchPriority: 10, hasPriorityBadge: true, hasPromotionalVideo: false, pricePerYear: 10000 },
      TOP_SILVER: { canTakeBookings: true, canListProducts: true, searchPriority: 5, hasPriorityBadge: true, hasPromotionalVideo: false, pricePerYear: 20000 },
      TOP_GOLD: { canTakeBookings: true, canListProducts: true, searchPriority: 3, hasPriorityBadge: true, hasPromotionalVideo: true, pricePerYear: 30000 }
    };

    if (!planCapabilities[planType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Update user role to PROVIDER if they're not already
    if (user.role !== 'PROVIDER') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'PROVIDER' }
      });
    }

    const subscription = await prisma.providerSubscription.create({
      data: {
        providerId: userId,
        planType,
        pricePerYear: pricePerYear || planCapabilities[planType].pricePerYear,
        isActive,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        ...planCapabilities[planType]
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'تم إنشاء اشتراكك',
        message: `تم إنشاء اشتراك ${planType} لك بنجاح`,
        userId
      }
    });

    res.status(201).json({
      success: true,
      subscription,
      message: 'Provider subscription created successfully'
    });
  } catch (error) {
    console.error('Create provider subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create provider subscription'
    });
  }
});

// Create new user subscription
router.post('/subscriptions/users', async (req, res) => {
  try {
    const { userId, planType, pricePerPeriod, periodMonths = 12, isActive = true } = req.body;

    if (!userId || !planType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and plan type are required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has user subscription
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has a user subscription'
      });
    }

    const planCapabilities = {
      FREE: { hasMedicalDiscounts: false, hasAllCategoryDiscounts: false, maxFamilyMembers: 0, pricePerPeriod: 0 },
      MEDICAL_CARD: { hasMedicalDiscounts: true, hasAllCategoryDiscounts: false, maxFamilyMembers: 4, pricePerPeriod: 120 },
      ALL_INCLUSIVE: { hasMedicalDiscounts: true, hasAllCategoryDiscounts: true, maxFamilyMembers: 4, pricePerPeriod: 300 }
    };

    if (!planCapabilities[planType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planType,
        pricePerPeriod: pricePerPeriod || planCapabilities[planType].pricePerPeriod,
        periodMonths,
        isActive,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000),
        ...planCapabilities[planType]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'SYSTEM',
        title: 'تم إنشاء اشتراكك',
        message: `تم إنشاء اشتراك ${planType} لك بنجاح`,
        userId
      }
    });

    res.status(201).json({
      success: true,
      subscription,
      message: 'User subscription created successfully'
    });
  } catch (error) {
    console.error('Create user subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user subscription'
    });
  }
});

/**
 * BUSINESS APPLICATIONS
 */

// Get all business applications
router.get('/applications', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status = '',
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status })
    };

    const [applications, total] = await Promise.all([
      prisma.businessApplication.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          documents: true
        }
      }),
      prisma.businessApplication.count({ where })
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Update application status
router.patch('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusNotes } = req.body;

    const application = await prisma.businessApplication.update({
      where: { id },
      data: {
        status,
        statusNotes,
        reviewedBy: req.admin.id,
        reviewedAt: new Date(),
        ...(status === 'APPROVED' && { approvedAt: new Date() }),
        ...(status === 'REJECTED' && { rejectedAt: new Date() })
      }
    });

    // If approved, upgrade user to PROVIDER role
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: application.applicantId },
        data: {
          role: 'PROVIDER'
        }
      });
    }

    res.json({
      success: true,
      application,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
});

/**
 * COUPONS MANAGEMENT
 */

// Get all coupons
router.get('/coupons', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      active = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(active !== '' && { active: active === 'true' })
    };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.coupon.count({ where })
    ]);

    res.json({
      success: true,
      coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons'
    });
  }
});

// Create coupon
router.post('/coupons', async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      targetType,
      targetId,
      discountPercent,
      discountAmount,
      maxUses,
      maxUsesPerUser,
      minOrderAmount,
      validFrom,
      expiresAt,
      active
    } = req.body;

    const coupon = await prisma.coupon.create({
      data: {
        code,
        title,
        description,
        targetType,
        targetId,
        discountPercent,
        discountAmount,
        maxUses,
        maxUsesPerUser,
        minOrderAmount,
        validFrom: validFrom ? new Date(validFrom) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== undefined ? active : true
      }
    });

    res.json({
      success: true,
      coupon,
      message: 'Coupon created successfully'
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon'
    });
  }
});

// Update coupon
router.patch('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      discountPercent,
      discountAmount,
      maxUses,
      maxUsesPerUser,
      minOrderAmount,
      validFrom,
      expiresAt,
      active
    } = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(discountPercent !== undefined && { discountPercent }),
        ...(discountAmount !== undefined && { discountAmount }),
        ...(maxUses !== undefined && { maxUses }),
        ...(maxUsesPerUser !== undefined && { maxUsesPerUser }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        ...(active !== undefined && { active })
      }
    });

    res.json({
      success: true,
      coupon,
      message: 'Coupon updated successfully'
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon'
    });
  }
});

// Delete coupon
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon'
    });
  }
});

/**
 * CATEGORIES MANAGEMENT
 */

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
        _count: {
          select: {
            Service: true,
            subCategories: true
          }
        }
      },
      orderBy: { position: 'asc' }
    });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, designId } = req.body;

    // If no designId provided, get or create a default design
    let finalDesignId = designId;
    if (!finalDesignId) {
      const defaultDesign = await prisma.design.findFirst({
        where: { slug: 'default' }
      });
      if (defaultDesign) {
        finalDesignId = defaultDesign.id;
      } else {
        // Create a default design
        const newDesign = await prisma.design.create({
          data: {
            name: 'Default',
            description: 'Default design template',
            slug: 'default',
            categoryId: '' // Will be updated
          }
        });
        finalDesignId = newDesign.id;
      }
    }

    // Get the maximum position to add the new category at the end
    const maxPosition = await prisma.category.aggregate({
      _max: { position: true }
    });
    const nextPosition = (maxPosition._max.position || 0) + 1;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        designId: finalDesignId,
        position: nextPosition
      }
    });

    res.json({
      success: true,
      category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Update category
router.patch('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists and has subcategories or services
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: { select: { id: true } },
        Service: { select: { id: true } },
        _count: {
          select: {
            subCategories: true,
            Service: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has any dependencies
    if (category._count.subCategories > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${category._count.subCategories} subcategories. Please delete or reassign them first.`
      });
    }

    if (category._count.Service > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${category._count.Service} services linked to it. Please reassign them first.`
      });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * SUBCATEGORIES MANAGEMENT
 */

// Get all subcategories
router.get('/subcategories', async (req, res) => {
  try {
    const subcategories = await prisma.subCategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      subCategories: subcategories
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories'
    });
  }
});

// Create subcategory
router.post('/subcategories', async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Name and categoryId are required'
      });
    }

    const subcategory = await prisma.subCategory.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      subCategory: subcategory,
      message: 'Subcategory created successfully'
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subcategory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update subcategory
router.patch('/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    }

    const subcategory = await prisma.subCategory.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      subCategory: subcategory,
      message: 'Subcategory updated successfully'
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subcategory'
    });
  }
});

// Delete subcategory
router.delete('/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subcategory exists and has services
    const subcategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // Check if subcategory has services
    if (subcategory._count.services > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subcategory. It has ${subcategory._count.services} services linked to it. Please reassign them first.`
      });
    }

    // Delete the subcategory
    await prisma.subCategory.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * REVIEWS MANAGEMENT
 */

// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          service: {
            select: {
              id: true,
              embeddingText: true
            }
          },
          product: {
            select: {
              id: true,
              name: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.review.count()
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

/**
 * DELIVERIES MANAGEMENT
 */

// Get all deliveries
router.get('/deliveries', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status })
    };

    const [deliveries, total] = await Promise.all([
      prisma.deliveryTracking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      }),
      prisma.deliveryTracking.count({ where })
    ]);

    res.json({
      success: true,
      deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliveries'
    });
  }
});

// Update delivery status
router.patch('/deliveries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingCode, lastLocation, eta } = req.body;

    const delivery = await prisma.deliveryTracking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(carrier && { carrier }),
        ...(trackingCode && { trackingCode }),
        ...(lastLocation && { lastLocation }),
        ...(eta && { eta: new Date(eta) })
      }
    });

    res.json({
      success: true,
      delivery,
      message: 'Delivery updated successfully'
    });
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery'
    });
  }
});

/**
 * NOTIFICATIONS MANAGEMENT
 */

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type = '',
      isRead = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(type && { type }),
      ...(isRead !== '' && { isRead: isRead === 'true' })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          shop: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Create notification
router.post('/notifications', async (req, res) => {
  try {
    const {
      type,
      title,
      message,
      userId,
      shopId,
      metadata,
      data,
      actionUrl,
      imageUrl
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        ...(userId && { userId }),
        ...(shopId && { shopId }),
        ...(metadata && { metadata }),
        ...(data && { data }),
        ...(actionUrl && { actionUrl }),
        ...(imageUrl && { imageUrl })
      }
    });

    res.json({
      success: true,
      notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

/**
 * ACTIVITY FEED
 */

// Get recent platform activities
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Fetch recent activities from various sources
    const [recentUsers, recentShops, recentOrders, recentBookings, recentReviews] = await Promise.all([
      prisma.user.findMany({
        take: parseInt(limit) / 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true
        }
      }),
      prisma.shop.findMany({
        take: parseInt(limit) / 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }),
      prisma.order.findMany({
        take: parseInt(limit) / 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.booking.findMany({
        take: parseInt(limit) / 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          bookingRef: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          },
          service: {
            select: {
              embeddingText: true
            }
          }
        }
      }),
      prisma.review.findMany({
        take: parseInt(limit) / 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Format activities
    const activities = [
      ...recentUsers.map(u => ({
        type: 'USER_JOINED',
        title: `مستخدم جديد: ${u.name}`,
        description: `تسجيل ${u.role}`,
        timestamp: u.createdAt,
        id: u.id
      })),
      ...recentShops.map(s => ({
        type: 'SHOP_CREATED',
        title: `متجر جديد: ${s.name}`,
        description: 'تم إضافة متجر جديد',
        timestamp: s.createdAt,
        id: s.id
      })),
      ...recentOrders.map(o => ({
        type: 'ORDER_PLACED',
        title: `طلب جديد: ${o.orderNumber}`,
        description: `${o.user.name} - ${o.totalAmount} جنيه`,
        timestamp: o.createdAt,
        id: o.id
      })),
      ...recentBookings.map(b => ({
        type: 'BOOKING_MADE',
        title: `حجز جديد: ${b.bookingRef}`,
        description: `${b.user.name} - ${b.service.embeddingText.substring(0, 50)}...`,
        timestamp: b.createdAt,
        id: b.id
      })),
      ...recentReviews.map(r => ({
        type: 'REVIEW_POSTED',
        title: `تقييم جديد: ${r.rating} نجوم`,
        description: `${r.author.name} - ${r.comment?.substring(0, 50) || ''}`,
        timestamp: r.createdAt,
        id: r.id
      }))
    ];

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      activities: activities.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

/**
 * SYSTEM SETTINGS
 */

// Get system settings (placeholder - you might want to create a Settings model)
router.get('/settings', async (req, res) => {
  try {
    // This is a placeholder. You might want to create a Settings model
    // or store settings in environment variables/config files
    const settings = {
      siteName: process.env.SITE_NAME || 'دليل بلدي',
      siteUrl: process.env.SITE_URL || 'https://www.daleelbalady.com',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      defaultLanguage: 'ar'
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Update system settings
router.patch('/settings', async (req, res) => {
  try {
    const settings = req.body;

    // This is a placeholder. Implement actual settings update logic
    // You might want to store in a database or update environment variables

    res.json({
      success: true,
      settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// CATEGORY ORDERING ENDPOINTS

// Move category up
router.patch('/categories/:id/move-up', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current category
    const currentCategory = await prisma.category.findUnique({
      where: { id },
      select: { position: true }
    });
    
    if (!currentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Find the category with the next lower position
    const previousCategory = await prisma.category.findFirst({
      where: {
        position: {
          lt: currentCategory.position
        }
      },
      orderBy: { position: 'desc' },
      select: { id: true, position: true }
    });
    
    if (!previousCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category is already at the top'
      });
    }
    
    // Swap positions
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: { position: previousCategory.position }
      });
      
      await tx.category.update({
        where: { id: previousCategory.id },
        data: { position: currentCategory.position }
      });
    });
    
    res.json({
      success: true,
      message: 'Category moved up successfully'
    });
  } catch (error) {
    console.error('Move category up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move category up'
    });
  }
});

// Move category down
router.patch('/categories/:id/move-down', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current category
    const currentCategory = await prisma.category.findUnique({
      where: { id },
      select: { position: true }
    });
    
    if (!currentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Find the category with the next higher position
    const nextCategory = await prisma.category.findFirst({
      where: {
        position: {
          gt: currentCategory.position
        }
      },
      orderBy: { position: 'asc' },
      select: { id: true, position: true }
    });
    
    if (!nextCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category is already at the bottom'
      });
    }
    
    // Swap positions
    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: { position: nextCategory.position }
      });
      
      await tx.category.update({
        where: { id: nextCategory.id },
        data: { position: currentCategory.position }
      });
    });
    
    res.json({
      success: true,
      message: 'Category moved down successfully'
    });
  } catch (error) {
    console.error('Move category down error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move category down'
    });
  }
});

// Move subcategory to different parent category
router.patch('/subcategories/:id/move-to-category', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'New category ID is required'
      });
    }
    
    // Check if subcategory exists
    const subcategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true }
        },
        _count: {
          select: { services: true }
        }
      }
    });
    
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    
    // Check if target category exists
    const targetCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true }
    });
    
    if (!targetCategory) {
      return res.status(404).json({
        success: false,
        message: 'Target category not found'
      });
    }
    
    // Don't move if it's already in the same category
    if (subcategory.categoryId === categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory is already in this category'
      });
    }
    
    // Update subcategory's parent category
    const updatedSubcategory = await prisma.subCategory.update({
      where: { id },
      data: { categoryId },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });
    
    res.json({
      success: true,
      message: `Subcategory "${subcategory.name}" moved from "${subcategory.category.name}" to "${targetCategory.name}" successfully`,
      subCategory: updatedSubcategory
    });
  } catch (error) {
    console.error('Move subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move subcategory',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update category positions in bulk (for drag-and-drop reordering)
router.patch('/categories/reorder', async (req, res) => {
  try {
    const { categoryOrders } = req.body; // Array of { id, position }
    
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({
        success: false,
        message: 'categoryOrders must be an array'
      });
    }
    
    // Update all positions in a transaction
    await prisma.$transaction(
      categoryOrders.map(({ id, position }) =>
        prisma.category.update({
          where: { id },
          data: { position: parseInt(position) }
        })
      )
    );
    
    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder categories'
    });
  }
});

export default router;

