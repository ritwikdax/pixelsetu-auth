import { HttpError } from "../error/http.error.js";
import { context } from "../utils/context.js";
import { logger } from "../utils/logger.js";

export function globalErrorMiddleware(err: any, req: any, res: any, next: any) {
    logger.error("💔 Error Found", err);
    console.log(err);
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            requestId: context.get('requestId'),
            message: err.message,
            success: false,
        });
    } else {
        return res.status(500).json({
            requestId: context.get('requestId'),
            error: "Internal Server Error",
            code: "INTERNAL_SERVER_ERROR",
            success: false
        });
    }
}