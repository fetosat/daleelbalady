// Debug configuration for Daleel Balady frontend
// Centralized debug logging control

export interface DebugConfig {
  // Socket-related debugging
  searchSocket: boolean;
  
  // Component-specific debugging  
  searchResults: boolean;
  searchPage: boolean;
  navbar: boolean;
  
  // API-related debugging
  searchCacheAPI: boolean;
  bookingAPI: boolean;
  
  // General debugging
  general: boolean;
  
  // Performance debugging
  performance: boolean;
  
  // Error tracking
  errors: boolean;
}

// Main debug configuration - change these to enable/disable logs
export const DEBUG_CONFIG: DebugConfig = {
  // Socket debugging - very detailed logs for socket events
  searchSocket: true,
  
  // Component debugging
  searchResults: true,
  searchPage: true,
  navbar: false,
  
  // API debugging
  searchCacheAPI: true,
  bookingAPI: false,
  
  // General debugging
  general: true,
  
  // Performance monitoring
  performance: false,
  
  // Always log errors
  errors: true,
};

// Helper function to create consistent log prefixes
export const createLogPrefix = (component: string): string => {
  const emojis: Record<string, string> = {
    searchSocket: "🔍",
    searchResults: "📊",
    searchPage: "📝",
    navbar: "🧭", 
    searchCacheAPI: "💾",
    bookingAPI: "📅",
    general: "ℹ️",
    performance: "⚡",
    errors: "🚨"
  };
  
  return `${emojis[component] || "🔧"} ${component}`;
};

// Conditional logging functions
export const debugLog = (component: keyof DebugConfig, message: string, ...args: any[]) => {
  if (DEBUG_CONFIG[component]) {
    console.log(`${createLogPrefix(component)} ${message}`, ...args);
  }
};

export const debugWarn = (component: keyof DebugConfig, message: string, ...args: any[]) => {
  if (DEBUG_CONFIG[component]) {
    console.warn(`${createLogPrefix(component)} ⚠️ ${message}`, ...args);
  }
};

export const debugError = (component: keyof DebugConfig, message: string, ...args: any[]) => {
  if (DEBUG_CONFIG[component] || DEBUG_CONFIG.errors) {
    console.error(`${createLogPrefix(component)} ❌ ${message}`, ...args);
  }
};

// Performance timing helper
export const debugTime = (component: keyof DebugConfig, label: string) => {
  if (DEBUG_CONFIG[component] && DEBUG_CONFIG.performance) {
    console.time(`${createLogPrefix(component)} ⏱️ ${label}`);
  }
};

export const debugTimeEnd = (component: keyof DebugConfig, label: string) => {
  if (DEBUG_CONFIG[component] && DEBUG_CONFIG.performance) {
    console.timeEnd(`${createLogPrefix(component)} ⏱️ ${label}`);
  }
};

// Network request debugging
export const debugNetwork = (component: keyof DebugConfig, method: string, url: string, data?: any) => {
  if (DEBUG_CONFIG[component]) {
    console.log(`${createLogPrefix(component)} 🌐 ${method.toUpperCase()} ${url}`, data ? { data } : '');
  }
};

// Socket event debugging
export const debugSocketEvent = (eventName: string, data?: any) => {
  if (DEBUG_CONFIG.searchSocket) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`🔍 SearchSocket 📡 [${timestamp}] ${eventName}`, data ? { data } : '');
  }
};

// Group related logs for better organization
export const debugGroup = (component: keyof DebugConfig, groupName: string, fn: () => void) => {
  if (DEBUG_CONFIG[component]) {
    console.group(`${createLogPrefix(component)} 📁 ${groupName}`);
    fn();
    console.groupEnd();
  }
};

// Export flag to check if any debugging is enabled
export const isDebugEnabled = Object.values(DEBUG_CONFIG).some(Boolean);

// Development environment check
export const isDevelopment = process.env.NODE_ENV === 'development';

// Only enable debugging in development by default
export const shouldDebug = isDevelopment && isDebugEnabled;

// Clear console helper (use sparingly)
export const clearConsole = () => {
  if (isDevelopment) {
    console.clear();
  }
};

// Summary logging for important events
export const debugSummary = (component: keyof DebugConfig, summary: Record<string, any>) => {
  if (DEBUG_CONFIG[component]) {
    console.table({
      [`${createLogPrefix(component)} Summary`]: summary
    });
  }
};
