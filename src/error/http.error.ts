export class HttpError extends Error {
    statusCode: number;
    errorCode?: string;

    constructor(message: string, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }

}