import { Request, Response, NextFunction, RequestHandler } from "express";
import { logger } from "./logger.js";


/**
 * @description A utility function to wrap async route handlers and catch errors.
 * This helps to avoid repetitive try-catch blocks in each handler.
 *
 * @param fn 
 * @returns 
 */
export function wrap(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error(`Error in async handler: ${fn.name}`, err);
      next(err); // ✅ critical
    });
  };
}