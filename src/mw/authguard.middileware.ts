import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { sessionManager } from "../services/session.servcie.js";
import { context } from "../utils/context.js";
import { HttpError } from "../error/http.error.js";

export async function authGuardMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const sessionKey = req.cookies?.session_id;
  if (!sessionKey) {
    throw new HttpError("Authentication required. Please log in.", 401);
  }
  const sessionData = await sessionManager.getSessionData(sessionKey);
  if (!sessionData) {
    throw new HttpError("Invalid or expired session. Please log in again.", 401);
  }

  context.set("email", sessionData.email);
  context.set("activeOrgId", sessionData.activeOrgId);
  context.set("activeRole", sessionData.activeRole);
  context.set("userId", sessionData.userId);
  context.set("sessionKey", sessionData.sessionKey);
  
  logger.info("✅ User authenticated successfully", { email: sessionData.email, activeOrgId: sessionData.activeOrgId, activeRole: sessionData.activeRole });
  return next();
}
