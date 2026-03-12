import { getRedisClient } from "../redis.js";
import crypto from "crypto";
import { logger } from "../utils/logger.js";

interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 3600 = 1 hour)
  keyPrefix?: string; // Optional prefix for cache keys
}

/**
 * Cache decorator for async functions
 * Caches the result in Redis with a key generated from function name and arguments
 *
 * @param options - Configuration options for caching
 * @param options.ttl - Time to live in seconds (default: 3600)
 * @param options.keyPrefix - Optional prefix for cache keys
 *
 * @example
 * class MyService {
 *   @cache({ ttl: 600 })
 *   async getData(id: string) {
 *     return await fetchData(id);
 *   }
 * }
 */
export function cache(options: CacheOptions = {}) {
  const { ttl = 3600, keyPrefix = "cache" } = options;

  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor?: PropertyDescriptor
  ): PropertyDescriptor | void {
    if (!descriptor) {
      return;
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Generate cache key from function name and arguments
      const cacheKey = generateCacheKey(keyPrefix, String(propertyKey), args);

      try {
        const redisClient = await getRedisClient();
        // Try to get cached result
        const cachedResult = await redisClient.get(cacheKey);

        if (cachedResult !== null) {
          logger.info(`✅ Cache hit for key: ${cacheKey}`);
          return JSON.parse(cachedResult);
        }

        logger.info(`❌ Cache miss for key: ${cacheKey}`);

        // Execute the original function
        const result = await originalMethod.apply(this, args);

        // Store result in cache
        await redisClient.setEx(cacheKey, ttl, JSON.stringify(result));
        logger.info(`💾 Cached result for key: ${cacheKey} (TTL: ${ttl}s)`);

        return result;
      } catch (error) {
        logger.error(`⚠️ Cache error for key: ${cacheKey}`, error);
        // If cache fails, execute the function anyway
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Generates a consistent cache key from function name and arguments
 * Uses MD5 hash to keep keys reasonably sized
 */
function generateCacheKey(
  prefix: string,
  functionName: string,
  args: any[]
): string {
  // Stringify arguments
  const argsString = args
    .map((arg) => {
      try {
        return JSON.stringify(arg);
      } catch (error) {
        // Fallback for non-serializable objects
        return String(arg);
      }
    })
    .join(":");

  // Create hash of arguments to keep key size manageable
  const argsHash = crypto.createHash("md5").update(argsString).digest("hex");

  return `${prefix}:${functionName}:${argsHash}`;
}

/**
 * Utility function to manually invalidate cache for a specific function and arguments
 */
export async function invalidateCache(
  functionName: string,
  args: any[],
  keyPrefix: string = "cache"
): Promise<boolean> {
  const cacheKey = generateCacheKey(keyPrefix, functionName, args);
  try {
    const redisClient = await getRedisClient();
    const result = await redisClient.del(cacheKey);
    logger.info(`🗑️ Invalidated cache for key: ${cacheKey}`);
    return result > 0;
  } catch (error) {
    logger.error(`⚠️ Error invalidating cache for key: ${cacheKey}`, error);
    return false;
  }
}

/**
 * Utility function to clear all cache entries with a specific prefix
 */
export async function clearCacheByPrefix(
  keyPrefix: string = "cache"
): Promise<number> {
  try {
    const redisClient = await getRedisClient();
    const keys = await redisClient.keys(`${keyPrefix}:*`);
    if (keys.length === 0) {
      logger.info(`ℹ️ No cache keys found with prefix: ${keyPrefix}`);
      return 0;
    }
    const result = await redisClient.del(keys);
    logger.info(`🗑️ Cleared ${result} cache entries with prefix: ${keyPrefix}`);
    return result;
  } catch (error) {
    logger.error(`⚠️ Error clearing cache with prefix: ${keyPrefix}`, error);
    return 0;
  }
}
