import winston from "winston";
import { context } from "./context.js";

class Logger {

  private static instance: winston.Logger;

  constructor() {
    Logger.instance = winston.createLogger({
      level: "info",
      format: process.env.NODE_ENV === "production" ?  winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        }),
        winston.format.json()
      ): winston.format.combine(
         winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
      transports: [new winston.transports.Console()],
    })
  }

  error(msg: string, ...args: any[]) {
    const ctx = context.getLogContext();
    Logger.instance.error(msg, {ctx}, ...args);
  }

  warn(msg: string, ...args: any[]) {
    const ctx = context.getLogContext();
    Logger.instance.warn(msg, {ctx}, ...args);
  }

  log(msg: string, ...args: any[]) {
    const ctx = context.getLogContext();
    Logger.instance.info(msg, {ctx}, ...args);
  }

  info(msg: string, ...args: any[]) {
    const ctx = context.getLogContext();
    Logger.instance.info(msg, {ctx}, ...args);
  }
}

export const logger = new Logger();