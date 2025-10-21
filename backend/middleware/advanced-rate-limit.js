import redis from 'redis';

// Initialize Redis client
let redisClient;
try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  await redisClient.connect();
  console.log('✅ Redis connected for rate limiting');
} catch (error) {
  console.warn('⚠️ Redis not available, using in-memory rate limiting');
  redisClient = null;
}

// In-memory store fallback
const memoryStore = new Map();

/**
 * Advanced Rate Limiting with different tiers
 */
export const createAdvancedRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    tier = 'default',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    message = 'Too many requests, please try again later'
  } = options;

  return async (req, res, next) => {
    try {
      const key = `rate_limit:${tier}:${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      let requestLog;
      
      if (redisClient) {
        // Redis implementation
        requestLog = await redisClient.zRangeByScore(key, windowStart, '+inf');
      } else {
        // Memory implementation
        if (!memoryStore.has(key)) {
          memoryStore.set(key, []);
        }
        requestLog = memoryStore.get(key).filter(time => time > windowStart);
        memoryStore.set(key, requestLog);
      }

      const currentRequests = requestLog.length;

      // Check if limit exceeded
      if (currentRequests >= maxRequests) {
        const retryAfter = Math.ceil(windowMs / 1000);
        
        res.set({
          'X-RateLimit-Limit': maxRequests,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
          'X-RateLimit-Tier': tier,
          'Retry-After': retryAfter
        });

        return res.status(429).json({
          success: false,
          message,
          code: 'RATE_LIMIT_EXCEEDED',
          tier,
          limit: maxRequests,
          windowMs,
          retryAfter,
          timestamp: new Date().toISOString()
        });
      }

      // Add current request to log
      if (redisClient) {
        await redisClient.zAdd(key, { score: now, value: now.toString() });
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      } else {
        requestLog.push(now);
        memoryStore.set(key, requestLog);
      }

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - currentRequests - 1),
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
        'X-RateLimit-Tier': tier
      });

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - continue if rate limiting fails
      next();
    }
  };
};

/**
 * Rate limiting tiers for different user types
 */
export const rateLimitTiers = {
  // Guest users - strictest limits
  guest: createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
    tier: 'guest',
    message: 'Too many requests. Please register or login for higher limits.'
  }),

  // Regular authenticated users
  user: createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200,
    tier: 'user',
    message: 'Too many requests. Please try again later.'
  }),

  // Premium/subscribed users
  premium: createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500,
    tier: 'premium',
    message: 'Rate limit exceeded. Your premium limits are higher but still apply.'
  }),

  // API endpoints that need strict limiting (auth, payments)
  strict: createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    tier: 'strict',
    message: 'Too many attempts. Please wait before trying again.'
  }),

  // File upload limits
  upload: createAdvancedRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    tier: 'upload',
    message: 'Upload limit exceeded. Please try again later.'
  })
};

/**
 * Smart rate limiter that adjusts based on user type and endpoint
 */
export const smartRateLimit = (req, res, next) => {
  const user = req.user;
  const path = req.path;

  // Determine appropriate rate limiter
  let limiter;

  // Strict endpoints
  if (path.includes('/auth/') || path.includes('/payment/') || path.includes('/admin/')) {
    limiter = rateLimitTiers.strict;
  }
  // Upload endpoints
  else if (path.includes('/upload') || req.method === 'POST' && req.is('multipart/*')) {
    limiter = rateLimitTiers.upload;
  }
  // User-based limiting
  else if (!user) {
    limiter = rateLimitTiers.guest;
  } else if (user.role === 'PREMIUM' || user.providerSubscription?.isActive) {
    limiter = rateLimitTiers.premium;
  } else {
    limiter = rateLimitTiers.user;
  }

  return limiter(req, res, next);
};

/**
 * Rate limit by API key for external integrations
 */
export const apiKeyRateLimit = createAdvancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  tier: 'api_key',
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  message: 'API rate limit exceeded'
});

/**
 * Global rate limiter for DDoS protection
 */
export const ddosProtection = createAdvancedRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 20,
  tier: 'ddos',
  message: 'Too many requests from this IP. Possible DDoS detected.'
});

/**
 * Rate limit reset for testing/admin
 */
export const resetRateLimit = async (req, res) => {
  try {
    const { key, tier } = req.body;
    
    if (!key || !tier) {
      return res.status(400).json({
        success: false,
        message: 'Key and tier are required'
      });
    }

    const rateLimitKey = `rate_limit:${tier}:${key}`;

    if (redisClient) {
      await redisClient.del(rateLimitKey);
    } else {
      memoryStore.delete(rateLimitKey);
    }

    res.json({
      success: true,
      message: 'Rate limit reset successfully',
      key: rateLimitKey
    });
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset rate limit'
    });
  }
};

/**
 * Get rate limit status
 */
export const getRateLimitStatus = async (req, res) => {
  try {
    const { tier = 'user' } = req.query;
    const key = `rate_limit:${tier}:${req.ip}`;
    
    let requestCount = 0;
    
    if (redisClient) {
      const windowStart = Date.now() - (15 * 60 * 1000);
      const requests = await redisClient.zRangeByScore(key, windowStart, '+inf');
      requestCount = requests.length;
    } else if (memoryStore.has(key)) {
      const windowStart = Date.now() - (15 * 60 * 1000);
      requestCount = memoryStore.get(key).filter(time => time > windowStart).length;
    }

    const limits = {
      guest: 50,
      user: 200,
      premium: 500,
      strict: 10,
      upload: 20
    };

    res.json({
      success: true,
      data: {
        tier,
        currentRequests: requestCount,
        limit: limits[tier] || 100,
        remaining: Math.max(0, (limits[tier] || 100) - requestCount),
        resetTime: new Date(Date.now() + (15 * 60 * 1000)).toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rate limit status'
    });
  }
};
