// middleware/validation.js
// Advanced Validation System using Zod

import { z } from 'zod';
import { ValidationError } from '../utils/AppError.js';

// Custom error map for Arabic messages
const arabicErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string') {
        return { message: 'يجب أن يكون نص' };
      }
      if (issue.expected === 'number') {
        return { message: 'يجب أن يكون رقم' };
      }
      if (issue.expected === 'boolean') {
        return { message: 'يجب أن يكون صحيح أو خطأ' };
      }
      return { message: `نوع البيانات غير صحيح، متوقع: ${issue.expected}` };
      
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'البريد الإلكتروني غير صحيح' };
      }
      if (issue.validation === 'url') {
        return { message: 'الرابط غير صحيح' };
      }
      if (issue.validation === 'regex') {
        return { message: 'الصيغة غير صحيحة' };
      }
      return { message: 'النص غير صحيح' };
      
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: `يجب أن يكون ${issue.minimum} أحرف على الأقل` };
      }
      if (issue.type === 'number') {
        return { message: `يجب أن يكون ${issue.minimum} على الأقل` };
      }
      if (issue.type === 'array') {
        return { message: `يجب أن يحتوي على ${issue.minimum} عنصر على الأقل` };
      }
      return { message: `القيمة صغيرة جداً، الحد الأدنى: ${issue.minimum}` };
      
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `يجب أن يكون ${issue.maximum} حرف على الأكثر` };
      }
      if (issue.type === 'number') {
        return { message: `يجب أن يكون ${issue.maximum} على الأكثر` };
      }
      if (issue.type === 'array') {
        return { message: `يجب أن يحتوي على ${issue.maximum} عنصر على الأكثر` };
      }
      return { message: `القيمة كبيرة جداً، الحد الأقصى: ${issue.maximum}` };
      
    case z.ZodIssueCode.invalid_enum_value:
      return { message: `القيمة غير صحيحة، القيم المسموحة: ${issue.options.join(', ')}` };
      
    case z.ZodIssueCode.invalid_date:
      return { message: 'التاريخ غير صحيح' };
      
    default:
      return { message: 'البيانات غير صحيحة' };
  }
};

// Set the error map globally
z.setErrorMap(arabicErrorMap);

// Generic validation middleware factory
export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'headers':
          dataToValidate = req.headers;
          break;
        default:
          dataToValidate = req.body;
      }
      
      // Parse and validate
      const validatedData = await schema.parseAsync(dataToValidate);
      
      // Replace original data with validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => {
          const field = err.path.join('.');
          return field ? `${field}: ${err.message}` : err.message;
        });
        
        const validationError = new ValidationError(
          `خطأ في التحقق من البيانات: ${errorMessages.join(', ')}`
        );
        validationError.details = error.errors;
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

export default {
  validateRequest
};

// Validation middleware for auth routes
export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateSignup = (req, res, next) => {
    const { name, email, password, phone } = req.body;

    const errors = [];

    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (email && !validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!validatePassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    // Phone validation (optional)
    if (phone) {
        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        if (!phoneRegex.test(phone)) {
            errors.push('Please provide a valid phone number');
        }
    }

    // Either email or phone is required
    if (!email && !phone) {
        errors.push('Please provide either email or phone');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, phone, password } = req.body;

    const errors = [];

    // Email validation if provided
    if (email && !validateEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    // Password validation
    if (!validatePassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    // Either email or phone is required
    if (!email && !phone) {
        errors.push('Please provide either email or phone');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};
