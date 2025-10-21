import { performance } from 'perf_hooks';
import os from 'os';

/**
 * Performance monitoring and metrics collection
 */

// In-memory metrics store (use Redis in production)
const metricsStore = {
  requests: [],
  errors: [],
  performance: [],
  system: {
    startTime: Date.now(),
    totalRequests: 0,
    totalErrors: 0
  }
};

/**
 * Request timing and performance middleware
 */
export const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  const requestStart = Date.now();
  
  // Track memory usage before request
  const memBefore = process.memoryUsage();
  
  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const memAfter = process.memoryUsage();
    
    // Calculate memory delta
    const memoryDelta = {
      rss: memAfter.rss - memBefore.rss,
      heapUsed: memAfter.heapUsed - memBefore.heapUsed,
      heapTotal: memAfter.heapTotal - memBefore.heapTotal,
      external: memAfter.external - memBefore.external
    };

    // Store metrics
    const metric = {
      timestamp: requestStart,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimals
      memoryDelta,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      contentLength: data ? JSON.stringify(data).length : 0
    };

    // Add to metrics store (keep only last 1000 requests)
    metricsStore.requests.push(metric);
    if (metricsStore.requests.length > 1000) {
      metricsStore.requests.shift();
    }

    metricsStore.system.totalRequests++;

    // Set performance headers
    res.set({
      'X-Response-Time': `${duration}ms`,
      'X-Memory-Delta': `${Math.round(memoryDelta.heapUsed / 1024)}KB`,
      'X-Request-ID': req.id || 'unknown'
    });

    // Log slow requests
    if (duration > 1000) { // Slower than 1 second
      console.warn('🐌 SLOW REQUEST:', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        memoryDelta: `${Math.round(memoryDelta.heapUsed / 1024)}KB`
      });
    }

    return originalJson.call(this, data);
  };

  // Track errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const errorMetric = {
        timestamp: requestStart,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      };

      metricsStore.errors.push(errorMetric);
      if (metricsStore.errors.length > 500) {
        metricsStore.errors.shift();
      }

      metricsStore.system.totalErrors++;
    }
  });

  next();
};

/**
 * System metrics collector
 */
export const collectSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    timestamp: Date.now(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024) // MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    system: {
      loadAverage: os.loadavg(),
      freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
      totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
      uptime: Math.round(os.uptime())
    },
    node: {
      version: process.version,
      uptime: Math.round(process.uptime()),
      pid: process.pid
    }
  };
};

/**
 * Health check endpoint
 */
export const healthCheck = (req, res) => {
  const metrics = collectSystemMetrics();
  const recentRequests = metricsStore.requests.slice(-100);
  const recentErrors = metricsStore.errors.slice(-50);

  // Calculate average response time
  const avgResponseTime = recentRequests.length > 0
    ? recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length
    : 0;

  // Calculate error rate
  const errorRate = metricsStore.system.totalRequests > 0
    ? (metricsStore.system.totalErrors / metricsStore.system.totalRequests) * 100
    : 0;

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - metricsStore.system.startTime) / 1000),
    metrics: {
      ...metrics,
      requests: {
        total: metricsStore.system.totalRequests,
        errors: metricsStore.system.totalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        recentCount: recentRequests.length
      }
    },
    checks: {
      memory: metrics.memory.heapUsed < 500 ? 'ok' : 'warning', // < 500MB
      cpu: metrics.system.loadAverage[0] < 1.0 ? 'ok' : 'warning',
      errors: errorRate < 5 ? 'ok' : 'critical', // < 5% error rate
      responseTime: avgResponseTime < 500 ? 'ok' : 'warning' // < 500ms
    }
  };

  // Determine overall status
  const checks = Object.values(health.checks);
  if (checks.includes('critical')) {
    health.status = 'critical';
  } else if (checks.includes('warning')) {
    health.status = 'warning';
  }

  const statusCode = health.status === 'critical' ? 503 : 200;
  
  res.status(statusCode).json({
    success: health.status !== 'critical',
    data: health
  });
};

