import { NextFunction, Request, Response } from "express";
import { idGeneratorService } from "../services/idGenerator.service.js";
import { context } from "../utils/context.js";
import { ContextStore } from "../interface.js";

export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
    const ctxdata : ContextStore = {
        requestId: req.headers["x-request-id"] as string || idGeneratorService.randomId(32),
        method: req.method,
        endpoint: req.originalUrl,
        timestamp: Date.now(),

        //To be populated by authGuardMiddleware
        email: "",
        userId: "",
        activeOrgId: "",
        activeRole: "viewer",
        sessionKey: "",
        tenantId: ""
    }
    res.setHeader("X-Request-Id", ctxdata.requestId);
    context.run(ctxdata, () => {
        next();
    });
}