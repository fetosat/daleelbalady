import { Server } from 'socket.io';

class DeliverySocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.activeTripSockets = new Map(); // tripId -> Set of socketIds
  }

  /**
   * Initialize Socket.IO namespace
   */
  initialize(ioInstance) {
    // Use a namespace instead of creating a new server
    this.io = ioInstance.of('/delivery');

    this.setupEventHandlers();
    console.log('✅ Delivery Socket Service initialized');
  }

  /**
   * Setup all socket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // User authentication and identification
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data);
      });

      // Join a trip room for real-time updates
      socket.on('join_trip', (tripId) => {
        this.handleJoinTrip(socket, tripId);
      });

      // Leave a trip room
      socket.on('leave_trip', (tripId) => {
        this.handleLeaveTrip(socket, tripId);
      });

      // Delivery user sends location update
      socket.on('update_location', (data) => {
        this.handleLocationUpdate(socket, data);
      });

      // Trip status update
      socket.on('update_trip_status', (data) => {
        this.handleTripStatusUpdate(socket, data);
      });

      // Chat messages within a trip
      socket.on('send_message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Typing indicator
      socket.on('typing', (data) => {
        this.handleTypingIndicator(socket, data);
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handler
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  /**
   * Handle user authentication
   */
  handleAuthentication(socket, data) {
    const { userId, userType, token } = data;

    if (!userId || !token) {
      socket.emit('auth_error', { message: 'Invalid authentication data' });
      return;
    }

    // TODO: Verify JWT token here
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    socket.userType = userType;

    console.log(`✅ User authenticated: ${userId} (${userType})`);
    socket.emit('authenticated', { 
      success: true, 
      userId,
      message: 'Authentication successful' 
    });
  }

  /**
   * Handle joining a trip room
   */
  handleJoinTrip(socket, tripId) {
    if (!socket.userId) {
      socket.emit('error', { message: 'Please authenticate first' });
      return;
    }

    // Join the trip room
    socket.join(`trip_${tripId}`);

    // Track active sockets for this trip
    if (!this.activeTripSockets.has(tripId)) {
      this.activeTripSockets.set(tripId, new Set());
    }
    this.activeTripSockets.get(tripId).add(socket.id);

    console.log(`👤 User ${socket.userId} joined trip ${tripId}`);
    
    socket.emit('trip_joined', { 
      tripId, 
      success: true,
      message: 'Successfully joined trip room' 
    });

    // Notify others in the trip
    socket.to(`trip_${tripId}`).emit('user_joined_trip', {
      userId: socket.userId,
      userType: socket.userType
    });
  }

  /**
   * Handle leaving a trip room
   */
  handleLeaveTrip(socket, tripId) {
    socket.leave(`trip_${tripId}`);

    // Remove from active trip sockets
    if (this.activeTripSockets.has(tripId)) {
      this.activeTripSockets.get(tripId).delete(socket.id);
      
      // Clean up empty sets
      if (this.activeTripSockets.get(tripId).size === 0) {
        this.activeTripSockets.delete(tripId);
      }
    }

    console.log(`👋 User ${socket.userId} left trip ${tripId}`);

    // Notify others
    socket.to(`trip_${tripId}`).emit('user_left_trip', {
      userId: socket.userId
    });
  }

  /**
   * Handle real-time location updates from delivery user
   */
  handleLocationUpdate(socket, data) {
    const { tripId, lat, lng, address, speed, heading } = data;

    if (!tripId || !lat || !lng) {
      socket.emit('error', { message: 'Invalid location data' });
      return;
    }

    const locationUpdate = {
      tripId,
      deliveryUserId: socket.userId,
      location: {
        lat,
        lng,
        address: address || 'Unknown',
        speed: speed || 0,
        heading: heading || 0,
        timestamp: new Date().toISOString()
      }
    };

    // Broadcast to all users tracking this trip
    this.io.to(`trip_${tripId}`).emit('location_update', locationUpdate);

    console.log(`📍 Location update for trip ${tripId}: ${lat}, ${lng}`);
  }

  /**
   * Handle trip status updates
   */
  handleTripStatusUpdate(socket, data) {
    const { tripId, newStatus, message, metadata } = data;

    if (!tripId || !newStatus) {
      socket.emit('error', { message: 'Invalid status update data' });
      return;
    }

    const statusUpdate = {
      tripId,
      newStatus,
      message: message || '',
      metadata: metadata || {},
      updatedBy: socket.userId,
      updatedAt: new Date().toISOString()
    };

    // Broadcast to all users in the trip
    this.io.to(`trip_${tripId}`).emit('trip_status_update', statusUpdate);

    console.log(`📢 Trip ${tripId} status updated to: ${newStatus}`);
  }

  /**
   * Handle chat messages within a trip
   */
  handleChatMessage(socket, data) {
    const { tripId, message, messageType } = data;

    if (!tripId || !message) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    const chatMessage = {
      tripId,
      senderId: socket.userId,
      senderType: socket.userType,
      message,
      messageType: messageType || 'text',
      timestamp: new Date().toISOString()
    };

    // Broadcast to all users in the trip except sender
    socket.to(`trip_${tripId}`).emit('new_message', chatMessage);

    // Send confirmation to sender
    socket.emit('message_sent', { 
      success: true, 
      message: chatMessage 
    });

    console.log(`💬 Message in trip ${tripId} from user ${socket.userId}`);
  }

  /**
   * Handle typing indicator
   */
  handleTypingIndicator(socket, data) {
    const { tripId, isTyping } = data;

    if (!tripId) return;

    socket.to(`trip_${tripId}`).emit('user_typing', {
      userId: socket.userId,
      userType: socket.userType,
      isTyping
    });
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(socket) {
    console.log(`❌ Client disconnected: ${socket.id}`);

    // Remove from connected users
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
    }

    // Remove from all trip rooms
    for (const [tripId, socketSet] of this.activeTripSockets.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        
        // Notify others in the trip
        socket.to(`trip_${tripId}`).emit('user_left_trip', {
          userId: socket.userId
        });

        // Clean up empty sets
        if (socketSet.size === 0) {
          this.activeTripSockets.delete(tripId);
        }
      }
    }
  }

  /**
   * Emit event to specific user by userId
   */
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Emit event to all users in a trip
   */
  emitToTrip(tripId, event, data) {
    this.io.to(`trip_${tripId}`).emit(event, data);
  }

  /**
   * Notify new offer received
   */
  notifyNewOffer(customerId, offerData) {
    this.emitToUser(customerId, 'new_offer_received', offerData);
  }

  /**
   * Notify offer accepted
   */
  notifyOfferAccepted(deliveryUserId, tripData) {
    this.emitToUser(deliveryUserId, 'offer_accepted', tripData);
  }

  /**
   * Notify offer rejected
   */
  notifyOfferRejected(deliveryUserId, rejectionData) {
    this.emitToUser(deliveryUserId, 'offer_rejected', rejectionData);
  }

  /**
   * Broadcast trip update to all participants
   */
  broadcastTripUpdate(tripId, updateData) {
    this.emitToTrip(tripId, 'trip_updated', updateData);
  }

  /**
   * Notify payment confirmation needed
   */
  notifyPaymentNeeded(customerId, paymentData) {
    this.emitToUser(customerId, 'payment_confirmation_needed', paymentData);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get active trips count
   */
  getActiveTripsCount() {
    return this.activeTripSockets.size;
  }

  /**
   * Get trip participants count
   */
  getTripParticipantsCount(tripId) {
    return this.activeTripSockets.get(tripId)?.size || 0;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Create singleton instance
const deliverySocketService = new DeliverySocketService();

export default deliverySocketService;

