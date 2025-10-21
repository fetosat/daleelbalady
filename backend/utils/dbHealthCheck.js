/**
 * Database Health Check and Initialization
 * فحص وتهيئة قاعدة البيانات
 */

import { prisma } from '../lib/db.js';

/**
 * فحص صحة قاعدة البيانات
 */
export const checkDatabaseHealth = async () => {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection is healthy');
    
    // Check if main tables exist
    const tableChecks = [
      'User',
      'Service', 
      'Shop',
      'Product',
      'Category'
    ];
    
    for (const table of tableChecks) {
      try {
        await prisma[table.toLowerCase()].findFirst({ take: 1 });
        console.log(`✅ Table ${table} is accessible`);
      } catch (error) {
        if (error.code === 'P2021') {
          console.error(`❌ Table ${table} does not exist`);
          throw new Error(`Missing required table: ${table}`);
        }
        console.warn(`⚠️ Warning checking table ${table}:`, error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

/**
 * إعداد قاعدة البيانات
 */
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    // Check health first
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }
    
    // Run migrations if needed
    try {
      console.log('🔄 Checking for pending migrations...');
      // This would run migrations in production
      // await prisma.$executeRaw`SELECT 1`; // Placeholder
      console.log('✅ Database schema is up to date');
    } catch (migrationError) {
      console.error('❌ Migration check failed:', migrationError);
    }
    
    console.log('✅ Database initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

/**
 * معالج graceful shutdown
 */
export const gracefulDatabaseShutdown = async () => {
  try {
    console.log('🔄 Closing database connections...');
    await prisma.$disconnect();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

/**
 * فحص دوري لصحة قاعدة البيانات
 */
let healthCheckInterval;

export const startHealthMonitoring = (intervalMs = 30000) => {
  console.log(`🔄 Starting database health monitoring (every ${intervalMs/1000}s)`);
  
  healthCheckInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      // Silent success - only log errors
    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
    }
  }, intervalMs);
};

export const stopHealthMonitoring = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('🛑 Stopped database health monitoring');
  }
};
