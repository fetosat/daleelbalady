// utils/connectionHandler.js
// Enhanced Connection Error Handler

// Connection retry configuration
const retryConfig = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
};

// Connection status tracker
export const connectionStatus = {
  database: { connected: false, lastError: null, retries: 0 },
  redis: { connected: false, lastError: null, retries: 0 },
  external: { connected: false, lastError: null, retries: 0 }
};

// Enhanced connection wrapper with retry logic
export const createConnectionWrapper = (name, connectFunction, options = {}) => {
  const config = { ...retryConfig, ...options };

  return async function connectWithRetry() {
    let lastError;

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        console.log(`Attempting to connect to ${name} (attempt ${attempt}/${config.maxRetries})`);

        const result = await connectFunction();

        // Update connection status
        connectionStatus[name] = {
          connected: true,
          lastError: null,
          retries: attempt - 1,
          connectedAt: new Date().toISOString()
        };

        console.log(`✅ Successfully connected to ${name}`);
        return result;

      } catch (error) {
        lastError = error;
        connectionStatus[name] = {
          connected: false,
          lastError: error.message,
          retries: attempt,
          lastAttempt: new Date().toISOString()
        };

        console.error(`❌ Failed to connect to ${name} (attempt ${attempt}/${config.maxRetries}):`, error.message);

        // If this is not the last attempt, wait before retrying
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
            config.maxDelay
          );

          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(`💥 Failed to connect to ${name} after ${config.maxRetries} attempts`);
    throw lastError;
  };
};

// Database connection with retry
export const connectDatabaseWithRetry = createConnectionWrapper('database', async () => {
  const { PrismaClient } = await import('../generated/prisma/client.js');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal'
  });

  // Test connection
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;

  return prisma;
});

// Redis connection with retry
export const connectRedisWithRetry = createConnectionWrapper('redis', async () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not configured');
  }

  const { createClient } = await import('redis');
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 10000,
      lazyConnect: true,
      reconnectStrategy: (retries) => {
        if (retries > 10) return false;
        return Math.min(retries * 100, 3000);
      }
    }
  });

  // Add error handlers
  client.on('error', (error) => {
    connectionStatus.redis.connected = false;
    connectionStatus.redis.lastError = error.message;
    console.error('Redis connection error:', error);
  });

  client.on('connect', () => {
    connectionStatus.redis.connected = true;
    connectionStatus.redis.lastError = null;
    console.log('Redis connected successfully');
  });

  client.on('disconnect', () => {
    connectionStatus.redis.connected = false;
    console.warn('Redis disconnected');
  });

  await client.connect();
  await client.ping();

  return client;
}, { maxRetries: 3, initialDelay: 2000 });

// Enhanced error handler for connection errors
export const handleConnectionError = (error, serviceName = 'unknown') => {
  const errorInfo = {
    service: serviceName,
    error: error.message,
    code: error.code,
    errno: error.errno,
    timestamp: new Date().toISOString()
  };

  // Log different types of connection errors
  switch (error.code) {
    case 'ECONNREFUSED':
      console.error(`🔌 Connection refused to ${serviceName}:`, errorInfo);
      break;
    case 'ETIMEDOUT':
      console.error(`⏰ Connection timeout to ${serviceName}:`, errorInfo);
      break;
    case 'ENOTFOUND':
      console.error(`🔍 Host not found for ${serviceName}:`, errorInfo);
      break;
    case 'ECONNRESET':
      console.error(`🔄 Connection reset by ${serviceName}:`, errorInfo);
      break;
    default:
      console.error(`💥 Unknown connection error to ${serviceName}:`, errorInfo);
  }

  // Update connection status
  if (connectionStatus[serviceName]) {
    connectionStatus[serviceName].connected = false;
    connectionStatus[serviceName].lastError = error.message;
  }
};

// Health check for all connections
export const checkAllConnections = async () => {
  const results = {};

  // Check database
  try {
    const { PrismaClient } = await import('../generated/prisma/client.js');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    results.database = { status: 'connected', error: null };
    await prisma.$disconnect();
  } catch (error) {
    results.database = { status: 'disconnected', error: error.message };
    handleConnectionError(error, 'database');
  }

  // Check Redis
  try {
    if (process.env.REDIS_URL) {
      const { createClient } = await import('redis');
      const client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      await client.ping();
      await client.disconnect();
      results.redis = { status: 'connected', error: null };
    } else {
      results.redis = { status: 'not_configured', error: null };
    }
  } catch (error) {
    results.redis = { status: 'disconnected', error: error.message };
    handleConnectionError(error, 'redis');
  }

  return results;
};

// Auto-reconnect mechanism
export const startAutoReconnect = (intervalMs = 30000) => {
  setInterval(async () => {
    try {
      const results = await checkAllConnections();

      // Log any disconnected services
      Object.entries(results).forEach(([service, result]) => {
        if (result.status === 'disconnected') {
          console.warn(`🔴 ${service} is disconnected: ${result.error}`);
        }
      });

    } catch (error) {
      console.error('Auto-reconnect check failed:', error);
    }
  }, intervalMs);

  console.log(`🔄 Auto-reconnect monitoring started (interval: ${intervalMs}ms)`);
};

// Graceful shutdown handler
export const gracefulShutdown = async (services = []) => {
  console.log('🛑 Starting graceful shutdown...');

  for (const service of services) {
    try {
      if (service.disconnect) {
        await service.disconnect();
        console.log(`✅ ${service.name || 'Service'} disconnected gracefully`);
      }
    } catch (error) {
      console.error(`❌ Error disconnecting ${service.name || 'Service'}:`, error);
    }
  }

  console.log('🏁 Graceful shutdown completed');
};

export default {
  connectionStatus,
  createConnectionWrapper,
  connectDatabaseWithRetry,
  connectRedisWithRetry,
  handleConnectionError,
  checkAllConnections,
  startAutoReconnect,
  gracefulShutdown
};
