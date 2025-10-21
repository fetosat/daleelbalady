// middleware/security.js
// Comprehensive Security Middleware

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import ExpressBrute from 'express-brute';
import MongoStore from 'express-brute-mongo';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import validator from 'validator';
import { loggers } from '../utils/logger.js';

// XSS Protection with Arabic support
const xssOptions = {
  whiteList: {
    // Allow basic formatting
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    i: [],
    b: [],
    span: ['class'],
    div: ['class'],
    // Arabic text support
    'arabic-text': []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
  allowCommentTag: false,
  escapeHtml: (html) => {
    // Preserve Arabic characters while escaping HTML
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};

// Helmet Configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.mapbox.com", "https://maps.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // For development compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  }
};

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://www.daleelbalady.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://daleelbalady.com',
      'https://www.daleelbalady.com',
      'https://admin.daleelbalady.com',
      'https://api.daleelbalady.com'
    ];
    
    // Add environment-specific origins
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    if (process.env.ADMIN_URL) {
      allowedOrigins.push(process.env.ADMIN_URL);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      loggers.security.warn('CORS blocked origin:', origin);
      callback(new Error('غير مسموح بالوصول من هذا المصدر'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Forwarded-For',
    'X-Real-IP',
    'User-Agent'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Brute Force Protection Store
let bruteStore;
if (process.env.MONGODB_URI) {
  bruteStore = new MongoStore((ready) => {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, (err) => {
      if (err) {
        console.warn('MongoDB connection for brute force protection failed:', err.message);
      }
      ready(err);
    });
  });
}

// Brute Force Protection
const bruteForceOptions = {
  store: bruteStore,
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  lifetime: 24 * 60 * 60, // 24 hours
  failCallback: (req, res, next, nextValidRequestDate) => {
    loggers.security.warn('Brute force attack detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      nextValidRequestDate
    });
    
    res.status(429).json({
      success: false,
      message: 'تم حظر عنوان IP مؤقتاً بسبب المحاولات المتكررة. حاول مرة أخرى لاحقاً',
      retryAfter: nextValidRequestDate
    });
  },
  handleStoreError: (error) => {
    loggers.security.error('Brute force store error:', error);
    throw error;
  }
};

const bruteForce = new ExpressBrute(bruteForceOptions);

// Custom sanitization middleware
export const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    loggers.security.error('Input sanitization error:', error);
    next();
  }
};

// Deep sanitization function
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // XSS protection
    let sanitized = xss(obj, xssOptions);
    
    // Additional sanitization for SQL injection patterns
    sanitized = sanitized.replace(/['"\\;]/g, '');
    
    // Validate and sanitize URLs
    if (validator.isURL(sanitized, { require_protocol: true })) {
      return validator.escape(sanitized);
    }
    
    // Validate and sanitize emails
    if (validator.isEmail(sanitized)) {
      return validator.normalizeEmail(sanitized);
    }
    
    // General HTML escape for other strings
    return validator.escape(sanitized);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize key names to prevent prototype pollution
        const cleanKey = validator.escape(key.replace(/[^a-zA-Z0-9_-]/g, ''));
        if (cleanKey && !cleanKey.startsWith('__') && cleanKey !== 'constructor' && cleanKey !== 'prototype') {
          sanitized[cleanKey] = sanitizeObject(obj[key]);
        }
      }
    }
    return sanitized;
  }
  
  return obj;
};

// IP validation and blocking
const blockedIPs = new Set();
const suspiciousActivityTracker = new Map();

export const ipSecurityCheck = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  if (blockedIPs.has(clientIP)) {
    loggers.security.warn('Blocked IP attempted access:', clientIP);
    return res.status(403).json({
      success: false,
      message: 'تم حظر عنوان IP هذا'
    });
  }
  
  // Track suspicious activity
  const now = Date.now();
  const activity = suspiciousActivityTracker.get(clientIP) || { requests: 0, firstRequest: now };
  
  // Reset counter if more than 1 hour passed
  if (now - activity.firstRequest > 60 * 60 * 1000) {
    activity.requests = 0;
    activity.firstRequest = now;
  }
  
  activity.requests++;
  suspiciousActivityTracker.set(clientIP, activity);
  
  // Block IP if too many requests in short time (potential bot)
  if (activity.requests > 1000) {
    blockedIPs.add(clientIP);
    loggers.security.error('IP blocked due to suspicious activity:', {
      ip: clientIP,
      requests: activity.requests,
      timeWindow: '1 hour'
    });
    
    return res.status(429).json({
      success: false,
      message: 'تم حظر عنوان IP بسبب النشاط المشبوه'
    });
  }
  
  next();
};

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length')) || 0;
  const maxSize = req.path.includes('/upload') ? 50 * 1024 * 1024 : 1024 * 1024; // 50MB for uploads, 1MB for others
  
  if (contentLength > maxSize) {
    loggers.security.warn('Request size exceeded limit:', {
      ip: req.ip,
      path: req.path,
      size: contentLength,
      limit: maxSize
    });
    
    return res.status(413).json({
      success: false,
      message: 'حجم الطلب كبير جداً'
    });
  }
  
  next();
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  // Prevent information disclosure
  if (req.path.includes('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  }
  
  next();
};

// Main security middleware setup function
export const setupSecurity = (app) => {
  // Basic security headers
  app.use(helmet(helmetConfig));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Request parsing limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // MongoDB injection prevention
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      loggers.security.warn('MongoDB injection attempt detected:', {
        ip: req.ip,
        key: key,
        path: req.path
      });
    }
  }));
  
  // Custom security middlewares
  app.use(ipSecurityCheck);
  app.use(requestSizeLimiter);
  app.use(securityHeaders);
  app.use(sanitizeInput);
  
  // Brute force protection for sensitive endpoints
  app.use('/api/auth/login', bruteForce.prevent);
  app.use('/api/auth/register', bruteForce.prevent);
  app.use('/api/auth/forgot-password', bruteForce.prevent);
  app.use('/api/auth/reset-password', bruteForce.prevent);
  app.use('/api/admin/login', bruteForce.prevent);
  
  console.log('🛡️ Security middleware configured successfully');
};

// Utility functions for manual blocking/unblocking
export const blockIP = (ip) => {
  blockedIPs.add(ip);
  loggers.security.info('IP manually blocked:', ip);
};

export const unblockIP = (ip) => {
  blockedIPs.delete(ip);
  suspiciousActivityTracker.delete(ip);
  loggers.security.info('IP manually unblocked:', ip);
};

export const getBlockedIPs = () => {
  return Array.from(blockedIPs);
};

export const getSuspiciousActivity = () => {
  return Object.fromEntries(suspiciousActivityTracker);
};

// Export individual middlewares
export {
  helmetConfig,
  corsOptions,
  bruteForce,
  bruteForceOptions
};

export default {
  setupSecurity,
  sanitizeInput,
  ipSecurityCheck,
  requestSizeLimiter,
  securityHeaders,
  blockIP,
  unblockIP,
  getBlockedIPs,
  getSuspiciousActivity
};
