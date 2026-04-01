/**
 * Custom error class for HTTP errors, allowing for consistent error handling across the application.
 */
export class HttpError extends Error {
    statusCode: number;
    errorCode?: string;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

}