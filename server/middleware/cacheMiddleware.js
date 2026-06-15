import redisClient from '../utils/redisClient.js';

/**
 * Middleware to cache responses using Redis
 * @param {Number} ttl - Time to live in seconds
 * @returns Express Middleware
 */
export const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      if (!redisClient.isReady) {
        return next();
      }

      // Generate a unique cache key based on the original URL
      // If there are query params, they will be part of the key
      const cacheKey = `cache:${req.originalUrl || req.url}`;
      
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Intercept the res.json method to store the response in Redis
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(cacheKey, ttl, JSON.stringify(body)).catch(err => {
            console.error('Redis Set Error:', err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache Middleware Error:', error);
      next(); // Proceed without cache if there's an error
    }
  };
};

/**
 * Helper function to clear a specific cache key pattern
 * Useful to call after mutations (POST, PUT, DELETE)
 * @param {String} pattern - The pattern to clear (e.g., "cache:/api/notices*")
 */
export const clearCachePattern = async (pattern) => {
  try {
    if (!redisClient.isReady) return;
    
    // In production, KEYS is dangerous. Better to use SCAN or a Set.
    // For simplicity, we use keys here. If high scale, use SCAN.
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Clear Cache Error:', error);
  }
};
