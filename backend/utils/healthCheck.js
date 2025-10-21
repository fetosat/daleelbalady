// utils/healthCheck.js
// Comprehensive Health Check and Monitoring System

import { PrismaClient } from '../generated/prisma/client.js';
import { createClient } from 'redis';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Health check results cache
let healthCache = {
  lastCheck: null,
  results: null,
  ttl: 30 * 1000 // 30 seconds cache
};

// System thresholds
const thresholds = {
  cpu: 85, // CPU usage percentage
  memory: 90, // Memory usage percentage
  disk: 95, // Disk usage percentage
  responseTime: 5000, // Max response time in ms
  errorRate: 10 // Max error rate percentage
};

// Create Redis client for health checks
let redisClient = null;
const initRedisForHealth = async () => {
  if (process.env.REDIS_URL && !redisClient) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
    } catch (error) {
      console.warn('Redis not available for health checks:', error.message);
    }
  }
};

// Initialize Redis
initRedisForHealth();

// Individual health check functions
const healthChecks = {
  // Database health check
  database: async () => {
    const startTime = Date.now();
    try {
      // Simple query to check database connectivity
      await prisma.$queryRaw`SELECT 1 as health_check`;
      const responseTime = Date.now() - startTime;
      
      // Check for slow query
      const status = responseTime > 2000 ? 'warning' : 'healthy';
      
      return {
        status,
        responseTime,
        message: status === 'warning' ? 'Database responding slowly' : 'Database connection healthy',
        details: {
          responseTime: `${responseTime}ms`,
          connection: 'established'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Database connection failed',
        error: error.message,
        details: {
          connection: 'failed',
          error: error.code || 'UNKNOWN'
        }
      };
    }
  },
  
  // Redis health check
  redis: async () => {
    const startTime = Date.now();
    
    if (!redisClient) {
      return {
        status: 'disabled',
        responseTime: 0,
        message: 'Redis not configured',
        details: { configured: false }
      };
    }
    
    try {
      await redisClient.ping();
      const responseTime = Date.now() - startTime;
      
      const status = responseTime > 1000 ? 'warning' : 'healthy';
      
      return {
        status,
        responseTime,
        message: status === 'warning' ? 'Redis responding slowly' : 'Redis connection healthy',
        details: {
          responseTime: `${responseTime}ms`,
          connection: 'established'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'Redis connection failed',
        error: error.message,
        details: {
          connection: 'failed',
          error: error.code || 'UNKNOWN'
        }
      };
    }
  },
  
  // File system health check
  filesystem: async () => {
    const startTime = Date.now();
    try {
      // Check if uploads directory is writable
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const testFile = path.join(uploadsDir, '.health-check');
      
      await fs.writeFile(testFile, 'health-check');
      await fs.unlink(testFile);
      
      // Get disk usage
      const stats = await fs.stat(uploadsDir);
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        message: 'File system accessible and writable',
        details: {
          uploadsDir: 'writable',
          responseTime: `${responseTime}ms`
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: 'File system access failed',
        error: error.message,
        details: {
          uploadsDir: 'not accessible',
          error: error.code || 'UNKNOWN'
        }
      };
    }
  },
  
  // Memory health check
  memory: async () => {
    try {
      const usage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      
      let status = 'healthy';
      let message = 'Memory usage within normal limits';
      
      if (memoryUsagePercent > thresholds.memory) {
        status = 'unhealthy';
        message = 'High memory usage detected';
      } else if (memoryUsagePercent > (thresholds.memory - 10)) {
        status = 'warning';
        message = 'Memory usage approaching limits';
      }
      
      return {
        status,
        responseTime: 0,
        message,
        details: {
          systemMemory: {
            total: `${Math.round(totalMemory / 1024 / 1024)} MB`,
            free: `${Math.round(freeMemory / 1024 / 1024)} MB`,
            used: `${Math.round(usedMemory / 1024 / 1024)} MB`,
            usagePercent: `${memoryUsagePercent.toFixed(1)}%`
          },
          processMemory: {
            rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(usage.external / 1024 / 1024)} MB`
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        message: 'Failed to check memory usage',
        error: error.message
      };
    }
  },
  
  // CPU health check
  cpu: async () => {
    try {
      const cpus = os.cpus();
      const loadAverage = os.loadavg();
      const cpuUsage = loadAverage[0] / cpus.length * 100;
      
      let status = 'healthy';
      let message = 'CPU usage within normal limits';
      
      if (cpuUsage > thresholds.cpu) {
        status = 'unhealthy';
        message = 'High CPU usage detected';
      } else if (cpuUsage > (thresholds.cpu - 15)) {
        status = 'warning';
        message = 'CPU usage elevated';
      }
      
      return {
        status,
        responseTime: 0,
        message,
        details: {
          cores: cpus.length,
          loadAverage: loadAverage.map(avg => avg.toFixed(2)),
          cpuUsage: `${cpuUsage.toFixed(1)}%`,
          architecture: os.arch(),
          platform: os.platform()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        message: 'Failed to check CPU usage',
        error: error.message
      };
    }
  },
  
  // Application-specific health checks
  application: async () => {
    try {
      // Check if all required environment variables are set
      const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_API_KEY'];
      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      // Check uptime
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      
      let status = 'healthy';
      let message = 'Application running normally';
      
      if (missingEnvVars.length > 0) {
        status = 'warning';
        message = `Missing environment variables: ${missingEnvVars.join(', ')}`;
      }
      
      return {
        status,
        responseTime: 0,
        message,
        details: {
          uptime: `${uptimeHours}h ${Math.floor((uptime % 3600) / 60)}m`,
          nodeVersion: process.version,
          pid: process.pid,
          environment: process.env.NODE_ENV || 'development',
          missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : 'none'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 0,
        message: 'Application health check failed',
        error: error.message
      };
    }
  }
};

// Main health check function
export const performHealthCheck = async (useCache = true) => {
  const now = Date.now();
  
  // Return cached results if still valid
  if (useCache && healthCache.lastCheck && (now - healthCache.lastCheck) < healthCache.ttl) {
    return healthCache.results;
  }
  
  const startTime = Date.now();
  const results = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
    summary: {
      healthy: 0,
      warning: 0,
      unhealthy: 0,
      disabled: 0,
      total: 0
    },
    responseTime: 0,
    version: process.env.npm_package_version || '1.0.0'
  };
  
  // Run all health checks in parallel
  const checkPromises = Object.entries(healthChecks).map(async ([name, checkFn]) => {
    try {
      const result = await Promise.race([
        checkFn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), 10000))
      ]);
      
      return [name, result];
    } catch (error) {
      return [name, {
        status: 'unhealthy',
        responseTime: 0,
        message: 'Health check failed or timed out',
        error: error.message
      }];
    }
  });
  
  const checkResults = await Promise.all(checkPromises);
  
  // Process results
  checkResults.forEach(([name, result]) => {
    results.checks[name] = result;
    results.summary[result.status]++;
    results.summary.total++;
  });
  
  // Determine overall status
  if (results.summary.unhealthy > 0) {
    results.status = 'unhealthy';
  } else if (results.summary.warning > 0) {
    results.status = 'warning';
  }
  
  results.responseTime = Date.now() - startTime;
  
  // Cache results
  healthCache.lastCheck = now;
  healthCache.results = results;
  
  return results;
};

// Express middleware for health checks
export const healthCheckMiddleware = (req, res) => {
  const useCache = req.query.cache !== 'false';
  
  performHealthCheck(useCache)
    .then(results => {
      const statusCode = results.status === 'unhealthy' ? 503 : 200;
      res.status(statusCode).json(results);
    })
    .catch(error => {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        message: 'Health check system failure',
        error: error.message
      });
    });
};

// Liveness probe (simple check)
export const livenessProbe = (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid
  });
};

// Readiness probe (detailed check)
export const readinessProbe = async (req, res) => {
  try {
    // Check only critical systems for readiness
    const criticalChecks = {
      database: await healthChecks.database(),
      memory: await healthChecks.memory()
    };
    
    const allReady = Object.values(criticalChecks).every(check => 
      check.status === 'healthy' || check.status === 'warning'
    );
    
    const statusCode = allReady ? 200 : 503;
    
    res.status(statusCode).json({
      status: allReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: criticalChecks
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Performance metrics collector
export const collectMetrics = () => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: process.memoryUsage()
      },
      cpu: {
        cores: os.cpus().length,
        architecture: os.arch()
      }
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      version: process.version,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };
  
  return metrics;
};

// Startup health check
export const startupHealthCheck = async () => {
  console.log('🏥 Performing startup health check...');
  
  try {
    const results = await performHealthCheck(false);
    
    if (results.status === 'unhealthy') {
      console.error('💥 Startup health check failed:', results);
      process.exit(1);
    } else if (results.status === 'warning') {
      console.warn('⚠️ Startup health check has warnings:', results.summary);
    } else {
      console.log('✅ Startup health check passed');
    }
    
    return results;
  } catch (error) {
    console.error('💥 Startup health check failed:', error);
    process.exit(1);
  }
};

// Periodic health monitoring
export const startHealthMonitoring = (intervalMs = 60000) => {
  setInterval(async () => {
    try {
      const results = await performHealthCheck(false);
      
      if (results.status === 'unhealthy') {
        console.error('🚨 Health monitoring alert: System unhealthy', results.summary);
        // Here you could send alerts to external monitoring systems
      }
    } catch (error) {
      console.error('❌ Health monitoring failed:', error);
    }
  }, intervalMs);
  
  console.log(`📊 Health monitoring started (interval: ${intervalMs}ms)`);
};

export default {
  performHealthCheck,
  healthCheckMiddleware,
  livenessProbe,
  readinessProbe,
  collectMetrics,
  startupHealthCheck,
  startHealthMonitoring
};
