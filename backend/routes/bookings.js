import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      serviceId,
      shopId,
      startAt,
      endAt,
      customerName,
      customerPhone,
      customerEmail,
      notes
    } = req.body;

    // Validation
    if (!serviceId || !startAt || !endAt) {
      return res.status(400).json({
        error: 'Missing required fields: serviceId, startAt, endAt'
      });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({
        error: 'Customer name and phone are required'
      });
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        ownerUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Create booking reference
    const bookingRef = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: req.user.id,
        serviceId,
        shopId: shopId || null,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        status: 'PENDING',
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        notes: notes || null
      },
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
            id: true,
            price: true,
            currency: true,
            durationMins: true,
            translation: true,
            ownerUser: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    // TODO: Send notification to service provider
    // TODO: Send confirmation email/SMS to customer

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { startAt: 'desc' },
        include: {
          service: {
            select: {
              id: true,
              price: true,
              currency: true,
              durationMins: true,
              translation: true,
              ownerUser: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true
                }
              }
            }
          },
          shop: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
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
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/bookings/provider/list
 * @desc    Get bookings for service provider
 * @access  Private (Provider only)
 */
router.get('/provider/list', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      service: {
        ownerUserId: req.user.id
      }
    };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { startAt: 'desc' },
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
              id: true,
              price: true,
              currency: true,
              durationMins: true,
              translation: true
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
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
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
            id: true,
            price: true,
            currency: true,
            durationMins: true,
            translation: true,
            ownerUser: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns the booking or is the service provider
    if (booking.userId !== req.user.id && booking.service.ownerUser?.id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/bookings/:id
 * @desc    Update booking status
 * @access  Private
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        service: {
          select: {
            ownerUser: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only booking owner or service provider can update
    if (booking.userId !== req.user.id && booking.service.ownerUser?.id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
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
            id: true,
            price: true,
            currency: true,
            durationMins: true,
            translation: true
          }
        }
      }
    });

    res.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully'
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      error: 'Failed to update booking',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel/Delete booking
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        service: {
          select: {
            ownerUser: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only booking owner can cancel
    if (booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status to cancelled instead of deleting
    await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      error: 'Failed to cancel booking',
      message: error.message
    });
  }
});

export default router;

