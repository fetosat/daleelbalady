import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/notifications - Create a notification
router.post('/', async (req, res) => {
  try {
    const { userId, type, title, message, data, actionUrl, imageUrl } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, type, title, and message are required'
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
        actionUrl,
        imageUrl,
        isRead: false
      }
    });

    res.status(201).json({
      success: true,
      notification,
      message: 'Notification created successfully'
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/notifications/user/:userId - Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = 'false', type } = req.query;

    let whereClause = {
      userId
    };

    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    if (type) {
      whereClause.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const totalNotifications = await prisma.notification.count({
      where: whereClause
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/notifications/user/:userId/stats - Get notification statistics
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const total = await prisma.notification.count({
      where: { userId }
    });

    const unread = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    // Get count by type
    const byTypeData = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true
      }
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
        byType
      }
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/notifications/user/:userId/unread-count - Get unread count
router.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      notification: updatedNotification,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/notifications/user/:userId/mark-all-read - Mark all notifications as read
router.put('/user/:userId/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      updatedCount: result.count,
      message: `${result.count} notifications marked as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/notifications/:notificationId - Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/notifications/user/:userId/delete-read - Delete all read notifications
router.delete('/user/:userId/delete-read', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true
      }
    });

    res.json({
      success: true,
      deletedCount: result.count,
      message: `${result.count} read notifications deleted`
    });

  } catch (error) {
    console.error('Error deleting read notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/notifications/user/:userId/delete-all - Delete all notifications
router.delete('/user/:userId/delete-all', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await prisma.notification.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      deletedCount: result.count,
      message: `${result.count} notifications deleted`
    });

  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

