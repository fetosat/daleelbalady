// Universal conversion system for admin to fix data issues
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
 * Convert any entity to another type
 * Supports: User <-> Shop <-> Service <-> Product
 */
router.post('/convert', async (req, res) => {
  try {
    const {
      sourceType,    // 'user', 'shop', 'service', 'product'
      sourceId,      // ID of source entity
      targetType,    // 'user', 'shop', 'service', 'product'
      targetData     // Additional data needed for conversion
    } = req.body;

    console.log('🔄 Universal conversion request:', {
      from: sourceType,
      to: targetType,
      sourceId,
      targetData
    });

    // Validate input
    const validTypes = ['user', 'shop', 'service', 'product'];
    if (!validTypes.includes(sourceType) || !validTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source or target type'
      });
    }

    if (sourceType === targetType) {
      return res.status(400).json({
        success: false,
        message: 'Source and target types cannot be the same'
      });
    }

    let result;

    // Handle different conversion scenarios
    if (sourceType === 'user') {
      result = await convertFromUser(sourceId, targetType, targetData);
    } else if (sourceType === 'shop') {
      result = await convertFromShop(sourceId, targetType, targetData);
    } else if (sourceType === 'service') {
      result = await convertFromService(sourceId, targetType, targetData);
    } else if (sourceType === 'product') {
      result = await convertFromProduct(sourceId, targetType, targetData);
    }

    console.log('✅ Conversion successful:', result);

    res.json({
      success: true,
      message: `Successfully converted ${sourceType} to ${targetType}`,
      result
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to convert entity'
    });
  }
});

// Convert from User to Shop/Service/Product
async function convertFromUser(userId, targetType, data) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return await prisma.$transaction(async (tx) => {
    let created;

    if (targetType === 'shop') {
      // Create shop with user as owner
      const slug = (data.name || user.name).toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + Date.now();

      // Get or create default design
      let design = await tx.design.findFirst({
        where: { slug: 'default' }
      });
      
      if (!design) {
        design = await tx.design.create({
          data: {
            name: 'Default',
            description: 'Default design',
            slug: 'default',
            categoryId: ''
          }
        });
      }

      created = await tx.shop.create({
        data: {
          name: data.name || user.name,
          slug,
          description: data.description || '',
          city: data.city || 'Cairo',
          ownerId: userId,
          designId: design.id,
          phone: data.phone || user.phone,
          email: data.email || user.email,
          isVerified: data.isVerified || false
        }
      });

      // Update user role if needed
      if (user.role === 'CUSTOMER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'PROVIDER' }
        });
      }

    } else if (targetType === 'service') {
      // Create service
      created = await tx.service.create({
        data: {
          embeddingText: data.embeddingText || user.name + ' Service',
          phone: data.phone || user.phone,
          city: data.city || 'Cairo',
          price: data.price ? parseFloat(data.price) : null,
          currency: data.currency || 'EGP',
          available: data.available !== false,
          ownerUserId: userId,
          shopId: data.shopId || null,
          coverImage: data.coverImage || null
        }
      });

      // Update user role if needed
      if (user.role === 'CUSTOMER') {
        await tx.user.update({
          where: { id: userId },
          data: { role: 'PROVIDER' }
        });
      }

    } else if (targetType === 'product') {
      // Need a shop for product, create one if not specified
      let shopId = data.shopId;
      
      if (!shopId) {
        // Check if user has a shop
        const userShop = await tx.shop.findFirst({
          where: { ownerId: userId }
        });

        if (userShop) {
          shopId = userShop.id;
        } else {
          // Create a default shop for the user
          const slug = user.name.toLowerCase()
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50) + '-shop-' + Date.now();

          let design = await tx.design.findFirst({
            where: { slug: 'default' }
          });
          
          if (!design) {
            design = await tx.design.create({
              data: {
                name: 'Default',
                description: 'Default design',
                slug: 'default',
                categoryId: ''
              }
            });
          }

          const newShop = await tx.shop.create({
            data: {
              name: user.name + ' Shop',
              slug,
              description: 'Auto-created shop',
              city: 'Cairo',
              ownerId: userId,
              designId: design.id
            }
          });
          shopId = newShop.id;
        }
      }

      created = await tx.product.create({
        data: {
          name: data.name || user.name + ' Product',
          description: data.description || '',
          price: data.price ? parseFloat(data.price) : 0,
          currency: data.currency || 'EGP',
          stock: data.stock ? parseInt(data.stock) : 0,
          isActive: data.isActive !== false,
          shopId,
          lister: {
    connect: { id: userId }
},
          sku: 'SKU-' + Date.now()
        }
      });
    }

    // Delete original user if requested
    if (data.deleteOriginal) {
      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() }
      });
    }

    return { original: user, created, targetType };
  });
}

