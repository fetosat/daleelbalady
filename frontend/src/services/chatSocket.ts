import { io, Socket } from 'socket.io-client';

interface ChatSocketEvents {
  // Outgoing events
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: { chatId: string; text: string; senderId: string }) => void;
  typing: (data: { chatId: string; userId: string }) => void;
  stopTyping: (data: { chatId: string; userId: string }) => void;

  // Incoming events
  newMessage: (message: any) => void;
  messageRead: (data: { messageId: string; chatId: string }) => void;
  userTyping: (data: { chatId: string; userId: string; userName: string }) => void;
  userStopTyping: (data: { chatId: string; userId: string }) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  error: (error: { message: string }) => void;
}

class ChatSocket {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.connect();
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if ((this.socket as any)?.connected) {
      console.log('ChatSocket: Already connected');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'https://api.daleelbalady.com';
    const token = typeof window !== 'undefined' ? localStorage.getItem('daleel-token') : null;

    console.log('ChatSocket: Connecting to', socketUrl);

    this.socket = io(socketUrl, {
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
      console.log('ChatSocket: Connected');
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('ChatSocket: Disconnected', reason);
      this.connected = false;
    });

    this.socket.on('error', (error: any) => {
      console.error('ChatSocket: Error', error);
      this.emit('error', error);
    });

    // Chat-specific events
    this.socket.on('newMessage', (message: any) => {
      console.log('ChatSocket: New message received', message);
      this.emit('newMessage', message);
    });

    this.socket.on('messageRead', (data: any) => {
      console.log('ChatSocket: Message read', data);
      this.emit('messageRead', data);
    });

    this.socket.on('userTyping', (data: any) => {
      console.log('ChatSocket: User typing', data);
      this.emit('userTyping', data);
    });

    this.socket.on('userStopTyping', (data: any) => {
      console.log('ChatSocket: User stopped typing', data);
      this.emit('userStopTyping', data);
    });

    this.socket.on('userOnline', (userId: string) => {
      console.log('ChatSocket: User online', userId);
      this.emit('userOnline', userId);
    });

    this.socket.on('userOffline', (userId: string) => {
      console.log('ChatSocket: User offline', userId);
      this.emit('userOffline', userId);
    });
  }

  /**
   * Join a chat room
   */
  joinChat(chatId: string) {
    if (!(this.socket as any)?.connected) {
      console.warn('ChatSocket: Not connected, cannot join chat');
      return;
    }

    console.log('ChatSocket: Joining chat', chatId);
    this.socket.emit('joinChat', chatId);
  }

  /**
   * Leave a chat room
   */
  leaveChat(chatId: string) {
    if (!(this.socket as any)?.connected) {
      console.warn('ChatSocket: Not connected, cannot leave chat');
      return;
    }

    console.log('ChatSocket: Leaving chat', chatId);
    this.socket.emit('leaveChat', chatId);
  }

  /**
   * Send a message
   */
  sendMessage(data: { chatId: string; text: string; senderId: string }) {
    if (!(this.socket as any)?.connected) {
      console.warn('ChatSocket: Not connected, cannot send message');
      return;
    }

    console.log('ChatSocket: Sending message', data);
    this.socket.emit('sendMessage', data);
  }

  /**
   * Emit typing event
   */
  typing(data: { chatId: string; userId: string }) {
    if (!(this.socket as any)?.connected) {
      console.warn('ChatSocket: Not connected, cannot send typing event');
      return;
    }

    this.socket.emit('typing', data);
  }

  /**
   * Emit stop typing event
   */
  stopTyping(data: { chatId: string; userId: string }) {
    if (!(this.socket as any)?.connected) {
      console.warn('ChatSocket: Not connected, cannot send stop typing event');
      return;
    }

    this.socket.emit('stopTyping', data);
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
      console.log('ChatSocket: Disconnecting');
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
  onNewMessage(callback: (message: any) => void) {
    return this.on('newMessage', callback);
  }

  onMessageRead(callback: (data: { messageId: string; chatId: string }) => void) {
    return this.on('messageRead', callback);
  }

  onUserTyping(callback: (data: { chatId: string; userId: string; userName: string }) => void) {
    return this.on('userTyping', callback);
  }

  onUserStopTyping(callback: (data: { chatId: string; userId: string }) => void) {
    return this.on('userStopTyping', callback);
  }

  onUserOnline(callback: (userId: string) => void) {
    return this.on('userOnline', callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    return this.on('userOffline', callback);
  }

  onError(callback: (error: { message: string }) => void) {
    return this.on('error', callback);
  }
}

// Create singleton instance
const chatSocket = new ChatSocket();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    chatSocket.disconnect();
  });
}

export default chatSocket;

