import { Manager } from "socket.io-client";
import { API_BASE } from "../utils/env";

// Enhanced debug logging configuration
const DEBUG_SEARCH_SOCKET = true; // Toggle for debug logs
const LOG_PREFIX = "🔍 SearchSocket";

// Build WebSocket URL using intelligent logic
function getWebSocketUrl() {
  // On client-side, determine the best WebSocket endpoint
  if (typeof window !== 'undefined') {
    // In development mode, check if local backend is available
    if (process.env.NODE_ENV === 'development') {
      // Use local backend if BACKEND_URL is set to localhost
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      if (backendUrl.includes('localhost')) {
        console.log(`${LOG_PREFIX} 🔧 Development mode: Using local WebSocket backend`);
        return backendUrl;
      } else {
        console.log(`${LOG_PREFIX} 🔧 Development mode: Using production WebSocket backend`);
        return 'https://api.daleelbalady.com/api';
      }
    }
    
    // In production, use the same domain as the website
    if (window.location.host.includes('daleelbalady.com')) {
      return 'https://api.daleelbalady.com/api';
    }
    
    // For other production deployments, use current host
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${window.location.host}/api`;
  }
  
  // Fallback for SSR - use production backend
  return 'https://api.daleelbalady.com/api';
}

const SOCKET_URL = getWebSocketUrl();
const manager = new Manager(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export interface SearchResult {
  id: string;
  name: string;
  translation?: { name_ar: string; name_en: string };
  score?: number;
  specialty?: string;
  address?: string;
  phone?: string;
  hours?: string;
  distance?: string;
  isRecommended?: boolean;
  rating?: number;
  type?: string;
  reviews?: any;
  location?: string;
  description?: string;
}

class SearchSocketService {
  private static instance: SearchSocketService;
  private socket: ReturnType<typeof manager.socket> | null = null;
  private messageCallbacks: ((message: any) => void)[] = [];
  private searchCallbacks: ((results: SearchResult[] | { results: SearchResult[], cache?: any }) => void)[] = [];
  private locationCallbacks: ((granted: boolean) => void)[] = [];

  private constructor() {
    // Connect to the backend server
    this.socket = manager.socket("/");

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} ✅ Connected to search socket`);
        console.log(`${LOG_PREFIX} 🆔 Socket ID:`, (this.socket as any)?.id);
        console.log(`${LOG_PREFIX} 🌐 Transport:`, this.socket?.io.engine.transport.name);
        console.log(`${LOG_PREFIX} 🔗 Socket URL:`, SOCKET_URL);
      }
    });

    this.socket.on("disconnect", (reason) => {
      if (DEBUG_SEARCH_SOCKET) {
        console.warn(`${LOG_PREFIX} ❌ Disconnected from search socket`);
        console.warn(`${LOG_PREFIX} 📋 Disconnect reason:`, reason);
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error(`${LOG_PREFIX} 🔥 Connection error:`, error);
    });

    // Enhanced socket event logging
    this.socket.onAny((eventName, ...args) => {
      if (DEBUG_SEARCH_SOCKET) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`${LOG_PREFIX} 📨 [${timestamp}] Event: ${eventName}`);
        
        // Log specific details based on event type
        if (['ai_message', 'search_results', 'multi_search_results'].includes(eventName)) {
          console.log(`${LOG_PREFIX} 📊 Data preview:`, {
            type: typeof args[0],
            isArray: Array.isArray(args[0]),
            length: Array.isArray(args[0]) ? args[0].length : (args[0] && typeof args[0] === 'object' ? Object.keys(args[0]).length : 'N/A'),
            keys: args[0] && typeof args[0] === 'object' && !Array.isArray(args[0]) ? Object.keys(args[0]) : undefined
          });
        } else {
          console.log(`${LOG_PREFIX} 📦 Args:`, args.length > 0 ? args : '[no arguments]');
        }
      }
    });

    // Listen for AI messages
    this.socket.on("ai_message", (message: any) => {
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} 🤖 AI Message received:`);
        console.log(`${LOG_PREFIX} 🔢 Type:`, typeof message);
        console.log(`${LOG_PREFIX} 📄 Content:`, message);
        console.log(`${LOG_PREFIX} 👥 Callbacks count:`, this.messageCallbacks.length);
      }
      
      try {
        if (typeof message === 'string') {
          // Handle plain text message
          const wrappedMessage = {
            function: "reply_to_user",
            parameters: { message }
          };
          if (DEBUG_SEARCH_SOCKET) {
            console.log(`${LOG_PREFIX} 📝 Wrapping text message:`, wrappedMessage);
          }
          this.messageCallbacks.forEach((callback, index) => {
            if (DEBUG_SEARCH_SOCKET) console.log(`${LOG_PREFIX} 🔄 Calling callback #${index + 1}`);
            callback(wrappedMessage);
          });
        } else {
          // Handle JSON message
          if (DEBUG_SEARCH_SOCKET) {
            console.log(`${LOG_PREFIX} 🎯 Processing structured message:`, message);
          }
          this.messageCallbacks.forEach((callback, index) => {
            if (DEBUG_SEARCH_SOCKET) console.log(`${LOG_PREFIX} 🔄 Calling callback #${index + 1}`);
            callback(message);
          });
        }
      } catch (e) {
        console.error(`${LOG_PREFIX} ❌ Error handling AI message:`, e);
        console.error(`${LOG_PREFIX} 📋 Message that caused error:`, message);
      }
    });

    // Listen for search results (legacy format)
    this.socket.on("search_results", (data: SearchResult[] | { results: SearchResult[], cache?: any }) => {
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} 📨 Legacy search_results received:`);
        console.log(`${LOG_PREFIX} 🔢 Data type:`, typeof data);
        console.log(`${LOG_PREFIX} 📊 Is array:`, Array.isArray(data));
        console.log(`${LOG_PREFIX} 📏 Length/Keys:`, Array.isArray(data) ? data.length : Object.keys(data || {}).length);
        console.log(`${LOG_PREFIX} 👥 Search callbacks:`, this.searchCallbacks.length);
      }
      
      // Handle both new format (object with results and cache) and old format (array)
      if (Array.isArray(data)) {
        // Legacy format: direct array
        if (DEBUG_SEARCH_SOCKET) {
          console.log(`${LOG_PREFIX} ✅ Processing legacy array format (${data.length} results)`);
          if (data.length > 0) {
            console.log(`${LOG_PREFIX} 🔍 Sample result:`, data[0]);
          }
        }
        this.searchCallbacks.forEach((callback, index) => {
          if (DEBUG_SEARCH_SOCKET) console.log(`${LOG_PREFIX} 🔄 Calling search callback #${index + 1}`);
          callback(data);
        });
      } else if (data && typeof data === 'object' && 'results' in data) {
        // New format: object with results and cache info
        if (DEBUG_SEARCH_SOCKET) {
          console.log(`${LOG_PREFIX} ✅ Processing object format:`);
          console.log(`${LOG_PREFIX} 📊 Results count:`, (data as any).results?.length || 0);
          console.log(`${LOG_PREFIX} 💾 Cache info:`, (data as any).cache);
        }
        this.searchCallbacks.forEach((callback, index) => {
          if (DEBUG_SEARCH_SOCKET) console.log(`${LOG_PREFIX} 🔄 Calling search callback #${index + 1}`);
          callback(data);
        });
      } else {
        console.warn(`${LOG_PREFIX} ⚠️ Unexpected search_results format:`);
        console.warn(`${LOG_PREFIX} 📋 Data:`, data);
        console.warn(`${LOG_PREFIX} 🔢 Type:`, typeof data);
      }
    });

    // Listen for multi-entity search results (NEW FORMAT from backend with AI processing)
    this.socket.on("multi_search_results", (data: any) => {
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} 🎯 Multi-search results received:`);
        console.log(`${LOG_PREFIX} 📊 Full data structure:`, data);
        console.log(`${LOG_PREFIX} 🤖 Has processed results:`, !!data.processedResults);
        console.log(`${LOG_PREFIX} 🏷️ Has dynamic filters:`, !!data.dynamicFilters);
        console.log(`${LOG_PREFIX} 📋 Has AI summary:`, !!data.aiSummary);
      }
      
      if (data) {
        let callbackData: any;
        
        // Check if we have AI-processed results
        if (data.processedResults && data.dynamicFilters) {
          if (DEBUG_SEARCH_SOCKET) {
            console.log(`${LOG_PREFIX} ✨ Processing AI-enhanced results:`);
            console.log(`${LOG_PREFIX} 📊 Processed results count:`, data.processedResults.length);
            console.log(`${LOG_PREFIX} 🏷️ Dynamic filters count:`, data.dynamicFilters.length);
            console.log(`${LOG_PREFIX} 📋 AI summary:`, data.aiSummary);
          }
          
          // Pass AI-processed data directly
          callbackData = {
            processedResults: data.processedResults,
            dynamicFilters: data.dynamicFilters,
            aiSummary: data.aiSummary,
            cache: data.cache,
            searchType: data.search_type,
            summary: data.summary,
            rawResults: data.results  // Keep original structure for backwards compatibility
          };
        } else if (data.results) {
          // Fall back to legacy processing for backwards compatibility
          if (DEBUG_SEARCH_SOCKET) {
            console.log(`${LOG_PREFIX} 🔄 Processing legacy multi-entity search results:`);
            console.log(`${LOG_PREFIX} 🏷️ Search type:`, data.search_type);
            console.log(`${LOG_PREFIX} 📝 Summary:`, data.summary);
            console.log(`${LOG_PREFIX} 💾 Cache info:`, data.cache);
            console.log(`${LOG_PREFIX} 📈 Raw result categories:`, {
              services: data.results.services?.length || 0,
              users: data.results.users?.length || 0,
              shops: data.results.shops?.length || 0,
              products: data.results.products?.length || 0
            });
          }
          
          // Instead of flattening, preserve the multi-entity structure
          // This allows SearchResults.tsx to handle users and services properly
          const allResults = [
            ...(data.results.services || []),
            ...(data.results.users || []),
            ...(data.results.shops || []),
            ...(data.results.products || [])
          ];
          
          if (DEBUG_SEARCH_SOCKET) {
            console.log(`${LOG_PREFIX} 🔄 Total results count:`, allResults.length);
            if (allResults.length > 0) {
              console.log(`${LOG_PREFIX} 🎯 Sample result:`, allResults[0]);
            }
          }
          
          // Create cache-like structure with enhanced_results for SearchResults.tsx compatibility
          const cacheStructure = data.cache ? {
            ...data.cache,
            enhanced_results: data.results, // Preserve original structure
            results: {
              enhanced_results: data.results
            }
          } : {
            enhanced_results: data.results,
            results: {
              enhanced_results: data.results
            }
          };
          
          // Call search callbacks with both flattened and structured data
          callbackData = {
            results: allResults, // For backwards compatibility
            cache: cacheStructure,
            searchType: data.search_type,
            summary: data.summary,
            rawResults: data.results  // Keep original structure for debugging
          };
        } else {
          console.warn(`${LOG_PREFIX} ⚠️ Invalid multi_search_results format:`);
          console.warn(`${LOG_PREFIX} 📋 Data received:`, data);
          return;
        }
        
        if (DEBUG_SEARCH_SOCKET) {
          console.log(`${LOG_PREFIX} 📦 Final callback data keys:`, Object.keys(callbackData));
          console.log(`${LOG_PREFIX} 👥 Callbacks to call:`, this.searchCallbacks.length);
        }
        
        this.searchCallbacks.forEach((callback, index) => {
          if (DEBUG_SEARCH_SOCKET) {
            console.log(`${LOG_PREFIX} 🔄 Calling multi-search callback #${index + 1}`);
          }
          callback(callbackData);
        });
      } else {
        console.warn(`${LOG_PREFIX} ⚠️ No data received in multi_search_results`);
      }
    });

    // Handle location requests
    this.socket.on("request_location", async () => {
      if (!navigator.geolocation) {
        this.socket?.emit("location_response", null);
        this.locationCallbacks.forEach(cb => cb(false));
        return;
      }

      try {
        const position = await this.getCurrentPosition();
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        localStorage.setItem("userLocation", JSON.stringify(coords));
        this.socket?.emit("location_response", coords);
        this.locationCallbacks.forEach(cb => cb(true));
      } catch (error) {
        console.error("Error getting location:", error);
        this.socket?.emit("location_response", null);
        this.locationCallbacks.forEach(cb => cb(false));
      }
    });
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
  }

  public static getInstance(): SearchSocketService {
    if (!SearchSocketService.instance) {
      SearchSocketService.instance = new SearchSocketService();
    }
    return SearchSocketService.instance;
  }

  public sendMessage(message: string) {
    if (this.socket) {
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} 📤 Sending message to backend:`);
        console.log(`${LOG_PREFIX} 💬 Message:`, message);
        console.log(`${LOG_PREFIX} 🔗 Socket connected:`, this.socket.connected);
        console.log(`${LOG_PREFIX} 🆔 Socket ID:`, this.socket.id);
      }
      
      // Include stored location if available
      const storedLocation = this.getStoredLocation();
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} 📍 User location:`, storedLocation);
      }
      
      const payload = storedLocation ? {
        message, 
        userLocation: storedLocation 
      } : { message };
      
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} 📦 Full payload:`, payload);
        console.log(`${LOG_PREFIX} ⏱️ Timestamp:`, new Date().toISOString());
      }
      
      this.socket.emit("user_message", payload);
      
      if (DEBUG_SEARCH_SOCKET) {
        console.log(`${LOG_PREFIX} ✅ Message sent successfully`);
      }
    } else {
      console.error(`${LOG_PREFIX} ❌ Socket not connected, cannot send message`);
      console.error(`${LOG_PREFIX} 🔍 Socket state:`, {
        socketExists: !!this.socket,
        connected: (this.socket as any)?.connected,
        id: (this.socket as any)?.id
      });
    }
  }

  private getStoredLocation() {
    try {
      const locStr = localStorage.getItem("userLocation");
      if (!locStr) return null;
      return JSON.parse(locStr);
    } catch {
      return null;
    }
  }

  public onAiMessage(callback: (message: any) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  public onSearchResults(callback: (results: SearchResult[] | { results: SearchResult[], cache?: any }) => void) {
    this.searchCallbacks.push(callback);
    return () => {
      this.searchCallbacks = this.searchCallbacks.filter(cb => cb !== callback);
    };
  }

  public onLocationRequest(callback: (granted: boolean) => void) {
    this.locationCallbacks.push(callback);
    return () => {
      this.locationCallbacks = this.locationCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const searchSocket = SearchSocketService.getInstance();