// Convert from Shop to User/Service/Product
async function convertFromShop(shopId, targetType, data) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: { owner: true }
  });

  if (!shop) {
    throw new Error('Shop not found');
  }

  return await prisma.$transaction(async (tx) => {
    let created;

    if (targetType === 'user') {
      // Create new user from shop data
      const bcrypt = await import('bcryptjs');
      const password = await bcrypt.hash(data.password || 'defaultPassword123', 10);

      created = await tx.user.create({
        data: {
          name: data.name || shop.name,
          email: data.email || shop.email || `${shop.slug}@example.com`,
          phone: data.phone || shop.phone,
          password,
          role: data.role || 'CUSTOMER',
          profilePic: shop.logoImage,
          coverImage: shop.coverImage,
          bio: shop.description
        }
      });

    } else if (targetType === 'service') {
      // Convert shop to service
      created = await tx.service.create({
        data: {
          embeddingText: data.embeddingText || shop.name + ' Service',
          phone: data.phone || shop.phone,
          city: data.city || shop.city || 'Cairo',
          price: data.price ? parseFloat(data.price) : null,
          currency: data.currency || 'EGP',
          available: data.available !== false,
          ownerUserId: shop.ownerId,
          shopId: data.keepShopReference ? shopId : null,
          coverImage: shop.coverImage,
          logoImage: shop.logoImage,
          galleryImages: shop.galleryImages
        }
      });

    } else if (targetType === 'product') {
      // Convert shop to product (keep shop as container)
      created = await tx.product.create({
        data: {
          name: data.name || shop.name + ' Product',
          description: data.description || shop.description || '',
          price: data.price ? parseFloat(data.price) : 0,
          currency: data.currency || 'EGP',
          stock: data.stock ? parseInt(data.stock) : 0,
          isActive: data.isActive !== false,
          shopId: shopId, // Keep reference to original shop
          listerId: shop.ownerId,
          sku: 'SKU-' + Date.now()
        }
      });
    }

    // Delete or archive original shop if requested
    if (data.deleteOriginal) {
      await tx.shop.update({
        where: { id: shopId },
        data: { deletedAt: new Date() }
      });
    }

    return { original: shop, created, targetType };
  });
}