/**
 * Detailed metrics endpoint
 */
export const getDetailedMetrics = (req, res) => {
  const { limit = 100, type = 'all' } = req.query;
  const limitNum = parseInt(limit);

  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    system: metricsStore.system,
    currentMetrics: collectSystemMetrics()
  };

  if (type === 'all' || type === 'requests') {
    response.requests = metricsStore.requests.slice(-limitNum);
  }

  if (type === 'all' || type === 'errors') {
    response.errors = metricsStore.errors.slice(-limitNum);
  }

  if (type === 'all' || type === 'performance') {
    response.performance = metricsStore.performance.slice(-limitNum);
  }

  // Add analytics
  if (response.requests) {
    const paths = {};
    const methods = {};
    const statusCodes = {};

    response.requests.forEach(req => {
      paths[req.path] = (paths[req.path] || 0) + 1;
      methods[req.method] = (methods[req.method] || 0) + 1;
      statusCodes[req.statusCode] = (statusCodes[req.statusCode] || 0) + 1;
    });

    response.analytics = {
      topPaths: Object.entries(paths)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([path, count]) => ({ path, count })),
      methodDistribution: methods,
      statusCodeDistribution: statusCodes
    };
  }

  res.json(response);
};

/**
 * Performance alerts
 */
export const checkPerformanceAlerts = () => {
  const metrics = collectSystemMetrics();
  const alerts = [];

  // Memory alerts
  if (metrics.memory.heapUsed > 800) {
    alerts.push({
      type: 'memory',
      level: 'critical',
      message: `High memory usage: ${metrics.memory.heapUsed}MB`,
      value: metrics.memory.heapUsed,
      threshold: 800
    });
  } else if (metrics.memory.heapUsed > 500) {
    alerts.push({
      type: 'memory',
      level: 'warning',
      message: `Memory usage warning: ${metrics.memory.heapUsed}MB`,
      value: metrics.memory.heapUsed,
      threshold: 500
    });
  }

  // CPU alerts
  if (metrics.system.loadAverage[0] > 2.0) {
    alerts.push({
      type: 'cpu',
      level: 'critical',
      message: `High CPU load: ${metrics.system.loadAverage[0].toFixed(2)}`,
      value: metrics.system.loadAverage[0],
      threshold: 2.0
    });
  } else if (metrics.system.loadAverage[0] > 1.0) {
    alerts.push({
      type: 'cpu',
      level: 'warning',
      message: `CPU load warning: ${metrics.system.loadAverage[0].toFixed(2)}`,
      value: metrics.system.loadAverage[0],
      threshold: 1.0
    });
  }

  // Error rate alerts
  const errorRate = metricsStore.system.totalRequests > 0
    ? (metricsStore.system.totalErrors / metricsStore.system.totalRequests) * 100
    : 0;

  if (errorRate > 10) {
    alerts.push({
      type: 'errors',
      level: 'critical',
      message: `High error rate: ${errorRate.toFixed(2)}%`,
      value: errorRate,
      threshold: 10
    });
  } else if (errorRate > 5) {
    alerts.push({
      type: 'errors',
      level: 'warning',
      message: `Error rate warning: ${errorRate.toFixed(2)}%`,
      value: errorRate,
      threshold: 5
    });
  }

  return alerts;
};

/**
 * Clear old metrics (cleanup)
 */
export const cleanupMetrics = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  metricsStore.requests = metricsStore.requests.filter(
    req => req.timestamp > oneHourAgo
  );
  
  metricsStore.errors = metricsStore.errors.filter(
    error => error.timestamp > oneHourAgo
  );
  
  metricsStore.performance = metricsStore.performance.filter(
    perf => perf.timestamp > oneHourAgo
  );
};

// Run cleanup every hour
setInterval(cleanupMetrics, 60 * 60 * 1000);

// Export metrics store for external access
export { metricsStore };
