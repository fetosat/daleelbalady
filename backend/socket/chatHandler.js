import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

// Store active socket connections by userId
const activeUsers = new Map();

/**
 * Setup chat socket handlers
 */
export function setupChatSocket(io) {
  const chatNamespace = io.of('/chat');

  chatNamespace.use((socket, next) => {
    // Authenticate socket connection
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    // TODO: Verify JWT token and extract userId
    // For now, we'll accept the connection
    next();
  });

  chatNamespace.on('connection', (socket) => {
    console.log('Chat socket connected:', socket.id);

    let userId = null;

    // Handle user authentication
    socket.on('authenticate', (data) => {
      userId = data.userId;
      
      if (userId) {
        activeUsers.set(userId, socket.id);
        
        // Notify all users that this user is online
        socket.broadcast.emit('userOnline', userId);
        
        console.log(`User ${userId} authenticated and online`);
      }
    });

    // Join a chat room
    socket.on('joinChat', async (chatId) => {
      try {
        // Verify user is participant in chat
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
          select: {
            id: true,
            initiatorId: true,
            recipientId: true,
          },
        });

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // TODO: Verify userId is participant
        // For now, allow joining
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat ${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave a chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    });

    // Handle new message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, text, senderId } = data;

        if (!chatId || !text || !senderId) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId,
            text,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePic: true,
              },
            },
          },
        });

        // Update chat's lastMessageAt
        await prisma.chat.update({
          where: { id: chatId },
          data: {
            lastMessageAt: new Date(),
          },
        });

        // Emit new message to all users in the chat room
        chatNamespace.to(chatId).emit('newMessage', message);

        console.log(`Message sent in chat ${chatId} by user ${senderId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', async (data) => {
      const { chatId, userId } = data;

      if (!chatId || !userId) return;

      try {
        // Get user name
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        // Emit typing event to other users in the chat
        socket.to(chatId).emit('userTyping', {
          chatId,
          userId,
          userName: user?.name || 'User',
        });
      } catch (error) {
        console.error('Error handling typing event:', error);
      }
    });

    // Handle stop typing indicator
    socket.on('stopTyping', (data) => {
      const { chatId, userId } = data;

      if (!chatId || !userId) return;

      // Emit stop typing event to other users in the chat
      socket.to(chatId).emit('userStopTyping', { chatId, userId });
    });

    // Handle message read
    socket.on('markAsRead', async (data) => {
      try {
        const { chatId, messageId, userId } = data;

        if (!chatId || !messageId || !userId) {
          socket.emit('error', { message: 'Invalid data' });
          return;
        }

        // Update message as read
        await prisma.message.update({
          where: { id: messageId },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        // Notify sender that message was read
        chatNamespace.to(chatId).emit('messageRead', { messageId, chatId });

        console.log(`Message ${messageId} marked as read by user ${userId}`);
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Chat socket disconnected:', socket.id);

      if (userId) {
        activeUsers.delete(userId);
        
        // Notify all users that this user is offline
        socket.broadcast.emit('userOffline', userId);
        
        console.log(`User ${userId} offline`);
      }
    });
  });

  console.log('Chat socket handlers setup complete');
}

/**
 * Check if a user is online
 */
export function isUserOnline(userId) {
  return activeUsers.has(userId);
}

/**
 * Get socket ID for a user
 */
export function getUserSocket(userId) {
  return activeUsers.get(userId);
}