// Convert from Service to User/Shop/Product
async function convertFromService(serviceId, targetType, data) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { 
      ownerUser: true,
      shop: true
    }
  });

  if (!service) {
    throw new Error('Service not found');
  }

  return await prisma.$transaction(async (tx) => {
    let created;

    if (targetType === 'user') {
      // Create user from service
      const bcrypt = await import('bcryptjs');
      const password = await bcrypt.hash(data.password || 'defaultPassword123', 10);

      created = await tx.user.create({
        data: {
          name: data.name || service.embeddingText || 'Service User',
          email: data.email || `service${serviceId}@example.com`,
          phone: data.phone || service.phone,
          password,
          role: data.role || 'PROVIDER',
          profilePic: service.logoImage,
          coverImage: service.coverImage
        }
      });

    } else if (targetType === 'shop') {
      // Convert service to shop
      const slug = (data.name || service.embeddingText || 'service')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + Date.now();

      let design = await tx.design.findFirst({
        where: { slug: 'default' }
      });
      
      if (!design) {
        design = await tx.design.create({
          data: {
            name: 'Default',
            description: 'Default design',
            slug: 'default',
            categoryId: ''
          }
        });
      }

      created = await tx.shop.create({
        data: {
          name: data.name || service.embeddingText || 'Service Shop',
          slug,
          description: data.description || service.embeddingText,
          city: data.city || service.city || 'Cairo',
          ownerId: service.ownerUserId || shop.ownerId,
          designId: design.id,
          phone: data.phone || service.phone,
          email: data.email,
          coverImage: service.coverImage,
          logoImage: service.logoImage,
          galleryImages: service.galleryImages,
          isVerified: data.isVerified || false
        }
      });

    } else if (targetType === 'product') {
      // Convert service to product
      const shopId = data.shopId || service.shopId;
      
      if (!shopId) {
        throw new Error('Shop ID is required to convert service to product');
      }

      created = await tx.product.create({
        data: {
          name: data.name || service.embeddingText || 'Service Product',
          description: data.description || service.embeddingText || '',
          price: data.price || service.price || 0,
          currency: data.currency || service.currency || 'EGP',
          stock: data.stock ? parseInt(data.stock) : 0,
          isActive: data.isActive !== false,
          shopId,
          listerId: service.ownerUserId,
          sku: 'SKU-' + Date.now()
        }
      });
    }

    // Delete original service if requested
    if (data.deleteOriginal) {
      await tx.service.update({
        where: { id: serviceId },
        data: { deletedAt: new Date() }
      });
    }

    return { original: service, created, targetType };
  });
}

// Convert from Product to User/Shop/Service
async function convertFromProduct(productId, targetType, data) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      shop: true,
      lister: true
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return await prisma.$transaction(async (tx) => {
    let created;

    if (targetType === 'user') {
      // Create user from product
      const bcrypt = await import('bcryptjs');
      const password = await bcrypt.hash(data.password || 'defaultPassword123', 10);

      created = await tx.user.create({
        data: {
          name: data.name || product.name,
          email: data.email || `product${productId}@example.com`,
          phone: data.phone,
          password,
          role: data.role || 'CUSTOMER',
          bio: product.description
        }
      });

    } else if (targetType === 'shop') {
      // Convert product to shop
      const slug = (data.name || product.name)
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50) + '-' + Date.now();

      let design = await tx.design.findFirst({
        where: { slug: 'default' }
      });
      
      if (!design) {
        design = await tx.design.create({
          data: {
            name: 'Default',
            description: 'Default design',
            slug: 'default',
            categoryId: ''
          }
        });
      }

      const ownerId = data.ownerId || product.listerId || product.shop?.ownerId;
      
      if (!ownerId) {
        throw new Error('Owner ID is required to convert product to shop');
      }

      created = await tx.shop.create({
        data: {
          name: data.name || product.name,
          slug,
          description: data.description || product.description || '',
          city: data.city || 'Cairo',
          ownerId,
          designId: design.id,
          phone: data.phone,
          email: data.email,
          isVerified: data.isVerified || false
        }
      });

    } else if (targetType === 'service') {
      // Convert product to service
      created = await tx.service.create({
        data: {
          embeddingText: data.embeddingText || product.name,
          phone: data.phone,
          city: data.city || 'Cairo',
          price: product.price,
          currency: product.currency,
          available: data.available !== false,
          ownerUserId: product.listerId || product.shop?.ownerId,
          shopId: data.shopId || product.shopId
        }
      });
    }

    // Delete original product if requested
    if (data.deleteOriginal) {
      await tx.product.update({
        where: { id: productId },
        data: { deletedAt: new Date() }
      });
    }

    return { original: product, created, targetType };
  });
}

export default router;
