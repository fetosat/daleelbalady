/**
 * Database Connection
 * اتصال قاعدة البيانات المشترك
 */

import { PrismaClient } from '../generated/prisma/index.js';

// تهيئة واحدة للـ Prisma Client مع معالجة الأخطاء
let prisma;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'pretty',
    });
  } else {
    // في بيئة التطوير، استخدم global variable لتجنب إعادة التهيئة
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        errorFormat: 'pretty',
      });
    }
    prisma = global.prisma;
  }

  // Test the connection
  prisma.$connect().then(() => {
    console.log('✅ Database connected successfully');
  }).catch((error) => {
    console.error('❌ Database connection failed:', error);
    throw error;
  });

} catch (error) {
  console.error('❌ Prisma Client initialization failed:', error);
  throw error;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma?.$disconnect();
});

export { prisma };
export default prisma;
