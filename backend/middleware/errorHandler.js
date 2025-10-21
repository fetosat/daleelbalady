// middleware/errorHandler.js
// Global Error Handling Middleware

import { AppError } from '../utils/AppError.js';

// Handle different types of errors and convert them to AppError
const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field';
    const arabicFields = {
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      name: 'الاسم',
      slug: 'الرابط'
    };
    const arabicField = arabicFields[field] || field;
    return new AppError(`${arabicField} مستخدم مسبقاً`, 409, 'DUPLICATE_ENTRY');
  }
  
  if (err.code === 'P2025') {
    // Record not found
    return new AppError('البيانات المطلوبة غير موجودة', 404, 'NOT_FOUND');
  }
  
  if (err.code === 'P2003') {
    // Foreign key constraint
    return new AppError('لا يمكن حذف هذا العنصر لارتباطه ببيانات أخرى', 409, 'FOREIGN_KEY_CONSTRAINT');
  }
  
  if (err.code === 'P2014') {
    // Required relation missing
    return new AppError('بيانات مطلوبة مفقودة', 400, 'MISSING_RELATION');
  }
  
  return new AppError('خطأ في قاعدة البيانات', 500, 'DATABASE_ERROR');
};

const handleJWTError = () => 
  new AppError('رمز المصادقة غير صحيح', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('انتهت صلاحية رمز المصادقة. يرجى تسجيل الدخول مرة أخرى', 401, 'TOKEN_EXPIRED');

const handleValidationError = (err) => {
  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map(error => {
      const field = error.path.join('.');
      return `${field}: ${error.message}`;
    });
    return new AppError(`بيانات غير صحيحة: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
  }
  
  // Handle express-validator errors
  if (err.array && typeof err.array === 'function') {
    const messages = err.array().map(error => `${error.param}: ${error.msg}`);
    return new AppError(`بيانات غير صحيحة: ${messages.join(', ')}`, 400, 'VALIDATION_ERROR');
  }
  
  return new AppError('بيانات غير صحيحة', 400, 'VALIDATION_ERROR');
};

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت', 400, 'FILE_TOO_LARGE');
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('عدد الملفات أكبر من المسموح', 400, 'TOO_MANY_FILES');
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('نوع الملف غير مدعوم', 400, 'UNSUPPORTED_FILE');
  }
  
  return new AppError('خطأ في رفع الملف', 400, 'FILE_UPLOAD_ERROR');
};

// Format error response based on environment
const sendErrorDev = (err, req, res) => {
  // Development - send all error details
  console.error('💥 ERROR DETAILS:', {
    error: err,
    stack: err.stack,
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    timestamp: err.timestamp,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    code: err.code,
    timestamp: err.timestamp,
    stack: err.stack,
    request: {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    }
  });
};

const sendErrorProd = (err, req, res) => {
  // Production - only send safe error details
  
  // Log error for monitoring (but don't expose to user)
  console.error('💥 PRODUCTION ERROR:', {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    timestamp: err.timestamp,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.isOperational ? undefined : err.stack // Only log stack for operational errors
  });
  
  // Operational errors: safe to send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      success: false,
      message: err.message,
      code: err.code,
      timestamp: err.timestamp
    });
  } else {
    // Programming errors: don't leak details
    res.status(500).json({
      status: 'error',
      success: false,
      message: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Main error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.timestamp = err.timestamp || new Date().toISOString();
  
  // Create a copy of error
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;
  
  // Handle specific error types
  if (error.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(error);
  } else if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  } else if (error.name === 'ZodError' || (error.array && typeof error.array === 'function')) {
    error = handleValidationError(error);
  } else if (error.name === 'MulterError') {
    error = handleMulterError(error);
  } else if (error.code === 'ENOENT') {
    error = new AppError('الملف المطلوب غير موجود', 404, 'FILE_NOT_FOUND');
  } else if (error.code === 'EACCES') {
    error = new AppError('ليس لديك صلاحية للوصول لهذا الملف', 403, 'FILE_ACCESS_DENIED');
  }
  
  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Catch unhandled promise rejections
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED PROMISE REJECTION:', {
      reason,
      promise,
      timestamp: new Date().toISOString()
    });
    
    // Close server gracefully
    process.exit(1);
  });
};

// Catch uncaught exceptions
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Close server gracefully
    process.exit(1);
  });
};

// Async wrapper to catch errors in async route handlers
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle 404 for undefined routes
export const handleNotFound = (req, res, next) => {
  const error = new AppError(
    `المسار ${req.originalUrl} غير موجود على هذا الخادم`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};
