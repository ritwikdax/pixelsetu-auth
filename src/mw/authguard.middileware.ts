import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { getRedisClient } from "../redis.js";

export async function authGuardMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check for session cookie first
    const sessionKey = req.cookies?.session_id;
    
    if (!sessionKey) {
      return res.status(401).json({
        error: true,
        message: "Authentication required. Please log in.",
      });
    }

    // Verify session from Redis
    const redisClient = await getRedisClient();
    const sessionData = await redisClient.get(sessionKey);
    
    if (!sessionData) {
      return res.status(401).json({
        error: true,
        message: "Session expired or invalid. Please log in again.",
      });
    }

    const user = JSON.parse(sessionData);
    res.locals["email"] = user.email;
    res.locals["userId"] = user.id;
    res.locals["namespace"] = user.namespace;
    res.locals["sessionKey"] = sessionKey;

    logger.info("✅ User authenticated successfully", {
      userId: user.id,
      email: user.email,
      namespace: user.namespace,
      sessionKey: sessionKey,
    });
    
    return next();

  } catch (err: any) {
    logger.error("❌ Error in authGuardMiddleware:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
      hasAuthHeader: !!req.headers["authorization"],
      hasSessionCookie: !!req.cookies?.session_id,
    });
    return res
      .status(401)
      .json({ error: true, message: "User not logged in or invalid token" });
  }
}
