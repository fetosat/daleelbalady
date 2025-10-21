// utils/logger.js
// Simple console logging - Winston removed

// Stub exports for backward compatibility
export const authLogger = console;
export const dbLogger = console;
export const apiLogger = console;
export const paymentLogger = console;
export const uploadLogger = console;
export const socketLogger = console;
export const aiLogger = console;

export const loggers = {
  auth: {
    login: (...args) => console.log('User login', ...args),
    loginFailed: (...args) => console.warn('Login failed', ...args),
    signup: (...args) => console.log('User signup', ...args),
    logout: (...args) => console.log('User logout', ...args),
    tokenRefresh: (...args) => console.log('Token refresh', ...args)
  },
  api: {
    request: (...args) => console.log('API Request', ...args),
    error: (...args) => console.error('API Error', ...args),
    rateLimited: (...args) => console.warn('Rate limited', ...args)
  },
  db: {
    query: (...args) => console.log('Database query', ...args),
    error: (...args) => console.error('Database error', ...args),
    slowQuery: (...args) => console.warn('Slow query detected', ...args)
  },
  upload: {
    success: (...args) => console.log('File uploaded', ...args),
    failed: (...args) => console.error('Upload failed', ...args),
    deleted: (...args) => console.log('File deleted', ...args)
  },
  payment: {
    initiated: (...args) => console.log('Payment initiated', ...args),
    completed: (...args) => console.log('Payment completed', ...args),
    failed: (...args) => console.error('Payment failed', ...args),
    webhook: (...args) => console.log('Payment webhook received', ...args)
  },
  socket: {
    connected: (...args) => console.log('Socket connected', ...args),
    disconnected: (...args) => console.log('Socket disconnected', ...args),
    message: (...args) => console.log('Socket message', ...args)
  },
  ai: {
    request: (...args) => console.log('AI request', ...args),
    response: (...args) => console.log('AI response', ...args),
    error: (...args) => console.error('AI error', ...args)
  },
  system: {
    startup: (...args) => console.log('System startup', ...args),
    shutdown: (...args) => console.log('System shutdown', ...args),
    healthCheck: (...args) => console.log('Health check', ...args),
    info: (...args) => console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args)
  }
};

export const performanceLogger = {
  trackSlow: (...args) => console.warn('Slow operation detected', ...args),
  trackMemory: (...args) => console.log('Memory usage', ...args),
  trackApiResponse: (...args) => console.log('API Response Time', ...args)
};

export const securityLogger = {
  suspiciousActivity: (...args) => console.warn('Suspicious activity', ...args),
  bruteForceAttempt: (...args) => console.error('Brute force attempt', ...args),
  unauthorizedAccess: (...args) => console.error('Unauthorized access', ...args)
};

export default console;
