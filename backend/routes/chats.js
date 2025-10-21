import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';
import { lightAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/chats - Create or get existing chat between two users
router.post('/', lightAuth, async (req, res) => {
  try {
    // Use authenticated user's ID instead of accepting it from body
    const initiatorId = req.user.id;
    const { recipientId, subject } = req.body;
    
    console.log('=== Chat Creation Request ===');
    console.log('Authenticated user:', req.user.name, req.user.id);
    console.log('Body:', { recipientId, subject });
    console.log('Final IDs:', { initiatorId, recipientId });
    console.log('============================');

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        error: 'Recipient ID is required',
        message: 'Please provide a valid recipient ID',
        timestamp: new Date().toISOString()
      });
    }

    if (initiatorId === recipientId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create chat with yourself',
        message: 'You cannot start a chat with yourself',
        timestamp: new Date().toISOString()
      });
    }

    // Check if recipient user exists
    const recipientUser = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, name: true }
    });

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
        message: 'The user you are trying to chat with does not exist',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Recipient found:', recipientUser.name);

    // Check if chat already exists (either direction)
    let existingChat = await prisma.Chat.findFirst({
      where: {
        OR: [
          {
            initiatorId: initiatorId,
            recipientId: recipientId
          },
          {
            initiatorId: recipientId,
            recipientId: initiatorId
          }
        ]
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        initiator: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        }
      }
    });

    if (existingChat) {
      return res.json({
        success: true,
        chat: existingChat,
        message: 'Existing chat found'
      });
    }

    // Create new chat
    const newChat = await prisma.Chat.create({
      data: {
        initiatorId,
        recipientId,
        subject: subject || null,
        isActive: true
      },
      include: {
        messages: true,
        initiator: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      chat: newChat,
      message: 'Chat created successfully'
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.meta : undefined
    });
  }
});

// GET /api/chats/user/:userId - Get all chats for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, search } = req.query;

    let whereClause = {
      OR: [
        { initiatorId: userId },
        { recipientId: userId }
      ],
      isActive: true
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR.push({
        messages: {
          some: {
            text: {
              contains: search
            }
          }
        }
      });
    }

    const chats = await prisma.Chat.findMany({
      where: whereClause,
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1, // Latest message only
          include: {
            sender: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: userId } // Unread messages not sent by this user
              }
            }
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    const totalChats = await prisma.Chat.count({
      where: whereClause
    });

    res.json({
      success: true,
      chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalChats,
        pages: Math.ceil(totalChats / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/chats/:chatId - Get chat details with messages
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await prisma.Chat.findUnique({
      where: { id: chatId },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePic: true
              }
            },
            attachments: {
              select: {
                id: true,
                filename: true,
                url: true,
                size: true,
                uploaderId: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          },
          skip: (page - 1) * parseInt(limit),
          take: parseInt(limit)
        }
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const totalMessages = await prisma.Message.count({
      where: { chatId }
    });

    res.json({
      success: true,
      chat,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/chats/:chatId/messages - Send message in chat
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text, attachmentIds } = req.body;

    if (!senderId || (!text && !attachmentIds?.length)) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID and message content are required'
      });
    }

    // Verify chat exists and user is participant
    const chat = await prisma.Chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        initiatorId: true,
        recipientId: true,
        isActive: true
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Chat is not active'
      });
    }

    if (senderId !== chat.initiatorId && senderId !== chat.recipientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Create message
    const messageData = {
      chatId,
      senderId,
      text: text || null
    };

    const message = await prisma.Message.create({
      data: messageData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePic: true
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            url: true,
            size: true,
            uploaderId: true,
            createdAt: true
          }
        }
      }
    });

    // Connect attachments if provided
    if (attachmentIds?.length > 0) {
      await prisma.Message.update({
        where: { id: message.id },
        data: {
          attachments: {
            connect: attachmentIds.map(id => ({ id }))
          }
        }
      });
    }

    // Update chat's lastMessageAt
    await prisma.Chat.update({
      where: { id: chatId },
      data: {
        lastMessageAt: new Date()
      }
    });

    // Track message in analytics (optional)
    const receiverId = senderId === chat.initiatorId ? chat.recipientId : chat.initiatorId;
    if (process.env.ENABLE_ANALYTICS === 'true' && (process.env.BASE_URL || process.env.API_URL)) {
      try {
        const baseUrl = process.env.BASE_URL || process.env.API_URL;
        await fetch(`${baseUrl}/api/analytics/track-message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            senderId,
            receiverId
          })
        });
      } catch (analyticsError) {
        console.warn('Failed to track message analytics:', analyticsError);
      }
    }


    res.status(201).json({
      success: true,
      message,
      messageText: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/chats/:chatId/messages/:messageId/read - Mark message as read
router.put('/:chatId/messages/:messageId/read', async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify message exists and user is recipient
    const message = await prisma.Message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          select: {
            initiatorId: true,
            recipientId: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.chatId !== chatId) {
      return res.status(400).json({
        success: false,
        message: 'Message does not belong to this chat'
      });
    }

    // Only allow marking as read if user is recipient (not sender)
    if (message.senderId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark your own message as read'
      });
    }

    if (userId !== message.chat.initiatorId && userId !== message.chat.recipientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Mark message as read
    const updatedMessage = await prisma.Message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: updatedMessage,
      messageText: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/chats/:chatId/mark-all-read - Mark all messages in chat as read for user
router.put('/:chatId/mark-all-read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify user is participant in chat
    const chat = await prisma.Chat.findUnique({
      where: { id: chatId },
      select: {
        initiatorId: true,
        recipientId: true
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (userId !== chat.initiatorId && userId !== chat.recipientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Mark all unread messages (not sent by this user) as read
    const updatedMessages = await prisma.Message.updateMany({
      where: {
        chatId,
        isRead: false,
        senderId: { not: userId }
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      updatedCount: updatedMessages.count,
      message: `${updatedMessages.count} messages marked as read`
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/chats/:chatId/archive - Archive/deactivate chat
router.put('/:chatId/archive', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId, isActive = false } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify user is participant in chat
    const chat = await prisma.Chat.findUnique({
      where: { id: chatId },
      select: {
        initiatorId: true,
        recipientId: true
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (userId !== chat.initiatorId && userId !== chat.recipientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Update chat status
    const updatedChat = await prisma.Chat.update({
      where: { id: chatId },
      data: {
        isActive
      }
    });

    res.json({
      success: true,
      chat: updatedChat,
      message: `Chat ${isActive ? 'reactivated' : 'archived'} successfully`
    });

  } catch (error) {
    console.error('Error archiving chat:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/chats/:chatId/messages/:messageId - Delete message (soft delete)
router.delete('/:chatId/messages/:messageId', async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify message exists and user is sender
    const message = await prisma.Message.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        chatId: true,
        senderId: true,
        createdAt: true
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.chatId !== chatId) {
      return res.status(400).json({
        success: false,
        message: 'Message does not belong to this chat'
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Check if message is too old to delete (e.g., older than 24 hours)
    const hoursSinceCreation = (new Date() - new Date(message.createdAt)) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete messages older than 24 hours'
      });
    }

    // Soft delete by setting text to null and marking as edited
    await prisma.Message.update({
      where: { id: messageId },
      data: {
        text: '[Message deleted]',
        isEdited: true,
        editedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/chats/unread-count/:userId - Get total unread messages count for user
router.get('/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await prisma.Message.count({
      where: {
        chat: {
          OR: [
            { initiatorId: userId },
            { recipientId: userId }
          ],
          isActive: true
        },
        senderId: { not: userId },
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

export default router;
