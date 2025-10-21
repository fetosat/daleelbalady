// utils/AppError.js
// Comprehensive Error Handling System for Daleel Balady

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types with Arabic messages
export class ValidationError extends AppError {
  constructor(message = 'بيانات غير صحيحة', field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'يرجى تسجيل الدخول للمتابعة') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'ليس لديك صلاحية للوصول لهذا المحتوى') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'المحتوى المطلوب') {
    super(`${resource} غير موجود`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

export class ConflictError extends AppError {
  constructor(message = 'البيانات موجودة مسبقاً') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class FileUploadError extends AppError {
  constructor(message = 'خطأ في رفع الملف') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'خطأ في قاعدة البيانات') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class PaymentError extends AppError {
  constructor(message = 'خطأ في عملية الدفع') {
    super(message, 402, 'PAYMENT_ERROR');
  }
}

// Error factory for common scenarios
export const ErrorFactory = {
  // User errors
  userNotFound: () => new NotFoundError('المستخدم'),
  invalidCredentials: () => new AuthenticationError('البريد الإلكتروني أو كلمة المرور غير صحيحة'),
  emailExists: () => new ConflictError('البريد الإلكتروني مستخدم مسبقاً'),
  phoneExists: () => new ConflictError('رقم الهاتف مستخدم مسبقاً'),
  
  // Service errors
  serviceNotFound: () => new NotFoundError('الخدمة'),
  serviceNotAvailable: () => new ValidationError('الخدمة غير متاحة حالياً'),
  
  // Shop errors
  shopNotFound: () => new NotFoundError('المتجر'),
  shopNotVerified: () => new ValidationError('المتجر غير مُفعل'),
  
  // Product errors
  productNotFound: () => new NotFoundError('المنتج'),
  insufficientStock: () => new ValidationError('المخزون غير كافي'),
  
  // Booking errors
  bookingNotFound: () => new NotFoundError('الحجز'),
  timeSlotUnavailable: () => new ValidationError('الوقت المحدد غير متاح'),
  
  // Payment errors
  paymentFailed: (details = '') => new PaymentError(`فشل في عملية الدفع. ${details}`),
  insufficientFunds: () => new PaymentError('الرصيد غير كافي'),
  
  // File errors
  invalidFileType: (allowedTypes = '') => new FileUploadError(`نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes}`),
  fileTooLarge: (maxSize = '5MB') => new FileUploadError(`حجم الملف كبير جداً. الحد الأقصى: ${maxSize}`),
  
  // Validation errors
  requiredField: (fieldName) => new ValidationError(`${fieldName} مطلوب`),
  invalidEmail: () => new ValidationError('البريد الإلكتروني غير صحيح'),
  invalidPhone: () => new ValidationError('رقم الهاتف غير صحيح'),
  passwordTooShort: () => new ValidationError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  
  // Role and permission errors
  providerRequired: () => new AuthorizationError('يجب أن تكون مزود خدمة للوصول لهذا المحتوى'),
  adminRequired: () => new AuthorizationError('يجب أن تكون مدير للوصول لهذا المحتوى'),
  
  // Rate limiting
  tooManyRequests: () => new RateLimitError(),
  
  // Generic errors
  serverError: (message = 'خطأ داخلي في الخادم') => new AppError(message, 500, 'INTERNAL_ERROR'),
  badRequest: (message = 'طلب غير صحيح') => new ValidationError(message),
};

export default AppError;
