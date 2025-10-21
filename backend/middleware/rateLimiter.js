// middleware/rateLimiter.js
// Advanced Rate Limiting System

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { loggers, securityLogger } from '../utils/logger.js';
import { RateLimitError } from '../utils/AppError.js';

// Redis client for rate limiting (optional - falls back to memory)
let redisClient = null;

const initRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      await redisClient.connect();
      console.log('✅ Redis connected for rate limiting');
      return redisClient;
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using memory store:', error.message);
      return null;
    }
  }
  return null;
};

// Initialize Redis
initRedis();

// Custom key generator
const generateKey = (req) => {
  // Use user ID if authenticated, otherwise IP
  const identifier = req.user?.id || req.ip;
  return `rate_limit:${req.route?.path || req.path}:${identifier}`;
};

// Custom error handler
const rateLimitHandler = (req, res, next) => {
  loggers.api.rateLimited(req);
  securityLogger.suspiciousActivity(req.ip, 'rate_limit_exceeded', {
    endpoint: req.originalUrl,
    userAgent: req.get('User-Agent')
  });
  
  const error = new RateLimitError();
  next(error);
};

// Rate limit configurations for different endpoints
export const rateLimitConfigs = {
  // General API limit
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد 15 دقيقة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // Authentication endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    keyGenerator: (req) => `auth_limit:${req.ip}`,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: 'تم تجاوز الحد المسموح من رفع الملفات. يرجى المحاولة بعد ساعة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // Search endpoints
  search: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // 50 searches per window
    message: 'تم تجاوز الحد المسموح من البحث. يرجى المحاولة بعد 10 دقائق',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // AI/Chat endpoints (more restrictive)
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // 30 AI requests per hour
    message: 'تم تجاوز الحد المسموح من استخدام الذكاء الاصطناعي. يرجى المحاولة بعد ساعة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // Payment endpoints (very strict)
  payment: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // 3 payment attempts per window
    message: 'تم تجاوز الحد المسموح من محاولات الدفع. يرجى المحاولة بعد 30 دقيقة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // Booking endpoints
  booking: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // 10 booking attempts per window
    message: 'تم تجاوز الحد المسموح من الحجوزات. يرجى المحاولة بعد 30 دقيقة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // Admin endpoints (moderate limit)
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // 100 requests per window for admins
    message: 'تم تجاوز الحد المسموح من طلبات الإدارة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: generateKey,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  },
  
  // Public endpoints (more lenient)
  public: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // 200 requests per window
    message: 'تم تجاوز الحد المسموح من الطلبات العامة',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: rateLimitHandler,
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  }
};

// Create rate limiters
export const createRateLimit = (configName) => {
  const config = rateLimitConfigs[configName];
  if (!config) {
    throw new Error(`Rate limit config '${configName}' not found`);
  }
  
  return rateLimit(config);
};

// Pre-configured rate limiters
export const generalLimit = createRateLimit('general');
export const authLimit = createRateLimit('auth');
export const uploadLimit = createRateLimit('upload');
export const searchLimit = createRateLimit('search');
export const aiLimit = createRateLimit('ai');
export const paymentLimit = createRateLimit('payment');
export const bookingLimit = createRateLimit('booking');
export const adminLimit = createRateLimit('admin');
export const publicLimit = createRateLimit('public');

// Advanced rate limiting with custom logic
export const createAdvancedRateLimit = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    skipCondition = null,
    customKeyGenerator = null,
    onLimitReached = null
  } = options;
  
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: customKeyGenerator || generateKey,
    skip: skipCondition || (() => false),
    handler: (req, res, next) => {
      if (onLimitReached) {
        onLimitReached(req, res);
      }
      rateLimitHandler(req, res, next);
    },
    ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
  });
};

// Brute force protection for specific endpoints
export const createBruteForceProtection = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    // Clean old attempts
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key);
      userAttempts.attempts = userAttempts.attempts.filter(
        attempt => now - attempt < windowMs
      );
    }
    
    // Check current attempts
    const userAttempts = attempts.get(key) || { attempts: [] };
    
    if (userAttempts.attempts.length >= maxAttempts) {
      securityLogger.bruteForceAttempt(req.ip, req.originalUrl, userAttempts.attempts.length);
      return rateLimitHandler(req, res, next);
    }
    
    // Add current attempt if request fails
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 400) {
        userAttempts.attempts.push(now);
        attempts.set(key, userAttempts);
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Dynamic rate limiting based on user role
export const createRoleBasedRateLimit = () => {
  return (req, res, next) => {
    const user = req.user;
    
    // Apply different limits based on user role
    let maxRequests = 100; // Default for guests/customers
    
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          maxRequests = 500;
          break;
        case 'PROVIDER':
          maxRequests = 300;
          break;
        case 'CUSTOMER':
          maxRequests = 150;
          break;
        default:
          maxRequests = 100;
      }
      
      // Premium users get higher limits
      if (user.subscription?.planType !== 'FREE') {
        maxRequests *= 2;
      }
    }
    
    // Create dynamic rate limiter
    const dynamicLimit = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: maxRequests,
      keyGenerator: generateKey,
      handler: rateLimitHandler,
      ...(redisClient && { store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }) })
    });
    
    dynamicLimit(req, res, next);
  };
};

// Export Redis client for use in other modules
export { redisClient };

export default {
  general: generalLimit,
  auth: authLimit,
  upload: uploadLimit,
  search: searchLimit,
  ai: aiLimit,
  payment: paymentLimit,
  booking: bookingLimit,
  admin: adminLimit,
  public: publicLimit,
  createRateLimit,
  createAdvancedRateLimit,
  createBruteForceProtection,
  createRoleBasedRateLimit
};
