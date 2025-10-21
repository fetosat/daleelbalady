/**
 * Database Check Middleware
 * للتأكد من أن قاعدة البيانات متاحة قبل المعالجة
 */

import { prisma } from '../lib/db.js';

const databaseCheck = (req, res, next) => {
  try {
    // التحقق من توفر Prisma Client
    if (!prisma) {
      console.error('❌ Prisma client is not available');
      return res.status(503).json({
        success: false,
        message: 'قاعدة البيانات غير متاحة حالياً',
        error: 'Database service unavailable',
        code: 'DB_UNAVAILABLE'
      });
    }

    // التحقق من اتصال قاعدة البيانات
    prisma.$queryRaw`SELECT 1`.then(() => {
      // الاتصال يعمل بشكل صحيح
      next();
    }).catch((error) => {
      console.error('❌ Database connection test failed:', error);
      return res.status(503).json({
        success: false,
        message: 'خطأ في الاتصال بقاعدة البيانات',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed',
        code: 'DB_CONNECTION_ERROR'
      });
    });

  } catch (error) {
    console.error('❌ Database check middleware error:', error);
    return res.status(503).json({
      success: false,
      message: 'خطأ في فحص قاعدة البيانات',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database check failed',
      code: 'DB_CHECK_ERROR'
    });
  }
};

export default databaseCheck;
