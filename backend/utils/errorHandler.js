/**
 * Error Handler Utilities
 * لمعالجة الأخطاء المتكررة بطريقة موحدة
 */

/**
 * معالجة أخطاء قاعدة البيانات
 */
export const handleDatabaseError = (error, operation = 'database operation') => {
  console.error(`❌ ${operation} error:`, error);
  
  // Check for specific Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return {
          status: 400,
          message: 'البيانات مكررة - هذا السجل موجود بالفعل',
          error: 'Duplicate entry'
        };
      case 'P2025':
        return {
          status: 404,
          message: 'السجل غير موجود',
          error: 'Record not found'
        };
      case 'P2003':
        return {
          status: 400,
          message: 'خطأ في العلاقة بين البيانات',
          error: 'Foreign key constraint failed'
        };
      case 'P2021':
        return {
          status: 500,
          message: 'الجدول غير موجود في قاعدة البيانات',
          error: 'Table does not exist'
        };
      default:
        return {
          status: 500,
          message: 'خطأ في قاعدة البيانات',
          error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
        };
    }
  }

  // Check if Prisma client is undefined
  if (error.message && error.message.includes("Cannot read properties of undefined")) {
    return {
      status: 503,
      message: 'قاعدة البيانات غير متاحة حالياً',
      error: 'Database service unavailable',
      code: 'DB_UNAVAILABLE'
    };
  }

  // Generic database error
  return {
    status: 500,
    message: `خطأ في ${operation}`,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  };
};

/**
 * معالجة أخطاء التحقق من الصحة
 */
export const handleValidationError = (error, field = 'input') => {
  console.error(`❌ Validation error for ${field}:`, error);
  
  return {
    status: 400,
    message: `خطأ في بيانات ${field}`,
    error: error.message || 'Validation failed'
  };
};

/**
 * معالجة أخطاء المصادقة
 */
export const handleAuthError = (error, operation = 'authentication') => {
  console.error(`❌ ${operation} error:`, error);
  
  return {
    status: 401,
    message: 'غير مصرح لك بالوصول',
    error: 'Authentication failed'
  };
};

/**
 * إرسال استجابة خطأ موحدة
 */
export const sendErrorResponse = (res, errorInfo, operation = 'operation') => {
  const { status, message, error, code } = errorInfo;
  
  res.status(status).json({
    success: false,
    message,
    error,
    code,
    operation,
    timestamp: new Date().toISOString()
  });
};

/**
 * تقليل عدد logs المتكررة
 */
const recentErrors = new Map();
const ERROR_THROTTLE_TIME = 30000; // 30 seconds

export const throttledError = (errorKey, error, operation) => {
  const now = Date.now();
  const lastLogged = recentErrors.get(errorKey);
  
  if (!lastLogged || now - lastLogged > ERROR_THROTTLE_TIME) {
    console.error(`❌ ${operation} error:`, error);
    recentErrors.set(errorKey, now);
    
    // Clean up old entries
    if (recentErrors.size > 100) {
      const oldestTime = now - ERROR_THROTTLE_TIME;
      for (const [key, time] of recentErrors) {
        if (time < oldestTime) {
          recentErrors.delete(key);
        }
      }
    }
  }
  
  return handleDatabaseError(error, operation);
};
