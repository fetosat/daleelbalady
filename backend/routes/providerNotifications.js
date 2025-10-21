import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/notifications/provider
 * Purpose: Fetch all notifications relevant to the authenticated provider
 * Authentication: Requires PROVIDER role
 * Filters: status (read, unread), type, page, limit
 */
router.get('/provider', auth, authorize('PROVIDER'), async (req, res) => {
  try {
    const providerId = req.user.id;
    const {
      status = 'all', // all, read, unread
      type, // BOOKING, REVIEW, SYSTEM, ORDER, PRODUCT, CHAT
      page = 1,
      limit = 20,
    } = req.query;

    // Build where clause
    const whereClause = {
      OR: [
        { userId: providerId },
        {
          shop: {
            ownerId: providerId,
          },
        },
      ],
    };

    // Filter by read status
    if (status === 'read') {
      whereClause.isRead = true;
    } else if (status === 'unread') {
      whereClause.isRead = false;
    }

    // Filter by type
    if (type) {
      whereClause.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Fetch notifications
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false,
      },
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching provider notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * PATCH /api/notifications/provider/:id/mark-read
 * Purpose: Mark a specific provider notification as read
 * Authentication: Requires PROVIDER role, must own the notification
 */
router.patch('/provider/:id/mark-read', auth, authorize('PROVIDER'), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;
    const { isRead = true } = req.body;

    // First, get notification with shop details
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Check if notification belongs to the provider
    const belongsToProvider = 
      notification.userId === providerId || 
      (notification.shop && notification.shop.ownerId === providerId);

    if (!belongsToProvider) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this notification',
      });
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });

    // Update analytics if marking as read
    if (isRead) {
      await prisma.userAnalytics.upsert({
        where: { userId: providerId },
        create: {
          userId: providerId,
          notificationsReadCount: 1,
        },
        update: {
          notificationsReadCount: {
            increment: 1,
          },
        },
      });
    }

    res.json({
      success: true,
      notification: updatedNotification,
      message: 'Notification updated successfully',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * PATCH /api/notifications/provider/mark-all-read
 * Purpose: Mark all unread notifications for the authenticated provider as read
 * Authentication: Requires PROVIDER role
 */
router.patch('/provider/mark-all-read', auth, authorize('PROVIDER'), async (req, res) => {
  try {
    const providerId = req.user.id;

    // Build where clause for provider's notifications
    const whereClause = {
      isRead: false,
      OR: [
        { userId: providerId },
        {
          shop: {
            ownerId: providerId,
          },
        },
      ],
    };

    // Count unread notifications before update
    const unreadCount = await prisma.notification.count({
      where: whereClause,
    });

    if (unreadCount === 0) {
      return res.json({
        success: true,
        updatedCount: 0,
        message: 'No unread notifications to update',
      });
    }

    // Update all unread notifications
    const result = await prisma.notification.updateMany({
      where: whereClause,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update analytics
    await prisma.userAnalytics.upsert({
      where: { userId: providerId },
      create: {
        userId: providerId,
        notificationsReadCount: result.count,
      },
      update: {
        notificationsReadCount: {
          increment: result.count,
        },
      },
    });

    res.json({
      success: true,
      updatedCount: result.count,
      message: `${result.count} notifications marked as read`,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * DELETE /api/notifications/provider/:id
 * Purpose: Delete a specific notification for the provider
 * Authentication: Requires PROVIDER role, must own the notification
 */
router.delete('/provider/:id', auth, authorize('PROVIDER'), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    // First, get notification with shop details
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Check if notification belongs to the provider
    const belongsToProvider = 
      notification.userId === providerId || 
      (notification.shop && notification.shop.ownerId === providerId);

    if (!belongsToProvider) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this notification',
      });
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/notifications/provider/unread-count
 * Purpose: Get the total count of unread notifications for the authenticated provider
 * Authentication: Requires PROVIDER role
 */
router.get('/provider/unread-count', auth, authorize('PROVIDER'), async (req, res) => {
  try {
    const providerId = req.user.id;

    const unreadCount = await prisma.notification.count({
      where: {
        isRead: false,
        OR: [
          { userId: providerId },
          {
            shop: {
              ownerId: providerId,
            },
          },
        ],
      },
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/notifications/provider/stats
 * Purpose: Get notification statistics for the provider
 * Authentication: Requires PROVIDER role
 */
router.get('/provider/stats', auth, authorize('PROVIDER'), async (req, res) => {
  try {
    const providerId = req.user.id;

    const whereClause = {
      OR: [
        { userId: providerId },
        {
          shop: {
            ownerId: providerId,
          },
        },
      ],
    };

    // Get total count
    const total = await prisma.notification.count({
      where: whereClause,
    });

    // Get unread count
    const unread = await prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false,
      },
    });

    // Get count by type
    const byTypeData = await prisma.notification.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        type: true,
      },
    });

    const byType = byTypeData.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        total,
        unread,
        byType,
      },
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

