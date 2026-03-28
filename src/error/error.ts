export class AppError extends Error{
  private readonly reason: string;

    constructor(message: string, reason: string) {
    super(message);
    this.reason = reason;
    Error.captureStackTrace(this, this.constructor);
  }

}