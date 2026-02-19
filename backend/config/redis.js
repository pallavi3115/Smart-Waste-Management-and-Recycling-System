// const redis = require('redis');

// let redisClient;

// const connectRedis = async () => {
//   try {
//     redisClient = redis.createClient({
//       url: process.env.REDIS_URL || 'redis://localhost:6379'
//     });

//     redisClient.on('error', (err) => {
//       console.error('Redis Client Error:', err);
//     });

//     redisClient.on('connect', () => {
//       console.log('✅ Redis Connected');
//     });

//     await redisClient.connect();
//     return redisClient;
//   } catch (error) {
//     console.error('❌ Redis connection error:', error);
//     return null;
//   }
// };

// const getRedisClient = () => redisClient;

// // Cache middleware
// const cacheMiddleware = (duration = 3600) => {
//   return async (req, res, next) => {
//     if (!redisClient) return next();

//     const key = `cache:${req.originalUrl}`;
    
//     try {
//       const cachedData = await redisClient.get(key);
      
//       if (cachedData) {
//         return res.json(JSON.parse(cachedData));
//       }
      
//       // Store original send function
//       const originalSend = res.json;
      
//       // Override json method
//       res.json = function(data) {
//         // Cache the response
//         redisClient.setEx(key, duration, JSON.stringify(data));
//         originalSend.call(this, data);
//       };
      
//       next();
//     } catch (error) {
//       console.error('Cache error:', error);
//       next();
//     }
//   };
// };

// module.exports = { connectRedis, getRedisClient, cacheMiddleware };

// Redis is optional for development
let redisClient = null;

const connectRedis = async () => {
  try {
    // Try to load redis dynamically
    const redis = await import('redis').catch(() => null);
    
    if (!redis) {
      console.log('⚠️ Redis not installed - caching disabled');
      return null;
    }

    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.warn('Redis Client Warning:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis connection failed - caching disabled');
    return null;
  }
};

const getRedisClient = () => redisClient;

// Cache middleware that works without redis
const cacheMiddleware = (duration = 3600) => {
  return (req, res, next) => {
    // Skip caching if redis is not available
    if (!redisClient) {
      return next();
    }
    
    // If redis is available, use it
    const key = `cache:${req.originalUrl}`;
    
    redisClient.get(key).then(cachedData => {
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send function
      const originalSend = res.json;
      
      // Override json method
      res.json = function(data) {
        // Cache the response
        redisClient.setEx(key, duration, JSON.stringify(data));
        originalSend.call(this, data);
      };
      
      next();
    }).catch(() => {
      // If redis fails, just continue
      next();
    });
  };
};

module.exports = { connectRedis, getRedisClient, cacheMiddleware };