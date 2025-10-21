import { io, Socket } from 'socket.io-client';

interface NotificationSocketEvents {
  // Outgoing events
  subscribe: (userId: string) => void;
  unsubscribe: (userId: string) => void;

  // Incoming events
  newNotification: (notification: any) => void;
  notificationRead: (data: { notificationId: string }) => void;
  notificationDeleted: (data: { notificationId: string }) => void;
  error: (error: { message: string }) => void;
}

class NotificationSocket {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();
  private subscribedUserId: string | null = null;

  constructor() {
    // Don't auto-connect on construction, wait for explicit subscription
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if ((this.socket as any)?.connected) {
      console.log('NotificationSocket: Already connected');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'https://api.daleelbalady.com';
    const token = typeof window !== 'undefined' ? localStorage.getItem('daleel-token') : null;

    console.log('NotificationSocket: Connecting to', socketUrl);

    this.socket = io(socketUrl + '/notifications', {
      transports: ['websocket', 'polling'],
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('NotificationSocket: Connected');
      this.connected = true;
      
      // Re-subscribe if we were previously subscribed
      if (this.subscribedUserId) {
        this.subscribe(this.subscribedUserId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('NotificationSocket: Disconnected', reason);
      this.connected = false;
    });

    this.socket.on('error', (error: any) => {
      console.error('NotificationSocket: Error', error);
      this.emit('error', error);
    });

    // Notification-specific events
    this.socket.on('newNotification', (notification: any) => {
      console.log('NotificationSocket: New notification received', notification);
      this.emit('newNotification', notification);
    });

    this.socket.on('notificationRead', (data: any) => {
      console.log('NotificationSocket: Notification read', data);
      this.emit('notificationRead', data);
    });

    this.socket.on('notificationDeleted', (data: any) => {
      console.log('NotificationSocket: Notification deleted', data);
      this.emit('notificationDeleted', data);
    });
  }

  /**
   * Subscribe to notifications for a user
   */
  subscribe(userId: string) {
    if (!(this.socket as any)?.connected) {
      console.log('NotificationSocket: Not connected, connecting now...');
      this.connect();
      
      // Store userId for reconnection
      this.subscribedUserId = userId;
      return;
    }

    console.log('NotificationSocket: Subscribing to notifications for user', userId);
    this.subscribedUserId = userId;
    this.socket.emit('subscribe', userId);
  }

  /**
   * Unsubscribe from notifications
   */
  unsubscribe(userId: string) {
    if (!(this.socket as any)?.connected) {
      console.warn('NotificationSocket: Not connected, cannot unsubscribe');
      return;
    }

    console.log('NotificationSocket: Unsubscribing from notifications for user', userId);
    this.subscribedUserId = null;
    this.socket.emit('unsubscribe', userId);
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      console.log('NotificationSocket: Disconnecting');
      this.subscribedUserId = null;
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.connected && (this.socket as any)?.connected === true;
  }

  /**
   * Convenience methods for subscribing to specific events
   */
  onNewNotification(callback: (notification: any) => void) {
    return this.on('newNotification', callback);
  }

  onNotificationRead(callback: (data: { notificationId: string }) => void) {
    return this.on('notificationRead', callback);
  }

  onNotificationDeleted(callback: (data: { notificationId: string }) => void) {
    return this.on('notificationDeleted', callback);
  }

  onError(callback: (error: { message: string }) => void) {
    return this.on('error', callback);
  }
}

// Create singleton instance (but don't auto-connect)
const notificationSocket = new NotificationSocket();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    notificationSocket.disconnect();
  });
}

export default notificationSocket;

