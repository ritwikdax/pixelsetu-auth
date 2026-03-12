import { createClient } from "redis";
import { env, ENV_VARIABLES } from "./utils/env.js";
import { logger } from "./utils/logger.js";

const redisClient = createClient({
  username: env(ENV_VARIABLES.REDIS_DB_USERNAME),
  password: env(ENV_VARIABLES.REDIS_DB_PASSWORD),
  socket: {
    host: env(ENV_VARIABLES.REDIS_DB_HOST),
    port: Number(env(ENV_VARIABLES.REDIS_DB_PORT)),
  },
});

redisClient.on("error", (err) => {
  logger.error("❌ Redis Client Error:", {
    error: err,
    message: err?.message,
    stack: err?.stack,
    host: env(ENV_VARIABLES.REDIS_DB_HOST),
  });
});

redisClient.on("connect", () => {
  logger.info("🔄 Redis client connecting...");
});

redisClient.on("ready", () => {
  logger.info("🎉 Redis DB Connected and Ready!");
});

async function getRedisClient() {
  if (!redisClient.isReady) {
    try {
      await redisClient.connect();
      logger.info("✅ Redis connection established");
    } catch (err: any) {
      logger.error("❌ Failed to connect to Redis:", {
        error: err,
        message: err?.message,
        stack: err?.stack,
        host: env(ENV_VARIABLES.REDIS_DB_HOST),
      });
      throw err; // Rethrow to handle it in the calling function
    }
  }
  return redisClient;

}
export { getRedisClient };
