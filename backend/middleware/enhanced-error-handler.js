import { PrismaClientKnownRequestError } from '../generated/prisma/index.js';

/**
 * Enhanced Error Handler Middleware
 * Handles all types of errors with detailed logging and consistent response format
 */
export const enhancedErrorHandler = (err, req, res, next) => {
  console.error('🚨 Error Details:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Prisma Database Errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = {
          success: false,
          message: 'Duplicate entry. This record already exists.',
          code: 'DUPLICATE_ENTRY',
          field: err.meta?.target?.[0] || 'unknown',
          statusCode: 409,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        break;
      case 'P2025':
        error = {
          success: false,
          message: 'Record not found.',
          code: 'NOT_FOUND',
          statusCode: 404,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        break;
      case 'P2003':
        error = {
          success: false,
          message: 'Foreign key constraint failed.',
          code: 'FOREIGN_KEY_ERROR',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: req.path
        };
        break;
      default:
        error.message = 'Database operation failed.';
        error.code = 'DATABASE_ERROR';
        error.statusCode = 400;
    }
  }
  
  // Validation Errors
  else if (err.name === 'ValidationError' || err.type === 'validation') {
    error = {
      success: false,
      message: 'Validation failed.',
      code: 'VALIDATION_ERROR',
      errors: err.errors || [err.message],
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }
  
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid or malformed token.',
      code: 'INVALID_TOKEN',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }
  else if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token has expired.',
      code: 'TOKEN_EXPIRED',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }
  
  // Custom App Errors
  else if (err.statusCode && err.code) {
    error = {
      success: false,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }
  
  // File Upload Errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      success: false,
      message: 'File size too large.',
      code: 'FILE_TOO_LARGE',
      limit: err.limit,
      statusCode: 413,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }
  
  // Payment Errors (Paymob)
  else if (err.type === 'payment_error') {
    error = {
      success: false,
      message: 'Payment processing failed.',
      code: 'PAYMENT_ERROR',
      details: err.details || err.message,
      statusCode: 402,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }

  // Rate Limiting
  else if (err.type === 'rate_limit') {
    error = {
      success: false,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: err.retryAfter,
      statusCode: 429,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }

  // Syntax Errors
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = {
      success: false,
      message: 'Invalid JSON in request body.',
      code: 'INVALID_JSON',
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: req.path
    };
  }

  // Add additional context in development
  if (process.env.NODE_ENV === 'development') {
    error.debug = {
      originalError: err.message,
      stack: err.stack,
      requestBody: req.body,
      requestParams: req.params,
      requestQuery: req.query
    };
  }

  // Log critical errors
  if (error.statusCode >= 500) {
    console.error('🔥 CRITICAL ERROR:', {
      error,
      user: req.user?.id,
      sessionId: req.sessionID
    });
  }

  res.status(error.statusCode).json(error);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    availableRoutes: process.env.NODE_ENV === 'development' ? [
      'GET /api/auth/me',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users/:id',
      'GET /api/services',
      'GET /api/shops',
      'GET /api/products',
      'GET /api/bookings',
      'GET /api/offers'
    ] : undefined
  });
};

/**
 * Success Response Helper
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    statusCode
  });
};

/**
 * Pagination Response Helper
 */
export const paginationResponse = (res, data, pagination, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString(),
    statusCode: 200
  });
};
