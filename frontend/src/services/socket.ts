import { io, Socket } from "socket.io-client";

// Generate a unique client ID for this browser session
const generateClientId = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    // For SSR, return a temporary ID
    return `client_ssr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  let clientId = sessionStorage.getItem('socketClientId');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('socketClientId', clientId);
  }
  return clientId;
};

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private clientId: string;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;

  private constructor() {
    this.clientId = generateClientId();
    // Only connect in browser environment
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect() {
    // Don't connect during SSR
    if (typeof window === 'undefined') {
      return;
    }
    
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    // Connect to the backend server with client ID
    this.socket = io("https://api.daleelbalady.com/api", {
      transports: ["websocket"],
      autoConnect: true,
      query: {
        clientId: this.clientId
      },
      forceNew: false, // Reuse existing connection if available
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log(`Connected to socket server with client ID: ${this.clientId}`);
      this.isConnected = true;
      this.isConnecting = false;
      
      // Send client identification
      this.socket?.emit('client_identify', { clientId: this.clientId });
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from socket server: ${reason}`);
      this.isConnected = false;
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnecting = false;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected to socket server (attempt ${attemptNumber})`);
      this.isConnected = true;
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket(): Socket | null {
    // Ensure connection is active
    if (!this.isConnected && !this.isConnecting) {
      this.connect();
    }
    return this.socket;
  }

  public getClientId(): string {
    return this.clientId;
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  public forceReconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.connect();
  }

  public sendMessage(message: string) {
    if (this.socket && this.isConnected) {
      // Store location if available
      const storedLocation = this.getStoredLocation();
      
      const messageData = {
        message: message,
        clientId: this.clientId,
        location: storedLocation,
        timestamp: new Date().toISOString()
      };
      
      this.socket.emit("user_message", messageData);
    } else {
      console.warn('Socket not connected, attempting to reconnect...');
      this.connect();
      // Queue the message to be sent once connected
      setTimeout(() => {
        if (this.socket && this.isConnected) {
          this.sendMessage(message);
        }
      }, 1000);
    }
  }

  private getStoredLocation() {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    try {
      const locStr = localStorage.getItem("userLocation");
      if (!locStr) return null;
      return JSON.parse(locStr);
    } catch {
      return null;
    }
  }

  public onAiMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on("ai_message", (jsonText) => {
        try {
          const obj = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
          callback(obj);
        } catch (e) {
          callback(String(jsonText));
        }
      });
    }
  }

  public onSearchResults(callback: (results: any[]) => void) {
    if (this.socket) {
      this.socket.on("search_results", (results) => {
        console.log("Received search results:", results);
        if (Array.isArray(results)) {
          callback(results);
        }
      });
    }
  }

  public onRequestLocation(callback: () => void) {
    if (this.socket) {
      this.socket.on("request_location", async () => {
        // Check if we're in browser environment with geolocation support
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          this.socket?.emit("location_response", null);
          return;
        }

        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          });

          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          // Store location (only in browser environment)
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem("userLocation", JSON.stringify(coords));
          }
          this.socket?.emit("location_response", coords);
          callback();
        } catch (error) {
          this.socket?.emit("location_response", null);
        }
      });
    }
  }
}

export const socketService = SocketService.getInstance();
