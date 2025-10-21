import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/cart/:userId - Get user's cart contents
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            service: {
              select: {
                id: true,
                vid: true,
                price: true,
                available: true,
                translation: {
                  select: {
                    name_en: true,
                    name_ar: true,
                    description_en: true,
                    description_ar: true
                  }
                },
                shop: {
                  select: {
                    id: true,
                    vid: true,
                    name: true,
                    slug: true,
                    isVerified: true
                  }
                }
              }
            },
            product: {
              select: {
                id: true,
                vid: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                images: true,
                shop: {
                  select: {
                    id: true,
                    vid: true,
                    name: true,
                    slug: true,
                    isVerified: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!cart) {
      return res.json({
        success: true,
        cart: {
          id: null,
          userId,
          items: [],
          total: 0,
          currency: 'EGP',
          itemCount: 0
        }
      });
    }

    // Calculate totals and add metadata
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      success: true,
      cart: {
        ...cart,
        itemCount,
        total: parseFloat(total.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/cart/:userId/add - Add item to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, serviceId, productId, quantity = 1 } = req.body;

    if (!type || !['SERVICE', 'PRODUCT'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid type (SERVICE or PRODUCT) is required'
      });
    }

    if (type === 'SERVICE' && !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Service ID is required for service items'
      });
    }

    if (type === 'PRODUCT' && !productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required for product items'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    let item, unitPrice;

    // Get item details and price
    if (type === 'SERVICE') {
      item = await prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          price: true,
          available: true,
          ownerUserId: true
        }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      if (!item.available) {
        return res.status(400).json({
          success: false,
          message: 'Service is not available'
        });
      }

      if (item.ownerUserId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add your own service to cart'
        });
      }

      unitPrice = item.price;
    } else {
      item = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          price: true,
          stockQuantity: true,
          shop: {
            select: {
              ownerId: true
            }
          }
        }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (item.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${item.stock}`
        });
      }

      if (item.shop.ownerId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add your own product to cart'
        });
      }

      unitPrice = item.price;
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          total: 0,
          currency: 'EGP'
        }
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        ...(type === 'SERVICE' ? { serviceId } : { productId })
      }
    });

    let cartItem;
    const totalPrice = unitPrice * quantity;

    if (existingCartItem) {
      // Update existing item quantity
      const newQuantity = existingCartItem.quantity + quantity;
      const newTotalPrice = unitPrice * newQuantity;

      // Check stock again for products
      if (type === 'PRODUCT' && item.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for total quantity. Available: ${item.stock}`
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          type,
          quantity,
          unitPrice,
          totalPrice,
          ...(type === 'SERVICE' ? { serviceId } : { productId })
        }
      });
    }

    // Update cart total
    const cartTotal = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { totalPrice: true }
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total: cartTotal._sum.totalPrice || 0
      }
    });

    // Track in analytics
    try {
      await fetch(`${process.env.BASE_URL}/api/analytics/track-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
    } catch (analyticsError) {
      console.warn('Failed to track cart analytics:', analyticsError);
    }

    res.status(201).json({
      success: true,
      cartItem,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/cart/:userId/items/:itemId - Update cart item quantity
router.put('/:userId/items/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity (>= 1) is required'
      });
    }

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId
        }
      },
      include: {
        product: {
          select: {
            stock: true
          }
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check stock for products
    if (cartItem.type === 'PRODUCT' && cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${cartItem.product.stock}`
      });
    }

    // Update cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        totalPrice: cartItem.unitPrice * quantity
      }
    });

    // Update cart total
    const cartTotal = await prisma.cartItem.aggregate({
      where: { cartId: cartItem.cartId },
      _sum: { totalPrice: true }
    });

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        total: cartTotal._sum.totalPrice || 0
      }
    });

    res.json({
      success: true,
      cartItem: updatedCartItem,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/cart/:userId/items/:itemId - Remove item from cart
router.delete('/:userId/items/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId
        }
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Remove cart item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    // Update cart total
    const cartTotal = await prisma.cartItem.aggregate({
      where: { cartId: cartItem.cartId },
      _sum: { totalPrice: true }
    });

    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        total: cartTotal._sum.totalPrice || 0
      }
    });

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/cart/:userId/clear - Clear all items from cart
router.delete('/:userId/clear', async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.json({
        success: true,
        message: 'Cart is already empty'
      });
    }

    // Remove all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Update cart total
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total: 0
      }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/cart/:userId/checkout - Process cart checkout
router.post('/:userId/checkout', async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentMethod, shippingAddress, notes } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            service: {
              select: {
                id: true,
                available: true,
                ownerUserId: true
              }
            },
            product: {
              select: {
                id: true,
                stockQuantity: true,
                shop: {
                  select: {
                    ownerId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate all items are still available/in stock
    for (const item of cart.items) {
      if (item.type === 'SERVICE') {
        if (!item.service.available) {
          return res.status(400).json({
            success: false,
            message: `Service ${item.service.id} is no longer available`
          });
        }
      } else {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${item.product.id}`
          });
        }
      }
    }

    // Here you would typically:
    // 1. Process payment using payment gateway
    // 2. Create order records
    // 3. Update product stock quantities
    // 4. Send notifications to shop owners
    // 5. Clear the cart

    // For now, we'll simulate a successful checkout
    const orderId = `ORD-${Date.now()}-${userId.substring(0, 8)}`;

    // Update product stock quantities
    for (const item of cart.items) {
      if (item.type === 'PRODUCT') {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    // Clear cart after successful checkout
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        total: 0
      }
    });

    // Track order in analytics
    try {
      await fetch(`${process.env.BASE_URL}/api/analytics/track-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
    } catch (analyticsError) {
      console.warn('Failed to track order analytics:', analyticsError);
    }

    res.json({
      success: true,
      orderId,
      total: cart.total,
      itemCount: cart.items.length,
      message: 'Checkout completed successfully'
    });

  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/cart/:userId/summary - Get cart summary (item count, total)
router.get('/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            items: true
          }
        },
        items: {
          select: {
            quantity: true,
            totalPrice: true
          }
        }
      }
    });

    if (!cart) {
      return res.json({
        success: true,
        summary: {
          itemCount: 0,
          totalItems: 0,
          total: 0,
          currency: 'EGP'
        }
      });
    }

    const itemCount = cart._count.items;
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      success: true,
      summary: {
        itemCount,
        totalItems,
        total: parseFloat(total.toFixed(2)),
        currency: cart.currency
      }
    });

  } catch (error) {
    console.error('Error fetching cart summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
