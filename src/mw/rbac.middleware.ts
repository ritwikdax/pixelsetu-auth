import { NextFunction, Request, Response } from "express";
import { context } from "../utils/context.js";
import { HttpError } from "../error/http.error.js";

export function rbacMiddleware(req: Request, res: Response, next: NextFunction){
    const userRole = context.get("activeRole");
    const requestMethod = req.method;

    // Define permissions for each role
    const rolePermissions: Record<string, string[]> = {
        "owner": ["GET", "POST", "PUT", "PATCH","DELETE"],
        "admin": ["GET", "POST", "PUT", "PATCH", "DELETE"],
        "editor": ["GET", "POST", "PUT", "PATCH"],
        "viewer": ["GET"]
    };

    const allowedMethods = rolePermissions[userRole] || [];
    if (!allowedMethods.includes(requestMethod)) {
        throw new HttpError("Forbidden: You don't have permission to perform this action", 403);
    }
    return next();
}