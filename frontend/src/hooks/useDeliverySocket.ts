import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface LocationUpdate {
  tripId: string;
  deliveryUserId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    speed: number;
    heading: number;
    timestamp: string;
  };
}

interface TripStatusUpdate {
  tripId: string;
  newStatus: string;
  message: string;
  metadata: any;
  updatedBy: string;
  updatedAt: string;
}

interface ChatMessage {
  tripId: string;
  senderId: string;
  senderType: string;
  message: string;
  messageType: string;
  timestamp: string;
}

interface UseDeliverySocketOptions {
  userId?: string;
  userType?: 'CUSTOMER' | 'DELIVERY';
  token?: string;
  autoConnect?: boolean;
}

interface UseDeliverySocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  
  // Trip room methods
  joinTrip: (tripId: string) => void;
  leaveTrip: (tripId: string) => void;
  
  // Location methods
  updateLocation: (tripId: string, lat: number, lng: number, address?: string) => void;
  
  // Status methods
  updateTripStatus: (tripId: string, newStatus: string, message?: string) => void;
  
  // Chat methods
  sendMessage: (tripId: string, message: string) => void;
  setTyping: (tripId: string, isTyping: boolean) => void;
  
  // Event listeners
  onLocationUpdate: (callback: (data: LocationUpdate) => void) => void;
  onStatusUpdate: (callback: (data: TripStatusUpdate) => void) => void;
  onNewMessage: (callback: (data: ChatMessage) => void) => void;
  onOfferReceived: (callback: (data: any) => void) => void;
}

export const useDeliverySocket = (
  options: UseDeliverySocketOptions = {}
): UseDeliverySocketReturn => {
  const { 
    userId, 
    userType, 
    token, 
    autoConnect = true 
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Event listeners storage
  const eventListeners = useRef<{
    onLocationUpdate: ((data: LocationUpdate) => void) | null;
    onStatusUpdate: ((data: TripStatusUpdate) => void) | null;
    onNewMessage: ((data: ChatMessage) => void) | null;
    onOfferReceived: ((data: any) => void) | null;
  }>({
    onLocationUpdate: null,
    onStatusUpdate: null,
    onNewMessage: null,
    onOfferReceived: null,
  });

  /**
   * Initialize socket connection
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Create socket connection
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'https://api.daleelbalady.com', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);

      // Auto-authenticate if credentials provided
      if (userId && token) {
        socket.emit('authenticate', { userId, userType, token });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('فشل الاتصال بالخادم');
    });

    // Authentication events
    socket.on('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
      setIsAuthenticated(true);
      toast.success('تم الاتصال بنجاح');
    });

    socket.on('auth_error', (data) => {
      console.error('Authentication error:', data);
      setIsAuthenticated(false);
      toast.error('فشل التحقق من الهوية');
    });

    // Trip events
    socket.on('trip_joined', (data) => {
      console.log('Joined trip:', data);
    });

    socket.on('user_joined_trip', (data) => {
      console.log('User joined trip:', data);
      toast.info(`مستخدم انضم للرحلة`);
    });

    socket.on('user_left_trip', (data) => {
      console.log('User left trip:', data);
    });

    // Location updates
    socket.on('location_update', (data: LocationUpdate) => {
      if (eventListeners.current.onLocationUpdate) {
        eventListeners.current.onLocationUpdate(data);
      }
    });

    // Status updates
    socket.on('trip_status_update', (data: TripStatusUpdate) => {
      toast.info(`تحديث الحالة: ${data.message || data.newStatus}`);
      if (eventListeners.current.onStatusUpdate) {
        eventListeners.current.onStatusUpdate(data);
      }
    });

    // Chat events
    socket.on('new_message', (data: ChatMessage) => {
      if (eventListeners.current.onNewMessage) {
        eventListeners.current.onNewMessage(data);
      }
    });

    socket.on('message_sent', (data) => {
      console.log('Message sent:', data);
    });

    socket.on('user_typing', (data) => {
      console.log('User typing:', data);
    });

    // Offer events
    socket.on('new_offer_received', (data) => {
      toast.success('🎉 تلقيت عرض جديد!');
      if (eventListeners.current.onOfferReceived) {
        eventListeners.current.onOfferReceived(data);
      }
    });

    socket.on('offer_accepted', (data) => {
      toast.success('✅ تم قبول عرضك!');
    });

    socket.on('offer_rejected', (data) => {
      toast.error('❌ تم رفض عرضك');
    });

    // Trip updates
    socket.on('trip_updated', (data) => {
      console.log('Trip updated:', data);
    });

    // Payment events
    socket.on('payment_confirmation_needed', (data) => {
      toast.warning('⚠️ يرجى تأكيد الدفع');
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'حدث خطأ');
    });

    socketRef.current = socket;
  }, [userId, userType, token]);

  /**
   * Disconnect socket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsAuthenticated(false);
    }
  }, []);

  /**
   * Join a trip room
   */
  const joinTrip = useCallback((tripId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_trip', tripId);
    }
  }, []);

  /**
   * Leave a trip room
   */
  const leaveTrip = useCallback((tripId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_trip', tripId);
    }
  }, []);

  /**
   * Send location update
   */
  const updateLocation = useCallback((
    tripId: string, 
    lat: number, 
    lng: number, 
    address?: string
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update_location', {
        tripId,
        lat,
        lng,
        address,
        speed: 0, // Can be obtained from geolocation API
        heading: 0,
      });
    }
  }, []);

  /**
   * Update trip status
   */
  const updateTripStatus = useCallback((
    tripId: string, 
    newStatus: string, 
    message?: string
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update_trip_status', {
        tripId,
        newStatus,
        message,
      });
    }
  }, []);

  /**
   * Send chat message
   */
  const sendMessage = useCallback((tripId: string, message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', {
        tripId,
        message,
        messageType: 'text',
      });
    }
  }, []);

  /**
   * Set typing indicator
   */
  const setTyping = useCallback((tripId: string, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', {
        tripId,
        isTyping,
      });
    }
  }, []);

  /**
   * Register location update listener
   */
  const onLocationUpdate = useCallback((callback: (data: LocationUpdate) => void) => {
    eventListeners.current.onLocationUpdate = callback;
  }, []);

  /**
   * Register status update listener
   */
  const onStatusUpdate = useCallback((callback: (data: TripStatusUpdate) => void) => {
    eventListeners.current.onStatusUpdate = callback;
  }, []);

  /**
   * Register new message listener
   */
  const onNewMessage = useCallback((callback: (data: ChatMessage) => void) => {
    eventListeners.current.onNewMessage = callback;
  }, []);

  /**
   * Register offer received listener
   */
  const onOfferReceived = useCallback((callback: (data: any) => void) => {
    eventListeners.current.onOfferReceived = callback;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticated,
    connect,
    disconnect,
    joinTrip,
    leaveTrip,
    updateLocation,
    updateTripStatus,
    sendMessage,
    setTyping,
    onLocationUpdate,
    onStatusUpdate,
    onNewMessage,
    onOfferReceived,
  };
};

export default useDeliverySocket;

